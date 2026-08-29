import path from "path";
import { DocumentRecord } from "../../data";
import { AuthRequiredError } from "../auth-error";
import { AuthContext, getAuthContext } from "../supabase/auth";
import { supabaseDocumentBucket } from "../supabase/config";

type SupabaseDocumentRow = {
  id: string;
  name: string;
  subject: string;
  type: string;
  size: string;
  uploaded_at: string;
  storage_path: string | null;
};

const documentFields = "id,name,subject,type,size,uploaded_at,storage_path";

function rowToDocument(row: SupabaseDocumentRow): DocumentRecord {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    type: row.type,
    size: row.size,
    uploadedAt: row.uploaded_at,
    storageName: row.storage_path ?? undefined,
    url: row.storage_path ? `/api/documents/${row.id}/download` : undefined,
  };
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function extensionType(fileName: string) {
  const extension = path.extname(fileName).replace(".", "").toUpperCase();
  return extension || "FILE";
}

function validateUpload(file: File, subject: string) {
  if (!file || file.size === 0) {
    throw new Error("Please choose a file to upload.");
  }

  if (!subject.trim()) {
    throw new Error("Please choose a subject.");
  }
}

function storageErrorMessage(action: string, message: string) {
  if (message.toLowerCase().includes("bucket not found")) {
    return `${action}: Supabase Storage bucket "${supabaseDocumentBucket}" was not found. Create this bucket in Supabase Storage or run supabase/schema.sql in the Supabase SQL Editor.`;
  }

  return `${action}: ${message}`;
}

function createStoragePath(userId: string, id: string, fileName: string) {
  return `${userId}/${id}-${Date.now()}-${sanitizeFileName(fileName)}`;
}

async function requireDocumentAuth(authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();
  if (!auth) throw new AuthRequiredError();
  return auth;
}

export async function readDocuments(authContext?: AuthContext | null) {
  const auth = await requireDocumentAuth(authContext);
  const { data, error } = await auth.supabase
    .from("documents")
    .select(documentFields)
    .eq("user_id", auth.user.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`Could not read documents from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => rowToDocument(row as SupabaseDocumentRow));
}

export async function readRecentDocuments(authContext?: AuthContext | null, limit = 3) {
  const auth = await requireDocumentAuth(authContext);
  const { data, error } = await auth.supabase
    .from("documents")
    .select(documentFields)
    .eq("user_id", auth.user.id)
    .order("uploaded_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Could not read recent documents from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => rowToDocument(row as SupabaseDocumentRow));
}

export async function readDocument(id: string, authContext?: AuthContext | null) {
  const auth = await requireDocumentAuth(authContext);
  const { data, error } = await auth.supabase
    .from("documents")
    .select(documentFields)
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read document from Supabase: ${error.message}`);
  }

  return data ? rowToDocument(data as SupabaseDocumentRow) : undefined;
}

export async function saveUploadedDocument(file: File, subject: string, authContext?: AuthContext | null) {
  validateUpload(file, subject);

  const auth = await requireDocumentAuth(authContext);
  const id = crypto.randomUUID();
  const storagePath = createStoragePath(auth.user.id, id, file.name);
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await auth.supabase.storage.from(supabaseDocumentBucket).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(storageErrorMessage("Could not upload document to Supabase Storage", uploadError.message));
  }

  const { data, error } = await auth.supabase
    .from("documents")
    .insert({
      id,
      user_id: auth.user.id,
      name: file.name,
      subject: subject.trim(),
      type: extensionType(file.name),
      size: formatBytes(file.size),
      storage_path: storagePath,
    })
    .select(documentFields)
    .single();

  if (error) {
    await auth.supabase.storage.from(supabaseDocumentBucket).remove([storagePath]);
    throw new Error(`Could not save document to Supabase: ${error.message}`);
  }

  return rowToDocument(data as SupabaseDocumentRow);
}

export async function replaceUploadedDocument(id: string, file: File, subject: string, authContext?: AuthContext | null) {
  validateUpload(file, subject);

  const auth = await requireDocumentAuth(authContext);
  const previousDocument = await readDocument(id, auth);

  if (!previousDocument?.storageName) {
    throw new Error("Document not found.");
  }

  const storagePath = createStoragePath(auth.user.id, id, file.name);
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await auth.supabase.storage.from(supabaseDocumentBucket).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(storageErrorMessage("Could not upload replacement to Supabase Storage", uploadError.message));
  }

  const { data, error } = await auth.supabase
    .from("documents")
    .update({
      name: file.name,
      subject: subject.trim(),
      type: extensionType(file.name),
      size: formatBytes(file.size),
      storage_path: storagePath,
      uploaded_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select(documentFields)
    .maybeSingle();

  if (error || !data) {
    await auth.supabase.storage.from(supabaseDocumentBucket).remove([storagePath]);
    throw new Error(error ? `Could not replace document in Supabase: ${error.message}` : "Document not found.");
  }

  await auth.supabase.storage.from(supabaseDocumentBucket).remove([previousDocument.storageName]);
  return rowToDocument(data as SupabaseDocumentRow);
}

export async function readUploadedDocumentFile(id: string, authContext?: AuthContext | null) {
  const auth = await requireDocumentAuth(authContext);
  const document = await readDocument(id, auth);

  if (!document?.storageName) {
    throw new Error("Uploaded file not found.");
  }

  const { data, error } = await auth.supabase.storage.from(supabaseDocumentBucket).download(document.storageName);

  if (error || !data) {
    throw new Error(error ? `Could not download document from Supabase Storage: ${error.message}` : "Uploaded file not found.");
  }

  const file = Buffer.from(await data.arrayBuffer());
  return { document, file };
}

export async function deleteDocument(id: string, authContext?: AuthContext | null) {
  const auth = await requireDocumentAuth(authContext);
  const document = await readDocument(id, auth);

  if (!document) {
    throw new Error("Document not found.");
  }

  if (document.storageName) {
    await auth.supabase.storage.from(supabaseDocumentBucket).remove([document.storageName]);
  }

  const { data, error } = await auth.supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select("id");

  if (error) {
    throw new Error(`Could not delete document from Supabase: ${error.message}`);
  }

  if (!data?.length) {
    throw new Error("Document not found.");
  }
}

import { promises as fs } from "fs";
import path from "path";
import { DocumentRecord, documents as seedDocuments } from "../data";
import { AuthContext, getAuthContext } from "./supabase/auth";
import { supabaseDocumentBucket } from "./supabase/config";

const storeDirectory = path.join(process.cwd(), "data");
const uploadDirectory = path.join(storeDirectory, "uploads");
const storePath = path.join(storeDirectory, "documents.json");

type SupabaseDocumentRow = {
  id: string;
  name: string;
  subject: string;
  type: string;
  size: string;
  uploaded_at: string;
  storage_path: string | null;
};

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

function createStorageName(id: string, fileName: string) {
  return `${id}-${Date.now()}-${sanitizeFileName(fileName)}`;
}

function createStoragePath(userId: string, id: string, fileName: string) {
  return `${userId}/${createStorageName(id, fileName)}`;
}

function createDocumentRecord(id: string, file: File, subject: string, storageName: string): DocumentRecord {
  return {
    id,
    name: file.name,
    subject: subject.trim(),
    type: extensionType(file.name),
    size: formatBytes(file.size),
    uploadedAt: new Date().toISOString(),
    storageName,
    url: `/api/documents/${id}/download`,
  };
}

function isDocument(value: unknown): value is DocumentRecord {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<DocumentRecord>;
  return Boolean(document.id && document.name && document.subject && document.type && document.size && document.uploadedAt);
}

async function ensureStore() {
  await fs.mkdir(uploadDirectory, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify(seedDocuments, null, 2));
  }
}

export async function readDocuments(authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
    const { data, error } = await auth.supabase
      .from("documents")
      .select("id,name,subject,type,size,uploaded_at,storage_path")
      .eq("user_id", auth.user.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      throw new Error(`Could not read documents from Supabase: ${error.message}`);
    }

    return (data ?? []).map((row) => rowToDocument(row as SupabaseDocumentRow));
  }

  await ensureStore();

  try {
    const content = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    if (Array.isArray(parsed)) return parsed.filter(isDocument);
  } catch {
    await fs.writeFile(storePath, JSON.stringify(seedDocuments, null, 2));
  }

  return seedDocuments;
}

export async function readRecentDocuments(authContext?: AuthContext | null, limit = 3) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
    const { data, error } = await auth.supabase
      .from("documents")
      .select("id,name,subject,type,size,uploaded_at,storage_path")
      .eq("user_id", auth.user.id)
      .order("uploaded_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Could not read recent documents from Supabase: ${error.message}`);
    }

    return (data ?? []).map((row) => rowToDocument(row as SupabaseDocumentRow));
  }

  const documents = await readDocuments(auth);
  return documents.slice(0, limit);
}

export async function readDocument(id: string, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
    const { data, error } = await auth.supabase
      .from("documents")
      .select("id,name,subject,type,size,uploaded_at,storage_path")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not read document from Supabase: ${error.message}`);
    }

    return data ? rowToDocument(data as SupabaseDocumentRow) : undefined;
  }

  const documents = await readDocuments();
  return documents.find((document) => document.id === id);
}

export async function saveUploadedDocument(file: File, subject: string, authContext?: AuthContext | null) {
  validateUpload(file, subject);

  const auth = authContext ?? await getAuthContext();

  if (auth) {
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
      .select("id,name,subject,type,size,uploaded_at,storage_path")
      .single();

    if (error) {
      await auth.supabase.storage.from(supabaseDocumentBucket).remove([storagePath]);
      throw new Error(`Could not save document to Supabase: ${error.message}`);
    }

    return rowToDocument(data as SupabaseDocumentRow);
  }

  const currentDocuments = await readDocuments();
  const id = Date.now().toString();
  const storageName = createStorageName(id, file.name);
  const targetPath = path.join(uploadDirectory, storageName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(targetPath, buffer);

  const document = createDocumentRecord(id, file, subject, storageName);

  await fs.writeFile(storePath, JSON.stringify([document, ...currentDocuments], null, 2));
  return document;
}

export async function replaceUploadedDocument(id: string, file: File, subject: string, authContext?: AuthContext | null) {
  validateUpload(file, subject);

  const auth = authContext ?? await getAuthContext();

  if (auth) {
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
      .select("id,name,subject,type,size,uploaded_at,storage_path")
      .maybeSingle();

    if (error || !data) {
      await auth.supabase.storage.from(supabaseDocumentBucket).remove([storagePath]);
      throw new Error(error ? `Could not replace document in Supabase: ${error.message}` : "Document not found.");
    }

    await auth.supabase.storage.from(supabaseDocumentBucket).remove([previousDocument.storageName]);
    return rowToDocument(data as SupabaseDocumentRow);
  }

  const currentDocuments = await readDocuments();
  const documentIndex = currentDocuments.findIndex((item) => item.id === id);

  if (documentIndex === -1) {
    throw new Error("Document not found.");
  }

  const previousDocument = currentDocuments[documentIndex];
  const storageName = createStorageName(id, file.name);
  const targetPath = path.join(uploadDirectory, storageName);
  const buffer = Buffer.from(await file.arrayBuffer());
  const document = createDocumentRecord(id, file, subject, storageName);
  const nextDocuments = [...currentDocuments];

  await fs.writeFile(targetPath, buffer);
  nextDocuments[documentIndex] = document;
  await fs.writeFile(storePath, JSON.stringify(nextDocuments, null, 2));

  if (previousDocument.storageName) {
    try {
      await fs.unlink(path.join(uploadDirectory, previousDocument.storageName));
    } catch {
      // The new file is already saved, so replacement can succeed if the old file was missing.
    }
  }

  return document;
}

export async function readUploadedDocumentFile(id: string, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
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

  const document = await readDocument(id);

  if (!document?.storageName) {
    throw new Error("Uploaded file not found.");
  }

  const filePath = path.join(uploadDirectory, document.storageName);
  const file = await fs.readFile(filePath);
  return { document, file };
}

export async function deleteDocument(id: string, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
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

    return;
  }

  const currentDocuments = await readDocuments();
  const document = currentDocuments.find((item) => item.id === id);

  if (!document) {
    throw new Error("Document not found.");
  }

  const nextDocuments = currentDocuments.filter((item) => item.id !== id);
  await fs.writeFile(storePath, JSON.stringify(nextDocuments, null, 2));

  if (document.storageName) {
    try {
      await fs.unlink(path.join(uploadDirectory, document.storageName));
    } catch {
      // Metadata deletion is still valid if the physical file was already missing.
    }
  }
}

import { promises as fs } from "fs";
import path from "path";
import { DocumentRecord, documents as seedDocuments } from "../data";

const storeDirectory = path.join(process.cwd(), "data");
const uploadDirectory = path.join(storeDirectory, "uploads");
const storePath = path.join(storeDirectory, "documents.json");

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

function createStorageName(id: string, fileName: string) {
  return `${id}-${Date.now()}-${sanitizeFileName(fileName)}`;
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

export async function readDocuments() {
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

export async function readDocument(id: string) {
  const documents = await readDocuments();
  return documents.find((document) => document.id === id);
}

export async function saveUploadedDocument(file: File, subject: string) {
  validateUpload(file, subject);

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

export async function replaceUploadedDocument(id: string, file: File, subject: string) {
  validateUpload(file, subject);

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

export async function readUploadedDocumentFile(id: string) {
  const document = await readDocument(id);

  if (!document?.storageName) {
    throw new Error("Uploaded file not found.");
  }

  const filePath = path.join(uploadDirectory, document.storageName);
  const file = await fs.readFile(filePath);
  return { document, file };
}

export async function deleteDocument(id: string) {
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

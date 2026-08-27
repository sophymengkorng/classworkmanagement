import { NextResponse } from "next/server";
import { readDocuments, saveUploadedDocument } from "../../lib/document-store";

export async function GET() {
  const documents = await readDocuments();
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const subject = formData.get("subject");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please choose a file to upload." }, { status: 400 });
    }

    const document = await saveUploadedDocument(file, typeof subject === "string" ? subject : "");
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not upload document." },
      { status: 400 },
    );
  }
}

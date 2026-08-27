import { NextResponse } from "next/server";
import { deleteDocument, readDocument, replaceUploadedDocument } from "../../../lib/document-store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const document = await readDocument(id);

  if (!document) {
    return NextResponse.json({ message: "Document not found." }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    await deleteDocument(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete document." },
      { status: 404 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const subject = formData.get("subject");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please choose a replacement file." }, { status: 400 });
    }

    const document = await replaceUploadedDocument(id, file, typeof subject === "string" ? subject : "");
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not replace document." },
      { status: 400 },
    );
  }
}

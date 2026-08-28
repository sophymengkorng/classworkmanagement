import { NextResponse } from "next/server";
import { responseStatus } from "../../../lib/auth-error";
import { deleteDocument, readDocument, replaceUploadedDocument } from "../../../lib/document-store";
import { getAuthContext } from "../../../lib/supabase/auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const auth = await getAuthContext();
    const document = await readDocument(id, auth);

    if (!document) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not read document." },
      { status: responseStatus(error, 404) },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const auth = await getAuthContext();
    await deleteDocument(id, auth);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete document." },
      { status: responseStatus(error, 404) },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const auth = await getAuthContext();
    const formData = await request.formData();
    const file = formData.get("file");
    const subject = formData.get("subject");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please choose a replacement file." }, { status: 400 });
    }

    const document = await replaceUploadedDocument(id, file, typeof subject === "string" ? subject : "", auth);
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not replace document." },
      { status: responseStatus(error, 400) },
    );
  }
}

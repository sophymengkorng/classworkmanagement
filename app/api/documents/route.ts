import { NextResponse } from "next/server";
import { responseStatus } from "../../lib/auth-error";
import { readDocuments, saveUploadedDocument } from "../../lib/stores/document-store";
import { getAuthContext } from "../../lib/supabase/auth";

export async function GET() {
  try {
    const auth = await getAuthContext();
    const documents = await readDocuments(auth);
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not read documents." },
      { status: responseStatus(error, 400) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    const formData = await request.formData();
    const file = formData.get("file");
    const subject = formData.get("subject");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please choose a file to upload." }, { status: 400 });
    }

    const document = await saveUploadedDocument(file, typeof subject === "string" ? subject : "", auth);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not upload document." },
      { status: responseStatus(error, 400) },
    );
  }
}

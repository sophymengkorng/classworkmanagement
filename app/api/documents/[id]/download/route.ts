import { NextResponse } from "next/server";
import { readUploadedDocumentFile } from "../../../../lib/document-store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { document, file } = await readUploadedDocumentFile(id);
    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${document.name.replace(/"/g, "")}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ message: "Document file not found." }, { status: 404 });
  }
}

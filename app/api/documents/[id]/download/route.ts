import { NextResponse } from "next/server";
import { responseStatus } from "../../../../lib/auth-error";
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
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Document file not found." },
      { status: responseStatus(error, 404) },
    );
  }
}

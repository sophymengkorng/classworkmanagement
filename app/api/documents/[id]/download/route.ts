import { NextResponse } from "next/server";
import { responseStatus } from "../../../../lib/auth-error";
import { readUploadedDocumentFile } from "../../../../lib/stores/document-store";
import { getAuthContext } from "../../../../lib/supabase/auth";

type Params = {
  params: Promise<{ id: string }>;
};

function contentTypeForFile(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "gif") return "image/gif";
  if (extension === "webp") return "image/webp";
  if (extension === "pdf") return "application/pdf";

  return "application/octet-stream";
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const requestUrl = new URL(request.url);
    const disposition = requestUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
    const auth = await getAuthContext();
    const { document, file } = await readUploadedDocumentFile(id, auth);
    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `${disposition}; filename="${document.name.replace(/"/g, "")}"`,
        "Content-Type": contentTypeForFile(document.name),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Document file not found." },
      { status: responseStatus(error, 404) },
    );
  }
}

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Map<string, string[]>([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/webp", [".webp"]],
  ["image/gif", [".gif"]],
]);
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Chưa chọn tệp ảnh" }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Ảnh phải có dung lượng tối đa 5MB" }, { status: 400 });
    }

    const baseName = path.basename(file.name);
    const ext = path.extname(baseName).toLowerCase();
    const validExts = ALLOWED_TYPES.get(file.type);
    if (!validExts || !validExts.includes(ext)) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch {
    return NextResponse.json({ error: "Lỗi tải ảnh lên" }, { status: 500 });
  }
}

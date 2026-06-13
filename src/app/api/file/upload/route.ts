import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const roomName = formData.get("roomName") as string | null;
    const identity = formData.get("identity") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/\s+/g, "_");
    const filename = `${timestamp}_${sanitizedName}`;

    const filepath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      originalName: file.name,
      size: file.size,
      roomName,
      identity,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
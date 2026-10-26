import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/authorization";

export async function POST(request: Request) {
    try {
        try {
            await requireAdmin();
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (Number(request.headers.get("content-length")) > 25 * 1024 * 1024) return NextResponse.json({ error: "Fichiers trop volumineux" }, { status: 413 });

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0 || files.length > 10) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image invalide (5 Mo maximum)" }, { status: 400 });
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png"
                : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 ? "jpg"
                : buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP" ? "webp" : null;
            if (!ext) return NextResponse.json({ error: "Formats acceptés : PNG, JPEG, WebP" }, { status: 400 });
            const filename = `product-${randomUUID()}.${ext}`;
            
            const uploadDir = join(process.cwd(), "public", "uploads");
            await mkdir(uploadDir, { recursive: true });
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            uploadedUrls.push(`/uploads/${filename}`);
        }

        return NextResponse.json({ urls: uploadedUrls });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = file.name.split('.').pop();
            const filename = `product-${uniqueSuffix}.${ext}`;
            
            const uploadDir = join(process.cwd(), "public", "uploads");
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

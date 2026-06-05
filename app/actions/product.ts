"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addProduct(formData: FormData) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const imagesJson = formData.get("images") as string;

    const imagesArray = imagesJson ? JSON.parse(imagesJson) : [];
    const mainImage = imagesArray.length > 0 ? imagesArray[0] : "";

    await prisma.product.create({
        data: { 
            name, 
            description, 
            price, 
            category, 
            image: mainImage,
            images: imagesJson || "[]"
        },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
}

export async function deleteProduct(id: string) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.product.delete({ where: { id } });
    
    revalidatePath("/admin/products");
    revalidatePath("/shop");
}

export async function updateProduct(id: string, formData: FormData) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;

    await prisma.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            category
        }
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    
    return { success: true };
}

"use server";

import { requireAdmin } from "@/lib/authorization";
import { z } from "zod";
import { categories } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().min(5).max(10000),
    price: z.number().finite().min(0.5).max(10000),
    category: z.string().refine(value => categories.some(category => category.id !== "all" && category.id === value)),
});
const imagesSchema = z.array(z.string().max(2000).refine(value => /^\/uploads\/[a-zA-Z0-9_.-]+\.(png|jpe?g|webp)$/i.test(value) || value.startsWith("https://"))).max(10);

export async function addProduct(formData: FormData) {
    await requireAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const imagesJson = formData.get("images") as string;

    productSchema.parse({ name, description, price, category });
    const imagesArray = imagesSchema.parse(imagesJson ? JSON.parse(imagesJson) : []);
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
    await requireAdmin();

    await prisma.product.delete({ where: { id } });
    
    revalidatePath("/admin/products");
    revalidatePath("/shop");
}

export async function updateProduct(id: string, formData: FormData) {
    await requireAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;

    productSchema.parse({ name, description, price, category });
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

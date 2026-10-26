"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authorization";

export async function addReview(formData: FormData) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new Error("Vous devez être connecté pour laisser un avis.");
  }

  const text = formData.get("text") as string;
  const rating = Number(formData.get("rating"));

  if (!text || text.trim().length < 5) {
    throw new Error("L'avis doit contenir au moins 5 caractères.");
  }

  if (text.length > 300) {
    throw new Error("L'avis ne doit pas dépasser 300 caractères.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("La note doit être comprise entre 1 et 5.");
  }

  await prisma.review.create({
    data: {
      text: text.trim(),
      rating,
      userId: session.user.id,
    },
  });

  revalidatePath("/livre-d-or");
}

export async function deleteReview(id: string) {
  await requireAdmin();

  await prisma.review.delete({
    where: { id }
  });

  revalidatePath("/livre-d-or");
}


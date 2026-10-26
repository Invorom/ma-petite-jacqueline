import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { allowRequest, clientAddress } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(72).refine(value => Buffer.byteLength(value, "utf8") <= 72),
});

export async function POST(req: Request) {
  try {
    if (!await allowRequest("register", clientAddress(req), 10, 60 * 60 * 1000)) return NextResponse.json({ message: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Compte créé avec succès." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
       return NextResponse.json(
        { message: "Données invalides. Utilisez un mot de passe de 12 à 72 caractères (72 octets maximum)." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}

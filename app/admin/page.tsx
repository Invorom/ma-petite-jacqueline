import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Server Actions for Product Management
async function addProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const image = formData.get("image") as string;
    const quantity = parseInt(formData.get("quantity") as string);

    await prisma.product.create({
        data: { name, description, price, category, image, quantity },
    });
    revalidatePath("/admin");
    revalidatePath("/shop");
}

async function deleteProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/shop");
}

export default async function AdminPage() {
    const session = await auth();

    // Basic authorization check - Replace with DB Role check if desired, 
    // but hardcoded email check requested by user is safest for quick start.
    // Also checking DB role would be rigorous.
    if (!session || session.user?.email !== "romain.nerot@outlook.fr") {
        redirect("/"); // Or show unauthorized
    }

    // Fetch data
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="font-display text-4xl text-brand-secondary mb-8">Administration</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Management */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-brand-text">Gestion des Produits</h2>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10">
                        <h3 className="font-bold mb-4">Ajouter un produit</h3>
                        <form action={addProduct} className="space-y-4">
                            <input name="name" placeholder="Nom du produit" required className="w-full px-4 py-2 bg-brand-light/20 border rounded-lg" />
                            <textarea name="description" placeholder="Description" required className="w-full px-4 py-2 bg-brand-light/20 border rounded-lg" />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="price" type="number" step="0.01" placeholder="Prix (€)" required className="w-full px-4 py-2 bg-brand-light/20 border rounded-lg" />
                                <input name="quantity" type="number" placeholder="Quantité" defaultValue={1} required className="w-full px-4 py-2 bg-brand-light/20 border rounded-lg" />
                            </div>
                            <select name="category" className="w-full px-4 py-2 bg-brand-light/20 border rounded-lg">
                                <option value="boucles-d-oreilles">Boucles d'oreilles</option>
                                <option value="colliers">Colliers</option>
                                <option value="bracelets">Bracelets</option>
                                <option value="broches">Broches</option>
                                <option value="accessoires">Accessoires</option>
                                <option value="parures">Parures</option>
                            </select>
                            <input name="image" placeholder="URL de l'image (ex: /placeholder.jpg)" defaultValue="/placeholder.jpg" required className="w-full px-4 py-2 bg-brand-light/20 border rounded-lg" />

                            <button type="submit" className="w-full py-2 bg-brand-secondary text-white rounded-lg font-bold">Ajouter</button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">Produits existants ({products.length})</h3>
                        {products.map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                                <div>
                                    <p className="font-bold">{p.name}</p>
                                    <p className="text-xs text-brand-text/60">{p.price} € - {p.category}</p>
                                </div>
                                <form action={deleteProduct}>
                                    <input type="hidden" name="id" value={p.id} />
                                    <button type="submit" className="text-red-500 text-sm hover:underline">Supprimer</button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Management */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-brand-text">Utilisateurs ({users.length})</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-2">Nom</th>
                                    <th className="pb-2">Email</th>
                                    <th className="pb-2">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="py-2">{u.name}</td>
                                        <td className="py-2">{u.email}</td>
                                        <td className="py-2">{u.createdAt.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

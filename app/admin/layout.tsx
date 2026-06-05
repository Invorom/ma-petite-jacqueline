import Link from "next/link";
import { Package, Users, LayoutDashboard, MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="flex h-full overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-secondary/5 border-r border-brand-secondary/10 hidden md:block">
                <nav className="p-6 flex flex-col gap-2">
                    <h2 className="font-display text-2xl text-brand-secondary mb-6">Administration</h2>
                    
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-secondary/10 transition-colors text-brand-text/80 font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Vue d'ensemble
                    </Link>
                    
                    <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-secondary/10 transition-colors text-brand-text/80 font-medium">
                        <Package className="w-5 h-5" />
                        Produits
                    </Link>

                    <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-secondary/10 transition-colors text-brand-text/80 font-medium">
                        <Package className="w-5 h-5" />
                        Commandes
                    </Link>

                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-secondary/10 transition-colors text-brand-text/80 font-medium">
                        <Users className="w-5 h-5" />
                        Utilisateurs
                    </Link>

                    <Link href="/admin/promos" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-secondary/10 transition-colors text-brand-text/80 font-medium">
                        <Package className="w-5 h-5" />
                        Codes Promo
                    </Link>

                    <Link href="/admin/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-secondary/10 transition-colors text-brand-text/80 font-medium">
                        <MessageSquare className="w-5 h-5" />
                        Modérer les avis
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

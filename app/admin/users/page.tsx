import { prisma } from "@/lib/prisma";
import { RoleToggle } from "./RoleToggle";

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <h1 className="font-display text-4xl text-brand-secondary mb-8">Gestion des Utilisateurs</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-brand-secondary/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-brand-light/50 text-brand-text/60 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Nom</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Rôle</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-secondary/10">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-brand-light/20 transition-colors">
                                <td className="px-6 py-4 font-medium">{user.name || "-"}</td>
                                <td className="px-6 py-4 text-brand-text/80">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        user.role === 'ADMIN' ? 'bg-brand-secondary text-white' : 'bg-brand-text/10 text-brand-text/70'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <RoleToggle userId={user.id} currentRole={user.role} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

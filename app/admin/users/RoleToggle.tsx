"use client";

import { useTransition } from "react";
import { toggleUserRole } from "@/app/actions/admin";
import { toast } from "sonner";

export function RoleToggle({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
        if (confirm(`Voulez-vous vraiment changer le rôle en ${newRole} ?`)) {
            startTransition(async () => {
                try {
                    await toggleUserRole(userId, newRole);
                    toast.success("Rôle mis à jour");
                } catch (error) {
                    toast.error("Erreur lors du changement de rôle.");
                }
            });
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors disabled:opacity-50 underline underline-offset-2"
        >
            {isPending ? "Modification..." : (currentRole === "ADMIN" ? "Rétrograder en USER" : "Promouvoir ADMIN")}
        </button>
    );
}

"use client";

import { useState, useTransition, useCallback } from "react";
import { addProduct } from "@/app/actions/product";
import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export function ProductForm() {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        setIsUploading(true);
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append("files", file);
        });

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setUploadedUrls((prev) => [...prev, ...data.urls]);
            } else {
                toast.error("Erreur d'upload: " + data.error);
            }
        } catch (err) {
            toast.error("Erreur serveur.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("images", JSON.stringify(uploadedUrls));

        startTransition(async () => {
            try {
                await addProduct(formData);
                setUploadedUrls([]);
                (e.target as HTMLFormElement).reset();
                toast.success("Produit ajouté avec succès !");
            } catch (error) {
                toast.error("Erreur lors de l'ajout.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 space-y-6">
            <h2 className="font-display text-2xl text-brand-secondary border-b border-brand-secondary/10 pb-4">Ajouter un produit</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-brand-text/80 uppercase">Nom</label>
                    <input name="name" required className="w-full mt-1 px-4 py-2 border rounded-xl" />
                </div>
                <div>
                    <label className="text-xs font-bold text-brand-text/80 uppercase">Prix (€)</label>
                    <input name="price" type="number" step="0.01" required className="w-full mt-1 px-4 py-2 border rounded-xl" />
                </div>
                <div>
                    <label className="text-xs font-bold text-brand-text/80 uppercase">Catégorie</label>
                    <select name="category" required className="w-full mt-1 px-4 py-2 border rounded-xl bg-white">
                        <option value="boucles-d-oreilles">Boucles d&apos;oreilles</option>
                        <option value="colliers">Colliers</option>
                        <option value="bracelets">Bracelets</option>
                        <option value="broches">Broches</option>
                        <option value="accessoires">Accessoires & Déco</option>
                        <option value="parures">Parures</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-brand-text/80 uppercase">Description</label>
                <textarea name="description" required rows={4} className="w-full mt-1 px-4 py-2 border rounded-xl resize-y" />
            </div>

            <div>
                <label className="text-xs font-bold text-brand-text/80 uppercase mb-2 block">Photos (Drag & Drop)</label>
                <div 
                    className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors
                    ${dragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-secondary/20 bg-brand-light/20 hover:bg-brand-light/40'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Glissez-déposez ou cliquez ici"
                    />
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-brand-secondary animate-spin" />
                    ) : (
                        <>
                            <UploadCloud className="w-10 h-10 text-brand-secondary/40 mb-2" />
                            <p className="text-sm font-medium text-brand-text/60">Glissez-déposez vos images ici</p>
                            <p className="text-xs text-brand-text/40">ou cliquez pour parcourir</p>
                        </>
                    )}
                </div>

                {uploadedUrls.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                        {uploadedUrls.map((url, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border shadow-sm group">
                                <Image src={url} alt="Aperçu" fill className="object-cover" />
                                <button 
                                    type="button" 
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                {i === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-brand-primary/80 text-white text-[10px] text-center font-bold py-0.5">
                                        Principale
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending || isUploading}
                className="w-full py-3 bg-brand-secondary text-white rounded-xl font-bold hover:bg-brand-primary transition-all disabled:opacity-50"
            >
                {isPending ? "Ajout en cours..." : "Publier le produit"}
            </button>
        </form>
    );
}

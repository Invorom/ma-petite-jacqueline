export function orderConfirmationHtml({ orderId, items, total, shippingMethod }: { orderId: string, items: any[], total: number, shippingMethod: string }) {
    const itemsHtml = items.map(item => `<tr><td style="padding:8px 0;color:#3B2A20">${item.name || item.category}</td><td style="padding:8px 0;text-align:right;color:#3B2A20">${item.price} €</td></tr>`).join("");
    const shippingLabel = shippingMethod === "HOME" ? "Livraison à domicile" : "Click & Collect (Retrait à l'atelier)";
    const nextStep = shippingMethod === "HOME"
        ? "Nous préparons votre commande avec soin. Vous recevrez un nouvel e-mail dès son expédition !"
        : "Nous préparons votre commande. Vous recevrez un e-mail dès qu'elle sera prête à être récupérée à l'atelier !";

    return `<!DOCTYPE html><html><body style="background-color:#F7EFE5;font-family:sans-serif;padding:40px 0;margin:0">
<div style="background-color:#ffffff;padding:40px;border-radius:8px;max-width:600px;margin:0 auto">
<h1 style="color:#3B2A20;font-size:24px;text-align:center;margin-bottom:30px">Merci pour votre commande !</h1>
<p style="color:#3B2A20;font-size:16px;margin-bottom:20px">Votre commande <strong>#${orderId.substring(orderId.length - 8).toUpperCase()}</strong> a bien été confirmée.</p>
<div style="margin-bottom:30px;background-color:#F7EFE5;padding:20px;border-radius:8px">
<h3 style="font-size:18px;margin-top:0;color:#3B2A20">Récapitulatif :</h3>
<table style="width:100%;border-collapse:collapse">${itemsHtml}</table>
<hr style="border:none;border-top:1px solid rgba(59,42,32,0.2);margin:15px 0"/>
<p style="font-weight:bold;margin:0;color:#3B2A20">Total : ${total.toFixed(2)} €</p>
</div>
<p style="color:#3B2A20;font-size:16px;margin-bottom:20px"><strong>Mode de livraison :</strong> ${shippingLabel}</p>
<p style="color:#3B2A20;font-size:14px">${nextStep}</p>
<hr style="border:none;border-top:1px solid rgba(59,42,32,0.2);margin:40px 0 20px"/>
<p style="color:rgba(59,42,32,0.7);font-size:12px;text-align:center">Ma Petite Jacqueline - Atelier de bijoux vintage</p>
</div></body></html>`;
}

export function giftCardHtml({ codes }: { codes: { code: string, amount: number }[] }) {
    const codesHtml = codes.map(c => `
<div style="background-color:#F7EFE5;padding:20px;border-radius:12px;margin:15px 0;border:2px dashed #E5D5C5;text-align:center">
<p style="margin:0;font-size:14px;color:#3B2A20;opacity:0.8;font-weight:bold;text-transform:uppercase">Valeur : ${c.amount} €</p>
<p style="margin:10px 0 0;font-size:28px;color:#E07A5F;font-weight:900;letter-spacing:2px">${c.code}</p>
</div>`).join("");

    return `<!DOCTYPE html><html><body style="background-color:#F7EFE5;font-family:sans-serif;padding:40px 0;margin:0">
<div style="background-color:#ffffff;padding:40px;border-radius:8px;max-width:600px;margin:0 auto;text-align:center">
<h1 style="color:#3B2A20;font-size:24px;margin-bottom:30px">🎁 Vos Cartes Cadeaux sont prêtes !</h1>
<p style="color:#3B2A20;font-size:16px;margin-bottom:20px">Merci pour votre achat ! Voici les codes secrets de vos cartes cadeaux, prêts à être utilisés ou offerts à vos proches.</p>
${codesHtml}
<p style="color:#3B2A20;font-size:14px;line-height:1.5;margin-top:30px"><strong>Comment l'utiliser ?</strong><br/>Lors de la commande sur notre site, il suffit de rentrer ce code dans la case "Code Promo" du panier.</p>
<hr style="border:none;border-top:1px solid rgba(59,42,32,0.2);margin:40px 0 20px"/>
<p style="color:rgba(59,42,32,0.7);font-size:12px">Ma Petite Jacqueline - Atelier de bijoux vintage</p>
</div></body></html>`;
}

export function orderStatusHtml({ orderId, status }: { orderId: string, status: string }) {
    let title = "";
    let message = "";

    if (status === "SHIPPED") {
        title = "📦 Votre commande est en route !";
        message = "Bonne nouvelle ! Votre commande vient d'être expédiée. Elle sera bientôt entre vos mains.";
    } else if (status === "READY_FOR_PICKUP") {
        title = "🛍️ Votre commande est prête !";
        message = "Votre commande est prête à être récupérée à notre atelier. Nous vous y attendons avec impatience !";
    } else if (status === "COMPLETED_CASH" || status === "COMPLETED") {
        title = "🛍️ Merci pour votre visite !";
        message = "Votre commande a bien été récupérée à l'atelier. J'espère que vos bijoux vous plairont !";
    }

    return `<!DOCTYPE html><html><body style="background-color:#F7EFE5;font-family:sans-serif;padding:40px 0;margin:0">
<div style="background-color:#ffffff;padding:40px;border-radius:8px;max-width:600px;margin:0 auto;text-align:center">
<h1 style="color:#3B2A20;font-size:24px;margin-bottom:30px">${title}</h1>
<p style="color:#3B2A20;font-size:16px;margin-bottom:20px;line-height:1.5">${message}</p>
<p style="color:rgba(59,42,32,0.8);font-size:14px">Commande #${orderId.substring(orderId.length - 8).toUpperCase()}</p>
<hr style="border:none;border-top:1px solid rgba(59,42,32,0.2);margin:40px 0 20px"/>
<p style="color:rgba(59,42,32,0.7);font-size:12px">Ma Petite Jacqueline - Atelier de bijoux vintage</p>
</div></body></html>`;
}

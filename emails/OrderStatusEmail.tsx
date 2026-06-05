import { Html, Body, Container, Text, Heading, Hr } from "@react-email/components";

export default function OrderStatusEmail({ orderId, status, shippingMethod }: { orderId: string, status: string, shippingMethod: string }) {
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

    return (
        <Html>
            <Body style={{ backgroundColor: "#F7EFE5", fontFamily: "sans-serif", padding: "40px 0" }}>
                <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                    <Heading style={{ color: "#3B2A20", fontSize: "24px", marginBottom: "30px" }}>
                        {title}
                    </Heading>

                    <Text style={{ color: "#3B2A20", fontSize: "16px", marginBottom: "20px", lineHeight: "1.5" }}>
                        {message}
                    </Text>

                    <Text style={{ color: "#3B2A20", fontSize: "14px", opacity: 0.8 }}>
                        Commande #{orderId.substring(orderId.length - 8).toUpperCase()}
                    </Text>

                    <Hr style={{ borderColor: "#3B2A20", opacity: 0.2, margin: "40px 0 20px" }} />
                    <Text style={{ color: "#3B2A20", opacity: 0.7, fontSize: "12px" }}>
                        Ma Petite Jacqueline - Atelier de bijoux vintage
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

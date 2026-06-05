import { Html, Body, Container, Section, Text, Heading, Hr } from "@react-email/components";

export default function OrderConfirmationEmail({ orderId, items, total, shippingMethod }: { orderId: string, items: any[], total: number, shippingMethod: string }) {
    return (
        <Html>
            <Body style={{ backgroundColor: "#F7EFE5", fontFamily: "sans-serif", padding: "40px 0" }}>
                <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", maxWidth: "600px", margin: "0 auto" }}>
                    <Heading style={{ color: "#3B2A20", fontSize: "24px", textAlign: "center", marginBottom: "30px" }}>
                        Merci pour votre commande !
                    </Heading>

                    <Text style={{ color: "#3B2A20", fontSize: "16px", marginBottom: "20px" }}>
                        Votre commande <strong>#{orderId.substring(orderId.length - 8).toUpperCase()}</strong> a bien été confirmée.
                    </Text>

                    <Section style={{ marginBottom: "30px", backgroundColor: "#F7EFE5", padding: "20px", borderRadius: "8px" }}>
                        <Heading as="h3" style={{ fontSize: "18px", marginTop: 0, color: "#3B2A20" }}>Récapitulatif :</Heading>
                        {items.map((item, idx) => (
                            <Text key={idx} style={{ margin: "5px 0", color: "#3B2A20" }}>
                                • {item.name || item.category} - {item.price} €
                            </Text>
                        ))}
                        <Hr style={{ borderColor: "#3B2A20", opacity: 0.2, margin: "15px 0" }} />
                        <Text style={{ fontWeight: "bold", margin: 0, color: "#3B2A20" }}>Total : {total.toFixed(2)} €</Text>
                    </Section>

                    <Text style={{ color: "#3B2A20", fontSize: "16px", marginBottom: "20px" }}>
                        <strong>Mode de livraison :</strong> {shippingMethod === "HOME" ? "Livraison à domicile" : "Click & Collect (Retrait à l'atelier)"}
                    </Text>

                    {shippingMethod === "HOME" && (
                        <Text style={{ color: "#3B2A20", fontSize: "14px" }}>
                            Nous préparons votre commande avec soin. Vous recevrez un nouvel e-mail dès son expédition !
                        </Text>
                    )}

                    {shippingMethod === "CLICK_COLLECT" && (
                        <Text style={{ color: "#3B2A20", fontSize: "14px" }}>
                            Nous préparons votre commande. Vous recevrez un e-mail dès qu'elle sera prête à être récupérée à l'atelier !
                        </Text>
                    )}

                    <Hr style={{ borderColor: "#3B2A20", opacity: 0.2, margin: "40px 0 20px" }} />
                    <Text style={{ color: "#3B2A20", opacity: 0.7, fontSize: "12px", textAlign: "center" }}>
                        Ma Petite Jacqueline - Atelier de bijoux vintage
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

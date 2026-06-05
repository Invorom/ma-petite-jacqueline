import { Html, Body, Container, Section, Text, Heading, Hr } from "@react-email/components";

export default function GiftCardEmail({ codes }: { codes: { code: string, amount: number }[] }) {
    return (
        <Html>
            <Body style={{ backgroundColor: "#F7EFE5", fontFamily: "sans-serif", padding: "40px 0" }}>
                <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                    <Heading style={{ color: "#3B2A20", fontSize: "24px", marginBottom: "30px" }}>
                        🎁 Vos Cartes Cadeaux sont prêtes !
                    </Heading>

                    <Text style={{ color: "#3B2A20", fontSize: "16px", marginBottom: "20px" }}>
                        Merci pour votre achat ! Voici les codes secrets de vos cartes cadeaux, prêts à être utilisés ou offerts à vos proches.
                    </Text>

                    <Section style={{ marginBottom: "30px" }}>
                        {codes.map((c, idx) => (
                            <div key={idx} style={{ backgroundColor: "#F7EFE5", padding: "20px", borderRadius: "12px", margin: "15px 0", border: "2px dashed #E5D5C5" }}>
                                <Text style={{ margin: 0, fontSize: "14px", color: "#3B2A20", opacity: 0.8, fontWeight: "bold", textTransform: "uppercase" }}>Valeur : {c.amount} €</Text>
                                <Text style={{ margin: "10px 0 0", fontSize: "28px", color: "#E07A5F", fontWeight: "900", letterSpacing: "2px" }}>{c.code}</Text>
                            </div>
                        ))}
                    </Section>

                    <Text style={{ color: "#3B2A20", fontSize: "14px", lineHeight: "1.5" }}>
                        <strong>Comment l'utiliser ?</strong><br/>
                        Lors de la commande sur notre site, il suffit de rentrer ce code dans la case "Code Promo" du panier.
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

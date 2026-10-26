import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
    {
        name: 'Boucles Dorées Florales',
        category: 'boucles-d-oreilles',
        price: 35,
        image: '/placeholder.jpg',
        description: 'Boucles d\'oreilles dorées issues d\'une assiette fleurie.',
    },
    {
        name: 'Puces Discrètes',
        category: 'boucles-d-oreilles',
        price: 25,
        image: '/placeholder.jpg',
        description: 'Petites puces d\'oreilles en porcelaine.',
    },
    {
        name: 'Collier Argenté Médaillon',
        category: 'colliers',
        price: 45,
        image: '/placeholder.jpg',
        description: 'Médaillon unique sur chaîne argentée.',
    },
    {
        name: 'Bracelet Jonc',
        category: 'bracelets',
        price: 40,
        image: '/placeholder.jpg',
        description: 'Jonc élégant avec insert porcelaine.',
    },
    {
        name: 'Broche Vintage',
        category: 'broches',
        price: 30,
        image: '/placeholder.jpg',
        description: 'Broche rétro pour sublimer vos tenues.',
    },
    {
        name: 'Carte Cadeau',
        category: 'cartes-cadeaux',
        price: 50,
        image: '/placeholder.jpg',
        description: 'Offrez le choix.',
    },
];

async function main() {
    if (process.env.NODE_ENV === 'production') throw new Error('Demo seed is disabled in production.');
    console.log('Start seeding ...');
    for (const entry of products) {
        const product = await prisma.product.upsert({
            where: { id: `demo-${products.indexOf(entry)}` },
            update: {},
            create: { ...entry, id: `demo-${products.indexOf(entry)}`, image: '/logo_jacqueline.png' },
        });
        console.log(`Created product with id: ${product.id}`);
    }
    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });

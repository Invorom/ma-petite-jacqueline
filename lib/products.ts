export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string; // Placeholder for now
  description: string;
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Boucles Dorées Florales',
    category: 'boucles-d-oreilles',
    price: 35,
    image: '/placeholder.jpg',
    description: 'Boucles d\'oreilles dorées issues d\'une assiette fleurie.',
  },
  {
    id: '2',
    name: 'Puces Discrètes',
    category: 'boucles-d-oreilles',
    price: 25,
    image: '/placeholder.jpg',
    description: 'Petites puces d\'oreilles en porcelaine.',
  },
  {
    id: '3',
    name: 'Collier Argenté Médaillon',
    category: 'colliers',
    price: 45,
    image: '/placeholder.jpg',
    description: 'Médaillon unique sur chaîne argentée.',
  },
  {
    id: '4',
    name: 'Bracelet Jonc',
    category: 'bracelets',
    price: 40,
    image: '/placeholder.jpg',
    description: 'Jonc élégant avec insert porcelaine.',
  },
  {
    id: '5',
    name: 'Broche Vintage',
    category: 'broches',
    price: 30,
    image: '/placeholder.jpg',
    description: 'Broche rétro pour sublimer vos tenues.',
  },
  {
    id: '6',
    name: 'Carte Cadeau',
    category: 'carte-cadeaux',
    price: 50,
    image: '/placeholder.jpg',
    description: 'Offrez le choix.',
  },
];

export const categories = [
  { id: 'all', name: 'Tous les bijoux' },
  { id: 'boucles-d-oreilles', name: 'Boucles d\'oreilles' },
  { id: 'colliers', name: 'Colliers' },
  { id: 'bracelets', name: 'Bracelets' },
  { id: 'broches', name: 'Broches' },
  { id: 'accessoires', name: 'Accessoires & Déco' },
  { id: 'parures', name: 'Parures' },
  { id: 'carte-cadeaux', name: 'Carte Cadeaux' },
];

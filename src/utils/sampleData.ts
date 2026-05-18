import { Property, storageKeys } from './api';

const sampleProperties: Property[] = [
  {
    id: 'kitengela-prime-50x100',
    title: 'Prime 50x100 Plot in Kitengela',
    location: 'Kitengela, Kajiado',
    price: '1,500,000',
    size: '50x100 (1/8 Acre)',
    description:
      'A ready-to-build residential plot in a fast-growing neighborhood with road access and nearby utilities.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
    ],
    features: [
      'Clean title deed',
      'All-weather road access',
      'Electricity nearby',
      'Water connection available',
      'Ideal for residential development',
      'Flexible payment plan',
    ],
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'kamulu-residential-plot',
    title: 'Affordable Residential Plot in Kamulu',
    location: 'Kamulu, Nairobi',
    price: '950,000',
    size: '40x80',
    description:
      'An affordable plot positioned for long-term growth, suitable for a family home or investment.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200',
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200',
    ],
    features: [
      'Beaconed plot',
      'Growing residential area',
      'Schools nearby',
      'Accessible from main road',
      'Ready transfer documents',
      'Site visits available',
    ],
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'ngong-view-acre',
    title: 'Scenic Land with Ngong Views',
    location: 'Ngong, Kajiado',
    price: '2,800,000',
    size: '1/4 Acre',
    description:
      'A scenic parcel with excellent views and a calm setting, ideal for a private home or holiday retreat.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200',
    ],
    features: [
      'Panoramic views',
      'Quiet neighborhood',
      'Clear ownership documents',
      'Good road access',
      'Suitable for a home or retreat',
      'Electricity nearby',
    ],
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'juja-farm-estate',
    title: 'Juja Farm Estate Plot',
    location: 'Juja Farm, Kiambu',
    price: '780,000',
    size: '50x100',
    description:
      'A value plot in a developing estate, attractive for buyers looking for entry-level land investment.',
    status: 'Sold',
    images: [
      'https://images.unsplash.com/photo-1492496913980-501348b61469?w=1200',
      'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?w=1200',
    ],
    features: [
      'Estate access road',
      'Surveyed and beaconed',
      'Near proposed amenities',
      'Investment location',
      'Documentation available',
      'Community growth area',
    ],
    createdAt: '2026-01-08T09:00:00.000Z',
  },
];

export async function initializeSampleData() {
  const existingProperties = localStorage.getItem(storageKeys.properties);

  if (existingProperties) {
    return;
  }

  localStorage.setItem(storageKeys.properties, JSON.stringify(sampleProperties));
}

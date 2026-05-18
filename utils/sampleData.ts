import { propertyAPI } from './api';

const sampleProperties = [
  {
    title: 'Prime Land in Kitengela',
    location: 'Kitengela, Kajiado County',
    price: '1,200,000',
    size: '50x100 (1/8 Acre)',
    description: 'Beautiful piece of land located in the fast-growing Kitengela area. Perfect for residential development with easy access to the main road. Clean title deed ready for transfer.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200',
    ],
    features: [
      'Clear Title Deed',
      'Road Access',
      'Water Available',
      'Electricity Nearby',
      'Secure Location',
      'Ready for Development',
    ],
  },
  {
    title: 'Investment Land in Machakos',
    location: 'Machakos Town',
    price: '2,500,000',
    size: '100x100 (1/4 Acre)',
    description: 'Strategic location along the Nairobi-Machakos highway. Ideal for commercial or residential development. Excellent investment opportunity in a growing town.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1625246222719-e2eeb9f9322b?w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
    ],
    features: [
      'Highway Access',
      'Clean Title',
      'Water Connection',
      'Electricity',
      'Commercial Zoning',
      'High ROI Potential',
    ],
  },
  {
    title: 'Residential Plot in Ngong',
    location: 'Ngong, Kajiado',
    price: '1,800,000',
    size: '50x100 (1/8 Acre)',
    description: 'Serene residential plot in Ngong with stunning views of the Ngong Hills. Gated community with excellent security. Perfect for building your dream home.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
    ],
    features: [
      'Gated Community',
      'Title Deed',
      'Piped Water',
      'Electricity',
      'Tarmac Road',
      'Scenic Views',
    ],
  },
  {
    title: 'Commercial Land in Ruiru',
    location: 'Ruiru, Kiambu County',
    price: '3,500,000',
    size: '100x100 (1/4 Acre)',
    description: 'Prime commercial land in the heart of Ruiru town. High foot traffic area, perfect for retail or mixed-use development. Great investment opportunity.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
      'https://images.unsplash.com/photo-1625246222719-e2eeb9f9322b?w=1200',
    ],
    features: [
      'Commercial Zone',
      'Title Deed Ready',
      'High Traffic Area',
      'All Utilities Available',
      'Town Center',
      'Public Transport Access',
    ],
  },
  {
    title: 'Agricultural Land in Limuru',
    location: 'Limuru, Kiambu',
    price: '4,500,000',
    size: '1 Acre',
    description: 'Fertile agricultural land in Limuru with good climate and water availability. Perfect for farming or subdivision into smaller plots. Peaceful environment.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
    ],
    features: [
      'Fertile Soil',
      'Natural Water Source',
      'Good Climate',
      'Access Road',
      'Quiet Environment',
      'Agricultural Zone',
    ],
  },
  {
    title: 'Beachfront Land in Kilifi',
    location: 'Kilifi County',
    price: '8,000,000',
    size: '2 Acres',
    description: 'Rare beachfront property in Kilifi with direct ocean access. Perfect for resort development or luxury residential project. Breathtaking ocean views.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
    ],
    features: [
      'Ocean Frontage',
      'White Sand Beach',
      'Tourism Zone',
      'Title Deed',
      'Development Permit Ready',
      'Unique Investment',
    ],
  },
];

export async function initializeSampleData() {
  try {
    const existingProperties = await propertyAPI.getAll();

    if (existingProperties.length === 0) {
      console.log('Adding sample properties...');
      for (const property of sampleProperties) {
        await propertyAPI.create(property);
      }
      console.log('Sample data initialized successfully!');
      return true;
    } else {
      console.log('Sample data already exists');
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize sample data:', error);
    return false;
  }
}

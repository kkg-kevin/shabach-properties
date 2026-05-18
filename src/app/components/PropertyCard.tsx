import { MapPin, Home } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  size: string;
  images?: string[];
  status: 'Available' | 'Sold';
  onClick?: () => void;
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  size,
  images,
  status,
  onClick,
}: PropertyCardProps) {
  const imageUrl = images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800';

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'Available'
                ? 'bg-[#2DB34A] text-white'
                : 'bg-gray-500 text-white'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-600 mb-4">
          <Home className="w-4 h-4" />
          <span className="text-sm">{size}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-xl font-bold text-[#5E2CA5]">KSh {price}</p>
          </div>
          <Button
            onClick={onClick}
            className="bg-[#5E2CA5] hover:bg-[#5E2CA5]/90"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Home, MapPin } from 'lucide-react';
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
    <Card className="group cursor-pointer overflow-hidden rounded-lg border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span
            className={`rounded px-3 py-1 text-xs font-bold ${
              status === 'Available'
                ? 'bg-[#2DB34A] text-white'
                : 'bg-gray-500 text-white'
            }`}
          >
            {status === 'Available' ? 'For Sale' : status}
          </span>
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="mb-2 line-clamp-1 text-base font-bold text-[#111827]">
          {title}
        </h3>

        <div className="mb-2 flex items-center gap-1 text-gray-600">
          <MapPin className="h-4 w-4 text-[#5E2CA5]" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="mb-4 flex items-center gap-1 text-gray-600">
          <Home className="h-4 w-4 text-[#5E2CA5]" />
          <span className="text-sm">{size}</span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-xl font-bold text-[#16872E]">KSh {price}</p>
          </div>
          <Button
            onClick={onClick}
            variant="ghost"
            className="h-auto px-0 py-0 text-sm font-bold text-[#5E2CA5] hover:bg-transparent hover:text-[#3F1E72]"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

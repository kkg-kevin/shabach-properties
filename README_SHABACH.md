# Shabach Properties Ltd - Real Estate Web Application

A modern, production-ready real estate web application for selling land in Kenya. Built with React, Tailwind CSS, and Supabase.

## Features

### Frontend
- **Homepage**: High-conversion landing page with hero section, trust indicators, featured properties, testimonials, and contact form
- **Property Listings**: Grid view of all available properties with filtering capabilities
- **Property Detail Pages**: Comprehensive property information with image galleries, location maps, features, and lead capture forms
- **Admin Dashboard**: Complete CRUD operations for properties and lead management
- **WhatsApp Integration**: Floating WhatsApp button for instant customer engagement
- **Mobile-First Design**: Fully responsive across all devices

### Backend
- **Supabase Integration**: Scalable backend with PostgreSQL database
- **RESTful API**: Complete API for properties and leads management
- **Real-time Data**: Instant updates across the application
- **Lead Management**: Capture and store customer inquiries

## Tech Stack

- **Frontend**: React 18.3.1
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Lucide Icons
- **Backend**: Supabase Edge Functions (Hono server)
- **Database**: PostgreSQL (via Supabase)
- **Notifications**: Sonner (Toast notifications)

## Brand Colors

- Primary Purple: `#5E2CA5`
- Deep Blue: `#1E3A8A`
- Green (Success): `#2DB34A`
- Orange (Accent): `#F59E0B`
- Light Gray: `#F3F4F6`
- Dark Text: `#111827`

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account (already connected)

### Installation

The application is already set up and running. Sample data has been automatically loaded.

### Using the Application

#### For Visitors
1. Browse featured properties on the homepage
2. Click "View Details" on any property to see more information
3. Use the inquiry form to express interest
4. Chat via WhatsApp using the floating button
5. Fill out the contact form for general inquiries

#### For Administrators
1. Click the "Admin" button at the bottom-left corner
2. View dashboard statistics
3. Manage properties:
   - Add new properties with images, descriptions, and features
   - Edit existing properties
   - Delete properties
   - Mark properties as Available or Sold
4. View and manage customer leads

## API Endpoints

All endpoints are prefixed with `/make-server-4868b0da/`

### Properties
- `GET /properties` - Get all properties
- `GET /properties/:id` - Get single property
- `POST /properties` - Create new property
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

### Leads
- `GET /leads` - Get all leads
- `POST /leads` - Create new lead

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HomePage.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetail.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── WhatsAppButton.tsx
│   │   └── ui/ (Reusable UI components)
│   └── App.tsx (Main application entry)
├── styles/
│   └── theme.css (Brand colors and styling)
└── utils/
    ├── api.ts (API client functions)
    └── sampleData.ts (Sample property data)

supabase/
└── functions/
    └── server/
        ├── index.tsx (API routes)
        └── kv_store.tsx (Database utilities)
```

## Features Implemented

✅ Modern, high-conversion landing page
✅ Property listings with detailed information
✅ Lead capture and inquiry forms
✅ Admin dashboard with full CRUD operations
✅ WhatsApp integration
✅ Mobile-responsive design
✅ Trust indicators and social proof
✅ Sample data for demo purposes
✅ Real-time data synchronization
✅ Professional branding and styling

## Customization

### Adding Properties
1. Go to Admin Dashboard
2. Click "Add Property" tab
3. Fill in property details
4. Add image URLs (use Unsplash or upload to a CDN)
5. Add features
6. Click "Add Property"

### Updating Contact Information
Update the phone number and email in:
- `src/app/components/Header.tsx`
- `src/app/components/Footer.tsx`
- `src/app/components/WhatsAppButton.tsx`
- `src/app/components/PropertyDetail.tsx`

### Google Maps Integration
To enable interactive maps:
1. Get a Google Maps API key
2. Update the map embed in `src/app/components/PropertyDetail.tsx`

## Performance Optimizations

- Lazy loading for images
- Optimized component rendering
- Efficient state management
- Minimal re-renders
- Code splitting ready

## Security

- Environment variables for sensitive data
- Server-side API key management
- CORS protection
- Input validation
- XSS protection

## Future Enhancements

- User authentication for customers
- Saved favorites functionality
- Email notifications
- Payment integration
- Virtual tours
- Advanced search and filters
- Analytics dashboard
- SEO optimization
- Progressive Web App (PWA)

## Support

For support or inquiries:
- Email: info@shabachproperties.co.ke
- Phone: +254 700 000 000
- WhatsApp: Available via floating button

## License

Copyright © 2026 Shabach Properties Ltd. All rights reserved.

---

Built with ❤️ using React, Tailwind CSS, and Supabase

// Single source for contact details and editable content shown across the site
export const site = {
  name: 'Shabach Properties Ltd',
  phoneDisplay: '+254 727 496 461',
  phoneHref: 'tel:+254727496461',
  whatsappNumber: '254727496461',
  email: 'info@shabachproperties.co.ke',
  address: 'Nairobi, Kenya',

  // Shown in the footer and About section once filled in; leave empty to hide.
  // Buyers look for these before trusting a land company.
  officeAddress: '', // e.g. '2nd Floor, Example House, Example Road, Nairobi'
  officeHours: '', // e.g. 'Mon to Fri 8am to 5pm, Sat 9am to 1pm'
  registration: '', // e.g. 'Registered in Kenya, company number PVT-XXXXXXX'

  // Add the full page link to show the icon in the footer; leave empty to hide it
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },

  // Real client testimonials only, e.g.
  // { name: 'Jane W.', role: 'Bought a plot in Kitengela', content: '...' }
  // The section is hidden while the list is empty.
  testimonials: [] as { name: string; role: string; content: string }[],

  // "How buying land works" on the home page
  buyingSteps: [
    {
      title: 'Choose a plot and visit it',
      description: 'Browse the listings, then book a site visit to see the plot, the access road and the neighbourhood.',
    },
    {
      title: 'Check the documents',
      description: 'Ask for a copy of the title and do an official search at the Ministry of Lands, yourself or through a lawyer, to confirm the owner.',
    },
    {
      title: 'Sign the sale agreement',
      description: 'The agreement sets out the price and payment plan. Pay the deposit, or the full amount, as it describes.',
    },
    {
      title: 'Transfer and title deed',
      description: 'Once paid, the land is transferred into your name and you receive your title deed.',
    },
  ],
};

// "0712 345 678", "712345678" or "+254 712 345 678" -> "254712345678"
export function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export function whatsappUrl(message: string, number = site.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Includes the link, so the team knows exactly which plot, and WhatsApp shows its photo
export function propertyWhatsAppMessage(property: { id: string; title: string; location: string }) {
  return `Hello, I am interested in ${property.title} in ${property.location}: ${window.location.origin}/properties/${property.id}`;
}

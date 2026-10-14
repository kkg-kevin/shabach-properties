// Single source for contact details and editable content shown across the site
export const site = {
  name: 'Shabach Properties Ltd',
  phoneDisplay: '+254 727 496 461',
  phoneHref: 'tel:+254727496461',
  whatsappNumber: '254727496461',
  email: 'info@shabachproperties.co.ke',
  address: 'Nairobi, Kenya',

  // Add the full page link to show the icon in the footer; leave empty to hide it
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },

  // PLACEHOLDERS: replace with real client testimonials, or empty the list to hide the section
  testimonials: [
    {
      name: 'James Mwangi',
      role: 'Happy Investor',
      content: 'Shabach Properties made the process so easy and transparent. I got my dream plot at a great price.',
    },
    {
      name: 'Mary Wanjiku',
      role: 'Property Owner',
      content: 'The team explained every step clearly and arranged a site visit quickly. I felt confident buying.',
    },
  ],
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

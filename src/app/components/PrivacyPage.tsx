import { site } from '../../config/site';
import { usePageTitle } from '../../hooks/usePageTitle';

// Describes what the site actually does with enquiry details. Review it with
// your advisor and update it if the way enquiries are handled changes.
export function PrivacyPage() {
  usePageTitle('Privacy Notice');

  const sections = [
    {
      title: 'What we collect',
      body: [
        'When you send an enquiry we collect your name and phone number, and anything else you choose to give us: your email address, message, preferred location, preferred site visit date and time, and the property you asked about. We also record the page and campaign source that brought you to the enquiry so we can understand which listings and channels are useful.',
        'We do not use advertising or tracking cookies. We use Vercel Web Analytics to count visits and measure actions such as property views, contact clicks, and enquiries. We also record the page and campaign source with an enquiry. These tools do not use cookies or identify you.',
      ],
    },
    {
      title: 'How we use it',
      body: [
        'We use your details only to answer your enquiry: to call, message or email you about the land you are interested in and to arrange site visits. We do not sell your details or share them for marketing.',
      ],
    },
    {
      title: 'Where it is kept',
      body: [
        'Enquiries are stored in a secure database that only our team can access, and may also be emailed to our team so that we can reply quickly. If you provide an email address, we may send a receipt confirming that we received your enquiry. Our website and database are run by service providers (Vercel, Supabase, and Resend for email) on our behalf.',
        'We delete enquiries once we no longer need them to help you.',
      ],
    },
    {
      title: 'Your rights',
      body: [
        "Under Kenya's Data Protection Act, 2019 you can ask to see the details we hold about you, ask us to correct them, or ask us to delete them.",
        `To do any of these, email ${site.email} or call ${site.phoneDisplay}.`,
      ],
    },
  ];

  return (
    <div className="bg-white py-12">
      <article className="mx-auto max-w-3xl px-4 lg:px-6">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-purple">Privacy</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Privacy notice</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          This notice explains how {site.name} handles the details you share with us through this website.
        </p>

        {sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="text-xl font-bold text-ink">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-7 text-gray-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}

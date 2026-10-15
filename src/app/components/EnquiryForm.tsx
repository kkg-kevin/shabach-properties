import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { ApiError, leadAPI, type Property } from '../../utils/api';
import { propertyWhatsAppMessage, whatsappUrl } from '../../config/site';

type Field = 'name' | 'phone' | 'email' | 'preferredLocation' | 'visitDate' | 'message';

const FIELD_ORDER: Field[] = ['name', 'phone', 'email', 'preferredLocation', 'visitDate', 'message'];

// `website` is the hidden anti-spam field; real visitors leave it empty
const emptyValues = { name: '', phone: '', email: '', preferredLocation: '', visitDate: '', message: '', website: '' };

const PHONE = /^\+?[\d\s()-]{7,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// text-base keeps phones from zooming in when a field is tapped
const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-green-bright focus:ring-2 focus:ring-brand-green-bright/20 aria-[invalid=true]:border-red-600';

interface EnquiryFormProps {
  idPrefix: string;
  heading: string;
  subheading?: string;
  // The plot being asked about; enables the preferred visit date
  property?: Property;
  // Shows the preferred-location picker
  locations?: string[];
  showWhatsApp?: boolean;
  // Goes up by one each time a "Book Site Visit" button is pressed
  visitRequest?: number;
}

export function EnquiryForm({
  idPrefix,
  heading,
  subheading,
  property,
  locations = [],
  showWhatsApp = false,
  visitRequest = 0,
}: EnquiryFormProps) {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ name: string; phone: string } | null>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);

  const canBookVisit = Boolean(property) && property?.status !== 'Sold';
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's time zone
  const fieldId = (field: Field) => `${idPrefix}-${field}`;

  useEffect(() => {
    if (!visitRequest || !canBookVisit) return;
    setSent(null);
    setValues((current) => ({ ...current, message: current.message || 'I would like to book a site visit.' }));
    // The page scrolls the form into view; focusing must not fight that scroll
    requestAnimationFrame(() => document.getElementById(fieldId('visitDate'))?.focus({ preventScroll: true }));
  }, [visitRequest]);

  useEffect(() => {
    if (sent) thanksRef.current?.focus();
  }, [sent]);

  const update = (field: Field | 'website', value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== 'website' && errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const showErrors = (found: Partial<Record<Field, string>>) => {
    setErrors(found);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) document.getElementById(fieldId(first))?.focus();
  };

  const validate = () => {
    const found: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) found.name = 'Please enter your name';
    if (!values.phone.trim()) found.phone = 'Please enter your phone number';
    else if (!PHONE.test(values.phone.trim())) found.phone = 'Please enter a valid phone number, e.g. 0712 345 678';
    if (values.email.trim() && !EMAIL.test(values.email.trim())) found.email = 'Please enter a valid email address';
    if (values.visitDate && values.visitDate < today) found.visitDate = 'Please choose a date from today onwards';
    return found;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    const found = validate();
    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }

    setSubmitting(true);
    try {
      await leadAPI.create({
        ...values,
        visitDate: canBookVisit ? values.visitDate : '',
        propertyId: property?.id,
        propertyTitle: property?.title,
      });
      setSent({ name: values.name.trim(), phone: values.phone.trim() });
      setValues(emptyValues);
      setErrors({});
    } catch (error) {
      console.error('Failed to submit enquiry:', error);
      if (error instanceof ApiError && error.field && FIELD_ORDER.includes(error.field as Field)) {
        showErrors({ [error.field]: error.message });
      } else {
        setFormError(
          error instanceof ApiError && error.status < 500
            ? error.message
            : 'We could not send your enquiry. Please check your connection and try again, or chat with us on WhatsApp.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = property
    ? propertyWhatsAppMessage(property)
    : `Hello, I am interested in buying land${values.preferredLocation ? ` in ${values.preferredLocation}` : ''}.`;

  const whatsappButton = (
    <Button asChild variant="secondary" className="w-full">
      <a href={whatsappUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        Chat on WhatsApp
      </a>
    </Button>
  );

  if (sent) {
    return (
      <div role="status" className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-brand-green" />
        {/* Same id as the form heading, so a dialog around the form stays labelled */}
        <h3 ref={thanksRef} id={`${idPrefix}-heading`} tabIndex={-1} className="text-xl font-bold text-ink outline-none">
          Thank you, {sent.name.split(/\s+/)[0]}!
        </h3>
        <p className="text-gray-600">
          We have received your enquiry and will call you on <strong className="text-ink">{sent.phone}</strong> shortly.
        </p>
        <p className="text-sm text-gray-500">Prefer to chat now?</p>
        {whatsappButton}
        <button
          type="button"
          onClick={() => setSent(null)}
          className="text-sm font-semibold text-brand-purple underline-offset-2 hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const fieldProps = (field: Field) => ({
    id: fieldId(field),
    value: values[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      update(field, event.target.value),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${fieldId(field)}-error` : undefined,
    className: inputClass,
  });

  const label = (field: Field, text: string, optional = false) => (
    <label htmlFor={fieldId(field)} className="mb-1 block text-sm font-medium text-gray-800">
      {text}
      {optional && <span className="font-normal text-gray-500"> (optional)</span>}
    </label>
  );

  const error = (field: Field) =>
    errors[field] && (
      <p id={`${fieldId(field)}-error`} className="mt-1 text-sm text-red-700">
        {errors[field]}
      </p>
    );

  return (
    <div>
      <h2 id={`${idPrefix}-heading`} className="text-xl font-bold text-ink">
        {heading}
      </h2>
      {subheading && <p className="mt-1 text-sm text-gray-600">{subheading}</p>}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Hidden from people; bots that fill it in are ignored */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value={values.website}
          onChange={(event) => update('website', event.target.value)}
        />

        <div>
          {label('name', 'Full name')}
          <input {...fieldProps('name')} type="text" name="name" autoComplete="name" required />
          {error('name')}
        </div>

        <div>
          {label('phone', 'Phone number')}
          <input
            {...fieldProps('phone')}
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="07XX XXX XXX"
            required
          />
          {error('phone')}
        </div>

        <div>
          {label('email', 'Email address', true)}
          <input {...fieldProps('email')} type="email" name="email" autoComplete="email" />
          {error('email')}
        </div>

        {locations.length > 0 && (
          <div>
            {label('preferredLocation', 'Preferred location', true)}
            <select {...fieldProps('preferredLocation')} name="preferredLocation">
              <option value="">Any location</option>
              {locations.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </select>
          </div>
        )}

        {canBookVisit && (
          <div>
            {label('visitDate', 'Preferred site visit date', true)}
            <input {...fieldProps('visitDate')} type="date" name="visitDate" min={today} />
            {error('visitDate')}
          </div>
        )}

        <div>
          {label('message', 'Message', true)}
          <textarea {...fieldProps('message')} name="message" rows={3} />
          {error('message')}
        </div>

        {formError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? 'Sending...' : 'Send Enquiry'}
        </Button>
        {showWhatsApp && whatsappButton}

        <p className="text-xs text-gray-500">
          We only use your details to contact you about this enquiry.{' '}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-ink">
            Privacy notice
          </Link>
        </p>
      </form>
    </div>
  );
}

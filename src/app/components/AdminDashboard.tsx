import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  Home as HomeIcon,
  Link as LinkIcon,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  PlusCircle,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { ImageWithFallback } from './ImageWithFallback';
import { StatusBadge } from './PropertyCard';
import {
  propertyAPI,
  leadAPI,
  imageAPI,
  errorMessage,
  formatDate,
  formatPrice,
  isSignedOut,
  normalisePrice,
  thumbnailUrl,
  type Lead,
  type LeadStatus,
  type NewProperty,
  type Property,
  type PropertyStatus,
} from '../../utils/api';
import { refreshProperties } from '../../hooks/useProperties';
import { whatsappNumber, whatsappUrl } from '../../config/site';

interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
  // Whether new enquiries are emailed to the team
  emailAlerts: boolean;
}

// Matches the server's limit
const MAX_PHOTOS = 12;

const emptyForm: NewProperty = {
  title: '',
  location: '',
  price: '',
  size: '',
  description: '',
  status: 'Available',
  images: [],
  features: [''],
  paymentPlan: '',
  titleStatus: '',
  mapUrl: '',
};

const propertyStatuses: { value: PropertyStatus; label: string }[] = [
  { value: 'Available', label: 'For Sale' },
  { value: 'Reserved', label: 'Reserved (under offer)' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Hidden', label: 'Hidden (not on the site)' },
];

const leadStatuses: LeadStatus[] = ['New', 'Contacted', 'Closed'];

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none';

const panelClass = 'rounded-xl border border-gray-200 bg-white';

interface UploadItem {
  id: number;
  name: string;
  error?: string;
}

function LeadCard({
  lead,
  onStatus,
  onNotes,
  onDelete,
}: {
  lead: Lead;
  onStatus: (status: LeadStatus) => void;
  onNotes: (notes: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(lead.notes ?? '');
  const status = lead.status ?? 'New';
  const greeting = `Hello ${lead.name.split(/\s+/)[0]}, this is Shabach Properties following up on your enquiry${
    lead.propertyTitle ? ` about ${lead.propertyTitle}` : ''
  }.`;

  const saveNotes = () => {
    if (notes.trim() !== (lead.notes ?? '').trim()) onNotes(notes.trim());
  };

  return (
    <article className={`${panelClass} p-6 ${status === 'New' ? 'border-l-4 border-l-amber-600' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">{lead.name}</h3>
          <p className="text-sm text-gray-500">{formatDate(lead.createdAt, true)}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Status
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value as LeadStatus)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-ink outline-none focus:ring-2 focus:ring-brand-purple"
          >
            {leadStatuses.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}>
            <Phone className="h-4 w-4" />
            {lead.phone}
          </a>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <a href={whatsappUrl(greeting, whatsappNumber(lead.phone))} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
        {lead.email && (
          <Button asChild variant="outline" size="sm">
            <a href={`mailto:${lead.email}`}>
              <Mail className="h-4 w-4" />
              {lead.email}
            </a>
          </Button>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {lead.propertyTitle && (
          <div>
            <dt className="text-sm text-gray-500">Property</dt>
            <dd className="font-medium">
              {lead.propertyId ? (
                <a
                  href={`/properties/${lead.propertyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-purple hover:underline"
                >
                  {lead.propertyTitle}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                lead.propertyTitle
              )}
            </dd>
          </div>
        )}
        {lead.visitDate && (
          <div>
            <dt className="text-sm text-gray-500">Preferred site visit</dt>
            <dd className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-900">
              <Calendar className="h-4 w-4" />
              {formatDate(lead.visitDate)}
            </dd>
          </div>
        )}
        {lead.preferredLocation && (
          <div>
            <dt className="text-sm text-gray-500">Preferred location</dt>
            <dd className="font-medium">{lead.preferredLocation}</dd>
          </div>
        )}
        {lead.message && (
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500">Message</dt>
            <dd className="whitespace-pre-line text-gray-700">{lead.message}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 border-t pt-4">
        <label htmlFor={`notes-${lead.id}`} className="mb-1 block text-sm text-gray-500">
          Notes (only the team sees these; saved when you click away)
        </label>
        <textarea
          id={`notes-${lead.id}`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          className={`${inputClass} resize-y text-sm`}
          placeholder="e.g. Called on Monday, visiting Saturday 10am"
        />
        <div className="mt-3 flex justify-end">
          <Button variant="destructive" size="sm" aria-label={`Delete lead from ${lead.name}`} onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function AdminDashboard({ onBack, onLogout, emailAlerts }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'leads' | 'form'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadFilter, setLeadFilter] = useState<LeadStatus | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewProperty>(emptyForm);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [imageLink, setImageLink] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const nextUploadId = useRef(0);
  const dragFrom = useRef<number | null>(null);

  const uploading = uploads.some((upload) => !upload.error);

  // Shows the error, or returns to the sign-in screen if the session has expired
  const reportError = (error: unknown, fallback: string) => {
    console.error(`${fallback}:`, error);
    if (isSignedOut(error)) {
      toast.error('Your session has expired. Please sign in again.');
      onLogout();
      return;
    }
    toast.error(errorMessage(error, fallback));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propsData, leadsData] = await Promise.all([propertyAPI.getAllForAdmin(), leadAPI.getAll()]);
      setProperties(propsData);
      setLeads(leadsData);
    } catch (error) {
      reportError(error, 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Keeps the public pages open in this tab in step with the admin's changes
  const afterPropertyChange = () => {
    refreshProperties(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setUploads([]);
    setImageLink('');
  };

  const startAdd = () => {
    resetForm();
    setActiveTab('form');
  };

  const startEdit = (property: Property) => {
    resetForm();
    setEditingId(property.id);
    setFormData({
      title: property.title,
      location: property.location,
      price: property.price,
      size: property.size,
      description: property.description ?? '',
      status: property.status,
      images: property.images ?? [],
      features: property.features?.length ? property.features : [''],
      paymentPlan: property.paymentPlan ?? '',
      titleStatus: property.titleStatus ?? '',
      mapUrl: property.mapUrl ?? '',
    });
    setActiveTab('form');
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: NewProperty = {
      ...formData,
      features: formData.features.filter((f) => f.trim()),
    };

    try {
      setSaving(true);
      if (editingId) {
        await propertyAPI.update(editingId, payload);
        toast.success('Property updated successfully!');
      } else {
        await propertyAPI.create(payload);
        toast.success('Property added successfully!');
      }
      resetForm();
      loadData();
      afterPropertyChange();
      setActiveTab('properties');
    } catch (error) {
      reportError(error, 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handlePropertyStatus = async (property: Property, status: PropertyStatus) => {
    const { id, createdAt, updatedAt, ...rest } = property;
    setProperties((current) => current.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      await propertyAPI.update(id, { ...rest, status });
      toast.success(`${property.title} is now ${propertyStatuses.find((s) => s.value === status)?.label}`);
      afterPropertyChange();
    } catch (error) {
      setProperties((current) => current.map((p) => (p.id === id ? { ...p, status: property.status } : p)));
      reportError(error, 'Failed to update property');
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    if (!confirm(`Delete "${property.title}" and its photos? This cannot be undone. To take it off the site but keep it, set it to Hidden instead.`)) return;

    try {
      await propertyAPI.delete(property.id);
      toast.success('Property deleted');
      setProperties((current) => current.filter((p) => p.id !== property.id));
      afterPropertyChange();
    } catch (error) {
      reportError(error, 'Failed to delete property');
    }
  };

  // Changes show at once and are undone if the server refuses them
  const handleLeadStatus = async (lead: Lead, status: LeadStatus) => {
    setLeads((current) => current.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await leadAPI.update(lead.id, { status });
    } catch (error) {
      setLeads((current) => current.map((l) => (l.id === lead.id ? { ...l, status: lead.status } : l)));
      reportError(error, 'Failed to update lead');
    }
  };

  const handleLeadNotes = async (lead: Lead, notes: string) => {
    try {
      const updated = await leadAPI.update(lead.id, { notes });
      setLeads((current) => current.map((l) => (l.id === lead.id ? { ...l, notes: updated.notes } : l)));
      toast.success('Note saved');
    } catch (error) {
      reportError(error, 'Failed to save the note');
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!confirm(`Delete the enquiry from ${lead.name}?`)) return;

    try {
      await leadAPI.delete(lead.id);
      setLeads((current) => current.filter((l) => l.id !== lead.id));
      toast.success('Lead deleted');
    } catch (error) {
      reportError(error, 'Failed to delete lead');
    }
  };

  // Uploads one at a time; each photo appears as soon as it is done, and one
  // failure does not stop the rest
  const handleUploadImages = async (files: FileList | null) => {
    if (!files?.length) return;

    const room = MAX_PHOTOS - formData.images.length - uploads.filter((upload) => !upload.error).length;
    const chosen = Array.from(files).slice(0, Math.max(room, 0));
    if (chosen.length < files.length) {
      toast.error(`A property can have up to ${MAX_PHOTOS} photos`);
    }
    if (fileInput.current) fileInput.current.value = '';

    const queued = chosen.map((file) => ({ id: nextUploadId.current++, file }));
    setUploads((current) => [...current, ...queued.map(({ id, file }) => ({ id, name: file.name }))]);

    for (const { id, file } of queued) {
      try {
        const url = await imageAPI.upload(file);
        setFormData((current) => ({ ...current, images: [...current.images, url] }));
        setUploads((current) => current.filter((upload) => upload.id !== id));
      } catch (error) {
        if (isSignedOut(error)) {
          reportError(error, 'Failed to upload photo');
          return;
        }
        console.error('Failed to upload photo:', error);
        setUploads((current) =>
          current.map((upload) => (upload.id === id ? { ...upload, error: errorMessage(error, 'Upload failed') } : upload)),
        );
      }
    }
  };

  const addImageLink = () => {
    const link = imageLink.trim();
    if (!/^https?:\/\//i.test(link)) {
      toast.error('Image links must start with http:// or https://');
      return;
    }
    if (formData.images.length >= MAX_PHOTOS) {
      toast.error(`A property can have up to ${MAX_PHOTOS} photos`);
      return;
    }
    setFormData((current) => ({ ...current, images: [...current.images, link] }));
    setImageLink('');
  };

  const moveImage = (from: number, to: number) => {
    if (from === to || to < 0 || to >= formData.images.length) return;
    setFormData((current) => {
      const images = [...current.images];
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      return { ...current, images };
    });
  };

  const removeImage = (index: number) => {
    setFormData((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...formData.features];
    features[index] = value;
    setFormData({ ...formData, features });
  };

  const removeFeature = (index: number) => {
    const features = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: features.length ? features : [''] });
  };

  const leadCount = (status: LeadStatus) => leads.filter((lead) => (lead.status ?? 'New') === status).length;
  const newLeads = leadCount('New');
  const visibleLeads = leadFilter === 'All' ? leads : leads.filter((lead) => (lead.status ?? 'New') === leadFilter);
  const forSale = properties.filter((p) => p.status === 'Available').length;
  const normalisedPrice = normalisePrice(formData.price);

  const tabClass = (tab: typeof activeTab) =>
    `pb-3 px-4 font-medium transition-colors whitespace-nowrap ${
      activeTab === tab ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-gray-600 hover:text-gray-900'
    }`;

  const iconButton = 'rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-purple text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mb-1 text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-200">Manage properties and leads</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} className="border-white text-brand-purple">
                <ArrowLeft className="h-4 w-4" />
                Back to Site
              </Button>
              <Button variant="outline" onClick={onLogout} className="border-white text-brand-purple">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {!emailAlerts && (
          <div className="mb-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900" role="status">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              <strong>Email alerts for new enquiries are off,</strong> so new leads only appear here. To be emailed the
              moment someone enquires, add <code>RESEND_API_KEY</code> and <code>LEAD_NOTIFY_EMAIL</code> in Vercel
              (Settings → Environment Variables) and redeploy.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className={`${panelClass} flex items-center gap-4 p-6`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple/10">
              <HomeIcon className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Properties</p>
              <p className="text-3xl font-bold">
                {properties.length}
                <span className="ml-3 text-sm font-semibold text-brand-green">{forSale} for sale</span>
              </p>
            </div>
          </div>

          <div className={`${panelClass} flex items-center gap-4 p-6`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10">
              <Users className="h-6 w-6 text-brand-green" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-3xl font-bold">
                {leads.length}
                {newLeads > 0 && <span className="ml-3 text-sm font-semibold text-amber-700">{newLeads} new</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 overflow-x-auto border-b">
          <button onClick={() => setActiveTab('properties')} className={tabClass('properties')}>
            Properties ({properties.length})
          </button>
          <button onClick={() => setActiveTab('leads')} className={tabClass('leads')}>
            Leads ({leads.length})
            {newLeads > 0 && (
              <span className="ml-2 rounded-full bg-amber-700 px-2 py-0.5 text-xs font-bold text-white">{newLeads}</span>
            )}
          </button>
          <button onClick={editingId ? () => setActiveTab('form') : startAdd} className={tabClass('form')}>
            {editingId ? 'Edit Property' : 'Add Property'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-brand-purple"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {properties.length === 0 ? (
                  <div className={`${panelClass} p-12 text-center`}>
                    <p className="text-gray-600">No properties yet. Add your first property!</p>
                    <Button onClick={startAdd} variant="secondary" className="mt-4">
                      <PlusCircle className="h-4 w-4" />
                      Add Property
                    </Button>
                  </div>
                ) : (
                  properties.map((property) => (
                    <article key={property.id} className={`${panelClass} p-4 sm:p-6`}>
                      <div className="flex flex-wrap items-start gap-4">
                        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {property.images?.[0] ? (
                            <ImageWithFallback
                              src={thumbnailUrl(property.images[0])}
                              fallbackSrc={property.images[0]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-500">No photos</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{property.title}</h3>
                            <StatusBadge status={property.status} />
                          </div>
                          <p className="text-gray-600">{property.location}</p>
                          <p className="mt-1 text-sm text-gray-600">
                            {formatPrice(property.price)} · {property.size}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label={`Status of ${property.title}`}
                            value={property.status}
                            onChange={(e) => handlePropertyStatus(property, e.target.value as PropertyStatus)}
                            className="h-8 rounded-md border border-gray-300 px-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple"
                          >
                            {propertyStatuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/properties/${property.id}`} target="_blank" aria-label={`View ${property.title} on the site`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" aria-label={`Edit ${property.title}`} onClick={() => startEdit(property)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Delete ${property.title}`}
                            onClick={() => handleDeleteProperty(property)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Show leads">
                  {(['All', ...leadStatuses] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLeadFilter(filter)}
                      aria-pressed={leadFilter === filter}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        leadFilter === filter
                          ? 'border-brand-purple bg-brand-purple text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {filter} ({filter === 'All' ? leads.length : leadCount(filter)})
                    </button>
                  ))}
                </div>

                {visibleLeads.length === 0 ? (
                  <div className={`${panelClass} p-12 text-center`}>
                    <p className="text-gray-600">{leads.length === 0 ? 'No leads yet.' : `No ${leadFilter.toLowerCase()} leads.`}</p>
                  </div>
                ) : (
                  visibleLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatus={(status) => handleLeadStatus(lead, status)}
                      onNotes={(notes) => handleLeadNotes(lead, notes)}
                      onDelete={() => handleDeleteLead(lead)}
                    />
                  ))
                )}
              </div>
            )}

            {/* Add / Edit Property Tab */}
            {activeTab === 'form' && (
              <div className={`${panelClass} p-6`}>
                <h2 className="mb-6 text-xl font-semibold">{editingId ? 'Edit Property' : 'Add New Property'}</h2>
                <form onSubmit={handleSaveProperty} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="property-title" className="mb-2 block text-sm font-medium">Property Title</label>
                      <input
                        id="property-title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={inputClass}
                        placeholder="e.g., Prime Land in Kitengela"
                      />
                    </div>

                    <div>
                      <label htmlFor="property-location" className="mb-2 block text-sm font-medium">Location</label>
                      <input
                        id="property-location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className={inputClass}
                        placeholder="e.g., Kitengela, Kajiado"
                      />
                    </div>

                    <div>
                      <label htmlFor="property-price" className="mb-2 block text-sm font-medium">Price (KSh)</label>
                      <input
                        id="property-price"
                        type="text"
                        inputMode="decimal"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className={inputClass}
                        placeholder="e.g., 1,500,000"
                        aria-describedby="property-price-hint"
                      />
                      <p
                        id="property-price-hint"
                        className={`mt-1 text-xs ${formData.price && !normalisedPrice ? 'text-red-700' : 'text-gray-500'}`}
                      >
                        {!formData.price
                          ? 'Numbers only, e.g. 1,500,000 or 1.5M'
                          : normalisedPrice
                            ? `Shown on the site as ${formatPrice(normalisedPrice)}`
                            : 'Enter the price as a number, e.g. 1,500,000'}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="property-size" className="mb-2 block text-sm font-medium">Size</label>
                      <input
                        id="property-size"
                        type="text"
                        required
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className={inputClass}
                        placeholder="e.g., 50x100 (1/8 Acre)"
                      />
                    </div>

                    <div>
                      <label htmlFor="property-status" className="mb-2 block text-sm font-medium">Status</label>
                      <select
                        id="property-status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                        className={inputClass}
                      >
                        {propertyStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="property-title-status" className="mb-2 block text-sm font-medium">
                        Title deed <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <input
                        id="property-title-status"
                        type="text"
                        list="title-status-options"
                        value={formData.titleStatus}
                        onChange={(e) => setFormData({ ...formData, titleStatus: e.target.value })}
                        className={inputClass}
                        placeholder="e.g., Ready title deed"
                      />
                      <datalist id="title-status-options">
                        <option value="Ready title deed" />
                        <option value="Title deed being processed" />
                        <option value="Shared (mother) title" />
                      </datalist>
                    </div>

                    <div>
                      <label htmlFor="property-payment-plan" className="mb-2 block text-sm font-medium">
                        Payment plan <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <input
                        id="property-payment-plan"
                        type="text"
                        value={formData.paymentPlan}
                        onChange={(e) => setFormData({ ...formData, paymentPlan: e.target.value })}
                        className={inputClass}
                        placeholder="e.g., KSh 200,000 deposit, balance over 12 months"
                      />
                    </div>

                    <div>
                      <label htmlFor="property-map" className="mb-2 block text-sm font-medium">
                        Google Maps pin link <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <input
                        id="property-map"
                        type="url"
                        value={formData.mapUrl}
                        onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                        className={inputClass}
                        placeholder="https://maps.app.goo.gl/..."
                        aria-describedby="property-map-hint"
                      />
                      <p id="property-map-hint" className="mt-1 text-xs text-gray-500">
                        Leave empty to show only the general area until the site visit.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="property-description" className="mb-2 block text-sm font-medium">
                      Description <span className="font-normal text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      id="property-description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`${inputClass} resize-y`}
                      placeholder="Describe the property..."
                    />
                  </div>

                  <fieldset>
                    <legend className="mb-1 text-sm font-medium">
                      Photos ({formData.images.length} of {MAX_PHOTOS})
                    </legend>
                    <p className="mb-3 text-xs text-gray-500">
                      The first photo is the cover. Drag photos, or use the arrows, to change the order.
                    </p>

                    {formData.images.length > 0 && (
                      <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {formData.images.map((image, index) => (
                          <li
                            key={image}
                            draggable
                            onDragStart={() => (dragFrom.current = index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragFrom.current !== null) moveImage(dragFrom.current, index);
                              dragFrom.current = null;
                            }}
                            className="relative cursor-move overflow-hidden rounded-lg border border-gray-200 bg-white"
                          >
                            <ImageWithFallback
                              src={thumbnailUrl(image)}
                              fallbackSrc={image}
                              alt={`Photo ${index + 1}`}
                              className="aspect-[4/3] w-full object-cover"
                            />
                            {index === 0 && (
                              <span className="absolute left-2 top-2 rounded bg-brand-green px-2 py-0.5 text-xs font-bold text-white">
                                Cover
                              </span>
                            )}
                            <div className="flex items-center justify-between border-t border-gray-200 p-1">
                              <div className="flex">
                                <button
                                  type="button"
                                  className={iconButton}
                                  disabled={index === 0}
                                  onClick={() => moveImage(index, index - 1)}
                                  aria-label={`Move photo ${index + 1} earlier`}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className={iconButton}
                                  disabled={index === formData.images.length - 1}
                                  onClick={() => moveImage(index, index + 1)}
                                  aria-label={`Move photo ${index + 1} later`}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    className={iconButton}
                                    onClick={() => moveImage(index, 0)}
                                    aria-label={`Make photo ${index + 1} the cover`}
                                    title="Make cover"
                                  >
                                    <Star className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className={`${iconButton} hover:text-red-700`}
                                  onClick={() => removeImage(index)}
                                  aria-label={`Remove photo ${index + 1}`}
                                  title="Remove"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {uploads.length > 0 && (
                      <ul className="mb-3 space-y-1 text-sm" aria-live="polite">
                        {uploads.map((upload) => (
                          <li key={upload.id} className="flex items-center gap-2">
                            {upload.error ? (
                              <>
                                <AlertTriangle className="h-4 w-4 shrink-0 text-red-700" />
                                <span className="min-w-0 truncate text-red-700">
                                  {upload.name}: {upload.error}
                                </span>
                                <button
                                  type="button"
                                  className={iconButton}
                                  onClick={() => setUploads((current) => current.filter((u) => u.id !== upload.id))}
                                  aria-label={`Dismiss error for ${upload.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-purple" />
                                <span className="min-w-0 truncate text-gray-600">Uploading {upload.name}...</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleUploadImages(e.target.files)}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={formData.images.length >= MAX_PHOTOS}
                        onClick={() => fileInput.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photos
                      </Button>
                      <div className="flex min-w-0 flex-1 gap-2 sm:max-w-md">
                        <input
                          type="url"
                          aria-label="Image link"
                          value={imageLink}
                          onChange={(e) => setImageLink(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addImageLink();
                            }
                          }}
                          className={`${inputClass} h-8 py-1 text-sm`}
                          placeholder="or paste an image link"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addImageLink} disabled={!imageLink.trim()}>
                          <LinkIcon className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">Features</legend>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            aria-label={`Feature ${index + 1}`}
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className={inputClass}
                            placeholder="e.g., Clear title deed, 500m from tarmac, water on site"
                          />
                          <Button type="button" variant="outline" aria-label={`Remove feature ${index + 1}`} onClick={() => removeFeature(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Feature
                      </Button>
                    </div>
                  </fieldset>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" variant="secondary" size="xl" disabled={saving || uploading} className="flex-1">
                      {editingId ? <Edit className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                      {saving ? 'Saving...' : uploading ? 'Waiting for photos...' : editingId ? 'Save Changes' : 'Add Property'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xl"
                      onClick={() => {
                        resetForm();
                        setActiveTab('properties');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

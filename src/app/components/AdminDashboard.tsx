import { useState, useEffect, useRef } from 'react';
import { PlusCircle, Edit, Trash2, Users, Home as HomeIcon, ArrowLeft, LogOut, Phone, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  propertyAPI,
  leadAPI,
  imageAPI,
  errorMessage,
  isSignedOut,
  type Lead,
  type LeadStatus,
  type NewProperty,
  type Property,
  type PropertyStatus,
} from '../../utils/api';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

const emptyForm: NewProperty = {
  title: '',
  location: '',
  price: '',
  size: '',
  description: '',
  status: 'Available',
  images: [''],
  features: [''],
};

const leadStatuses: LeadStatus[] = ['New', 'Contacted', 'Closed'];

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none';

export function AdminDashboard({ onBack, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'leads' | 'form'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewProperty>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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
      const [propsData, leadsData] = await Promise.all([
        propertyAPI.getAll(),
        leadAPI.getAll(),
      ]);
      setProperties(propsData);
      setLeads(leadsData);
    } catch (error) {
      reportError(error, 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const startAdd = () => {
    resetForm();
    setActiveTab('form');
  };

  const startEdit = (property: Property) => {
    setEditingId(property.id);
    setFormData({
      title: property.title,
      location: property.location,
      price: property.price,
      size: property.size,
      description: property.description ?? '',
      status: property.status,
      images: property.images?.length ? property.images : [''],
      features: property.features?.length ? property.features : [''],
    });
    setActiveTab('form');
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: NewProperty = {
      ...formData,
      images: formData.images.filter(img => img.trim()),
      features: formData.features.filter(f => f.trim()),
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
      setActiveTab('properties');
    } catch (error) {
      reportError(error, 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (property: Property) => {
    const status: PropertyStatus = property.status === 'Available' ? 'Sold' : 'Available';
    try {
      const { id, createdAt, ...rest } = property;
      const updated = await propertyAPI.update(id, { ...rest, status });
      setProperties(properties.map((p) => (p.id === id ? updated : p)));
      toast.success(`Marked as ${status}`);
    } catch (error) {
      reportError(error, 'Failed to update property');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted successfully!');
      loadData();
    } catch (error) {
      reportError(error, 'Failed to delete property');
    }
  };

  const handleLeadStatus = async (id: string, status: LeadStatus) => {
    try {
      const updated = await leadAPI.setStatus(id, status);
      setLeads(leads.map((lead) => (lead.id === id ? updated : lead)));
    } catch (error) {
      reportError(error, 'Failed to update lead');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadAPI.delete(id);
      setLeads(leads.filter((lead) => lead.id !== id));
      toast.success('Lead deleted');
    } catch (error) {
      reportError(error, 'Failed to delete lead');
    }
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        uploaded.push(await imageAPI.upload(file));
      }
    } catch (error) {
      reportError(error, 'Failed to upload photo');
    } finally {
      if (uploaded.length > 0) {
        setFormData((current) => ({
          ...current,
          images: [...current.images.filter((img) => img.trim()), ...uploaded],
        }));
      }
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const updateListItem = (field: 'images' | 'features', index: number, value: string) => {
    const items = [...formData[field]];
    items[index] = value;
    setFormData({ ...formData, [field]: items });
  };

  const addListItem = (field: 'images' | 'features') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeListItem = (field: 'images' | 'features', index: number) => {
    const items = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: items.length ? items : [''] });
  };

  const newLeads = leads.filter((lead) => (lead.status ?? 'New') === 'New').length;

  const tabClass = (tab: typeof activeTab) =>
    `pb-3 px-4 font-medium transition-colors ${
      activeTab === tab
        ? 'border-b-2 border-[#5E2CA5] text-[#5E2CA5]'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#5E2CA5] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
              <p className="text-purple-200">Manage properties and leads</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} className="bg-white text-[#5E2CA5] hover:bg-gray-100">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Site
              </Button>
              <Button variant="outline" onClick={onLogout} className="bg-white text-[#5E2CA5] hover:bg-gray-100">
                <LogOut className="mr-2 w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#5E2CA5]/10 rounded-full flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-[#5E2CA5]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-3xl font-bold">{properties.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2DB34A]/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-[#2DB34A]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-3xl font-bold">
                  {leads.length}
                  {newLeads > 0 && (
                    <span className="ml-3 text-sm font-semibold text-[#F59E0B]">{newLeads} new</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          <button onClick={() => setActiveTab('properties')} className={tabClass('properties')}>
            Properties ({properties.length})
          </button>
          <button onClick={() => setActiveTab('leads')} className={tabClass('leads')}>
            Leads ({leads.length})
          </button>
          <button onClick={editingId ? () => setActiveTab('form') : startAdd} className={tabClass('form')}>
            {editingId ? 'Edit Property' : 'Add Property'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E2CA5] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {properties.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-600">No properties yet. Add your first property!</p>
                      <Button
                        onClick={startAdd}
                        className="mt-4 bg-[#5E2CA5] hover:bg-[#5E2CA5]/90"
                      >
                        <PlusCircle className="mr-2 w-4 h-4" />
                        Add Property
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  properties.map((property) => (
                    <Card key={property.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                            <p className="text-gray-600 mb-2">{property.location}</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                              <span>Price: KSh {property.price}</span>
                              <span>Size: {property.size}</span>
                              <span className={`font-semibold ${
                                property.status === 'Available' ? 'text-[#2DB34A]' : 'text-gray-500'
                              }`}>
                                {property.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(property)}
                            >
                              Mark {property.status === 'Available' ? 'Sold' : 'Available'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Edit property"
                              onClick={() => startEdit(property)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              aria-label="Delete property"
                              onClick={() => handleDeleteProperty(property.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div className="space-y-4">
                {leads.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-600">No leads yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  leads.map((lead) => (
                    <Card key={lead.id}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{lead.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <a
                              href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}
                              className="font-medium text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
                            >
                              <Phone className="w-4 h-4" />
                              {lead.phone}
                            </a>
                          </div>
                          {lead.email && (
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <a href={`mailto:${lead.email}`} className="font-medium text-[#1E3A8A] hover:underline">
                                {lead.email}
                              </a>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                              {new Date(lead.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {lead.preferredLocation && (
                            <div>
                              <p className="text-sm text-gray-500">Preferred Location</p>
                              <p className="font-medium">{lead.preferredLocation}</p>
                            </div>
                          )}
                          {lead.propertyTitle && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Property Interest</p>
                              <p className="font-medium">{lead.propertyTitle}</p>
                            </div>
                          )}
                          {lead.message && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Message</p>
                              <p className="text-gray-700 whitespace-pre-line">{lead.message}</p>
                            </div>
                          )}
                          <div className="md:col-span-2 flex items-center justify-between gap-4 border-t pt-4">
                            <label className="flex items-center gap-2 text-sm text-gray-500">
                              Status
                              <select
                                value={lead.status ?? 'New'}
                                onChange={(e) => handleLeadStatus(lead.id, e.target.value as LeadStatus)}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-[#5E2CA5]"
                              >
                                {leadStatuses.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </label>
                            <Button
                              variant="destructive"
                              size="sm"
                              aria-label="Delete lead"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Add / Edit Property Tab */}
            {activeTab === 'form' && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingId ? 'Edit Property' : 'Add New Property'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProperty} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="property-title" className="block text-sm font-medium mb-2">Property Title</label>
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
                        <label htmlFor="property-location" className="block text-sm font-medium mb-2">Location</label>
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
                        <label htmlFor="property-price" className="block text-sm font-medium mb-2">Price (KSh)</label>
                        <input
                          id="property-price"
                          type="text"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className={inputClass}
                          placeholder="e.g., 1,500,000"
                        />
                      </div>

                      <div>
                        <label htmlFor="property-size" className="block text-sm font-medium mb-2">Size</label>
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
                        <label htmlFor="property-status" className="block text-sm font-medium mb-2">Status</label>
                        <select
                          id="property-status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                          className={inputClass}
                        >
                          <option value="Available">Available</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="property-description" className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        id="property-description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClass} resize-none`}
                        placeholder="Describe the property..."
                      />
                    </div>

                    <div>
                      <p className="block text-sm font-medium mb-2">Photos</p>
                      <div className="space-y-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {img.trim() && (
                              <img
                                src={img}
                                alt=""
                                className="h-10 w-14 shrink-0 rounded object-cover bg-gray-100"
                              />
                            )}
                            <input
                              type="text"
                              aria-label={`Image link ${index + 1}`}
                              value={img}
                              onChange={(e) => updateListItem('images', index, e.target.value)}
                              className={inputClass}
                              placeholder="Upload a photo or paste an image link"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              aria-label="Remove image"
                              onClick={() => removeListItem('images', index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <input
                          ref={fileInput}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleUploadImages(e.target.files)}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploading}
                            onClick={() => fileInput.current?.click()}
                          >
                            <Upload className="mr-2 w-4 h-4" />
                            {uploading ? 'Uploading...' : 'Upload Photos'}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => addListItem('images')}>
                            <PlusCircle className="mr-2 w-4 h-4" />
                            Add Image Link
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">The first photo is used as the cover.</p>
                      </div>
                    </div>

                    <div>
                      <p className="block text-sm font-medium mb-2">Features</p>
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              aria-label={`Feature ${index + 1}`}
                              value={feature}
                              onChange={(e) => updateListItem('features', index, e.target.value)}
                              className={inputClass}
                              placeholder="e.g., Clear Title Deed"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              aria-label="Remove feature"
                              onClick={() => removeListItem('features', index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addListItem('features')}>
                          <PlusCircle className="mr-2 w-4 h-4" />
                          Add Feature
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="submit"
                        disabled={saving || uploading}
                        className="flex-1 bg-[#5E2CA5] hover:bg-[#5E2CA5]/90 text-lg h-12"
                      >
                        {editingId ? (
                          <Edit className="mr-2 w-5 h-5" />
                        ) : (
                          <PlusCircle className="mr-2 w-5 h-5" />
                        )}
                        {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Property'}
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12"
                          onClick={() => {
                            resetForm();
                            setActiveTab('properties');
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

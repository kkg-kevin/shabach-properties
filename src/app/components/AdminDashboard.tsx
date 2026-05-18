import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Users, Home as HomeIcon, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { propertyAPI, leadAPI } from '../../utils/api';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'leads' | 'add'>('properties');
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    size: '',
    description: '',
    status: 'Available',
    images: [''],
    features: [''],
  });

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
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await propertyAPI.create({
        ...formData,
        images: formData.images.filter(img => img.trim()),
        features: formData.features.filter(f => f.trim()),
      });
      toast.success('Property added successfully!');
      setFormData({
        title: '',
        location: '',
        price: '',
        size: '',
        description: '',
        status: 'Available',
        images: [''],
        features: [''],
      });
      loadData();
      setActiveTab('properties');
    } catch (error) {
      console.error('Failed to add property:', error);
      toast.error('Failed to add property');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    }
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#5E2CA5] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
              <p className="text-purple-200">Manage properties and leads</p>
            </div>
            <Button variant="outline" onClick={onBack} className="bg-white text-[#5E2CA5] hover:bg-gray-100">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Site
            </Button>
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
                <p className="text-3xl font-bold">{leads.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'properties'
                ? 'border-b-2 border-[#5E2CA5] text-[#5E2CA5]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'leads'
                ? 'border-b-2 border-[#5E2CA5] text-[#5E2CA5]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'add'
                ? 'border-b-2 border-[#5E2CA5] text-[#5E2CA5]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add Property
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
                        onClick={() => setActiveTab('add')}
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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                            <p className="text-gray-600 mb-2">{property.location}</p>
                            <div className="flex gap-6 text-sm text-gray-600">
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
                              onClick={() => toast.info('Edit functionality coming soon')}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
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
                            <p className="font-medium">{lead.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{lead.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                              {new Date(lead.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {lead.propertyTitle && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Property Interest</p>
                              <p className="font-medium">{lead.propertyTitle}</p>
                            </div>
                          )}
                          {lead.message && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Message</p>
                              <p className="text-gray-700">{lead.message}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Add Property Tab */}
            {activeTab === 'add' && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProperty} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Property Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                          placeholder="e.g., Prime Land in Kitengela"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <input
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                          placeholder="e.g., Kitengela, Kajiado"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Price (KSh)</label>
                        <input
                          type="text"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                          placeholder="e.g., 1,500,000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Size</label>
                        <input
                          type="text"
                          required
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                          placeholder="e.g., 50x100 (1/8 Acre)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                        >
                          <option value="Available">Available</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none resize-none"
                        placeholder="Describe the property..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Image URLs</label>
                      <div className="space-y-2">
                        {formData.images.map((img, index) => (
                          <input
                            key={index}
                            type="url"
                            value={img}
                            onChange={(e) => updateImage(index, e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                            placeholder="https://example.com/image.jpg"
                          />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                          <PlusCircle className="mr-2 w-4 h-4" />
                          Add Image URL
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Features</label>
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <input
                            key={index}
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                            placeholder="e.g., Clear Title Deed"
                          />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addFeatureField}>
                          <PlusCircle className="mr-2 w-4 h-4" />
                          Add Feature
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#5E2CA5] hover:bg-[#5E2CA5]/90 text-lg h-12"
                    >
                      <PlusCircle className="mr-2 w-5 h-5" />
                      Add Property
                    </Button>
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

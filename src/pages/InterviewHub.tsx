import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  title: string;
  url: string;
  stream: string;
  created_at: string;
  added_by: string | null;
}

const STREAMS = [
  'Data Science',
  'Data Analytics', 
  'Power BI',
  'Excel',
  'SQL',
  'AI/ML',
  'Python',
  'JavaScript',
  'React',
  'Other'
];

export default function InterviewHub() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStream, setSelectedStream] = useState<string>('All');
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    stream: ''
  });

  useEffect(() => {
    initializeAuth();
    fetchResources();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (selectedStream === 'All') {
      setFilteredResources(resources);
    } else {
      setFilteredResources(resources.filter(resource => resource.stream === selectedStream));
    }
  }, [resources, selectedStream]);

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        setUserId(data.user?.id || null);
      } else {
        setUserId(session.user?.id || null);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Failed to initialize authentication');
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interview_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('interview_resources_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interview_resources'
        },
        (payload) => {
          setResources(prev => [payload.new as Resource, ...prev]);
          toast({
            title: "New resource added!",
            description: "A new interview resource has been added by another user.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.stream) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('interview_resources')
        .insert([
          {
            title: formData.title,
            url: formData.url,
            stream: formData.stream,
            added_by: userId
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Resource added successfully.",
      });

      setFormData({ title: '', url: '', stream: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error adding resource:', err);
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openResource = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Interview Resource Hub</h1>
            <div className="text-sm text-muted-foreground">
              User ID: {userId ? userId.substring(0, 8) + '...' : 'Loading...'}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Add Resource Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add New Resource'}
          </Button>

          {/* Add Resource Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Interview Resource</CardTitle>
                <CardDescription>
                  Share a helpful interview resource with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Top 50 SQL Interview Questions"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/resource"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stream">Stream / Category</Label>
                    <Select 
                      value={formData.stream} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, stream: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {STREAMS.map(stream => (
                          <SelectItem key={stream} value={stream}>
                            {stream}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Resource'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <Label htmlFor="filter">Filter by Stream:</Label>
            <Select value={selectedStream} onValueChange={setSelectedStream}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Streams</SelectItem>
                {STREAMS.map(stream => (
                  <SelectItem key={stream} value={stream}>
                    {stream}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resources Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Loading resources...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-lg text-destructive mb-4">{error}</div>
            <Button onClick={fetchResources}>Try Again</Button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground mb-4">
              {selectedStream === 'All' 
                ? "No resources added yet. Add your first one!" 
                : `No resources found for ${selectedStream}. Try a different filter or add a new resource.`}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>
                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                      {resource.stream}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground break-all">
                      {truncateUrl(resource.url)}
                    </div>
                    <Button 
                      onClick={() => openResource(resource.url)}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
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
            description: "A new learning resource has been added by another user.",
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
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b bg-gradient-card backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              📚 The Resources
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">Your comprehensive collection of learning materials and study resources</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Add Resource Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowForm(!showForm)}
              size="lg"
              className="bg-gradient-primary hover:bg-gradient-secondary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              {showForm ? 'Cancel' : 'Add New Resource'}
            </Button>
          </div>

          {/* Add Resource Form */}
          {showForm && (
            <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-gradient-card backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">Add New Resource</CardTitle>
                <CardDescription className="text-base">
                  Share a helpful learning resource with the community
                </CardDescription>
                <div className="mt-4 p-3 bg-gradient-accent/20 rounded-lg border border-accent/30">
                  <p className="text-sm text-accent-foreground font-medium">
                    💡 <strong>Tip:</strong> If adding similar resources, use numbering like "Data Analytics-1", then "Data Analytics-2", etc.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Top 50 SQL Interview Questions"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="h-12 border-2 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-medium">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/resource"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="h-12 border-2 focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream" className="text-sm font-medium">Stream / Category</Label>
                    <Select 
                      value={formData.stream} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, stream: value }))}
                      required
                    >
                      <SelectTrigger className="h-12 border-2 focus:border-primary transition-colors">
                        <SelectValue placeholder="Select a stream" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover backdrop-blur-sm border-2 shadow-xl z-50">
                        {STREAMS.map(stream => (
                          <SelectItem key={stream} value={stream} className="cursor-pointer hover:bg-accent">
                            {stream}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    size="lg"
                    className="w-full bg-gradient-primary hover:bg-gradient-secondary shadow-lg hover:shadow-xl transition-all duration-300 text-white border-0"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Resource'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-gradient-card backdrop-blur-sm rounded-xl border border-primary/20">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <Label htmlFor="filter" className="text-sm font-medium whitespace-nowrap">Filter by Stream:</Label>
            </div>
            <Select value={selectedStream} onValueChange={setSelectedStream}>
              <SelectTrigger className="w-64 h-11 border-2 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover backdrop-blur-sm border-2 shadow-xl z-50">
                <SelectItem value="All" className="cursor-pointer hover:bg-accent">
                  🌟 All Streams
                </SelectItem>
                {STREAMS.map(stream => (
                  <SelectItem key={stream} value={stream} className="cursor-pointer hover:bg-accent">
                    {stream}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resources Display */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 text-lg text-muted-foreground">
              <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              Loading your resources...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-xl text-destructive mb-6 font-medium">{error}</div>
              <Button 
                onClick={fetchResources}
                size="lg"
                variant="outline"
                className="border-2 hover:bg-accent transition-colors"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl text-muted-foreground mb-6 font-medium">
                {selectedStream === 'All' 
                  ? "No resources added yet. Start building your collection!" 
                  : `No resources found for ${selectedStream}. Try a different filter or add a new resource.`}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <Card 
                key={resource.id} 
                className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-primary/20 bg-gradient-card backdrop-blur-sm overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {resource.title}
                  </CardTitle>
                  <CardDescription>
                    <span className="inline-block bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                      {resource.stream}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground break-all bg-muted/20 p-3 rounded-lg">
                      {truncateUrl(resource.url)}
                    </div>
                    <Button 
                      onClick={() => openResource(resource.url)}
                      className="w-full bg-gradient-primary hover:bg-gradient-secondary shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 text-white border-0"
                      size="lg"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Resource
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
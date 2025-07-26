-- Create interview_resources table
CREATE TABLE public.interview_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  stream TEXT NOT NULL,
  added_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.interview_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view resources" 
ON public.interview_resources 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can add resources" 
ON public.interview_resources 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime
ALTER TABLE public.interview_resources REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_resources;
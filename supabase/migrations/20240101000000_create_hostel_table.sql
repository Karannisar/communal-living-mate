-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles if not exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'hostel', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the hostels table
CREATE TABLE IF NOT EXISTS public.hostels (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    location_tier TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT,
    commission_rate DECIMAL(5,2) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.hostels
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.hostels
    FOR INSERT WITH CHECK (
        auth.uid() = id AND 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'hostel'
        )
    );

CREATE POLICY "Enable update for hostel owners" ON public.hostels
    FOR UPDATE USING (
        auth.uid() = id AND 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'hostel'
        )
    );

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.hostels
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create function to verify user role and email
CREATE OR REPLACE FUNCTION verify_hostel_user()
RETURNS TRIGGER AS $$
BEGIN
    -- The role and email checks are now handled by RLS policies
    -- This trigger just ensures the record can be created
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to verify user role and email
CREATE TRIGGER verify_hostel_user_trigger
    BEFORE INSERT OR UPDATE ON public.hostels
    FOR EACH ROW
    EXECUTE FUNCTION verify_hostel_user();

-- Create custom function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT raw_user_meta_data->>'role'
        FROM auth.users
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql; 
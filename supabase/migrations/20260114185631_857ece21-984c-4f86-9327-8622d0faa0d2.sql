-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('male', 'female');

-- Create enum for relationship status
CREATE TYPE public.relationship_status AS ENUM ('single', 'divorced', 'widowed', 'complicated');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp_phone TEXT NOT NULL,
  gender gender_type NOT NULL,
  profile_picture_url TEXT,
  about TEXT,
  interests TEXT[],
  wishlist TEXT,
  relationship_status relationship_status DEFAULT 'single',
  show_profile_to_match BOOLEAN DEFAULT true,
  payment_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  male_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  female_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_instant_match BOOLEAN DEFAULT false
);

-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy for viewing matched profiles (only if show_profile_to_match is true or user is admin)
CREATE POLICY "Users can view matched profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.is_admin() OR
  (show_profile_to_match = true AND (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE (male_user_id = auth.uid() AND female_user_id = profiles.user_id)
         OR (female_user_id = auth.uid() AND male_user_id = profiles.user_id)
    )
  ))
);

-- User roles policies
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin());

-- Matches policies
CREATE POLICY "Users can view their own matches"
ON public.matches FOR SELECT
TO authenticated
USING (male_user_id = auth.uid() OR female_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage matches"
ON public.matches FOR ALL
TO authenticated
USING (public.is_admin());

-- Sponsors policies (public read, admin write)
CREATE POLICY "Anyone can view active sponsors"
ON public.sponsors FOR SELECT
TO authenticated
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage sponsors"
ON public.sponsors FOR ALL
TO authenticated
USING (public.is_admin());

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, whatsapp_phone, gender)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'whatsapp_phone',
    (NEW.raw_user_meta_data ->> 'gender')::gender_type
  );
  
  -- Assign user role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
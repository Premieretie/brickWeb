-- BrickQuote Pro Supabase initial schema
-- Run this in the Supabase SQL Editor or via the Supabase CLI.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'contractor', 'admin')),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own_or_admin"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "profiles_update_own_or_admin"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "profiles_insert_admin"
    ON public.profiles
    FOR INSERT
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "profiles_delete_admin"
    ON public.profiles
    FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Contractors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    abn TEXT,
    contact_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    slug TEXT UNIQUE,
    subscription_plan TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'premium')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contractors_public_read_active"
    ON public.contractors
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "contractors_owner_read"
    ON public.contractors
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "contractors_admin_all"
    ON public.contractors
    FOR ALL
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "contractors_insert_own_or_admin"
    ON public.contractors
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "contractors_update_own_or_admin"
    ON public.contractors
    FOR UPDATE
    USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "contractors_delete_admin"
    ON public.contractors
    FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Quotes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_type TEXT,
    material TEXT,
    length NUMERIC,
    height NUMERIC,
    columns INTEGER,
    mailbox BOOLEAN DEFAULT FALSE,
    estimate NUMERIC,
    quote_data_json JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotes_select_own_or_admin"
    ON public.quotes
    FOR SELECT
    USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "quotes_insert_own"
    ON public.quotes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quotes_update_own_or_admin"
    ON public.quotes
    FOR UPDATE
    USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "quotes_delete_own_or_admin"
    ON public.quotes
    FOR DELETE
    USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Leads
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    contractor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'quoted', 'won', 'lost')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    suburb TEXT,
    project_type TEXT,
    estimate NUMERIC,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select_customer_contractor_admin"
    ON public.leads
    FOR SELECT
    USING (
        auth.uid() = customer_id
        OR auth.uid() = contractor_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "leads_insert_customer"
    ON public.leads
    FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "leads_update_customer_contractor_admin"
    ON public.leads
    FOR UPDATE
    USING (
        auth.uid() = customer_id
        OR auth.uid() = contractor_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "leads_delete_admin"
    ON public.leads
    FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Subscriptions (foundation for Stripe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'premium')),
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own_or_admin"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "subscriptions_insert_own_or_admin"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "subscriptions_update_own_or_admin"
    ON public.subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "subscriptions_delete_admin"
    ON public.subscriptions
    FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Service Areas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    suburb TEXT NOT NULL,
    postcode TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_areas_public_read"
    ON public.service_areas
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.contractors WHERE user_id = contractor_id AND is_active = TRUE));

CREATE POLICY "service_areas_manage_own_or_admin"
    ON public.service_areas
    FOR ALL
    USING (auth.uid() = contractor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Gallery Images
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_images_public_read"
    ON public.gallery_images
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.contractors WHERE user_id = contractor_id AND is_active = TRUE));

CREATE POLICY "gallery_images_manage_own_or_admin"
    ON public.gallery_images
    FOR ALL
    USING (auth.uid() = contractor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contractors_user_id ON public.contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_contractors_slug ON public.contractors(slug);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON public.leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_contractor_id ON public.leads(contractor_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_service_areas_suburb ON public.service_areas(suburb);
CREATE INDEX IF NOT EXISTS idx_service_areas_contractor_id ON public.service_areas(contractor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- ============================================================
-- Triggers: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Updated-at helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_contractors_updated_at
    BEFORE UPDATE ON public.contractors
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
    ('contractor-logos', 'contractor-logos', TRUE),
    ('contractor-gallery', 'contractor-gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "contractor_logos_public_select"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'contractor-logos');

CREATE POLICY "contractor_logos_owner_manage"
    ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'contractor-logos'
        AND auth.uid() = (storage.foldername(name))[1]::uuid
    )
    WITH CHECK (
        bucket_id = 'contractor-logos'
        AND auth.uid() = (storage.foldername(name))[1]::uuid
    );

CREATE POLICY "contractor_gallery_public_select"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'contractor-gallery');

CREATE POLICY "contractor_gallery_owner_manage"
    ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'contractor-gallery'
        AND auth.uid() = (storage.foldername(name))[1]::uuid
    )
    WITH CHECK (
        bucket_id = 'contractor-gallery'
        AND auth.uid() = (storage.foldername(name))[1]::uuid
    );

-- ============================================================
-- Admin seed helper
-- ============================================================
-- Use this to promote a user to admin after they sign up:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';

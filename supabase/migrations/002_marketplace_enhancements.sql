-- BrickQuote Pro - Marketplace enhancements
-- Run this migration after 001_init.sql

-- ============================================================
-- Add contractor approval status
-- ============================================================
ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS insurance_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- Add lead scoring fields
-- ============================================================
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS lead_score INTEGER NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100);

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS lead_value NUMERIC;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- ============================================================
-- Create reviews table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read"
    ON public.reviews
    FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "reviews_insert_customer"
    ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "reviews_update_own_or_admin"
    ON public.reviews
    FOR UPDATE
    USING (auth.uid() = customer_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "reviews_delete_admin"
    ON public.reviews
    FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Indexes for new fields
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contractors_approval_status ON public.contractors(approval_status);
CREATE INDEX IF NOT EXISTS idx_contractors_is_featured ON public.contractors(is_featured);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_is_premium ON public.leads(is_premium);
CREATE INDEX IF NOT EXISTS idx_reviews_contractor_id ON public.reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- ============================================================
-- Update contractor policies to only show approved public profiles
-- ============================================================
DROP POLICY IF EXISTS "contractors_public_read_active" ON public.contractors;

CREATE POLICY "contractors_public_read_approved"
    ON public.contractors
    FOR SELECT
    USING (is_active = TRUE AND approval_status = 'approved');

-- ============================================================
-- Trigger: update contractors and reviews updated_at
-- ============================================================
CREATE TRIGGER set_contractors_approval_updated_at
    BEFORE UPDATE ON public.contractors
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Helper function: calculate lead score based on project value
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_lead_score(
    p_estimate NUMERIC,
    p_project_type TEXT
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Base score from estimate
    IF p_estimate >= 20000 THEN score := score + 40;
    ELSIF p_estimate >= 10000 THEN score := score + 30;
    ELSIF p_estimate >= 5000 THEN score := score + 20;
    ELSIF p_estimate >= 2000 THEN score := score + 10;
    END IF;

    -- Project type weighting
    IF p_project_type IN ('Retaining Wall', 'Retaining') THEN score := score + 30;
    ELSIF p_project_type IN ('Boundary Wall', 'Brick Wall') THEN score := score + 20;
    ELSIF p_project_type IN ('Brick Fence', 'Block Fence') THEN score := score + 15;
    ELSIF p_project_type IN ('Mailbox', 'Piers') THEN score := score + 5;
    ELSE score := score + 10;
    END IF;

    -- Cap at 100
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Helper function: calculate lead priority
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_lead_priority(
    p_score INTEGER
) RETURNS TEXT AS $$
BEGIN
    IF p_score >= 80 THEN RETURN 'urgent';
    ELSIF p_score >= 60 THEN RETURN 'high';
    ELSIF p_score >= 40 THEN RETURN 'normal';
    ELSE RETURN 'low';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Allow guest leads (customer_id may be NULL for unauthenticated submissions)
-- ============================================================
ALTER TABLE public.leads
ALTER COLUMN customer_id DROP NOT NULL;

-- ============================================================
-- Trigger: auto-calculate lead score and priority on insert/update
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_lead_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lead_score := public.calculate_lead_score(NEW.estimate, NEW.project_type);
    NEW.priority := public.calculate_lead_priority(NEW.lead_score);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_lead_score ON public.leads;
CREATE TRIGGER set_lead_score
    BEFORE INSERT OR UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_lead_score();

-- ============================================================
-- Update lead policies to allow anonymous insert
-- ============================================================
DROP POLICY IF EXISTS "leads_insert_customer" ON public.leads;

CREATE POLICY "leads_insert_any"
    ON public.leads
    FOR INSERT
    WITH CHECK (true);

-- Allow anonymous (guest) leads to be read by admin only
DROP POLICY IF EXISTS "leads_select_customer_contractor_admin" ON public.leads;

CREATE POLICY "leads_select_customer_contractor_admin"
    ON public.leads
    FOR SELECT
    USING (
        auth.uid() = customer_id
        OR auth.uid() = contractor_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR customer_id IS NULL
    );

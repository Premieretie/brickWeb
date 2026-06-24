export type UserRole = 'customer' | 'contractor' | 'admin';

export type SubscriptionPlan = 'starter' | 'professional' | 'premium';

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

export type ContractorApprovalStatus = 'pending' | 'approved' | 'rejected';

export type LeadStatus = 'new' | 'assigned' | 'contacted' | 'quoted' | 'won' | 'lost';

export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  user_id: string;
  business_name: string;
  abn: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  slug: string | null;
  subscription_plan: SubscriptionPlan;
  approval_status: ContractorApprovalStatus;
  is_active: boolean;
  is_featured: boolean;
  insurance_verified: boolean;
  years_experience: number | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  project_type: string | null;
  material: string | null;
  length: number | null;
  height: number | null;
  columns: number | null;
  mailbox: boolean;
  estimate: number | null;
  quote_data_json: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  customer_id: string | null;
  quote_id: string | null;
  contractor_id: string | null;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  suburb: string | null;
  project_type: string | null;
  estimate: number | null;
  message: string | null;
  notes: string | null;
  lead_score: number;
  lead_value: number | null;
  is_premium: boolean;
  priority: LeadPriority;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  contractor_id: string;
  customer_id: string;
  lead_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceArea {
  id: string;
  contractor_id: string;
  suburb: string;
  postcode: string | null;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  contractor_id: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithDetails extends Lead {
  customer?: { first_name: string | null; last_name: string | null; email: string };
  contractor?: { business_name: string; slug: string | null };
  quote?: Quote;
}

export interface ContractorWithDetails extends Contractor {
  service_areas: ServiceArea[];
  gallery_images: GalleryImage[];
  reviews: Review[];
  average_rating?: number;
  review_count?: number;
}

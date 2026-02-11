// TypeScript types for multi-user role system

export type UserRole = 
  | 'guest'
  | 'registered'
  | 'verified'
  | 'dealer'
  | 'dealer_staff'
  | 'buyer'
  | 'inspector'
  | 'moderator'
  | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  reputation_score: number;
  is_verified: boolean;
  listing_count: number;
  parent_dealer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealerProfile {
  id: string;
  business_name: string;
  business_logo: string | null;
  business_description: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  website_url: string | null;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

export interface DealerStaff {
  id: string;
  staff_id: string;
  dealer_id: string;
  role: 'sales_agent' | 'manager';
  can_post_listings: boolean;
  can_manage_leads: boolean;
  can_edit_dealer_settings: boolean;
  can_access_billing: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyerPreferences {
  id: string;
  user_id: string;
  alert_makes: string[] | null;
  alert_models: string[] | null;
  alert_min_price: number | null;
  alert_max_price: number | null;
  alert_min_year: number | null;
  alert_max_year: number | null;
  alert_body_types: string[] | null;
  alert_fuel_types: string[] | null;
  email_alerts_enabled: boolean;
  push_alerts_enabled: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

export interface SavedListing {
  id: string;
  user_id: string;
  vehicle_id: string;
  notes: string | null;
  created_at: string;
}

export interface InspectorProfile {
  id: string;
  certification_number: string | null;
  certification_authority: string | null;
  specializations: string[] | null;
  years_experience: number | null;
  is_active: boolean;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  total_inspections: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleInspection {
  id: string;
  vehicle_id: string;
  inspector_id: string;
  inspection_date: string;
  overall_condition: string | null;
  mechanical_rating: number | null;
  exterior_rating: number | null;
  interior_rating: number | null;
  safety_rating: number | null;
  report_url: string | null;
  report_summary: string | null;
  issues_found: string[] | null;
  recommendations: string[] | null;
  estimated_repair_cost: number | null;
  is_verified: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PremiumUpgrade {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  upgrade_type: 'featured' | 'premium' | 'spotlight' | 'homepage_banner';
  price_paid: number | null;
  payment_reference: string | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with relationships
export interface DealerProfileWithStats extends DealerProfile {
  stats: {
    total_listings: number;
    total_sold: number;
    staff_count: number;
  };
}

export interface DealerStaffWithProfile extends DealerStaff {
  profile: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface SavedListingWithVehicle extends SavedListing {
  vehicle: any; // Vehicle type from existing types
}

export interface VehicleInspectionWithInspector extends VehicleInspection {
  inspector: {
    name: string;
    certification: string | null;
    total_inspections: number;
  };
}

// RPC function parameter types
export interface CreateDealerProfileParams {
  business_name: string;
  business_description?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  website_url?: string;
}

export interface UpdateDealerProfileParams extends Partial<CreateDealerProfileParams> {
  business_logo?: string;
}

export interface AddDealerStaffParams {
  staff_email: string;
  permissions?: {
    role?: 'sales_agent' | 'manager';
    can_post_listings?: boolean;
    can_manage_leads?: boolean;
    can_edit_dealer_settings?: boolean;
    can_access_billing?: boolean;
  };
}

export interface SetBuyerPreferencesParams {
  alert_makes?: string[];
  alert_models?: string[];
  alert_min_price?: number;
  alert_max_price?: number;
  alert_min_year?: number;
  alert_max_year?: number;
  alert_body_types?: string[];
  alert_fuel_types?: string[];
  email_alerts_enabled?: boolean;
  alert_frequency?: 'instant' | 'daily' | 'weekly';
}

export interface CreateInspectorProfileParams {
  certification_number?: string;
  certification_authority?: string;
  specializations?: string[];
  years_experience?: number;
}

export interface SubmitInspectionParams {
  vehicle_id: string;
  inspection_data: {
    overall_condition?: string;
    mechanical_rating?: number;
    exterior_rating?: number;
    interior_rating?: number;
    safety_rating?: number;
    report_summary?: string;
    issues_found?: string[];
    recommendations?: string[];
    estimated_repair_cost?: number;
    is_public?: boolean;
  };
}

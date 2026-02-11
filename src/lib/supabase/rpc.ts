import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VehicleInput {
  make: string
  model: string
  year: number
  trim?: string
  price: number
  mileage: number
  condition?: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'
  body_type?: string
  fuel_type?: string
  transmission?: string
  drivetrain?: string
  exterior_color?: string
  interior_color?: string
  vin?: string
  images?: string[]
  description?: string
  features?: string[]
  title_status?: 'Clean' | 'Salvage' | 'Rebuilt'
  accidents?: 'None' | 'Minor' | 'Moderate' | 'Major'
  contact_method?: string
  pricing_strategy?: string
  show_phone?: boolean
  status?: 'active' | 'pending' | 'sold' | 'archived'
  is_featured?: boolean
  is_premium?: boolean
}

export interface Vehicle extends VehicleInput {
  id: string
  seller_id: string
  status: 'active' | 'pending' | 'sold' | 'archived'
  is_featured: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
  seller?: {
    name: string
    is_verified?: boolean
  }
}

export interface SearchFilters {
  query?: string
  search_make?: string
  search_model?: string
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  search_condition?: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'
  body_type?: string
  fuel_type?: string
  transmission?: string
  drivetrain?: string
  min_mileage?: number
  max_mileage?: number
  is_premium?: boolean
  sort_by?: 'price' | 'year' | 'mileage' | 'created_at'
  sort_order?: 'asc' | 'desc'
  page_limit?: number
  page_offset?: number
}

export interface SearchResult {
  vehicles: Vehicle[]
  total: number
}

export interface SellerAnalytics {
  total_views: number
  new_leads: number
  inventory_value: number
  conversion_rate: number
  monthly_reach: number
  user_metrics: {
    response_time: number
    sales_velocity: number
  }
  market_benchmarks: {
    avg_response_time: number
    avg_sales_velocity: number
  }
}

export interface Message {
  id: string
  seller_id: string
  vehicle_id: string
  user_id: string
  message: string
  created_at: string
}

export interface UserVehicle {
  vehicle: Vehicle
  message_count: number
}

// ============================================================================
// VEHICLE RPC FUNCTIONS
// ============================================================================

/**
 * Create a new vehicle listing using RPC function
 * Bypasses TypeScript type errors and ensures validation
 */
export async function createVehicle(
  supabase: SupabaseClient,
  vehicleData: VehicleInput
): Promise<Vehicle> {
  console.log('🚗 Creating vehicle with data:', {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    price: vehicleData.price,
    mileage: vehicleData.mileage,
    imagesCount: vehicleData.images?.length || 0,
    featuresCount: vehicleData.features?.length || 0,
  })

  const { data, error } = await supabase.rpc('create_vehicle', {
    vehicle_data: vehicleData
  })

  if (error) {
    console.error('❌ Error creating vehicle:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw new Error(error.message || 'Failed to create vehicle')
  }

  console.log('✅ Vehicle created successfully:', data)
  return data as Vehicle
}

/**
 * Update an existing vehicle listing using RPC function
 */
export async function updateVehicle(
  supabase: SupabaseClient,
  vehicleId: string,
  vehicleData: Partial<VehicleInput>
): Promise<Vehicle> {
  console.log('🔄 Updating vehicle:', vehicleId, 'with data:', vehicleData)

  const { data, error } = await supabase.rpc('update_vehicle', {
    vehicle_id: vehicleId,
    vehicle_data: vehicleData
  })

  if (error) {
    console.error('❌ Error updating vehicle:', error)
    throw new Error(error.message || 'Failed to update vehicle')
  }

  console.log('✅ Vehicle updated successfully')
  return data as Vehicle
}

/**
 * Delete (archive) a vehicle listing using RPC function
 */
export async function deleteVehicle(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<boolean> {
  console.log('🗑️ Deleting vehicle:', vehicleId)

  const { data, error } = await supabase.rpc('delete_vehicle', {
    vehicle_id: vehicleId
  })

  if (error) {
    console.error('❌ Error deleting vehicle:', error)
    throw new Error(error.message || 'Failed to delete vehicle')
  }

  console.log('✅ Vehicle deleted successfully')
  return data as boolean
}

/**
 * Get all vehicles for a user using RPC function
 */
export async function getUserVehicles(
  supabase: SupabaseClient,
  userId?: string
): Promise<UserVehicle[]> {
  const { data, error } = await supabase.rpc('get_user_vehicles', {
    target_user_id: userId || null
  })

  if (error) {
    throw new Error(error.message || 'Failed to get user vehicles')
  }

  return (data || []) as UserVehicle[]
}

/**
 * Search vehicles with filters using RPC function
 */
export async function searchVehicles(
  supabase: SupabaseClient,
  filters: SearchFilters = {}
): Promise<SearchResult> {
  console.log('🔍 Searching vehicles with filters:', filters)

  const { data, error } = await supabase.rpc('search_vehicles', {
    p_query: filters.query || null,
    p_search_make: filters.search_make || null,
    p_search_model: filters.search_model || null,
    p_min_price: filters.min_price || null,
    p_max_price: filters.max_price || null,
    p_min_year: filters.min_year || null,
    p_max_year: filters.max_year || null,
    p_search_condition: filters.search_condition || null,
    p_body_type: filters.body_type || null,
    p_fuel_type: filters.fuel_type || null,
    p_transmission: filters.transmission || null,
    p_drivetrain: filters.drivetrain || null,
    p_min_mileage: filters.min_mileage || null,
    p_max_mileage: filters.max_mileage || null,
    p_is_premium: filters.is_premium ?? null,
    p_sort_by: filters.sort_by || 'created_at',
    p_sort_order: filters.sort_order || 'desc',
    p_page_limit: filters.page_limit || 20,
    p_page_offset: filters.page_offset || 0
  })

  if (error) {
    console.error('❌ Error searching vehicles:', error)
    throw new Error(error.message || 'Failed to search vehicles')
  }

  console.log(`✅ Found ${data?.total || 0} vehicles`)
  return data as SearchResult
}

// ============================================================================
// WATCHLIST RPC FUNCTIONS
// ============================================================================

/**
 * Add a vehicle to the user's watchlist
 */
export async function addToWatchlist(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('add_to_watchlist', {
    vehicle_id: vehicleId
  })

  if (error) {
    throw new Error(error.message || 'Failed to add to watchlist')
  }

  return data as boolean
}

/**
 * Remove a vehicle from the user's watchlist
 */
export async function removeFromWatchlist(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('remove_from_watchlist', {
    vehicle_id: vehicleId
  })

  if (error) {
    throw new Error(error.message || 'Failed to remove from watchlist')
  }

  return data as boolean
}

// ============================================================================
// MESSAGE RPC FUNCTIONS
// ============================================================================

/**
 * Send a message about a vehicle
 */
export async function sendMessage(
  supabase: SupabaseClient,
  vehicleId: string,
  messageText: string
): Promise<Message> {
  console.log('💬 Sending message for vehicle:', vehicleId)

  const { data, error } = await supabase.rpc('send_message', {
    vehicle_id: vehicleId,
    message_text: messageText
  })

  if (error) {
    console.error('❌ Error sending message:', error)
    throw new Error(error.message || 'Failed to send message')
  }

  console.log('✅ Message sent successfully')
  return data as Message
}

// ============================================================================
// UTILITY RPC FUNCTIONS
// ============================================================================

export interface MakeInfo {
  make: string
  vehicle_count: number
}

/**
 * Get list of makes that have active listings
 */
export async function getActiveMakes(
  supabase: SupabaseClient
): Promise<MakeInfo[]> {
  const { data, error } = await supabase.rpc('get_active_makes')

  if (error) {
    console.error('❌ Error getting active makes:', error)
    throw new Error(error.message || 'Failed to get active makes')
  }

  return (data || []) as MakeInfo[]
}

/**
 * Record a view for a vehicle
 */
export async function recordVehicleView(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<void> {
  const { error } = await supabase.rpc('record_vehicle_view', {
    p_vehicle_id: vehicleId
  })

  if (error) {
    console.error('❌ Error recording vehicle view:', error)
  }
}

/**
 * Record full engagement (views + impressions)
 */
export async function trackVehicleEngagement(
  supabase: SupabaseClient,
  vehicleId: string,
  sellerId: string
): Promise<void> {
  const { error } = await supabase.rpc('track_vehicle_engagement', {
    p_vehicle_id: vehicleId,
    p_seller_id: sellerId
  })

  if (error) {
    console.error('❌ Error tracking vehicle engagement:', error)
  }
}

/**
 * Get trending makes based on actual view data
 */
export async function getTrendingMakes(
  supabase: SupabaseClient,
  limit: number = 5
): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_trending_makes', {
    p_limit: limit
  })

  if (error) {
    console.error('❌ Error getting trending makes:', error)
    return []
  }

  return (data || []) as string[]
}

export interface SearchSuggestions {
  makes: string[]
  models: string[]
  listings: string[]
}

/**
 * Get real-time search suggestions
 */
export async function getSearchSuggestions(
  supabase: SupabaseClient,
  query: string
): Promise<SearchSuggestions> {
  const { data, error } = await supabase.rpc('get_search_suggestions', {
    p_query: query
  })

  if (error) {
    console.error('❌ Error getting search suggestions:', error)
    return { makes: [], models: [], listings: [] }
  }

  return data as SearchSuggestions
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  category: string
  author_name?: string
  author_avatar?: string
  read_time_minutes: number
  created_at: string
}

/**
 * Get the latest editorial articles
 */
export async function getLatestArticles(
  supabase: SupabaseClient,
  limit: number = 6,
  category: string | null = null
): Promise<Article[]> {
  const { data, error } = await supabase.rpc('get_latest_articles', {
    p_limit: limit,
    p_category: category
  })

  if (error) {
    console.error('❌ Error getting latest articles:', error.message || error)
    return []
  }

  return (data || []) as Article[]
}

export interface SellerLead {
  id: string
  message: string
  status: 'new' | 'contacted' | 'negotiating' | 'sold' | 'lost'
  created_at: string
  dealer_notes?: string
  buyer: {
    id: string
    name: string
    email: string
    phone?: string
  }
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    price: number
    image?: string
  }
}

/**
 * Get leads (inquiries) for a seller's listings
 */
export async function getSellerLeads(
  supabase: SupabaseClient,
  sellerId: string
): Promise<SellerLead[]> {
  const { data, error } = await supabase.rpc('get_seller_leads', {
    p_seller_id: sellerId
  })

  if (error) {
    console.error('❌ Error getting seller leads:', error)
    return []
  }

  return (data || []) as SellerLead[]
}

/**
 * Record an impression for a seller profile
 */
export async function trackProfileImpression(
  supabase: SupabaseClient,
  sellerId: string,
  viewerId?: string
): Promise<void> {
  const { error } = await supabase.rpc('track_profile_impression', {
    p_seller_id: sellerId,
    p_viewer_id: viewerId
  })

  if (error) {
    console.error('❌ Error tracking profile impression:', error)
  }
}

export interface HighPotentialAsset {
  id: string
  make: string
  model: string
  year: number
  price: number
  image?: string
  total_views: number
  lead_count: number
  interest_score: number
}

/**
 * Get high-potential assets for a seller
 */
export async function getHighPotentialAssets(
  supabase: SupabaseClient,
  sellerId: string,
  limit: number = 4
): Promise<HighPotentialAsset[]> {
  const { data, error } = await supabase.rpc('get_high_potential_assets', {
    p_seller_id: sellerId,
    p_limit: limit
  })

  if (error) {
    console.error('❌ Error getting high-potential assets:', error)
    return []
  }

  return (data || []) as HighPotentialAsset[]
}

// ============================================================================
// LISTING LIMIT RPC FUNCTIONS
// ============================================================================

/**
 * Check if the current user can create a listing
 */
export async function canCreateListing(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_create_listing')
  if (error) throw error
  return data
}

/**
 * Get user's listing count
 */
export async function getUserListingCount(supabase: SupabaseClient, userId?: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_user_listing_count', { p_user_id: userId })
  if (error) throw error
  return data
}

/**
 * Get user's listing limit
 */
export async function getUserListingLimit(supabase: SupabaseClient, userId?: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_user_listing_limit', { p_user_id: userId })
  if (error) throw error
  return data
}

/**
 * Save a vehicle to watchlist
 */
export async function saveListing(supabase: SupabaseClient, vehicleId: string, notes?: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('save_listing', {
    p_vehicle_id: vehicleId,
    p_notes: notes
  })
  if (error) throw error
  return data
}

/**
 * Remove a vehicle from watchlist
 */
export async function unsaveListing(supabase: SupabaseClient, vehicleId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('unsave_listing', {
    p_vehicle_id: vehicleId
  })
  if (error) throw error
  return data
}

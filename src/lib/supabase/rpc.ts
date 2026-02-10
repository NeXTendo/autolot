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
}

export interface Vehicle extends VehicleInput {
  id: string
  seller_id: string
  status: 'active' | 'pending' | 'sold' | 'archived'
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  search_make?: string
  search_model?: string
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  search_condition?: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'
  page_limit?: number
  page_offset?: number
}

export interface SearchResult {
  vehicles: Vehicle[]
  total: number
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
    vehicle_data: vehicleData as any
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
    vehicle_data: vehicleData as any
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
): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_user_vehicles', {
    target_user_id: userId || null
  })

  if (error) {
    throw new Error(error.message || 'Failed to get user vehicles')
  }

  return data as any[]
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
    search_make: filters.search_make || null,
    search_model: filters.search_model || null,
    min_price: filters.min_price || null,
    max_price: filters.max_price || null,
    min_year: filters.min_year || null,
    max_year: filters.max_year || null,
    search_condition: filters.search_condition || null,
    page_limit: filters.page_limit || 20,
    page_offset: filters.page_offset || 0
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
): Promise<any> {
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
  return data
}

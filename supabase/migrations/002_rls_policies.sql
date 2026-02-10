-- Migration: RLS Policies for Platinum Auto
-- Description: Comprehensive Row Level Security policies for all tables

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Anyone can view public profile information
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VEHICLES TABLE POLICIES
-- ============================================================================

-- Anyone can view active vehicle listings
CREATE POLICY "vehicles_select_all"
ON public.vehicles
FOR SELECT
USING (status = 'active' OR auth.uid() = seller_id);

-- Authenticated users can create vehicle listings
CREATE POLICY "vehicles_insert_own"
ON public.vehicles
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own vehicle listings
CREATE POLICY "vehicles_update_own"
ON public.vehicles
FOR UPDATE
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete (archive) their own vehicle listings
CREATE POLICY "vehicles_delete_own"
ON public.vehicles
FOR DELETE
USING (auth.uid() = seller_id);

-- Admins and moderators have full access to all vehicles
CREATE POLICY "vehicles_admin_all"
ON public.vehicles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages they sent or received
CREATE POLICY "messages_select_own"
ON public.messages
FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() = seller_id
);

-- Authenticated users can send messages
CREATE POLICY "messages_insert_auth"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Sellers can update dealer notes on their messages
CREATE POLICY "messages_update_seller"
ON public.messages
FOR UPDATE
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- ============================================================================
-- CAR STORIES TABLE POLICIES
-- ============================================================================

-- Anyone can view published car stories
CREATE POLICY "car_stories_select_published"
ON public.car_stories
FOR SELECT
USING (status = 'published' OR auth.uid() = user_id);

-- Authenticated users can create car stories
CREATE POLICY "car_stories_insert_own"
ON public.car_stories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own car stories
CREATE POLICY "car_stories_update_own"
ON public.car_stories
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own car stories
CREATE POLICY "car_stories_delete_own"
ON public.car_stories
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- WATCHLISTS TABLE POLICIES
-- ============================================================================

-- Users can only view their own watchlist
CREATE POLICY "watchlists_select_own"
ON public.watchlists
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add vehicles to their own watchlist
CREATE POLICY "watchlists_insert_own"
ON public.watchlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove vehicles from their own watchlist
CREATE POLICY "watchlists_delete_own"
ON public.watchlists
FOR DELETE
USING (auth.uid() = user_id);

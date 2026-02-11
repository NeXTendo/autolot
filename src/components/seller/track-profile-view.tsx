"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { trackProfileImpression } from "@/lib/supabase/rpc"

interface TrackProfileViewProps {
  sellerId: string
}

export function TrackProfileView({ sellerId }: TrackProfileViewProps) {
  const supabase = createClient()

  useEffect(() => {
    const recordView = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Don't track if viewing own profile
      if (user?.id === sellerId) return

      await trackProfileImpression(supabase, sellerId, user?.id)
    }

    recordView()
  }, [sellerId, supabase])

  return null
}

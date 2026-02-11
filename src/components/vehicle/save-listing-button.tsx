"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { saveListing, unsaveListing } from "@/lib/supabase/rpc"
import { cn } from "@/lib/utils"

interface SaveListingButtonProps {
  vehicleId: string
  initialIsSaved?: boolean
  variant?: "default" | "outline" | "ghost" | "icon"
  className?: string
}

export function SaveListingButton({ 
  vehicleId, 
  initialIsSaved = false,
  variant = "outline",
  className
}: SaveListingButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Check initial status if not provided or to sync
  useEffect(() => {
    async function checkStatus() {
      // In a real app we might check this via an RPC or query
      // For now we rely on passed prop or user interaction state
      // But we could implement checksavedStatus RPC if needed
    }
    checkStatus()
  }, [])

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save listings.",
          variant: "destructive"
        })
        return
      }

      if (isSaved) {
        await unsaveListing(supabase, vehicleId)
        setIsSaved(false)
        toast({
          title: "Removed from watchlist",
          description: "This vehicle has been removed from your saved listings."
        })
      } else {
        await saveListing(supabase, vehicleId)
        setIsSaved(true)
        toast({
          title: "Saved to watchlist",
          description: "This vehicle has been added to your saved listings."
        })
      }
    } catch (error) {
      console.error("Error toggling save:", error)
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant === "icon" ? "ghost" : variant}
      size={variant === "icon" ? "icon" : "default"}
      className={cn(
        "gap-2", 
        isSaved && "text-red-500 hover:text-red-600",
        className
      )}
      onClick={toggleSave}
      disabled={loading}
    >
      <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
      {variant !== "icon" && (isSaved ? "Saved" : "Save to Watchlist")}
    </Button>
  )
}

"use client"

import { Shield, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DealerBadgeProps {
  isVerified: boolean
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function DealerBadge({ 
  isVerified, 
  className, 
  showText = true,
  size = "md" 
}: DealerBadgeProps) {
  if (!isVerified) return null

  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-0.5",
    md: "text-sm gap-1.5 px-2.5 py-1",
    lg: "text-base gap-2 px-3 py-1.5"
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full font-black uppercase tracking-widest",
        "bg-gradient-to-r from-platinum/20 to-platinum/10 border border-platinum/30",
        "text-platinum",
        sizeClasses[size],
        className
      )}
      title="Verified Dealer"
    >
      <Shield size={iconSizes[size]} className="fill-platinum" />
      {showText && <span>Verified Dealer</span>}
    </div>
  )
}

interface SimpleDealerBadgeProps {
  className?: string
}

export function SimpleDealerBadge({ className }: SimpleDealerBadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 text-platinum",
        className
      )}
      title="Verified Dealer"
    >
      <CheckCircle2 size={14} className="fill-platinum text-[#0a0a0a]" />
      <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
    </div>
  )
}

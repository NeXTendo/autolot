"use client"

import { ShieldCheck, FileCheck, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { VehicleInspectionWithInspector } from "@/lib/types/roles"

interface InspectionBadgeProps {
  inspection: VehicleInspectionWithInspector | null
  className?: string
  size?: "sm" | "md" | "lg"
}

export function InspectionBadge({ 
  inspection, 
  className,
  size = "md" 
}: InspectionBadgeProps) {
  if (!inspection || !inspection.is_verified) return null

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

  const avgRating = inspection.mechanical_rating && inspection.exterior_rating && inspection.interior_rating
    ? Math.round((inspection.mechanical_rating + inspection.exterior_rating + inspection.interior_rating) / 3)
    : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className={cn(
            "inline-flex items-center rounded-full font-black uppercase tracking-widest",
            "bg-gradient-to-r from-green-500/20 to-green-400/10 border border-green-500/30",
            "text-green-400 hover:bg-green-500/30 transition-colors",
            sizeClasses[size],
            className
          )}
        >
          <ShieldCheck size={iconSizes[size]} className="fill-green-400" />
          <span>Inspected</span>
          {avgRating && <span className="ml-1">({avgRating}/10)</span>}
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] bg-[#0a0a0a] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <FileCheck className="text-green-400" />
            Professional Inspection Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Inspector Info */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
              Inspected By
            </div>
            <div className="text-sm font-bold text-white">{inspection.inspector.name}</div>
            {inspection.inspector.certification && (
              <div className="text-xs text-white/60 mt-1">
                Cert: {inspection.inspector.certification}
              </div>
            )}
            <div className="text-xs text-white/40 mt-1">
              {inspection.inspector.total_inspections} total inspections
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-3 gap-4">
            {inspection.mechanical_rating && (
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-white">{inspection.mechanical_rating}/10</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">
                  Mechanical
                </div>
              </div>
            )}
            {inspection.exterior_rating && (
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-white">{inspection.exterior_rating}/10</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">
                  Exterior
                </div>
              </div>
            )}
            {inspection.interior_rating && (
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-white">{inspection.interior_rating}/10</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">
                  Interior
                </div>
              </div>
            )}
          </div>

          {/* Overall Condition */}
          {inspection.overall_condition && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                Overall Condition
              </div>
              <div className="text-sm text-white/80">{inspection.overall_condition}</div>
            </div>
          )}

          {/* Summary */}
          {inspection.report_summary && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                Summary
              </div>
              <div className="text-sm text-white/80 leading-relaxed">
                {inspection.report_summary}
              </div>
            </div>
          )}

          {/* Issues Found */}
          {inspection.issues_found && inspection.issues_found.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                Issues Found
              </div>
              <ul className="space-y-1">
                {inspection.issues_found.map((issue, idx) => (
                  <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {inspection.recommendations && inspection.recommendations.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                Recommendations
              </div>
              <ul className="space-y-1">
                {inspection.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Repair Cost Estimate */}
          {inspection.estimated_repair_cost && (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1">
                Estimated Repair Cost
              </div>
              <div className="text-xl font-black text-yellow-400">
                ${inspection.estimated_repair_cost.toLocaleString()}
              </div>
            </div>
          )}

          {/* Full Report Link */}
          {inspection.report_url && (
            <Button 
              variant="outline" 
              className="w-full gap-2 border-platinum/20 text-platinum hover:bg-platinum/10"
              asChild
            >
              <a href={inspection.report_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
                View Full Inspection Report
              </a>
            </Button>
          )}

          {/* Inspection Date */}
          <div className="text-center text-xs text-white/40">
            Inspected on {new Date(inspection.inspection_date).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

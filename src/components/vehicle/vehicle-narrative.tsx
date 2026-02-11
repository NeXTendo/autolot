"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface VehicleNarrativeProps {
  description: string
}

export function VehicleNarrative({ description }: VehicleNarrativeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card className="animate-fade-up overflow-hidden">
      <CardContent className="p-0">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-black/5 transition-colors text-left"
        >
          <h4 className="font-bold uppercase text-sm tracking-wider flex items-center gap-2">
            <span className="w-8 h-px bg-platinum/30"></span>
            Vehicle Narrative
          </h4>
          <div className={cn(
            "transition-transform duration-300 text-muted-foreground",
            isOpen && "rotate-180"
          )}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </button>
        
        <div className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden">
            <div className="px-6 md:px-8 pb-8 pt-0">
              <p className="text-muted-foreground leading-loose text-lg whitespace-pre-line border-t border-platinum/10 pt-6">
                {description || "The owner hasn't provided a description for this vehicle yet. Please contact the concierge for full details and history."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

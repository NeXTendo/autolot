"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface SectionCarouselProps {
  title: string
  description?: string
  children: React.ReactNode
  viewAllHref?: string
}

export function SectionCarousel({ title, description, children, viewAllHref }: SectionCarouselProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <section className="py-20 overflow-hidden">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight uppercase">{title}</h2>
            {description && <p className="text-muted-foreground text-sm uppercase tracking-widest">{description}</p>}
          </div>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-[10px] uppercase tracking-[0.2em] font-black h-9 px-4 hover:bg-white/5"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "View All"}
            </Button>
          </div>
        </div>

        {/* Carousel / Grid Container */}
        <div 
          className={cn(
            "transition-all duration-500 ease-in-out",
            isExpanded 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
              : "flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
          )}
        >
          {React.Children.map(children, (child) => (
            <div className={cn(
              "transition-all duration-500",
              !isExpanded && "min-w-[280px] sm:min-w-[320px] snap-start"
            )}>
              {child}
            </div>
          ))}
          
          {!isExpanded && (
            <div className="min-w-[100px] flex items-center justify-center lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10"
                onClick={() => setIsExpanded(true)}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

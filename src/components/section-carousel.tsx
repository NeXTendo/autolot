"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface SectionCarouselProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function SectionCarousel({ title, description, children }: SectionCarouselProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 animate-fade-up">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-platinum/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/40">Marketplace Insight</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase">
              {title}
            </h2>
            {description && (
              <p className="text-platinum/40 max-w-xl font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              className="h-10 px-6 rounded-none border-white/10 hover:border-white/20 text-platinum/60 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse View" : "Expand Collection"}
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

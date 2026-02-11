"use client"

import * as React from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [touchStart, setTouchStart] = React.useState(0)
  const [touchEnd, setTouchEnd] = React.useState(0)

  const imageList = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070']

  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1))
  }, [imageList.length])

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1))
  }, [imageList.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') setIsFullscreen(false)
  }, [goToNext, goToPrevious])

  React.useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, handleKeyDown])

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image Card */}
        <Card className="overflow-hidden">
          <div 
            className="relative aspect-video cursor-pointer group"
            onClick={() => setIsFullscreen(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={imageList[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
            
            {/* Desktop Navigation Arrows - Fade on hover */}
            {imageList.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {imageList.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">
                {currentIndex + 1} / {imageList.length}
              </div>
            )}
          </div>
        </Card>

        {/* Thumbnail Carousel (Mobile) / Grid (Desktop) */}
        {imageList.length > 1 && (
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
            {imageList.map((image, idx) => (
              <Card
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "overflow-hidden cursor-pointer transition-all shrink-0 w-24 md:w-auto snap-center",
                  currentIndex === idx 
                    ? "ring-2 ring-primary scale-105" 
                    : "hover:ring-2 hover:ring-border opacity-70 hover:opacity-100"
                )}
              >
                <div className="relative aspect-video">
                  <Image
                    src={image}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-9999 bg-black flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Fullscreen Image */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={imageList[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />

            {/* Navigation in Fullscreen */}
            {imageList.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                {/* Counter in Fullscreen */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/20 text-white text-lg backdrop-blur-sm">
                  {currentIndex + 1} / {imageList.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}


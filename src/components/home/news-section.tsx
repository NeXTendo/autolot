"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Clock, Newspaper, Sparkles, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLatestArticles, type Article } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/client"

export function NewsSection() {
  const [editorial, setEditorial] = useState<Article[]>([])
  const [reviews, setReviews] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [editorialData, reviewsData] = await Promise.all([
        getLatestArticles(supabase, 4, 'Editorial'),
        getLatestArticles(supabase, 4, 'Review')
      ])
      
      // If editorial is empty, try fetching all to populate
      if (editorialData.length === 0) {
        const fallback = await getLatestArticles(supabase, 4)
        setEditorial(fallback)
      } else {
        setEditorial(editorialData)
      }
      
      setReviews(reviewsData)
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) return (
    <div className="container py-24">
      <div className="h-96 w-full bg-white/5 animate-pulse" />
    </div>
  )

  const featureStory = editorial[0]
  const sideStories = editorial.slice(1, 4)

  return (
    <section className="py-24 border-t border-white/5 bg-black relative overflow-hidden">
      <div className="container relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-up">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-platinum/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/40">Editorial Hub</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
              Automotive <span className="text-platinum">Journal</span>
            </h2>
          </div>
          <Link href="/stories">
            <Button variant="outline" className="rounded-none border-white/10 text-[10px] font-black uppercase tracking-widest px-8 h-12 hover:bg-white hover:text-black transition-all">
              View All Stories
            </Button>
          </Link>
        </div>

        {/* Magazine Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Main Feature */}
          {featureStory && (
            <div className="lg:col-span-8 group relative aspect-[16/10] lg:aspect-auto overflow-hidden border border-white/5">
              <Link href={`/stories/${featureStory.slug}`} className="block h-full">
                <Image
                  src={featureStory.featured_image}
                  alt={featureStory.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 md:p-12 flex flex-col justify-end">
                  <div className="space-y-4 max-w-2xl">
                    <Badge className="rounded-none bg-platinum text-black font-black text-[9px] uppercase tracking-widest px-3">
                      Feature Story
                    </Badge>
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] group-hover:text-platinum transition-colors">
                      {featureStory.title}
                    </h3>
                    <p className="text-platinum/60 text-sm md:text-base font-medium line-clamp-2">
                      {featureStory.excerpt}
                    </p>
                    <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase tracking-widest text-platinum/40 group-hover:text-white transition-colors">
                      <span className="flex items-center gap-2">
                        <User size={12} /> {featureStory.author_name || "AutoLot Staff"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock size={12} /> {featureStory.read_time_minutes} Min Read
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Side Stories */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {sideStories.map((story) => (
              <Link 
                key={story.id} 
                href={`/stories/${story.slug}`} 
                className="group flex gap-4 md:gap-6 items-start border-b border-white/5 pb-8 last:border-0 last:pb-0"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden border border-white/5">
                  <Image
                    src={story.featured_image}
                    alt={story.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-[9px] font-black uppercase tracking-widest text-platinum/40 italic">
                    {story.category}
                  </div>
                  <h4 className="text-sm md:text-lg font-black uppercase tracking-tight leading-tight group-hover:text-platinum transition-colors line-clamp-2">
                    {story.title}
                  </h4>
                  <div className="text-[9px] font-bold text-white/20 flex items-center gap-2 uppercase tracking-widest">
                    <Clock size={10} /> {story.read_time_minutes} Min
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Exclusive Reviews Section */}
        <div className="pt-24 border-t border-white/5">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
              Exclusive <span className="text-platinum">Reviews</span>
              <Badge variant="outline" className="rounded-none border-platinum/20 text-platinum text-[8px] font-black uppercase tracking-[0.2em] px-2 h-5">
                Lab Tested
              </Badge>
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-none border-white/5 bg-white/5 hover:bg-white hover:text-black">
                <ChevronRight className="rotate-180" size={16} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-none border-white/5 bg-white/5 hover:bg-white hover:text-black">
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.length > 0 ? reviews.map((review) => (
              <Link key={review.id} href={`/stories/${review.slug}`} className="group space-y-4">
                <div className="relative aspect-[4/3] overflow-hidden border border-white/5">
                  <Image
                    src={review.featured_image}
                    alt={review.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="rounded-none bg-black/80 backdrop-blur-md border-white/10 text-white font-black text-[8px] uppercase tracking-widest px-2">
                      {review.category}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-tight leading-snug group-hover:text-platinum transition-colors line-clamp-2">
                    {review.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-platinum/20 group-hover:text-platinum/40 transition-colors">
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{review.read_time_minutes} Min Read</span>
                  </div>
                </div>
              </Link>
            )) : (
              // Fallback cards if no reviews found
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-white/5 border border-white/5 flex items-center justify-center p-8 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Upcoming Insight</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function User(props: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size} 
      height={props.size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

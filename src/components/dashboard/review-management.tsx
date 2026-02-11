"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Star, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer: {
    name: string
  } | null
}

interface ReviewManagementProps {
  sellerId: string
}

export function ReviewManagement({ sellerId }: ReviewManagementProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReviews = useCallback(async (isMounted = { current: true }) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(name)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (isMounted.current && !error && data) {
      setReviews(data as any as Review[])
    }
    if (isMounted.current) {
      setLoading(false)
    }
  }, [supabase, sellerId])

  useEffect(() => {
    const isMounted = { current: true }
    void (async () => {
      await fetchReviews(isMounted)
    })()

    const channel = supabase
      .channel('review-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => fetchReviews(isMounted))
      .subscribe()

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchReviews, supabase])

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/40 backdrop-blur-2xl p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum/40" />
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-3xl overflow-hidden shadow-2xl">
      <CardHeader 
        className="cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
            <MessageCircle size={18} /> Reviews ({reviews.length})
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-black text-yellow-400 leading-none">{avgRating}</span>
            </div>
            {isOpen ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-6 pt-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="group relative pl-4 border-l-2 border-white/10 hover:border-white transition-colors duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-white mb-1">
                    {review.reviewer?.name || "Anonymous Collector"}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={10} 
                        className={i < review.rating ? "fill-white text-white" : "fill-white/10 text-white/10"} 
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/30">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-[12px] text-white/80 leading-relaxed font-medium italic">
                &ldquo;{review.comment}&rdquo;
              </p>
            </div>
          )) : (
            <div className="text-center py-12 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Star size={24} className="text-white/10" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/20 italic">No Marketplace Reviews Yet</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

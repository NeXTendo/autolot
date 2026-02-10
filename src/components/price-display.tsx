"use client"

import { useCurrency } from "@/lib/currency/currency-context"

interface PriceDisplayProps {
  price: number
  className?: string
}

export function PriceDisplay({ price, className }: PriceDisplayProps) {
  const { formatPrice } = useCurrency()
  
  return <span className={className}>{formatPrice(price)}</span>
}

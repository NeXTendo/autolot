"use client"

import { useCurrency } from "@/lib/currency/currency-context"

interface VehiclePriceProps {
  price: number
  className?: string
}

export function VehiclePrice({ price, className }: VehiclePriceProps) {
  const { formatPrice } = useCurrency()
  
  return (
    <div className={className}>
      {formatPrice(price)}
    </div>
  )
}

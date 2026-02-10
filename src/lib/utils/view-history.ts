"use client"

export interface ViewHistoryItem {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  transmission?: string
  fuel_type?: string
  image: string
  timestamp: number
}

const HISTORY_KEY = 'platinum_auto_view_history'
const MAX_HISTORY = 20

export function trackView(vehicle: Omit<ViewHistoryItem, 'timestamp'>) {
  if (typeof window === 'undefined') return

  const history = getHistory()
  const newHistory = [
    { ...vehicle, timestamp: Date.now() },
    ...history.filter(item => item.id !== vehicle.id)
  ].slice(0, MAX_HISTORY)

  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
}

export function getHistory(): ViewHistoryItem[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(HISTORY_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error('Failed to parse view history:', e)
    return []
  }
}

export function getPersonalizationStats() {
  const history = getHistory()
  if (history.length === 0) return null

  const makes = history.reduce((acc, item) => {
    acc[item.make] = (acc[item.make] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const favoriteMake = Object.entries(makes).sort((a, b) => b[1] - a[1])[0][0]
  
  const avgPrice = history.reduce((sum, item) => sum + Number(item.price), 0) / history.length
  
  return {
    favoriteMake,
    priceRange: {
      min: avgPrice * 0.7,
      max: avgPrice * 1.3
    }
  }
}

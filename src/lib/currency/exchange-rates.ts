// Currency exchange rate service using exchangerate-api.com

export type Currency = 'USD' | 'ZMW' | 'ZAR' | 'EUR' | 'GBP' | 'JPY'

export interface ExchangeRates {
  base: Currency
  rates: Record<Currency, number>
  timestamp: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest'

let cachedRates: ExchangeRates | null = null

/**
 * Fetch exchange rates from API
 * Uses USD as base currency
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // Check cache first
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return cachedRates
  }

  try {
    const response = await fetch(`${API_BASE_URL}/USD`)
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()
    
    cachedRates = {
      base: 'USD',
      rates: {
        USD: 1,
        ZMW: data.rates.ZMW || 27.5,
        ZAR: data.rates.ZAR || 18.5,
        EUR: data.rates.EUR || 0.92,
        GBP: data.rates.GBP || 0.79,
        JPY: data.rates.JPY || 149.5,
      },
      timestamp: Date.now(),
    }

    return cachedRates
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    
    // Return fallback rates if API fails
    return {
      base: 'USD',
      rates: {
        USD: 1,
        ZMW: 27.5,
        ZAR: 18.5,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.5,
      },
      timestamp: Date.now(),
    }
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> {
  if (from === to) return amount

  const rates = await fetchExchangeRates()
  
  // Convert to USD first (base currency)
  const amountInUSD = from === 'USD' ? amount : amount / rates.rates[from]
  
  // Convert from USD to target currency
  const convertedAmount = to === 'USD' ? amountInUSD : amountInUSD * rates.rates[to]
  
  return Math.round(convertedAmount * 100) / 100 // Round to 2 decimal places
}

/**
 * Synchronously convert currency using cached rates
 * Falls back to original amount if rates not cached
 */
export function convertCurrencySync(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount
  
  // Use cached rates or fallback
  const rates = cachedRates || {
    base: 'USD',
    rates: {
      USD: 1,
      ZMW: 27.5,
      ZAR: 18.5,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.5,
    },
    timestamp: Date.now(),
  }
  
  // Convert to USD first (base currency)
  const amountInUSD = from === 'USD' ? amount : amount / rates.rates[from]
  
  // Convert from USD to target currency
  const convertedAmount = to === 'USD' ? amountInUSD : amountInUSD * rates.rates[to]
  
  return Math.round(convertedAmount * 100) / 100 // Round to 2 decimal places
}


/**
 * Format currency with symbol and proper formatting
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    ZMW: 'ZMW',
    ZAR: 'R',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  }

  const decimals = currency === 'JPY' ? 0 : 2

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)

  const symbol = symbols[currency]
  
  // For ZMW, put symbol after the amount
  if (currency === 'ZMW') {
    return `${formatted} ${symbol}`
  }
  
  return `${symbol}${formatted}`
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  const names: Record<Currency, string> = {
    USD: 'US Dollar',
    ZMW: 'Zambian Kwacha',
    ZAR: 'South African Rand',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
  }
  
  return names[currency]
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return ['USD', 'ZMW', 'ZAR', 'EUR', 'GBP', 'JPY']
}

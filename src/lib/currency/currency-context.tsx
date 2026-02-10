"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency, convertCurrencySync, formatCurrency, fetchExchangeRates } from './exchange-rates'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatPrice: (amount: number, from?: Currency) => string
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD')
  const [isLoading, setIsLoading] = useState(false)

  // Load currency preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred_currency')
    if (saved && ['USD', 'ZMW', 'ZAR', 'EUR', 'GBP', 'JPY'].includes(saved)) {
      setCurrencyState(saved as Currency)
    }
  }, [])

  // Prefetch exchange rates on mount and when currency changes
  useEffect(() => {
    fetchExchangeRates().catch(console.error)
  }, [currency])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferred_currency', newCurrency)
  }

  const formatPrice = (amount: number, from: Currency = 'USD'): string => {
    // Synchronously convert using cached rates
    try {
      const converted = convertCurrencySync(amount, from, currency)
      return formatCurrency(converted, currency)
    } catch (error) {
      // Fallback to original currency if conversion fails
      return formatCurrency(amount, from)
    }
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

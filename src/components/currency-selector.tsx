"use client"

import { useState } from 'react'
import { Check, Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/lib/currency/currency-context'
import { Currency, getCurrencyName, getSupportedCurrencies } from '@/lib/currency/exchange-rates'

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null)

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === currency) return
    
    setPendingCurrency(newCurrency as Currency)
    setShowDisclaimer(true)
  }

  const confirmCurrencyChange = () => {
    if (pendingCurrency) {
      setCurrency(pendingCurrency)
    }
    setShowDisclaimer(false)
    setPendingCurrency(null)
  }

  const cancelCurrencyChange = () => {
    setShowDisclaimer(false)
    setPendingCurrency(null)
  }

  return (
    <>
      <Select value={currency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[140px] bg-background/95 backdrop-blur-md">
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-100000">
          {getSupportedCurrencies().map((curr) => (
            <SelectItem key={curr} value={curr}>
              <div className="flex items-center justify-between w-full">
                <span>{curr}</span>
                {curr === currency && <Check className="w-4 h-4 ml-2" />}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="sm:max-w-md z-100000">
          <DialogHeader>
            <DialogTitle>Currency Conversion Notice</DialogTitle>
            <div className="space-y-3 pt-4 text-sm text-muted-foreground">
              <p>
                You are about to change your display currency to{' '}
                <strong>{pendingCurrency && getCurrencyName(pendingCurrency)}</strong>.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ Important Notice
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Exchange rates are approximate and updated hourly. Actual prices may vary based on current market rates. 
                  All transactions are processed in the seller&apos;s preferred currency.
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={cancelCurrencyChange}>
              Cancel
            </Button>
            <Button variant="platinum" onClick={confirmCurrencyChange}>
              I Understand, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

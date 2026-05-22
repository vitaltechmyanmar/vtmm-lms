'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  Copy,
  Loader2,
  AlertCircle,
  Phone,
  User,
  Banknote,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatMMK } from '@/lib/format-currency'

interface MyanmarPaymentCheckoutProps {
  courseId: string
  courseName: string
  priceInKyats: number
  onCancel?: () => void
  onSuccess?: () => void
}

const PAYMENT_METHODS = [
  {
    id: 'kbz',
    name: 'KBZ Pay',
    color: 'from-blue-600 to-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-700 dark:text-blue-400',
    accountName: 'Htet Oo Wai Yan',
    phoneNumber: '09443167419',
    logo: '🏦',
    instruction: 'KBZ Pay app ကိုဖွင့်ပြီး Transfer → Phone Number မှ ငွေလွှဲပေးပါ',
  },
  {
    id: 'wave',
    name: 'Wave Money',
    color: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-700 dark:text-orange-400',
    accountName: 'Htet Oo Wai Yan',
    phoneNumber: '09950411201',
    logo: '🌊',
    instruction: 'Wave app ကိုဖွင့်ပြီး Send Money → Phone Number မှ ငွေလွှဲပေးပါ',
  },
]

export function MyanmarPaymentCheckout({
  courseId,
  courseName,
  priceInKyats,
  onCancel,
  onSuccess,
}: MyanmarPaymentCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState('kbz')
  const [step, setStep] = useState<'select' | 'confirm'>('select')
  const [transactionId, setTransactionId] = useState('')
  const [senderName, setSenderName] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)!

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  async function handleSubmitPayment() {
    if (!transactionId.trim()) {
      toast.error('Please enter your transaction ID / reference number')
      return
    }
    if (!senderName.trim()) {
      toast.error('Please enter the sender name used for the transfer')
      return
    }

    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please log in first')
      setIsSubmitting(false)
      return
    }

    // Create a pending payment record
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: user.id,
      course_id: courseId,
      amount_in_cents: priceInKyats, // storing as kyats directly
      currency: 'MMK',
      status: 'pending',
      stripe_checkout_session_id: `${selectedMethod.toUpperCase()}-${transactionId.trim()}`, // reuse field for transaction ref
      stripe_payment_intent_id: `SENDER:${senderName.trim()}${notes ? ' | NOTE:' + notes : ''}`, // reuse for notes
    })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      toast.error('Failed to submit payment. Please try again.')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Payment Submitted!</h2>
        <p className="text-muted-foreground max-w-sm">
          သင်၏ payment confirmation ကို admin မှ စစ်ဆေးပြီး{' '}
          <strong>24 နာရီအတွင်း</strong> course access ပေးပါမည်။
        </p>
        <div className="rounded-lg bg-muted/50 border p-4 text-sm text-left w-full max-w-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Course:</span>
            <span className="font-medium truncate max-w-[160px]">{courseName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{formatMMK(priceInKyats)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method:</span>
            <span className="font-medium">{method.name}</span>
          </div>
        </div>
        <Button onClick={() => router.push('/dashboard')} className="mt-2">
          Go to Dashboard
        </Button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('select')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold">Confirm Payment</h2>
        </div>

        {/* Payment summary */}
        <div className={`rounded-xl bg-gradient-to-br ${method.color} p-4 text-white space-y-1`}>
          <p className="text-white/80 text-sm">Paying via {method.name}</p>
          <p className="text-2xl font-bold">{formatMMK(priceInKyats)}</p>
          <p className="text-white/80 text-sm truncate">{courseName}</p>
        </div>

        {/* Account info reminder */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
          <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
            Transfer to:
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{method.accountName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">{method.phoneNumber}</span>
            </div>
            <button
              onClick={() => copyToClipboard(method.phoneNumber, 'Phone number')}
              className="text-primary hover:text-primary/80"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Proof of payment form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="txn-id">
              Transaction ID / Reference No. <span className="text-destructive">*</span>
            </Label>
            <Input
              id="txn-id"
              placeholder="e.g. TXN123456789"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {method.name} app မှ transaction success screen ၌ မြင်ရသော reference number
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sender-name">
              Sender Name (ငွေလွှဲသူ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sender-name"
              placeholder="Your name as shown in the app"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional info for admin..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleSubmitPayment}
            disabled={isSubmitting || !transactionId.trim() || !senderName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Payment
              </>
            )}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          <AlertCircle className="inline h-3 w-3 mr-1" />
          Admin မှ payment verify လုပ်ပြီးမှ course access ရမည်
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">Complete Your Purchase</h2>
          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
            {courseName}
          </p>
        </div>
        <span className="text-xl font-bold text-primary shrink-0 ml-2">{formatMMK(priceInKyats)}</span>
      </div>

      {/* Method selector — compact */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Select Payment Method:</p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.id}
              onClick={() => setSelectedMethod(pm.id)}
              className={`relative flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                selectedMethod === pm.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40'
              }`}
            >
              {selectedMethod === pm.id && (
                <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" />
              )}
              <span className="text-2xl">{pm.logo}</span>
              <span className="text-sm font-semibold">{pm.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Account info — compact gradient */}
      <div className={`rounded-xl bg-gradient-to-br ${method.color} p-4 text-white`}>
        <p className="text-xs text-white/70 mb-2">{method.instruction}</p>
        <div className="grid grid-cols-2 gap-2 text-sm bg-white/10 rounded-lg p-3">
          <div>
            <p className="text-white/60 text-xs">Account Name</p>
            <p className="font-semibold">{method.accountName}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Phone Number</p>
            <div className="flex items-center gap-1.5">
              <p className="font-mono font-bold">{method.phoneNumber}</p>
              <button
                onClick={() => copyToClipboard(method.phoneNumber, 'Phone number')}
                className="rounded bg-white/20 p-0.5 hover:bg-white/30 transition-colors"
                title="Copy"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="col-span-2 border-t border-white/20 pt-2 flex items-center justify-between">
            <span className="text-white/70 text-xs flex items-center gap-1">
              <Banknote className="h-3.5 w-3.5" /> Amount to transfer
            </span>
            <span className="font-bold">{formatMMK(priceInKyats)}</span>
          </div>
        </div>
      </div>

      {/* Steps guide — compact horizontal */}
      <div className="flex gap-1.5 text-xs text-muted-foreground">
        {[
          'Open app',
          `Transfer ${formatMMK(priceInKyats)}`,
          'Note Txn ID',
          'Click "I have paid"',
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="hidden sm:block truncate">{s}</span>
            {i < 3 && <span className="shrink-0 text-muted-foreground/40">→</span>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button className="flex-1" onClick={() => setStep('confirm')}>
          I have paid →
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

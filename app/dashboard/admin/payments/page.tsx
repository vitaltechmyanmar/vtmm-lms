'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Banknote,
  User,
  Phone,
  Hash,
  RefreshCw,
  Loader2,
  StickyNote,
  ImageIcon,
  ZoomIn,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatMMKAmount } from '@/lib/format-currency'

interface PaymentRow {
  id: string
  user_id: string
  course_id: string
  amount_in_cents: number
  currency: string
  status: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  payment_proof_url: string | null
  created_at: string
  completed_at: string | null
  user: { email: string; full_name: string | null } | null
  course: { title: string } | null
}

function parsePaymentMeta(row: PaymentRow) {
  const ref = row.stripe_checkout_session_id || ''
  const method = ref.startsWith('KBZPAY-') ? 'KBZ Pay'
    : ref.startsWith('WAVE-') ? 'Wave Money'
    : ref.startsWith('KBZ-') ? 'KBZ Pay'
    : 'Other'
  const txnId = ref.replace(/^(KBZPAY-|WAVE-|KBZ-)/, '')

  const meta = row.stripe_payment_intent_id || ''
  const senderMatch = meta.match(/^SENDER:([^|]+)/)
  const noteMatch = meta.match(/NOTE:(.+)$/)
  const senderName = senderMatch ? senderMatch[1].trim() : ''
  const notes = noteMatch ? noteMatch[1].trim() : ''

  return { method, txnId, senderName, notes }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null)
  const [proofModalSigned, setProofModalSigned] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchPayments() {
    setLoading(true)
    let query = supabase
      .from('payments')
      .select(`*, user:profiles(email, full_name), course:courses(title)`)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query
    if (error) {
      toast.error(error.message)
    } else {
      setPayments((data || []) as PaymentRow[])
    }
    setLoading(false)
  }

  useEffect(() => { fetchPayments() }, [statusFilter])

  async function getSignedUrl(path: string): Promise<string> {
    const { data } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(path, 60 * 5) // 5-minute signed URL
    return data?.signedUrl || ''
  }

  async function openProofModal(path: string) {
    setProofModalUrl(path)
    const signed = await getSignedUrl(path)
    setProofModalSigned(signed)
  }

  function closeProofModal() {
    setProofModalUrl(null)
    setProofModalSigned(null)
  }

  async function handleApprove(payment: PaymentRow) {
    setProcessing(payment.id)

    const { error: payErr } = await supabase
      .from('payments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', payment.id)

    if (payErr) {
      toast.error('Failed to update payment: ' + payErr.message)
      setProcessing(null)
      return
    }

    const { error: enrollErr } = await supabase
      .from('enrollments')
      .upsert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        payment_id: payment.id,
        progress_percentage: 0,
      }, { onConflict: 'user_id,course_id', ignoreDuplicates: true })

    if (enrollErr) {
      toast.warning('Payment approved but enrollment sync failed: ' + enrollErr.message)
    } else {
      toast.success('✅ Payment approved! User enrolled in course.')
    }

    setProcessing(null)
    fetchPayments()
  }

  async function handleReject(payment: PaymentRow) {
    if (!confirm('Reject this payment? The user will not be enrolled.')) return
    setProcessing(payment.id)

    const { error } = await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', payment.id)

    if (error) {
      toast.error('Failed: ' + error.message)
    } else {
      toast.success('Payment rejected.')
    }

    setProcessing(null)
    fetchPayments()
  }

  const filtered = payments.filter(p => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      p.user?.email?.toLowerCase().includes(term) ||
      p.user?.full_name?.toLowerCase().includes(term) ||
      p.course?.title?.toLowerCase().includes(term) ||
      p.stripe_checkout_session_id?.toLowerCase().includes(term)
    )
  })

  const pendingCount = payments.filter(p => p.status === 'pending').length

  const statCards = [
    { label: 'Pending Review', value: payments.filter(p => p.status === 'pending').length, icon: Clock, iconBg: 'bg-yellow-100 dark:bg-yellow-900/40', iconColor: 'text-yellow-600', gradFrom: '#f59e0b11', border: 'border-yellow-200 dark:border-yellow-900' },
    { label: 'Approved', value: payments.filter(p => p.status === 'completed').length, icon: CheckCircle2, iconBg: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600', gradFrom: '#22c55e11', border: 'border-green-200 dark:border-green-900' },
    { label: 'Rejected', value: payments.filter(p => p.status === 'failed').length, icon: XCircle, iconBg: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600', gradFrom: '#ef444411', border: 'border-red-200 dark:border-red-900' },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-yellow-500/5 p-6 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right,#8882 1px,transparent 1px),linear-gradient(to bottom,#8882 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium shadow-sm">
              <Banknote className="h-3 w-3 text-primary" />
              Payments
              {pendingCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[9px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold">Payment Approvals</h1>
            <p className="mt-1 text-muted-foreground">Verify KBZ Pay & Wave Money transactions.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading} className="shrink-0">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`rounded-xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${stat.border}`}
              style={{ background: `linear-gradient(135deg,${stat.gradFrom},transparent)` }}
            >
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user, course, or transaction ID..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Approved</SelectItem>
            <SelectItem value="failed">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Banknote className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">
              {statusFilter === 'pending' ? 'No pending payments' : 'No payments found'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter === 'pending' && 'All caught up! 🎉'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(payment => {
            const { method, txnId, senderName, notes } = parsePaymentMeta(payment)
            const isProcessing = processing === payment.id

            return (
              <Card
                key={payment.id}
                className={`overflow-hidden transition-all ${
                  payment.status === 'pending'
                    ? 'border-yellow-300 dark:border-yellow-800 shadow-sm'
                    : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Left: payment info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        }`}>
                          {payment.status === 'completed' ? '✅ Approved'
                          : payment.status === 'pending' ? '⏳ Pending'
                          : '❌ Rejected'}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          {method}
                        </span>
                        <span className="font-bold text-primary text-sm">
                          {formatMMKAmount(payment.amount_in_cents)}
                        </span>
                      </div>

                      <p className="font-semibold line-clamp-1">{payment.course?.title || 'Unknown Course'}</p>

                      <div className="grid grid-cols-1 gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{payment.user?.full_name || payment.user?.email || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="font-mono truncate">{txnId || '—'}</span>
                        </div>
                        {senderName && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Sender: {senderName}</span>
                          </div>
                        )}
                        {notes && (
                          <div className="flex items-start gap-1.5 sm:col-span-2">
                            <StickyNote className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Screenshot */}
                      {payment.payment_proof_url ? (
                        <button
                          onClick={() => openProofModal(payment.payment_proof_url!)}
                          className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm hover:bg-muted/60 transition-colors group w-fit"
                        >
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Payment Screenshot</span>
                          <ZoomIn className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        payment.status === 'pending' && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                            No payment screenshot attached
                          </div>
                        )
                      )}

                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(payment.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Right: actions */}
                    {payment.status === 'pending' && (
                      <div className="flex gap-2 sm:flex-col">
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(payment)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                          onClick={() => handleReject(payment)}
                          disabled={isProcessing}
                        >
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {payment.status === 'completed' && (
                      <p className="text-xs text-green-600 font-medium shrink-0">
                        ✓ Approved {payment.completed_at ? new Date(payment.completed_at).toLocaleDateString() : ''}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      <Dialog open={!!proofModalUrl} onOpenChange={open => !open && closeProofModal()}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex items-center justify-center min-h-[300px] bg-muted/30">
            {proofModalSigned ? (
              <img
                src={proofModalSigned}
                alt="Payment proof screenshot"
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
              />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

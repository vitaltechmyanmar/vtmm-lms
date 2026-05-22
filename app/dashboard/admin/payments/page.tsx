'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  stripe_checkout_session_id: string | null // used as: KBZPAY-TXNID or WAVE-TXNID
  stripe_payment_intent_id: string | null   // used as: SENDER:name | NOTE:notes
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
  const supabase = createClient()

  async function fetchPayments() {
    setLoading(true)
    let query = supabase
      .from('payments')
      .select(`
        *,
        user:profiles(email, full_name),
        course:courses(title)
      `)
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

  async function handleApprove(payment: PaymentRow) {
    setProcessing(payment.id)

    // 1. Update payment to completed
    const { error: payErr } = await supabase
      .from('payments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', payment.id)

    if (payErr) {
      toast.error('Failed to update payment: ' + payErr.message)
      setProcessing(null)
      return
    }

    // 2. Create or update enrollment
    const { error: enrollErr } = await supabase
      .from('enrollments')
      .upsert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        payment_id: payment.id,
        progress_percentage: 0,
      }, { onConflict: 'user_id,course_id', ignoreDuplicates: true })

    if (enrollErr) {
      console.error('Enrollment error:', enrollErr)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Approvals</h1>
          <p className="text-muted-foreground">
            Verify KBZ Pay & Wave Money transactions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending Review', value: payments.filter(p => p.status === 'pending').length, icon: Clock, color: 'text-yellow-500' },
          { label: 'Approved', value: payments.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Rejected', value: payments.filter(p => p.status === 'failed').length, icon: XCircle, color: 'text-red-500' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Banknote className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">
              {statusFilter === 'pending' ? 'No pending payments' : 'No payments found'}
            </p>
            <p className="text-sm text-muted-foreground">
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
              <Card key={payment.id} className={`overflow-hidden ${payment.status === 'pending' ? 'border-yellow-500/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Left: payment info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={
                          payment.status === 'completed' ? 'default'
                          : payment.status === 'pending' ? 'secondary'
                          : 'destructive'
                        }>
                          {payment.status === 'completed' ? '✅ Approved'
                          : payment.status === 'pending' ? '⏳ Pending'
                          : '❌ Rejected'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{method}</Badge>
                        <span className="font-bold text-primary">{formatMMKAmount(payment.amount_in_cents)}</span>
                      </div>

                      <p className="font-semibold line-clamp-1">{payment.course?.title || 'Unknown Course'}</p>

                      <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-2">
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
                      <p className="text-xs text-green-600 font-medium">
                        Approved {payment.completed_at ? new Date(payment.completed_at).toLocaleDateString() : ''}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

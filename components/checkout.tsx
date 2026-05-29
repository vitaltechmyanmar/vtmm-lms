'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatMMK } from '@/lib/format-currency'
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PhoneIcon from '@mui/icons-material/Phone'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

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
    name: 'KBZPay',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
    accountName: 'Htet Oo Wai Yan',
    phoneNumber: '09443167419',
    logo: '🏦',
    instruction: 'KBZPay app ကိုဖွင့်ပြီး Transfer → Phone Number မှ ငွေလွှဲပေးပါ',
  },
  {
    id: 'wave',
    name: 'WavePay',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #b91c1c 100%)',
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

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const supabase = createClient()

  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)!

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please select an image file (JPEG, PNG, WEBP, or GIF)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setScreenshotFile(file)
    const reader = new FileReader()
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function removeScreenshot() {
    setScreenshotFile(null)
    setScreenshotPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadScreenshot(): Promise<string | null> {
    if (!screenshotFile) return null
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', screenshotFile)
      const res = await fetch('/api/upload/payment-proof', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to upload screenshot')
        return null
      }
      return data.path as string
    } catch {
      toast.error('Failed to upload screenshot')
      return null
    } finally {
      setIsUploading(false)
    }
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

    let proofPath: string | null = null
    if (screenshotFile) {
      proofPath = await uploadScreenshot()
      if (!proofPath) {
        setIsSubmitting(false)
        return
      }
    }

    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: user.id,
      course_id: courseId,
      amount_in_cents: priceInKyats,
      currency: 'MMK',
      status: 'pending',
      stripe_checkout_session_id: `${selectedMethod.toUpperCase()}-${transactionId.trim()}`,
      stripe_payment_intent_id: `SENDER:${senderName.trim()}${notes ? ' | NOTE:' + notes : ''}`,
      payment_proof_url: proofPath,
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

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, textAlign: 'center', gap: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(37,99,235,0.1)',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" fontWeight={800}>Payment Submitted!</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
          သင်၏ payment confirmation ကို admin မှ စစ်ဆေးပြီး{' '}
          <strong>24 နာရီအတွင်း</strong> course access ပေးပါမည်။
        </Typography>

        <Box
          sx={{
            width: '100%',
            maxWidth: 280,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            p: 2,
            textAlign: 'left',
          }}
        >
          {[
            { label: 'Course', value: courseName },
            { label: 'Amount', value: formatMMK(priceInKyats) },
            { label: 'Method', value: method.name },
          ].map(row => (
            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, '&:last-child': { mb: 0 } }}>
              <Typography variant="caption" color="text.secondary">{row.label}:</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ maxWidth: 160 }} noWrap>{row.value}</Typography>
            </Box>
          ))}
        </Box>

        <Button variant="contained" onClick={() => router.push('/dashboard')} sx={{ mt: 1 }}>
          Go to Dashboard
        </Button>
      </Box>
    )
  }

  // ── Confirm step ──────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Back + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => setStep('select')}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Back
          </Button>
          <Typography variant="h6" fontWeight={700}>Confirm Payment</Typography>
        </Box>

        {/* Amount banner */}
        <Box
          sx={{
            borderRadius: 2,
            p: 2.5,
            background: method.gradient,
            color: 'white',
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Paying via {method.name}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ my: 0.25 }}>
            {formatMMK(priceInKyats)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} noWrap>
            {courseName}
          </Typography>
        </Box>

        {/* Account info */}
        <Box sx={{ borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', p: 2 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
            Transfer to:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">{method.accountName}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{method.phoneNumber}</Typography>
            </Box>
            <Button
              size="small"
              onClick={() => copyToClipboard(method.phoneNumber, 'Phone number')}
              startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ minWidth: 0, fontSize: '0.75rem', py: 0.5 }}
            >
              Copy
            </Button>
          </Box>
        </Box>

        {/* Form fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="txn-id"
            label="Transaction ID / Reference No. *"
            placeholder="e.g. TXN123456789"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            fullWidth
            helperText={`${method.name} app မှ transaction success screen ၌ မြင်ရသော reference number`}
          />

          <TextField
            id="sender-name"
            label="Sender Name (ငွေလွှဲသူ) *"
            placeholder="Your name as shown in the app"
            value={senderName}
            onChange={e => setSenderName(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Screenshot upload */}
          <Box>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Payment Screenshot (Required)
            </Typography>
            {screenshotPreview ? (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box
                  component="img"
                  src={screenshotPreview}
                  alt="Payment screenshot"
                  sx={{ height: 120, width: 'auto', borderRadius: 2, border: '1px solid #e2e8f0', objectFit: 'cover' }}
                />
                <Box
                  onClick={removeScreenshot}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 2,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 2,
                  border: '2px dashed #cbd5e1',
                  p: 2.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(37,99,235,0.03)' },
                }}
              >
                <AddPhotoAlternateIcon sx={{ color: 'text.secondary', fontSize: 28, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Upload Screenshot</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Transfer success screen ၏ screenshot ထည့်ပေးပါ (JPEG, PNG, max 5MB)
                  </Typography>
                </Box>
              </Box>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </Box>

          <TextField
            id="notes"
            label="Additional Notes (Required)"
            placeholder="Any additional info for admin..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmitPayment}
            disabled={isSubmitting || isUploading || !transactionId.trim() || !senderName.trim() || !screenshotFile || !notes.trim()}
            startIcon={isSubmitting || isUploading
              ? <CircularProgress size={16} color="inherit" />
              : <CheckCircleOutlineIcon />}
            sx={{ py: 1.25 }}
          >
            {isUploading ? 'Uploading…' : isSubmitting ? 'Submitting…' : 'Confirm Payment'}
          </Button>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting || isUploading} sx={{ flexShrink: 0 }}>
              Cancel
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
          <ErrorOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Admin မှ payment verify လုပ်ပြီးမှ course access ရမည်
          </Typography>
        </Box>
      </Box>
    )
  }

  // ── Method selection step ─────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Complete Your Purchase</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 260 }}>
            {courseName}
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ flexShrink: 0, ml: 1 }}>
          {formatMMK(priceInKyats)}
        </Typography>
      </Box>

      {/* Method selector */}
      <Box>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Select Payment Method:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {PAYMENT_METHODS.map(pm => (
            <Box
              key={pm.id}
              onClick={() => setSelectedMethod(pm.id)}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: selectedMethod === pm.id ? 'primary.main' : '#e2e8f0',
                bgcolor: selectedMethod === pm.id ? 'rgba(37,99,235,0.04)' : 'white',
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { borderColor: selectedMethod === pm.id ? 'primary.main' : '#94a3b8' },
              }}
            >
              {selectedMethod === pm.id && (
                <CheckCircleIcon
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: 16,
                    color: 'primary.main',
                  }}
                />
              )}
              <Box sx={{ fontSize: '1.5rem', lineHeight: 1 }}>{pm.logo}</Box>
              <Typography variant="body2" fontWeight={600}>{pm.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Account info gradient card */}
      <Box sx={{ borderRadius: 2, background: method.gradient, p: 2.5, color: 'white' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2 }}>
          {method.instruction}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.12)',
            p: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Account Name</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>{method.accountName}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Phone Number</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
              <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{method.phoneNumber}</Typography>
              <Box
                onClick={() => copyToClipboard(method.phoneNumber, 'Phone number')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <ContentCopyIcon sx={{ fontSize: 12 }} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.2)', pt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.7)' }}>
              <AttachMoneyIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">Amount to transfer</Typography>
            </Box>
            <Typography variant="body2" fontWeight={800}>{formatMMK(priceInKyats)}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Steps guide */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {['Open app', `Transfer ${formatMMK(priceInKyats)}`, 'Screenshot it', 'Click "I have paid"'].map((s, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: '0.6rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </Box>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
              {s}
            </Typography>
            {i < 3 && <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>→</Typography>}
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => setStep('confirm')}
          sx={{ py: 1.25 }}
        >
          I have paid →
        </Button>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} sx={{ flexShrink: 0 }}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  )
}

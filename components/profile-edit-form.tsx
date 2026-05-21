'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProfileEditFormProps {
  userId: string
  currentEmail: string
  currentFullName: string
}

export function ProfileEditForm({ userId, currentEmail, currentFullName }: ProfileEditFormProps) {
  const [email, setEmail] = useState(currentEmail)
  const [fullName, setFullName] = useState(currentFullName)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verify current user is the one making the request
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== userId) {
        toast.error('Unauthorized: You can only edit your own profile')
        setIsLoading(false)
        return
      }

      // Update profile in profiles table (only full_name, not role)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) {
        toast.error(profileError.message)
        setIsLoading(false)
        return
      }

      // Update email if changed
      if (email !== currentEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        })

        if (emailError) {
          toast.error(emailError.message)
          setIsLoading(false)
          return
        }

        // Also update email in profiles table
        await supabase
          .from('profiles')
          .update({ email: email })
          .eq('id', userId)

        toast.success('Profile updated. Please check your new email to confirm the change.')
      } else {
        toast.success('Profile updated successfully!')
      }

      router.refresh()
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsPasswordLoading(true)

    try {
      // Verify current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== userId) {
        toast.error('Unauthorized: You can only change your own password')
        setIsPasswordLoading(false)
        return
      }

      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        setIsPasswordLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        toast.error(updateError.message)
        setIsPasswordLoading(false)
        return
      }

      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Information Form */}
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          {email !== currentEmail && (
            <p className="text-xs text-amber-600">
              Changing your email will require verification via the new address.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your full name"
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </form>

      {/* Password Change Form */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isPasswordLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isPasswordLoading}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPasswordLoading}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" variant="secondary" disabled={isPasswordLoading}>
            {isPasswordLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>Verify your email address to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">We sent you a verification email</p>
              <p className="text-muted-foreground mt-1">
                Click the link in the email to verify your account and start learning.
              </p>
            </div>
          </div>
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

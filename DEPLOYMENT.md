# EduFlow Deployment & Setup Guide

## Overview

EduFlow is a complete learning management system built with Next.js 16, Supabase, and Stripe. This guide walks you through setting up and deploying the application.

## Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun package manager
- A Supabase account (supabase.com)
- A Stripe account (stripe.com)
- A Vercel account for deployment (vercel.com)
- A GitHub account for repository hosting

## Step 1: Set Up Supabase

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/create account
2. Click "New project"
3. Enter project name: "EduFlow"
4. Set a strong password
5. Choose your region
6. Click "Create new project"

### Get Supabase Credentials

1. Go to Project Settings > API
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Create Database Tables

The database schema has been pre-created via Supabase migrations. The tables include:
- profiles
- courses
- lessons
- enrollments
- lesson_progress
- payments
- certificates
- discussions
- discussion_replies
- quizzes
- quiz_questions
- quiz_attempts

Tables are automatically created when you set up Supabase.

### Enable Email Authentication

1. Go to Authentication > Providers
2. Enable "Email" provider
3. Go to Authentication > Email Templates
4. Customize confirmation email template if needed

## Step 2: Set Up Stripe

### Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create account
2. Complete identity verification
3. Go to Dashboard

### Get Stripe Credentials

1. In Stripe Dashboard, go to API Keys
2. Copy the following:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Set Up Webhook

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. For development: Use `ngrok` or similar to expose localhost
4. URL: `https://your-domain.com/api/webhooks/stripe`
5. Select events to listen: 
   - `checkout.session.completed`
   - `checkout.session.expired`
6. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Test Mode

During development, Stripe automatically uses test keys. Use these test card numbers:
- Visa: 4242 4242 4242 4242
- Mastercard: 5555 5555 5555 4444
- Amex: 3782 822463 10005
- Any future date for expiry
- Any CVC

## Step 3: Local Development Setup

### Clone Repository

```bash
git clone <your-repo-url>
cd v0-project
npm install
```

### Create Environment File

Create `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## Step 4: Deploy to Vercel

### Connect GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Import"

### Configure Environment Variables

In Vercel project settings:

1. Go to Settings > Environment Variables
2. Add all environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL=https://your-deployment-url.vercel.app`

### Update Stripe Webhook

After deployment:

1. Go to Stripe Dashboard > Webhooks
2. Update the endpoint URL to your Vercel deployment: `https://your-deployment.vercel.app/api/webhooks/stripe`

### Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your live URL

## Step 5: Post-Deployment

### Create First Admin User

1. Sign up an account on your platform
2. In Supabase, go to SQL Editor
3. Run this query to set the user as admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Create Test Courses

1. Log in as admin
2. Go to Dashboard > Create New Course
3. Fill in course details
4. Add lessons with video URLs
5. Publish the course

### Test Payment Flow

1. Log in as student account
2. Browse courses
3. Click "Enroll" on a paid course
4. Use Stripe test card: 4242 4242 4242 4242
5. Complete payment
6. Verify enrollment appears in dashboard

## Application Features

### For Students
- Browse and search courses
- Enroll in free and paid courses
- Complete lessons and track progress
- Earn certificates
- Participate in discussions

### For Instructors
- Create and manage courses
- Add video lessons
- Track student enrollment and progress
- View analytics
- Manage pricing

### For Admins
- View platform statistics
- Manage users and roles
- Monitor payments
- Control content visibility

## Database Schema

### Core Tables

#### profiles
```sql
- id (UUID, PK)
- email (string)
- full_name (string)
- avatar_url (string)
- bio (text)
- role (enum: student, instructor, admin)
- stripe_customer_id (string)
- created_at (timestamp)
- updated_at (timestamp)
```

#### courses
```sql
- id (UUID, PK)
- title (string)
- description (text)
- instructor_id (UUID, FK)
- category (string)
- level (enum: beginner, intermediate, advanced)
- price_in_cents (integer)
- thumbnail_url (string)
- is_published (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### lessons
```sql
- id (UUID, PK)
- course_id (UUID, FK)
- title (string)
- content (text)
- video_url (string)
- order_index (integer)
- duration_minutes (integer)
- created_at (timestamp)
```

#### enrollments
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- course_id (UUID, FK)
- payment_id (UUID, FK)
- progress_percentage (integer)
- completed_at (timestamp)
- enrolled_at (timestamp)
```

#### lesson_progress
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- lesson_id (UUID, FK)
- course_id (UUID, FK)
- completed (boolean)
- completed_at (timestamp)
```

#### payments
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- course_id (UUID, FK)
- amount_in_cents (integer)
- status (enum: pending, completed, failed)
- stripe_checkout_session_id (string)
- stripe_payment_intent_id (string)
- created_at (timestamp)
- completed_at (timestamp)
```

## Troubleshooting

### Issue: "Supabase connection failed"
**Solution**: Check that environment variables are correctly set and Supabase project is active.

### Issue: "Stripe webhook not firing"
**Solution**: Ensure webhook URL is correctly configured in Stripe Dashboard and matches your deployment URL.

### Issue: "Email verification not working"
**Solution**: Check Supabase email settings and SMTP configuration if using custom email provider.

### Issue: "Payment shows as pending but not processing"
**Solution**: Check Stripe webhook logs and ensure endpoint is returning 200 status.

## Performance Optimization

### Caching
- Use Supabase caching for frequently accessed data
- Implement Redis caching for high-traffic endpoints
- Use Next.js static generation for public pages

### Database
- Add indexes on frequently queried columns
- Use database connection pooling
- Optimize queries to avoid N+1 problems

### Frontend
- Use Next.js Image optimization
- Implement code splitting
- Use lazy loading for heavy components

## Security Best Practices

### Authentication
- Never expose service role key in frontend code
- Always validate user permissions on backend
- Use Row Level Security (RLS) on database tables
- Implement rate limiting on auth endpoints

### Payments
- Never store full credit card details
- Always validate payments on backend
- Use Stripe webhooks for payment confirmation
- Implement PCI compliance checks

### Data Protection
- Enable HTTPS everywhere
- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user inputs
- Implement CORS properly
- Use secure HTTP headers

## Monitoring & Analytics

### Vercel Analytics
- Monitor deployment performance
- Track build times and errors
- View real-time analytics

### Stripe Analytics
- Monitor payment volume
- Track revenue by course
- Identify failed transactions
- Review chargeback rates

### Supabase Monitoring
- Monitor database performance
- Track API usage
- Review authentication logs

## Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Community
- GitHub Issues
- Supabase Discord Community
- Stripe Support Forum

## Next Steps

1. Deploy to Vercel
2. Create admin account
3. Add test courses
4. Test payment flow
5. Customize branding
6. Invite instructors
7. Promote to students

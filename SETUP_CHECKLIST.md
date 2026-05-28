# Vital Tech LearnHub — Setup Checklist

Use this checklist to ensure the LMS is properly configured and ready for launch.

---

## 1. Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`npm i -g pnpm`)
- [ ] Git installed
- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Resend account created at [resend.com](https://resend.com)
- [ ] Vercel account created at [vercel.com](https://vercel.com)
- [ ] GitHub repository created

---

## 2. Supabase Configuration

- [ ] Supabase project created
- [ ] Project URL and API keys noted
- [ ] Database tables created (via migrations):
  - [ ] `profiles`
  - [ ] `courses`
  - [ ] `lessons`
  - [ ] `lesson_resources`
  - [ ] `enrollments`
  - [ ] `lesson_completions`
  - [ ] `payments` (includes `payment_proof_url` column)
  - [ ] `certificates`
  - [ ] `discussions`
  - [ ] `discussion_replies`
  - [ ] `quizzes`
  - [ ] `quiz_questions`
  - [ ] `quiz_attempts`
  - [ ] `categories`
  - [ ] `instructor_invites`
- [ ] Storage buckets created:
  - [ ] `course-covers` (public)
  - [ ] `lesson-resources` (public)
  - [ ] `payment-proofs` (private, RLS enforced)
- [ ] RLS policies enabled on all tables
- [ ] `get_course_enrollment_count(course_uuid)` security-definer function created
- [ ] Email authentication enabled (Auth → Providers → Email)
- [ ] Admin account seeded: `pnpm seed:admin`

---

## 3. Environment Variables

Create `.env.local` in the project root and add:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)
- [ ] `RESEND_API_KEY` — from [resend.com/api-keys](https://resend.com/api-keys)
- [ ] `EMAIL_FROM` — sender address (e.g. `VT LearnHub <onboarding@resend.dev>`)
- [ ] `ADMIN_EMAIL` — email that receives enrollment notifications
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` _(optional — if using Stripe)_
- [ ] `STRIPE_SECRET_KEY` _(optional)_
- [ ] `STRIPE_WEBHOOK_SECRET` _(optional)_

---

## 4. Resend Email Setup

- [ ] Resend account created
- [ ] API key generated and added to env
- [ ] (For production) Custom sending domain verified in Resend dashboard
- [ ] Update `EMAIL_FROM` in env to use verified domain (e.g. `noreply@vtmm.com`)
- [ ] Test email delivery by enrolling in a free course

---

## 5. Local Development

- [ ] Dependencies installed: `pnpm install`
- [ ] Dev server starts: `pnpm dev`
- [ ] Home page loads: [http://localhost:3000](http://localhost:3000)
- [ ] Courses page loads with enrollment counts visible
- [ ] Sign-up page works (student only — no Instructor option)
- [ ] Admin can invite Instructor via Admin → Users → Invite Instructor
- [ ] Instructor receives magic link email and can register
- [ ] Login works for all roles
- [ ] Dashboard loads with correct role-based UI

---

## 6. Feature Verification

### Student Features
- [ ] Browse courses — see enrollment count on each card
- [ ] View course detail — see duration in `Xh Ym` format
- [ ] Enroll in free course → redirected to learning page
- [ ] Receive enrollment confirmation email after free enrollment
- [ ] Learning interface: video embed, lesson content, resources
- [ ] Mark lessons complete — progress bar updates
- [ ] Complete course → certificate auto-generated
- [ ] View certificate at `/dashboard/certificates`
- [ ] Take quiz and see result
- [ ] Create/view discussion in course
- [ ] View payment history at `/dashboard/purchases`

### Paid Course Flow
- [ ] Paid course shows KBZ / Wave payment dialog
- [ ] Payment screenshot upload is **required**
- [ ] Additional notes field is **required**
- [ ] Payment submitted with `pending` status
- [ ] Admin sees payment in Payment Approvals page

### Instructor Features
- [ ] Instructor invited by admin via email invite (not self-signup)
- [ ] Can create and publish courses
- [ ] Course duration entered in **hours** (e.g. `1.5` = 1h 30m)
- [ ] Duration displayed as `Xh Ym` in course detail and learning sidebar
- [ ] Can add lessons with video, content, and resources
- [ ] Can create quizzes with multiple-choice questions
- [ ] Can view course analytics and enrolled students

### Admin Features
- [ ] Admin dashboard shows platform stats
- [ ] **Users page**: view all users with enrolled courses collapsible per user
- [ ] **Unenroll** a student from any course (with confirmation dialog)
- [ ] **Invite Instructor**: enter name + email → sends magic link
- [ ] **Payment Approvals**: view, approve, reject KBZ/Wave payments
  - [ ] Approve → student enrolled + email sent to student
  - [ ] View payment screenshot in zoom modal
- [ ] **Categories**: create/edit/delete course categories with colors
- [ ] **Assignments**: assign instructors to courses
- [ ] **Analytics**: view revenue chart, enrollment trends, top courses

### Email Notifications
- [ ] Student receives email on free course enrollment
- [ ] Student receives email on paid payment approval
- [ ] Admin receives notification email on free enrollment
- [ ] Admin receives notification email on paid payment approval

---

## 7. Vercel Deployment

- [ ] Code pushed to GitHub
- [ ] Project imported in Vercel dashboard
- [ ] Build command: `next build`
- [ ] All environment variables added in Vercel → Settings → Environment Variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` (set to production URL)
  - [ ] `RESEND_API_KEY`
  - [ ] `EMAIL_FROM`
  - [ ] `ADMIN_EMAIL`
  - [ ] Stripe keys _(if applicable)_
- [ ] First deployment successful
- [ ] Production URL is accessible

---

## 8. Post-Deployment Verification

- [ ] Home page loads correctly
- [ ] Course listing shows enrollment counts
- [ ] Sign-up page has no Instructor option
- [ ] Admin portal pages load with consistent design
- [ ] Instructor invite email is received and works
- [ ] Stripe webhook updated to production URL _(if using Stripe)_
- [ ] Email delivery tested in production
- [ ] Payment screenshot upload tested in production
- [ ] Mobile responsive layout verified

---

## 9. Security Checklist

- [ ] Supabase RLS policies active on all tables
- [ ] `payment-proofs` storage bucket is **private** (signed URLs only)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed in frontend code
- [ ] Admin-only routes protected in middleware
- [ ] Admin API routes verify caller role server-side (`/api/admin/*`)
- [ ] `.env.local` is in `.gitignore` (never committed)

---

## 10. Performance Checklist

- [ ] Home page loads in < 2 seconds
- [ ] Course pages load in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] `pnpm run build` completes with 0 TypeScript errors
- [ ] No console errors on any page

---

## Sign-off

- [ ] All checklist items completed
- [ ] All three roles tested (student, instructor, admin)
- [ ] Email notifications verified end-to-end
- [ ] Application tested on mobile
- [ ] Production deployment stable
- [ ] Team briefed on platform usage

---

Date Completed: _______________
Completed By: _______________

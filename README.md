# Vital Tech LearnHub — Learning Management System

A full-featured, production-ready Learning Management System built with **Next.js 16**, **Supabase**, and **Myanmar payment methods (KBZ Pay / Wave Money)**. Designed for Vital Tech Myanmar to deliver online courses to students across Myanmar.

## ✨ Features

### 🎓 For Students
- Browse published courses with category & level filters
- View public enrollment counts on every course card
- Enroll in **free courses** instantly
- Pay for **paid courses** via KBZ Pay or Wave Money
- Upload payment screenshot and add notes with payment submission
- Receive **email confirmation** immediately upon enrollment
- Access course learning interface with video, text content, and resources
- Track lesson progress with visual progress bar
- Take lesson **quizzes** and view attempt history
- Earn **certificates** automatically upon course completion
- Participate in **course discussions** (create threads, reply)
- View purchased course history and payment status
- Manage profile and account settings

### 📚 For Instructors
- Receive instructor role **only via admin email invite** (not self-signup)
- Create, edit, and publish courses
- Add lessons with video URLs, text content, and file resources
- Set course **duration in hours** (e.g. `1.5` → stored as 90 minutes, displayed as `1h 30m`)
- Set lesson duration per lesson
- Build **quizzes** with multiple-choice questions and passing score thresholds
- View student enrollments and analytics
- Track course performance and revenue

### 🛡️ For Admins
- **Admin Portal** with consistent premium design across all pages
- Invite instructors via email (magic link + role assignment)
- Manage all users — view roles, joined date, and enrollments
- **Unenroll any student** from any course with one click (confirmation dialog)
- Approve or reject **manual payments** (KBZ / Wave)
  - View payment screenshot in zoomed modal
  - On approval: student is automatically enrolled + **email sent**
- Manage **course categories** with colors and ordering
- Assign instructors to courses
- View platform analytics: revenue, enrollment trends, top courses
- View all payments with search and status filter

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `profiles` | User accounts — roles: `student`, `instructor`, `admin` |
| `courses` | Course metadata, pricing, thumbnail, category, level |
| `lessons` | Individual lessons with video, content, duration |
| `lesson_resources` | File/link/slide/note attachments per lesson |
| `enrollments` | Student ↔ Course enrollment records |
| `lesson_completions` | Per-lesson completion tracking |
| `payments` | Payment records — supports KBZ, Wave, Stripe |
| `certificates` | Auto-generated on course completion |
| `discussions` | Course discussion threads |
| `discussion_replies` | Replies to discussion threads |
| `quizzes` | Quiz linked to a lesson |
| `quiz_questions` | Multiple-choice questions |
| `quiz_attempts` | Student quiz attempt history |
| `categories` | Course categories with color + icon |
| `instructor_invites` | Email invite tokens for instructor onboarding |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password, magic links) |
| Storage | Supabase Storage (payment proofs, course covers, resources) |
| Email | [Resend](https://resend.com) — enrollment confirmations & admin alerts |
| Payments | Myanmar manual payments (KBZ Pay, Wave Money) + Stripe (optional) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase project
- Resend account (free tier: 3,000 emails/month)
- Vercel account for deployment

### 1. Clone & Install

```bash
git clone <repository-url>
cd vtmm-lms
pnpm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# ── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Email (Resend) ────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=VT LearnHub <onboarding@resend.dev>
ADMIN_EMAIL=admin@yourdomain.com

# ── Stripe (optional) ─────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── invite-instructor/   # Send instructor email invite
│   │   │   └── unenroll/            # Admin force-unenroll a student
│   │   ├── send-enrollment-email/   # Email trigger after enrollment
│   │   ├── upload/
│   │   │   ├── course-cover/        # Upload course thumbnail
│   │   │   ├── lesson-resource/     # Upload lesson attachments
│   │   │   └── payment-proof/       # Upload payment screenshot
│   │   └── webhooks/stripe/         # Stripe webhook handler
│   ├── auth/                        # Login, sign-up, password reset
│   ├── courses/                     # Public course browse + detail
│   ├── dashboard/
│   │   ├── admin/                   # Admin portal pages
│   │   │   ├── analytics/
│   │   │   ├── assignments/         # Assign instructors to courses
│   │   │   ├── categories/
│   │   │   ├── courses/
│   │   │   ├── payments/            # Manual payment approvals
│   │   │   └── users/               # User management + unenroll
│   │   ├── courses/                 # Instructor course management
│   │   ├── my-courses/              # Student enrolled courses
│   │   ├── certificates/
│   │   ├── discussions/
│   │   ├── purchases/               # Student payment history
│   │   └── settings/
│   └── actions/                     # Server actions (db.ts, stripe.ts, auth.ts)
├── components/
│   ├── ui/                          # shadcn/ui base components
│   ├── dashboard/                   # Course editor, admin panels
│   ├── checkout.tsx                 # Myanmar payment checkout dialog
│   ├── course-enroll-button.tsx     # Smart enroll button (free/paid/enrolled)
│   ├── course-learning-view.tsx     # Full learning interface
│   └── course-reviews.tsx           # Student reviews
├── lib/
│   ├── supabase/                    # Supabase client (client.ts, server.ts)
│   ├── email.ts                     # Resend email helpers
│   ├── duration.ts                  # Duration format (minutes → "1h 15m")
│   ├── format-currency.ts           # MMK formatting
│   └── types.ts                     # TypeScript types
└── public/                          # Static assets (logo, etc.)
```

---

## 🔄 Key Flows

### Instructor Onboarding
1. Admin goes to **Admin → Users** and clicks **Invite Instructor**
2. Enters instructor's email and full name
3. Supabase sends a magic link email
4. Instructor clicks link, sets password, and is automatically given `instructor` role
5. Instructor can now create and manage courses

### Free Course Enrollment
1. Student clicks **Enroll for Free** on course page
2. Enrollment is created instantly
3. Student receives **email confirmation** via Resend
4. Admin receives **new enrollment notification**
5. Student is redirected to the course learning page

### Paid Course Enrollment
1. Student clicks **Enroll Now — Pay via KBZ / Wave**
2. Payment dialog opens: student selects KBZ Pay or Wave Money
3. Student transfers money to displayed account number
4. Student fills in: Transaction ID, Sender Name, **Payment Screenshot** (required), **Additional Notes** (required)
5. Payment record created with `pending` status
6. Admin receives payment in **Admin → Payment Approvals**
7. Admin reviews screenshot and approves or rejects
8. On approval: enrollment created → student receives **email confirmation**

### Course Completion & Certificates
1. Student completes all lessons (clicking "Mark Complete")
2. Progress reaches 100%
3. Certificate automatically generated with unique certificate number
4. Certificate available at `/dashboard/certificates`

---

## 📧 Email Notifications

Emails are sent via [Resend](https://resend.com):

| Trigger | Recipient | Content |
|---|---|---|
| Free course enrollment | Student | Enrollment confirmation + course link |
| Paid payment approved | Student | Payment confirmed + course link |
| Free course enrollment | Admin | New enrollment notification |
| Paid payment approved | Admin | Payment approved + amount |

---

## 🏗️ Admin Panel Features

| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Platform stats overview |
| Users | `/dashboard/admin/users` | All users, roles, + per-user unenroll |
| Courses | `/dashboard/admin/courses` | All courses management |
| Categories | `/dashboard/admin/categories` | Course categories with colors |
| Assignments | `/dashboard/admin/assignments` | Assign instructors to courses |
| Payments | `/dashboard/admin/payments` | Approve/reject KBZ & Wave payments |
| Analytics | `/dashboard/admin/analytics` | Revenue, enrollment trends |

---

## 🚢 Deployment to Vercel

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add all environment variables (see section above)
4. Add Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
5. Deploy — Vercel auto-deploys on every `git push`

> **Tip:** Use `pnpm run build` locally to catch TypeScript/build errors before pushing.

---

## 📄 License

MIT License — see LICENSE file for details.

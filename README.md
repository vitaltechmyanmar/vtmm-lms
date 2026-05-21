# EduFlow - Learning Management System

A comprehensive learning management system built with Next.js, Supabase, and Stripe. Designed for instructors to create and manage courses, students to learn and earn certificates, and admins to oversee the platform.

## Features

### For Students
- Browse and enroll in courses
- Complete lessons with video and text content
- Track progress through courses
- Earn certificates upon completion
- Participate in course discussions
- View enrolled courses and learning history

### For Instructors
- Create and publish courses
- Add video lessons with descriptions
- Manage student enrollments
- Track course performance and revenue
- View student progress and analytics
- Edit and update courses anytime

### For Admins
- Monitor platform statistics
- Manage users and roles
- View system-wide analytics
- Manage courses and content
- Handle support and moderation

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel

## Database Schema

### Tables
- `profiles` - User profiles and roles (student, instructor, admin)
- `courses` - Course information and metadata
- `lessons` - Individual lessons within courses
- `enrollments` - Student enrollments in courses
- `lesson_progress` - Track student progress on lessons
- `payments` - Payment records and Stripe integration
- `certificates` - Earned certificates
- `discussions` - Course discussions
- `discussion_replies` - Replies to discussions
- `quiz_questions` - Quiz questions
- `quizzes` - Course quizzes
- `quiz_attempts` - Student quiz attempts

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account
- Stripe account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd v0-project
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=your_site_url

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Run the development server
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## Key Pages

### Public Pages
- `/` - Home page with platform overview
- `/courses` - Browse all published courses
- `/courses/[courseId]` - Course detail page
- `/auth/login` - User login
- `/auth/sign-up` - User registration

### Authenticated Pages
- `/dashboard` - Main dashboard (role-based)
  - Students: Enrolled courses and progress
  - Instructors: Course management
  - Admins: Platform overview

### Student Pages
- `/dashboard/my-courses` - All enrolled courses
- `/courses/[courseId]/learn` - Course learning interface
- `/dashboard/certificates` - Earned certificates

### Instructor Pages
- `/dashboard/courses` - Course management
- `/dashboard/courses/new` - Create new course
- `/dashboard/courses/[courseId]` - Edit course

### Admin Pages
- `/dashboard/admin/users` - User management
- `/dashboard/admin/analytics` - Platform analytics

## API Routes

### Authentication
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `POST /api/auth/callback` - Email verification callback

### Payments
- `POST /api/stripe/create-checkout` - Create checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Course Operations
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (instructor only)
- `GET /api/courses/[id]` - Get course detail
- `PUT /api/courses/[id]` - Update course (instructor only)

## Server Actions

All data operations use Next.js Server Actions for security:

### Auth Actions (`app/actions/auth.ts`)
- `signUp()` - Register user
- `signIn()` - Login user
- `signOut()` - Logout user
- `getUser()` - Get current user

### Database Actions (`app/actions/db.ts`)
- `getCourses()` - Fetch courses with filters
- `getCourseDetail()` - Get full course with lessons
- `getStudentEnrollments()` - Get student's courses
- `createCourse()` - Create new course
- `createLesson()` - Add lesson to course
- `markLessonComplete()` - Track student progress
- `getAllUsers()` - Admin: Get all users
- `getEnrollmentStats()` - Admin: Platform stats

### Stripe Actions (`app/actions/stripe.ts`)
- `createCourseCheckoutSession()` - Initialize payment

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings
4. Configure Stripe webhook URL: `https://your-domain.com/api/webhooks/stripe`
5. Deploy!

## Development

### Project Structure
```
├── app/
│   ├── api/                    # API routes
│   ├── auth/                   # Auth pages
│   ├── courses/                # Course pages
│   ├── dashboard/              # Dashboard pages
│   ├── actions/                # Server actions
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── ui/                     # Shadcn UI components
│   ├── dashboard/              # Dashboard components
│   ├── checkout.tsx            # Stripe checkout
│   └── course-*.tsx            # Course components
├── lib/
│   ├── supabase/               # Supabase client setup
│   ├── stripe.ts               # Stripe initialization
│   └── types.ts                # TypeScript types
├── public/                     # Static assets
└── styles/                     # Global styles
```

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

## Authentication Flow

1. User signs up with email/password
2. Supabase sends verification email
3. User clicks verification link
4. User is redirected to login page
5. User logs in and is authenticated
6. User profile is created in `profiles` table

## Payment Flow

1. Student selects paid course and clicks "Enroll"
2. Stripe checkout session is created
3. Payment information is captured in Stripe
4. Webhook confirms payment completion
5. Student enrollment is automatically created
6. Student gains access to course

## Course Completion & Certificates

1. Student completes all lessons in course
2. System marks course as completed
3. Certificate is automatically generated
4. Certificate is available in student's dashboard

## Support

For issues and feature requests, please open an issue on GitHub or contact support.

## License

MIT License - see LICENSE file for details.

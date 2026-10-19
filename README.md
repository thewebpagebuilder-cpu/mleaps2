# MLEAPS Six Sigma Assessment Platform 🚀

A modern, high-fidelity Six Sigma Assessment Platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Drizzle ORM** with **PostgreSQL**.

---

## 🌟 Features

- **Candidate Exam Arena**:
  - Live 25-question timed assessment across all DMAIC phases (Define, Measure, Analyze, Improve, Control).
  - Real-time timer, progress tracking, question bookmarks, and immediate review.
  - Automatic scoring with pass/fail evaluation (70% passing threshold).
  - Rich question explanations with Six Sigma formulas and industry principles.
- **Verification Gate**:
  - Candidate identity validation and assessment window verification.
  - Prevention of unauthorized attempts or expired windows.
- **Comprehensive Scorecard**:
  - Score breakdown by DMAIC phase.
  - Detailed answer explanations and bell curve / normal distribution visualization.
  - Assessment summary and completion certificate readiness.
- **Admin Dashboard**:
  - Real-time candidate assignment management.
  - Exam attempt audit log and historical score tracking.
  - Question bank manager with ability to add custom questions or reset to standard canonical 25 questions.
  - Cohort analytics and pass-rate tracking.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) and `pg`

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.18+ or v20+ recommended)
- PostgreSQL database (Local, [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or Vercel Postgres)

### 2. Environment Setup

Create a `.env` or `.env.local` file in the root directory:

```bash
DATABASE_URL="postgresql://username:password@your-db-host:5432/mleaps_sixsigma?sslmode=require"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup & Seeding

The database will automatically seed with canonical Six Sigma questions, test candidate assignments, and historical attempts upon first API request, or you can run migrations with Drizzle.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. **Push to GitHub**:
   Ensure your code is pushed to your GitHub repository (e.g., `thewebpagebuilder-cpu/mleaps2`).
2. **Import Project to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository (`thewebpagebuilder-cpu/mleaps2`).
3. **Configure Environment Variables**:
   - In the Vercel project configuration, add:
     - `DATABASE_URL`: Your PostgreSQL connection string (Neon, Supabase, Vercel Postgres, etc.).
4. **Deploy**:
   - Click **Deploy**. Vercel will automatically build and deploy your application.

---

## 📜 License

MIT © MLEAPS Team

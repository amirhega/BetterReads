# BetterReads

A modern Goodreads alternative inspired by Letterboxd and Beli. Track your reading, rank books through head-to-head comparisons, and share beautiful cards of your reading stats.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (dark theme)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Book Data**: Open Library API

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

## Features

- Book search via Open Library API
- Personal library with shelves (Want to Read, Currently Reading, Read)
- Reading diary with mood tags and format tracking
- Beli-style comparative ranking (A vs B comparisons)
- User profiles, follow system, and activity feed
- Visual shareable cards for reviews and stats

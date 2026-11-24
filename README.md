# Jonoshokti

**Jonoshokti** (*People's Power*) is a Bangladeshi civic engagement platform that empowers citizens to raise, prioritize, discuss, and track public and government issues alongside grassroots community service initiatives.

## Features

- **Live Civic Dashboard (`/`)**: Real-time statistics, resolution rate, citizen vote totals, and top prioritized issues.
- **Current Citizen Issues (`/current-issues`) & Government Issues (`/govt-issues`)**: Search, status filtering, sorting, toggleable upvoting/downvoting, and raising new issues directly to MongoDB.
- **Solved Issues (`/solved-issues`)**: Dedicated showcase of resolved civic and government issues.
- **Issue Details & Discussion (`/issues/:source/:id`)**: Full issue view with persistent voting, live status updates, share link, and citizen comments.
- **Reports & Insights (`/reports`)**: Live accountability analytics, status distribution bars, channel breakdown, and priority table.
- **Community Service (`/community-service`)**: Searchable volunteer opportunities with category/mode filters and volunteer sign-up.
- **Contact Us (`/contact-us`)**: Validated contact form saved directly to MongoDB.
- **Coherent Light & Dark Theme**: Civic Emerald design system with persistent light/dark mode toggle and live notification popover.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Lucide Icons, Axios
- **Backend**: Express.js, Mongoose (MongoDB Atlas)
- **Deployment**: Vercel (static Vite build + `/api` serverless function)

## Local Development

1. Copy `backend/.env.example` to `backend/.env` and set `DB_URI`.
2. Install dependencies:
   ```bash
   npm install
   npm --prefix frontend install
   ```
3. Run the backend API and frontend dev server in separate terminals:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

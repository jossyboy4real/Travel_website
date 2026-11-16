# Travel Website

A travel-booking project with a React/Vite frontend and an Express/MongoDB backend. The backend currently includes Firebase authentication and API modules for destinations, tours, hotels, and flight search.

## Requirements

- Node.js with npm
- A reachable MongoDB database
- Firebase project credentials for authentication
- An Ignav API key for live flight searches

## Local setup

1. Install the root/backend dependencies:

   ```powershell
   npm install
   ```

2. Install frontend dependencies:

   ```powershell
   npm install --prefix frontend
   ```

3. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URL` and `IGNAV_API_KEY`.
4. Put your Firebase Admin service-account JSON in the project root as `serviceAccountKey.json`. Keep it private; it is ignored by Git.
5. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_FIREBASE_WEB_API_KEY`. `VITE_API_URL` defaults to `http://localhost:5000`.
6. Start the backend from the project root:

   ```powershell
   npm run dev
   ```

7. In a second terminal, start the frontend:

   ```powershell
   npm run client:dev
   ```

The backend health check is available at `http://localhost:5000/health`. The frontend development URL is printed by Vite.

## API routes

- `GET /api/destinations` and `GET /api/destinations/:id`; POST, PUT, and DELETE manage destinations.
- `GET /api/tours` and `GET /api/tours/:id`; POST, PUT, and DELETE manage tours.
- `GET /api/hotels` and `GET /api/hotels/:id`; POST, PUT, and DELETE manage hotels.
- `POST /api/flights/search` sends flight search criteria to Ignav.
- `POST /api/users/sync` syncs the authenticated Firebase user.
- `GET /api/admin/dashboard` checks admin access.

## Keep credentials private

Never commit `.env` files, `serviceAccountKey.json`, API keys, passwords, or authentication tokens. Use the `.env.example` files as templates and keep credentials in local, ignored files.

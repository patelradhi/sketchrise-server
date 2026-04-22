# Future Plans

Things parked for later. Short list, not a design doc.

## 1. Role-based access
Add a `role` field in Clerk `publicMetadata` (`"user" | "admin"`). Admins can see every user's plans via `GET /api/floor-plans?scope=all`; regular users keep seeing only their own.

## 2. User collection
When we add roles (or quotas, subscriptions, preferences), create `models/User.ts` with `clerkUserId`, `role`, `generationsUsedThisMonth`, `subscriptionTier`. Upsert lazily on first authed request.

## 3. Export JSON structure
One more button on the result page that downloads `job.structure` as a `.json` file.

## 4. Interactive 3D viewer
Render `job.structure` with React Three Fiber so the user can orbit the scene, not just view the flat image.

## 5. Background job queue
Move Gemini calls into BullMQ + Redis once concurrent generations start blocking the API thread.

## 6. Email attachment share
Swap the Email share button to `expo-sharing.shareAsync(localFile)` so the image goes as a real attachment instead of a link.

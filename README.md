Miwavo - Social Network App 🚀
Miwavo is a next-generation social network application built from scratch. It combines profile discovery, real-time messaging, micro-blogging, and geolocated events into a single, seamless mobile-first interface.

🛠 Tech Stack
Frontend: React 18 (Vite), TypeScript
Backend/Database: Supabase (Auth, PostgreSQL, Realtime, Storage)
State Management: React Context API
Styling: Pure CSS (Semantic classes, Mobile-first design)

✨ Key Features
Discover: Algorithm-based profile recommendation system (swipe/card interface).
Miwas: Send and manage connection invitations.
Mivos: Real-time private messaging system (accessible after connection).
Mivibes: Micro-blogging feed with text and announcements, featuring an "Optimistic UI" for instant rendering.
Mitribes: Community groups based on specific interests (public/private roles).
Local: Discovery and creation of geolocated events.

⚙️ Technical Highlights
Optimistic UI: Implemented instant UI updates for messaging and posting, with temporary IDs and error rollbacks.
Real-time Synchronization: Subscriptions to Supabase Realtime for live messaging and feed updates, with duplicate checking.
Crash Prevention: Strict use of optional chaining (?.) and fallbacks to handle null relational data from Supabase and prevent white screens.

# 🛒 FastGrocery - Full Stack Real-Time Delivery Platform

A premium, modern grocery e-commerce and delivery tracking platform. Built with **Next.js 16 (Turbopack)**, **TypeScript**, **Redux Toolkit**, **MongoDB (Mongoose)**, **Tailwind CSS**, and **Socket.IO** to handle real-time GPS tracking and live chats.

---

## 🏗️ Architecture & Component Overview

The codebase is split into two specialized services to ensure smooth horizontal scaling and socket persistency in production:

```mermaid
graph TD
  A[Next.js Web Client] <-->|HTTP REST & WebSockets| B[Next.js App Server (Port 3000)]
  A <-->|Persistent WebSocket Events| C[Socket.IO Server (Port 4000)]
  C <-->|Server-to-Server API Calls| B
  B <-->|Mongoose Pool| D[(MongoDB Database)]
```

### 1. `fastgrocery/` (Next.js Application)
- **Role-Based Portal Paths**: Custom dashboards for **Customers**, **Store Administrators**, and **Delivery Partners**.
- **State Management**: Redux Toolkit for cart operations, local caching, and profile coordinates.
- **Route Protection**: Custom Edge-level request proxying rules configured in `proxy.ts`.
- **Database Engine**: Mongoose schemas with 2dsphere geolocation indexing.

### 2. `socketServer/` (Real-Time Relay Server)
- **Persistent Socket Channels**: Manages room channels grouped by dynamic Order IDs.
- **GPS Coordinates Relay**: Receives geolocator ticks from active delivery partners and broadcasts coordinates to watching customers in real-time.
- **Server API Sync**: Makes background REST API posts to Next.js endpoints to persist message logs and connection status.

---

## 🌟 Key Features

### 👤 Role-Based Portals & Onboarding
- **Splashed Welcome Wizard**: Dynamic greeting animations (Framer Motion) and eye-toggles.
- **First-Time Setup**: Prompts users to define their role (Customer / Administrator / Delivery Partner) and register their mobile number.

### 🏪 Admin Inventory & Dispatch Center
- **Product Management**: Upload grocery catalog items with prices, categories, units, and images.
- **Cloudinary Integration**: Automatic streaming image uploader with Unsplash local image fallbacks.
- **Order Dispatch**: Aggregated charts monitoring order details and real-time status transitions.

### 🛒 Customer E-Commerce Checkout
- **Intuitive Cart System**: Calculates prices, items, and free delivery thresholds (free above ₹100, ₹40 flat fee otherwise).
- **Draggable Interactive Maps**: OpenStreetMap (via Leaflet) geolocations reverse-mapped to readable street addresses using Nominatim API.
- **Hybrid Payments**: Integrated Stripe Checkout checkout sessions along with Cash on Delivery (COD) fallbacks.

### 🏍️ Live GPS & Gemini AI Chat Tracking
- **Interactive Routing Polyline**: Dashed route maps updating delivery boy markers dynamically relative to the customer's house icon.
- **Gemini Quick Replies**: Instant chip suggestion engines querying Google's Gemini models for context-aware chat replies.
- **OTP Verification Safeguards**: Sends 4-digit verification pins to customer emails (Gmail SMTP / Console log outputs).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn
- A MongoDB cluster instance (Atlas or local)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/adityakumarprasad/Delivery_Full_Stack.git
   cd Delivery_Full_Stack
   ```

2. Set up the **Socket.IO Server**:
   ```bash
   cd socketServer
   npm install
   # Create a .env file following .env.example
   npm run dev
   ```

3. Set up the **Next.js Web Application**:
   ```bash
   cd ../fastgrocery
   npm install --legacy-peer-deps
   # Create a .env file following .env.example
   npm run dev
   ```

---

## ⚙️ Environment Configurations

Refer to the `.env.example` templates in both folders to supply the required keys:

### Next.js Variables (`fastgrocery/.env`)
```env
MONGODB_URL="your-mongodb-connection-string"
AUTH_SECRET="your-auth-secret-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
GEMINI_API_KEY="your-gemini-api-key"
EMAIL="your-gmail-address@gmail.com"
PASS="your-16-character-gmail-app-password"
NEXT_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_SERVER="http://localhost:4000"
```

---

## ☁️ Deployment Strategy

Due to Vercel's serverless runtime boundaries (which disconnect persistent WebSocket connections), the recommended production deployment is:
1. Deploy **`fastgrocery`** directly to **Vercel**.
2. Deploy **`socketServer`** to **Render** or **Railway**.
3. Update environment cross-pings:
   - Configure Vercel's `NEXT_PUBLIC_SOCKET_SERVER` to match your Render deployment URL.
   - Configure Render's `NEXT_BASE_URL` to match your Vercel deployment URL.

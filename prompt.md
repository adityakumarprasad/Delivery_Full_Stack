# 🛒 FastGrocery — Complete Project Recreation Prompt

> **Use this prompt to recreate the exact same FastGrocery project from scratch. Hand it to any AI coding assistant.**

---

## 📌 PROJECT OVERVIEW

Build **"FastGrocery"** — a full-stack, real-time grocery delivery web application with **three user roles**: `user`, `admin`, and `deliveryBoy`. The app features:

- User registration/login (credentials + Google OAuth)
- Role & mobile number onboarding after first login
- Admin dashboard with revenue analytics & order management
- User-facing grocery catalog with search, cart, checkout (COD + Stripe online payment)
- Real-time delivery assignment broadcasting to nearby delivery boys
- Live GPS tracking of delivery boy on a map (Leaflet)
- Real-time chat between user ↔ delivery boy (Socket.IO) with AI-powered reply suggestions (Gemini API)
- OTP-based delivery verification via email (Nodemailer)
- Cloudinary image uploads for grocery items

---

## 🏗️ TECH STACK

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion (via `motion/react`) |
| **Icons** | Lucide React |
| **State Management** | Redux Toolkit + React Redux |
| **Auth** | NextAuth v5 (beta 30) — Credentials + Google OAuth, JWT strategy |
| **Database** | MongoDB Atlas (Mongoose v9) |
| **Payments** | Stripe (Checkout Sessions + Webhooks) |
| **Real-time** | Socket.IO (separate Express server on port 4000) |
| **Maps** | Leaflet + React-Leaflet + leaflet-geosearch (OpenStreetMap) |
| **Image Upload** | Cloudinary (v2, upload_stream) |
| **Email** | Nodemailer (Gmail SMTP) |
| **AI Chat Suggestions** | Google Gemini API (gemini-2.5-flash) |
| **Charts** | Recharts |
| **HTTP Client** | Axios |

---

## 📁 COMPLETE FILE STRUCTURE

```
fastgroc/
├── socketServer/                    # Separate Socket.IO server
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── node_modules/
│
└── fastgrocery/                     # Next.js 16 App
    ├── .env
    ├── .gitignore
    ├── auth.ts                      # NextAuth config (Credentials + Google)
    ├── proxy.ts                     # Middleware for route protection
    ├── Provider.tsx                 # SessionProvider wrapper
    ├── InitUser.tsx                 # Auto-fetch user data on auth
    ├── global.d.ts                  # Global mongoose type declaration
    ├── next-auth.d.ts               # NextAuth type extensions (role)
    ├── next.config.ts               # Image remote patterns
    ├── package.json
    ├── tsconfig.json
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    │
    ├── assets/
    │   └── google.png               # Google login button icon
    │
    ├── hooks/
    │   └── useGetMe.tsx             # Custom hook to fetch /api/me → Redux
    │
    ├── lib/
    │   ├── db.ts                    # MongoDB connection (cached singleton)
    │   ├── cloudinary.ts            # Cloudinary upload helper
    │   ├── socket.ts                # Socket.IO client singleton
    │   ├── emitEventHandler.ts      # Server-side → socket server notify helper
    │   └── mailer.ts                # Nodemailer transporter (Gmail)
    │
    ├── redux/
    │   ├── store.ts                 # Redux store (cart + user slices)
    │   ├── StoreProvider.tsx        # Redux Provider wrapper
    │   ├── cartSlice.ts             # Cart state (add, remove, qty, totals)
    │   └── userSlice.ts             # User data state
    │
    ├── components/
    │   ├── Nav.tsx                   # Responsive navbar (role-aware)
    │   ├── HeroSection.tsx          # Auto-sliding hero carousel
    │   ├── CategorySlider.tsx       # Horizontal category scroller
    │   ├── GroceryItemCard.tsx      # Product card with add-to-cart
    │   ├── UserDashboard.tsx        # User home (hero + categories + items)
    │   ├── AdminDashboard.tsx       # Admin SSR data aggregation
    │   ├── AdminDashboardClient.tsx # Admin stats, earnings, bar chart
    │   ├── AdminOrderCard.tsx       # Admin order card with status update
    │   ├── DeliveryBoy.tsx          # Delivery boy SSR wrapper
    │   ├── DeliveryBoyDashboard.tsx # Delivery assignments, active order, OTP
    │   ├── DeliveryChat.tsx         # Chat component (delivery side)
    │   ├── LiveMap.tsx              # Leaflet map with 2 markers + polyline
    │   ├── CheckoutMap.tsx          # Draggable marker map for checkout
    │   ├── GeoUpdater.tsx           # Emit geolocation via socket
    │   ├── UserOrderCard.tsx        # User's order card with tracking
    │   ├── EditRoleMobile.tsx       # Onboarding: select role + mobile
    │   ├── Welcome.tsx              # Registration welcome/splash screen
    │   ├── registerForm.tsx         # Registration form
    │   └── Footer.tsx               # Site footer
    │
    └── app/
        ├── globals.css              # Tailwind import + scrollbar-hide
        ├── layout.tsx               # Root layout (providers wrapping)
        ├── page.tsx                 # Home (SSR: role-based rendering)
        ├── favicon.ico
        │
        ├── login/
        │   └── page.tsx             # Login page (credentials + Google)
        ├── register/
        │   └── page.tsx             # Register page (2-step: Welcome → Form)
        ├── unauthorized/
        │   └── page.tsx             # Access denied page
        │
        ├── models/
        │   ├── user.model.ts
        │   ├── grocery.model.ts
        │   ├── order.model.ts
        │   ├── message.model.ts
        │   └── deliveryAssignment.model.ts
        │
        ├── user/
        │   ├── cart/page.tsx
        │   ├── checkout/page.tsx
        │   ├── my-orders/page.tsx
        │   ├── order-success/page.tsx
        │   └── track-order/[orderId]/page.tsx
        │
        ├── admin/
        │   ├── add-grocery/page.tsx
        │   ├── manage-orders/page.tsx
        │   └── view-grocery/page.tsx
        │
        └── api/
            ├── auth/
            │   ├── [...nextauth]/route.ts
            │   └── register/route.ts
            ├── me/route.ts
            ├── check-for-admin/route.ts
            ├── admin/
            │   ├── add-grocery/route.ts
            │   ├── edit-grocery/route.ts
            │   ├── delete-grocery/route.ts
            │   ├── get-groceries/route.ts
            │   ├── get-orders/route.ts
            │   └── update-order-status/[orderId]/route.ts
            ├── user/
            │   ├── order/route.ts
            │   ├── payment/route.ts
            │   ├── my-orders/route.ts
            │   ├── edit-role-mobile/route.ts
            │   ├── get-order/[orderId]/route.ts
            │   └── stripe/webhook/route.ts
            ├── delivery/
            │   ├── get-assignments/route.ts
            │   ├── current-order/route.ts
            │   ├── assignment/[id]/accept-assignment/route.ts
            │   └── otp/
            │       ├── send/route.ts
            │       └── verify/route.ts
            ├── chat/
            │   ├── save/route.ts
            │   ├── messages/route.ts
            │   └── ai-suggestions/route.ts
            └── socket/
                ├── connect/route.ts
                └── update-location/route.ts
```

---

## 🔐 ENVIRONMENT VARIABLES

### `fastgrocery/.env`
```env
MONGODB_URL='<your-mongodb-atlas-connection-string>'
NEXTAUTH_SECRET='<your-secret>'
AUTH_SECRET='<your-secret>'
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID='<your-google-client-id>'
GOOGLE_CLIENT_SECRET='<your-google-client-secret>'
CLOUDINARY_CLOUD_NAME='<your-cloudinary-cloud-name>'
CLOUDINARY_API_KEY='<your-cloudinary-api-key>'
CLOUDINARY_API_SECRET='<your-cloudinary-api-secret>'
STRIPE_SECRET_KEY='<your-stripe-secret-key>'
NEXT_BASE_URL="http://localhost:3000"
STRIPE_WEBHOOK_SECRET="<your-stripe-webhook-secret>"
NEXT_PUBLIC_SOCKET_SERVER="http://localhost:4000"
GEMINI_API_KEY="<your-gemini-api-key>"
EMAIL=<your-gmail-email>
PASS=<your-gmail-app-password>
```

### `socketServer/.env`
```env
NEXT_BASE_URL="http://localhost:3000"
PORT=4000
```

---

## 📦 DEPENDENCIES

### Next.js App (`fastgrocery/package.json`)
```json
{
  "name": "fastgroc",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.11.2",
    "@types/leaflet": "^1.9.21",
    "axios": "^1.13.4",
    "bcryptjs": "^3.0.3",
    "cloudinary": "^2.9.0",
    "framer-motion": "^12.29.2",
    "leaflet": "^1.9.4",
    "leaflet-geosearch": "^4.2.2",
    "lucide-react": "^0.563.0",
    "mongoose": "^9.1.5",
    "motion": "^12.29.2",
    "next": "16.1.6",
    "next-auth": "^5.0.0-beta.30",
    "nodemailer": "^7.0.13",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-leaflet": "^5.0.0",
    "react-redux": "^9.2.0",
    "recharts": "^3.7.0",
    "socket.io-client": "^4.8.3",
    "stripe": "^20.3.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/nodemailer": "^7.0.10",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### Socket Server (`socketServer/package.json`)
```json
{
  "name": "socketserver",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "axios": "^1.13.5",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "mongoose": "^9.2.1",
    "nodemon": "^3.1.11",
    "socket.io": "^4.8.3"
  }
}
```

---

## 🗄️ DATABASE MODELS (MongoDB/Mongoose)

### 1. User Model (`app/models/user.model.ts`)

**Interface `IUser`:**
```typescript
{
  _id?: mongoose.Types.ObjectId
  name: string           // required
  email: string          // unique, required
  password?: string      // optional (not needed for Google OAuth)
  mobile?: string        // optional
  role: "user" | "deliveryBoy" | "admin"  // default "user"
  image?: string
  location?: {           // GeoJSON Point
    type: { type: String, enum: ["Point"], default: "Point" }
    coordinates: { type: [Number], default: [0, 0] }
  }
  socketId: string | null  // default null
  isOnline: Boolean        // default false
}
```
- Timestamps enabled
- **2dsphere index** on `location` field

### 2. Grocery Model (`app/models/grocery.model.ts`)

**Interface `IGrocery`:**
```typescript
{
  _id?: mongoose.Types.ObjectId
  name: string           // required
  category: string       // required, enum (see categories below)
  price: string          // required
  unit: string           // required, enum ["kg", "g", "liter", "ml", "piece", "pack"]
  image: string          // required — Cloudinary URL
  createdAt?: Date
  updatedAt?: Date
}
```

**Categories enum:**
```
"Fruits & Vegetables", "Dairy & Eggs", "Rice, Atta & Grains",
"Snacks & Biscuits", "Spices & Masalas", "Beverages & Drinks",
"Personal Care", "Household Essentials", "Instant & Packaged Food",
"Baby & Pet Care"
```

### 3. Order Model (`app/models/order.model.ts`)

**Interface `IOrder`:**
```typescript
{
  _id?: mongoose.Types.ObjectId
  user: ObjectId          // ref: "User", required
  items: [{
    grocery: ObjectId     // ref: "Grocery", required
    name: string
    price: string
    unit: string
    image: string
    quantity: number
  }]
  paymentMethod: "cod" | "online"  // default "cod"
  isPaid: boolean                   // default false
  totalAmount: number
  address: {
    fullName: string
    mobile: string
    city: string
    state: string
    pincode: string
    fullAddress: string
    latitude: number
    longitude: number
  }
  assignment?: ObjectId    // ref: "DeliveryAssignment", default null
  assignedDeliveryBoy?: ObjectId  // ref: "User"
  status: "pending" | "out of delivery" | "delivered"  // default "pending"
  deliveryOtp: string | null      // default null
  deliveryOtpVerification: Boolean  // default false
  deliveredAt: Date
  createdAt?: Date
  updatedAt?: Date
}
```

### 4. DeliveryAssignment Model (`app/models/deliveryAssignment.model.ts`)

**Interface `IDeliveryAssignment`:**
```typescript
{
  _id?: mongoose.Types.ObjectId
  order: ObjectId           // ref: "Order"
  brodcastedTo: ObjectId[]  // ref: "User" — delivery boys it was sent to
  assignedTo: ObjectId | null  // ref: "User" — who accepted
  status: "brodcasted" | "assigned" | "completed"  // default "brodcasted"
  acceptedAt: Date
  createdAt?: Date
  updatedAt?: Date
}
```

### 5. Message Model (`app/models/message.model.ts`)

**Interface `IMessage`:**
```typescript
{
  _id?: mongoose.Types.ObjectId
  roomId: ObjectId     // ref: "Order" — orderId is the chat room
  text: string
  senderId: ObjectId   // ref: "User"
  time: string         // formatted like "02:30 PM"
  createdAt?: Date
  updatedAt?: Date
}
```

---

## 🔑 AUTHENTICATION SYSTEM (NextAuth v5)

**File: `auth.ts`**

### Providers:
1. **Credentials**: email + password login. Connects to DB, finds user by email, compares bcrypt hash. Returns `{ id, email, name, role }`.
2. **Google OAuth**: Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Callbacks:
- **signIn({ user, account })**: For Google provider → finds or creates user in DB. Sets `user.id = dbUser._id.toString()` and `user.role = dbUser.role`.
- **jwt({ token, user, trigger, session })**: If user exists, embed id/name/email/role into token. If `trigger === "update"`, update `token.role = session.role`.
- **session({ session, token })**: Map token fields to `session.user` (id, name, email, role).

### Config:
- `pages.signIn` → `"/login"`
- `pages.error` → `"/login"`
- `session.strategy` → `"jwt"`
- `session.maxAge` → `10 * 24 * 60 * 60 * 1000` (10 days)
- `secret` → `process.env.AUTH_SECRET`

### Type Extensions (`next-auth.d.ts`):
```typescript
declare module "next-auth" {
  interface User {
    id: string; name: string; email: string; role: string;
  }
}
declare module "next-auth" {
  interface Session {
    user: { id: string; role: string; } & DefaultSession["user"]
  }
}
```

### Global Type (`global.d.ts`):
```typescript
declare global {
  var mongoose: {
    conn: Connection | null,
    promise: Promise<Connection> | null
  }
}
```

---

## 🛡️ MIDDLEWARE / ROUTE PROTECTION (`proxy.ts`)

Exported function `proxy(req: NextRequest)` + config matcher.

Logic:
1. **Public routes** bypass: `/login`, `/register`, `/api/auth`, `/favicon.ico`, `/_next`.
2. No JWT token → redirect to `/login?callbackUrl=...`.
3. No session → redirect to `/login?callbackUrl=...`.
4. **Role-based protection**:
   - `/user/*` → only `role === "user"` allowed
   - `/delivery/*` → only `role === "deliveryBoy"` allowed
   - `/admin/*` → only `role === "admin"` allowed
   - Unauthorized → redirect to `/unauthorized`

Matcher: `['/((?!_next/static|_next/image|favicon.ico).*)']`

---

## 🔌 SOCKET.IO SERVER (`socketServer/index.js`)

Separate Express + HTTP + Socket.IO server on port 4000 (ESM module).

### Socket Events:
| Event | Direction | Handler |
|---|---|---|
| `connection` | → Server | Main connection handler |
| `identity` | Client → Server | `POST ${NEXT_BASE_URL}/api/socket/connect` with `{userId, socketId}` |
| `update-location` | Client → Server | Builds GeoJSON Point `{type:"Point", coordinates:[lng,lat]}`, POSTs to `/api/socket/update-location`, then emits `update-deliveryBoy-location` to all |
| `join-room` | Client → Server | `socket.join(roomId)` |
| `send-message` | Client → Server | POSTs to `/api/chat/save`, then emits `send-message` to room |
| `disconnect` | → Server | Logs disconnection |

### REST Endpoint:
```
POST /notify
Body: { event, data, socketId? }
```
If `socketId` → `io.to(socketId).emit(event, data)` (targeted).
Otherwise → `io.emit(event, data)` (broadcast).

### CORS:
```javascript
cors: { origin: process.env.NEXT_BASE_URL }
```

---

## 🧩 LIB UTILITIES

### `lib/db.ts` — MongoDB Connection
- Cached singleton using `global.mongoose = { conn, promise }`.
- Uses `mongoose.connect(mongodburl)`.

### `lib/cloudinary.ts` — Image Upload
- Configures Cloudinary v2 with env vars.
- `uploadOnCloudinary(file: Blob): Promise<string | null>` — converts Blob to Buffer, uses `upload_stream` with `resource_type: "auto"`, returns `secure_url`.

### `lib/socket.ts` — Socket Client Singleton
```typescript
let socket: Socket | null = null
export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER)
  }
  return socket
}
```

### `lib/emitEventHandler.ts` — Server → Socket Notify
```typescript
async function emitEventHandler(event: string, data: any, socketId?: string) {
  await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER}/notify`, { socketId, event, data })
}
```

### `lib/mailer.ts` — Email via Gmail
```typescript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL, pass: process.env.PASS }
})
export const sendMail = async (to, subject, html) => {
  await transporter.sendMail({ from: `"FastGrocery" <${process.env.EMAIL}>`, to, subject, html })
}
```

---

## 🏠 ROOT LAYOUT & PROVIDERS

### `app/layout.tsx`
```
<html>
  <body className="w-full min-h-screen bg-linear-to-b from-green-200 to-white">
    <Provider>              ← NextAuth SessionProvider
      <StoreProvider>       ← Redux Provider
        <InitUser />        ← Fetches /api/me when authenticated, dispatches to Redux
        {children}
      </StoreProvider>
    </Provider>
  </body>
</html>
```

### `app/globals.css`
```css
@import "tailwindcss";
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## 📄 PAGES — DETAILED BEHAVIOR

### `/` — Home Page (Server Component)
- Calls `auth()` and `dbConnect()`. Fetches user from DB by session ID.
- If user missing mobile/role → renders `<EditRoleMobile />` (onboarding screen).
- If `role === "user"` → fetches groceries (with optional `?q=` search param using `$regex`), renders `<Nav>`, `<GeoUpdater>`, `<UserDashboard>`, `<Footer>`.
- If `role === "admin"` → renders `<Nav>`, `<GeoUpdater>`, `<AdminDashboard>`, `<Footer>`.
- If `role === "deliveryBoy"` → renders `<Nav>`, `<GeoUpdater>`, `<DeliveryBoy>`, `<Footer>`.

### `/login` — Login Page (Client Component)
- Email + password inputs with icons (Mail, Lock).
- Password visibility toggle (EyeIcon/EyeOff).
- Uses `signIn("credentials", { email, password, callbackUrl: "/", redirect: true })`.
- Google OAuth button with `signIn("google", { callbackUrl: "/" })`.
- Loading spinner on submit.
- Link to register page.
- Framer Motion entrance animations.

### `/register` — 2-Step Registration (Client Component)
- **Step 1: `<Welcome />`** — Splash screen with floating animated ShoppingBasket + Bike icons, "Get Started" button → `nextStep(2)`.
- **Step 2: `<RegisterForm />`** — Name/email/password form. POSTs to `/api/auth/register`. On success → redirect to `/login`. Google OAuth option. Back button to Step 1.

### `/unauthorized` — Access Denied
- Shows "Access Denied 🚫" with message.

---

### USER PAGES

### `/user/cart` — Cart Page
- Reads `cartData`, `subTotal`, `finalTotal`, `deliveryFee` from Redux.
- Empty → shows ShoppingBasket icon + "Continue Shopping" link.
- Items → each shows image, name, unit, computed price (`price * quantity`), quantity controls (+/-), remove button (Trash2 icon).
- Order summary sidebar (sticky on desktop): subtotal, delivery fee, final total, "Proceed to Checkout" button.
- Delivery fee logic: ₹40 if subtotal ≤ 100, free if > 100.

### `/user/checkout` — Checkout Page
- Two-column grid layout.
- **Left column — Delivery Address:**
  - Pre-filled name and mobile from Redux user data.
  - Fields: fullName, mobile, fullAddress, city, state, pincode.
  - Search input + button — uses `leaflet-geosearch` `OpenStreetMapProvider` to search areas.
  - Interactive Leaflet map (`<CheckoutMap>`) loaded with `dynamic(import, { ssr: false })`.
  - Draggable marker — on drag end, updates position + reverse geocodes via Nominatim API.
  - "Current Location" floating button using `navigator.geolocation.getCurrentPosition`.
  - Auto reverse-geocoding when position changes: `GET https://nominatim.openstreetmap.org/reverse?lat=...&lon=...&format=json`.
- **Right column — Payment:**
  - Two payment options: "Pay Online (Stripe)" and "Cash on Delivery".
  - Order summary: subtotal, delivery fee, final total.
  - "Place Order" / "Pay & Place Order" button.
  - COD → `POST /api/user/order` → navigate to `/user/order-success`.
  - Online → `POST /api/user/payment` → `window.location.href = result.data.url` (Stripe Checkout).

### `/user/my-orders` — My Orders
- Fetches via `GET /api/user/my-orders`.
- Socket listener for `order-assigned` → updates delivery boy info in state.
- Fixed top bar with back button.
- Empty → shows PackageSearch icon + message.
- Each order → `<UserOrderCard>` showing:
  - Order # (last 6 chars of ID), date, paid/unpaid badge, status badge.
  - Payment method icon.
  - Assigned delivery boy info (name, mobile, call button).
  - "Track Your Order" button → navigates to `/user/track-order/[orderId]`.
  - Expandable items list with images.
  - Total amount.
  - Real-time `order-status-update` socket listener per card.

### `/user/order-success` — Order Success
- Animated CheckCircle with pulsing glow.
- "Order Placed Successfully" heading.
- Floating bouncing Package icon.
- "Go to My Orders" button.
- Decorative bouncing/pulsing dots.

### `/user/track-order/[orderId]` — Live Order Tracking
- Fetches order via `GET /api/user/get-order/[orderId]`.
- **LiveMap** — Leaflet map showing:
  - User marker (house icon: `https://cdn-icons-png.flaticon.com/128/4821/4821951.png`)
  - Delivery boy marker (bike icon: `https://cdn-icons-png.flaticon.com/128/9561/9561688.png`)
  - Green polyline between them.
  - Auto-recenters on delivery boy location changes.
- Socket listener for `update-deliveryBoy-location` → updates delivery boy marker.
- **Chat section:**
  - Joins socket room with orderId.
  - Real-time `send-message` listener.
  - AI suggestions button → `POST /api/chat/ai-suggestions` with `role: "user"`.
  - Quick reply chips.
  - Message bubbles (green for own, gray for other).
  - Auto-scroll to bottom on new messages.

---

### ADMIN PAGES

### `/admin/add-grocery` — Add Grocery
- Form: name (text), category (dropdown of 10 categories), unit (dropdown of 6 units), price (text), image upload with preview.
- Submit as FormData → `POST /api/admin/add-grocery`.
- Loading spinner.

### `/admin/view-grocery` — View/Edit/Delete
- Fetches all via `GET /api/admin/get-groceries`.
- Search bar filters client-side by name or category.
- Each grocery: image, name, category, price/unit, "Edit" button.
- **Edit Modal** (AnimatePresence):
  - Image with hover overlay for re-upload.
  - Name, category dropdown, price, unit dropdown.
  - "Edit Grocery" button → `POST /api/admin/edit-grocery` (FormData).
  - "Delete Grocery" button → `POST /api/admin/delete-grocery` with `{ groceryId }`.
  - Page reloads after edit/delete.

### `/admin/manage-orders` — Manage Orders
- Fetches via `GET /api/admin/get-orders`.
- Socket listeners: `new-order` (prepends), `order-assigned` (updates delivery boy).
- Fixed top bar.
- Each order → `<AdminOrderCard>`:
  - Order #, date, customer name/phone/address, payment method, paid/unpaid badge.
  - Assigned delivery boy info + call button (if assigned).
  - **Status dropdown** (pending / out of delivery) → `POST /api/admin/update-order-status/[orderId]`.
  - Expandable items list.
  - Real-time `order-status-update` listener.

---

### DELIVERY BOY DASHBOARD (rendered on `/` for `deliveryBoy` role)

**Server Component (`DeliveryBoy.tsx`):**
- Fetches completed orders for this delivery boy (where `deliveryOtpVerification: true`).
- Calculates today's earnings (₹40 per delivery).
- Passes to `<DeliveryBoyDashboard earning={todaysEarning} />`.

**Client Component (`DeliveryBoyDashboard.tsx`) — 3 States:**

1. **No active order + no assignments:**
   - "No Active Deliveries 🚛" message.
   - Today's performance bar chart (Recharts).
   - Today's earnings display.
   - "Refresh Earning" button.

2. **Has pending assignments:**
   - "Delivery Assignments" heading.
   - Each assignment card: Order ID, address, Accept/Reject buttons.
   - Accept → `GET /api/delivery/assignment/[id]/accept-assignment`.

3. **Has active order:**
   - "Active Delivery" heading with order ID.
   - **LiveMap** showing user location + delivery boy's live location.
   - **DeliveryChat** component.
   - "Mark as Delivered" button → `POST /api/delivery/otp/send`.
   - OTP input → `POST /api/delivery/otp/verify`.
   - On success → reloads page.

**Key behaviors:**
- Emits `identity` on mount with userId.
- `watchPosition` for live GPS → emits `update-location`.
- Listens for `new-assignment` socket event.
- Listens for `update-deliveryBoy-location` socket event.
- Fetches current order and assignments on mount.

---

## 📡 API ROUTES — COMPLETE SPECIFICATION

### Auth Routes
| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth catch-all handler. Exports `{ GET, POST } = handlers` from auth.ts. |
| `/api/auth/register` | POST | Body: `{ name, email, password }`. Validates all fields, password >= 6 chars. Checks existing user. Hashes with bcrypt(10). Creates user. Returns 201. |

### General Routes
| Route | Method | Description |
|---|---|---|
| `/api/me` | GET | Requires auth session. Finds user by email, excludes password. Returns user document. |
| `/api/check-for-admin` | GET | Checks if any user with `role: "admin"` exists. Returns `{ adminExist: boolean }`. |

### User Routes
| Route | Method | Description |
|---|---|---|
| `/api/user/edit-role-mobile` | POST | Body: `{ role, mobile }`. Updates authenticated user's role and mobile. Uses session email to find user. |
| `/api/user/order` | POST | Body: `{ userId, items, paymentMethod, totalAmount, address }`. Creates order. Emits `new-order` socket event. Returns 201. |
| `/api/user/payment` | POST | Same body as order. Creates order + Stripe Checkout session. Returns `{ url }`. Line item: "fastGrocery Order Payment", currency INR. Success URL: `/user/order-success`. Metadata: `{ orderId }`. |
| `/api/user/stripe/webhook` | POST | Verifies Stripe signature. On `checkout.session.completed` → marks order `isPaid: true`. |
| `/api/user/my-orders` | GET | Returns authenticated user's orders, populated with `user` and `assignedDeliveryBoy`, sorted by `createdAt: -1`. |
| `/api/user/get-order/[orderId]` | GET | Returns single order by ID, populated with `assignedDeliveryBoy`. |

### Admin Routes
| Route | Method | Description |
|---|---|---|
| `/api/admin/add-grocery` | POST | FormData: name, category, unit, price, image (file). Uploads to Cloudinary. Admin role check. Creates Grocery document. |
| `/api/admin/edit-grocery` | POST | FormData: groceryId, name, category, unit, price, image (file). Updates grocery. |
| `/api/admin/delete-grocery` | POST | Body: `{ groceryId }`. Deletes grocery. |
| `/api/admin/get-groceries` | GET | Returns all groceries. |
| `/api/admin/get-orders` | GET | Returns all orders populated with `user assignedDeliveryBoy`, sorted desc. |
| `/api/admin/update-order-status/[orderId]` | POST | Body: `{ status }`. Updates order status. **If "out of delivery" and no assignment yet:** finds all delivery boys (any), filters out busy ones (have non-brodcasted/non-completed assignments), creates DeliveryAssignment with status "brodcasted", emits `new-assignment` to each candidate's socketId. Emits `order-status-update`. |

### Delivery Routes
| Route | Method | Description |
|---|---|---|
| `/api/delivery/get-assignments` | GET | Returns assignments where `brodcastedTo` includes current user and `status === "brodcasted"`, populated with `order`. |
| `/api/delivery/current-order` | GET | Returns assignment where `assignedTo === currentUser` and `status === "assigned"`, populated with `order.address`. Returns `{ active: boolean, assignment? }`. |
| `/api/delivery/assignment/[id]/accept-assignment` | GET | Accepts assignment: checks not already assigned elsewhere, sets `assignedTo`, `status: "assigned"`, `acceptedAt`. Updates `order.assignedDeliveryBoy`. Emits `order-assigned`. Removes self from other brodcasted assignments. |
| `/api/delivery/otp/send` | POST | Body: `{ orderId }`. Generates 4-digit OTP, saves to `order.deliveryOtp`, emails to order's user via sendMail. |
| `/api/delivery/otp/verify` | POST | Body: `{ orderId, otp }`. Verifies OTP match. Sets `status: "delivered"`, `deliveryOtpVerification: true`, `deliveredAt: new Date()`. Emits `order-status-update`. Completes assignment (`status: "completed"`, `assignedTo: null`). |

### Chat Routes
| Route | Method | Description |
|---|---|---|
| `/api/chat/save` | POST | Body: `{ senderId, text, roomId, time }`. Validates room (order exists). Creates Message document. |
| `/api/chat/messages` | POST | Body: `{ roomId }`. Returns all messages for that orderId room. |
| `/api/chat/ai-suggestions` | POST | Body: `{ message, role }`. Calls Gemini API with crafted prompt. Returns 3 comma-separated reply suggestions as array. |

### Socket Routes
| Route | Method | Description |
|---|---|---|
| `/api/socket/connect` | POST | Body: `{ userId, socketId }`. Updates user's socketId and isOnline=true. |
| `/api/socket/update-location` | POST | Body: `{ userId, location }`. Updates user's GeoJSON location. |

---

## 🎨 UI / DESIGN SPECIFICATIONS

### Color Scheme
- **Primary**: Green gradient (`green-500` → `green-700`)
- **Body Background**: `bg-linear-to-b from-green-200 to-white`
- **Cards**: White with `rounded-2xl shadow-md hover:shadow-xl border border-gray-100`
- **Buttons**: `bg-green-600 hover:bg-green-700 rounded-full` with `whileTap={{ scale: 0.95 }}`
- **Status badges**: Yellow-100 (pending), Blue-100 (out of delivery), Green-100 (delivered)
- **Payment badges**: Green-100 (paid), Red-100 (unpaid)

### Navbar
- Fixed position, 95% width, centered with `left-1/2 -translate-x-1/2`.
- Green gradient background, rounded-2xl, shadow.
- Left: "FastGrocery" logo link.
- Center: Search bar (users only, hidden on mobile).
- Right: Search toggle (mobile), cart with badge (users), admin links (desktop), hamburger (admin mobile), profile dropdown.
- Admin mobile sidebar: glass-morphism overlay with backdrop-blur, slide-in from left.
- Profile dropdown: animated with AnimatePresence, shows name/role, "My Orders" link (users), logout.

### Hero Section
- 3 auto-sliding images (Unsplash URLs) every 4 seconds.
- Each slide: background image with black/50 overlay + backdrop blur.
- Centered content: icon in glass circle, title, subtitle, CTA button.
- Dot indicators at bottom.

### Category Slider
- Horizontal scrolling with auto-scroll every 2 seconds.
- 10 categories with Lucide icons and colored backgrounds.
- Left/right arrow buttons appear based on scroll position.
- `scrollbar-hide` class.

### Maps
- **CheckoutMap**: Single draggable marker, updates position on drag end.
- **LiveMap**: Two markers (delivery boy + user) with custom icon images from flaticon, green polyline between them, auto-recenter on delivery boy movement.

---

## ⚡ REAL-TIME EVENT FLOW

```
User places order → API creates order → emitEventHandler("new-order", order)
  → Socket server broadcasts "new-order" → Admin's manage-orders receives it

Admin sets "out of delivery" → API finds delivery boys → creates assignment
  → emitEventHandler("new-assignment", assignment, boySocketId)
  → Each delivery boy receives "new-assignment"

Delivery boy accepts → API updates assignment/order
  → emitEventHandler("order-assigned", { orderId, assignedDeliveryBoy })
  → Admin + User receive "order-assigned"

Delivery boy moves → Client emits "update-location" → Socket server
  → POST /api/socket/update-location (saves to DB)
  → io.emit("update-deliveryBoy-location", { userId, location })
  → User's tracking page updates map marker

Chat message → Client emits "send-message" → Socket server
  → POST /api/chat/save (persists) → io.to(roomId).emit("send-message", msg)
  → Both sides receive message

OTP verified → API marks delivered → emitEventHandler("order-status-update", ...)
  → All listeners update status to "delivered"
```

---

## 🗝️ CRITICAL IMPLEMENTATION NOTES

1. **MongoDB Connection Caching**: Uses `global.mongoose = { conn, promise }` pattern for serverless. Check cache before connecting.
2. **Leaflet SSR Fix**: All map components must be loaded with `dynamic(() => import(...), { ssr: false })` because Leaflet requires `window`.
3. **Cart is client-only**: Redux store, NOT persisted to DB. Delivery fee: ₹40 if subtotal ≤ 100, ₹0 if > 100.
4. **Single Admin**: `EditRoleMobile` calls `/api/check-for-admin` on mount. If admin exists, removes "admin" from role options.
5. **One Active Delivery**: Delivery boy can only accept one assignment at a time. Checked in accept-assignment API.
6. **Stripe Webhook**: Uses `req.text()` (raw body) for signature verification with `stripe.webhooks.constructEvent`.
7. **AI Suggestions Prompt**: Tells Gemini to generate 3 WhatsApp-style replies (max 10 words, with emojis) based on role and last message.
8. **OTP**: 4-digit random (`Math.floor(1000 + Math.random() * 9000)`), stored in `order.deliveryOtp`, emailed via Gmail.
9. **Cloudinary Upload**: Converts Blob → ArrayBuffer → Buffer, uses `upload_stream` with callback.
10. **Geolocation**: `navigator.geolocation.watchPosition` with `enableHighAccuracy: true` for continuous tracking.
11. **Image Domains** (next.config.ts): `lh3.googleusercontent.com`, `plus.unsplash.com`, `images.unsplash.com`, `res.cloudinary.com`.
12. **Redux Store**: Two slices — `cart` (cartData, subTotal, deliveryFee, finalTotal with calculateTotals reducer) and `user` (userData).

---

## 🚀 HOW TO RUN

```bash
# Terminal 1: Socket Server
cd socketServer
npm install
npm run dev   # Runs on port 4000

# Terminal 2: Next.js App
cd fastgrocery
npm install
npm run dev   # Runs on port 3000

# Terminal 3 (optional): Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/user/stripe/webhook
```

### First-Time Setup:
1. Register a new user at `/register`.
2. Login → you'll see the role selection + mobile number screen.
3. First person to select "admin" becomes the admin (option disappears for others).
4. Create more accounts for "user" and "deliveryBoy" roles.
5. As admin: add grocery items, manage orders.
6. As user: browse, add to cart, checkout, track orders.
7. As delivery boy: receive assignments, accept, deliver with OTP.

---

> **This prompt contains every detail needed to recreate FastGrocery from scratch — file structure, models, APIs, components, real-time events, UI design, and business logic. No code reading required.**

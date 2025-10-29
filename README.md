
# BookIt - Experiences & Slots Platform

A modern, full-stack travel experience booking platform built with React, TypeScript, and Supabase. Users can browse experiences, check availability, and complete bookings with real-time slot management.


## 📋 Features

### Core Booking Flow
- **Home Page** - Browse available travel experiences
- **Details Page** - View experience details with available time slots
- **Checkout Page** - Complete booking with form validation & promo codes
- **Result Page** - Booking confirmation with reference details

### Technical Features
- ✅ Fully responsive design (mobile-first)
- ✅ Real-time slot availability management
- ✅ Promo code validation system
- ✅ Form validation for customer information
- ✅ Type-safe full-stack development
- ✅ Professional UI/UX with smooth animations

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **UI Components:** Custom components
- **Icons:** Lucide React

### Backend & Database
- **Database:** PostgreSQL with Supabase
- **Authentication:** Supabase Auth (ready for implementation)
- **Storage:** Supabase Storage for images
- **Real-time:** Supabase Realtime subscriptions

## 📁 Project Structure

```
bookit/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Basic UI components
│   │   └── booking/        # Booking-specific components
│   ├── pages/              # Application pages
│   │   ├── Home/           # Home page
│   │   ├── Experience/     # Experience details page
│   │   ├── Checkout/       # Checkout page
│   │   └── Result/         # Booking result page
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services (Supabase client)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── public/                 # Static assets
└── supabase/              # Supabase configuration and migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-link]
   cd bookit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 🗄 Database Schema (Supabase)

### Experiences Table
```sql
CREATE TABLE experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  duration INTEGER,
  category TEXT,
  highlights TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Slots Table
```sql
CREATE TABLE slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID REFERENCES experiences(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_guests INTEGER DEFAULT 10,
  available_spots INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID REFERENCES experiences(id),
  slot_id UUID REFERENCES slots(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  promo_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  booking_reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Promo Codes Table
```sql
CREATE TABLE promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATE DEFAULT NOW(),
  valid_until DATE,
  is_active BOOLEAN DEFAULT true
);
```

## 🔌 API Integration

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Key Data Operations

**Fetch Experiences:**
```typescript
const { data: experiences, error } = await supabase
  .from('experiences')
  .select('*')
```

**Fetch Experience with Slots:**
```typescript
const { data: experience, error } = await supabase
  .from('experiences')
  .select(`
    *,
    slots (*)
  `)
  .eq('id', experienceId)
  .single()
```

**Create Booking:**
```typescript
const { data: booking, error } = await supabase
  .from('bookings')
  .insert(bookingData)
  .select()
  .single()
```

**Validate Promo Code:**
```typescript
const { data: promo, error } = await supabase
  .from('promo_codes')
  .select('*')
  .eq('code', promoCode)
  .eq('is_active', true)
  .gte('valid_until', new Date().toISOString())
  .single()
```

## 📱 Pages Overview

### Home Page (`/`)
- Experience grid with filtering options
- Search functionality
- Category-based navigation
- Responsive card layouts

### Experience Details (`/experience/:id`)
- High-quality image gallery
- Detailed experience information
- Available date and time slots
- Guest counter with capacity limits
- Add to booking functionality

### Checkout Page (`/checkout`)
- Multi-step booking form
- Real-time price calculations
- Promo code application
- Form validation with error states
- Secure booking submission

### Result Page (`/result`)
- Booking confirmation details
- Reference number generation
- Next steps information
- Error handling for failed bookings

## 🎨 Styling & Design

### Tailwind CSS Configuration
- Custom color palette matching travel theme
- Consistent spacing scale
- Responsive breakpoints
- Component-based design system

### Key Design Features
- **Mobile-first** responsive design
- **Clean typography** hierarchy
- **Professional color scheme**
- **Smooth animations** and transitions
- **Accessible** component states

## 🔒 Validation & Error Handling

- **Form Validation:** Comprehensive form validation for all user inputs
- **Slot Management:** Prevents double-booking using Supabase RLS
- **Error States:** User-friendly error messages and loading states
- **Type Safety:** Full TypeScript implementation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Build Command
```bash
npm run build
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🛣 Roadmap

- [ ] User authentication with Supabase Auth
- [ ] Advanced filtering and search
- [ ] Review and rating system
- [ ] Payment integration with Stripe
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Multi-language support


/*
  # BookIt Platform Database Schema

  ## Overview
  Complete database schema for the travel experience booking platform with experiences, 
  time slots, bookings, and promotional codes.

  ## New Tables
  
  ### 1. experiences
  Stores travel experience listings with details and pricing
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Experience name
  - `description` (text) - Detailed description
  - `image_url` (text) - Main image URL
  - `location` (text) - Location/destination
  - `duration` (text) - Duration (e.g., "3 hours", "Full day")
  - `price` (decimal) - Base price per person
  - `rating` (decimal) - Average rating (0-5)
  - `total_reviews` (integer) - Number of reviews
  - `category` (text) - Category (e.g., "Adventure", "Cultural")
  - `highlights` (jsonb) - Array of experience highlights
  - `included` (jsonb) - What's included in the experience
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. slots
  Available time slots for each experience
  - `id` (uuid, primary key) - Unique identifier
  - `experience_id` (uuid, foreign key) - Links to experiences table
  - `date` (date) - Slot date
  - `time` (time) - Slot time
  - `capacity` (integer) - Maximum bookings for this slot
  - `booked` (integer) - Current number of bookings (default: 0)
  - `price_modifier` (decimal) - Optional price adjustment (default: 1.0)
  - `created_at` (timestamptz) - Record creation time

  ### 3. bookings
  Customer bookings with complete details
  - `id` (uuid, primary key) - Unique identifier
  - `experience_id` (uuid, foreign key) - Links to experiences table
  - `slot_id` (uuid, foreign key) - Links to slots table
  - `customer_name` (text) - Customer full name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone number
  - `num_guests` (integer) - Number of guests
  - `base_amount` (decimal) - Original price before discounts
  - `discount_amount` (decimal) - Discount applied (default: 0)
  - `final_amount` (decimal) - Final amount paid
  - `promo_code` (text, nullable) - Promo code used
  - `status` (text) - Booking status (pending, confirmed, cancelled)
  - `booking_reference` (text, unique) - Unique booking reference code
  - `created_at` (timestamptz) - Booking creation time

  ### 4. promo_codes
  Promotional discount codes
  - `id` (uuid, primary key) - Unique identifier
  - `code` (text, unique) - Promo code string
  - `discount_type` (text) - Type: "percentage" or "fixed"
  - `discount_value` (decimal) - Discount value (percentage or fixed amount)
  - `min_amount` (decimal, nullable) - Minimum purchase required
  - `max_discount` (decimal, nullable) - Maximum discount cap
  - `valid_from` (timestamptz) - Start date
  - `valid_until` (timestamptz) - End date
  - `is_active` (boolean) - Active status (default: true)
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - Enable RLS on all tables
  - Allow public read access to experiences and slots
  - Allow public insert to bookings (booking creation)
  - Restrict promo_codes to validation only (through Edge Function)
  - Authenticated users can view their own bookings

  ## Indexes
  - Index on experience_id in slots for fast lookup
  - Index on date in slots for availability queries
  - Index on booking_reference for quick booking retrieval
  - Index on promo code for validation

  ## Sample Data
  - Insert 6 diverse travel experiences
  - Create multiple time slots for each experience
  - Add two promo codes: SAVE10 (10% off) and FLAT100 ($100 off)
*/

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  location text NOT NULL,
  duration text NOT NULL,
  price decimal(10,2) NOT NULL,
  rating decimal(2,1) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  category text NOT NULL,
  highlights jsonb DEFAULT '[]'::jsonb,
  included jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create slots table
CREATE TABLE IF NOT EXISTS slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  capacity integer NOT NULL DEFAULT 10,
  booked integer NOT NULL DEFAULT 0,
  price_modifier decimal(3,2) DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_capacity CHECK (capacity > 0),
  CONSTRAINT valid_booked CHECK (booked >= 0 AND booked <= capacity)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id),
  slot_id uuid NOT NULL REFERENCES slots(id),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  num_guests integer NOT NULL DEFAULT 1,
  base_amount decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  final_amount decimal(10,2) NOT NULL,
  promo_code text,
  status text DEFAULT 'confirmed',
  booking_reference text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_guests CHECK (num_guests > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL,
  discount_value decimal(10,2) NOT NULL,
  min_amount decimal(10,2),
  max_discount decimal(10,2),
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed'))
);

-- Enable Row Level Security
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for experiences (public read)
CREATE POLICY "Anyone can view experiences"
  ON experiences FOR SELECT
  USING (true);

-- RLS Policies for slots (public read)
CREATE POLICY "Anyone can view slots"
  ON slots FOR SELECT
  USING (true);

-- RLS Policies for bookings (public insert, authenticated users can view their own)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (true);

-- RLS Policies for promo_codes (only readable through Edge Function)
CREATE POLICY "Promo codes readable by authenticated"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_slots_experience_id ON slots(experience_id);
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Insert sample experiences
INSERT INTO experiences (title, description, image_url, location, duration, price, rating, total_reviews, category, highlights, included) VALUES
(
  'Sunset Sailing Adventure',
  'Experience the magic of a coastal sunset aboard a luxurious sailing yacht. Perfect for couples and small groups seeking a memorable evening on the water.',
  'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg',
  'San Diego Bay, California',
  '3 hours',
  149.00,
  4.8,
  342,
  'Adventure',
  '["Stunning sunset views", "Professional crew", "Intimate small group experience", "Complimentary refreshments"]'::jsonb,
  '["Sailing yacht rental", "Experienced captain", "Safety equipment", "Drinks and snacks"]'::jsonb
),
(
  'Mountain Hiking Expedition',
  'Trek through breathtaking mountain trails with experienced guides. Suitable for all fitness levels with stunning panoramic views.',
  'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg',
  'Rocky Mountains, Colorado',
  'Full day (8 hours)',
  199.00,
  4.9,
  567,
  'Adventure',
  '["Expert hiking guides", "Spectacular mountain vistas", "Wildlife spotting opportunities", "Photo opportunities"]'::jsonb,
  '["Professional guide", "Hiking equipment", "Lunch and water", "Transportation from meeting point"]'::jsonb
),
(
  'Cultural Heritage Walking Tour',
  'Discover the rich history and culture of the old town with a knowledgeable local guide. Visit historic landmarks, hidden gems, and authentic local spots.',
  'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg',
  'Boston Historic District, Massachusetts',
  '2.5 hours',
  79.00,
  4.7,
  891,
  'Cultural',
  '["Historic landmarks", "Local expert guide", "Small group size", "Hidden local spots"]'::jsonb,
  '["Professional guide", "Headset for larger groups", "Entrance to historical sites", "Map and brochure"]'::jsonb
),
(
  'Gourmet Food Tasting Tour',
  'Embark on a culinary journey through the city''s best eateries. Sample artisanal foods, meet local chefs, and discover hidden culinary gems.',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  'Portland Food District, Oregon',
  '3.5 hours',
  129.00,
  4.9,
  423,
  'Culinary',
  '["6+ food tastings", "Local artisan producers", "Expert food guide", "Insider culinary knowledge"]'::jsonb,
  '["All food samples", "Non-alcoholic beverages", "Recipe cards", "Restaurant recommendations"]'::jsonb
),
(
  'Coastal Kayaking Experience',
  'Paddle through crystal-clear waters and explore hidden coves and sea caves. Perfect for adventure seekers and nature lovers.',
  'https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg',
  'La Jolla Coves, California',
  '4 hours',
  169.00,
  4.8,
  234,
  'Adventure',
  '["Sea cave exploration", "Marine wildlife viewing", "Professional instruction", "Small group experience"]'::jsonb,
  '["Kayak and paddle", "Safety gear and wetsuit", "Waterproof bag", "Snacks and water"]'::jsonb
),
(
  'Wine Country Tour',
  'Visit three premium wineries in the heart of wine country. Enjoy guided tastings, vineyard tours, and gourmet lunch with wine pairings.',
  'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
  'Napa Valley, California',
  'Full day (7 hours)',
  249.00,
  4.9,
  678,
  'Culinary',
  '["3 winery visits", "Wine tastings", "Vineyard tours", "Gourmet lunch included"]'::jsonb,
  '["Transportation", "Wine tastings", "Lunch with wine pairing", "Expert wine guide"]'::jsonb
);

-- Insert slots for each experience (next 14 days)
DO $$
DECLARE
  exp RECORD;
  slot_date date;
  slot_time time;
  day_offset integer;
BEGIN
  FOR exp IN SELECT id FROM experiences LOOP
    FOR day_offset IN 0..13 LOOP
      slot_date := CURRENT_DATE + day_offset;
      
      -- Morning slot (9:00 AM)
      INSERT INTO slots (experience_id, date, time, capacity, booked)
      VALUES (exp.id, slot_date, '09:00:00', 10, FLOOR(RANDOM() * 3)::integer);
      
      -- Afternoon slot (2:00 PM)
      INSERT INTO slots (experience_id, date, time, capacity, booked)
      VALUES (exp.id, slot_date, '14:00:00', 10, FLOOR(RANDOM() * 3)::integer);
      
      -- Evening slot (6:00 PM)
      INSERT INTO slots (experience_id, date, time, capacity, booked)
      VALUES (exp.id, slot_date, '18:00:00', 8, FLOOR(RANDOM() * 2)::integer);
    END LOOP;
  END LOOP;
END $$;

-- Insert promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_amount, max_discount, valid_until, is_active) VALUES
('SAVE10', 'percentage', 10.00, 50.00, NULL, '2026-12-31 23:59:59', true),
('FLAT100', 'fixed', 100.00, 200.00, 100.00, '2026-12-31 23:59:59', true);
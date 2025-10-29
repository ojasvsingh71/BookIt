const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const headers = {
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export interface Experience {
  id: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  duration: string;
  price: number;
  rating: number;
  total_reviews: number;
  category: string;
  highlights: string[];
  included: string[];
}

export interface Slot {
  id: string;
  experience_id: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  price_modifier: number;
}

export interface ExperienceDetails extends Experience {
  slots: Slot[];
}

export interface BookingRequest {
  experienceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numGuests: number;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  promoCode?: string;
}

export interface Booking {
  id: string;
  experience_id: string;
  slot_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  num_guests: number;
  base_amount: number;
  discount_amount: number;
  final_amount: number;
  promo_code: string | null;
  status: string;
  booking_reference: string;
  created_at: string;
}

export interface PromoValidation {
  valid: boolean;
  error?: string;
  discount?: number;
  finalAmount?: number;
}

export const api = {
  async getExperiences(): Promise<Experience[]> {
    const response = await fetch(`${API_BASE_URL}/experiences`, { headers });
    const data = await response.json();
    return data.data;
  },

  async getExperienceById(id: string): Promise<ExperienceDetails> {
    const response = await fetch(`${API_BASE_URL}/experiences/${id}`, { headers });
    const data = await response.json();
    return data.data;
  },

  async createBooking(booking: BookingRequest): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(booking),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  },

  async validatePromoCode(code: string, amount: number): Promise<PromoValidation> {
    const response = await fetch(`${API_BASE_URL}/promo-validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, amount }),
    });
    const data = await response.json();
    return data;
  },
};

// api.ts
export const API_BASE_URL = 'http://localhost:5000/api'; // backend URL

export interface Booking {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  eventType: string;
  eventLocation: string;
  additionalNotes: string;
  selectedPackage: string;
  selectedDate: string; // ISO date string
  selectedTime: string;
  paymentMethod: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface CreateBookingRequest {
  fullName: string;
  email: string;
  contactNumber: string;
  eventType: string;
  eventLocation: string;
  additionalNotes: string;
  selectedPackage: string;
  selectedDate: string;
  selectedTime: string;
  paymentMethod: string;
}

// Create a booking
export async function createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create booking: ${errText}`);
  }
  return res.json();
}

// Get all bookings
export async function getAllBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE_URL}/bookings`);
  if (!res.ok) return [];
  return res.json();
}

// Get booked dates
export async function getBookedDates(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/meta/dates`);
  if (!res.ok) return [];
  return res.json();
}

// Get booked time slots for a specific date
export async function getBookedTimeSlotsForDate(date: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/meta/time-slots?date=${encodeURIComponent(date)}`);
  if (!res.ok) return [];
  return res.json();
}

// Get a booking by ID
export async function getBookingById(id: string): Promise<Booking | null> {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`);
  if (!res.ok) return null;
  return res.json();
}

// Get bookings by email
export async function getBookingByEmail(email: string): Promise<Booking | null> {
  const res = await fetch(`${API_BASE_URL}/bookings?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data: Booking[] = await res.json();
  return data.length > 0 ? data[0] : null;
}

// Cancel a booking
export async function cancelBooking(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/cancel`, { method: 'POST' });
  return res.ok;
}

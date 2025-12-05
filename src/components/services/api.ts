export const API_BASE_URL = 'http://localhost:5000/api'; // backend URL

export interface Booking {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  eventType: string;
  eventLocation: string;
  additionalNotes?: string;
  selectedPackage?: string;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string;
  paymentMethod?: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface CreateBookingRequest {
  fullName: string;
  email: string;
  contactNumber: string;
  eventType: string;
  eventLocation: string;
  additionalNotes?: string;
  selectedPackage?: string;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string;
  paymentMethod?: string;
}

// --- Create a booking ---
export async function createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create booking: ${text}`);
  }
  return res.json();
}

// --- Get all bookings ---
export async function getAllBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE_URL}/bookings`);
  if (!res.ok) return [];
  return res.json();
}

// --- Get booked dates ---
export async function getBookedDates(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/meta/dates`);
  if (!res.ok) return [];
  return res.json();
}

// --- Get booked time slots for a specific date ---
export async function getBookedTimeSlotsForDate(date: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/meta/time-slots?date=${encodeURIComponent(date)}`);
  if (!res.ok) return [];
  return res.json();
}

// --- Get a booking by ID ---
export async function getBookingById(id: string): Promise<Booking | null> {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`);
  if (!res.ok) return null;
  return res.json();
}

// --- Update booking status ---
export async function updateBookingStatus(id: string, status: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return res.ok ? data : { success: false };
  } catch {
    return { success: false };
  }
}

// --- Delete booking ---
export async function deleteBooking(id: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`, { method: 'DELETE' });
    return res.ok ? await res.json() : { success: false };
  } catch {
    return { success: false };
  }
}

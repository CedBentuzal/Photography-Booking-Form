// bookingService.ts
import * as api from './api';
import type { Booking, CreateBookingRequest } from './api';

// Re-export types
export type { Booking };

// --- Session fallback storage (temporary) ---
let sessionBookings: Booking[] = [];

// --- Helper: generate unique booking reference ---
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LL-${timestamp}-${randomStr}`;
}

// --- Save a booking ---
export async function saveBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
  try {
    // Try backend first
    const created = await api.createBooking(bookingData);
    return created;
  } catch (err) {
    // Fallback: session-only
    const newBooking: Booking = {
      ...bookingData,
      id: generateBookingReference(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    sessionBookings.push(newBooking);
    return newBooking;
  }
}

// --- Get all bookings ---
export async function getAllBookings(): Promise<Booking[]> {
  try {
    return await api.getAllBookings();
  } catch (err) {
    return [...sessionBookings];
  }
}

// --- Get booked dates ---
export async function getBookedDates(): Promise<Set<string>> {
  try {
    const dates = await api.getBookedDates();
    return new Set(dates);
  } catch (err) {
    const bookedDates = new Set<string>();
    sessionBookings.forEach(b => { if (b.status !== 'cancelled') bookedDates.add(b.selectedDate); });
    return bookedDates;
  }
}

// --- Get booked time slots for a specific date ---
export async function getBookedTimeSlotsForDate(date: Date): Promise<string[]> {
  const dateStr = date.toISOString().split('T')[0];
  try {
    return await api.getBookedTimeSlotsForDate(dateStr);
  } catch (err) {
    return sessionBookings
      .filter(b => b.selectedDate === dateStr && b.status !== 'cancelled')
      .map(b => b.selectedTime);
  }
}

// --- Check if a time slot is available ---
export async function isTimeSlotAvailable(date: Date, timeSlot: string): Promise<boolean> {
  const booked = await getBookedTimeSlotsForDate(date);
  return !booked.includes(timeSlot);
}

// --- Find booking by ID or email ---
export async function findBooking(searchTerm: string): Promise<Booking | null> {
  const lower = searchTerm.toLowerCase();
  const bookings = await getAllBookings();
  const found = bookings.find(b => b.id.toLowerCase() === lower || b.email.toLowerCase() === lower);
  return found || null;
}

// --- Get upcoming bookings ---
export async function getUpcomingBookings(daysAhead: number = 7): Promise<Booking[]> {
  const bookings = await getAllBookings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date();
  future.setDate(today.getDate() + daysAhead);

  return bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const bDate = new Date(b.selectedDate);
    bDate.setHours(0, 0, 0, 0);
    return bDate >= today && bDate <= future;
  });
}

// --- Cancel a booking ---
export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const success = await api.cancelBooking(bookingId);
    if (success) return true;
  } catch (err) {
    // fallback
    const idx = sessionBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      sessionBookings[idx].status = 'cancelled';
      return true;
    }
  }
  return false;
}

// --- Clear session bookings (for testing) ---
export function clearSessionBookings(): void {
  sessionBookings = [];
}

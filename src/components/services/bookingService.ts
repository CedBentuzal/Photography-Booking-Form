import * as api from './api';
import type { Booking, CreateBookingRequest } from './api';

export type { Booking };

// --- Temporary in-memory fallback storage ---
let sessionBookings: Booking[] = [];

// --- Helper: generate unique booking reference ---
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LL-${timestamp}-${randomStr}`;
}

// --- Local date helpers to avoid timezone shifts ---
function toLocalYYYYMMDDFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYYYYMMDDToLocalDate(dateStr: string): Date {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, day);
}
// --- end helpers ---

// --- Save a booking ---
export async function saveBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
  try {
    return await api.createBooking(bookingData as CreateBookingRequest);
  } catch {
    const newBooking: Booking = {
      ...bookingData,
      id: generateBookingReference(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    sessionBookings.push(newBooking);
    return newBooking;
  }
}

// --- Get all bookings ---
export async function getAllBookings(): Promise<Booking[]> {
  try {
    return await api.getAllBookings();
  } catch {
    return [...sessionBookings];
  }
}

// --- Get booked dates ---
export async function getBookedDates(): Promise<Set<string>> {
  try {
    const dates = await api.getBookedDates();
    return new Set(dates);
  } catch {
    const booked = new Set<string>();
    sessionBookings.forEach(b => {
      if (b.status !== 'cancelled') booked.add(b.selectedDate);
    });
    return booked;
  }
}

// --- Get booked dates filtered by status array (e.g. ['pending']) ---
export async function getBookedDatesByStatus(statuses: string[] = ['pending']): Promise<Set<string>> {
  // Try backend endpoint if implemented
  try {
    if (typeof (api as any).getBookedDatesByStatus === 'function') {
      const res: string[] = await (api as any).getBookedDatesByStatus(statuses.join(','));
      return new Set(res);
    }
  } catch {
    // ignore and fallback to deriving from bookings
  }

  // Fallback: derive from all bookings filtered by status
  const all = await getAllBookings();
  const set = new Set<string>();
  all.forEach((b) => {
    if (statuses.includes(b.status)) set.add(b.selectedDate);
  });
  return set;
}

// --- Get booked time slots for a specific date ---
// Accept Date (local) or YYYY-MM-DD string
export async function getBookedTimeSlotsForDate(date: Date | string): Promise<string[]> {
  const dateStr = date instanceof Date ? toLocalYYYYMMDDFromDate(date) : String(date);
  try {
    return await api.getBookedTimeSlotsForDate(dateStr);
  } catch {
    return sessionBookings
      .filter(b => b.selectedDate === dateStr && b.status !== 'cancelled')
      .map(b => b.selectedTime);
  }
}

// --- Get booked time slots for a date filtered by status array (e.g. ['pending']) ---
export async function getBookedTimeSlotsForDateByStatus(
  date: Date | string,
  statuses: string[] = ['pending']
): Promise<string[]> {
  const dateStr = date instanceof Date ? toLocalYYYYMMDDFromDate(date) : String(date);

  // Try backend endpoint if implemented
  try {
    if (typeof (api as any).getBookedTimeSlotsForDateByStatus === 'function') {
      const res: string[] = await (api as any).getBookedTimeSlotsForDateByStatus(dateStr, statuses.join(','));
      return res;
    }
  } catch {
    // ignore and fallback
  }

  // Fallback: derive from all bookings filtered by date + status
  const all = await getAllBookings();
  return all
    .filter(b => b.selectedDate === dateStr && statuses.includes(b.status))
    .map(b => b.selectedTime);
}

// --- Check if a date is fully booked ---
export async function isDateFullyBooked(date: Date | string, totalSlots: number = 8): Promise<boolean> {
  const dateStr = date instanceof Date ? toLocalYYYYMMDDFromDate(date) : String(date);
  try {
    const slots = await api.getBookedTimeSlotsForDate(dateStr);
    return slots.length >= totalSlots;
  } catch {
    const count = sessionBookings.filter(b => b.selectedDate === dateStr && b.status !== 'cancelled').length;
    return count >= totalSlots;
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
  return bookings.find(b => b.id.toLowerCase() === lower || b.email.toLowerCase() === lower) || null;
}

// --- Get upcoming bookings ---
export async function getUpcomingBookings(daysAhead: number = 7): Promise<Booking[]> {
  const bookings = await getAllBookings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date(today);
  future.setDate(today.getDate() + daysAhead);

  return bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    // Parse YYYY-MM-DD as local date (avoid timezone shift)
    const bDate = parseYYYYMMDDToLocalDate(b.selectedDate);
    bDate.setHours(0, 0, 0, 0);
    return bDate >= today && bDate <= future;
  });
}

// --- Cancel a booking ---
export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const success = await api.updateBookingStatus(bookingId, 'cancelled');
    if (success.success) return true;
  } catch {}

  const idx = sessionBookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    sessionBookings[idx].status = 'cancelled';
    return true;
  }
  return false;
}

// --- Clear session bookings ---
export function clearSessionBookings(): void {
  sessionBookings = [];
}

// --- Update booking status (completed | cancelled | pending) ---
export async function updateBookingStatus(bookingId: string, status: 'pending' | 'completed' | 'cancelled'): Promise<{ success: boolean }> {
  try {
    const res = await api.updateBookingStatus(bookingId, status);
    // backend expected to return { success: boolean }
    return res;
  } catch {
    const idx = sessionBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      sessionBookings[idx].status = status;
      return { success: true };
    }
    return { success: false };
  }
}

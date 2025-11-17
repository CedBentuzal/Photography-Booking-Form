// Booking Service - Frontend-only service (no persistence)
// This service uses the API layer and provides helper functions
// All data is session-only (in-memory) until backend is connected

import * as api from './api';
import type { Booking, CreateBookingRequest } from './api';

// Re-export types for convenience
export type { Booking } from './api';

// Generate unique booking reference
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LL-${timestamp}-${randomStr}`;
}

// In-memory storage for current session only (no persistence)
// This will be replaced by API calls when backend is ready
let sessionBookings: Booking[] = [];

// Get all bookings (session-only, no persistence)
export async function getAllBookings(): Promise<Booking[]> {
  // When backend is ready, use: return api.getAllBookings();
  return Promise.resolve([...sessionBookings]);
}

// Save a new booking (session-only, no persistence)
export async function saveBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
  const newBooking: Booking = {
    ...bookingData,
    id: generateBookingReference(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  // Add to session storage (temporary, no persistence)
  sessionBookings.push(newBooking);
  
  // When backend is ready, use:
  // return api.createBooking(bookingData);
  
  return Promise.resolve(newBooking);
}

// Check if a specific date/time slot is available
export async function isTimeSlotAvailable(date: Date, timeSlot: string): Promise<boolean> {
  const bookings = await getAllBookings();
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return !bookings.some(
    booking => 
      booking.selectedDate === dateString && 
      booking.selectedTime === timeSlot &&
      booking.status !== 'cancelled'
  );
}

// Get booked time slots for a specific date
export async function getBookedTimeSlotsForDate(date: Date): Promise<string[]> {
  const bookings = await getAllBookings();
  const dateString = date.toISOString().split('T')[0];
  
  return bookings
    .filter(
      booking => 
        booking.selectedDate === dateString && 
        booking.status !== 'cancelled'
    )
    .map(booking => booking.selectedTime);
}

// Get booking by ID or email
export async function findBooking(searchTerm: string): Promise<Booking | null> {
  const bookings = await getAllBookings();
  const search = searchTerm.trim().toLowerCase();
  
  const booking = bookings.find(
    b => b.id.toLowerCase() === search || b.email.toLowerCase() === search
  );
  
  if (booking) {
    return booking;
  }
  
  // When backend is ready, try API:
  // const byId = await api.getBookingById(searchTerm);
  // if (byId) return byId;
  // return api.getBookingByEmail(searchTerm);
  
  return null;
}

// Get dates that have at least one booking
export async function getBookedDates(): Promise<Set<string>> {
  const bookings = await getAllBookings();
  const bookedDates = new Set<string>();
  
  bookings.forEach(booking => {
    if (booking.status !== 'cancelled') {
      bookedDates.add(booking.selectedDate);
    }
  });
  
  return bookedDates;
}

// Check if a date is fully booked (all time slots taken)
export async function isDateFullyBooked(date: Date, availableTimeSlots: string[]): Promise<boolean> {
  const bookedSlots = await getBookedTimeSlotsForDate(date);
  return bookedSlots.length >= availableTimeSlots.length;
}

// Get upcoming bookings (for reminders)
export async function getUpcomingBookings(daysAhead: number = 7): Promise<Booking[]> {
  const bookings = await getAllBookings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  return bookings.filter(booking => {
    if (booking.status === 'cancelled') return false;
    
    const bookingDate = new Date(booking.selectedDate);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= today && bookingDate <= futureDate;
  });
}

// Cancel a booking
export async function cancelBooking(bookingId: string): Promise<boolean> {
  const bookings = await getAllBookings();
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex !== -1) {
    bookings[bookingIndex].status = 'cancelled';
    sessionBookings = bookings; // Update session storage
    return true;
  }
  
  // When backend is ready, use:
  // try {
  //   await api.cancelBooking(bookingId);
  //   return true;
  // } catch (error) {
  //   return false;
  // }
  
  return false;
}

// Clear session bookings (useful for testing or reset)
export function clearSessionBookings(): void {
  sessionBookings = [];
}

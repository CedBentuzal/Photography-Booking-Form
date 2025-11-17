// API Service Layer - Ready for Backend Integration
// This file will be used to connect to the backend API when ready

// API_BASE_URL will be used when backend integration is complete
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

// API Functions - Ready for Backend Integration
// Currently returns mock responses, but structure is ready for real API calls

export async function createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/bookings`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(bookingData),
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to create booking');
  // }
  // return response.json();

  // Temporary: Return mock response (no persistence)
  return Promise.resolve({
    ...bookingData,
    id: generateBookingReference(),
    createdAt: new Date().toISOString(),
    status: 'pending' as const,
  });
}

export async function getBookingById(_id: string): Promise<Booking | null> {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/bookings/${_id}`);
  // if (!response.ok) {
  //   return null;
  // }
  // return response.json();

  // Temporary: Return null (no persistence)
  return Promise.resolve(null);
}

export async function getBookingByEmail(_email: string): Promise<Booking | null> {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/bookings?email=${_email}`);
  // if (!response.ok) {
  //   return null;
  // }
  // const data = await response.json();
  // return data.length > 0 ? data[0] : null;

  // Temporary: Return null (no persistence)
  return Promise.resolve(null);
}

export async function getAllBookings(): Promise<Booking[]> {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/bookings`);
  // if (!response.ok) {
  //   return [];
  // }
  // return response.json();

  // Temporary: Return empty array (no persistence)
  return Promise.resolve([]);
}

export async function getBookedTimeSlotsForDate(_date: string): Promise<string[]> {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/bookings/time-slots?date=${_date}`);
  // if (!response.ok) {
  //   return [];
  // }
  // return response.json();

  // Temporary: Return empty array (no persistence)
  return Promise.resolve([]);
}

export async function getBookedDates(): Promise<string[]> {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/bookings/dates`);
  // if (!response.ok) {
  //   return [];
  // }
  // return response.json();

  // Temporary: Return empty array (no persistence)
  return Promise.resolve([]);
}

export async function getUpcomingBookings(_daysAhead: number = 7): Promise<Booking[]> {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/bookings/upcoming?days=${_daysAhead}`);
  // if (!response.ok) {
  //   return [];
  // }
  // return response.json();

  // Temporary: Return empty array (no persistence)
  return Promise.resolve([]);
}

// Helper function to generate booking reference
function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LL-${timestamp}-${randomStr}`;
}




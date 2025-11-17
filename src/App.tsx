import React, { useState } from 'react';
import LandingPage from './components/pages/LandingPage';
import BookingForm from './components/pages/BookingForm';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'booking'>('landing');

  const navigateToBooking = () => {
    setCurrentPage('booking');
  };

  const navigateToLanding = () => {
    setCurrentPage('landing');
  };

  if (currentPage === 'booking') {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={navigateToLanding}
            className="bg-[#5E3023] hover:bg-[#895737] text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        <BookingForm />
        <Toaster />
      </div>
    );
  }

  return (
    <>
      <LandingPage onNavigateToBooking={navigateToBooking} />
      <Toaster />
    </>
  );
}

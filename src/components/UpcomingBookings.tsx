import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getUpcomingBookings, type Booking } from '../services/bookingService';

export default function UpcomingBookings() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load upcoming bookings for the next 7 days
    const loadBookings = async () => {
      const bookings = await getUpcomingBookings(7);
      setUpcomingBookings(bookings);
    };
    loadBookings();
  }, []);

  // Don't show if no upcoming bookings
  if (upcomingBookings.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-[#5E3023] hover:bg-[#895737] text-white shadow-lg"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {upcomingBookings.length} Upcoming Booking{upcomingBookings.length > 1 ? 's' : ''}
        </Button>
      ) : (
        <Card className="shadow-xl border-[#C08552]">
          <CardHeader className="bg-[#5E3023] text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Sessions</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:text-[#F3E9DC] hover:bg-[#895737]"
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {upcomingBookings.map((booking) => {
                const bookingDate = new Date(booking.selectedDate);
                const today = new Date();
                const daysUntil = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={booking.id}
                    className="p-3 bg-[#F3E9DC] rounded-lg border border-[#C08552] space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-[#5E3023]">{booking.fullName}</p>
                        <p className="text-sm text-[#895737] capitalize">
                          {booking.selectedPackage} Photoshoot
                        </p>
                      </div>
                      <Badge className={
                        daysUntil === 0
                          ? 'bg-red-100 text-red-800 hover:bg-red-100'
                          : daysUntil <= 2
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                      }>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-[#895737]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {bookingDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{booking.selectedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{booking.eventLocation}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-[#C08552] space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-[#895737]">
                        <Phone className="h-3 w-3" />
                        <span>{booking.contactNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#895737]">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{booking.email}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Phone, Mail, Facebook, Instagram, Search, Camera, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  saveBooking,
  // getBookedTimeSlotsForDate,    // remove or leave for other usages
  getBookedTimeSlotsForDateByStatus,
  findBooking,
  // getBookedDates,
  getBookedDatesByStatus,
  isDateFullyBooked,
  type Booking
} from '../services/bookingService';

interface FormData {
  fullName: string;
  email: string;
  contactNumber: string;
  eventType: string;
  eventLocation: string;
  additionalNotes: string;
  selectedPackage: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  paymentMethod: string;
  bookingReference: string;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    contactNumber: '',
    eventType: '',
    eventLocation: '',
    additionalNotes: '',
    selectedPackage: '',
    selectedDate: undefined,
    selectedTime: '',
    paymentMethod: '',
    bookingReference: ''
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<Booking | null>(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // --- Date helpers (use local date components to avoid timezone shifts) ---
  const normalizeDateToLocalMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const toLocalYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseYYYYMMDDToLocalDate = (v?: string | Date) => {
    if (!v) return undefined;
    if (v instanceof Date) return normalizeDateToLocalMidnight(v);
    const [y, m, day] = v.split('-').map(Number);
    return new Date(y, m - 1, day);
  };
  // --- end helpers ---

  const packages = [
    {
      id: 'solo',
      title: 'Solo Photoshoot',
      price: 'Php 250.00',
      duration: '1 hr session',
      inclusions: ['Unlimited shots', '10 edited photos'],
      extras: ['Php 50 / 30-min extension', 'Php 50 per 10 additional photos']
    },
    {
      id: 'group',
      title: 'Group Photoshoot',
      price: 'Php 150.00 per head',
      duration: '1 hr session',
      inclusions: ['Group + individual shots', '10 edited photos'],
      extras: ['Php 50/head / 30-min extension', 'Php 50 per 10 additional photos']
    },
    {
      id: 'event',
      title: 'Event Photoshoot (50 pax)',
      price: 'Php 5,000.00',
      duration: '1 hr session',
      inclusions: ['Event proper + group + individual shots', '10 edited photos'],
      extras: ['Php 500 / 30-min extension', 'Php 50 per 10 additional photos', 'Videography & editing charged separately']
    }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  // Load booked dates on component mount (pending only)
  useEffect(() => {
    const loadPendingBookedDates = async () => {
      const dates: Set<string> = await getBookedDatesByStatus(['pending']);
      setBookedDates(dates);

      // compute fully booked dates separately using pending bookings only
      const fully = new Set<string>();
      for (const d of Array.from(dates) as string[]) {
        const [y, m, day] = d.split('-').map(Number);
        const localDate = new Date(y, m - 1, day);
        const bookedSlots = await getBookedTimeSlotsForDateByStatus(localDate, ['pending']);
        if (bookedSlots.length >= timeSlots.length) fully.add(d);
      }
      setFullyBookedDates(fully);
    };
    loadPendingBookedDates();
  }, []);

  // Update available time slots when date changes (consider pending bookings only)
  useEffect(() => {
    const updateTimeSlots = async () => {
      if (formData.selectedDate) {
        const normalized = normalizeDateToLocalMidnight(formData.selectedDate);
        const bookedSlots = await getBookedTimeSlotsForDateByStatus(normalized, ['pending']);
        const available = timeSlots.filter((slot: string) => !bookedSlots.includes(slot));
        setAvailableTimeSlots(available);

        if (formData.selectedTime && bookedSlots.includes(formData.selectedTime)) {
          setFormData(prev => ({ ...prev, selectedTime: '' }));
          toast.error('Selected time slot is no longer available. Please choose another time.');
        }
      } else {
        setAvailableTimeSlots(timeSlots);
      }
    };
    updateTimeSlots();
  }, [formData.selectedDate]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.selectedDate) {
      toast.error('Please select a date for your booking');
      return;
    }

    if (!formData.selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    if (!formData.selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    if (!formData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      // Normalize before checking availability and saving
      const normalizedDate = normalizeDateToLocalMidnight(formData.selectedDate!);

      // Check if time slot is still available (double-check)
      const bookedSlots = await getBookedTimeSlotsForDateByStatus(normalizedDate, ['pending']);
      if (bookedSlots.includes(formData.selectedTime)) {
        toast.error('This time slot has just been booked. Please select another time.');
        setFormData(prev => ({ ...prev, selectedTime: '' }));
        return;
      }

      // Convert selectedDate to local YYYY-MM-DD string to prevent timezone shift
      const localDateString = toLocalYYYYMMDD(normalizedDate);

      // Save booking
      const booking = await saveBooking({
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        eventType: formData.eventType,
        eventLocation: formData.eventLocation,
        additionalNotes: formData.additionalNotes,
        selectedPackage: formData.selectedPackage,
        selectedDate: localDateString,
        selectedTime: formData.selectedTime,
        paymentMethod: formData.paymentMethod
      });

      // Update booked dates
      const dates: Set<string> = await getBookedDatesByStatus(['pending']);
      setBookedDates(dates);

      // Update fully booked dates (pending only)
      const fully = new Set<string>();
      for (const d of Array.from(dates) as string[]) {
        const [y, m, day] = d.split('-').map(Number);
        const localDate = new Date(y, m - 1, day);
        const bookedSlots = await getBookedTimeSlotsForDateByStatus(localDate, ['pending']);
        if (bookedSlots.length >= timeSlots.length) fully.add(d);
      }
      setFullyBookedDates(fully);

      // Show confirmation
      setConfirmedBooking(booking);
      setShowConfirmation(true);

      toast.success('Booking submitted successfully! Note: This is a demo - data is not persisted.');

      // Reset form
      handleReset();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to submit booking. Please try again.');
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      contactNumber: '',
      eventType: '',
      eventLocation: '',
      additionalNotes: '',
      selectedPackage: '',
      selectedDate: undefined,
      selectedTime: '',
      paymentMethod: '',
      bookingReference: ''
    });
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast.error('Please enter a booking reference or email');
      return;
    }

    try {
      const result = await findBooking(searchInput);
      if (result) {
        setSearchResult(result);
        setShowSearchDialog(true);
      } else {
        toast.error('No booking found with that reference or email');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search booking. Please try again.');
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="bg-white border-b border-[#F3E9DC] py-4 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and tagline */}
          <div className="flex items-center space-x-3">
            <Camera className="h-8 w-8 text-[#5E3023]" />
            <div>
              <h1 className="text-xl font-bold text-[#5E3023]">Lumière Lens</h1>
              <p className="text-sm text-[#C08552]">Capturing Light, Crafting Stories</p>
            </div>
          </div>

          {/* Page title */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-[#5E3023]">Book Your Photography Session</h2>
          </div>

          {/* Search bar */}
          <div className="relative flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C08552] h-4 w-4" />
              <Input
                placeholder="Enter Booking Reference or Email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 w-64 border-[#F3E9DC] focus:border-[#C08552]"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              className="bg-[#5E3023] hover:bg-[#895737] text-white"
            >
              Search
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Customer Information Form */}
          <section className="bg-white rounded-lg border border-[#F3E9DC] p-6">
            <h3 className="text-xl font-semibold text-[#5E3023] mb-6">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-[#895737]">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="mt-1 border-[#F3E9DC] focus:border-[#C08552]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#895737]">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 border-[#F3E9DC] focus:border-[#C08552]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactNumber" className="text-[#895737]">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="mt-1 border-[#F3E9DC] focus:border-[#C08552]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventType" className="text-[#895737]">Event Type</Label>
                <Select value={formData.eventType} onValueChange={(value: string) => handleInputChange('eventType', value)}>
                  <SelectTrigger className="mt-1 border-[#F3E9DC] focus:border-[#C08552]">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="eventLocation" className="text-[#895737]">Event Location</Label>
                <Input
                  id="eventLocation"
                  value={formData.eventLocation}
                  onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                  className="mt-1 border-[#F3E9DC] focus:border-[#C08552]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="additionalNotes" className="text-[#895737]">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  className="mt-1 border-[#F3E9DC] focus:border-[#C08552]"
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Package Selection */}
          <section className="space-y-6">
            <h3 className="text-xl font-semibold text-[#5E3023]">Package Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`cursor-pointer transition-all border-2 ${
                    formData.selectedPackage === pkg.id 
                      ? 'border-[#C08552] bg-[#F3E9DC]' 
                      : 'border-[#F3E9DC] hover:border-[#C08552]'
                  }`}
                  onClick={() => handleInputChange('selectedPackage', pkg.id)}
                >
                  <CardHeader className="bg-[#5E3023] text-white rounded-t-lg">
                    <CardTitle className="text-lg">{pkg.title}</CardTitle>
                    <p className="text-2xl font-bold text-[#F3E9DC]">{pkg.price}</p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-[#895737] font-medium mb-3">{pkg.duration}</p>
                    <div className="space-y-2">
                      <p className="font-medium text-[#5E3023]">Inclusions:</p>
                      <ul className="text-sm text-[#895737] space-y-1">
                        {pkg.inclusions.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                      <p className="font-medium text-[#5E3023] mt-3">Extra charges:</p>
                      <ul className="text-sm text-[#895737] space-y-1">
                        {pkg.extras.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Date & Time Picker */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-[#5E3023] mb-4">Select Date</h3>
              <div className="mb-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded border-2 border-[#C08552] bg-[#F3E9DC]"></div>
                  <span className="text-[#895737]">Has bookings</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded border-2 border-gray-300 bg-gray-100"></div>
                  <span className="text-[#895737]">Fully booked</span>
                </div>
              </div>
              <CalendarComponent
                mode="single"
                selected={formData.selectedDate}
                onSelect={(date: Date) => handleInputChange('selectedDate', normalizeDateToLocalMidnight(date))}
                className="rounded-md border border-[#F3E9DC]"
                disabled={(date: Date) => {
                  // Disable past dates
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) return true;

                  // Disable fully booked dates
                  const dateString = toLocalYYYYMMDD(normalizeDateToLocalMidnight(date));
                  return fullyBookedDates.has(dateString);
                }}
                modifiers={{
                  booked: (date: Date) => {
                    const dateString = toLocalYYYYMMDD(normalizeDateToLocalMidnight(date));
                    return bookedDates.has(dateString);
                  }
                }}
                modifiersStyles={{
                  booked: {
                    backgroundColor: '#F3E9DC',
                    border: '2px solid #C08552',
                    borderRadius: '4px'
                  }
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#5E3023] mb-4">
                Select Time
                {formData.selectedDate && (
                  <span className="ml-2 text-sm text-[#895737]">
                    ({availableTimeSlots.length} of {timeSlots.length} slots available)
                  </span>
                )}
              </h3>
              {!formData.selectedDate && (
                <p className="text-[#895737] mb-4">Please select a date first</p>
              )}
              <RadioGroup
                value={formData.selectedTime}
                onValueChange={(value: string) => handleInputChange('selectedTime', value)}
                className="grid grid-cols-2 gap-3"
                disabled={!formData.selectedDate}
              >
                {timeSlots.map((time) => {
                  const isBooked = formData.selectedDate && !availableTimeSlots.includes(time);
                  return (
                    <div 
                      key={time} 
                      className={`flex items-center space-x-2 p-2 rounded border ${
                        isBooked 
                          ? 'bg-gray-100 border-gray-300 opacity-50' 
                          : 'border-[#F3E9DC] hover:border-[#C08552]'
                      }`}
                    >
                      <RadioGroupItem 
                        value={time} 
                        id={time} 
                        disabled={isBooked || !formData.selectedDate}
                      />
                      <Label 
                        htmlFor={time} 
                        className={`flex-1 cursor-pointer ${
                          isBooked ? 'text-gray-400' : 'text-[#895737]'
                        }`}
                      >
                        {time}
                        {isBooked && <span className="ml-2 text-xs">(Booked)</span>}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="bg-[#F3E9DC] rounded-lg border border-[#F3E9DC] p-6">
            <h3 className="text-xl font-semibold text-[#5E3023] mb-6">Payment Methods</h3>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value: string) => handleInputChange('paymentMethod', value)}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-[#F3E9DC]">
                <RadioGroupItem value="gcash" id="gcash" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="gcash" className="font-medium text-[#5E3023]">GCash Payment</Label>
                  <p className="text-[#895737] mt-1">09457120419 (Emmanuel V.)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-[#F3E9DC]">
                <RadioGroupItem value="cash" id="cash" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="cash" className="font-medium text-[#5E3023]">Cash Payment</Label>
                  <p className="text-[#895737] mt-1">To be received by Chloie Decamaton / Emmanuel Villar</p>
                </div>
              </div>
            </RadioGroup>
          </section>

          {/* Terms & Policy */}
          <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Terms & Policy</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• 50% non-refundable downpayment required to confirm booking</p>
              <p>• Remaining 50% due before release of deliverables</p>
              <p>• Files delivered via Google Drive, available for 3 months</p>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              type="submit" 
              className="bg-[#5E3023] hover:bg-[#895737] text-white px-8 py-3 rounded-lg"
            >
              Submit Booking Request
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              className="border-[#5E3023] text-[#5E3023] hover:bg-[#F3E9DC] px-8 py-3 rounded-lg"
            >
              Reset Form
            </Button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-[#5E3023] text-white py-8 px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="h-6 w-6" />
                <span className="font-semibold">Lumière Lens</span>
              </div>
              <p className="text-[#F3E9DC]">Capturing Light, Crafting Stories</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="space-y-2 text-[#F3E9DC]">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>09457120419</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@lumierelens.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 hover:text-[#F3E9DC] cursor-pointer" />
                <Instagram className="h-6 w-6 hover:text-[#F3E9DC] cursor-pointer" />
              </div>
            </div>
          </div>
          <Separator className="my-6 bg-[#895737]" />
          <div className="text-center text-[#F3E9DC]">
            <p>&copy; 2025 Lumière Lens. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl text-[#5E3023]">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your photography session has been successfully booked.
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                Note: This is a demo - booking data is not persisted. Connect a backend to enable data storage.
              </span>
            </DialogDescription>
          </DialogHeader>
          {confirmedBooking && (
            <div className="space-y-4">
              <div className="bg-[#F3E9DC] p-4 rounded-lg">
                <p className="text-center font-semibold text-[#5E3023] mb-2">
                  Booking Reference
                </p>
                <p className="text-center text-xl font-mono text-[#895737]">
                  {confirmedBooking.id}
                </p>
                <p className="text-center text-sm text-[#895737] mt-2">
                  Please save this reference for future inquiries
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#895737]">Name:</span>
                  <span className="text-[#5E3023] font-medium">{confirmedBooking.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Email:</span>
                  <span className="text-[#5E3023] font-medium">{confirmedBooking.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Date:</span>
                  <span className="text-[#5E3023] font-medium">
                    {parseYYYYMMDDToLocalDate(confirmedBooking.selectedDate)!.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Time:</span>
                  <span className="text-[#5E3023] font-medium">{confirmedBooking.selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Package:</span>
                  <span className="text-[#5E3023] font-medium capitalize">
                    {confirmedBooking.selectedPackage} Photoshoot
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Status:</span>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    {confirmedBooking.status}
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Next Steps:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check your email for confirmation details</li>
                  <li>Prepare 50% downpayment via your selected payment method</li>
                  <li>We'll contact you within 24 hours to confirm</li>
                </ul>
              </div>

              <Button
                onClick={() => setShowConfirmation(false)}
                className="w-full bg-[#5E3023] hover:bg-[#895737] text-white"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Search Results Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#5E3023]">Booking Details</DialogTitle>
            <DialogDescription>
              Here are the details for your booking
            </DialogDescription>
          </DialogHeader>
          {searchResult && (
            <div className="space-y-4">
              <div className="bg-[#F3E9DC] p-4 rounded-lg">
                <p className="text-center font-semibold text-[#5E3023] mb-2">
                  Booking Reference
                </p>
                <p className="text-center text-lg font-mono text-[#895737]">
                  {searchResult.id}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#895737]">Name:</span>
                  <span className="text-[#5E3023] font-medium">{searchResult.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Email:</span>
                  <span className="text-[#5E3023] font-medium">{searchResult.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Contact:</span>
                  <span className="text-[#5E3023] font-medium">{searchResult.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Date:</span>
                  <span className="text-[#5E3023] font-medium">
                    {parseYYYYMMDDToLocalDate(searchResult.selectedDate)!.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Time:</span>
                  <span className="text-[#5E3023] font-medium">{searchResult.selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Package:</span>
                  <span className="text-[#5E3023] font-medium capitalize">
                    {searchResult.selectedPackage} Photoshoot
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Location:</span>
                  <span className="text-[#5E3023] font-medium">{searchResult.eventLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Payment:</span>
                  <span className="text-[#5E3023] font-medium uppercase">{searchResult.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#895737]">Status:</span>
                  <Badge className={
                    searchResult.status === 'completed' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : searchResult.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 hover:bg-red-100'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                  }>
                    {searchResult.status}
                  </Badge>
                </div>
                {searchResult.additionalNotes && (
                  <div className="pt-2 border-t border-[#F3E9DC]">
                    <p className="text-[#895737] mb-1">Additional Notes:</p>
                    <p className="text-[#5E3023] text-xs">{searchResult.additionalNotes}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setShowSearchDialog(false)}
                className="w-full bg-[#5E3023] hover:bg-[#895737] text-white"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

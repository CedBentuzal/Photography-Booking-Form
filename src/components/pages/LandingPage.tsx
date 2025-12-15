import React, { useState } from 'react';
import { Camera, Menu, X, Phone, Mail, Facebook, Instagram, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../ImageWithFallback';
// Local image imports
import heroImage from '../../assets/hero.jpg';
import solo1 from '../../assets/solo1.jpg';
import solo2 from '../../assets/solo2.jpg';
import group1 from '../../assets/group1.jpg';
import group2 from '../../assets/group2.jpg';
import event1 from '../../assets/event1.jpg';
import event2 from '../../assets/event2.jpg';

interface LandingPageProps {
  onNavigateToBooking: () => void;
}

export default function LandingPage({ onNavigateToBooking }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const portfolioImages = {
    solo: [solo1, solo2],
    group: [group1, group2],
    events: [event1, event2],
    videography: [event1] // Using event1 for videography
  };

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

  const testimonials = [
    {
      name: 'Maria Santos',
      text: 'Lumière Lens captured our wedding beautifully! Every moment was perfect and the photos exceeded our expectations.',
      rating: 5
    },
    {
      name: 'John Cruz',
      text: 'Professional, creative, and so easy to work with. Our family photos turned out amazing!',
      rating: 5
    },
    {
      name: 'Sarah Reyes',
      text: 'The solo photoshoot was such a great experience. Chloie and Emmanuel made me feel so comfortable.',
      rating: 5
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    alert('Message sent successfully!');
    setContactForm({ name: '', email: '', message: '' });
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#F3E9DC] z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Camera className="h-8 w-8 text-[#5E3023]" />
              <span className="text-xl font-bold text-[#5E3023]">Lumière Lens</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-[#895737] hover:text-[#5E3023] transition-colors">Home</a>
              <a href="#portfolio" className="text-[#895737] hover:text-[#5E3023] transition-colors">Portfolio</a>
              <a href="#services" className="text-[#895737] hover:text-[#5E3023] transition-colors">Services</a>
              <Button 
                onClick={onNavigateToBooking}
                className="bg-[#5E3023] hover:bg-[#895737] text-white px-6 py-2 rounded-lg"
              >
                Booking
              </Button>
              <a href="#contact" className="text-[#895737] hover:text-[#5E3023] transition-colors">Contact</a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[#5E3023]"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#F3E9DC]">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-[#895737] hover:text-[#5E3023] transition-colors">Home</a>
                <a href="#portfolio" className="text-[#895737] hover:text-[#5E3023] transition-colors">Portfolio</a>
                <a href="#services" className="text-[#895737] hover:text-[#5E3023] transition-colors">Services</a>
                <Button 
                  onClick={onNavigateToBooking}
                  className="bg-[#5E3023] hover:bg-[#895737] text-white w-full"
                >
                  Booking
                </Button>
                <a href="#contact" className="text-[#895737] hover:text-[#5E3023] transition-colors">Contact</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={heroImage}
            alt="Lumière Lens Photography - Capturing Light, Crafting Stories"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-xl mb-4">Capturing Light, Crafting Stories</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-4">Lumière Lens</h1>
          <p className="text-xl md:text-2xl mb-8">Chloie & Emmanuel</p>
          <Button 
            onClick={onNavigateToBooking}
            className="bg-[#5E3023] hover:bg-[#895737] text-white px-8 py-4 text-lg rounded-lg"
          >
            Book Now
          </Button>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ImageWithFallback
                src={solo2}
                alt="Chloie & Emmanuel - Lumière Lens Photographers"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#5E3023] mb-6">About Us</h2>
              <p className="text-gray-700 mb-6">
                Welcome to Lumière Lens, where passion meets artistry. We are Chloie and Emmanuel, 
                a dynamic photography duo dedicated to capturing life's most precious moments with 
                creativity and style.
              </p>
              <p className="text-gray-700 mb-6">
                Our approach combines technical excellence with emotional storytelling, ensuring 
                that every photograph we create tells a unique story. From intimate portraits to 
                grand celebrations, we specialize in capturing the light, emotion, and beauty in 
                every moment.
              </p>
              <p className="text-gray-700">
                With years of experience in solo, group, and event photography, we bring a fresh 
                perspective to every shoot, making sure our clients feel comfortable and confident 
                throughout the entire process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 px-6 lg:px-8 bg-[#F3E9DC]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#5E3023] text-center mb-12">Our Work</h2>
          
          <Tabs defaultValue="solo" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto mb-12">
              <TabsTrigger value="solo">Solo</TabsTrigger>
              <TabsTrigger value="group">Group</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="videography">Videography</TabsTrigger>
            </TabsList>
            
            {Object.entries(portfolioImages).map(([category, images]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={image}
                        alt={`${category} photography`}
                        className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium capitalize">{category} Photography</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#5E3023] text-center mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border-2 border-[#F3E9DC] hover:border-[#C08552] transition-colors">
                <CardHeader className="bg-[#5E3023] text-white">
                  <CardTitle className="text-xl">{pkg.title}</CardTitle>
                  <p className="text-2xl font-bold text-[#F3E9DC]">{pkg.price}</p>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-[#895737] font-medium mb-4">{pkg.duration}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-[#5E3023] mb-2">Inclusions:</p>
                      <ul className="text-sm text-[#895737] space-y-1">
                        {pkg.inclusions.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-[#5E3023] mb-2">Extra charges:</p>
                      <ul className="text-sm text-[#895737] space-y-1">
                        {pkg.extras.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              onClick={onNavigateToBooking}
              variant="outline" 
              className="border-[#5E3023] text-[#5E3023] hover:bg-[#F3E9DC] px-8 py-3 rounded-lg"
            >
              View Full Pricelist
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 lg:px-8 bg-[#5E3023] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">What Our Clients Say</h2>
          
          <div className="relative">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Button
                onClick={prevTestimonial}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#895737]"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex-1 max-w-2xl">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#F3E9DC] text-[#F3E9DC]" />
                  ))}
                </div>
                <p className="text-xl mb-6 italic">"{testimonials[currentTestimonial].text}"</p>
                <p className="font-medium text-[#F3E9DC]">- {testimonials[currentTestimonial].name}</p>
              </div>
              
              <Button
                onClick={nextTestimonial}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#895737]"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex justify-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-white' : 'bg-[#C08552]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 px-6 lg:px-8 bg-[#F3E9DC]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#5E3023] mb-6">Ready to Capture Your Moments?</h2>
          <p className="text-xl text-[#895737] mb-8">
            Let us tell your story through beautiful, timeless photography.
          </p>
          <Button 
            onClick={onNavigateToBooking}
            className="bg-[#5E3023] hover:bg-[#895737] text-white px-12 py-4 text-lg rounded-lg"
          >
            Book a Photoshoot
          </Button>
        </div>
      </section>

      {/* Contact Section (Info-only, no form) */}
      <section id="contact" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#5E3023] text-center mb-12">Get in Touch</h2>
          <div className="max-w-2xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold text-[#5E3023] mb-6">Contact Information</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#C08552]" />
                  <span className="text-gray-700">09457120419</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#C08552]" />
                  <span className="text-gray-700">emmanuelvillar60@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#C08552]" />
                  <span className="text-gray-700">Cagayan de Oro City, Philippines</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[#5E3023] mb-4">Payment Options</h4>
                <p className="text-gray-700 mb-2">GCash: 09457120419 (Emmanuel V.)</p>
                <p className="text-gray-700">Cash: Accepted on-site</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5E3023] text-white py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Camera className="h-6 w-6" />
              <span className="font-semibold">Lumière Lens</span>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a 
                href="https://www.facebook.com/profile.php?id=61573942870884" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
                className="hover:text-[#F3E9DC] transition-colors"
              >
                <Facebook className="h-6 w-6 cursor-pointer" />
              </a>
              <a 
                href="https://www.instagram.com/lumiere_lens.cdo/ " 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page"
                className="hover:text-[#F3E9DC] transition-colors"
              >
                <Instagram className="h-6 w-6 cursor-pointer" />
              </a>
            </div>
            
            {/* Copyright */}
            <p className="text-[#F3E9DC] text-sm">
              © 2025 Lumière Lens - All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

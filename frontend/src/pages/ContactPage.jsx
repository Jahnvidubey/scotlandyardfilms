import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', eventDate: '',
    eventType: '', venueLocation: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanedPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      toast({ title: "Invalid Phone Number", description: "Please enter a valid 10-digit Indian mobile number", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    if (formData.eventDate) {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast({ title: "Invalid Event Date", description: "Event date cannot be in the past.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: cleanedPhone,
          eventType: formData.eventType,
          venueLocation: formData.venueLocation.trim(),
          message: formData.message.trim(),
          eventDate: formData.eventDate || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Inquiry Sent!", description: data.message });
        setFormData({ name: '', email: '', phone: '', eventDate: '', eventType: '', venueLocation: '', message: '' });
      } else {
        toast({ title: "Error", description: data.detail || "Something went wrong", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please check if backend is running.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to capture your special day? Get in touch with us to check our availability and discuss your wedding photography needs.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Information */}
          <motion.div className="lg:w-1/3 space-y-8" initial="initial" animate="animate" variants={{ initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.2 } } }}>
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-accent mt-1" />
                  <div><h3 className="font-medium">Our Location</h3><p className="text-muted-foreground">Indore M.P. India</p></div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 text-accent mt-1" />
                  <div><h3 className="font-medium">Phone Number</h3><p className="text-muted-foreground">+91 74703 85513</p></div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 text-accent mt-1" />
                  <div><h3 className="font-medium">Email Address</h3><p className="text-muted-foreground">scotlandyardproductions@gmail.com</p></div>
                </div>
                <div className="flex items-start space-x-4">
                  <Calendar className="w-5 h-5 text-accent mt-1" />
                  <div><h3 className="font-medium">Working Hours</h3><p className="text-muted-foreground">Monday - Saturday: 10:00 AM - 7:00 PM</p></div>
                </div>
              </div>
            </motion.div>
            <motion.div className="rounded-lg overflow-hidden h-64 mt-8" variants={fadeIn}>
              <img className="w-full h-full object-cover" alt="Office location" src="https://images.unsplash.com/photo-1641236210747-48bc43e4517f" />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div className="lg:w-2/3 bg-white rounded-xl shadow-lg p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name <span className="text-red-500">*</span></Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />
                  <p className="text-xs text-muted-foreground">Enter 10-digit Indian mobile number</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type <span className="text-red-500">*</span></Label>
                  <select id="eventType" name="eventType" value={formData.eventType} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option value="">Select Event Type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Pre-wedding">Pre-wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input id="eventDate" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venueLocation">Venue Location <span className="text-red-500">*</span></Label>
                  <Input id="venueLocation" name="venueLocation" value={formData.venueLocation} onChange={handleChange} placeholder="City, State" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Your Message <span className="text-red-500">*</span></Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your event and photography needs" rows={5} required />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Send Message <Send size={16} /></span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div className="mt-20" initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.2 } } }}>
          <motion.div className="text-center mb-12" variants={fadeIn}>
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Find answers to common questions about our wedding photography services.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={fadeIn}>
              <h3 className="text-xl font-semibold mb-2">How far in advance should we book?</h3>
              <p className="text-muted-foreground">We recommend booking 6-12 months in advance, especially for peak wedding season dates (October-February). Popular dates can book up quickly.</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={fadeIn}>
              <h3 className="text-xl font-semibold mb-2">What is your pricing structure?</h3>
              <p className="text-muted-foreground">Our packages start from ₹75,000 and vary based on coverage hours, number of photographers, and deliverables. We can create custom packages to suit your needs.</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={fadeIn}>
              <h3 className="text-xl font-semibold mb-2">Do you travel for destination weddings?</h3>
              <p className="text-muted-foreground">Yes, we love destination weddings! We have photographed weddings across India and internationally. Travel and accommodation costs are additional.</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={fadeIn}>
              <h3 className="text-xl font-semibold mb-2">How long until we receive our photos?</h3>
              <p className="text-muted-foreground">You'll receive a sneak peek within 1-2 weeks after your wedding. The complete gallery is typically delivered within 6-8 weeks.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;

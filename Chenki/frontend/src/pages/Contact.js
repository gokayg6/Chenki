import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BubbleBackground from '@/components/BubbleBackground';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-20 page-enter">
      <BubbleBackground />
      
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-[#8b4513]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center text-[#8b4513] hover:text-[#654321] transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#8b4513] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Get in Touch
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="luxury-card rounded-lg p-8 scale-in" data-testid="contact-info-email">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-full mb-4 float-animation">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8b4513] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Email Us
              </h3>
              <p className="text-gray-600">support@chenki.com</p>
              <p className="text-gray-600">sales@chenki.com</p>
            </div>

            <div className="luxury-card rounded-lg p-8 scale-in" data-testid="contact-info-phone" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-full mb-4 float-animation" style={{ animationDelay: '0.5s' }}>
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8b4513] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Call Us
              </h3>
              <p className="text-gray-600">+90 (212) 555-0123</p>
              <p className="text-gray-600">Mon-Fri: 9AM - 6PM</p>
            </div>

            <div className="luxury-card rounded-lg p-8 scale-in" data-testid="contact-info-address" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-full mb-4 float-animation" style={{ animationDelay: '1s' }}>
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8b4513] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Visit Us
              </h3>
              <p className="text-gray-600">123 Luxury Avenue</p>
              <p className="text-gray-600">Istanbul, Turkey 34000</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="luxury-card rounded-lg p-10 rotate-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-3xl font-bold text-[#8b4513] mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-[#8b4513] font-medium">Your Name</Label>
                    <Input
                      data-testid="contact-name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="luxury-input mt-2"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-[#8b4513] font-medium">Email Address</Label>
                    <Input
                      data-testid="contact-email"
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="luxury-input mt-2"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-[#8b4513] font-medium">Subject</Label>
                  <Input
                    data-testid="contact-subject"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="luxury-input mt-2"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-[#8b4513] font-medium">Message</Label>
                  <Textarea
                    data-testid="contact-message"
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="luxury-input mt-2"
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button
                  data-testid="contact-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8b4513] hover:bg-[#654321] text-white py-6 text-lg rounded-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="spinner mr-3"></div>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
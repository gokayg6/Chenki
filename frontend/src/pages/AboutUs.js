import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Heart, Users, Sparkles } from 'lucide-react';
import BubbleBackground from '@/components/BubbleBackground';

const AboutUs = () => {
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
        <div className="text-center mb-20 fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#8b4513] mb-6 text-reveal" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            About Chenki
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto text-reveal" style={{ animationDelay: '0.2s' }}>
            Redefining luxury shopping with elegance, quality, and exceptional service
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div className="luxury-card rounded-lg p-10 scale-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl font-bold text-[#8b4513] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Our Story
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded with a passion for luxury and excellence, Chenki has grown to become a premier destination for discerning shoppers who appreciate the finer things in life.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our carefully curated collection features exclusive products from renowned designers and artisans around the world. Each item is selected for its exceptional quality, timeless design, and ability to elevate your lifestyle.
            </p>
            <p className="text-gray-700 leading-relaxed">
              At Chenki, we believe that luxury is not just about products—it's about the entire experience. From browsing our elegant online store to the moment your purchase arrives at your doorstep, we ensure every touchpoint reflects our commitment to excellence.
            </p>
          </div>

          <div className="luxury-card rounded-lg p-10 rotate-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl font-bold text-[#8b4513] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To provide our customers with an unparalleled luxury shopping experience, offering authentic, high-quality products paired with exceptional service that exceeds expectations.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#d4af37] mr-2">✦</span>
                Sourcing only the finest luxury products from trusted designers
              </li>
              <li className="flex items-start">
                <span className="text-[#d4af37] mr-2">✦</span>
                Ensuring authenticity and quality in every item
              </li>
              <li className="flex items-start">
                <span className="text-[#d4af37] mr-2">✦</span>
                Providing personalized customer service
              </li>
              <li className="flex items-start">
                <span className="text-[#d4af37] mr-2">✦</span>
                Creating a seamless and elegant shopping experience
              </li>
            </ul>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-[#8b4513] text-center mb-12" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="luxury-card rounded-lg p-8 text-center hover:scale-105 transition-transform duration-500" data-testid="value-card-quality">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-full mb-6 float-animation">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8b4513] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Quality
              </h3>
              <p className="text-gray-600">
                We never compromise on the quality of our products, ensuring each item meets our rigorous standards.
              </p>
            </div>

            <div className="luxury-card rounded-lg p-8 text-center hover:scale-105 transition-transform duration-500" data-testid="value-card-passion" style={{ transitionDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-full mb-6 float-animation" style={{ animationDelay: '0.5s' }}>
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8b4513] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Passion
              </h3>
              <p className="text-gray-600">
                Our love for luxury and beautiful design drives everything we do, from curation to customer service.
              </p>
            </div>

            <div className="luxury-card rounded-lg p-8 text-center hover:scale-105 transition-transform duration-500" data-testid="value-card-trust" style={{ transitionDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-full mb-6 float-animation" style={{ animationDelay: '1s' }}>
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8b4513] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Trust
              </h3>
              <p className="text-gray-600">
                Building lasting relationships with our customers through transparency, authenticity, and reliability.
              </p>
            </div>

            <div className="luxury-card rounded-lg p-8 text-center hover:scale-105 transition-transform duration-500" data-testid="value-card-excellence" style={{ transitionDelay: '0.3s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-full mb-6 float-animation" style={{ animationDelay: '1.5s' }}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8b4513] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Excellence
              </h3>
              <p className="text-gray-600">
                Striving for perfection in every aspect, from product selection to the complete customer experience.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="luxury-card rounded-lg p-12 text-center elastic-bounce">
          <h2 className="text-3xl font-bold text-[#8b4513] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Experience Luxury Shopping
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered the Chenki difference. 
            Explore our curated collection today.
          </p>
          <Link to="/">
            <button className="btn-primary px-8 py-4 text-lg rounded-full">
              Shop Our Collection
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
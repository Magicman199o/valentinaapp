import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Users, Sparkles, Clock, HandHeart, Building2, Mail, Phone, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Logo from '@/components/Logo';
import FloatingHearts from '@/components/FloatingHearts';
import SponsorCarousel from '@/components/SponsorCarousel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LandingPage = () => {
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [sponsorData, setSponsorData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorData.name || !sponsorData.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    setSubmitting(true);
    
    // Store sponsor inquiry in a simple way - using sponsors table with is_active = false
    const { error } = await supabase.from('sponsors').insert({
      name: `INQUIRY: ${sponsorData.name}`,
      icon_url: `Email: ${sponsorData.email}, Phone: ${sponsorData.phone || 'N/A'}, Company: ${sponsorData.company || 'N/A'}, Message: ${sponsorData.message || 'N/A'}`,
      link: 'pending',
      is_active: false,
    });

    setSubmitting(false);

    if (error) {
      toast.error('Failed to submit. Please try again.');
    } else {
      toast.success('Thank you! We will reach out to you soon. 💕');
      setShowSponsorForm(false);
      setSponsorData({ name: '', email: '', phone: '', company: '', message: '' });
    }
  };

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Find Your Match',
      description: 'Our algorithm matches you with compatible partners based on your preferences.',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '4-Day Magic',
      description: 'After signing up, wait just 4 days for your perfect match to be revealed.',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Instant Match',
      description: 'Can\'t wait? Get matched instantly with our premium instant match feature.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: 'Your privacy is our priority. Control what your match sees about you.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted relative overflow-hidden">
      <FloatingHearts />
      
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Login
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button className="btn-romantic">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-16 md:py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Heart className="w-16 h-16 text-primary fill-primary/30" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Your Journey to{' '}
            <span className="text-gradient">Love</span>
            {' '}Starts Here
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-2">
            Join thousands finding their perfect match through our unique matching experience.
          </p>
          
          <p className="text-primary font-semibold text-lg mb-8">
            VALENTINA 4.0
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-romantic text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => setShowSponsorForm(true)}
            >
              <HandHeart className="mr-2 w-5 h-5" />
              Become a Sponsor
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Sponsors */}
      <SponsorCarousel />

      {/* Features Section */}
      <section className="relative z-10 px-4 py-16 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-serif font-bold text-center mb-12"
        >
          Why Choose <span className="text-gradient">Valentina</span>?
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-romantic text-center group hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-romantic flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-16 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="card-romantic"
        >
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign up today and let the magic of love guide you to your soulmate.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="btn-romantic">
              Start Your Journey
              <Heart className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Valentina. Made with <Heart className="inline w-4 h-4 text-primary" /> for love seekers.
        </p>
      </footer>

      {/* Sponsor Form Modal */}
      <Dialog open={showSponsorForm} onOpenChange={setShowSponsorForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-primary" />
              Become a Sponsor
            </DialogTitle>
            <DialogDescription>
              Partner with Valentina and reach thousands of engaged users. Fill in your details and we'll get in touch.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSponsorSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="sponsor-name">Your Name *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="sponsor-name"
                  placeholder="John Doe"
                  value={sponsorData.name}
                  onChange={(e) => setSponsorData({ ...sponsorData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sponsor-email">Email *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="sponsor-email"
                  type="email"
                  placeholder="you@company.com"
                  value={sponsorData.email}
                  onChange={(e) => setSponsorData({ ...sponsorData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sponsor-phone">Phone (Optional)</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="sponsor-phone"
                  placeholder="+1234567890"
                  value={sponsorData.phone}
                  onChange={(e) => setSponsorData({ ...sponsorData, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sponsor-company">Company Name (Optional)</Label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="sponsor-company"
                  placeholder="Company Inc."
                  value={sponsorData.company}
                  onChange={(e) => setSponsorData({ ...sponsorData, company: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sponsor-message">Message (Optional)</Label>
              <Textarea
                id="sponsor-message"
                placeholder="Tell us about your sponsorship interests..."
                value={sponsorData.message}
                onChange={(e) => setSponsorData({ ...sponsorData, message: e.target.value })}
                rows={3}
              />
            </div>
            
            <Button type="submit" className="w-full btn-romantic" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;

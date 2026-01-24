import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Users, Sparkles, Clock, HandHeart, Building2, Mail, Phone, User, Briefcase, Star, Gift, MessageCircle } from 'lucide-react';
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
      title: 'Valentine\'s Day Reveal',
      description: 'Match is revealed by 6am on Valentine\'s Day (Feb 14).',
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50" />
      
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large decorative circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-pink-200/40 to-rose-300/40 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-200/30 to-pink-300/30 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-200/40 blur-3xl" />
      </div>
      
      <FloatingHearts />
      
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-pink-100/50">
              Login
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-pink-500/25 border-0">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>VALENTINA 4.0</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
              Your Journey to{' '}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-400 bg-clip-text text-transparent">
                Love
              </span>
              {' '}Starts Here
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Join thousands finding their perfect match through our unique matching experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-lg px-8 py-6 rounded-full shadow-xl shadow-pink-500/30 border-0">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-pink-200 hover:bg-pink-50"
                onClick={() => setShowSponsorForm(true)}
              >
                <HandHeart className="mr-2 w-5 h-5 text-pink-500" />
                Become a Sponsor
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center lg:justify-start gap-8 mt-10"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-500">1000+</p>
                <p className="text-sm text-muted-foreground">Happy Matches</p>
              </div>
              <div className="w-px h-10 bg-pink-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-500">4.9</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="w-px h-10 bg-pink-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">24h</p>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Decorative illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main heart shape */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-8 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-400 to-red-400 shadow-2xl shadow-pink-500/40"
                style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
              />
              
              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-4 right-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">New Match!</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute bottom-8 left-0 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Hey there! 💕</p>
                    <p className="text-xs text-muted-foreground">2 min ago</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-4 right-8 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Gift Sent</p>
                    <p className="text-xs text-muted-foreground">🎁 Special</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative hearts */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2 + i * 0.5, 
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                  className="absolute"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 18}%`,
                  }}
                >
                  <Heart className={`w-${4 + i} h-${4 + i} text-pink-${300 + i * 100} fill-pink-${200 + i * 100}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sponsors */}
      <div className="relative z-10">
        <SponsorCarousel />
      </div>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-pink-100 text-pink-600 text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold">
            Why Choose <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Valentina</span>?
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 text-center group hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 border border-pink-100/50"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-serif font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-16 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-red-400 p-8 md:p-12 text-center text-white shadow-2xl shadow-pink-500/30"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6"
          >
            <Heart className="w-8 h-8 fill-white" />
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Sign up today and let the magic of love guide you to your soulmate.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-white text-pink-600 hover:bg-white/90 rounded-full px-8 py-6 font-semibold shadow-xl">
              Start Your Journey
              <Heart className="ml-2 w-5 h-5 fill-pink-500" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-pink-100 py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Logo size="sm" />
          <p className="text-muted-foreground text-sm mt-4">
            © {new Date().getFullYear()} Valentina. Made with <Heart className="inline w-4 h-4 text-rose-500 fill-rose-500" /> for love seekers.
          </p>
        </div>
      </footer>

      {/* Sponsor Form Modal */}
      <Dialog open={showSponsorForm} onOpenChange={setShowSponsorForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-pink-500" />
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
            
            <Button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;

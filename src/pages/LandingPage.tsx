import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Users, Sparkles, Clock, HandHeart, Building2, Mail, Phone, User, Star, MessageCircle, Shield } from 'lucide-react';
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

// Import hero background image
import heroImage from '@/assets/landing-reference.png';
import valentinaLogo3D from '@/assets/valentina-logo-new.png';

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
      icon: <Heart className="w-6 h-6" />,
      title: 'Find Your Match',
      description: 'Our algorithm matches you with compatible partners based on your preferences.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Valentine's Day Reveal",
      description: 'Match is revealed by 6am on Valentine\'s Day (Feb 14).',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Instant Match',
      description: "Can't wait? Get matched instantly with our premium instant match feature.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Safe & Secure',
      description: 'Your privacy is our priority. Control what your match sees about you.',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <FloatingHearts />
      
      {/* Navigation */}
      <nav className="relative z-20 px-4 md:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Logo size="md" />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" className="text-foreground hover:bg-secondary font-medium">
              Login
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button className="btn-primary">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 gradient-hero-bg">
        {/* Bokeh effect overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full">
            <div className="absolute inset-0 bg-gradient-to-l from-pink-200/60 via-rose-100/40 to-transparent" />
            {/* Bokeh hearts */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  right: `${5 + Math.random() * 40}%`,
                  opacity: 0.3 + Math.random() * 0.4,
                }}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Heart 
                  className="text-rose-300 fill-rose-200" 
                  style={{ 
                    width: 20 + Math.random() * 40,
                    height: 20 + Math.random() * 40,
                    filter: 'blur(1px)',
                  }} 
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <img src={valentinaLogo3D} alt="Valentina 4.0" className="h-8 w-auto" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight text-foreground">
                Your Journey to{' '}
                <span className="text-gradient-primary">
                  Love
                </span>
                {' '}Starts Here
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                Love starts with a Match! find someone who makes Valentine's Day feel special, intentional, and real.
                <br /><br />
                Join thousands finding their perfect match through our unique valentine matching experience.
                <br /><br />
                click <span className="font-semibold text-primary">"GET ME A VAL"</span> to continue.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="btn-primary text-base px-8 py-6 rounded-full">
                    GET ME A VAL
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-outline-dark text-base px-8 py-6 rounded-full bg-secondary/50"
                  onClick={() => setShowSponsorForm(true)}
                >
                  <HandHeart className="mr-2 w-4 h-4" />
                  Become a Sponsor
                </Button>
              </div>

              {/* Avatars and stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center lg:justify-start gap-4 mt-10"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Over <span className="font-semibold text-foreground">18000+</span> successful valentine matches
                </p>
              </motion.div>
            </motion.div>

            {/* Right side - Hero image with cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Main hero image */}
                <div className="absolute inset-8 rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={heroImage} 
                    alt="Valentine hearts bokeh" 
                    className="w-full h-full object-cover"
                  />
                  {/* Matched badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      MATCHED
                    </span>
                  </div>
                </div>
                
                {/* Floating notification cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="notification-card absolute -top-2 right-0"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">New Match Alert!</p>
                    <p className="text-xs text-muted-foreground">You have a new match for Valentine</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="notification-card absolute bottom-8 -left-4"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Hey there! 💕</p>
                    <p className="text-xs text-muted-foreground">New message</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <div className="relative z-10 bg-background py-8">
        <SponsorCarousel />
      </div>

      {/* Features Section - "Why Choose Valentina" */}
      <section id="features" className="relative z-10 bg-background px-4 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground flex items-center justify-center gap-3 flex-wrap">
              Why Choose <img src={valentinaLogo3D} alt="Valentina" className="h-10 md:h-12 w-auto inline-block align-middle" />?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're looking to exchange thoughtful gifts or you're single and ready for something serious, Valentina makes it easy! We simplify the journey to real, meaningful love.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="icon-container-primary mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-serif font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 bg-background px-4 md:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Sign up today and let the magic of love guide you to your soulmate.
          </p>
          
          <div className="flex justify-center">
            <Link to="/auth?mode=signup">
              <Button className="btn-primary h-12 px-8 rounded-full whitespace-nowrap">
                GET ME A VAL
              </Button>
            </Link>
          </div>
          
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 section-footer py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground mt-4">
            Making valentine matchmaking better. Your favorite love matching app ❤️
          </p>
        </div>
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
            
            <Button type="submit" className="w-full btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  gender?: 'male' | 'female';
  name?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ targetDate, onComplete, gender = 'male', name }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => {
    const prevRef = useRef<number>(value);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
      if (prevRef.current !== value) {
        setAnimating(true);
        const t = setTimeout(() => setAnimating(false), 400);
        prevRef.current = value;
        return () => clearTimeout(t);
      }
    }, [value]);

    return (
      <motion.div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={animating ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center shadow-md bg-transparent"
        >
          <span className="text-xl md:text-2xl font-oswald font-bold text-gray-900 uppercase tracking-tight">
            {value.toString().padStart(2, '0')}
          </span>
        </motion.div>
        <span className="mt-1 text-xs font-oswald font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      </motion.div>
    );
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-romantic text-primary-foreground"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="font-semibold">Match Ready!</span>
          <Heart className="w-5 h-5 fill-current" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 text-primary">
        <Clock className="w-5 h-5" />
        <span className="font-medium">Time until your match</span>
      </div>

      {/* Animated Illustration */}
      <div className="flex justify-center mb-4 relative">
        {gender === 'male' ? (
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-center"
          >
            <div className="relative inline-block">
              {/* Man proposing illustration */}
              <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-48 md:h-48">
                {/* Body - kneeling position */}
                <ellipse cx="100" cy="170" rx="30" ry="10" fill="hsl(var(--muted))" opacity="0.3" />
                
                {/* Legs - kneeling */}
                <path d="M85 150 L70 170 L80 175" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M115 150 L130 160 L120 175" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Torso */}
                <rect x="80" y="100" width="40" height="55" rx="10" fill="hsl(var(--primary))" />
                
                {/* Head */}
                <circle cx="100" cy="75" r="25" fill="hsl(346 77% 90%)" />
                
                {/* Hair */}
                <path d="M75 70 Q80 50 100 50 Q120 50 125 70" fill="hsl(20 20% 25%)" />
                
                {/* Face */}
                <circle cx="92" cy="72" r="3" fill="hsl(20 20% 25%)" />
                <circle cx="108" cy="72" r="3" fill="hsl(20 20% 25%)" />
                <path d="M95 82 Q100 87 105 82" fill="none" stroke="hsl(20 20% 25%)" strokeWidth="2" strokeLinecap="round" />
                
                {/* Arms holding flower */}
                <path d="M80 110 L50 100 L45 90" fill="none" stroke="hsl(346 77% 90%)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M120 110 L140 105 L145 95" fill="none" stroke="hsl(346 77% 90%)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Flower bouquet */}
                <motion.g
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ transformOrigin: '145px 95px' }}
                >
                  <rect x="140" y="85" width="8" height="25" rx="2" fill="hsl(120 40% 40%)" />
                  <circle cx="145" cy="75" r="10" fill="hsl(350 80% 60%)" />
                  <circle cx="138" cy="80" r="8" fill="hsl(320 80% 70%)" />
                  <circle cx="152" cy="80" r="8" fill="hsl(0 80% 65%)" />
                  <circle cx="145" cy="68" r="6" fill="hsl(340 90% 75%)" />
                </motion.g>
                
                {/* Floating hearts */}
                <motion.g
                  animate={{ y: [-5, -15], opacity: [1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path d="M160 60 C160 55 165 50 170 55 C175 50 180 55 180 60 C180 70 170 75 170 75 C170 75 160 70 160 60Z" fill="hsl(var(--primary))" opacity="0.6" />
                </motion.g>
              </svg>
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ 
              y: [0, -3, 0],
              rotate: [0, 1, 0, -1, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-center"
          >
            <div className="relative inline-block">
              {/* Lady in gown waiting illustration */}
              <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-48 md:h-48">
                {/* Shadow */}
                <ellipse cx="100" cy="185" rx="40" ry="8" fill="hsl(var(--muted))" opacity="0.3" />
                
                {/* Gown - elegant flowing dress */}
                <path d="M60 100 Q50 140 45 190 L155 190 Q150 140 140 100" fill="hsl(var(--primary))" />
                <path d="M65 105 Q55 145 52 185" fill="none" stroke="hsl(346 77% 35%)" strokeWidth="1" opacity="0.3" />
                <path d="M135 105 Q145 145 148 185" fill="none" stroke="hsl(346 77% 35%)" strokeWidth="1" opacity="0.3" />
                
                {/* Gown details - subtle sparkles */}
                <motion.circle 
                  cx="80" cy="140" r="2" 
                  fill="white" 
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                />
                <motion.circle 
                  cx="120" cy="150" r="2" 
                  fill="white" 
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.circle 
                  cx="100" cy="165" r="2" 
                  fill="white" 
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                
                {/* Torso */}
                <rect x="80" y="70" width="40" height="35" rx="5" fill="hsl(var(--primary))" />
                
                {/* Neckline */}
                <path d="M85 70 Q100 80 115 70" fill="hsl(346 77% 90%)" />
                
                {/* Head */}
                <circle cx="100" cy="50" r="22" fill="hsl(346 77% 90%)" />
                
                {/* Hair - elegant updo */}
                <path d="M78 45 Q75 25 100 20 Q125 25 122 45" fill="hsl(20 30% 20%)" />
                <ellipse cx="100" cy="28" rx="18" ry="12" fill="hsl(20 30% 20%)" />
                <circle cx="100" cy="22" r="6" fill="hsl(20 30% 25%)" />
                
                {/* Hair accessory */}
                <motion.circle 
                  cx="110" cy="25" r="4" 
                  fill="hsl(40 90% 60%)"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                
                {/* Face */}
                <circle cx="93" cy="48" r="2.5" fill="hsl(20 20% 25%)" />
                <circle cx="107" cy="48" r="2.5" fill="hsl(20 20% 25%)" />
                <ellipse cx="93" cy="47" rx="3.5" ry="2" fill="hsl(346 77% 90%)" />
                <ellipse cx="107" cy="47" rx="3.5" ry="2" fill="hsl(346 77% 90%)" />
                <path d="M96 58 Q100 62 104 58" fill="none" stroke="hsl(350 60% 50%)" strokeWidth="2" strokeLinecap="round" />
                
                {/* Blush */}
                <ellipse cx="88" cy="54" rx="4" ry="2" fill="hsl(350 70% 80%)" opacity="0.4" />
                <ellipse cx="112" cy="54" rx="4" ry="2" fill="hsl(350 70% 80%)" opacity="0.4" />
                
                {/* Arms - hands clasped */}
                <path d="M80 80 L65 100 L70 110" fill="none" stroke="hsl(346 77% 90%)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M120 80 L135 100 L130 110" fill="none" stroke="hsl(346 77% 90%)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Bouquet in hands */}
                <g>
                  <ellipse cx="100" cy="115" rx="15" ry="10" fill="hsl(350 80% 70%)" />
                  <circle cx="95" cy="112" r="6" fill="hsl(0 80% 65%)" />
                  <circle cx="105" cy="112" r="6" fill="hsl(320 80% 70%)" />
                  <circle cx="100" cy="108" r="5" fill="hsl(350 90% 75%)" />
                  <ellipse cx="100" cy="122" rx="8" ry="4" fill="hsl(120 40% 40%)" />
                </g>
                
                {/* Floating hearts */}
                <motion.g
                  animate={{ y: [-5, -20], opacity: [0.8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <path d="M55 40 C55 36 59 32 63 36 C67 32 71 36 71 40 C71 48 63 52 63 52 C63 52 55 48 55 40Z" fill="hsl(var(--primary))" opacity="0.5" transform="scale(0.6)" />
                </motion.g>
                <motion.g
                  animate={{ y: [-5, -25], opacity: [0.8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                >
                  <path d="M150 35 C150 31 154 27 158 31 C162 27 166 31 166 35 C166 43 158 47 158 47 C158 47 150 43 150 35Z" fill="hsl(var(--primary))" opacity="0.4" transform="scale(0.5)" />
                </motion.g>
              </svg>
            </div>
          </motion.div>
        )}
        {/* Pink card overlay matching Figma */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 w-[86%] max-w-xl">
          <div className="rounded-3xl shadow-xl overflow-hidden bg-rose-400/95 p-6 md:p-10 text-center text-white relative">
            {/* Floating hearts background */}
            <motion.div
              className="absolute top-4 left-6 text-rose-300"
              animate={{ y: [0, -20], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="w-6 h-6 fill-current" />
            </motion.div>
            <motion.div
              className="absolute top-12 right-8 text-rose-300"
              animate={{ y: [0, -15], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>
            <motion.div
              className="absolute bottom-8 left-12 text-rose-300"
              animate={{ y: [0, -18], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <Heart className="w-4 h-4 fill-current" />
            </motion.div>
            <motion.div
              className="absolute bottom-12 right-6 text-rose-300"
              animate={{ y: [0, -20], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 0.8 }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-oswald font-bold uppercase tracking-wide">Awaiting a match</h2>
            <p className="mt-2 text-sm md:text-base font-oswald font-bold opacity-95 uppercase tracking-wide">{name ?? 'John Doe'}, your match will be revealed in</p>

            <div className="mt-6 bg-[#f7f1e6] rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3 justify-center w-full">
                <TimeUnit value={timeLeft.days} label="Days" />
                <div className="text-lg md:text-2xl font-oswald font-bold text-[#c87a6f]">:</div>
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <div className="text-lg md:text-2xl font-oswald font-bold text-[#c87a6f]">:</div>
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <div className="text-lg md:text-2xl font-oswald font-bold text-[#c87a6f]">:</div>
                <TimeUnit value={timeLeft.seconds} label="Sec" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;

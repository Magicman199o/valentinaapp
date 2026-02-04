import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

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

const CountdownTimer = ({ targetDate, onComplete, name }: CountdownTimerProps) => {
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
          className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center shadow-md bg-transparent"
        >
          <span className="text-3xl md:text-4xl font-oswald font-bold text-red-600 uppercase tracking-tight">
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
      {/* Intro text above countdown card */}
      <div className="text-center space-y-2 px-4">
        <p className="text-xl md:text-2xl font-merriweather font-bold text-primary">
          guess who's gonna be your val ? 😍
        </p>
        <p className="text-lg text-muted-foreground font-medium">
          you're almost there! 🔥
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          exciting times ahead! Once the timer runs out, you'll be able to see your match. stay tuned !
        </p>
      </div>

      {/* Pink countdown card */}
      <div className="w-full max-w-xl mx-auto">
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

          <h2 className="text-3xl md:text-4xl font-merriweather font-black uppercase tracking-wide">Awaiting a match</h2>
          <p className="mt-2 text-sm md:text-base opacity-95"><span className="font-oswald font-bold uppercase tracking-wide">{name ?? 'John Doe'}</span>, your match will be revealed in</p>

          <div className="mt-6 bg-[#f7f1e6] rounded-xl px-6 py-5 flex items-center justify-center shadow-inner">
            <div className="flex items-center gap-2 md:gap-4 justify-center w-full flex-wrap">
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
  );
};

export default CountdownTimer;

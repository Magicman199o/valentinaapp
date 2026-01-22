import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface CircularCountdownProps {
  targetDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CircularCountdown = ({ targetDate, onComplete }: CircularCountdownProps) => {
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

  // Calculate progress for circle (total seconds remaining vs total seconds in 4 days)
  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const maxSeconds = 4 * 86400; // 4 days in seconds
  const progress = Math.max(0, Math.min(1, totalSeconds / maxSeconds));
  
  // Circle parameters
  const size = 280;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Heart position on the circle
  const heartAngle = -90 + (360 * progress); // Start from top, go clockwise
  const heartX = size / 2 + radius * Math.cos((heartAngle * Math.PI) / 180);
  const heartY = size / 2 + radius * Math.sin((heartAngle * Math.PI) / 180);

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

  const formatTime = () => {
    return `${timeLeft.days}d:${timeLeft.hours}h:${timeLeft.minutes}m:${timeLeft.seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          className="absolute top-0 left-0 transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
        </svg>
        
        {/* Progress circle */}
        <svg
          width={size}
          height={size}
          className="absolute top-0 left-0 transform -rotate-90"
        >
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(173 58% 75%)" />
              <stop offset="100%" stopColor="hsl(173 58% 85%)" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>

        {/* Heart indicator */}
        <motion.div
          className="absolute"
          style={{
            left: heartX - 12,
            top: heartY - 12,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart className="w-6 h-6 text-primary fill-primary" />
        </motion.div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-sm mb-1">Time left</span>
          <span className="text-2xl md:text-3xl font-bold text-foreground">
            {formatTime()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CircularCountdown;

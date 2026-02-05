import { motion } from 'framer-motion';
import valentinaLogo from '@/assets/valentina-logo-new.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-24',
    lg: 'h-20 md:h-28',
  };

  return (
    <motion.div 
      className="flex items-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img 
        src={valentinaLogo} 
        alt="Valentina 4.0" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </motion.div>
  );
};

export default Logo;

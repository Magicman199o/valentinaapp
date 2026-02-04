import { motion } from 'framer-motion';
import valentinaLogo from '@/assets/valentina-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16 md:h-20',
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

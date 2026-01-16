import { motion } from 'framer-motion';
import { Heart, Flower2 } from 'lucide-react';

const FloatingHearts = () => {
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 3,
    size: 14 + Math.random() * 18,
    isFlower: i % 3 === 0, // Every 3rd item is a flower
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className={item.isFlower ? "absolute text-pink-300/30" : "absolute text-primary/20"}
          style={{ left: `${item.x}%`, top: '100%' }}
          animate={{
            y: [0, -window.innerHeight - 100],
            rotate: item.isFlower ? [0, 360] : [-10, 10, -10],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          {item.isFlower ? (
            <Flower2 size={item.size} />
          ) : (
            <Heart size={item.size} fill="currentColor" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;

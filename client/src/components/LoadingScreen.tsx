import { motion } from 'framer-motion';

interface LoadingScreenProps {
  isVisible: boolean;
}

export const LoadingScreen = ({ isVisible }: LoadingScreenProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-center space-y-3"
        >
          <h1 className="font-script text-4xl md:text-5xl text-accent">
            princess-made
          </h1>
          <p className="text-xs text-muted-foreground tracking-[0.3em] uppercase font-light">
            Handcrafted with love
          </p>
        </motion.div>

        {/* Elegant loading bar */}
        <div className="w-32 h-px bg-border overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
};

export const MiniLoader = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-6 h-6 border border-accent border-t-transparent rounded-full"
      />
      <p className="text-xs text-muted-foreground/50 tracking-[0.2em] uppercase font-light">Loading</p>
    </div>
  );
};

export const SkeletonLoader = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
          className="h-20 bg-cream"
          style={{ borderRadius: '2px' }}
        />
      ))}
    </div>
  );
};

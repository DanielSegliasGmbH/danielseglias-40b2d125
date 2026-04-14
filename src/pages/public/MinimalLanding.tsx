import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MinimalLanding() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.p
          className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="text-primary text-lg">✦</span> FinLife
        </motion.p>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          Verstehe dein Geld.{' '}
          <span className="text-primary">Übernimm die Kontrolle.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
          Finanzwissen, das dich weiterbringt – klar, unabhängig und auf den Punkt.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/login">
            <Button size="lg" className="text-base px-8 py-6 rounded-xl">
              Jetzt starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer hint */}
      <motion.p
        className="absolute bottom-8 text-xs text-muted-foreground/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        © {new Date().getFullYear()} Daniel Seglias
      </motion.p>
    </div>
  );
}

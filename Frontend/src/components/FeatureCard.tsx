import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  gradient: string;   // tailwind gradient classes for icon bg
  index?: number;      // for stagger animation
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  path,
  gradient,
  index = 0,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="group relative cursor-pointer rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md
                 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
    >
      {/* Glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100
                      bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <div
        className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}
                    shadow-sm transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      <h3 className="relative text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
        {title}
      </h3>

      <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Arrow indicator */}
      <div className="relative mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
        Explore
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </motion.div>
  );
};

export default FeatureCard;

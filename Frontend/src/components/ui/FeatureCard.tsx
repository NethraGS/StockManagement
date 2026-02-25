import React from "react";
import { Link } from "react-router-dom";

type FeatureCardProps = {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ to, title, description, icon }) => {
  return (
    <Link to={to} className="group">
      <div className="transition-shadow hover:shadow-lg hover:scale-[1.01] transform bg-card p-5 rounded-2xl border border-border h-full flex flex-col">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <div className="mt-auto pt-3">
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Open</span>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;

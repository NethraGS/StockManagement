import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, User } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">WealthPulse</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/settings" className="flex items-center gap-2 rounded-full p-1 hover:bg-accent/5">
              <User className="h-5 w-5 text-foreground/80" />
              <span className="hidden sm:inline text-sm text-muted-foreground">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

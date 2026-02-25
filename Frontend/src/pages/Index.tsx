import React from "react";
import HeroSection from "@/components/HeroSection";
import MarketTicker from "@/components/MarketTicker";
import { motion } from "framer-motion";
import { MOCK_CRYPTO, MOCK_COMMODITIES, EDUCATION_TOPICS } from "@/data/mockData";
import Sparkline from "@/components/Sparkline";
import { Link } from "react-router-dom";
import { ArrowRight, Bitcoin, Gem, GraduationCap, Briefcase, Brain, Newspaper, BarChart3, Settings, Grid, Calculator } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen">
      <MarketTicker />
      <HeroSection />

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Explore</h2>
        <p className="text-sm text-muted-foreground mb-6">Quick access to core features</p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <FeatureCard
            to="/portfolio"
            title="Portfolio"
            description="View and manage your investments"
            icon={<Briefcase className="h-5 w-5" />}
          />
          <FeatureCard
            to="/predict"
            title="Predict"
            description="Run predictions and models"
            icon={<Brain className="h-5 w-5" />}
          />
          <FeatureCard
            to="/indices"
            title="Indices"
            description="Major market indices and movements"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <FeatureCard
            to="/news"
            title="News"
            description="Latest market headlines"
            icon={<Newspaper className="h-5 w-5" />}
          />
          <FeatureCard
            to="/analytics"
            title="Analytics"
            description="Charts, metrics and insights"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <FeatureCard
            to="/dashboard"
            title="Dashboard"
            description="Overview of your activity"
            icon={<Grid className="h-5 w-5" />}
          />
          <FeatureCard
            to="/settings"
            title="Settings"
            description="Account and app preferences"
            icon={<Settings className="h-5 w-5" />}
          />
          <FeatureCard
            to="/calculators"
            title="Calculators"
            description="Financial planning tools and calculators"
            icon={<Calculator className="h-5 w-5" />}
          />
          <FeatureCard
            to="/learning"
            title="Learning"
            description="Courses, tutorials, and market education"
            icon={<GraduationCap className="h-5 w-5" />}
          />
          <FeatureCard
            to="/crypto"
            title="Crypto"
            description="Track cryptocurrencies"
            icon={<Bitcoin className="h-5 w-5" />}
          />
          <FeatureCard
            to="/commodities"
            title="Commodities"
            description="Gold, silver, oil & more"
            icon={<Gem className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Quick Crypto Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Crypto Markets</h2>
            <p className="text-sm text-muted-foreground mt-1">Top cryptocurrencies by market cap</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/crypto">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_CRYPTO.slice(0, 4).map((coin, i) => (
            <motion.div
              key={coin.symbol}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-3/10">
                    <Bitcoin className="h-4 w-4 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{coin.name}</p>
                    <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${coin.change >= 0 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                  {coin.change >= 0 ? "+" : ""}{coin.change}%
                </span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-foreground">${coin.price.toLocaleString()}</p>
                <Sparkline data={coin.data} positive={coin.change >= 0} width={60} height={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Commodities Strip */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Commodities</h2>
            <p className="text-sm text-muted-foreground mt-1">Track gold, silver, oil & more</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/commodities">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_COMMODITIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Gem className="h-4 w-4 text-chart-3" />
                <p className="text-sm font-semibold text-foreground">{c.name}</p>
                <span className={`ml-auto text-xs font-medium ${c.change >= 0 ? "text-gain" : "text-loss"}`}>
                  {c.change >= 0 ? "+" : ""}{c.change}%
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{c.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{c.unit}</p>
                </div>
                <Sparkline data={c.data} positive={c.change >= 0} width={60} height={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Education Preview */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Start Learning</h2>
            <p className="text-sm text-muted-foreground mt-1">Beginner-friendly financial education</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/education">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EDUCATION_TOPICS.slice(0, 4).map((topic, i) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 group cursor-pointer"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${topic.color} mb-3 text-2xl`}>
                {topic.icon}
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{topic.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{topic.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;

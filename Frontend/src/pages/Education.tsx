import React from "react";
import { motion } from "framer-motion";
import { EDUCATION_TOPICS } from "@/data/mockData";

const Education = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Learn Investing</h1>
        <p className="text-muted-foreground mb-8">Beginner-friendly financial education to build your knowledge</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EDUCATION_TOPICS.map((topic, i) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-6 group cursor-pointer"
          >
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${topic.color} mb-4 text-3xl`}>
              {topic.icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{topic.desc}</p>
            <div className="mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Read more →
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Education;

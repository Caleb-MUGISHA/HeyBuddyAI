import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tips = [
  "Remember to take short breaks every 25 minutes! 🌟",
  "Stay hydrated while studying! 💧",
  "Try explaining concepts to others - it helps with retention! 🎓",
  "Don't forget to review your notes before bedtime! 📚",
  "Set small, achievable goals for each study session! 🎯",
  "Create mind maps to connect different concepts! 🧠",
  "Exercise helps boost your brain power! 🏃‍♂️",
  "Get enough sleep to help memory consolidation! 😴"
];

export function StudyBuddy() {
  const [tip, setTip] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show a new tip every 5 minutes
    const showNewTip = () => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setTip(randomTip);
      setIsVisible(true);

      // Hide the tip after 10 seconds
      setTimeout(() => setIsVisible(false), 10000);
    };

    showNewTip(); // Show first tip immediately
    const interval = setInterval(showNewTip, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative"
      >
        <Bot className="h-12 w-12 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
        
        <AnimatePresence>
          {isVisible && tip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-primary/20"
            >
              <p className="text-sm text-foreground">{tip}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

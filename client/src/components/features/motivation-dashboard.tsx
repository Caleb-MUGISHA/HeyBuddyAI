import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, Flame, Award } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
}

export function MotivationDashboard() {
  const [streak, setStreak] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);

  const achievements: Achievement[] = [
    {
      id: 1,
      title: "Early Bird",
      description: "Started studying before 9 AM",
      icon: <Award className="h-6 w-6 text-yellow-500" />,
      unlocked: true,
    },
    {
      id: 2,
      title: "Focus Master",
      description: "Studied for 2 hours straight",
      icon: <Target className="h-6 w-6 text-blue-500" />,
      unlocked: false,
    },
    {
      id: 3,
      title: "Streak Champion",
      description: "Maintained a 5-day streak",
      icon: <Trophy className="h-6 w-6 text-purple-500" />,
      unlocked: false,
    },
  ];

  // Simulate progress updates
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyProgress((prev) => (prev < 100 ? prev + 1 : prev));
      setStudyTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animate streak counter
  useEffect(() => {
    const streakTimer = setInterval(() => {
      setStreak((prev) => prev + 1);
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
    }, 10000);

    return () => clearInterval(streakTimer);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Streak Counter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-4xl font-bold text-center"
            animate={{ scale: streak ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            {streak} days
          </motion.div>
        </CardContent>
      </Card>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Daily Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={dailyProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              {dailyProgress}% of daily goal completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Study Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-500" />
            Study Time Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-3xl font-bold text-center"
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {Math.floor(studyTime / 60)}h {studyTime % 60}m
          </motion.div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked
                    ? "bg-primary/5 border-primary"
                    : "bg-muted/50 border-muted"
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  {achievement.icon}
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed bottom-4 right-4 p-4 bg-card rounded-lg shadow-lg border border-primary z-50"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-semibold">New Achievement!</h3>
                <p className="text-sm text-muted-foreground">
                  You're on a roll! Keep it up!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

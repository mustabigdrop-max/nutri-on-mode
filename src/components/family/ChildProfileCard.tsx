import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Apple, Droplets, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { FamilyMember } from "@/hooks/useFamily";

interface ChildProfileCardProps {
  member: FamilyMember;
  todayFruits: number;
  todayHydration: number;
  onLogFruit: () => void;
  onLogWater: () => void;
}

const mascotEmojis = ["🦊", "🐱", "🐶", "🐼", "🦁", "🐸"];

const ChildProfileCard = ({ member, todayFruits, todayHydration, onLogFruit, onLogWater }: ChildProfileCardProps) => {
  const mascot = mascotEmojis[member.name.length % mascotEmojis.length];

  return (
    <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-primary/30 overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Mascot header */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            className="text-5xl"
          >
            {mascot}
          </motion.div>
          <div>
            <h3 className="text-lg font-bold">{member.name}</h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(member.stars, 5) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star className="h-4 w-4 fill-primary text-primary" />
                </motion.div>
              ))}
              <span className="text-xs text-muted-foreground ml-1">{member.stars} ⭐</span>
            </div>
          </div>
          <motion.div
            className="ml-auto text-3xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {member.avatar_emoji}
          </motion.div>
        </div>

        {/* Daily missions for kids */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-primary">🎯 Missões de hoje</p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium">Coma 1 fruta</p>
                <p className="text-xs text-muted-foreground">{todayFruits}/3 frutas hoje</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onLogFruit} className="text-xs">
              +1 🍎
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Beba água</p>
                <p className="text-xs text-muted-foreground">{todayHydration} ml hoje</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onLogWater} className="text-xs">
              +200ml 💧
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progresso do dia</span>
            <span className="text-primary">{Math.min(todayFruits * 33, 100)}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(todayFruits * 33, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {todayFruits >= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-primary/20 text-center justify-center"
          >
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">Parabéns! Missão cumprida! 🎉</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildProfileCard;

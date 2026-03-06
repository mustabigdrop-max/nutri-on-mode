import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Droplets, Salad, Star, TrendingUp } from "lucide-react";
import type { FamilyMember } from "@/hooks/useFamily";

interface ReportItem {
  member: FamilyMember;
  totalMeals: number;
  avgQuality: number;
  totalFruits: number;
  totalVeggies: number;
  totalHydration: number;
}

interface FamilyWeeklyReportProps {
  report: ReportItem[];
}

const FamilyWeeklyReport = ({ report }: FamilyWeeklyReportProps) => {
  if (report.length === 0) return null;

  const totalFamilyMeals = report.reduce((s, r) => s + r.totalMeals, 0);
  const avgFamilyQuality = report.length > 0
    ? Math.round(report.reduce((s, r) => s + r.avgQuality, 0) / report.length)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Relatório semanal da família
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Family summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-primary">{totalFamilyMeals}</p>
            <p className="text-xs text-muted-foreground">Refeições registradas</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-accent">{avgFamilyQuality}</p>
            <p className="text-xs text-muted-foreground">Score médio qualidade</p>
          </div>
        </div>

        {/* Per member */}
        <div className="space-y-2">
          {report.map((r) => (
            <div
              key={r.member.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <span className="text-2xl">{r.member.avatar_emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.member.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Apple className="h-3 w-3 text-green-400" />{r.totalFruits}
                  </span>
                  <span className="flex items-center gap-1">
                    <Salad className="h-3 w-3 text-green-500" />{r.totalVeggies}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-accent" />{(r.totalHydration / 1000).toFixed(1)}L
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{r.avgQuality}</p>
                <p className="text-[10px] text-muted-foreground">score</p>
              </div>
              {r.member.profile_type === "child" && (
                <Star className="h-4 w-4 text-primary fill-primary" />
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground italic">
          "Como sua família se alimentou essa semana"
        </p>
      </CardContent>
    </Card>
  );
};

export default FamilyWeeklyReport;

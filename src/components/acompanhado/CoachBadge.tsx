import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Target, User } from "lucide-react";

interface CoachBadgeProps {
  coachName: string;
  coachBio?: string | null;
  coachAvatar?: string | null;
}

const CoachBadge = ({ coachName, coachBio, coachAvatar }: CoachBadgeProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
      >
        <Target className="w-3.5 h-3.5" />
        Acompanhado por {coachName}
      </button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-primary/20 max-w-sm mx-auto p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-primary/10 to-transparent px-6 pt-8 pb-6 text-center">
            {coachAvatar ? (
              <img
                src={coachAvatar}
                alt={coachName}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-primary/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
            <h3 className="text-lg font-bold text-foreground">{coachName}</h3>
            <p className="text-xs text-primary font-mono mt-1">Seu Nutricionista</p>
            {coachBio && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {coachBio}
              </p>
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Seu coach gerencia seu plano alimentar e acompanha seu progresso pelo nutriON.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoachBadge;

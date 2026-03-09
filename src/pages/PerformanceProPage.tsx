import { usePerformancePro } from "@/hooks/usePerformancePro";
import ConsentGate from "@/components/performance-pro/ConsentGate";
import DiagnosticForm from "@/components/performance-pro/DiagnosticForm";
import ProtocolDashboard from "@/components/performance-pro/ProtocolDashboard";
import BottomNav from "@/components/BottomNav";

const PerformanceProPage = () => {
  const {
    hasConsent,
    protocol,
    exams,
    loading,
    acceptConsent,
    createProtocol,
    saveExam,
  } = usePerformancePro();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Step 1: Consent gate
  if (!hasConsent) {
    return <ConsentGate onAccept={acceptConsent} />;
  }

  // Step 2: Diagnostic form if no protocol
  if (!protocol) {
    return <DiagnosticForm onSubmit={createProtocol} />;
  }

  // Step 3: Dashboard
  return (
    <>
      <ProtocolDashboard
        protocol={protocol}
        exams={exams}
        onSaveExam={saveExam}
      />
      <BottomNav />
    </>
  );
};

export default PerformanceProPage;

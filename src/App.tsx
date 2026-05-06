import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PlanGateWrapper from "@/components/PlanGateWrapper";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import FirstMealScreen from "./pages/FirstMealScreen";
import ActivationTourPage from "./pages/ActivationTourPage";
import DashboardPage from "./pages/DashboardPage";
import MealPlanPage from "./pages/MealPlanPage";
import MealLogPage from "./pages/MealLogPage";
import ChatPage from "./pages/ChatPage";
import MicronutrientsPage from "./pages/MicronutrientsPage";
import GamificationPage from "./pages/GamificationPage";
import TransformationPage from "./pages/TransformationPage";
import ProfilePage from "./pages/ProfilePage";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import ShoppingListPage from "./pages/ShoppingListPage";
import WearablesPage from "./pages/WearablesPage";
import FamilyPage from "./pages/FamilyPage";
import SupportPage from "./pages/SupportPage";
import HydrationPage from "./pages/HydrationPage";
import MealHistoryPage from "./pages/MealHistoryPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import BloodTestPage from "./pages/BloodTestPage";
import DietBuilderPage from "./pages/DietBuilderPage";
import ChronobiologyPage from "./pages/ChronobiologyPage";
import BehavioralNutritionPage from "./pages/BehavioralNutritionPage";
import SupplementationPage from "./pages/SupplementationPage";
import MicrobiomePage from "./pages/MicrobiomePage";
import ProtocolEnginePage from "./pages/ProtocolEnginePage";

import RecipesPage from "./pages/RecipesPage";
import EventModePage from "./pages/EventModePage";
import FoodSimulatorPage from "./pages/FoodSimulatorPage";
import MonthlyReportPage from "./pages/MonthlyReportPage";
import Glp1Page from "./pages/Glp1Page";
import NutriSyncPage from "./pages/NutriSyncPage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import CircadianPage from "./pages/CircadianPage";
import PerformanceProPage from "./pages/PerformanceProPage";
import MentalPerformancePage from "./pages/MentalPerformancePage";
import CoachLandingPage from "./pages/CoachLandingPage";
import CoachOnboardingPage from "./pages/CoachOnboardingPage";
import CoachDashboardPage from "./pages/CoachDashboardPage";
import CoachTemplatesPage from "./pages/CoachTemplatesPage";
import CoachPatientDetailPage from "./pages/CoachPatientDetailPage";
import CoachAddPatientPage from "./pages/CoachAddPatientPage";
import CoachSettingsPage from "./pages/CoachSettingsPage";
import CoachCompetitionPlanPage from "./pages/CoachCompetitionPlanPage";
import AthleteCompetitionCheckInPage from "./pages/AthleteCompetitionCheckInPage";
import CoachAdjustmentLogPage from "./pages/CoachAdjustmentLogPage";
import BodyCompositionPage from "./pages/BodyCompositionPage";
import RefeedProtocolPage from "./pages/RefeedProtocolPage";
import BehavioralTriggersPage from "./pages/BehavioralTriggersPage";
import DietBreakPredictorPage from "./pages/DietBreakPredictorPage";
import VulnerabilityMapPage from "./pages/VulnerabilityMapPage";
import MetabolicReversionPage from "./pages/MetabolicReversionPage";
import NutricaoSportPage from "./pages/NutricaoSportPage";
import ProtocoloFemininoPage from "./pages/ProtocoloFemininoPage";
import AssessmentPCA from "./pages/AssessmentPCA";
import ResultadoPCAPage from "./pages/ResultadoPCA";
import WeightAdaptivePage from "./pages/WeightAdaptivePage";
import CoachInvitePage from "./pages/CoachInvitePage";
import LabPage from "./pages/LabPage";
import AdminApexCoachPage from "./pages/AdminApexCoachPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ExerciseSelectorPage from "./pages/ExerciseSelectorPage";
import PeriodizationPage from "./pages/PeriodizationPage";
import IntensityTechniquesPage from "./pages/IntensityTechniquesPage";
import ExerciseArsenalPage from "./pages/ExerciseArsenalPage";
import RecoveryProtocolsPage from "./pages/RecoveryProtocolsPage";
import AgentsPage from "./pages/AgentsPage";
import BiologicalAgePage from "./pages/BiologicalAgePage";
import EmotionalScanPage from "./pages/EmotionalScanPage";
import RefeicaoSnapPage from "./pages/RefeicaoSnapPage";
import AdminPartnersPage from "./pages/AdminPartnersPage";
import PartnerDashboardPage from "./pages/PartnerDashboardPage";
import PartnerBlockedPage from "./pages/PartnerBlockedPage";
import PeptideVaultPage from "./pages/PeptideVaultPage";
import TrainingPage from "./pages/TrainingPage";
import TrainingSystemsPage from "./pages/TrainingSystemsPage";
import ScienceHubPage from "./pages/ScienceHubPage";
import BiomechanicsVaultPage from "./pages/BiomechanicsVaultPage";
import MetabolicONPage from "./pages/MetabolicONPage";
import PlanoAlimentarIA from "./components/coach/PlanoAlimentarIA";
import AthleteRoster from "./components/coach/AthleteRoster";
import AthleteProgressTracker from "./components/coach/AthleteProgressTracker";
import CoachHub from "./pages/CoachHub";
import CoachApexVisualPage from "./pages/coach/CoachApexVisualPage";
import CoachTrainingOnPage from "./pages/coach/CoachTrainingOnPage";
import CoachLabExamsPage from "./pages/coach/CoachLabExamsPage";
import CoachReportsPage from "./pages/coach/CoachReportsPage";
import DrNexusPage from "./pages/DrNexusPage";
import VideoFormPage from "./pages/VideoFormPage";
import MeusProtocolosPage from "./pages/MeusProtocolosPage";
import ErgoVaultPage from "./pages/ErgoVaultPage";
import ErgoDiaryPage from "./pages/ErgoDiaryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentPCA /></ProtectedRoute>} />
            <Route path="/resultado-pca" element={<ProtectedRoute><ResultadoPCAPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/first-meal" element={<ProtectedRoute><FirstMealScreen /></ProtectedRoute>} />
            <Route path="/activation-tour" element={<ProtectedRoute><ActivationTourPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/meal-log" element={<ProtectedRoute><MealLogPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path="/hydration" element={<ProtectedRoute><HydrationPage /></ProtectedRoute>} />
            <Route path="/meus-protocolos" element={<ProtectedRoute><MeusProtocolosPage /></ProtectedRoute>} />

            {/* ON Plan */}
            <Route path="/meal-plan" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Plano Alimentar"><MealPlanPage /></PlanGateWrapper></ProtectedRoute>} />
            
            <Route path="/chat" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Chat IA"><ChatPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/micronutrients" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Micronutrientes"><MicronutrientsPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/gamification" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Gamificação"><GamificationPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/transformation" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Transformação"><TransformationPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/shopping-list" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Lista de Compras"><ShoppingListPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/meal-history" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Histórico de Refeições"><MealHistoryPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Progresso"><ProgressPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Receitas"><RecipesPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/workout-history" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Histórico de Treinos"><WorkoutHistoryPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/exercise-selector" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Seleção de Exercícios"><ExerciseSelectorPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/periodization" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Periodização"><PeriodizationPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/intensity-techniques" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Técnicas de Intensidade"><IntensityTechniquesPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/exercise-arsenal" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Arsenal de Exercícios"><ExerciseArsenalPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/recovery-protocols" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Recovery Arsenal"><RecoveryProtocolsPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Agentes IA"><AgentsPage /></PlanGateWrapper></ProtectedRoute>} />

            {/* ON+ Plan */}
            <Route path="/blood-test" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Exames de Sangue"><BloodTestPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/diet-builder" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Diet Builder"><DietBuilderPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/chronobiology" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Cronobiologia"><ChronobiologyPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/behavioral-nutrition" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Nutrição Comportamental"><BehavioralNutritionPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/supplementation" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Suplementação"><SupplementationPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/microbiome" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Microbioma"><MicrobiomePage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/protocols" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Motor de Protocolos"><ProtocolEnginePage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/event-mode" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Modo Evento"><EventModePage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/food-simulator" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Simulador 'E se eu comer?'"><FoodSimulatorPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/monthly-report" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Relatório Mensal"><MonthlyReportPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/glp1" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Protocolo GLP-1"><Glp1Page /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/nutrisync" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="NutriSync"><NutriSyncPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/circadian" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Circadiano"><CircadianPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/mental-performance" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Mental Performance"><MentalPerformancePage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/wearables" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Wearables"><WearablesPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/family" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Modo Família"><FamilyPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/body-composition" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Composição Corporal"><BodyCompositionPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/refeed-protocol" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Protocolo Refeed"><RefeedProtocolPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/behavioral-triggers" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Gatilhos Comportamentais"><BehavioralTriggersPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/diet-break-predictor" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Preditor de Diet Break"><DietBreakPredictorPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/vulnerability-map" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Mapa de Vulnerabilidade"><VulnerabilityMapPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/metabolic-reversion" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Reversão Metabólica"><MetabolicReversionPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/nutricao-sport" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Nutrição Sport"><NutricaoSportPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/protocolo-feminino" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Protocolo Feminino"><ProtocoloFemininoPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/ergo-vault" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="ERGO VAULT Feminino"><ErgoVaultPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/ergo-diary" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Diários de Ergogênicos"><ErgoDiaryPage /></PlanGateWrapper></ProtectedRoute>} />

            {/* ON PRO Plan */}
            <Route path="/performance-pro" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Performance Pro"><PerformanceProPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/professional" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Dashboard Profissional"><ProfessionalDashboard /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/weight-adaptive" element={<ProtectedRoute><WeightAdaptivePage /></ProtectedRoute>} />
            <Route path="/biological-age" element={<ProtectedRoute><BiologicalAgePage /></ProtectedRoute>} />
            <Route path="/lab" element={<ProtectedRoute><LabPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/apex-coach" element={<ProtectedRoute><AdminApexCoachPage /></ProtectedRoute>} />
            <Route path="/emotional-scan" element={<ProtectedRoute><EmotionalScanPage /></ProtectedRoute>} />
            <Route path="/refeicao-snap" element={<ProtectedRoute><RefeicaoSnapPage /></ProtectedRoute>} />
            <Route path="/convite/:token" element={<CoachInvitePage />} />
            <Route path="/admin/partners" element={<ProtectedRoute><AdminPartnersPage /></ProtectedRoute>} />
            <Route path="/partner" element={<ProtectedRoute><PartnerDashboardPage /></ProtectedRoute>} />
            <Route path="/blocked" element={<PartnerBlockedPage />} />
            <Route path="/peptide-vault" element={<ProtectedRoute><PeptideVaultPage /></ProtectedRoute>} />
            {/* Training & Science */}
            <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
            <Route path="/training/systems" element={<ProtectedRoute><TrainingSystemsPage /></ProtectedRoute>} />
            <Route path="/science" element={<ProtectedRoute><ScienceHubPage /></ProtectedRoute>} />
            <Route path="/biomechanics" element={<ProtectedRoute><BiomechanicsVaultPage /></ProtectedRoute>} />
            <Route path="/metabolicon" element={<ProtectedRoute><MetabolicONPage /></ProtectedRoute>} />
            <Route path="/dr-nexus" element={<ProtectedRoute><DrNexusPage /></ProtectedRoute>} />
            <Route path="/videoform" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="VideoForm AI"><VideoFormPage /></PlanGateWrapper></ProtectedRoute>} />
            {/* COACH */}
            <Route path="/coach/plano-alimentar" element={<ProtectedRoute><PlanoAlimentarIA /></ProtectedRoute>} />
            <Route path="/coach" element={<CoachLandingPage />} />
            <Route path="/coach-onboarding" element={<ProtectedRoute><CoachOnboardingPage /></ProtectedRoute>} />
            <Route path="/coach-dashboard" element={<ProtectedRoute><CoachDashboardPage /></ProtectedRoute>} />
            <Route path="/coach/dashboard" element={<ProtectedRoute><CoachDashboardPage /></ProtectedRoute>} />
            <Route path="/coach/templates" element={<ProtectedRoute><CoachTemplatesPage /></ProtectedRoute>} />
            <Route path="/coach/patient/:id" element={<ProtectedRoute><CoachPatientDetailPage /></ProtectedRoute>} />
            <Route path="/coach/add-patient" element={<ProtectedRoute><CoachAddPatientPage /></ProtectedRoute>} />
            <Route path="/coach/settings" element={<ProtectedRoute><CoachSettingsPage /></ProtectedRoute>} />
            <Route path="/coach/adjustment-log" element={<ProtectedRoute><CoachAdjustmentLogPage /></ProtectedRoute>} />
            <Route path="/coach/competition/:planId" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Competition Mode"><CoachCompetitionPlanPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/athlete/competition/:planId/check-in" element={<ProtectedRoute><AthleteCompetitionCheckInPage /></ProtectedRoute>} />
            <Route path="/coach/hub" element={<ProtectedRoute><CoachHub /></ProtectedRoute>} />
            <Route path="/coach/apex-visual" element={<ProtectedRoute><CoachApexVisualPage /></ProtectedRoute>} />
            <Route path="/coach/trainingon" element={<ProtectedRoute><CoachTrainingOnPage /></ProtectedRoute>} />
            <Route path="/coach/lab-exams" element={<ProtectedRoute><CoachLabExamsPage /></ProtectedRoute>} />
            <Route path="/coach/relatorios" element={<ProtectedRoute><CoachReportsPage /></ProtectedRoute>} />
            <Route path="/coach/atletas" element={<ProtectedRoute><AthleteRoster /></ProtectedRoute>} />
            <Route path="/coach/atletas/:id" element={<ProtectedRoute><AthleteProgressTracker /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

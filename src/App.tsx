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
import CoachPatientDetailPage from "./pages/CoachPatientDetailPage";
import CoachAddPatientPage from "./pages/CoachAddPatientPage";
import CoachSettingsPage from "./pages/CoachSettingsPage";
import BodyCompositionPage from "./pages/BodyCompositionPage";
import RefeedProtocolPage from "./pages/RefeedProtocolPage";
import BehavioralTriggersPage from "./pages/BehavioralTriggersPage";
import DietBreakPredictorPage from "./pages/DietBreakPredictorPage";
import VulnerabilityMapPage from "./pages/VulnerabilityMapPage";
import MetabolicReversionPage from "./pages/MetabolicReversionPage";
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
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/first-meal" element={<ProtectedRoute><FirstMealScreen /></ProtectedRoute>} />
            <Route path="/activation-tour" element={<ProtectedRoute><ActivationTourPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/meal-log" element={<ProtectedRoute><MealLogPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path="/hydration" element={<ProtectedRoute><HydrationPage /></ProtectedRoute>} />

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

            {/* ON PRO Plan */}
            <Route path="/performance-pro" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Performance Pro"><PerformanceProPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/professional" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Dashboard Profissional"><ProfessionalDashboard /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

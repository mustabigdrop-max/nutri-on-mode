import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
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
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plan"
              element={
                <ProtectedRoute>
                  <MealPlanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-log"
              element={
                <ProtectedRoute>
                  <MealLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/micronutrients"
              element={
                <ProtectedRoute>
                  <MicronutrientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamification"
              element={
                <ProtectedRoute>
                  <GamificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transformation"
              element={
                <ProtectedRoute>
                  <TransformationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/professional"
              element={
                <ProtectedRoute>
                  <ProfessionalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopping-list"
              element={
                <ProtectedRoute>
                  <ShoppingListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wearables"
              element={
                <ProtectedRoute>
                  <WearablesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/family"
              element={
                <ProtectedRoute>
                  <FamilyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hydration"
              element={
                <ProtectedRoute>
                  <HydrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-history"
              element={
                <ProtectedRoute>
                  <MealHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-test"
              element={
                <ProtectedRoute>
                  <BloodTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diet-builder"
              element={
                <ProtectedRoute>
                  <DietBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

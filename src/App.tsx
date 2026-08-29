import { Suspense } from "react";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import { NutriPlanErrorBoundary, LoadingState as NutriPlanLoading } from "@/components/nutriplan/NutriPlanStates";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AthleteDashboardGate, CoachToolRoute, AthleteOnlyRoute } from "@/components/athlete/AthleteRouteGuard";
import PlanGateWrapper from "@/components/PlanGateWrapper";
const Index = lazy(() => import("./pages/Index"));
const ModulesPage = lazy(() => import("./pages/ModulesPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const OAuthConsentPage = lazy(() => import("./pages/OAuthConsentPage"));

const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const FirstMealScreen = lazy(() => import("./pages/FirstMealScreen"));
const ActivationTourPage = lazy(() => import("./pages/ActivationTourPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MealPlanPage = lazy(() => import("./pages/MealPlanPage"));
const MealLogPage = lazy(() => import("./pages/MealLogPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const MicronutrientsPage = lazy(() => import("./pages/MicronutrientsPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const TransformationPage = lazy(() => import("./pages/TransformationPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfessionalDashboard = lazy(() => import("./pages/ProfessionalDashboard"));
const ShoppingListPage = lazy(() => import("./pages/ShoppingListPage"));
const WearablesPage = lazy(() => import("./pages/WearablesPage"));
const FamilyPage = lazy(() => import("./pages/FamilyPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const HydrationPage = lazy(() => import("./pages/HydrationPage"));
const MealHistoryPage = lazy(() => import("./pages/MealHistoryPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const BloodTestPage = lazy(() => import("./pages/BloodTestPage"));
const DietBuilderPage = lazy(() => import("./pages/DietBuilderPage"));
const ChronobiologyPage = lazy(() => import("./pages/ChronobiologyPage"));
const BehavioralNutritionPage = lazy(() => import("./pages/BehavioralNutritionPage"));
const SupplementationPage = lazy(() => import("./pages/SupplementationPage"));
const MicrobiomePage = lazy(() => import("./pages/MicrobiomePage"));
const ProtocolEnginePage = lazy(() => import("./pages/ProtocolEnginePage"));

const RecipesPage = lazy(() => import("./pages/RecipesPage"));
const EventModePage = lazy(() => import("./pages/EventModePage"));
const FoodSimulatorPage = lazy(() => import("./pages/FoodSimulatorPage"));
const MonthlyReportPage = lazy(() => import("./pages/MonthlyReportPage"));
const Glp1Page = lazy(() => import("./pages/Glp1Page"));
const NutriSyncPage = lazy(() => import("./pages/NutriSyncPage"));
const WorkoutHistoryPage = lazy(() => import("./pages/WorkoutHistoryPage"));
const CircadianPage = lazy(() => import("./pages/CircadianPage"));
const PerformanceProPage = lazy(() => import("./pages/PerformanceProPage"));
const MentalPerformancePage = lazy(() => import("./pages/MentalPerformancePage"));
const CoachLandingPage = lazy(() => import("./pages/CoachLandingPage"));
const CoachOnboardingPage = lazy(() => import("./pages/CoachOnboardingPage"));
const CoachDashboardPage = lazy(() => import("./pages/CoachDashboardPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const CoachTemplatesPage = lazy(() => import("./pages/CoachTemplatesPage"));
const CoachPatientDetailPage = lazy(() => import("./pages/CoachPatientDetailPage"));
const CoachAddPatientPage = lazy(() => import("./pages/CoachAddPatientPage"));
const CoachSettingsPage = lazy(() => import("./pages/CoachSettingsPage"));
const CoachCompetitionPlanPage = lazy(() => import("./pages/CoachCompetitionPlanPage"));
const AthleteCompetitionCheckInPage = lazy(() => import("./pages/AthleteCompetitionCheckInPage"));
const CoachAdjustmentLogPage = lazy(() => import("./pages/CoachAdjustmentLogPage"));
const BodyCompositionPage = lazy(() => import("./pages/BodyCompositionPage"));
const RefeedProtocolPage = lazy(() => import("./pages/RefeedProtocolPage"));
const BehavioralTriggersPage = lazy(() => import("./pages/BehavioralTriggersPage"));
const DietBreakPredictorPage = lazy(() => import("./pages/DietBreakPredictorPage"));
const VulnerabilityMapPage = lazy(() => import("./pages/VulnerabilityMapPage"));
const MetabolicReversionPage = lazy(() => import("./pages/MetabolicReversionPage"));
const NutricaoSportPage = lazy(() => import("./pages/NutricaoSportPage"));
const ProtocoloFemininoPage = lazy(() => import("./pages/ProtocoloFemininoPage"));
const AssessmentPCA = lazy(() => import("./pages/AssessmentPCA"));
const ResultadoPCAPage = lazy(() => import("./pages/ResultadoPCA"));
const WeightAdaptivePage = lazy(() => import("./pages/WeightAdaptivePage"));
const CoachInvitePage = lazy(() => import("./pages/CoachInvitePage"));
const LabPage = lazy(() => import("./pages/LabPage"));
const AdminApexCoachPage = lazy(() => import("./pages/AdminApexCoachPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const ExerciseSelectorPage = lazy(() => import("./pages/ExerciseSelectorPage"));
const PeriodizationPage = lazy(() => import("./pages/PeriodizationPage"));
const IntensityTechniquesPage = lazy(() => import("./pages/IntensityTechniquesPage"));
const ExerciseArsenalPage = lazy(() => import("./pages/ExerciseArsenalPage"));
const RecoveryProtocolsPage = lazy(() => import("./pages/RecoveryProtocolsPage"));
const AgentsPage = lazy(() => import("./pages/AgentsPage"));
const BiologicalAgePage = lazy(() => import("./pages/BiologicalAgePage"));
const EmotionalScanPage = lazy(() => import("./pages/EmotionalScanPage"));
const RefeicaoSnapPage = lazy(() => import("./pages/RefeicaoSnapPage"));
const AdminPartnersPage = lazy(() => import("./pages/AdminPartnersPage"));
const PartnerDashboardPage = lazy(() => import("./pages/PartnerDashboardPage"));
const PartnerBlockedPage = lazy(() => import("./pages/PartnerBlockedPage"));
const PeptideVaultPage = lazy(() => import("./pages/PeptideVaultPage"));
const TrainingPage = lazy(() => import("./pages/TrainingPage"));
const RunOnPage = lazy(() => import("./pages/RunOnPage"));
const ChallengeLayout = lazy(() => import("./components/challenge/ChallengeLayout"));
const ChallengeSignupPage = lazy(() => import("./pages/challenge/ChallengeSignupPage"));
const ChallengePublicRankingPage = lazy(() => import("./pages/challenge/ChallengePublicRankingPage"));
const ChallengeDashboardPage = lazy(() => import("./pages/challenge/ChallengeDashboardPage"));
const ChallengePlanPage = lazy(() => import("./pages/challenge/ChallengePlanPage"));
const ChallengeRankingPage = lazy(() => import("./pages/challenge/ChallengeRankingPage"));
const ChallengeMCEPage = lazy(() => import("./pages/challenge/ChallengeMCEPage"));
const ChallengeEvolutionPage = lazy(() => import("./pages/challenge/ChallengeEvolutionPage"));
const ChallengeProfilePage = lazy(() => import("./pages/challenge/ChallengeProfilePage"));
const ChallengeUpgradePage = lazy(() => import("./pages/challenge/ChallengeUpgradePage"));
const ChallengeVipPage = lazy(() => import("./pages/challenge/ChallengeVipPage"));

const WallDisplayPage = lazy(() => import("./pages/wall/WallDisplayPage"));
const Desafio21Page = lazy(() => import("./pages/Desafio21Page"));
const DesafioSignupPage = lazy(() => import("./pages/DesafioSignupPage"));
const Desafio21DashboardPage = lazy(() => import("./pages/Desafio21DashboardPage"));
const AthleteTodayTrainingPage = lazy(() => import("./pages/AthleteTodayTrainingPage"));
const TrainingSystemsPage = lazy(() => import("./pages/TrainingSystemsPage"));
const ScienceHubPage = lazy(() => import("./pages/ScienceHubPage"));
const BiomechanicsVaultPage = lazy(() => import("./pages/BiomechanicsVaultPage"));
const MetabolicONPage = lazy(() => import("./pages/MetabolicONPage"));
const MCEPage = lazy(() => import("./pages/MCEPage"));
const MceForgePage = lazy(() => import("./pages/MceForgePage"));
const MceCoachDashboardPage = lazy(() => import("./pages/coach/MceCoachDashboardPage"));
const MCEBusinessPage = lazy(() => import("./pages/MCEBusinessPage"));
const GymPartnerDashboardPage = lazy(() => import("./pages/GymPartnerDashboardPage"));
const GymChallengesPage = lazy(() => import("./pages/GymChallengesPage"));
const BusinessChallengesPage = lazy(() => import("./pages/BusinessChallengesPage"));
const AudioAcademyPage = lazy(() => import("./pages/AudioAcademyPage"));
const PlanoAlimentarIA = lazy(() => import("./components/coach/PlanoAlimentarIA"));
const AthleteRoster = lazy(() => import("./components/coach/AthleteRoster"));
const AthleteProgressTracker = lazy(() => import("./components/coach/AthleteProgressTracker"));
const CoachHub = lazy(() => import("./pages/CoachHub"));
const CoachApexVisualPage = lazy(() => import("./pages/coach/CoachApexVisualPage"));
const ApexCheckinPage = lazy(() => import("./pages/coach/ApexCheckinPage"));
const ApexVisualIAPage = lazy(() => import("./pages/coach/ApexVisualIAPage"));
const CoachTrainingOnPage = lazy(() => import("./pages/coach/CoachTrainingOnPage"));
const CoachLabExamsPage = lazy(() => import("./pages/coach/CoachLabExamsPage"));
const ExamRequestPage = lazy(() => import("./pages/coach/ExamRequestPage"));
const CoachReportsPage = lazy(() => import("./pages/coach/CoachReportsPage"));
const CoachAnamnesisPage = lazy(() => import("./pages/coach/CoachAnamnesisPage"));
const PatientTeamHubPage = lazy(() => import("./pages/coach/PatientTeamHubPage"));
const MyTeamPage = lazy(() => import("./pages/athlete/MyTeamPage"));
const AnamnesisPublicPage = lazy(() => import("./pages/AnamnesisPublicPage"));
const MediaKitPublicPage = lazy(() => import("./pages/MediaKitPublicPage"));
const APEXPoseAnalysisPage = lazy(() => import("./pages/coach/APEXPoseAnalysisPage"));
const DrNexusPage = lazy(() => import("./pages/DrNexusPage"));
const VideoFormPage = lazy(() => import("./pages/VideoFormPage"));
const MeusProtocolosPage = lazy(() => import("./pages/MeusProtocolosPage"));
const ErgoVaultPage = lazy(() => import("./pages/ErgoVaultPage"));
const ErgoDiaryPage = lazy(() => import("./pages/ErgoDiaryPage"));
const WeeklyCheckinPage = lazy(() => import("./pages/WeeklyCheckinPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NutriPlanElitePage = lazy(() => import("./pages/NutriPlanElitePage"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const VeraPage = lazy(() => import("./pages/VeraPage"));
const SocialOnPage = lazy(() => import("./pages/coach/SocialOnPage"));
const SocialOnModulePage = lazy(() => import("./pages/coach/SocialOnModulePage"));
const MyPlanPage = lazy(() => import("./pages/athlete/MyPlanPage"));
const MyTrainingPage = lazy(() => import("./pages/athlete/MyTrainingPage"));
const AthleteCheckinPage = lazy(() => import("./pages/athlete/AthleteCheckinPage"));
const PraxisPage = lazy(() => import("./pages/PraxisPage"));
const ViewAsClient = lazy(() => import("./pages/coach/ViewAsClient"));
const PraxisLogsPage = lazy(() => import("./pages/coach/PraxisLogsPage"));
const CoachAudioAcademyPage = lazy(() => import("./pages/coach/CoachAudioAcademyPage"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-3" aria-busy="true">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <p className="text-sm text-muted-foreground">Carregando módulo…</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <RouteErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/modulos" element={<ModulesPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/desafio-21" element={<DesafioSignupPage />} />
            {/* Desafio 30 Dias */}
            <Route path="/wall/:slug" element={<WallDisplayPage />} />
            <Route path="/desafio/ranking/:slug" element={<ChallengePublicRankingPage />} />
            <Route path="/desafio" element={<ProtectedRoute><ChallengeLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ChallengeDashboardPage />} />
              <Route path="plano" element={<ChallengePlanPage />} />
              <Route path="ranking" element={<ChallengeRankingPage />} />
              <Route path="mce" element={<ChallengeMCEPage />} />
              <Route path="evolucao" element={<ChallengeEvolutionPage />} />
              <Route path="perfil" element={<ChallengeProfilePage />} />
              <Route path="planos" element={<ChallengeUpgradePage />} />
              <Route path="vip" element={<ChallengeVipPage />} />

            </Route>
            <Route path="/desafio/:slug" element={<ChallengeSignupPage />} />
            <Route path="/gym/challenges" element={<ProtectedRoute><GymChallengesPage /></ProtectedRoute>} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />

            <Route path="/assessment" element={<ProtectedRoute><AssessmentPCA /></ProtectedRoute>} />
            <Route path="/resultado-pca" element={<ProtectedRoute><ResultadoPCAPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/first-meal" element={<ProtectedRoute><FirstMealScreen /></ProtectedRoute>} />
            <Route path="/activation-tour" element={<ProtectedRoute><ActivationTourPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><AthleteDashboardGate><DashboardPage /></AthleteDashboardGate></ProtectedRoute>} />
            <Route path="/my-plan" element={<ProtectedRoute><AthleteOnlyRoute><NutriPlanErrorBoundary><Suspense fallback={<NutriPlanLoading />}><MyPlanPage /></Suspense></NutriPlanErrorBoundary></AthleteOnlyRoute></ProtectedRoute>} />
            <Route path="/my-training" element={<ProtectedRoute><AthleteOnlyRoute><MyTrainingPage /></AthleteOnlyRoute></ProtectedRoute>} />
            <Route path="/checkin" element={<ProtectedRoute><AthleteOnlyRoute><AthleteCheckinPage /></AthleteOnlyRoute></ProtectedRoute>} />
            <Route path="/praxis" element={<ProtectedRoute><PraxisPage /></ProtectedRoute>} />
            <Route path="/weekly-checkin" element={<ProtectedRoute><WeeklyCheckinPage /></ProtectedRoute>} />
            <Route path="/meal-log" element={<ProtectedRoute><MealLogPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/hydration" element={<ProtectedRoute><HydrationPage /></ProtectedRoute>} />
            <Route path="/meus-protocolos" element={<ProtectedRoute><MeusProtocolosPage /></ProtectedRoute>} />
            <Route path="/learn" element={<CoachToolRoute><ProtectedRoute><LearnPage /></ProtectedRoute></CoachToolRoute>} />

            {/* ON Plan */}
            <Route path="/meal-plan" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Plano Alimentar"><MealPlanPage /></PlanGateWrapper></ProtectedRoute>} />
            
            <Route path="/chat" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Chat"><ChatPage /></PlanGateWrapper></ProtectedRoute>} />
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
            <Route path="/agents" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON" featureName="Agentes"><AgentsPage /></PlanGateWrapper></ProtectedRoute>} />

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
            <Route path="/ergo-vault" element={<CoachToolRoute><ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="ERGO VAULT Feminino"><ErgoVaultPage /></PlanGateWrapper></ProtectedRoute></CoachToolRoute>} />
            <Route path="/ergo-diary" element={<CoachToolRoute><ProtectedRoute><PlanGateWrapper requiredPlan="ON +" featureName="Diários de Ergogênicos"><ErgoDiaryPage /></PlanGateWrapper></ProtectedRoute></CoachToolRoute>} />

            {/* ON PRO Plan */}
            <Route path="/performance-pro" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Performance Pro"><PerformanceProPage /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/professional" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Dashboard Profissional"><ProfessionalDashboard /></PlanGateWrapper></ProtectedRoute>} />
            <Route path="/weight-adaptive" element={<ProtectedRoute><WeightAdaptivePage /></ProtectedRoute>} />
            <Route path="/biological-age" element={<ProtectedRoute><BiologicalAgePage /></ProtectedRoute>} />
            <Route path="/lab" element={<CoachToolRoute><ProtectedRoute><LabPage /></ProtectedRoute></CoachToolRoute>} />
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
            <Route path="/training" element={<CoachToolRoute><ProtectedRoute><TrainingPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/runon" element={<CoachToolRoute><ProtectedRoute><RunOnPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/runon/desafio-21" element={<ProtectedRoute><Desafio21Page /></ProtectedRoute>} />
            <Route path="/runon/desafio-21/dashboard" element={<ProtectedRoute><Desafio21DashboardPage /></ProtectedRoute>} />

            <Route path="/treino-hoje" element={<ProtectedRoute><AthleteTodayTrainingPage /></ProtectedRoute>} />
            <Route path="/training/systems" element={<CoachToolRoute><ProtectedRoute><TrainingSystemsPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/science" element={<ProtectedRoute><ScienceHubPage /></ProtectedRoute>} />
            <Route path="/biomechanics" element={<ProtectedRoute><BiomechanicsVaultPage /></ProtectedRoute>} />
            <Route path="/metabolicon" element={<ProtectedRoute><MetabolicONPage /></ProtectedRoute>} />
            <Route path="/mce" element={<ProtectedRoute><MCEPage /></ProtectedRoute>} />
            <Route path="/mce/forge" element={<ProtectedRoute><MceForgePage /></ProtectedRoute>} />
            <Route path="/mce/coach" element={<CoachToolRoute><ProtectedRoute><MceCoachDashboardPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/mce/business" element={<ProtectedRoute><MCEBusinessPage /></ProtectedRoute>} />
            <Route path="/mce/academia" element={<ProtectedRoute><GymPartnerDashboardPage /></ProtectedRoute>} />
            <Route path="/mce/business/challenges" element={<ProtectedRoute><BusinessChallengesPage /></ProtectedRoute>} />
            <Route path="/audio" element={<ProtectedRoute><AudioAcademyPage /></ProtectedRoute>} />
            <Route path="/dr-nexus" element={<ProtectedRoute><DrNexusPage /></ProtectedRoute>} />
            <Route path="/videoform" element={<ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="VideoForm AI"><VideoFormPage /></PlanGateWrapper></ProtectedRoute>} />
            {/* COACH */}
            <Route path="/coach/plano-alimentar" element={<CoachToolRoute><ProtectedRoute><NutriPlanErrorBoundary><Suspense fallback={<NutriPlanLoading />}><PlanoAlimentarIA /></Suspense></NutriPlanErrorBoundary></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach" element={<CoachLandingPage />} />
            <Route path="/coach-onboarding" element={<ProtectedRoute><CoachOnboardingPage /></ProtectedRoute>} />
            <Route path="/coach-dashboard" element={<ProtectedRoute><CoachDashboardPage /></ProtectedRoute>} />
            <Route path="/coach/dashboard" element={<CoachToolRoute><ProtectedRoute><CoachDashboardPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/templates" element={<CoachToolRoute><ProtectedRoute><CoachTemplatesPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/patient/:id" element={<CoachToolRoute><ProtectedRoute><CoachPatientDetailPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/add-patient" element={<CoachToolRoute><ProtectedRoute><CoachAddPatientPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/settings" element={<CoachToolRoute><ProtectedRoute><CoachSettingsPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/adjustment-log" element={<CoachToolRoute><ProtectedRoute><CoachAdjustmentLogPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/competition/:planId" element={<CoachToolRoute><ProtectedRoute><PlanGateWrapper requiredPlan="ON PRO" featureName="Competition Mode"><CoachCompetitionPlanPage /></PlanGateWrapper></ProtectedRoute></CoachToolRoute>} />
            <Route path="/athlete/competition/:planId/check-in" element={<ProtectedRoute><AthleteCompetitionCheckInPage /></ProtectedRoute>} />
            <Route path="/coach/hub" element={<CoachToolRoute><ProtectedRoute><CoachHub /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/apex-visual" element={<CoachToolRoute><ProtectedRoute><CoachApexVisualPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/apex-checkin" element={<CoachToolRoute><ProtectedRoute><ApexCheckinPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/apex-visual-ia" element={<CoachToolRoute><ProtectedRoute><ApexVisualIAPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/trainingon" element={<CoachToolRoute><ProtectedRoute><CoachTrainingOnPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/lab-exams" element={<CoachToolRoute><ProtectedRoute><CoachLabExamsPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/exames" element={<CoachToolRoute><ProtectedRoute><ExamRequestPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/view-as/:athleteId" element={<CoachToolRoute><ProtectedRoute><ViewAsClient /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/praxis-logs/:athleteId" element={<CoachToolRoute><ProtectedRoute><PraxisLogsPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/audio" element={<CoachToolRoute><ProtectedRoute><CoachAudioAcademyPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/relatorios" element={<CoachToolRoute><ProtectedRoute><CoachReportsPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/anamneses" element={<CoachToolRoute><ProtectedRoute><CoachAnamnesisPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/anamnese/:token" element={<AnamnesisPublicPage />} />
            <Route path="/kit/:token" element={<MediaKitPublicPage />} />
            <Route path="/coach/equipe" element={<ProtectedRoute><PatientTeamHubPage /></ProtectedRoute>} />
            <Route path="/coach/equipe/:patientId" element={<ProtectedRoute><PatientTeamHubPage /></ProtectedRoute>} />
            <Route path="/minha-equipe" element={<ProtectedRoute><MyTeamPage /></ProtectedRoute>} />
            <Route path="/coach/atletas" element={<CoachToolRoute><ProtectedRoute><AthleteRoster /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/atletas/:id" element={<CoachToolRoute><ProtectedRoute><AthleteProgressTracker /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/apex-pose" element={<CoachToolRoute><ProtectedRoute><APEXPoseAnalysisPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/social" element={<CoachToolRoute><ProtectedRoute><SocialOnModulePage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/social-on" element={<CoachToolRoute><ProtectedRoute><SocialOnModulePage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/social-classic" element={<CoachToolRoute><ProtectedRoute><SocialOnPage /></ProtectedRoute></CoachToolRoute>} />
            <Route path="/coach/vera" element={<CoachToolRoute><ProtectedRoute><VeraPage /></ProtectedRoute></CoachToolRoute>} />

            <Route path="/nutriplan-elite" element={<CoachToolRoute><ProtectedRoute><NutriPlanErrorBoundary><Suspense fallback={<NutriPlanLoading />}><NutriPlanElitePage /></Suspense></NutriPlanErrorBoundary></ProtectedRoute></CoachToolRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

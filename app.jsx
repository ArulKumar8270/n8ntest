import {
    Suspense,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
  import {
    SignUpPage,
    SignInPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    DashboardPage,
    NotFoundPage,
    SinglePromptPage,
    MultiPromptPage,
    SplashScreenPage,
    HistoryPage,
    VerifyEmailPage,
    SEOToolPage,
    SEOToolTempletePage,
    ProfilePage,
    PricingPage,
    ChatPage,
    FramerPricingPage,
    SettingsPage,
    PaymentsPage,
    HomePage,
    LongBlogPage,
    CreditBasedPage,
    TestPage,
    OnBoardPage,
    LibraryPage,
  } from "pages";
  import { ErrorBoundary, GTMGlobalTracker, PageLoader } from "components/common";
  // import KnowledgebasePage from "pages/KnowledgebasePage";
  // import VoiceGeneratorPromptPage from "pages/VoiceGeneratorPromptPage";
  import { useAppDispatch, useAppSelector } from "hooks";
  import RewriteArticlePage from "pages/RewriteArticlePage";
  import ConnectWordPressAccount from "pages/ConnectWordPressAccount";
  import ServerMaintenancePage from "pages/ServerMaintenancePage";
  import BlogLibrary from "components/LongBlogPage/BlogLibrary/BlogLibrary";
  import WinFreeCreditsPage from "pages/WinFreeCreditsPage";
  import StorybookLibrary from "pages/StorybookLibrary";
  import StorybookDetails from "pages/StorybookDetails";
  import { usePostHog } from "posthog-js/react";
  import { UserReducerActions } from "store/user";
  import SSOAuth from "services/api/ssoauth.service";
  import ProtectedLogin from "components/auth/ProtectedLogin";
  import { ServerConfig } from "config";
  // import { DashboardLayout } from "layouts";
  // import TestPage from "pages/TestPage";
  /**
   * Top most component that wraps the entire application.
   */
  function App() {
    const appRoot = useRef<HTMLDivElement>(null);
    const [splashScreenOpen, setSplashScreenOpen] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
  
    const dispatch = useAppDispatch();
    const posthog = usePostHog();
  
    const currentUser = useAppSelector((rootState) => rootState.user);
  
    const url = useMemo(() => new URL(window.location.href), []);
    const code = url.searchParams.get("code");
  
    // set max height to fix 100vh problem on mobile browsers
    const setAppHeight = () => {
      const appRootElement = appRoot.current;
      if (appRootElement) appRootElement.style.height = `${window.innerHeight}px`;
    };
  
    const isAuthenticated = useAppSelector(
      (rootState) => rootState.user.isAuthenticated,
    );
  
  
    useEffect(() => {
      const user = currentUser?.currentUser;
      if (user) {
        posthog.identify(`${user?.id}`, {
          email: user?.email,
          name: user?.name,
          currentPlan: currentUser?.currentPlan?.title,
          plan: currentUser?.currentSubscription?.status,
          payment_frequency: currentUser?.currentSubscription?.payment_frequency,
        });
      }
    }, [
      currentUser?.currentPlan?.title,
      currentUser?.currentSubscription?.payment_frequency,
      currentUser?.currentSubscription?.status,
      currentUser?.currentUser,
      posthog,
    ]);
  
    useEffect(() => {
      async function handleAuthTokens() {
        if (code) {
          setLoading(true);
          try {
            const { data } = await SSOAuth.getAuthTokensHandler(code);
            if ("access_token" in data) {
              dispatch(UserReducerActions.setTokenState());
            } else {
              throw new Error("Missing access token in response");
            }
          } catch (error) {
            const link = sessionStorage.getItem("loginLink");
            window.location.replace(link);
          } finally {
            setLoading(false);
            sessionStorage.clear();
            // Removing params for cleaner URL
            url.search = "";
            window.history.replaceState(
              {},
              document.title,
              url.pathname + url.hash,
            );
          }
        } else {
          if (localStorage.getItem(ServerConfig.AUTH_TOKEN))
            dispatch(UserReducerActions.setTokenState());
        }
      }
      handleAuthTokens();
    }, [code, dispatch, url]);
  
    if (loading)
      return (
        <div className="min-h-screen">
          <PageLoader />
        </div>
      );
  
    return (
      <div ref={appRoot} id="app">
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              {splashScreenOpen ? (
                <SplashScreenPage onClose={() => setSplashScreenOpen(false)} />
              ) : (
                <Routes>
                  {/* Pages without auth */}
                  <Route
                    path="/"
                    element={
                      isAuthenticated ? <LibraryPage /> : <SEOToolTempletePage />
                    }
                  />
                  <Route path="/home" element={<HomePage />} />
                  <Route
                    path="/categories/:categorySlug"
                    element={<SEOToolTempletePage />}
                  />
                  <Route path="/tools/:slug" element={<SEOToolPage />} />
                  <Route path="/offer-pricing" element={<PricingPage />} />
                  <Route path="/pricing" element={<FramerPricingPage />} />
                  <Route path="/blog-writer" element={<LongBlogPage />} />
                  <Route path="/blog-library" element={<BlogLibrary />} />
                  <Route
                    path="/ai-text-humanizer"
                    element={<RewriteArticlePage />}
                  />
                  <Route
                    path="/rewrite-article"
                    element={<Navigate to="/ai-text-humanizer" replace />}
                  />
                  {/* Pages related to auth */}
                  <Route
                    path="/login"
                    element={
                      <ProtectedLogin>
                        <SignInPage />
                      </ProtectedLogin>
                    }
                  />
                  <Route path="/register" element={<SignUpPage />} />
                  {/* google callback with data in search params */}
                  <Route path="/auth/google/callback" element={<SignUpPage />} />
                  <Route
                    path="/connectWordPress"
                    element={<ConnectWordPressAccount />}
                  />
                  <Route
                    path="/forgotpassword"
                    element={<ForgotPasswordPage />}
                  />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  // <Route path="/" element={<LibraryPage />} />
                  {/* Pages that require auth */}
                  <Route path="/onboarding" element={<OnBoardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route
                    path="/dashboard/tools/:categorySlug"
                    element={<DashboardPage />}
                  />
                  <Route path="/image-generator" element={<DashboardPage />} />
                  <Route path="/content/new" element={<SinglePromptPage />} />
                  <Route
                    path="/kit/:multipromptId"
                    element={<MultiPromptPage />}
                  />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  
                  <Route path="/profile">
                    <Route path="" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                  </Route>
                  <Route path="/storybook-library">
                    <Route index element={<StorybookLibrary />} />
                    <Route path="details" element={<StorybookDetails />} />
                  </Route>
                  <Route path="/credit-based" element={<CreditBasedPage />} />
                  <Route
                    path="/server-maintenance"
                    element={<ServerMaintenancePage />}
                  />
                  <Route
                    path="/rewards"
                    element={
                      currentUser?.currentPlan?.id === 1 ? (
                        <WinFreeCreditsPage />
                      ) : (
                        <Navigate to={"/"} replace />
                      )
                    }
                  />
                  <Route path="/test" element={<TestPage />} />
                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              )}
            </Suspense>
  
            {/* Analytics components */}
            <GTMGlobalTracker />
          </BrowserRouter>
        </ErrorBoundary>
      </div>
    );
  }
  
  export default App;
  
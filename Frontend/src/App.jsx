import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { lazy, Suspense } from "react";
import ProtectedRoute from "./routes/ProtectedRoute";
import ClientProtectedRoute from "./routes/ClientProtectedRoute";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import OnlineTracker from "./utils/OnlineTracker";
import ScrollToTop from "./components/ScrollToTop";


// Lazy-load toast to keep it off the critical render path
const LazyToastContainer = lazy(() =>
  import("react-toastify").then((mod) => {
    // Dynamically import the CSS when the component loads
    import("react-toastify/dist/ReactToastify.css");
    return { default: mod.ToastContainer };
  })
);

// Lazy-loaded routes for performance code-splitting
const Home = lazy(() => import("./pages/Home"));
const HireFreelancer = lazy(() => import("./pages/HireFreelancer"));
const HireFreelancerLogin = lazy(() => import("./pages/hire-freelancer/Login"));
const HireFreelancerSignup = lazy(() => import("./pages/hire-freelancer/Signup"));
const FreelancerIntro = lazy(() => import("./pages/Freelancer"));
const FreelancerLogin = lazy(() => import("./pages/freelancer/Login"));
const FreelancerSignup = lazy(() => import("./pages/freelancer/Signup"));
const FreelancerDashboard = lazy(() => import("./pages/freelancer/Dashboard"));
const Profile = lazy(() => import("./pages/freelancer/Profile"));
const FreelancerPublicPage = lazy(() => import("./pages/freelancer/FreelancerProfile"));
const EditProfilePage = lazy(() => import("./pages/freelancer/EditProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ClientDashboard = lazy(() => import("./pages/hire-freelancer/Dashboard"));
const ClientProfile = lazy(() => import("./pages/hire-freelancer/Profile"));
const Projects = lazy(() => import("./pages/hire-freelancer/Projects"));
const PublicProject = lazy(() => import("./pages/Public/PublicProject"));
const ProjectDetail = lazy(() => import("./pages/Public/ProjectDetails"));
const PrepareContract = lazy(() => import("./pages/hire-freelancer/PrepareContract"));
const ContractDetails = lazy(() => import("./pages/hire-freelancer/ContractDetails"));
const FreelancerContracts = lazy(() => import("./pages/freelancer/Contracts"));
const MyProjects = lazy(() => import("./pages/freelancer/MyProjects"));
const NotificationPage = lazy(() => import("./pages/NotificationPage"));
const FindFreelancers = lazy(() => import("./pages/FindFreelancers"));
const SavedFreelancers = lazy(() => import("./pages/hire-freelancer/SavedFreelancers"));
const SavedProjects = lazy(() => import("./pages/freelancer/SavedProjects"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const Earnings = lazy(() => import("./pages/freelancer/Earnings"));

function PageLoader() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin") || location.pathname.startsWith("/cc/inter/admin");

  return (
    <>
      <OnlineTracker />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">

        {!isAdminPath && <Header />}
        <Suspense fallback={null}>
          <LazyToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </Suspense>
        <main id="main-content" className="flex-grow">
          <React.Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/hire-freelancer" element={<HireFreelancer />} />
              <Route
                path="/hire-freelancer/login"
                element={<HireFreelancerLogin />}
              />
              <Route
                path="/hire-freelancer/signup"
                element={<HireFreelancerSignup />}
              />
              <Route path="/freelancer" element={<FreelancerIntro />} />
              <Route path="/freelancer/login" element={<FreelancerLogin />} />
              <Route path="/freelancer/signup" element={<FreelancerSignup />} />
              <Route path="/projects" element={<PublicProject />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/find-freelancers" element={<FindFreelancers />} />

              <Route
                path="/freelancer/:username"
                element={<FreelancerPublicPage />}
              />

              <Route path="/cc/inter/admin/login" element={<AdminLogin />} />

              {/* ADMIN */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              {/* FREELANCER – Protected */}
              <Route
                path="/freelancer/:username/edit-profile"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:username/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:username/my-profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:username/dashboard"
                element={
                  <ProtectedRoute>
                    <FreelancerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:username/saved-projects"
                element={
                  <ProtectedRoute>
                    <SavedProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:username/my-projects"
                element={
                  <ProtectedRoute>
                    <MyProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:username/contracts"
                element={
                  <ProtectedRoute>
                    <FreelancerContracts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:username/earnings"
                element={
                  <ProtectedRoute>
                    <Earnings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/freelancer/:username/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />

              {/* CLIENT – Protected */}
              <Route
                path="/hire-freelancer/:username/dashboard"
                element={
                  <ClientProtectedRoute>
                    <ClientDashboard />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/notifications"
                element={
                  <ClientProtectedRoute>
                    <NotificationPage />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/profile"
                element={
                  <ClientProtectedRoute>
                    <ClientProfile />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/projects"
                element={
                  <ClientProtectedRoute>
                    <Projects />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/projects/:projectId/prepare-contract/:proposalId"
                element={
                  <ClientProtectedRoute>
                    <PrepareContract />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/contracts/:contractId"
                element={
                  <ClientProtectedRoute>
                    <ContractDetails />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/contracts/:contractId/payment"
                element={
                  <ClientProtectedRoute>
                    <PaymentPage />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/saved-freelancer"
                element={
                  <ClientProtectedRoute>
                    <SavedFreelancers />
                  </ClientProtectedRoute>
                }
              />
              <Route
                path="/hire-freelancer/:username/messages"
                element={
                  <ClientProtectedRoute>
                    <Messages />
                  </ClientProtectedRoute>
                }
              />
            </Routes>
          </React.Suspense>
        </main>
        {!isAdminPath && <Footer />}
      </div>
    </>
  );
}

export default App;

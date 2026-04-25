import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import ProtectedRoute from "./routes/ProtectedRoute";
import ClientProtectedRoute from "./routes/ClientProtectedRoute";

import Home from "./pages/Home";
import HireFreelancer from "./pages/HireFreelancer";
import HireFreelancerLogin from "./pages/hire-freelancer/Login";
import HireFreelancerSignup from "./pages/hire-freelancer/Signup";

import FreelancerIntro from "./pages/Freelancer";
import FreelancerLogin from "./pages/freelancer/Login";
import FreelancerSignup from "./pages/freelancer/Signup";
import FreelancerDashboard from "./pages/freelancer/Dashboard";

// import Profile from "./pages/freelancer/FreelancerProfile";
// import FreelancerPublicPage from "./pages/freelancer/Profile";

import Profile from "./pages/freelancer/Profile";
import FreelancerPublicPage from "./pages/freelancer/FreelancerProfile";

import EditProfilePage from "./pages/freelancer/EditProfilePage";

// import ProfileSection from "./components/profile/freelancer/ProfileSection";

import NotFound from "./pages/NotFound";

import ClientDashboard from "./pages/hire-freelancer/Dashboard";
import ClientProfile from "./pages/hire-freelancer/Profile";
import Projects from "./pages/hire-freelancer/Projects";

import PublicProject from "./pages/Public/PublicProject";
import ProjectDetail from "./pages/Public/ProjectDetails";

import PrepareContract from "./pages/hire-freelancer/PrepareContract";
import ContractDetails from "./pages/hire-freelancer/ContractDetails";

import FreelancerContracts from "./pages/freelancer/Contracts";
import MyProjects from "./pages/freelancer/MyProjects";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import OnlineTracker from "./utils/OnlineTracker";

import NotificationPage from "./pages/NotificationPage";

import FindFreelancers from "./pages/FindFreelancers";

import SavedFreelancers from "./pages/hire-freelancer/SavedFreelancers";
import SavedProjects from "./pages/freelancer/SavedProjects";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

// import ClientPaymentPage from "./pages/hire-freelancer/ClientPaymentPage";
import Messages from "./pages/Messages";
import PaymentPage from "./pages/PaymentPage";
import Earnings from "./pages/freelancer/Earnings";

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
      <div className="min-h-screen flex flex-col">
        {!isAdminPath && <Header />}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
        <main className="flex-grow">
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

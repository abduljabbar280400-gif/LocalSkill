import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import api from "../../../services/api";

// import CreateProfileForm from "./CreateProfileForm-D";
// import ProfileSection from "./ProfileSection-D";

export default function FreelancerProfile() {
  const { user, logout } = useAuth();
  const username2 = user?.username;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!username2) return;
    const res = await api.get(`/freelancer/${username2}/my-profile`);
    setProfile(res.data.profile ?? null);
  }, [username2]);

  const { username } = useParams();
  console.log(username);

  useEffect(() => {
    if (!username2) return;

    const load = async () => {
      try {
        await Promise.all([fetchProfile()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username2, fetchProfile]);

  // const handleProfileCreated = (createdProfile) => {
  //   setProfile(createdProfile);
  // };

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="dashboard-panel">
        <div className="loading-page">
          <div className="loading-spinner" />
          <p className="loading-text">Loading your profile...</p>
          <div
            className="loading-skeleton-row"
            style={{ width: "100%", maxWidth: 360 }}
          >
            <div className="loading-skeleton-strip" />
            <div className="loading-skeleton-strip" />
          </div>
        </div>
      </div>
    );
  }

  // No profile yet: show creation form in card
  // if (!profile) {
  //   return (
  //     <div className="dashboard-panel">
  //       <header className="page-header" style={{ marginBottom: "0.75rem" }}>
  //         <h1 className="page-title" style={{ fontSize: "1.5rem" }}>
  //           Create your freelancer profile
  //         </h1>
  //         <p className="page-subtitle">
  //           Add your basic details so clients can discover and evaluate you.
  //         </p>
  //       </header>

  //       <CreateProfileForm
  //         username={username2}
  //         onCreated={handleProfileCreated}
  //       />
  //     </div>
  //   );
  // }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action can be restored later but you will be logged out.",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/freelancer/${username2}`);

      alert("Account deleted successfully. You will be logged out.");

      await logout();
      window.location.href = "/freelancer/login";
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to delete account. Please try again.",
      );
    }
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-panel">
        <header className="page-header" style={{ marginBottom: "0.75rem" }}>
          <h1 className="page-title" style={{ fontSize: "1.8rem" }}>
            Edit profile
          </h1>
          <p className="page-subtitle">
            Keep your freelancer profile up to date so clients can quickly
            understand your skills, experience, and location.
          </p>
        </header>

        <ProfileSection
          username={username2}
          profile={profile}
          onUpdated={handleProfileUpdated}
        />
      </div>

      <aside className="dashboard-panel">
        <h2 className="dashboard-panel-title">Account</h2>
        <p className="dashboard-panel-muted">
          Use this section to manage your account status.
        </p>

        <h3 className="dashboard-panel-title" style={{ marginTop: "1rem" }}>
          Danger zone
        </h3>
        <p className="dashboard-panel-muted">
          Deleting your account will log you out and remove your freelancer
          profile from LocalSkill. Some data may be kept for audit and billing
          purposes.
        </p>

        <button
          type="button"
          className="btn btn-danger"
          style={{ marginTop: "0.8rem" }}
          onClick={handleDeleteAccount}
        >
          Delete account
        </button>
      </aside>
    </div>
  );
}

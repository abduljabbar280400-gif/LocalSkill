import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

export default function FreelancerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form);

      if (result.error) {
        // 🔹 Show deleted account or validation errors
        setError(result.error);
        return;
      }

      const username = result.userData.username;

      try {
        const res = await api.get(`/freelancer/${username}/my-profile`);

        if (!res.data.profile) {
          navigate(`/freelancer/${username}/my-profile`);
        } else {
          navigate(`/freelancer/${username}/dashboard`);
        }
      } catch {
        navigate(`/freelancer/${username}/my-profile`);
      }
    } catch (err) {
      // 🔹 unexpected errors only
      console.error("Unexpected login error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-main">
      <section className="page">
        <div className="container">
          <div className="auth-layout">
            <div className="auth-card">
              <h1 className="auth-title">Freelancer login</h1>
              <p className="auth-subtitle">
                Access your dashboard to track requests, jobs and your profile.
              </p>

              {error && <div className="form-error-banner">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      className="form-input"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      className="form-input"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>

              <p className="auth-switch">
                New to LocalSkill?{" "}
                <Link to="/freelancer/signup">Create a freelancer account</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

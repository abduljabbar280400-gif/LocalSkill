import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../../context/client/useClientAuth";

export default function ClientLogin() {
  const navigate = useNavigate();
  const { login } = useClientAuth();

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
      const user = await login(form);
      console.log("Logged user:", user);
      console.log("Navigating now...");
      navigate(`/hire-freelancer/${user.username}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
              <h1 className="auth-title">Client login</h1>
              <p className="auth-subtitle">
                Sign in to see your projects, history and connected freelancers.
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
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>

              <p className="auth-switch">
                First time here?{" "}
                <Link to="/hire-freelancer/signup">Create a client account</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

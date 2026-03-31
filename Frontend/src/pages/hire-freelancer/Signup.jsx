import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../../context/client/useClientAuth";
import api from "../../services/api";

export default function ClientSignup() {
  const navigate = useNavigate();
  const { register } = useClientAuth();

  const [form, setForm] = useState({
    title: "Mr",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    username: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState(null);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Username Check
  useEffect(() => {
    if (!form.username) {
      setUsernameStatus(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setCheckingUsername(true);

        const res = await api.get(
          `/hire-freelancer/check-username?username=${form.username}`,
        );

        setUsernameStatus(res.data.available);
      } catch {
        setUsernameStatus(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [form.username]);

  // Email Check
  useEffect(() => {
    if (!form.email) {
      setEmailStatus(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setCheckingEmail(true);

        const res = await api.get(
          `/hire-freelancer/check-email?email=${form.email}`,
        );

        setEmailStatus(res.data.available);
      } catch {
        setEmailStatus(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [form.email]);

  // Phone Check
  useEffect(() => {
    if (!form.phone) {
      setPhoneStatus(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setCheckingPhone(true);

        const res = await api.get(
          `/hire-freelancer/check-phone?phone=${form.phone}`,
        );

        setPhoneStatus(res.data.available);
      } catch {
        setPhoneStatus(null);
      } finally {
        setCheckingPhone(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [form.phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const registeredUser = await register(form);
      console.log("Registered user:", registeredUser);

      console.log("User before navigate:", registeredUser);
      console.log("Username:", registeredUser?.username);

      navigate(`/hire-freelancer/${registeredUser.username}/profile`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to register. Please try again.",
      );
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
              <h1 className="auth-title">Create your client account</h1>
              <p className="auth-subtitle">
                Keep your projects, freelancers and history organised in one place.
              </p>

              {error && <div className="form-error-banner">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-row-split">
                    <div className="form-field">
                      <label className="form-label" htmlFor="title">
                        Title
                      </label>
                      <select
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="dob">
                        Date of birth
                      </label>
                      <input
                        id="dob"
                        className="form-input"
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-split">
                    <div className="form-field">
                      <label className="form-label" htmlFor="first_name">
                        First name
                      </label>
                      <input
                        id="first_name"
                        className="form-input"
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="last_name">
                        Last name
                      </label>
                      <input
                        id="last_name"
                        className="form-input"
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

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
                    {checkingEmail && (
                      <p className="form-status form-status-neutral">
                        Checking email...
                      </p>
                    )}
                    {emailStatus === true && (
                      <p className="form-status form-status-ok">
                        Email available ✅
                      </p>
                    )}
                    {emailStatus === false && (
                      <p className="form-status form-status-error">
                        Email already used ❌
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      id="phone"
                      className="form-input"
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {checkingPhone && (
                      <p className="form-status form-status-neutral">
                        Checking phone...
                      </p>
                    )}
                    {phoneStatus === true && (
                      <p className="form-status form-status-ok">
                        Phone available ✅
                      </p>
                    )}
                    {phoneStatus === false && (
                      <p className="form-status form-status-error">
                        Phone already used ❌
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="username">
                      Username
                    </label>
                    <input
                      id="username"
                      className="form-input"
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                    {checkingUsername && (
                      <p className="form-status form-status-neutral">
                        Checking username...
                      </p>
                    )}
                    {usernameStatus === true && (
                      <p className="form-status form-status-ok">
                        Username available ✅
                      </p>
                    )}
                    {usernameStatus === false && (
                      <p className="form-status form-status-error">
                        Username already taken ❌
                      </p>
                    )}
                  </div>

                  <div className="form-row-split">
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
                      />
                    </div>

                    <div className="form-field">
                      <label
                        className="form-label"
                        htmlFor="password_confirmation"
                      >
                        Confirm password
                      </label>
                      <input
                        id="password_confirmation"
                        className="form-input"
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                      loading ||
                      usernameStatus === false ||
                      emailStatus === false ||
                      phoneStatus === false
                    }
                  >
                    {loading ? "Creating account..." : "Sign up"}
                  </button>
                </div>
              </form>

              <p className="auth-switch">
                Already a client?{" "}
                <Link to="/hire-freelancer/login">Log in to your account</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

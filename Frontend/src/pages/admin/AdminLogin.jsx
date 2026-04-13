import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiMail, FiLock } from "react-icons/fi";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", form);

      const { access_token, user } = res.data;

      // 🚫 Only admin allowed
      if (user.role !== "admin") {
        setError("Unauthorized: Admin access only");
        setLoading(false);
        return;
      }

      // ✅ Store admin token
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      // ✅ Redirect
      navigate("/admin/dashboard");
    } catch (err) {
      console.log(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Control Center</h2>
        <p style={styles.subtitle}>Secure access only</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <FiMail />
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <FiLock />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(15px)",
    padding: "40px",
    borderRadius: "16px",
    width: "350px",
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "5px",
    textAlign: "center",
  },
  subtitle: {
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#aaa",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.08)",
    padding: "10px",
    borderRadius: "8px",
  },
  input: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    width: "100%",
  },
  button: {
    background: "#22c55e",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "#f87171",
    fontSize: "14px",
    textAlign: "center",
  },
};

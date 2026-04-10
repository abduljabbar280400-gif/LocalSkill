import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAvailabilityCheck from "../../hooks/useAvailabilityCheck";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";

import {
  validateEmail,
  //   validatePhone,
  validateUsername,
  validatePassword,
  getPasswordStrength,
  validateDOB,
} from "../../utils/validation";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function Signup({ config }) {
  const navigate = useNavigate();
  const { register, type, routes } = config;

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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState({});

  const passwordRules = validatePassword(form.password);
  const passwordStrength = getPasswordStrength(passwordRules);

  // ✅ Validate before hitting API
  const isValidUsername = validateUsername(form.username) && !errors.username;

  const isValidEmail = validateEmail(form.email) && !errors.email;

  const isValidPhone = (phone) => {
    return phone ? isValidPhoneNumber(phone) : false;
  };

  // ✅ Username check (only if valid)
  const { status: usernameStatus } = useAvailabilityCheck(
    routes.username,
    "username",
    isValidUsername ? form.username : "",
  );

  // ✅ Email check (only if valid)
  const { status: emailStatus } = useAvailabilityCheck(
    routes.email,
    "email",
    isValidEmail ? form.email : "",
  );

  // ✅ Phone check (only if valid)
  const isValidPhoneNumberCheck = form.phone && isValidPhone(form.phone);

  const { status: phoneStatus } = useAvailabilityCheck(
    routes.phone,
    "phone",
    isValidPhoneNumberCheck ? form.phone : "",
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 🔥 Inline validation
    let newErrors = { ...errors };

    if (name === "password") {
      const rules = validatePassword(value);
      const isValid = Object.values(rules).every(Boolean);
      newErrors.password = isValid ? "" : "Password is weak";
    }

    if (name === "password_confirmation") {
      newErrors.password_confirmation =
        value !== form.password ? "Passwords do not match" : "";
    }

    setErrors(newErrors);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    let newErrors = { ...errors };

    if (name === "dob") {
      const error = validateDOB(value);
      newErrors.dob = error;
    }

    if (name === "email") {
      if (!validateEmail(value)) {
        newErrors.email = "Invalid email format";
      } else {
        newErrors.email = "";
      }
    }

    if (name === "phone") {
      if (!value) {
        newErrors.phone = "";
      } else {
        try {
          const phoneNumber = parsePhoneNumber(value);

          // ❌ incomplete or invalid
          if (!phoneNumber || !isValidPhoneNumber(value)) {
            newErrors.phone = "Invalid phone number";
          } else {
            newErrors.phone = "";
          }
        } catch {
          newErrors.phone = "Invalid phone number";
        }
      }
    }

    if (name === "username") {
      if (!validateUsername(value)) {
        newErrors.username = "3-20 chars, letters/numbers/_ only";
      } else {
        newErrors.username = "";
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(form);

      // ✅ Dynamic redirect
      navigate(routes.redirect(user.username));
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
              <h1 className="auth-title">Create your {type} account</h1>

              <p className="auth-subtitle">
                {type === "client"
                  ? "Keep your projects and freelancers organised."
                  : "Tell us a few details to set up your profile."}
              </p>

              {error && <div className="form-error-banner">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Title + DOB */}
                  <div className="form-row-split">
                    <div className="form-field">
                      <label className="form-label">Title</label>
                      <select
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    {errors.dob && (
                      <p className="form-status-error">{errors.dob}</p>
                    )}
                    <div className="form-field">
                      <label className="form-label">Date of birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        max={new Date().toISOString().split("T")[0]}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Names */}
                  <div className="form-row-split">
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="first_name"
                        placeholder="First name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="form-input !pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Last name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="form-input !pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  {touched.email && errors.email && (
                    <p className="form-status-error">{errors.email}</p>
                  )}
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-input !pl-10"
                      required
                    />
                  </div>

                  {emailStatus === false && (
                    <p className="form-status-error">Email already used ❌</p>
                  )}

                  {/* Phone */}
                  {errors.phone && (
                    <p className="form-status-error">{errors.phone}</p>
                  )}
                  <div className="form-field relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={form.phone}
                      onChange={(value) => {
                        setForm((prev) => ({
                          ...prev,
                          phone: value || "",
                        }));
                      }}
                      onBlur={() =>
                        handleBlur({
                          target: { name: "phone", value: form.phone },
                        })
                      }
                      className="form-input-phone !pl-10"
                    />
                  </div>

                  {phoneStatus === false && (
                    <p className="form-status-error"> Phone already used ❌</p>
                  )}

                  {/* Username */}
                  <div className="form-field relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={form.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-input !pl-10"
                      required
                    />
                  </div>

                  {usernameStatus === false && (
                    <p className="form-status-error">
                      Username already taken ❌
                    </p>
                  )}

                  {/* Password */}
                  <div className="form-row-split">
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="form-input !pl-10"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        placeholder="Confirm"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        className="form-input !pl-10"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {form.password && (
                  <div className="mt-2 text-sm">
                    <p>
                      Password strength:
                      <span
                        className={
                          passwordStrength === "Strong"
                            ? "text-green-600"
                            : passwordStrength === "Medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {" "}
                        {passwordStrength}
                      </span>
                    </p>

                    <ul className="text-xs mt-1 space-y-1">
                      <li
                        className={
                          passwordRules.length
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        • At least 8 characters
                      </li>
                      <li
                        className={
                          passwordRules.uppercase
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        • Uppercase letter
                      </li>
                      <li
                        className={
                          passwordRules.lowercase
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        • Lowercase letter
                      </li>
                      <li
                        className={
                          passwordRules.number
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        • Number
                      </li>
                      <li
                        className={
                          passwordRules.special
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        • Special character
                      </li>
                    </ul>
                  </div>
                )}

                <button
                  className="btn btn-primary mt-4 w-full"
                  type="submit"
                  disabled={
                    loading ||
                    Object.values(errors).some((e) => e) ||
                    usernameStatus === false ||
                    emailStatus === false ||
                    phoneStatus === false
                  }
                >
                  {loading ? "Creating..." : "Sign up"}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account?{" "}
                <Link to={routes.login}>Log in as {type}</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone); // Indian format
};

export const validateUsername = (username) => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

export const validatePassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
};

export const getPasswordStrength = (rules) => {
  const passed = Object.values(rules).filter(Boolean).length;

  if (passed <= 2) return "Weak";
  if (passed <= 4) return "Medium";
  return "Strong";
};

export const validateDOB = (dob) => {
  if (!dob) return "Date of birth is required";

  const today = new Date();
  const birthDate = new Date(dob);

  // ❌ Future date
  if (birthDate > today) {
    return "Date of birth cannot be in the future";
  }

  // ✅ Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  // ❌ Under 18
  if (age < 18) {
    return "You must be at least 18 years old";
  }

  // ❌ Too old (optional)
  if (age > 100) {
    return "Please enter a valid date of birth";
  }

  return ""; // ✅ valid
};
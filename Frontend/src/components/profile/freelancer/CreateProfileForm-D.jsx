import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function CreateProfileForm({ username, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    professional_title: "",
    primary_category_id: "",
    experience_level: "beginner",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]));
  }, []);

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
      const res = await api.post(`/freelancer/${username}/my-profile`, form);
      onCreated(res.data.profile);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 bg-gray-100 rounded-2xl">
      {/* Glass Card */}
      <div className="w-full max-w-xl backdrop-blur-xl bg-white/40 border border-white/40 shadow-2xl rounded-2xl p-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Create Freelancer Profile
        </h2>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100/80 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professional Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title
            </label>

            <input
              type="text"
              name="professional_title"
              value={form.professional_title}
              onChange={handleChange}
              required
              placeholder="e.g. Full Stack Developer"
              className="w-full px-4 py-3 rounded-lg bg-white/70 border border-gray-300
              focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
              outline-none transition duration-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Category
            </label>

            <div className="relative">
              <select
                name="primary_category_id"
                value={form.primary_category_id}
                onChange={handleChange}
                required
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl
      bg-white/60 backdrop-blur-md
      border border-gray-300
      text-gray-700
      shadow-sm
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select category</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>

            <div className="relative">
              <select
                name="experience_level"
                value={form.experience_level}
                onChange={handleChange}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl
      bg-white/60 backdrop-blur-md
      border border-gray-300
      text-gray-700
      shadow-sm
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="student">Student</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium
            bg-gradient-to-r from-indigo-500 to-purple-600
            hover:from-indigo-600 hover:to-purple-700
            transition duration-200 shadow-lg
            disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

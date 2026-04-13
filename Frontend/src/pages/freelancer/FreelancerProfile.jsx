import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import LocationPicker from "../../components/profile/freelancer/LocationPicker";

import { FaStar, FaUser, FaCheckCircle } from "react-icons/fa";

export default function FreelancerProfile() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [category, setCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner = user && user.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;

        if (isOwner) {
          response = await api.get(`/freelancer/${username}/my-profile`);
        } else {
          response = await api.get(`/freelancer/${username}/profile`);
        }

        const profileData = response.data.profile;

        setProfile(profileData);

        if (response.data.category) {
          setCategory(response.data.category);
        }

        if (response.data.skills) {
          setSkills(response.data.skills);
        }

        if (response.data.reviews) {
          setReviews(response.data.reviews);
        }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 404) {
            navigate("/not-found");
          } else if (err.response.status === 403) {
            setError("This profile is private.");
          } else {
            setError("Something went wrong.");
          }
        } else {
          setError("Server not reachable.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 text-lg">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px] text-red-500 text-lg">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 text-lg">
        No profile found
      </div>
    );
  }

  function getRelativeTime(dateString) {
    const now = new Date();
    const past = new Date(dateString);

    const diffInSeconds = Math.floor((now - past) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);
    const weeks = Math.floor(diffInSeconds / 604800);

    if (diffInSeconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* COVER */}
      {/* COVER BANNER */}
      <div className="relative h-52 rounded-2xl overflow-hidden mb-[-70px]">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

        {/* subtle overlay */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* HEADER */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl px-6 py-6 flex items-center gap-6 rounded-2xl shadow-lg">
        {/* AVATAR */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-lg">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-400 text-3xl overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser />
              )}
            </div>
          </div>

          {/* ONLINE STATUS */}
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow" />
        </div>

        {/* INFO */}
        <div className="flex-1">
          {/* TITLE */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {profile.professional_title}
            </h1>

            {profile?.profile_approved && (
              <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                <FaCheckCircle className="text-blue-500" /> Verified
              </span>
            )}
          </div>

          {/* USERNAME */}
          <p className="text-gray-400 text-sm mt-1">@{username}</p>

          {/* RATING */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-yellow-400">
              <FaStar />
              <span className="text-gray-900 font-semibold">
                {profile.average_rating || "0.0"}
              </span>
            </div>

            <span className="text-gray-400 text-sm">
              ({profile.total_reviews || 0} reviews)
            </span>
          </div>

          {/* ACTION */}
          {isOwner && (
            <button
              onClick={() => navigate(`/freelancer/${username}/edit-profile`)}
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:opacity-90 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="grid lg:grid-cols-3 gap-10 mt-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* ABOUT */}
          <section className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </section>

          {/* SKILLS */}
          <section className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Skills</h2>

            {skills.length === 0 ? (
              <p className="text-gray-400">No skills</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-4 py-1.5 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full font-medium hover:scale-105 transition"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* DETAILS */}
          <section className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ["Category", category ? category.name : "N/A"],
                ["Experience", capitalize(profile.experience_level)],
                ["Work Type", capitalize(profile.preferred_work_type)],
                ["Availability", capitalize(profile.availability_status)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl p-3 flex justify-between items-center"
                >
                  <span className="text-gray-400">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* LOCATION */}
          <section className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Location
            </h2>

            <p className="text-gray-600 mb-4">
              📍 {profile.city}, {profile.postcode}
            </p>

            {profile.latitude && profile.longitude && (
              <div className="rounded-2xl overflow-hidden shadow-sm">
                <LocationPicker
                  postcode={profile.postcode}
                  latitude={profile.latitude}
                  longitude={profile.longitude}
                  readonly={true}
                  interactiveOnClick={false}
                  onLocationSelect={() => {}}
                />
              </div>
            )}
          </section>

          {/* REVIEWS */}
          <section className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Reviews
            </h2>

            {/* Breakdown */}
            <div className="mb-6 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const percent =
                  reviews.length === 0 ? 0 : (count / reviews.length) * 100;

                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-8 text-sm text-gray-600">{star}★</span>

                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span className="text-xs text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-gray-400">No reviews yet</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow transition"
                  >
                    <div className="flex justify-between mb-2">
                      <p className="font-medium text-gray-800">
                        {review.client_name}
                      </p>
                      <span className="text-xs text-gray-400">
                        {getRelativeTime(review.created_at)}
                      </span>
                    </div>

                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          className={
                            s <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.review_comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          <div className="sticky top-24 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-md space-y-5">
            {/* PRICE */}
            <div className="text-center">
              <p className="text-sm text-gray-500">Hourly Rate</p>
              <h2 className="text-4xl font-extrabold text-gray-900">
                {profile.hourly_rate || 0}
              </h2>
              <p className="text-gray-400 text-sm">{profile.currency}/hr</p>
            </div>

            {/* BUTTONS */}
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl shadow hover:opacity-90 transition">
                Hire Me
              </button>

              <button className="w-full bg-gray-100 py-2.5 rounded-xl hover:bg-gray-200 transition">
                Contact
              </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="font-bold text-gray-800">
                  {profile.average_rating}
                </p>
                <p className="text-gray-400 text-xs">Rating</p>
              </div>

              <div>
                <p className="font-bold text-gray-800">
                  {profile.total_reviews}
                </p>
                <p className="text-gray-400 text-xs">Reviews</p>
              </div>

              <div>
                <p className="font-bold text-gray-800">
                  {profile.completed_jobs}
                </p>
                <p className="text-gray-400 text-xs">Jobs</p>
              </div>
            </div>

            {/* STATUS */}
            <div className="text-center">
              <p className="text-green-600 font-medium text-sm">● Online</p>
              <p className="text-gray-400 text-xs">Last seen recently</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

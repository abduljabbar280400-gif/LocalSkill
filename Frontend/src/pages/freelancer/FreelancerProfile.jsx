import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import LocationPicker from "../../components/profile/freelancer/LocationPicker";

import {
  FaStar,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaMoneyBillWave,
  FaUser,
  FaTools,
  FaLayerGroup,
  FaRegCommentDots,
} from "react-icons/fa";

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
    <div className="p-6 max-w-6xl mx-auto">
      {/* COVER BANNER */}
      <div className="h-40 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-[-60px]" />
      {/* HEADER */}

      <div className="relative z-10 bg-white border border-gray-200 rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center gap-6">
          {/* Avatar */}

          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[3px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-400 text-3xl">
                <FaUser />
              </div>
            </div>

            {/* Availability Badge */}

            <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          {/* Profile Info */}

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              {profile.professional_title}
            </h1>

            <p className="text-gray-500">@{username}</p>

            {profile.completed_jobs === 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                New Freelancer
              </span>
            )}

            <p className="text-gray-600 mt-3 max-w-2xl">{profile.bio}</p>

            {/* Rating */}

            <div className="flex items-center gap-2 mt-4 text-yellow-500">
              <FaStar />
              <span className="font-semibold text-gray-900 text-lg">
                {profile.average_rating}
              </span>
              <span className="text-gray-500 text-sm">
                ({profile.total_reviews} reviews)
              </span>
            </div>

            {isOwner && (
              <div>
                <button
                  onClick={() =>
                    navigate(`/freelancer/${username}/edit-profile`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white mt-4 px-4 py-2 rounded-lg transition"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Highlighted Hourly Rate */}

          <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-100 border border-indigo-100 rounded-2xl p-5 min-w-[160px] shadow-sm hover:shadow-md transition text-center">
            {/* Label */}
            <div className="flex items-center justify-center gap-2 text-indigo-500 text-sm font-medium tracking-wide">
              <FaMoneyBillWave className="text-lg" />
              Hourly Rate
            </div>

            {/* Price */}
            <p className="text-3xl font-extrabold text-gray-900 mt-2">
              {profile.hourly_rate || "0"}
            </p>

            {/* Currency */}
            <p className="text-sm text-gray-500 mt-1">
              {profile.currency} <span className="text-gray-400">/ hour</span>
            </p>
          </div>
        </div>
      </div>

      {/* GRID SECTIONS */}

      <div className="grid md:grid-cols-2 gap-6">
        {/* CATEGORY */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaLayerGroup className="text-indigo-500" />
            Category
          </h2>

          <p className="text-gray-700">{category ? category.name : "N/A"}</p>
        </div>

        {/* EXPERIENCE */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaBriefcase className="text-indigo-500" />
            Experience
          </h2>

          <p className="text-gray-700">
            {capitalize(profile.experience_level)}
          </p>
        </div>

        {/* SKILLS */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-5 md:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaTools className="text-indigo-500" />
            Skills
          </h2>

          {skills.length === 0 ? (
            <p className="text-gray-500">No skills added</p>
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
        </div>

        {/* WORK DETAILS */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaBriefcase className="text-indigo-500" />
            Work Details
          </h2>

          <div className="space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              {capitalize(profile.preferred_work_type)}
            </p>

            <p className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              {capitalize(profile.availability_status)}
            </p>

            <p className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              Max {profile.max_hours_per_week} hrs/week
            </p>
          </div>
        </div>

        {/* LOCATION */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaMapMarkerAlt className="text-indigo-500" />
            Location
          </h2>

          <div className="space-y-3 text-gray-700">
            {/* Text Location */}
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-400" />
              {profile.city}, {profile.postcode}
            </p>

            {/* READ-ONLY MAP */}
            {profile.latitude && profile.longitude && (
              <div className="rounded-xl overflow-hidden">
                <LocationPicker
                  postcode={profile.postcode}
                  latitude={profile.latitude}
                  longitude={profile.longitude}
                  readonly={true} // ✅ IMPORTANT
                  interactiveOnClick={false} // ✅ DISABLE CLICK MODE
                  onLocationSelect={() => {}} // ✅ NO-OP (required prop)
                />
              </div>
            )}
          </div>
        </div>

        {/* STATS */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-6 md:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Statistics</h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              Overview
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rating */}
            <div className="group bg-gradient-to-br from-yellow-50 to-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Rating</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {profile.average_rating || "0.0"}
              </p>
            </div>

            {/* Reviews */}
            <div className="group bg-gradient-to-br from-indigo-50 to-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Reviews</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {profile.total_reviews || 0}
              </p>
            </div>

            {/* Completed Jobs */}
            <div className="group bg-gradient-to-br from-green-50 to-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {profile.completed_jobs || 0}
              </p>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition p-5 md:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
            Client Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet</p>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-2xl p-5 bg-gray-50 hover:bg-white hover:shadow transition"
                >
                  {/* Header */}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}

                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {review.client_name.charAt(0)}
                      </div>

                      {/* Client Name */}

                      <div className="font-semibold text-gray-800">
                        {review.client_name}
                      </div>
                    </div>

                    {/* Date */}

                    <span className="text-xs text-gray-400">
                      {getRelativeTime(review.created_at)} •
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Stars */}

                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  {/* Comment */}

                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.review_comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* COVER */}
      <div className="h-44 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-[-60px]" />

      {/* HEADER */}
      <div className="relative z-10 bg-white px-6 py-6 flex items-center gap-6 border-b">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-400 text-2xl">
              <FaUser />
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {profile.professional_title}
          </h1>
          <p className="text-gray-500 text-sm">@{username}</p>

          <div className="flex items-center gap-2 mt-2 text-yellow-500">
            <FaStar />
            <span className="text-gray-900 font-medium">
              {profile.average_rating}
            </span>
            <span className="text-gray-400 text-sm">
              ({profile.total_reviews})
            </span>
          </div>
          {isOwner && (
            <div>
              {" "}
              <button
                onClick={() => navigate(`/freelancer/${username}/edit-profile`)}
                className="bg-blue-600 hover:bg-blue-700 text-white mt-4 px-4 py-2 rounded-lg transition"
              >
                {" "}
                Edit Profile{" "}
              </button>{" "}
            </div>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="grid lg:grid-cols-3 gap-10 mt-8">
        {/* LEFT */}
        <div className="lg:col-span-2">
          {/* ABOUT */}
          <section className="pb-6 border-b">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </section>

          {/* SKILLS */}
          <section className="py-6 border-b">
            <h2 className="text-lg font-semibold mb-3">Skills</h2>

            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-gray-400">No skills</p>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                  >
                    {skill.name}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* DETAILS */}
          <section className="py-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Details</h2>

            <div className="grid sm:grid-cols-2 gap-4 text-gray-700 text-sm">
              <p>
                <span className="text-gray-400">Category:</span>{" "}
                {category ? category.name : "N/A"}
              </p>

              <p>
                <span className="text-gray-400">Experience:</span>{" "}
                {capitalize(profile.experience_level)}
              </p>

              <p>
                <span className="text-gray-400">Work Type:</span>{" "}
                {capitalize(profile.preferred_work_type)}
              </p>

              <p>
                <span className="text-gray-400">Availability:</span>{" "}
                {capitalize(profile.availability_status)}
              </p>
            </div>
          </section>

          {/* LOCATION */}
          <section className="py-6 border-b">
            <h2 className="text-lg font-semibold mb-3">Location</h2>

            <p className="text-gray-600 mb-3">
              {profile.city}, {profile.postcode}
            </p>

            {profile.latitude && profile.longitude && (
              <div className="rounded-xl overflow-hidden border">
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
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-6">Reviews</h2>

            {/* Breakdown */}
            <div className="mb-6">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const percent =
                  reviews.length === 0 ? 0 : (count / reviews.length) * 100;

                return (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="w-8 text-sm text-gray-600">{star}★</span>

                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-yellow-400 rounded"
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
                  <div key={review.id}>
                    <div className="flex justify-between mb-1">
                      <p className="font-medium text-gray-800">
                        {review.client_name}
                      </p>
                      <span className="text-xs text-gray-400">
                        {getRelativeTime(review.created_at)}
                      </span>
                    </div>

                    <div className="flex gap-1 mb-1">
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

                    <p className="text-gray-600 text-sm">
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
          <div className="sticky top-24 border rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Hourly Rate</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {profile.hourly_rate || 0}
            </h2>
            <p className="text-gray-500 text-sm mb-4">{profile.currency}/hr</p>

            {/* BUTTONS */}
            <div className="space-y-2 mb-4">
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Hire Me
              </button>

              <button className="w-full border py-2 rounded-lg hover:bg-gray-50 transition">
                Contact
              </button>
            </div>

            {/* STATS */}
            <div className="text-sm text-gray-600 space-y-1 border-t pt-3">
              <p>⭐ {profile.average_rating}</p>
              <p>{profile.total_reviews} Reviews</p>
              <p>{profile.completed_jobs} Completed</p>
            </div>

            {/* STATUS */}
            <div className="mt-4 text-sm">
              <p className="text-green-600 font-medium">● Online</p>
              <p className="text-gray-400 text-xs">Last seen recently</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

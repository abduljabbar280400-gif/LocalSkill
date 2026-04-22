import { Link } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaCheckCircle,
} from "react-icons/fa";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

import useSavedFreelancers from "../../../hooks/useSavedFreelancers";

export default function FreelancerCard({
  freelancer,
  isSavedPage = false,
  onRemove,
}) {
  const initials = `${freelancer.first_name?.[0] || ""}${
    freelancer.last_name?.[0] || ""
  }`;

  const renderStars = (rating = 0) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= Math.round(rating) ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-300" />
        ),
      );
    }

    return stars;
  };
  const profileId = freelancer.profile_id || freelancer.id;

  const { savedIds, toggleSave, loading } = useSavedFreelancers();

  const isSaved = isSavedPage || savedIds.includes(profileId);

  const token =
    localStorage.getItem("client_token") ||
    localStorage.getItem("freelancer_token");
  const isLoggedIn = !!token;

  const sortedSkills = [...(freelancer.skills || [])].sort(
    (a, b) => b.is_primary - a.is_primary,
  );

  return (
    <div className="relative  group rounded-2xl p-[1px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 hover:from-blue-300 hover:via-purple-300 hover:to-pink-300 transition-all duration-500">
      <Link to={`/freelancer/${freelancer.username}`}>
        <div className="relative h-full w-full rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 shadow-lg p-6 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
          {isLoggedIn && !loading && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!profileId) return;

                await toggleSave(profileId);

                // 🔥 remove instantly if in saved page
                if (isSavedPage && onRemove) {
                  onRemove(profileId);
                }
              }}
              className="absolute top-3 right-3 text-xl z-10"
            >
              {isSaved ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-400 hover:text-red-400" />
              )}
            </button>
          )}
          {/* Header */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
              {initials}
            </div>

            {/* Name + Title */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                {freelancer.first_name} {freelancer.last_name}
                {freelancer.profile_approved && (
                  <span
                    title="Verified Freelancer"
                    className="flex items-center"
                  >
                    <FaCheckCircle className="text-blue-500 text-base relative top-[1px]" />
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {freelancer.professional_title}
              </p>
            </div>
          </div>

          {/* Rating + Availability */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-sm">
              {renderStars(freelancer.average_rating)}
              <span className="text-gray-600 dark:text-slate-400 ml-1">
                ({freelancer.total_reviews})
              </span>
            </div>

            <span
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                freelancer.availability_status === "available"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
              }`}
            >
              <FiCheckCircle size={12} />
              {freelancer.availability_status}
            </span>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-3 line-clamp-2">
            {freelancer.bio}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {sortedSkills?.slice(0, 4).map((skill, index) => {
              const isPrimary = Number(skill.is_primary) === 1;

              return (
                <span
                  key={index}
                  className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                    isPrimary
                      ? "bg-yellow-100 text-yellow-600 font-medium"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                  }`}
                >
                  {isPrimary && <FaStar />}
                  {skill.name}
                </span>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4">
            <p className="font-semibold">
              {freelancer.currency} {freelancer.hourly_rate}/hr
            </p>

            <span className="flex items-center gap-1 text-blue-500 text-sm font-medium">
              View Profile <FiArrowRight />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

import { Link } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function FreelancerCard({ freelancer }) {
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

  return (
    <Link to={`/freelancer/${freelancer.username}`}>
      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ">
        {/* Header */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
            {initials}
          </div>

          {/* Name + Title */}
          <div>
            <h3 className="font-semibold text-lg">
              {freelancer.first_name} {freelancer.last_name}
            </h3>
            <p className="text-sm text-gray-500">
              {freelancer.professional_title}
            </p>
          </div>
        </div>

        {/* Rating + Availability */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-sm">
            {renderStars(freelancer.average_rating)}
            <span className="text-gray-600 ml-1">
              ({freelancer.total_reviews})
            </span>
          </div>

          <span
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              freelancer.availability_status === "available"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <FiCheckCircle size={12} />
            {freelancer.availability_status}
          </span>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {freelancer.bio}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {freelancer.skills?.slice(0, 4).map((skill, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
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
  );
}

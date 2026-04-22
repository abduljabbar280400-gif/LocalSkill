import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import {
  FaUser,
  FaClock,
  FaBullseye,
  FaMoneyBillWave,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

const ProjectCard = React.memo(
  ({ project, isLast, lastProjectRef, isSaved, toggleSave }) => {
    const saved = isSaved(project.id);

    const handleSaveClick = (e) => {
      e.preventDefault(); // ❗ stop navigation
      e.stopPropagation(); // ❗ stop bubbling
      toggleSave(project.id);
    };

    return (
      <Link
        ref={isLast ? lastProjectRef : null}
        to={`/projects/${project.slug}`}
        className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 hover:from-blue-300 hover:via-purple-300 hover:to-pink-300 transition-all duration-500"
      >
        <div className="relative h-full w-full rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 shadow-lg p-6 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
          {/* ❤️ SAVE BUTTON (Top Right) */}
          <button
            onClick={handleSaveClick}
            className="absolute top-4 right-4 text-xl hover:scale-110 transition"
          >
            {saved ? <FaHeart className=" text-red-500 " /> : <FaRegHeart />}
          </button>

          {/* Category */}
          <span className="inline-block text-xs font-semibold px-3 py-1 mb-4 rounded-full bg-blue-100 text-blue-600">
            {project.category?.name}
          </span>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4 leading-snug">
            {project.title}
          </h3>

          {/* Client + Time */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-400" />
              <span>
                {project.user.first_name} {project.user.last_name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              <span>{dayjs(project.created_at).fromNow()}</span>
            </div>
          </div>

          {/* Experience + Budget */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <FaBullseye className="text-gray-400" />
              <span>{project.experience_level}</span>
            </div>

            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <FaMoneyBillWave />
              <span>
                ₹{project.budget_min} - ₹{project.budget_max}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  },
);

export default ProjectCard;

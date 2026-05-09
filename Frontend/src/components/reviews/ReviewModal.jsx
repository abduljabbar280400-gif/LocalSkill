import { useState } from "react";
import { FaStar } from "react-icons/fa";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function ReviewModal({
  isOpen,
  onClose,
  contractId,
  username,
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submitReview = async () => {
    try {
      setLoading(true);

      await api.post(
        `/hire-freelancer/${username}/contracts/${contractId}/review`,
        {
          rating,
          review_comment: comment,
        },
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-[450px] p-6">
        <h2 className="text-xl font-semibold mb-4">Rate Freelancer</h2>

        {/* Stars */}
        <div className="flex gap-2 mb-4">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;

            return (
              <FaStar
                key={index}
                size={30}
                className="cursor-pointer transition"
                color={(hover || rating) >= starValue ? "#ffc107" : "#e4e5e9"}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </div>

        {/* Comment */}
        <textarea
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Write your review..."
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            onClick={submitReview}
            disabled={loading || rating === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

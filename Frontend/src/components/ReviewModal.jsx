import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

export default function ReviewModal({ contract, onClose, username }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post(
        `/hire-freelancer/${username}/contracts/${contract}/review`,
        {
          contract_id: contract.id,
          rating: rating,
          comment: comment,
        },
      );

      toast.success("Review submitted successfully");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Rate the Freelancer</h2>

        {/* Stars */}
        <div className="flex gap-2 text-2xl mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={`cursor-pointer ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          className="w-full border rounded p-2 mb-4"
          rows="3"
          placeholder="Leave a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>

          <button
            onClick={submitReview}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

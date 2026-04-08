import FreelancerCard from "./FreelancerCard";

export default function FreelancerList({ freelancers, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  if (!freelancers.length) {
    return (
      <p className="text-center text-gray-500 mt-10">No freelancers found 😔</p>
    );
  }

  return (
    <div className="grid gap-4">
      {freelancers.map((f) => (
        <FreelancerCard key={f.id} freelancer={f} />
      ))}
    </div>
  );
}

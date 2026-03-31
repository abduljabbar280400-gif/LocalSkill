import { useEffect, useState } from "react";
import api from "../../src/services/api";
import SummaryCard from "./../components/payments/SummaryCard";
import PaymentForm from "./../components/payments/PaymentForm";
import PaymentHistory from "./../components/payments/PaymentHistory";
import ReleaseSection from "./../components/payments/ReleaseSection";

export default function PaymentPage({ type, username, id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // API ROUTES CONFIG
  // ===============================
  const getEndpoints = () => {
    switch (type) {
      case "contract":
        return {
          history: `/hire-freelancer/${username}/contracts/${id}/payments`,
          pay: `/hire-freelancer/${username}/contracts/${id}/payments`,
          release: `/hire-freelancer/${username}/contracts/${id}/release-payment`,
        };

      case "subscription":
        return {
          history: `/hire-freelancer/${username}/subscription/${id}/payments`,
          pay: `/hire-freelancer/${username}/subscription/${id}/payments`,
        };

      case "freelancer":
        return {
          history: `/freelancer/${username}/earnings`,
        };

      default:
        return {};
    }
  };

  const endpoints = getEndpoints();

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(endpoints.history);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, type]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!data) return <p className="p-6">No data</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* SUMMARY */}
      <SummaryCard type={type} data={data} />

      {/* PAYMENT FORM (only for client) */}
      {type !== "freelancer" && (
        <PaymentForm endpoint={endpoints.pay} onSuccess={fetchData} />
      )}

      {/* HISTORY */}
      <PaymentHistory payments={data.payments || data.recent_payments || []} />

      {/* RELEASE */}
      {type === "contract" && (
        <ReleaseSection
          contractStatus={data.contract_status}
          endpoint={endpoints.release}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

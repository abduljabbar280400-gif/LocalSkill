import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useClientAuth } from "../../context/client/useClientAuth";

export default function Dashboard() {
  const { username } = useParams();
  const { logout } = useClientAuth();

  const [data, setData] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(true);

  const [ongoingContracts, setOngoingContracts] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [extraLoading, setExtraLoading] = useState(true);

  const [selectedContract, setSelectedContract] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/hire-freelancer/${username}/dashboard`)
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        console.log("Dashboard fetch error:", error);
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username, logout]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.get(`/hire-freelancer/${username}/contracts`);
        setContracts(res.data.contracts || []);
      } catch (err) {
        console.log("Contracts fetch error:", err);
      } finally {
        setContractsLoading(false);
      }
    };

    fetchContracts();
  }, [username]);

  useEffect(() => {
    fetchExtraData().finally(() => setExtraLoading(false));
  }, [username]);

  const fetchExtraData = async () => {
    try {
      const res = await api.get(`/hire-freelancer/${username}/dashboard-extra`);

      setOngoingContracts(res.data.ongoing || []);
      setPendingPayments(res.data.pending_payments || []);
    } catch (err) {
      console.log("Extra dashboard error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "terminated":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300";
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount) return;

    try {
      setPaymentLoading(true);

      await api.post(
        `/hire-freelancer/${username}/contracts/${selectedContract.id}/payments`,
        {
          amount: paymentAmount,
        },
      );

      alert("Payment added successfully");

      setShowPaymentModal(false);
      setPaymentAmount("");

      // 🔥 Refresh dashboard
      await fetchExtraData();
    } catch (err) {
      console.log(err);
      alert("Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleReleasePayment = async (contractId) => {
    try {
      await api.post(
        `/hire-freelancer/${username}/contracts/${contractId}/release-payment`,
      );

      alert("Payment released successfully");

      await fetchExtraData();
    } catch (err) {
      console.log(err);
      alert("Release failed");
    }
  };

  if (loading) {
    return (
      <main className="app-main">
        <section className="page">
          <div className="container">
            <div className="dashboard-panel">
              <div className="loading-page">
                <div className="loading-spinner" />
                <p className="loading-text"> Loading... </p>
                <div
                  className="loading-skeleton-row"
                  style={{ width: "100%", maxWidth: 360 }}
                >
                  <div className="loading-skeleton-strip" />
                  <div className="loading-skeleton-strip" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-main">
      <section className="page">
        <div className="container">
          <header className="page-header">
            <h1 className="page-title">Client dashboard</h1>
            <p className="page-subtitle">
              Manage your profile and projects from here. You'll see more
              insights as you start working with freelancers.
            </p>
          </header>

          {/* Top Panels */}
          <div className="dashboard-shell">
            <div className="dashboard-panel">
              <h2 className="dashboard-panel-title">Account overview</h2>

              <p
                className="dashboard-panel-muted"
                style={{ marginBottom: "0.8rem" }}
              >
                {data?.message}
              </p>

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "max-content 1fr",
                  rowGap: "0.4rem",
                  columnGap: "1.5rem",
                  fontSize: "0.95rem",
                }}
              >
                <dt style={{ color: "#6b7280" }}>Username</dt>
                <dd>{data?.user?.username}</dd>

                <dt style={{ color: "#6b7280" }}>Email</dt>
                <dd>{data?.user?.email}</dd>

                <dt style={{ color: "#6b7280" }}>Role</dt>
                <dd>{data?.user?.role}</dd>
              </dl>
            </div>

            <aside className="dashboard-panel">
              <h2 className="dashboard-panel-title">Quick actions</h2>

              <p className="dashboard-panel-muted">
                As you add projects and connect with freelancers, we can surface
                shortcuts and stats here.
              </p>

              <button
                className="btn btn-outline"
                style={{ marginTop: "1rem" }}
                onClick={logout}
              >
                Logout
              </button>
            </aside>
          </div>

          {/* Ongoing Projects */}
          <section style={{ marginTop: "3rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2 className="dashboard-panel-title">Ongoing Projects</h2>
              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                {ongoingContracts.length} active
              </span>
            </div>

            {extraLoading ? (
              <div className="dashboard-panel">
                <p className="dashboard-panel-muted"> Loading... </p>
              </div>
            ) : ongoingContracts.length === 0 ? (
              <div className="dashboard-panel">
                <p className="dashboard-panel-muted">No active projects yet.</p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: "1.5rem",
                }}
              >
                {ongoingContracts.map((contract) => (
                  <div
                    key={contract.id}
                    style={{
                      padding: "1.4rem",
                    }}
                    className="border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm"
                  >
                    <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                      {contract.project?.title}
                    </h3>

                    <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                      Freelancer: {contract.freelancer?.first_name}
                    </p>

                    <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      Deadline:{" "}
                      <strong>
                        {new Date(contract.end_date).toLocaleDateString()}
                      </strong>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "1rem",
                      }}
                    >
                      <button className="btn btn-outline">View</button>

                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          (window.location.href = `/messages/${contract.id}`)
                        }
                      >
                        💬 Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Payments */}
          <section style={{ marginTop: "3rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2 className="dashboard-panel-title">Pending Payments</h2>
              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                {pendingPayments.length} due
              </span>
            </div>

            {extraLoading ? (
              <div className="dashboard-panel">
                <p className="dashboard-panel-muted"> Loading... </p>
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="dashboard-panel">
                <p className="dashboard-panel-muted">No pending payments 🎉</p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: "1.5rem",
                }}
              >
                {pendingPayments.map((contract) => (
                  <div
                    key={contract.id}
                    style={{
                      padding: "1.4rem",
                    }}
                    className="border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm"
                  >
                    <h3 style={{ fontWeight: 600 }}>
                      {contract.project?.title}
                    </h3>

                    <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                      Freelancer: {contract.freelancer?.first_name}
                    </p>

                    <p style={{ marginTop: "0.5rem" }}>
                      Paid: ₹{contract.total_paid} / ₹{contract.agreed_amount}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "1rem",
                      }}
                    >
                      {contract.payment_status !== "paid" ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedContract(contract);
                            setShowPaymentModal(true);
                          }}
                        >
                          💰 Add Payment
                        </button>
                      ) : (
                        <button
                          className="btn btn-success"
                          onClick={() => handleReleasePayment(contract.id)}
                        >
                          🔓 Release Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Contracts Section */}
          <section style={{ marginTop: "3rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2 className="dashboard-panel-title">Contracts</h2>

              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                {contracts.length} total
              </span>
            </div>

            {contractsLoading ? (
              <div className="dashboard-panel">
                <p className="dashboard-panel-muted"> Loading... </p>
              </div>
            ) : contracts.length === 0 ? (
              <div className="dashboard-panel">
                <p className="dashboard-panel-muted">
                  No contracts yet. Once you hire freelancers they will appear
                  here.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: "1.5rem",
                }}
              >
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    style={{
                      padding: "1.4rem",
                      transition: "0.2s",
                    }}
                    className="border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.8rem",
                      }}
                    >
                      <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                        {contract.project?.title}
                      </h3>

                      <span
                        className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                          contract.status,
                        )}`}
                      >
                        {contract.status}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        marginBottom: "0.8rem",
                      }}
                    >
                      Freelancer: {contract.freelancer?.first_name}
                    </p>

                    <div
                      style={{
                        fontSize: "0.9rem",
                        display: "grid",
                        gap: "0.3rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        Amount: <strong>₹{contract.agreed_amount}</strong>
                      </div>

                      <div>
                        Start:{" "}
                        {new Date(contract.start_date).toLocaleDateString()}
                      </div>

                      <div>
                        End: {new Date(contract.end_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-outline">View</button>

                      {contract.status === "pending" && (
                        <button className="btn btn-primary">Activate</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
      {/* ✅ Payment Modal */}
      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              padding: "2rem",
              width: "100%",
              maxWidth: "400px",
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700"
          >
            <h3 style={{ marginBottom: "1rem" }}>Add Payment</h3>

            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Project: {selectedContract?.project?.title}
            </p>

            <input
              type="number"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full mt-4 p-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            />

            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleAddPayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

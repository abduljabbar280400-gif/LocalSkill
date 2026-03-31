import { useParams } from "react-router-dom";
import PaymentPage from "./../PaymentPage";

export default function ClientPaymentPage() {
  const { username, contractId } = useParams();

  return <PaymentPage type="contract" username={username} id={contractId} />;
}

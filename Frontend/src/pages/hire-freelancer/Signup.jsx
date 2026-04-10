import Signup from "../auth/Signup";
import { useClientAuth } from "../../context/client/useClientAuth";

export default function ClientSignup() {
  const { register } = useClientAuth();

  return (
    <Signup
      config={{
        type: "client",
        register,
        routes: {
          username: "/hire-freelancer/check-username",
          email: "/hire-freelancer/check-email",
          phone: "/hire-freelancer/check-phone",
          login: "/hire-freelancer/login",
          redirect: (username) => `/hire-freelancer/${username}/profile`,
        },
      }}
    />
  );
}

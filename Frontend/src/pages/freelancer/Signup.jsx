import Signup from "../auth/Signup";
import { useAuth } from "../../context/useAuth";

export default function FreelancerSignup() {
  const { register } = useAuth();

  return (
    <Signup
      config={{
        type: "freelancer",
        register,
        routes: {
          username: "/freelancer/check-username",
          email: "/freelancer/check-email",
          phone: "/freelancer/check-phone",
          login: "/freelancer/login",
          redirect: (username) => `/freelancer/${username}/dashboard`,
        },
      }}
    />
  );
}

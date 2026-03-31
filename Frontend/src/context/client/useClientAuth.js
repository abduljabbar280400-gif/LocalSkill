import { useContext } from "react";
import ClientAuthContext from "./clientAuthContext";

export function useClientAuth() {
  return useContext(ClientAuthContext);
}

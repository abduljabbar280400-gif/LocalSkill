import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./utils/leafletIconFix";
import ClientAuthProvider from "./context/client/ClientAuthProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ClientAuthProvider>
        <App />
      </ClientAuthProvider>
    </AuthProvider>
  </BrowserRouter>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ClientAuthProvider from "./context/client/ClientAuthProvider";
import ThemeProvider from "./context/ThemeProvider";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./utils/leafletIconFix";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ClientAuthProvider>
          <App />
        </ClientAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
);

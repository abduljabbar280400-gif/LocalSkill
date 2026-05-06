import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ClientAuthProvider from "./context/client/ClientAuthProvider";
import ThemeProvider from "./context/ThemeProvider";
import App from "./App";
import { NotificationProvider } from "./context/NotificationContext";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ClientAuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ClientAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
);

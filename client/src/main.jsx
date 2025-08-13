import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CustomToast from "./components/CustomToast";
import BackToTop from "./components/BacktoTop";
import { BrowserRouter } from "react-router-dom";
import ContextProvider from "./provider/ContextProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider defaultTheme="dark" storageKey="SportsBuddy-theme">
          <ContextProvider>
            <App />
            <BackToTop />
            <CustomToast />
          </ContextProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CustomToast from "./components/CustomToast";
import BackToTop from "./components/BacktoTop";
import { BrowserRouter } from "react-router-dom";
import ContextProvider from "./provider/ContextProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <QueryClientProvider client={queryClient}>
            <ContextProvider>
              <TooltipProvider>
              <App />
              <BackToTop />
              <CustomToast />
              </TooltipProvider>
            </ContextProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </BrowserRouter>
  </StrictMode>
);

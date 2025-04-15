import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CustomToast from "./components/CustomToast";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}>
      <ThemeProvider defaultTheme="dark" storageKey="sports-buddy-theme">
        <AuthProvider>
          <SocketProvider>
            <EventProvider>
              <App />
              <CustomToast />
            </EventProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

import { AuthProvider } from "@/context/AuthContext";
import { EventProvider } from "@/context/EventContext";
import { SocketProvider } from "@/context/SocketContext";
import { CommunityProvider } from "@/context/CommunityContext";
import { VenueProvider } from "@/context/VenueContext";
import { AthletesProvider } from "@/context/AthletesContext";
import { LeaderboardProvider } from "@/context/LeaderboardContext";

const ContextProvider = ({children}) => {
  return (
     <AuthProvider>
          <SocketProvider>
            <EventProvider>
              <CommunityProvider>
                <VenueProvider>
                  <AthletesProvider>
                    <LeaderboardProvider>
                        {children}
                    </LeaderboardProvider>
                  </AthletesProvider>
                </VenueProvider>
              </CommunityProvider>
            </EventProvider>
          </SocketProvider>
        </AuthProvider>
  )
}

export default ContextProvider

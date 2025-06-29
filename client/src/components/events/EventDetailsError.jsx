import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { AlertTriangle, ChevronLeft } from "lucide-react"
import { Link } from "react-router-dom"

const EventDetailsError = ({ error }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <Card className="max-w-md mx-4 bg-card-light dark:bg-card-dark border-destructive-light dark:border-destructive-dark">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              Event Not Found
            </h3>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
              {error}
            </p>
            <Button asChild className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90">
              <Link to="/events">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}

export default EventDetailsError

import { Outlet } from "react-router-dom"
import Footer from "../Footer"
import Header from "../Header"

const Layout = () => {

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative">
      {/* Global Background Pattern */}
      <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10 pointer-events-none" />
      
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Layout

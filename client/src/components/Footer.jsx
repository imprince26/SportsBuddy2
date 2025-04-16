import React from 'react'
import { Link } from 'react-router-dom'


const Footer = () => {
  return (
    <footer className="bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark py-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-primary-light dark:text-primary-dark"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <span className="text-lg font-bold text-foreground-light dark:text-foreground-dark">SportsBuddy</span>
          </Link>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
            Connect with sports enthusiasts and join exciting events in your area.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark uppercase tracking-wider mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark uppercase tracking-wider mb-4">
            Sports
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/events?category=Football"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                Football
              </Link>
            </li>
            <li>
              <Link
                to="/events?category=Basketball"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                Basketball
              </Link>
            </li>
            <li>
              <Link
                to="/events?category=Tennis"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                Tennis
              </Link>
            </li>
            <li>
              <Link
                to="/events?category=Running"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                Running
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark uppercase tracking-wider mb-4">
            Contact
          </h3>
          <ul className="space-y-2">
            <li className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
              Email: support@sportsbuddy.com
            </li>
            <li className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
              Phone: +1 (123) 456-7890
            </li>
            <li className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-border-light dark:border-border-dark flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
          &copy; {new Date().getFullYear()} SportsBuddy. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link
            to="#"
            className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
          >
            Privacy Policy
          </Link>
          <Link
            to="#"
            className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
          >
            Terms of Service
          </Link>
          <Link
            to="#"
            className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </div>
  </footer>
  )
}

export default Footer

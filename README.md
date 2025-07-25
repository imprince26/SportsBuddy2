# 🏆 SportsBuddy

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)](https://mongodb.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com/)
[![Responsive Design](https://img.shields.io/badge/Responsive-Yes-blueviolet?logo=css3)](#)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---


**SportsBuddy** is a modern web platform that connects sports enthusiasts, enabling users to discover, join, and organize local sports events and teams. With real-time chat, achievements, and a vibrant community, SportsBuddy makes it easy to find your next game or training partner!

## 🌟 Demo

**[Live Demo](https://sports-buddy2.vercel.app)**
 <!-- | **[Video Walkthrough](https://youtu.be/sportsbuddy-demo)** -->

<!-- <div align="center">
  <img src="./docs/dashboard-preview.png" alt="SportsBuddy Dashboard" width="80%" />
</div> -->

---

## 🚀 Features

### Core Features
- **Find Local Events:**  
  Discover sports events happening near you, filtered by your favorite activities and skill level.

- **Create & Host Events:**  
  Organize your own sports events, manage participants, and build your community.

- **Join Teams:**  
  Connect with other players, join existing teams, or create your own for regular meetups.

- **Real-time Chat:**  
  Communicate instantly with event participants through integrated messaging.

### User Experience
<!-- - **Track Achievements:**  
  Record your sports accomplishments and share them with the community. -->

- **Personalized Profiles:**  
  Showcase your sports preferences, skill levels, achievements, and social links.

- **Admin Dashboard:**  
  Manage users, events, analytics, and platform activities with a dedicated admin panel.

- **Notifications:**  
  Stay updated with event invites, team messages, and platform announcements.

### Advanced Features
- **Advanced Search:**  
  Find users, events, and teams using powerful filters and search options.

- **Mobile Friendly:**  
  Fully responsive design for seamless experience on any device.

- **Secure Authentication:**  
  Robust user authentication and authorization.

- **Cloud Media Uploads:**  
  Upload and manage avatars and event images securely.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** [React.js](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (accessible primitives)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **State Management:** React Context + Custom Hooks

### **Backend**
- **Runtime:** [Node.js](https://nodejs.org/)
- **API Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Real-time Communications:** [Socket.io](https://socket.io/)
- **Media Management:** [Cloudinary](https://cloudinary.com/)
- **Authentication:** [JWT](https://jwt.io/) with secure HTTP-only cookies
- **Validation:** [Zod](https://zod.dev/)

### **DevOps & Deployment**
- **Frontend Hosting:** [Vercel](https://vercel.com/)
- **Backend Hosting:** [Render](https://render.com/)
- **Code Quality:** [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
- **Version Control:** Git & GitHub

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imprince26/SportsBuddy2
   cd sportsbuddy
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In the client directory
   cp .env.example .env
   
   # In the server directory
   cp .env.example .env
   ```
   Fill both .env files with your configuration details

4. **Start development servers**
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # In another terminal, start frontend
   cd client
   npm run dev
   ```

5. **Open your browser**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

## 📊 Project Structure

```
sportsbuddy/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       └── utils/          # Helper functions
│
└── server/                 # Backend Node.js application
    ├── config/             # Configuration files
    ├── controllers/        # Route controllers
    ├── middleware/         # Custom middleware
    ├── models/             # Mongoose data models
    ├── routes/             # API routes
    └── utils/              # Utility functions
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔮 Future Roadmap

- Sports equipment marketplace
- Advanced matchmaking algorithm
- Tournament management system
- Fitness tracking integration
- Team performance analytics

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author
  
[Prince Patel](https://github.com/imprince26)

---

> **Note:** SportsBuddy is under active development. If you encounter any issues, please open an issue on GitHub. Your feedback is invaluable!
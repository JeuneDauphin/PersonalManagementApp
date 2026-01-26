# Personal Management App

A comprehensive, standalone personal management application built with React, TypeScript, and Tailwind CSS. Perfect for managing tasks, projects, contacts, calendar events, and school-related activities.

**🌐 [Live Demo](https://jeunedauphin.github.io/PersonalManagementApp)** *(or run locally)*

## ✨ Features

- **📋 Task Management** - Create, organize, and track tasks with priorities and due dates
- **📁 Project Management** - Manage projects with progress tracking and task associations
- **👥 Contact Management** - Store and organize personal and professional contacts
- **📅 Calendar** - Full calendar with events, meetings, and reminders
- **🎓 School Management** - Track lessons, tests, and study materials
- **🔔 Notifications** - Stay on top of deadlines and updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/JeuneDauphin/PersonalManagementApp.git
cd PersonalManagementApp

# Switch to standalone branch
git checkout standalone

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Tech Stack

- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **FullCalendar** - Rich calendar component
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

## 💾 Data Storage

This app uses **localStorage** for data persistence. All your data is stored locally in your browser:
- No backend server required
- No configuration needed
- Data persists between sessions
- Demo data is automatically seeded on first run
- Easy to reset or clear data

## 🏗️ Project Structure

```
src/
├── App.tsx              # Main app with routing
├── main.tsx             # App bootstrap
├── Calendar/            # Calendar page
├── Contact/             # Contacts page
├── Dashboard/           # Dashboard page
├── Projects/            # Projects pages
├── School/              # School management pages
├── Tasks/               # Tasks page
├── Components/          # Reusable UI components
│   ├── Layout/          # Layout components
│   └── UI/              # UI components
├── styles/              # Global styles
└── utils/               # Utilities
    ├── api/             # Local storage API service
    ├── hooks/           # Custom React hooks
    ├── interfaces/      # TypeScript interfaces
    └── types/           # TypeScript types
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

## 📅 Calendar Features

- **Month/Week/Day views** - Switch between different calendar views
- **Multi-day events** - Events spanning multiple days are properly displayed
- **Event markers** - Visual indicators for events on each day
- **All-day events** - Support for events without specific times

### Multi-day Event Behavior

- In month view, events that start on one day and end on a later day are shown on their start day and end day only (not on the in-between days), labeled as "(Start)" and "(End)".
- In week/day time grid, multi-day timed events have two markers: a small "Starts HH:mm" marker on the start day and a small "Ends HH:mm" marker on the end day.
- All-day multi-day events appear in the all-day lane on both the start and end days.

## 🔄 Reset Demo Data

To reset the app to its initial demo state, you can clear localStorage:

```javascript
// In browser console
localStorage.clear();
location.reload();
```

Or use the API service method:
```javascript
import { apiService } from './utils/api/Api';
apiService.resetToDemo();
```

## 🚀 Deployment

Build the app for production:

```bash
npm run build
```

The output will be in the `dist/` folder, ready to deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## 📄 License

MIT License - feel free to use this project as a showcase or starting point for your own applications.

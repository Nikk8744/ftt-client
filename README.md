# 🕒 Freelance Time Tracker (FTT)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A modern, responsive time tracking application built for freelancers and small teams to manage projects, tasks, and time efficiently.

</div>

## ✨ Features

- **📊 Dashboard** - Get an overview of your projects, tasks, and time logs
- **📁 Project Management** - Create, edit, and manage projects
- **✅ Task Management** - Create tasks, set status, assign to team members
- **⏱️ Time Tracking** - Track time spent on tasks with start/stop functionality
- **📝 Task Checklists** - Break down tasks into manageable checklist items
- **👥 Team Collaboration** - Add team members to projects, assign tasks
- **📈 Time Logs** - View and filter time entries by project, date, and more
- **👤 User Profiles** - Manage your profile information
- **🔔 Notifications** - Stay informed about project and task updates

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) (v15.3.2) with App Router
- **UI Library**: [React](https://reactjs.org/) (v19.0.0)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with customized theme
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for global state
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **UI Components**: Custom components with [Shadcdn/ui](https://ui.shadcn.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Charts**: [Chart.js](https://www.chartjs.org/) with [react-chartjs-2](https://react-chartjs-2.js.org/)

## 📋 Prerequisites

- Node.js 18.17.0 or later
- Backend API running (requires separate setup)

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ftt-frontend.git
   cd ftt-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Deployment

When deploying to different environments, you'll need to configure the backend API URL:

1. **For Vercel or similar platforms**:
   - Set the `NEXT_PUBLIC_API_BASE_URL` environment variable in your deployment settings
   - Example: `https://your-production-api.com/api/v1`

2. **For Docker or self-hosted deployments**:
   - Create a `.env.production` file with your production API URL
   - Or set the environment variable at runtime

3. **For local production testing**:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api/v1 npm start
   ```

This configuration ensures your frontend can connect to the appropriate backend API regardless of the environment.

## 📁 Project Structure

```
ftt-frontend/
├── app/                          # Next.js App Router Directory
│   ├── (auth)/                   # Authentication Pages
│   └── (main)/                   # Main Application Pages
│       ├── dashboard/            # Dashboard Page
│       ├── projects/             # Projects Pages
│       ├── tasks/                # Tasks Pages
│       ├── logs/                 # Time Logs Pages
│       ├── profile/              # User Profile Page
│       └── notifications/        # Notifications Page
├── components/                   # React Components
│   ├── ui/                       # UI Components (Button, Card, etc.)
│   ├── feature/                  # Feature Components
│   └── layout/                   # Layout Components
├── lib/                          # Utility Functions & Hooks
├── services/                     # API Service Functions
├── store/                        # State Management
└── types/                        # TypeScript Type Definitions
```

## 📱 Screenshots

*Screenshots will be added here once available*

## 🔄 Workflow

1. **Authentication**: Register/Login to access the system
2. **Projects**: Create projects to organize your work
3. **Tasks**: Add tasks to projects with descriptions and deadlines
4. **Time Tracking**: Track time spent on tasks
5. **Reports**: View time logs and analyze productivity

## 🧩 Key Components

- **Dashboard**: Overview of projects, tasks, and time logs
- **Project Management**: Create, view, edit, and delete projects
- **Task Management**: Manage tasks within projects
- **Time Tracking**: Track time with start/stop functionality
- **Team Management**: Add/remove team members to projects
- **Reporting**: View and filter time logs

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<!-- ## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. -->

## 🙏 Acknowledgements

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form](https://react-hook-form.com/get-started)

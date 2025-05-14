Okay, let's structure a project plan and guide for an AI agent to build the Next.js and Tailwind CSS frontend based on your backend API.

---

## Frontend Project Plan: Freelance Time Tracker

**1. Project Goal:**
To create a functional, responsive, and user-friendly web application frontend using Next.js (App Router) and Tailwind CSS that interacts with the existing backend API to provide features for time tracking, project management, task management, and user administration for freelancers or small teams.

**2. Target Audience:**
Freelancers and small teams needing a tool to track time spent on projects and tasks.

**3. Key Features (Derived from API):**
*   User Authentication (Register, Login, Logout)
*   User Profile Management (View, Update)
*   Project Management (Create, Read, Update, Delete - CRUD) - Owner focused
*   View Projects User is Member Of
*   Project Member Management (Add, Remove, View) - Owner controlled
*   Task Management (CRUD within Projects) - Assignee/Member focused
*   Task Checklist Management (CRUD within Tasks) - Assignee focused
*   Time Logging (Start Timer, Stop Timer with details, Manual Entry/Edit, Delete, View Logs per User/Project/Task)

**4. Technology Stack:**
*   **Framework:** Next.js (v14+ with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand (Recommended for simplicity and power) or React Context API
*   **Data Fetching/Caching:** React Query (TanStack Query) or SWR (Recommended for managing server state)
*   **Forms:** React Hook Form (Recommended for handling forms and validation)
*   **UI Components (Optional but Recommended):** Headless UI or Shadcn/ui (integrates well with Tailwind) for accessible components like Modals, Dropdowns, etc.
*   **Linting/Formatting:** ESLint, Prettier

**5. Project Phases & High-Level Tasks:**

*   **Phase 1: Setup & Foundation (Est. 1-2 days)** (done)
    *   Initialize Next.js project (`create-next-app` with TypeScript, Tailwind, ESLint).
    
*   **Phase 2: Authentication (Est. 2-3 days)**
*   *   Set up project folder structure (see below).
    *   Configure Tailwind CSS (`tailwind.config.ts`, `globals.css`).
    *   Implement basic App Layout (Root `layout.tsx` with placeholders for Header/Sidebar).
    *   Create basic `Sidebar` and `Header` layout components.
    *   Create Login and Register page components (`/login`, `/register`).
    *   Build authentication forms (consider using React Hook Form).
    *   Implement API service functions for user login/register.
    *   Set up global state management (Zustand/Context) for authentication status and user data.
    *   Implement protected routing logic (middleware or layout checks).
    *   Implement Logout functionality.
*   **Phase 3: Core Features - Projects & Tasks (Est. 5-7 days)**
    *   Implement Project CRUD:
        *   API service functions (`/project/*`).
        *   Project List page (`/projects`).
        *   Project Create page/form.
        *   Project Detail page (`/projects/[id]`).
        *   Project Update/Delete functionality (potentially on Detail page or separate Edit page).
        *   List projects user is member of (`/projectMember/getAllProjectsAUserIsMemberOf`).
    *   Implement Task CRUD (often within Project Detail context):
        *   API service functions (`/tasks/*`).
        *   Task list component (for Project Detail).
        *   Task create form/modal.
        *   Task update/delete functionality.
    *   Implement Project Member Management (within Project Detail):
        *   API service functions (`/projectMember/*`).
        *   Display members list.
        *   Add/Remove member functionality (conditional on ownership).
*   **Phase 4: Core Features - Time Logging & Checklists (Est. 4-5 days)**
    *   Implement Time Logging:
        *   API service functions (`/logs/*`).
        *   UI for Start/Stop Timer (e.g., in Header or Dashboard). Need modal/form for Stop to select Project/Task.
        *   Logs display page (`/logs`).
        *   Log editing/deletion functionality.
    *   Implement Task Checklists (within Task Detail view/modal):
        *   API service functions (`/items/*`).
        *   UI to display, add, update (text/status), and remove checklist items.
*   **Phase 5: Dashboard & User Profile (Est. 2-3 days)**
    *   Build the main Dashboard page (`/`) showing summary information.
    *   Build the User Profile/Settings page (`/settings/profile`) with update functionality.
*   **Phase 6: UI Polishing & Responsiveness (Est. 3-4 days)**
    *   Refine component styling using Tailwind CSS.
    *   Ensure consistent look and feel.
    *   Test and adjust layout/styles for various screen sizes (mobile, tablet, desktop).
    *   Implement loading states (spinners, skeletons) and error states (toast notifications, inline messages).
*   **Phase 7: Testing & Deployment Prep (Est. 1-2 days)**
    *   Manual testing of all features.
    *   Basic unit/integration tests (if time permits).
    *   Build optimization (`pnpm run build`).
    *   Prepare environment variables for deployment.

**6. Assumptions:**
*   The backend API is stable, running, and accessible.
*   The API Guide provided is accurate and complete.
*   The AI agent has the capability to understand and implement instructions using the specified tech stack.

**7. Success Criteria:**
*   All key features listed are implemented and functional according to the API.
*   User can register, login, and logout.
*   Users can perform CRUD operations on Projects, Tasks, Logs (within permissions).
*   Users can manage project members and task checklists.
*   The application is responsive across major device sizes.
*   The UI is intuitive and adheres to basic usability principles.

---

## Basic Frontend Folder Structure (Next.js App Router)

```plaintext
freelance-tt-frontend/
├── app/                          # Next.js App Router Directory
│   ├── (auth)/                   # Route Group for Authentication Pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (main)/                   # Route Group for Main App (Protected)
│   │   ├── layout.tsx            # Layout for main app (includes Header/Sidebar)
│   │   ├── dashboard/            # Or just use root page.tsx in this group
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx          # List projects
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # Create project form
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx      # Project details
│   │   │       └── edit/         # (Optional) Edit project form
│   │   │           └── page.tsx
│   │   ├── tasks/                # Task routes (maybe just detail/edit)
│   │   │   └── [taskId]/
│   │   │       └── page.tsx      # (Optional) Task details page
│   │   ├── logs/
│   │   │   ├── page.tsx          # List logs
│   │   │   └── edit/             # (Optional) Edit log form
│   │   │       └── [logId]/
│   │   │           └── page.tsx
│   │   └── settings/
│   │       └── profile/
│   │           └── page.tsx
│   ├── layout.tsx                # Root Layout (applies font, global context providers)
│   └── page.tsx                  # Landing/Entry page (might redirect based on auth)
│   └── globals.css               # Global styles (Tailwind base, etc.)
│   └── loading.tsx               # Optional: Root loading UI
│   └── error.tsx                 # Optional: Root error UI
├── components/                   # Reusable React Components
│   ├── ui/                       # Generic UI Primitives (Button, Card, Input, Modal, Badge, Spinner)
│   ├── feature/                  # Feature-specific Components (ProjectList, TaskForm, ActiveTimer, Checklist)
│   └── layout/                   # Layout Components (Header, Sidebar, PageWrapper)
├── lib/                          # Utility functions, constants, helpers
│   ├── hooks/                    # Custom React hooks
│   ├── utils.ts                  # General utility functions (e.g., date formatting)
│   └── constants.ts              # App-wide constants
├── services/                     # API interaction layer (functions to call backend)
│   ├── api-client.ts             # Base Axios/Fetch instance configuration (if needed)
│   ├── user.ts
│   ├── project.ts
│   ├── task.ts
│   ├── log.ts
│   ├── projectMember.ts
│   └── taskChecklist.ts
├── store/                        # Global State Management (e.g., Zustand stores)
│   └── auth.ts                   # Authentication store
│   └── timer.ts                  # Potentially for active timer state
├── types/                        # TypeScript definitions
│   └── index.ts                  # Shared types (can potentially adapt from backend's kysely-types)
├── public/                       # Static assets (images, fonts)
├── .env.local                    # Local environment variables (e.g., NEXT_PUBLIC_API_BASE_URL)
├── .eslintrc.json
├── .gitignore
├── next.config.mjs               # Next.js configuration
├── package.json
├── pnpm-lock.yaml                # Or yarn.lock / package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Guide for AI Agent to Create Frontend

**Objective:** Implement the frontend for the Freelance Time Tracker based on the provided API guide and the suggested project structure/plan.

**Core Technologies:** Next.js (App Router), TypeScript, Tailwind CSS.
**Recommended Libraries:** Zustand (State), React Query (Server State), React Hook Form (Forms).

**Instructions:**

1.  **Phase 1: Setup & Foundation**
    *   Initialize a new Next.js project using `create-next-app` with TypeScript, Tailwind CSS, and ESLint options enabled. Use `pnpm` (or specified package manager).
    *   Create the directories outlined in the "Basic Frontend Folder Structure".
    *   Configure `tailwind.config.ts`: Add any primary/accent colors if desired, otherwise use defaults. Ensure `content` includes `./app/**/*.{js,ts,jsx,tsx,mdx}` and `./components/**/*.{js,ts,jsx,tsx,mdx}`.
    *   Update `app/globals.css` with Tailwind's `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`.
    *   Create `app/layout.tsx`. Include basic HTML structure (`<html>`, `<body>`). Apply base font styles via Tailwind in the body class (e.g., `font-sans`).
    *   Create placeholder components: `components/layout/Header.tsx`, `components/layout/Sidebar.tsx`, `components/layout/PageWrapper.tsx`.
    *   Create `app/(main)/layout.tsx`. This layout should render the `Header`, `Sidebar`, and use `PageWrapper` around the `{children}` to create the main application UI structure (e.g., using flexbox or grid).

2.  **Phase 2: Authentication**
    *   Create `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx`.
    *   Implement basic forms within these pages for required fields (email/password for login; name, username, email, password for register). Style using Tailwind.
    *   Create API service functions in `services/user.ts`: `registerUser(data)` and `loginUser(credentials)`. These functions should use `fetch` or an `axios` instance to call `POST /api/v1/user/register` and `POST /api/v1/user/login` respectively. Handle responses and errors. Use environment variable for base URL (e.g., `process.env.NEXT_PUBLIC_API_BASE_URL`).
    *   Set up Zustand store in `store/auth.ts`: Include state for `isAuthenticated` (boolean), `user` (object | null), `isLoading` (boolean). Define actions like `login`, `register`, `logout`, `setUser`.
    *   Integrate form submissions with API calls and the Zustand store. On successful login/register, update the auth store and redirect (using `next/navigation`'s `useRouter`) to `/dashboard`. Handle loading and display error messages.
    *   Implement protected routing: In `app/(main)/layout.tsx`, use the auth store. If `!isAuthenticated` and not `isLoading`, redirect the user to `/login`. You might need a top-level Provider in `app/layout.tsx` for the Zustand store and React Query client.
    *   Add a Logout button to the `Header` component. Its `onClick` should call the `logout` action in the auth store, which in turn should call `POST /api/v1/user/logout`, clear the store state, and redirect to `/login`.

3.  **Phase 3: Project & Task Implementation**
    *   **Data Fetching Setup:** Initialize React Query client and wrap the root layout (`app/layout.tsx`) with `<QueryClientProvider>`.
    *   **Projects:**
        *   Create API service functions in `services/project.ts` for `createProject`, `getProjectById`, `getAllProjectsOfUser`, `updateProject`, `deleteProject`.
        *   In `app/(main)/projects/page.tsx`, use React Query's `useQuery` hook to fetch data from `getAllProjectsOfUser`. Display the projects using `components/feature/ProjectList` and `ProjectListItem` components (create these). Handle loading/error states from `useQuery`.
        *   Implement `app/(main)/projects/create/page.tsx` with a `ProjectForm` component (use React Hook Form + Zod schema if possible) calling `createProject` service on submit. Use React Query's `useMutation` for the creation. Invalidate the project list query on success.
        *   Implement `app/(main)/projects/[projectId]/page.tsx`. Use `useQuery` to fetch data from `getProjectById`. Display project details. Add buttons for Edit/Delete.
        *   Implement Update/Delete logic using `useMutation`. Show confirmation modals (`components/ui/Modal`) for deletion. Invalidate relevant queries on success.
    *   **Tasks:**
        *   Create API service functions in `services/task.ts` for `createTask`, `getTaskById`, `getProjectTasks`, `updateTask`, `deleteTask`, `getUserTasks`.
        *   Integrate Task display into `app/(main)/projects/[projectId]/page.tsx`. Fetch tasks using `useQuery` with `getProjectTasks(projectId)`. Display using `components/feature/TaskList` and `TaskListItem`.
        *   Add a "Create Task" button/form (potentially a modal) within the Project Detail page, calling `createTask` via `useMutation`. Invalidate the project tasks query.
        *   Implement Task Update/Delete functionality similar to Projects, using modals and mutations.
    *   **Project Members:**
        *   Create API service functions in `services/projectMember.ts`.
        *   In `app/(main)/projects/[projectId]/page.tsx`, add a section for members. Fetch using `useQuery` with `getAllMembersOfAProject(projectId)`.
        *   Add UI for adding/removing members (input field for user ID/email lookup - backend currently uses ID, form, buttons). Use `useMutation` for `addMemberToProject` and `removeMembersFromProject`. *Conditionally render these controls based on whether the current user ID (from auth store) matches the project's `userId`.* Invalidate the members query on success.

4.  **Phase 4: Time Logging & Checklists**
    *   **Time Logs:**
        *   Create API service functions in `services/log.ts`.
        *   Implement the `ActiveTimer` component (perhaps in `Header` or `Dashboard`). Use state to manage running time locally.
        *   "Start" button calls `startTimeLog` via `useMutation`. Store the created log's `id` (maybe in Zustand `timer.ts` store).
        *   "Stop" button should trigger a modal:
            *   Modal needs inputs/dropdowns to select the relevant `projectId` and `taskId` for the stopped log. Fetch user's projects/tasks if needed for selection.
            *   Submit button in modal calls `stopTimeLog` via `useMutation`, passing the active `logId` and selected `projectId`/`taskId`.
        *   Implement `/logs` page fetching user logs via `useQuery`. Display in a `LogList`.
        *   Implement Edit/Delete for logs using mutations and modals.
    *   **Task Checklists:**
        *   Create API service functions in `services/taskChecklist.ts`.
        *   Within the Task Detail view (either page or modal), fetch checklist items using `useQuery` (`getTaskChecklist(taskId)`).
        *   Display items using `components/feature/Checklist` and `ChecklistItem`.
        *   Implement form/input to add items (`addChecklistItem` mutation).
        *   Implement checkbox toggling (`updateChecklistItem` mutation for `isCompleted`).
        *   Implement item text editing (inline or modal, `updateChecklistItem` mutation).
        *   Implement item deletion (`removeChecklistItem` mutation). Invalidate checklist query on mutations.

5.  **Phase 5: Dashboard & User Profile**
    *   Build `app/(main)/dashboard/page.tsx`. Fetch relevant data (active timer status, recent projects/tasks, logs for today/week) using `useQuery` and display summary components/cards.
    *   Build `app/(main)/settings/profile/page.tsx`. Fetch user data (`getUserById` or use data from auth store). Implement a form (React Hook Form) to update details (`updateUser` mutation).

6.  **Phase 6: Styling & Responsiveness**
    *   Review all pages and components. Apply Tailwind utility classes consistently for styling, spacing, and layout according to general design principles (clean, functional).
    *   Use `sm:`, `md:`, `lg:`, `xl:` prefixes in Tailwind to ensure the layout reflows sensibly on different screen sizes. Test using browser developer tools.
    *   Implement visual loading states (e.g., using `components/ui/Spinner` or skeleton loaders) triggered by `isLoading` flags from `useQuery`/`useMutation`.
    *   Implement visual error states (e.g., using toast notifications or inline messages) based on `isError` flags and error objects.

7.  **Phase 7: Final Touches**
    *   Ensure all internal navigation uses Next.js `<Link>`.
    *   Ensure form submissions provide clear feedback (loading indicators, success/error messages).
    *   Perform thorough manual testing across different browsers and screen sizes if possible.

**Important Notes for AI:**

*   **API Guide is Key:** Refer *strictly* to the provided API Guide for endpoints, methods, request bodies, and expected responses.
*   **Error Handling:** Gracefully handle API errors (4xx, 5xx) and network issues. Display informative messages to the user.
*   **Loading States:** Provide visual feedback during data fetching and mutations.
*   **Permissions:** While the backend handles core authorization, the frontend should conditionally render UI elements (like Edit/Delete buttons, Add Member forms) based on user roles or ownership where appropriate (e.g., using data available in the `user` object from the auth store or fetched project data).
*   **Environment Variables:** Use `NEXT_PUBLIC_API_BASE_URL` for the backend URL.
*   **Iterative Development:** Implement features module by module (e.g., Auth, then Projects, then Tasks).

---

This plan and guide provide a solid roadmap. The AI should be instructed to follow these steps sequentially, referring back to the API documentation constantly.
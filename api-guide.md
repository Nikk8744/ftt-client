Okay, here is a detailed API guide based on your backend structure, designed for frontend developers using this API.

---

# Freelance Time Tracker API Guide

**Version:** 1.0.0
**Base URL:** `/api/v1`

## Authentication

This API uses JWT (JSON Web Tokens) for authentication, managed via cookies.

1. **Login:** The user sends their credentials (`email`, `password`) to the `/user/login` endpoint.
2. **Token Issuance:** Upon successful authentication, the backend responds with user data and sets two HttpOnly cookies:
   * `accessToken`: A short-lived token used to authenticate subsequent requests.
   * `refreshToken`: A longer-lived token used to potentially refresh the access token in a future implementation.
3. **Authenticated Requests:** For endpoints requiring authentication, the browser automatically sends the `accessToken` cookie with each request. The backend validates this token.
4. **Logout:** The `/user/logout` endpoint clears the authentication cookies and removes the refresh token from the user's record in the database.

**Required Middleware:**
* `verifyJWT`: Checks for a valid `accessToken`. Applied to most routes after login.
* `isProjectOwner`: Checks if the authenticated user is the owner of the specified project.
* `isAdmin`: Checks if the authenticated user has the 'Admin' role.

---

## Endpoints

### 1. User (`/user`)

Handles user registration, login, profile management, and logout.

---

#### 1.1 Register User

*   **Endpoint:** `POST /api/v1/user/register`
*   **Description:** Creates a new user account.
*   **Authentication:** None required.
*   **Request Body:** (`application/json`)
    ```json
    {
      "name": "string (required, min 1)",
      "userName": "string (required, unique, min 3)",
      "email": "string (required, unique, valid email format)",
      "password": "string (required, min 5)",
      "role": "string (optional, 'user' or 'admin', defaults to 'user')"
    }
    ```
*   **Response (Success - 201 Created):**
    ```json
    {
      "msg": "User created successfully",
      "user": {
        "id": "number",
        "name": "string",
        "userName": "string",
        "email": "string",
        "role": "string",
        "createdAt": "string (ISO 8601 DateTime)"
        // Note: password and refreshToken are excluded
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation error (e.g., email exists, username exists, invalid input). Body: `{ "msg": "Specific error message" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal server error occurred" }`

---

#### 1.2 Login User

*   **Endpoint:** `POST /api/v1/user/login`
*   **Description:** Authenticates a user and sets authentication cookies.
*   **Authentication:** None required.
*   **Request Body:** (`application/json`)
    ```json
    {
      "email": "string (required, valid email format)",
      "password": "string (required, min 6)"
    }
    ```
*   **Response (Success - 200 OK):**
    *   Sets `accessToken` and `refreshToken` HttpOnly cookies.
    *   Body:
        ```json
        {
          "msg": "Login successful!!",
          "user": {
            "id": "number",
            "name": "string",
            "userName": "string",
            "email": "string",
            "role": "string",
            "createdAt": "string (ISO 8601 DateTime)"
            // Note: password and refreshToken are excluded
          }
        }
        ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation error or Invalid credentials. Body: `{ "msg": "Specific error message" }` (e.g., "Invalid email or password!!")
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error" }`

---

#### 1.3 Get User by ID

*   **Endpoint:** `GET /api/v1/user/getUser/:id`
*   **Description:** Retrieves details for a specific user.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `id` (number): The ID of the user to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "user": {
        "id": "number",
        "name": "string",
        "userName": "string",
        "email": "string",
        "role": "string",
        "createdAt": "string (ISO 8601 DateTime)"
        // Note: password and refreshToken are excluded
      },
      "msg": "User fetched successfully"
    }
    ```
*   **Response (Error):**
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: User with the given ID not found. Body: `{ "msg": "User Not found!!" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Something went wrong while fetching user" }`

---

#### 1.4 Update User Details

*   **Endpoint:** `PATCH /api/v1/user/updateDetails/:id`
*   **Description:** Updates details for a specific user. Users can typically only update their own profile, unless admin functionality is added later. (Current implementation doesn't explicitly check if `:id` matches `req.user.id`).
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `id` (number): The ID of the user to update.
*   **Request Body:** (`application/json`) - Send only the fields to be updated.
    ```json
    {
      "name": "string (optional, max 255)",
      "userName": "string (optional, unique, min 3, max 255)",
      "email": "string (optional, unique, valid email format, max 255)",
      "role": "string (optional, 'user' or 'admin')"
      // Password updates should ideally be handled via a separate endpoint/flow
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "User updated successfully",
      "updatedUser": {
        "id": "number",
        "name": "string",
        "userName": "string",
        "email": "string",
        "role": "string",
        "createdAt": "string (ISO 8601 DateTime)"
        // Note: password and refreshToken are excluded
      }
    }
    ```*   **Response (Error):**
    *   `400 Bad Request`: Validation error (e.g., email/username already taken). Body: `{ "msg": "Specific error message" }` or Zod errors.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: User with the given ID not found. Body: `{ "msg": "User not found" }` (handled in service, controller returns 500 currently)
    *   `500 Internal Server Error`: Server issue or user not found. Body: `{ "msg": "Something went wrong while updating the user!!" }`

---

#### 1.5 Delete User

*   **Endpoint:** `DELETE /api/v1/user/deleteUser/:id`
*   **Description:** Deletes a user account. (Note: This endpoint lacks `verifyJWT` in the routes file, meaning anyone knowing a user ID could potentially delete it - **This should likely be protected**). It also doesn't check if the user is deleting themselves or if they have permission (e.g., Admin).
*   **Authentication:** **Recommended: `verifyJWT` (and potentially admin/self check).** Currently unprotected.
*   **Path Parameters:**
    *   `id` (number): The ID of the user to delete.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "User deleted successfully!!"
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Deletion failed (e.g., user not found, although currently handled as an error in service). Body: `{ "msg": "Deleting failed please try again!!" }` or `{ "msg": "User not found" }` (from service throw)
    *   `500 Internal Server Error`: Server issue.

---

#### 1.6 Logout User

*   **Endpoint:** `POST /api/v1/user/logout`
*   **Description:** Logs the current user out by clearing cookies and the refresh token in the DB.
*   **Authentication:** Required (`verifyJWT`).
*   **Request Body:** None.
*   **Response (Success - 200 OK):**
    *   Clears `accessToken` and `refreshToken` cookies.
    *   Body:
        ```json
        {
          "msg": "User logged out successfully!!"
        }
        ```
*   **Response (Error):**
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `500 Internal Server Error`: Server issue.

---

### 2. Project (`/project`)

Handles project creation, retrieval, updates, and deletion.

---

#### 2.1 Create Project

*   **Endpoint:** `POST /api/v1/project/createProject`
*   **Description:** Creates a new project associated with the authenticated user.
*   **Authentication:** Required (`verifyJWT`).
*   **Request Body:** (`application/json`)
    ```json
    {
      "name": "string (required, unique, min 3, max 255)",
      "description": "string (optional, min 5, max 1000)",
      "startDate": "string (required, ISO 8601 DateTime format)",
      "endDate": "string (required, ISO 8601 DateTime format, must be >= startDate)",
      "status": "string (optional, 'Pending', 'In-Progress', or 'Completed', defaults to 'Pending')",
      "totalHours": "number (optional, defaults to 0)" // Usually calculated, but can be set
    }
    ```
*   **Response (Success - 200 OK):** (Note: Controller uses 200, could be 201 Created)
    ```json
    {
      "msg": "Project created successfully!!!",
      "project": {
        "id": "number",
        "name": "string",
        "description": "string",
        "startDate": "string (ISO 8601 DateTime)",
        "endDate": "string (ISO 8601 DateTime)",
        "status": "string",
        "userId": "number", // ID of the owner
        "totalHours": "string" | "number", // Kysely type is Decimal
        "createdAt": "string (ISO 8601 DateTime)",
        "updatedAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation error (e.g., name exists, invalid date). Body: `{ "msg": "Specific error message" }` or Zod errors.
    *   `401 Unauthorized`: Missing or invalid `accessToken`. Body: `{ "msg": "Unauthorized, please login first." }`
    *   `500 Internal Server Error`: Server issue.

---

#### 2.2 Get Project by ID

*   **Endpoint:** `GET /api/v1/project/getProject/:id`
*   **Description:** Retrieves details for a specific project. User must be logged in, but doesn't need to be owner/member (based on current code).
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `id` (number): The ID of the project to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Project found!!",
      "project": {
        "id": "number",
        "name": "string",
        "description": "string",
        "startDate": "string (ISO 8601 DateTime)",
        "endDate": "string (ISO 8601 DateTime)",
        "status": "string",
        "userId": "number",
        "totalHours": "string" | "number",
        "createdAt": "string (ISO 8601 DateTime)",
        "updatedAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid project ID format. Body: `{ "msg": "Invalid project id" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Project with the given ID not found. Body: `{ "msg": "Project not found!!" }`
    *   `500 Internal Server Error`: Server issue.

---

#### 2.3 Get All Projects of Authenticated User (Owned)

*   **Endpoint:** `GET /api/v1/project/getAllProjectsOfUser`
*   **Description:** Retrieves all projects owned by the currently authenticated user.
*   **Authentication:** Required (`verifyJWT`).
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "All projects fetched successfully",
      "projects": [
        {
          "id": "number",
          "name": "string",
          "description": "string",
          "startDate": "string (ISO 8601 DateTime)",
          "endDate": "string (ISO 8601 DateTime)",
          "status": "string",
          "userId": "number",
          "totalHours": "string" | "number",
          "createdAt": "string (ISO 8601 DateTime)",
          "updatedAt": "string (ISO 8601 DateTime)"
        }
        // ... potentially more projects
      ]
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: If no projects are found. Body: `{ "msg": "No projects found!!" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`. Body: `{ "msg": "Unauthorized, please login first." }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error", "error": {} }`

---

#### 2.4 Update Project

*   **Endpoint:** `PATCH /api/v1/project/updateProject/:id`
*   **Description:** Updates details for a specific project. Requires the authenticated user to be the project owner or an Admin.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** User must be owner or Admin.
*   **Path Parameters:**
    *   `id` (number): The ID of the project to update.
*   **Request Body:** (`application/json`) - Send only the fields to be updated.
    ```json
    {
      "name": "string (optional, unique, min 3, max 255)",
      "description": "string (optional, min 5, max 1000)",
      "startDate": "string (optional, ISO 8601 DateTime format)",
      "endDate": "string (optional, ISO 8601 DateTime format, must be >= startDate if provided)",
      "status": "string (optional, 'Pending', 'In-Progress', or 'Completed')",
      "totalHours": "number (optional, non-negative)"
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Project updated successfully!!",
      "project": {
        "id": "number",
        "name": "string",
        "description": "string",
        "startDate": "string (ISO 8601 DateTime)",
        "endDate": "string (ISO 8601 DateTime)",
        "status": "string",
        "userId": "number",
        "totalHours": "string" | "number",
        "createdAt": "string (ISO 8601 DateTime)",
        "updatedAt": "string (ISO 8601 DateTime)" // Reflects update time
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid project ID format or validation error. Body: `{ "msg": "Invalid project id" }` or `{ errors: ZodError[] }` or `{ "msg": "Specific service error" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `403 Forbidden`: User is not the owner or Admin. Body: `{ "msg": "Forbidden: You cannot update this project." }`
    *   `404 Not Found`: Project not found. Body: `{ "msg": "Project not found!" }` (or potentially User not found from service layer: `{ "msg": "User not found!!" }`)
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error" }`

---

#### 2.5 Delete Project

*   **Endpoint:** `DELETE /api/v1/project/deleteProject/:id`
*   **Description:** Deletes a specific project. Requires the authenticated user to be the project owner or an Admin. Associated tasks, logs, members, and checklists will also be deleted due to `ON DELETE CASCADE` constraints in migrations.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** User must be owner or Admin.
*   **Path Parameters:**
    *   `id` (number): The ID of the project to delete.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Project deleted successfully" // Message from service
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid project ID format. Body: `{ "msg": "Invalid project id" }` or `{ "msg": "Project with id X does not exist" }` (from service)
    *   `401 Unauthorized`: Missing or invalid `accessToken`. Body: `{ "msg": "Unauthorized, please login first." }`
    *   `403 Forbidden`: User is not the owner or Admin. Body: `{ "msg": "Forbidden: You cannot delete this project." }`
    *   `404 Not Found`: Project not found. Body: `{ "msg": "Project not found!" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error" }`

---

### 3. Project Members (`/projectMember`)

Handles adding, removing, and viewing members of a project.

---

#### 3.1 Add Member to Project

*   **Endpoint:** `POST /api/v1/projectMember/addMember`
*   **Description:** Adds a user as a member to a project.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** Required (`isProjectOwner`). The authenticated user must be the owner of the `projectId` specified in the body.
*   **Request Body:** (`application/json`)
    ```json
    {
      "projectId": "number (required, positive)",
      "userId": "number (required, positive)" // ID of the user to add
      // "role": "string (optional)" // Not currently used by backend logic
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Member added successfully",
      "ownerId": "string" // The ID of the project owner
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation error or other failure. Body: `{ errors: ZodError[] }` or `{ "msg": "Specific error message" }` (e.g., "User X is already a member...") or `{ "msg": "Failed to add member to project" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`. Body: `{ "msg": "Unauthorized: Please log in first" }`
    *   `403 Forbidden`: Authenticated user is not the owner. Body: `{ "msg": "Forbidden: Only the project owner can perform this action" }` or `{ "msg": "Forbidden: only the project owner can add members" }`
    *   `404 Not Found`: Project not found. Body: `{ "msg": "Project not found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error" }`

---

#### 3.2 Remove Member from Project

*   **Endpoint:** `DELETE /api/v1/projectMember/removeMember`
*   **Description:** Removes a user from a project.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** Required (`isProjectOwner`). The authenticated user must be the owner of the `projectId` specified in the body.
*   **Request Body:** (`application/json`)
    ```json
    {
      "projectId": "number (required, positive)",
      "userId": "number (required, positive)" // ID of the user to remove
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "User removed from project successfully"
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation error or other failure. Body: `{ "msg": "Specific error message" }` (e.g., "User X is not a member...", "Project not found") or `{ "msg": "Failed to remove member from project" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`. Body: `{ "msg": "Unauthorized: Please log in first" }`
    *   `403 Forbidden`: Authenticated user is not the owner. Body: `{ "msg": "Forbidden: Only the project owner can perform this action" }`
    *   `404 Not Found`: Project not found (checked by `isProjectOwner`). Body: `{ "msg": "Project not found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error" }`

---

#### 3.3 Get All Members of a Project

*   **Endpoint:** `GET /api/v1/projectMember/getAllMembers/:id`
*   **Description:** Retrieves a list of all members for a specific project.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** Required (`isProjectOwner`). The authenticated user must be the owner of the project ID specified in the path.
*   **Path Parameters:**
    *   `id` (number): The ID of the project whose members to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "members": [
        {
          "id": "number", // User ID
          "name": "string", // User name
          "email": "string" // User email
        }
        // ... potentially more members
      ],
      "msg": "All members of project retrieved successfully"
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid project ID format or failure to get members. Body: `{ "msg": "Invalid project id" }` or `{ "msg": "Failed to get all members of project" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`. Body: `{ "msg": "Unauthorized: Please log in first" }`
    *   `403 Forbidden`: Authenticated user is not the owner. Body: `{ "msg": "Forbidden: Only the project owner can perform this action" }`
    *   `404 Not Found`: Project not found (checked by `isProjectOwner`). Body: `{ "msg": "Project not found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error" }`

---

#### 3.4 Get All Projects a User is a Member Of

*   **Endpoint:** `GET /api/v1/projectMember/getAllProjectsAUserIsMemberOf`
*   **Description:** Retrieves a list of all projects the *authenticated* user is a member of (excluding projects they own, unless they explicitly added themselves).
*   **Authentication:** Required (`verifyJWT`).
*   **Response (Success - 200 OK):**
    ```json
    {
      "projects": [
        {
          "id": "number",
          "name": "string",
          "description": "string",
          "startDate": "string (ISO 8601 DateTime)",
          "endDate": "string (ISO 8601 DateTime)",
          "status": "string",
          "userId": "number", // Owner's ID
          "totalHours": "string" | "number",
          "createdAt": "string (ISO 8601 DateTime)",
          "updatedAt": "string (ISO 8601 DateTime)"
        }
        // ... potentially more projects
      ],
      "msg": "All projects a user is member of retrieved successfully"
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: If no projects are found. Body: `{ "msg": "No projects found" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`. Body: `{ "msg": "Unauthorized" }`
    *   `500 Internal Server Error`: Server issue.

---

### 4. Tasks (`/tasks`)

Handles task creation, retrieval, updates, and deletion, usually within the context of a project.

---

#### 4.1 Create Task

*   **Endpoint:** `POST /api/v1/tasks/createTask/:projectId`
*   **Description:** Creates a new task within a specific project. The authenticated user must be the owner or a member of the project. The task is assigned to the authenticated user by default.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `projectId` (number): The ID of the project to add the task to.
*   **Request Body:** (`application/json`)
    ```json
    {
      "subject": "string (required, min 3, max 50)",
      "description": "string (optional)",
      "status": "string (optional, 'Pending', 'In-Progress', 'Done', defaults to 'Pending')",
      "dueDate": "string (optional, ISO 8601 DateTime format)",
      "assignedUserId": "number (optional, positive)" // If omitted, defaults to logged-in user in service
    }
    ```
*   **Response (Success - 200 OK):** (Note: Controller uses 200, could be 201 Created)
    ```json
    {
      "message": "Task created successfully",
      "task": {
        "id": "number",
        "subject": "string",
        "description": "string | null",
        "status": "string",
        "startDate": "string (ISO 8601 DateTime)", // Defaulted on creation
        "dueDate": "string (ISO 8601 DateTime) | null",
        "totalTimeSpent": "number | null", // Usually 0 on creation
        "assignedUserId": "number",
        "projectId": "number",
        "createdAt": "string (ISO 8601 DateTime)",
        "updatedAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation error or user not owner/member. Body: `{ errors: ZodError[] }` or `{ "msg": "User is not a project member" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Task creation failed" }`

---

#### 4.2 Get Task by ID

*   **Endpoint:** `GET /api/v1/tasks/getTask/:taskId`
*   **Description:** Retrieves details for a specific task.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `taskId` (number): The ID of the task to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Task retrived successfully",
      "task": {
        "id": "number",
        "subject": "string",
        "description": "string | null",
        "status": "string",
        "startDate": "string (ISO 8601 DateTime)",
        "dueDate": "string (ISO 8601 DateTime) | null",
        "totalTimeSpent": "number | null",
        "assignedUserId": "number",
        "projectId": "number",
        "createdAt": "string (ISO 8601 DateTime)",
        "updatedAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid Task ID format.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Task with the given ID not found. Body: `{ "message": "Task not found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to fetch task" }`

---

#### 4.3 Get Tasks for a Project

*   **Endpoint:** `GET /api/v1/tasks/getProjectTasks/:projectId`
*   **Description:** Retrieves all tasks associated with a specific project.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `projectId` (number): The ID of the project whose tasks to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Tasks retrieved successfully",
      "tasks": [
        {
          "id": "number",
          "subject": "string",
          "description": "string | null",
          "status": "string",
          "startDate": "string (ISO 8601 DateTime)",
          "dueDate": "string (ISO 8601 DateTime) | null",
          "totalTimeSpent": "number | null",
          "assignedUserId": "number",
          "projectId": "number", // Should match :projectId
          "createdAt": "string (ISO 8601 DateTime)",
          "updatedAt": "string (ISO 8601 DateTime)"
        }
        // ... potentially more tasks
      ]
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid project ID format. Body: `{ "msg": "Invalid project id" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Project not found. Body: `{ "message": "Project not found" }` or `{ "msg": "Project does not exist" }` (from service)
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error", "error": {} }`

---

#### 4.4 Get All Tasks (Admin Only - Conceptual)

*   **Endpoint:** `GET /api/v1/tasks/getAllTask`
*   **Description:** Retrieves all tasks across all projects. (Requires Admin role conceptually, though middleware isn't attached in routes).
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** Should require Admin role.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Tasks retrieved successfully",
      "tasks": [
         // ... Array of Task objects similar to 4.3
      ]
    }
    ```
*   **Response (Error):**
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `403 Forbidden`: If Admin check were implemented and user is not Admin.
    *   `404 Not Found`: No tasks found at all. Body: `{ "message": "No tasks found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to fetch tasks" }`

---

#### 4.5 Get Tasks Assigned to a User

*   **Endpoint:** `GET /api/v1/tasks/getUserTasks` (Can also potentially use `/api/v1/tasks/getUserTasks/:userId` if allowing admins to view others' tasks)
*   **Description:** Retrieves all tasks assigned to the currently authenticated user (or specified user via param).
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters (Optional):**
    *   `userId` (number): If implemented, the ID of the user whose tasks to retrieve (requires Admin privileges probably). If omitted, defaults to the authenticated user (`req.user.id`).
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Tasks retrieved successfully",
      "tasks": [
         // ... Array of Task objects assigned to the user
      ]
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid user ID format if path param is used. Body: `{ "msg": "Invalid project id" }` (misleading message)
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to fetch user tasks" }`

---

#### 4.6 Update Task

*   **Endpoint:** `PATCH /api/v1/tasks/updateTask/:taskId`
*   **Description:** Updates details for a specific task. (Permissions: Needs clarification - should assigned user or project owner be able to update?)
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** (Assumed: Authenticated user should likely be assigned user or project owner/member). Not explicitly enforced in current code beyond `verifyJWT`.
*   **Path Parameters:**
    *   `taskId` (number): The ID of the task to update.
*   **Request Body:** (`application/json`) - Send only fields to be updated.
    ```json
    {
      "subject": "string (optional, min 3, max 50)",
      "description": "string (optional)",
      "status": "string (optional, 'Pending', 'In-Progress', 'Done')",
      "dueDate": "string (optional, ISO 8601 DateTime format)",
      "assignedUserId": "number (optional, positive)" // To re-assign
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Task updated successfully",
      "task": {
        // ... Updated Task object (similar to 4.2)
      }
    }
    ```*   **Response (Error):**
    *   `400 Bad Request`: Invalid task ID or validation error. Body: `{ "msg": "Invalid project id" }` (misleading) or `{ errors: ZodError[] }` or `{ "msg": "Task does not exist" }` (from service)
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `403 Forbidden`: If specific permissions were enforced and user doesn't meet them.
    *   `404 Not Found`: Task not found. Body: `{ "message": "Task not found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "msg": "Internal Server Error" }`

---

#### 4.7 Delete Task

*   **Endpoint:** `DELETE /api/v1/tasks/deleteTask/:taskId`
*   **Description:** Deletes a specific task. Associated checklist items and time logs will also be deleted due to `ON DELETE CASCADE`.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** (Assumed: Authenticated user should likely be assigned user or project owner/member). Not explicitly enforced beyond `verifyJWT`.
*   **Path Parameters:**
    *   `taskId` (number): The ID of the task to delete.
*   **Response (Success - 200 OK):**
    ```json
    {
      "message": "Task deleted successfully"
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid task ID format. Body: `{ "msg": "Invalid project id" }` (misleading) or `{ "msg": "Task does not exist" }` (from service)
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `403 Forbidden`: If specific permissions were enforced.
    *   `404 Not Found`: Task not found. Body: `{ "message": "Task not found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Task deletion failed" }`

---

### 5. Time Logs (`/logs`)

Handles starting, stopping, retrieving, and managing time log entries.

---

#### 5.1 Start Time Log

*   **Endpoint:** `POST /api/v1/logs/startTimeLog`
*   **Description:** Creates a new time log entry for the authenticated user with the current time as `startTime` and `endTime` as null. Prevents starting a new log if one is already active (endTime is null).
*   **Authentication:** Required (`verifyJWT`).
*   **Request Body:** (`application/json`) - Empty object currently.
    ```json
    {}
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Log started successfully",
      "data": {
        "id": "number",
        "name": null,
        "description": null,
        "startTime": "string (ISO 8601 DateTime)",
        "endTime": null,
        "userId": "number", // Authenticated user's ID
        "projectId": null,
        "taskId": null,
        "timeSpent": 0,
        "createdAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation errors or already active timer. Body: `{ errors: ZodError[] }` or `{ "msg": "You have an active time log. Stop it first." }` or `{ "msg": "Error starting log" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to start time log" }`

---

#### 5.2 Stop Time Log

*   **Endpoint:** `POST /api/v1/logs/stopTimeLog/:logId`
*   **Description:** Stops an active time log by setting its `endTime`, calculating `timeSpent`, and associating it with a project and task. Also updates the `totalTimeSpent` on the task and `totalHours` on the project.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `logId` (number): The ID of the time log entry to stop.
*   **Request Body:** (`application/json`)
    ```json
    {
      "projectId": "number (required, positive)",
      "taskId": "number (required, positive)",
      "name": "string (optional)",
      "description": "string (optional)"
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Log stopped successfully",
      "data": {
        "id": "number",
        "name": "string | null",
        "description": "string | null",
        "startTime": "string (ISO 8601 DateTime)",
        "endTime": "string (ISO 8601 DateTime)", // Now set
        "userId": "number",
        "projectId": "number", // Now set
        "taskId": "number", // Now set
        "timeSpent": "number", // Calculated seconds
        "createdAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid ID(s), validation error, log not found, or log already stopped. Body: `{ "msg": "Invalid id`s" }` or `{ errors: ZodError[] }` or `{ "msg": "Time log already stopped" }` or `{ "msg": "Error stopping log" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to stop time log" }`

---

#### 5.3 Get Log by ID

*   **Endpoint:** `GET /api/v1/logs/getLogById/:logId`
*   **Description:** Retrieves details for a specific time log entry.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `logId` (number): The ID of the time log to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Log found successfully",
      "data": {
        // ... Time Log object (similar to 5.2 response data)
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid log ID format. Body: `{ "msg": "Invalid id" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Log with the given ID not found. Body: `{ "msg": "Log not found" }`
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to fetch the log" }`

---

#### 5.4 Get Logs for Authenticated User

*   **Endpoint:** `GET /api/v1/logs/getUserLogs/:userId` (Note: Uses `:userId` param, but controller forces it to `req.user.id`. Should probably just be `/api/v1/logs/getUserLogs` without param).
*   **Description:** Retrieves all time log entries for the currently authenticated user.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters (Currently Misused):**
    *   `userId` (number): Route expects it, but controller ignores it and uses `req.user.id`.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "User logs found successfully",
      "data": [
        {
          // ... Time Log object
        }
        // ... potentially more logs
      ]
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid user ID format from `req.user.id`. Body: `{ "msg": "Invalid id" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: User logs not found (if array is empty, currently returns 200 OK with empty array). Controller check for `!userLogs` seems incorrect if an empty array is valid.
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to get user logs" }`

---

#### 5.5 Get Logs for a Project

*   **Endpoint:** `GET /api/v1/logs/getProjectLogs/:projectId`
*   **Description:** Retrieves all time log entries associated with a specific project.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `projectId` (number): The ID of the project whose logs to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Project's logs fetched successfully",
      "data": [
        {
          // ... Time Log object, projectId should match :projectId
        }
        // ... potentially more logs
      ]
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid project ID format. Body: `{ "msg": "Invalid id" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Logs not found (similar to 5.4, controller check seems incorrect). Body: `{ "msg": "User logs not found" }` (misleading message)
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to get Project Logs" }`

---

#### 5.6 Get Logs for a Task

*   **Endpoint:** `GET /api/v1/logs/getTaskLogs/:taskId`
*   **Description:** Retrieves all time log entries associated with a specific task.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `taskId` (number): The ID of the task whose logs to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Task's logs fetched successfully",
      "data": [
        {
          // ... Time Log object, taskId should match :taskId
        }
        // ... potentially more logs
      ]
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid task ID format. Body: `{ "msg": "Invalid id" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Logs not found (similar to 5.4, controller check seems incorrect). Body: `{ "msg": "User logs not found" }` (misleading message)
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to get Task Logs" }`

---

#### 5.7 Update Time Log

*   **Endpoint:** `PATCH /api/v1/logs/updateLog/:logId`
*   **Description:** Updates details of a specific time log entry. Adjusts associated project/task time totals accordingly.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** (Assumed: Authenticated user should own the log). Not explicitly checked beyond `verifyJWT`.
*   **Path Parameters:**
    *   `logId` (number): The ID of the time log to update.
*   **Request Body:** (`application/json`) - Send only fields to update.
    ```json
    {
      "name": "string (optional, min 3)",
      "description": "string (optional, max 1000)",
      "taskId": "number (optional, positive)", // To change associated task
      "projectId": "number (optional, positive)", // To change associated project
      "startTime": "string (optional, ISO 8601 DateTime format)",
      "endTime": "string (optional, ISO 8601 DateTime format, must be > startTime)"
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Log has been updated successfully",
      "data": {
        // ... Updated Time Log object
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid log ID, validation error (Zod), or log not found. Body: `{ "msg": "Invalid id" }` or `{ errors: ZodError[] }` or `{ "msg": "Log not found" }`.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to update time log" }`

---

#### 5.8 Delete Time Log

*   **Endpoint:** `DELETE /api/v1/logs/deleteLog/:logId`
*   **Description:** Deletes a specific time log entry. Subtracts `timeSpent` from associated task/project totals.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** (Assumed: Authenticated user should own the log). Not explicitly checked beyond `verifyJWT`.
*   **Path Parameters:**
    *   `logId` (number): The ID of the time log to delete.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Log has been deleted successfully",
      "data": true // Reflects the return from the service
    }
    ```*   **Response (Error):**
    *   `400 Bad Request`: Invalid log ID format. Body: `{ "msg": "Invalid id" }` or `{ "msg": "Log not found" }` (from service)
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Log not found or deletion failed. Body: `{ "msg": "Cannot delete log" }` (controller check seems redundant)
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to delete Log" }`

---

### 6. Task Checklist Items (`/items`)

Handles checklist items associated with tasks.

---

#### 6.1 Add Checklist Item

*   **Endpoint:** `POST /api/v1/items/addItem`
*   **Description:** Adds a new checklist item to a task. Requires user to be the assignee of the task.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** User must be the `assignedUserId` of the `taskId`.
*   **Request Body:** (`application/json`)
    ```json
    {
      "taskId": "number (required, positive)",
      "item": "string (required, min 1, max 255)"
    }
    ```*   **Response (Success - 201 Created):**
    ```json
    {
      "message": "Checklist item added successfully",
      "item": {
        "id": "number",
        "taskId": "number",
        "item": "string",
        "isCompleted": false, // Default value
        "createdAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Validation error. Body: `{ errors: ZodError[] }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `403 Forbidden`: User is not assigned to the task. Body: `{ "msg": "Only task owner can add checklist items" }` (Error message might be slightly inaccurate, should be assignee).
    *   `500 Internal Server Error`: Server issue (e.g., Task not found). Body: `{ "error": "Failed to add checklist item" }`

---

#### 6.2 Get Checklist Item by ID

*   **Endpoint:** `GET /api/v1/items/getChecklistItemById/:itemId`
*   **Description:** Retrieves details for a specific checklist item.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `itemId` (number): The ID of the checklist item to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Checklist item found",
      "item": {
        "id": "number",
        "taskId": "number",
        "item": "string",
        "isCompleted": "boolean | null", // From DB type
        "createdAt": "string (ISO 8601 DateTime)"
      }
    }
    ```
*   **Response (Error):**
    *   `400 Bad Request`: Invalid Item ID format or Item not found (if service throws). Body: `{ "msg": "Specific error message" }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `404 Not Found`: Item not found (controller check). Body: `{ "message": "Checklist item not found" }`
    *   `500 Internal Server Error`: Server issue.

---

#### 6.3 Get Checklist for a Task

*   **Endpoint:** `GET /api/v1/items/getTaskChecklist/:taskId`
*   **Description:** Retrieves all checklist items for a specific task, ordered by creation time.
*   **Authentication:** Required (`verifyJWT`).
*   **Path Parameters:**
    *   `taskId` (number): The ID of the task whose checklist to retrieve.
*   **Response (Success - 200 OK):**
    ```json
    {
      "msg": "Task checklist found",
      "checklist": [
        {
          "id": "number",
          "taskId": "number", // Should match :taskId
          "item": "string",
          "isCompleted": "boolean | null",
          "createdAt": "string (ISO 8601 DateTime)"
        }
        // ... potentially more items, ordered by createdAt
      ]
    }
    ```
*   **Response (Error):**
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `500 Internal Server Error`: Server issue. Body: `{ "error": "Failed to fetch checklist" }`

---

#### 6.4 Update Checklist Item

*   **Endpoint:** `PATCH /api/v1/items/updateChecklistItem/:itemId`
*   **Description:** Updates a checklist item (text or completion status). Requires user to be the assignee of the parent task.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** User must be the `assignedUserId` of the parent task.
*   **Path Parameters:**
    *   `itemId` (number): The ID of the checklist item to update.
*   **Request Body:** (`application/json`) - Send only fields to update.
    ```json
    {
      "item": "string (optional, min 1, max 255)",
      "isCompleted": "boolean (optional)"
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "message": "Checklist item updated successfully",
      "item": {
         // Kysely UpdateResult object - may not be the full updated item
         // Frontend might need to re-fetch or assume success based on status code.
         "numUpdatedRows": "bigint" // Typically 1n on success
      }
    }
    ```
    *Note:* The controller currently returns the `UpdateResult` directly. A better practice would be to fetch and return the updated item.
*   **Response (Error):**
    *   `400 Bad Request`: Validation error. Body: `{ errors: ZodError[] }`
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `403 Forbidden`: User is not assigned to the task. Body: `{ "msg": "Only task owner can update checklist items" }` (Error message slightly inaccurate).
    *   `404 Not Found`: Checklist item or Task not found. Service throws error.
    *   `500 Internal Server Error`: Server issue or error from service. Body: `{ "error": "Failed to update checklist item" }`

---

#### 6.5 Remove Checklist Item

*   **Endpoint:** `DELETE /api/v1/items/removeChecklistItem/:itemId`
*   **Description:** Deletes a specific checklist item.
*   **Authentication:** Required (`verifyJWT`).
*   **Authorization:** (Assumed: User should likely be task assignee/project owner). Not explicitly enforced beyond `verifyJWT`.
*   **Path Parameters:**
    *   `itemId` (number): The ID of the checklist item to delete.
*   **Response (Success - 200 OK):**
    ```text
    "Checklist Item deleted successfully!!" // Plain text response
    ```
    *Note:* The controller returns only the message string from the service response, not standard JSON. This should ideally be `{ "msg": "Checklist Item deleted successfully!!" }`.
*   **Response (Error):**
    *   `400 Bad Request`: Invalid item ID.
    *   `401 Unauthorized`: Missing or invalid `accessToken`.
    *   `403 Forbidden`: If permissions were enforced.
    *   `404 Not Found`: Checklist item not found (service throws error).
    *   `500 Internal Server Error`: Server issue or error from service.

---

## Data Models (Common Response Structures)

*(Excluding sensitive fields like password/refreshToken)*

**User:**
```json
{
  "id": "number",
  "name": "string",
  "userName": "string",
  "email": "string",
  "role": "string ('user' | 'admin')",
  "createdAt": "string (ISO 8601 DateTime)"
}
```

**Project:**
```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "startDate": "string (ISO 8601 DateTime)",
  "endDate": "string (ISO 8601 DateTime)",
  "status": "string ('Pending' | 'In-Progress' | 'Completed' | null)",
  "userId": "number (owner)",
  "totalHours": "string | number | null", // Represents decimal
  "createdAt": "string (ISO 8601 DateTime)",
  "updatedAt": "string (ISO 8601 DateTime)"
}
```

**Project Member (in `getAllMembers`):**
```json
{
  "id": "number", // User ID
  "name": "string", // User name
  "email": "string" // User email
}
```

**Task:**
```json
{
  "id": "number",
  "subject": "string",
  "description": "string | null",
  "status": "string ('Pending' | 'In-Progress' | 'Done' | null)",
  "startDate": "string (ISO 8601 DateTime)",
  "dueDate": "string (ISO 8601 DateTime) | null",
  "totalTimeSpent": "number | null", // In seconds
  "assignedUserId": "number",
  "projectId": "number",
  "createdAt": "string (ISO 8601 DateTime)",
  "updatedAt": "string (ISO 8601 DateTime)"
}
```

**Time Log:**```json
{
  "id": "number",
  "name": "string | null",
  "description": "string | null",
  "startTime": "string (ISO 8601 DateTime)",
  "endTime": "string (ISO 8601 DateTime) | null",
  "userId": "number",
  "projectId": "number | null",
  "taskId": "number | null",
  "timeSpent": "number", // In seconds
  "createdAt": "string (ISO 8601 DateTime)"
}
```

**Task Checklist Item:**
```json
{
  "id": "number",
  "taskId": "number",
  "item": "string",
  "isCompleted": "boolean | null", // Stored as boolean/tinyint
  "createdAt": "string (ISO 8601 DateTime)"
}
```

---

This guide provides a comprehensive overview for frontend integration. Remember to handle potential `null` values appropriately and ensure date/time strings are parsed correctly on the frontend.
# JWT Authentication System Design

This document describes the implemented design for a JWT-based authentication system with a Spring Boot backend, a React frontend, and PostgreSQL persistence.

## 1. Architecture Overview

The application is organized into three main components:

1. **Frontend (React)**: A single-page application that provides login, registration, and dashboard screens. It stores the JWT locally and sends it with requests to protected endpoints.
2. **Backend (Spring Boot API)**: A REST API that exposes authentication endpoints, validates credentials, issues JWTs, validates incoming JWTs, and protects role-based endpoints.
3. **Database (PostgreSQL)**: A relational database that stores users, password hashes, roles, and user-role assignments.

The runtime flow is:

```text
[React Frontend] <--- HTTP ---> [Spring Boot API] <--- JDBC ---> [PostgreSQL]
```

## 2. Technology Stack

### Backend

- Java 21
- Spring Boot 4.0.x
- Spring Security
- Spring Data JPA
- Hibernate
- JJWT
- PostgreSQL JDBC driver
- Maven

### Frontend

- React 18
- React Router
- Axios
- Vite
- Tailwind/PostCSS support with additional custom CSS

### Database

- PostgreSQL 14

## 3. Database Design

The backend uses a small RBAC-friendly schema with users, roles, and a many-to-many join table.

### `users`

Stores account identity and credential data.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique user identifier. |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | User first name. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | User last name. |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | User email, used as the login username. |
| `password` | `VARCHAR(255)` | `NOT NULL` | BCrypt password hash. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Creation timestamp. |

### `roles`

Stores security roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY` | Unique role identifier. |
| `name` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Role name, such as `ROLE_USER` or `ROLE_ADMIN`. |

### `user_roles`

Assigns roles to users.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `BIGINT` | `FOREIGN KEY (users.id)` | User reference. |
| `role_id` | `INTEGER` | `FOREIGN KEY (roles.id)` | Role reference. |

Default roles are initialized as `ROLE_USER` and `ROLE_ADMIN`. A default administrator is created at startup when no matching user exists:

```text
Email: admin@example.com
Password: admin123
```

## 4. Backend Design

The backend package root is:

```text
com.mycompany.saas
```

Current package responsibilities:

```text
com.mycompany.saas
|-- config/
|   |-- DataInitializer.java      // Default roles and administrator account
|   |-- SecurityConfig.java       // Spring Security, JWT filter, CORS, public routes
|   `-- WebConfig.java            // MVC CORS configuration
|-- controller/
|   |-- AuthController.java       // Login and registration endpoints
|   `-- DataController.java       // Protected example endpoints
|-- dto/
|   |-- AuthDto.java              // Login request DTO
|   |-- TokenDto.java             // JWT response DTO
|   `-- UserDto.java              // Registration request DTO
|-- exception/
|   |-- EmailAlreadyExistsException.java
|   `-- GlobalExceptionHandler.java
|-- model/
|   |-- Role.java
|   `-- User.java
|-- repository/
|   |-- RoleRepository.java
|   `-- UserRepository.java
|-- security/
|   |-- JwtAuthFilter.java
|   `-- TokenProvider.java
`-- service/
    |-- AuthService.java
    `-- CustomUserDetailsService.java
```

### API Endpoints

| Method | Route | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registers a new user with `ROLE_USER`. | Public |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT. | Public |
| `GET` | `/api/data/user` | Returns protected user data. | Requires `ROLE_USER` or `ROLE_ADMIN` |
| `GET` | `/api/data/admin` | Returns protected administrator data. | Requires `ROLE_ADMIN` |

### Authentication Flow

1. The client sends `email` and `password` to `POST /api/auth/login`.
2. `AuthService` delegates credential validation to Spring Security through `AuthenticationManager`.
3. When credentials are valid, `TokenProvider` generates a signed JWT.
4. The JWT uses the email as the subject and includes authorities in the `roles` claim.
5. The client sends the token on protected requests as `Authorization: Bearer <token>`.
6. `JwtAuthFilter` extracts and validates the token before controller execution.
7. When the token is valid, the filter loads the user and populates `SecurityContextHolder`.

### Security and CORS

The security chain is stateless and CSRF is disabled because the API uses bearer tokens instead of server-side sessions. The following routes are public:

- `/api/auth/**`
- `/api/public/**`
- `/error`
- `OPTIONS` requests, including CORS preflight requests

CORS currently allows:

- `http://localhost:3000`
- `http://localhost:5173`

### Error Handling

`GlobalExceptionHandler` returns structured JSON responses for known API errors. For example, duplicate registration emails return `409 Conflict`:

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Email already exists: user@example.com",
  "path": "/api/auth/register"
}
```

Unsupported HTTP methods return `405 Method Not Allowed` with a clear message.

## 5. Frontend Design

The React application provides public authentication pages and a protected dashboard route.

```text
src/
|-- components/
|   |-- Button.jsx
|   |-- Input.jsx
|   `-- PrivateRoute.jsx
|-- context/
|   `-- AuthContext.jsx
|-- pages/
|   |-- DashboardPage.jsx
|   |-- LoginPage.jsx
|   `-- RegisterPage.jsx
|-- services/
|   `-- authService.js
|-- App.jsx
|-- index.css
`-- main.jsx
```

### Routing and State

- Public routes: `/login`, `/register`
- Protected route: `/dashboard`
- `PrivateRoute` redirects unauthenticated users to `/login`
- `AuthContext` stores authentication state, current user data, loading state, and errors
- The token is persisted in `localStorage`

### API Communication

`authService.js` creates an Axios instance with the API base URL `http://localhost:8080/api`. It attaches `Authorization: Bearer <token>` automatically when a token is present.

## 6. Operational Notes

The repository includes two Docker Compose files:

- `docker-compose.yml`: Runs PostgreSQL, backend, and frontend.
- `docker-compose-backend-only.yml`: Runs PostgreSQL and backend only.

The backend Dockerfile copies the built JAR from `auth-backend/target`, so the backend must be packaged before rebuilding the image:

```bash
cd auth-backend
./mvnw package -DskipTests
cd ..
docker compose -f docker-compose-backend-only.yml up -d --build backend
```

## 7. Known Follow-Up Items

- Avoid returning password hashes in registration responses by introducing a response DTO.
- Align the registration response with the frontend authentication flow, either by returning a token after registration or by redirecting users to login.
- Move JWT secrets and database passwords to environment-specific secret management for production.

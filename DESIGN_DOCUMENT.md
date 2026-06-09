# Design Proposal: JWT Authentication System

This document details the architecture for a complete authentication solution using a Spring Boot backend, a React frontend, and a PostgreSQL database. Authentication will be based on JSON Web Tokens (JWT).

## 1. Architecture Overview

The solution will be divided into three main components:

1.  **Frontend (React)**: A Single-Page Application (SPA) responsible for the user interface. It will manage login and registration forms, store the JWT securely, and send it with each request to protected routes.
2.  **Backend (Spring Boot API)**: A RESTful API that exposes endpoints for registration, authentication, and resource access. It will validate credentials, generate and validate JWTs, and protect endpoints.
3.  **Database (PostgreSQL)**: A relational database for persisting user information, such as name, email, password (hash), and access roles.

The basic communication flow will be:

```
[React Frontend] <--- (HTTP/S) ---> [Spring Boot API Backend] <--- (JDBC) ---> [PostgreSQL Database]
```

---

## 2. Technology Stack

*   **Backend**:
    *   Java 17+
    *   Spring Boot 3.x
    *   Spring Security 6.x
    *   Spring Data JPA
    *   Hibernate
    *   JJWT (Java JWT library)
    *   PostgreSQL Driver
    *   Maven or Gradle (Dependency manager)
*   **Frontend**:
    *   React 18+
    *   React Router DOM (for routing)
    *   Axios (for HTTP requests)
    *   Vite or Create React App (for project setup)
*   **Database**:
    *   PostgreSQL 14+

---

## 3. Database Design (PostgreSQL)

We suggest a simple structure with two main tables to manage users and their roles, which gives us flexibility for access control (RBAC - Role-Based Access Control).

#### Table: `users`

Stores the user's main information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique user identifier. |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | User's first name. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | User's last name. |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | User email, used for login. |
| `password` | `VARCHAR(255)` | `NOT NULL` | User password, stored as a hash (e.g., bcrypt). |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record creation date and time. |

#### Table: `roles`

Stores the different roles or profiles a user can have.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY` | Unique role identifier (e.g., 1=ADMIN, 2=USER). |
| `name` | `VARCHAR(50)` | `NOT NULL, UNIQUE`| Role name (e.g., 'ROLE_ADMIN', 'ROLE_USER'). |

#### Junction Table: `user_roles`

Associates users with their respective roles (Many-to-Many relationship).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `BIGINT` | `FOREIGN KEY (users.id)` | Foreign key to the `users` table. |
| `role_id` | `INTEGER` | `FOREIGN KEY (roles.id)` | Foreign key to the `roles` table. |

---

## 4. Backend Design (Spring Boot API)

The API will be structured into packages to separate responsibilities, following Spring best practices.

#### Implemented Package Structure:

```
com.mycompany.saas
├── Application.java             // Spring Boot application entry point
├── config/
│   ├── SecurityConfig.java      // Spring Security configuration (filters, public/private routes)
│   ├── WebConfig.java           // CORS configuration
│   └── DataInitializer.java     // Seeds default roles and the development admin user
├── controller/
│   ├── AuthController.java      // Login and registration endpoints
│   └── DataController.java      // Example endpoints for protected routes
├── dto/
│   ├── AuthDto.java             // DTO for login request (email, password)
│   ├── UserDto.java             // DTO for registration request
│   └── TokenDto.java            // DTO for response with the JWT
├── model/
│   ├── User.java                // JPA entity for the 'users' table
│   └── Role.java                // JPA entity for the 'roles' table
├── repository/
│   ├── UserRepository.java      // Spring Data JPA Repository for User
│   └── RoleRepository.java      // Spring Data JPA Repository for Role
├── security/
│   ├── TokenProvider.java       // Class to generate, validate, and extract JWT information
│   └── JwtAuthFilter.java       // Filter that intercepts requests and validates the JWT
├── exception/
│   ├── EmailAlreadyExistsException.java // Domain exception for duplicate registrations
│   └── GlobalExceptionHandler.java      // Centralized REST error responses
└── service/
    ├── AuthService.java         // Business logic for authentication and registration
    └── CustomUserDetailsService.java // Implementation of Spring Security's UserDetailsService
```

#### API Endpoints:

| Method | Route | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registers a new user. | Public |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT. | Public |
| `GET` | `/api/data/user` | Example route that returns data for any authenticated user. | Requires `ROLE_USER` or `ROLE_ADMIN` |
| `GET` | `/api/data/admin` | Example route that returns data only for administrators. | Requires `ROLE_ADMIN` |

#### Authentication Flow (JWT):

1.  **Login**: The user sends `email` and `password` to `POST /api/auth/login`.
2.  **Validation**: `AuthService` uses Spring Security's `AuthenticationManager` to validate the credentials. The submitted password is compared with the hash stored in the database.
3.  **JWT Generation**: If the credentials are valid, `TokenProvider` generates a JWT.
    *   **JWT Payload**: It will contain information such as `sub` (subject, user's email), `roles` (access roles), `iat` (issued at), and `exp` (expiration time).
    *   **Signature**: The token will be signed with a secret key configured in `application.properties` to guarantee its integrity.
4.  **Response**: The API returns the JWT to the client.
5.  **Subsequent Requests**: The client (React) attaches the JWT to the `Authorization` header of each request to protected routes (e.g., `Authorization: Bearer <jwt>`).
6.  **Security Filter**: `JwtAuthFilter` intercepts the request, extracts the token from the header, and validates its signature and expiration using `TokenProvider`.
7.  **Authorization**: If the token is valid, the filter extracts the user information and configures Spring's `SecurityContextHolder`, allowing the request to proceed to the protected controller. If the token is invalid, the API returns a `401 Unauthorized` error.

#### Current Backend Implementation Notes:

*   **Application entry point**: The Spring Boot bootstrap class is `com.mycompany.saas.Application`.
*   **Security mode**: The API is stateless (`SessionCreationPolicy.STATELESS`), disables CSRF for API usage, and installs `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`.
*   **Public routes**: `/api/auth/**`, `/api/public/**`, `/error`, and all `OPTIONS` requests are permitted without authentication.
*   **Method-level authorization**: `@EnableMethodSecurity(prePostEnabled = true)` is enabled so controllers can use `@PreAuthorize` for role checks.
*   **CORS**: The backend allows credentialed requests from `http://localhost:3000` and `http://localhost:5173`, matching common React development ports.
*   **Password hashing**: Passwords are encoded with `BCryptPasswordEncoder`.
*   **JWT settings**: `app.jwt.secret` and `app.jwt.expiration-ms` are configured in `application.properties`; the current expiration is `86400000` ms (24 hours).
*   **Default data**: `DataInitializer` creates `ROLE_USER`, `ROLE_ADMIN`, and a development admin user (`admin@example.com` / `admin123`) when they are missing.
*   **Registration behavior**: New registered users receive `ROLE_USER` by default. Duplicate emails raise `EmailAlreadyExistsException`.
*   **Error responses**: `GlobalExceptionHandler` returns structured JSON errors with `timestamp`, `status`, `error`, `message`, and `path`.

---

## 5. Frontend Design (React)

The frontend will be organized to be scalable and easy to maintain.

#### Suggested Folder Structure:

```
src/
├── components/         // Reusable components (Button, Input, etc.)
├── pages/              // Page components (Login, Register, Dashboard)
├── services/           // API communication logic (authService.js)
├── context/            // React context for authentication state management
├── hooks/              // Custom hooks (e.g., useAuth)
├── utils/              // Utility functions
└── App.js              // Main component with the routes
```

#### Navigation and State Flow:

1.  **Routing**: `react-router-dom` will be used to manage routes.
    *   **Public Routes**: `/login`, `/register`. Accessible to everyone.
    *   **Private Routes**: `/dashboard`, `/profile`. Accessible only to authenticated users. A `PrivateRoute` component will check whether the user is logged in; otherwise, it will redirect to `/login`.
2.  **Authentication State Management**:
    *   An `AuthContext` will be created to provide authentication state (user, token, login status) to the whole application.
    *   `AuthContext` will also expose functions such as `login(email, password)`, `register(...)`, and `logout()`.
3.  **JWT Storage**: After a successful login, the JWT returned by the API will be stored in the browser's `localStorage` or `sessionStorage`.
    *   `localStorage`: Persists the login across browser sessions.
    *   `sessionStorage`: The login is lost when the tab is closed.
4.  **API Communication**:
    *   `axios` will be used for all HTTP calls.
    *   An `axios` instance will be configured with an *interceptor*. This interceptor will automatically attach the `Authorization: Bearer <jwt>` header to all requests, reading the token from `localStorage`.
    *   The interceptor can also handle `401 Unauthorized` errors (e.g., expired token), automatically logging the user out and redirecting them to the login page.

#### Main Components:

*   **`LoginPage.js`**: Form with email and password fields. On submit, it calls the `AuthContext` `login` function.
*   **`RegisterPage.js`**: Form with name, email, and password fields. On submit, it calls the `register` function.
*   **`DashboardPage.js`**: Example protected page that fetches and displays API data (`/api/data/user`).
*   **`App.js`**: Defines the application routes using `<Routes>` and `<Route>`, wrapping private routes with the `PrivateRoute` component.
*   **`AuthProvider.js`**: Component that implements `AuthContext`, containing all authentication state logic.

---

## 6. Next Steps

With this design approved, implementation can start in the following order:

1.  **Environment Setup**: Install PostgreSQL, configure Java/Maven and Node.js/npm.
2.  **Backend**:
    *   Create the Spring Boot project.
    *   Configure the database connection.
    *   Implement the JPA entities (`User`, `Role`).
    *   Implement the repositories, DTOs, and `TokenProvider`.
    *   Configure `Spring Security` with the JWT filter.
    *   Create the controllers and services for `register` and `login`.
    *   Create the example protected endpoints.
3.  **Frontend**:
    *   Create the React project.
    *   Structure the folders.
    *   Implement `AuthContext` and `AuthProvider`.
    *   Configure `axios` with the interceptor.
    *   Create the `Login`, `Registration`, and `Dashboard` pages.
    *   Configure routing with `react-router-dom`, including private routes.
4.  **Testing and Refinement**: Test the complete flow, refine the UI/UX, and ensure error handling is robust.

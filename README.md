# Auth API

JWT authentication sample application with a Spring Boot backend, React frontend, and PostgreSQL database.

For architecture and implementation details, see [DESIGN_DOCUMENT.md](DESIGN_DOCUMENT.md).

## Project Structure

```text
.
|-- auth-backend/                 # Spring Boot API
|-- auth-frontend/                # React application
|-- docker-compose.yml            # Database, backend, and frontend
|-- docker-compose-backend-only.yml
`-- DESIGN_DOCUMENT.md
```

## Requirements

- Docker and Docker Compose
- Java 21, when building the backend locally
- Node.js and npm, when running the frontend locally

## Run the Backend Only

Build the backend JAR first, because the Dockerfile copies the packaged artifact from `target/`.

```bash
cd auth-backend
./mvnw package -DskipTests
cd ..
docker compose -f docker-compose-backend-only.yml up -d --build backend
```

The backend will be available at:

```text
http://localhost:8080
```

PostgreSQL will be available at:

```text
localhost:5432
```

## Run the Full Stack

```bash
cd auth-backend
./mvnw package -DskipTests
cd ..
docker compose up -d --build
```

The frontend will be available at:

```text
http://localhost:3000
```

## Run Locally Without Docker

Start PostgreSQL with the database settings used by `application.properties`:

```text
Database: auth_db
User: postgres
Password: password
Port: 5432
```

Start the backend:

```bash
cd auth-backend
./mvnw spring-boot:run
```

Start the frontend:

```bash
cd auth-frontend
npm install
npm run dev
```

The Vite development server usually runs at:

```text
http://localhost:5173
```

## Default Admin User

The backend creates a default administrator account when it does not already exist:

```text
Email: admin@example.com
Password: admin123
```

## API Endpoints

### Register

```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"John","lastName":"Smith","email":"john@example.com","password":"123456"}'
```

Successful registration returns `201 Created`.

Duplicate email registration returns `409 Conflict` with a JSON message:

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Email already exists: john@example.com",
  "path": "/api/auth/register"
}
```

### Login

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

The response includes a JWT:

```json
{
  "token": "<jwt>"
}
```

### Protected User Data

```bash
curl -i http://localhost:8080/api/data/user \
  -H "Authorization: Bearer <jwt>"
```

### Protected Admin Data

```bash
curl -i http://localhost:8080/api/data/admin \
  -H "Authorization: Bearer <jwt>"
```

## Tests

Run backend tests:

```bash
cd auth-backend
./mvnw test
```

Build the frontend:

```bash
cd auth-frontend
npm run build
```

## Notes

- Public backend routes are `/api/auth/**`, `/api/public/**`, `/error`, and `OPTIONS` requests.
- CORS allows `http://localhost:3000` and `http://localhost:5173`.
- Protected requests must include `Authorization: Bearer <jwt>`.

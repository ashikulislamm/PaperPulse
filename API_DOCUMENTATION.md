# 📑 PaperPulse REST API Documentation & Swagger Guide

Welcome to the official REST API Reference manual for **PaperPulse Academic Workspace & Submission Studio**.

The backend is engineered with **ASP.NET Core 10 Web API**, adhering strictly to Clean Architecture, CQRS pattern via MediatR, PostgreSQL ORM via Entity Framework Core 10, JWT Access Token Authentication, and Role/Permission-Based Authorization.

---

## 📌 Interactive OpenAPI / Swagger UI

When running the backend server locally or in staging, interactive OpenAPI documentation with live endpoint testing is available at:

```
http://localhost:5109/swagger
```

### Authorization Guide for Swagger UI
1. Execute a `POST /api/v1/auth/login` request with pre-seeded demo credentials.
2. Copy the `accessToken` string from the JSON response object.
3. Click the **Authorize 🔓** button at the top right of the Swagger UI.
4. Enter `Bearer YOUR_ACCESS_TOKEN` into the Value input field and click **Authorize**.
5. All protected endpoints are now authorized for interactive testing directly within Swagger UI!

---

## 🔑 Authentication & Headers

- **Base Endpoint URL**: `http://localhost:5109/api/v1`
- **Content-Type**: `application/json`
- **Authorization Header**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### Pre-Seeded Demo Credentials

| Role | Email | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@paperpulse.com` | `AdminPass123!` | System Administration, User Provisioning, Audit Logs |
| **Teacher** | `teacher@paperpulse.com` | `TeacherPass123!` | Assignment Authoring, Publishing, Evaluation & Grading |
| **Student** | `student@paperpulse.com` | `StudentPass123!` | Student Task Feed, Submission Uploads, Version History |

---

## 📑 Complete API Endpoints & Request/Response Formats

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /api/v1/auth/login`
- **Description**: Authenticate user credentials and issue 7-day JWT access token.
- **Auth Required**: ❌ No

**Request Body**:
```json
{
  "email": "student@paperpulse.com",
  "password": "StudentPass123!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "8f3b2a1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "expiresAt": "2026-08-18T09:00:00Z",
    "user": {
      "id": "018f4a2b-8910-7400-8000-000000000003",
      "email": "student@paperpulse.com",
      "firstName": "Alex",
      "lastName": "Johnson",
      "phoneNumber": "+15551234567",
      "avatarUrl": "https://example.com/avatar.jpg",
      "roles": ["Student"]
    }
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

#### `POST /api/v1/auth/register`
- **Description**: Register a new student or teacher user account.
- **Auth Required**: ❌ No

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@paperpulse.com",
  "password": "Password123!",
  "role": "Student"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully.",
  "data": {
    "id": "018f4a2b-8910-7400-8000-000000000099",
    "email": "jane.doe@paperpulse.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "roles": ["Student"]
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

#### `GET /api/v1/auth/me`
- **Description**: Retrieve active authenticated user session metadata.
- **Auth Required**: 🔒 Yes

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User details retrieved.",
  "data": {
    "id": "018f4a2b-8910-7400-8000-000000000003",
    "email": "student@paperpulse.com",
    "firstName": "Alex",
    "lastName": "Johnson",
    "roles": ["Student"],
    "permissions": ["assignments.view", "submissions.create", "submissions.view"]
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

### 2. User Profile Management (`/api/v1/profile`)

#### `GET /api/v1/profile`
- **Description**: Retrieve current user profile details.
- **Auth Required**: 🔒 Yes

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": "018f4a2b-8910-7400-8000-000000000003",
    "email": "student@paperpulse.com",
    "firstName": "Alex",
    "lastName": "Johnson",
    "phoneNumber": "+15551234567",
    "avatarUrl": "https://example.com/avatar.jpg",
    "roles": ["Student"]
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

#### `PUT /api/v1/profile`
- **Description**: Update profile details (First Name, Last Name, Phone Number, Avatar URL).
- **Auth Required**: 🔒 Yes

**Request Body**:
```json
{
  "firstName": "Alexander",
  "lastName": "Johnson",
  "phoneNumber": "+15559876543",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully.",
  "data": {
    "id": "018f4a2b-8910-7400-8000-000000000003",
    "email": "student@paperpulse.com",
    "firstName": "Alexander",
    "lastName": "Johnson",
    "phoneNumber": "+15559876543",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "roles": ["Student"]
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

### 3. User Administration (`/api/v1/users`) — Admin Role Required

#### `GET /api/v1/users`
- **Description**: Paginated search and role/status filtering for system users.
- **Auth Required**: 🔒 Admin
- **Query Parameters**: `search`, `role`, `status`, `pageNumber`, `pageSize`

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully.",
  "data": {
    "items": [
      {
        "id": "018f4a2b-8910-7400-8000-000000000001",
        "email": "admin@paperpulse.com",
        "firstName": "Sarah",
        "lastName": "Conner",
        "status": "Active",
        "roles": ["Admin"]
      },
      {
        "id": "018f4a2b-8910-7400-8000-000000000002",
        "email": "teacher@paperpulse.com",
        "firstName": "Dr. Robert",
        "lastName": "Vance",
        "status": "Active",
        "roles": ["Teacher"]
      }
    ],
    "totalCount": 2,
    "pageNumber": 1,
    "pageSize": 10
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

### 4. Assignment Management (`/api/v1/assignments`)

#### `GET /api/v1/assignments`
- **Description**: Fetch authored assignments list filtered by status (`Draft`, `Published`, `Closed`).
- **Auth Required**: 🔒 Yes

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignments retrieved successfully.",
  "data": {
    "items": [
      {
        "id": "018f4a2b-8910-7500-8000-000000000001",
        "title": "Calculus Problem Set #4 — Derivatives",
        "description": "Complete Chapter 4 exercises covering implicit differentiation and chain rule.",
        "status": "Published",
        "maxMarks": 100,
        "passMarks": 40,
        "dueDate": "2026-08-20T23:59:59Z",
        "teacherName": "Dr. Robert Vance",
        "className": "Grade 10-A",
        "subjectName": "Mathematics"
      }
    ],
    "totalCount": 1,
    "pageNumber": 1,
    "pageSize": 10
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

### 5. Student Workspace & Submissions (`/api/v1/student` & `/api/v1/submissions`)

#### `GET /api/v1/student/assignments`
- **Description**: Enrolled student assignment feed with status indicators.
- **Auth Required**: 🔒 Student

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Student feed retrieved.",
  "data": {
    "items": [
      {
        "assignmentId": "018f4a2b-8910-7500-8000-000000000001",
        "title": "Calculus Problem Set #4 — Derivatives",
        "description": "Solve Chapter 4 exercises.",
        "subjectName": "Mathematics",
        "className": "Grade 10-A",
        "dueDate": "2026-08-20T23:59:59Z",
        "submissionStatus": "Pending",
        "hasSubmission": false
      }
    ],
    "totalCount": 1
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

#### `POST /api/v1/submissions`
- **Description**: Submit solution file/notes for an assignment (Creates Version 1).
- **Auth Required**: 🔒 Student

**Request Body**:
```json
{
  "assignmentId": "018f4a2b-8910-7500-8000-000000000001",
  "submissionText": "Attached PDF containing step-by-step calculus proofs.",
  "attachments": [
    {
      "fileName": "Calculus_Solution_v1.pdf",
      "filePath": "/uploads/submissions/calculus_v1.pdf",
      "mimeType": "application/pdf",
      "fileSizeBytes": 1540000
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Assignment submitted successfully.",
  "data": {
    "id": "018f4a2b-8910-7600-8000-000000000001",
    "assignmentId": "018f4a2b-8910-7500-8000-000000000001",
    "assignmentTitle": "Calculus Problem Set #4 — Derivatives",
    "studentId": "018f4a2b-8910-7400-8000-000000000003",
    "studentName": "Alex Johnson",
    "submittedAt": "2026-08-11T09:00:00Z",
    "status": "Submitted",
    "attemptCount": 1,
    "versions": [
      {
        "id": "018f4a2b-8910-7700-8000-000000000001",
        "versionNumber": 1,
        "content": "Attached PDF containing step-by-step calculus proofs.",
        "submittedAt": "2026-08-11T09:00:00Z",
        "isLate": false
      }
    ]
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

### 6. Role Analytics & Dashboard Endpoints (`/api/v1/dashboard`)

#### `GET /api/v1/dashboard/student`
- **Auth Required**: 🔒 Student

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard data retrieved.",
  "data": {
    "pendingAssignmentsCount": 1,
    "submittedAssignmentsCount": 1,
    "gradedAssignmentsCount": 1,
    "overdueAssignmentsCount": 0,
    "averageGradePercentage": 90.0
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

---

### 7. System Health Check (`/api/v1/health`)

#### `GET /api/v1/health`
- **Description**: Public server health, database connectivity, and runtime metrics.
- **Auth Required**: ❌ No

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "System operational.",
  "data": {
    "status": "Healthy",
    "database": "Connected (PostgreSQL)",
    "environment": "Development",
    "timestamp": "2026-08-11T09:00:00Z"
  },
  "timestamp": "2026-08-11T09:00:00Z"
}
```

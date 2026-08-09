# 📑 PaperPulse REST API Documentation & Postman Testing Reference

Welcome to the comprehensive, production-grade **PaperPulse REST API Reference Manual**. This document provides detailed, end-to-end documentation for **all 52 API Endpoints** implemented across the 12 backend controllers.

Each endpoint includes:
- **HTTP Method & Exact Route Path**
- **Authorization Requirements** (`Bearer Token` & Required Role/Permission)
- **Route & Query Parameters**
- **Complete JSON Request Body Schema & Example**
- **Complete JSON Response Body Schema & Example**
- **Error Codes & Conditions**

---

## 🛠️ Global Configuration & Headers

### Base URL
- **Local Environment**: `http://localhost:5000/api/v1` or `https://localhost:7001/api/v1`
- **Render Deployment**: `https://paperpulse-backend.onrender.com/api/v1`

### Mandatory Request Headers
| Header Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `Content-Type` | **Yes** (for Body requests) | `application/json` | Format for JSON payloads |
| `Authorization` | **Yes** (for Protected routes) | `Bearer eyJhbGciOi...` | Standard Bearer JWT Access Token |

---

## 🔑 Section 1: Authentication (`/api/v1/auth`)

### 1.1 Register New Account
- **HTTP Method**: `POST`
- **Route**: `/api/v1/auth/register`
- **Authorization**: Public (No Auth required)
- **Request Body**:
  ```json
  {
    "email": "student1@paperpulse.com",
    "password": "Password123!",
    "firstName": "Alex",
    "lastName": "Rivera",
    "phoneNumber": "+15550192834",
    "role": "Student"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "statusCode": 201,
    "data": {
      "token": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "7kQ9zXmP...",
      "expiresAt": "2026-08-09T00:00:00Z",
      "user": {
        "id": "e4f8a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
        "email": "student1@paperpulse.com",
        "firstName": "Alex",
        "lastName": "Rivera",
        "phoneNumber": "+15550192834",
        "status": "Active",
        "mustChangePassword": false,
        "tenantId": "11111111-1111-1111-1111-111111111111",
        "roles": ["Student"]
      }
    }
  }
  ```

---

### 1.2 User Login
- **HTTP Method**: `POST`
- **Route**: `/api/v1/auth/login`
- **Authorization**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@paperpulse.com",
    "password": "PaperPulse@Admin123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "statusCode": 200,
    "data": {
      "token": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "a9b8c7d6...",
      "expiresAt": "2026-08-09T00:00:00Z",
      "user": {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "admin@paperpulse.com",
        "firstName": "System",
        "lastName": "Admin",
        "status": "Active",
        "mustChangePassword": false,
        "tenantId": "11111111-1111-1111-1111-111111111111",
        "roles": ["Admin"]
      }
    }
  }
  ```

---

### 1.3 Refresh Access Token
- **HTTP Method**: `POST`
- **Route**: `/api/v1/auth/refresh`
- **Authorization**: Public
- **Request Body**:
  ```json
  {
    "refreshToken": "a9b8c7d6..."
  }
  ```
- **Response (200 OK)**: Issues new Access Token and rotated Refresh Token.

---

### 1.4 User Logout
- **HTTP Method**: `POST`
- **Route**: `/api/v1/auth/logout`
- **Authorization**: `Bearer Token`
- **Request Body** (Optional):
  ```json
  {
    "refreshToken": "a9b8c7d6..."
  }
  ```
- **Response (200 OK)**: Revokes active session refresh token.

---

### 1.5 Get Current Authenticated User Token Details
- **HTTP Method**: `GET`
- **Route**: `/api/v1/auth/me`
- **Authorization**: `Bearer Token`
- **Response (200 OK)**: Returns authenticated `UserDto`.

---

## 👤 Section 2: Profile Management (`/api/v1/profile`)

### 2.1 Get Authenticated Profile
- **HTTP Method**: `GET`
- **Route**: `/api/v1/profile`
- **Authorization**: `Bearer Token` (`[Authorize]`)
- **Response (200 OK)**: Returns full `UserDto` profile.

---

### 2.2 Update Profile Information
- **HTTP Method**: `PUT`
- **Route**: `/api/v1/profile`
- **Authorization**: `Bearer Token`
- **Request Body**:
  ```json
  {
    "firstName": "Alex",
    "lastName": "Rivera",
    "phoneNumber": "+15559998877",
    "avatarUrl": "https://cdn.paperpulse.com/avatars/alex.png"
  }
  ```
- **Response (200 OK)**: Returns updated `UserDto`.

---

### 2.3 Change Password
- **HTTP Method**: `POST`
- **Route**: `/api/v1/profile/change-password`
- **Authorization**: `Bearer Token`
- **Request Body**:
  ```json
  {
    "currentPassword": "Password123!",
    "newPassword": "NewSecurePassword456!"
  }
  ```
- **Response (200 OK)**: Sets `mustChangePassword = false` and revokes active refresh tokens.

---

## 👥 Section 3: Admin User Management (`/api/v1/users`)

### 3.1 Search & Paginate System Users
- **HTTP Method**: `GET`
- **Route**: `/api/v1/users`
- **Authorization**: `Bearer Token` (Permission: `Users.View`)
- **Query Parameters**:
  - `search` (string, optional): Search by Name or Email.
  - `role` (string, optional): Filter by `Admin`, `Teacher`, `Student`.
  - `status` (string, optional): Filter by `Active`, `Inactive`, `Suspended`.
  - `pageNumber` (int, default: 1)
  - `pageSize` (int, default: 10)
  - `sortBy` (string, default: "CreatedAt")
  - `isDescending` (bool, default: true)
- **Response (200 OK)**: `PagedResult<UserDto>`

---

### 3.2 Get User by ID
- **HTTP Method**: `GET`
- **Route**: `/api/v1/users/{id}`
- **Authorization**: `Bearer Token` (Permission: `Users.View`)

---

### 3.3 Admin Create User (With Mandatory Initial Password Change)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/users`
- **Authorization**: `Bearer Token` (Permission: `Users.Create`)
- **Request Body**:
  ```json
  {
    "email": "teacher1@paperpulse.com",
    "password": "InitialTeacherPassword123!",
    "firstName": "Sarah",
    "lastName": "Connor",
    "phoneNumber": "+15553334444",
    "roles": ["Teacher"]
  }
  ```
- **Response (201 Created)**: Returns created user with `mustChangePassword: true`.

---

### 3.4 Update User Details
- **HTTP Method**: `PUT`
- **Route**: `/api/v1/users/{id}`
- **Authorization**: `Bearer Token` (Permission: `Users.Update`)
- **Request Body**:
  ```json
  {
    "id": "e4f8a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
    "email": "sarah.connor@paperpulse.com",
    "firstName": "Sarah",
    "lastName": "Connor",
    "phoneNumber": "+15553334444"
  }
  ```

---

### 3.5 Delete User (Soft Delete)
- **HTTP Method**: `DELETE`
- **Route**: `/api/v1/users/{id}`
- **Authorization**: `Bearer Token` (Permission: `Users.Delete`)

---

### 3.6 Activate User Account
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/users/{id}/activate`
- **Authorization**: `Bearer Token` (Permission: `Users.Activate`)

---

### 3.7 Deactivate User Account
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/users/{id}/deactivate`
- **Authorization**: `Bearer Token` (Permission: `Users.Deactivate`)

---

### 3.8 Ban / Suspend User Account
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/users/{id}/ban`
- **Authorization**: `Bearer Token` (Permission: `Users.Deactivate`)
- **Request Body** (Optional string): `"Violation of academic integrity"`

---

### 3.9 Assign User Roles
- **HTTP Method**: `POST`
- **Route**: `/api/v1/users/{id}/roles`
- **Authorization**: `Bearer Token` (Permission: `Roles.Assign`)
- **Request Body**:
  ```json
  ["Teacher", "Admin"]
  ```

---

## 📝 Section 4: Assignment Management (`/api/v1/assignments`)

### 4.1 Search & List Assignments
- **HTTP Method**: `GET`
- **Route**: `/api/v1/assignments`
- **Authorization**: `Bearer Token` (Permission: `Assignments.View`)
- **Query Parameters**:
  - `search` (string, optional)
  - `status` (string, optional): `Draft`, `Published`, `Closed`, `Archived`
  - `teacherAssignmentId` (Guid, optional)
  - `classId` (Guid, optional)
  - `subjectId` (Guid, optional)
  - `pageNumber` (int, default: 1)
  - `pageSize` (int, default: 10)

---

### 4.2 Get Assignment Details & Reference Attachments
- **HTTP Method**: `GET`
- **Route**: `/api/v1/assignments/{id}`
- **Authorization**: `Bearer Token` (Permission: `Assignments.Details`)

---

### 4.3 Create Assignment (Draft or Published)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/assignments`
- **Authorization**: `Bearer Token` (Permission: `Assignments.Create`)
- **Request Body**:
  ```json
  {
    "teacherAssignmentId": "b8a9c0d1-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
    "title": "Calculus Homework Set 2",
    "description": "Complete derivative problems 1 to 20 from chapter 4.",
    "maxMarks": 100,
    "passMarks": 50,
    "dueDate": "2026-08-20T23:59:59Z",
    "allowLateSubmission": true,
    "latePenaltyPercentage": 5.0,
    "status": "Draft"
  }
  ```

---

### 4.4 Update Assignment
- **HTTP Method**: `PUT`
- **Route**: `/api/v1/assignments/{id}`
- **Authorization**: `Bearer Token` (Permission: `Assignments.Update`)

---

### 4.5 Publish Assignment
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/assignments/{id}/publish`
- **Authorization**: `Bearer Token` (Permission: `Assignments.Publish`)

---

### 4.6 Close Assignment
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/assignments/{id}/close`
- **Authorization**: `Bearer Token` (Permission: `Assignments.Update`)

---

### 4.7 Archive Assignment
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/assignments/{id}/archive`
- **Authorization**: `Bearer Token` (Permission: `Assignments.Archive`)

---

### 4.8 Delete Assignment
- **HTTP Method**: `DELETE`
- **Route**: `/api/v1/assignments/{id}`
- **Authorization**: `Bearer Token` (Permission: `Assignments.Delete`)

---

## 👨‍🎓 Section 5: Student Assignment Experience (`/api/v1/student`)

### 5.1 Student Assigned Work Feed
- **HTTP Method**: `GET`
- **Route**: `/api/v1/student/assignments`
- **Authorization**: `Bearer Token` (Permission: `Assignments.View`)
- **Query Parameters**: `filter` (`Upcoming` | `Past` | `Submitted` | `Overdue`), `pageNumber`, `pageSize`.

---

### 5.2 Upcoming Deadlines Feed
- **HTTP Method**: `GET`
- **Route**: `/api/v1/student/deadlines`
- **Authorization**: `Bearer Token` (Permission: `Assignments.View`)

---

### 5.3 Student Grades Portal
- **HTTP Method**: `GET`
- **Route**: `/api/v1/student/grades`
- **Authorization**: `Bearer Token` (Permission: `Grades.View`)
- **Query Parameters**: `classId`, `subjectId`, `pageNumber`, `pageSize`.

---

## 📤 Section 6: Submission Engine & Version Control (`/api/v1/submissions`)

### 6.1 Submit Work for Assignment (Version 1)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/submissions`
- **Authorization**: `Bearer Token` (Permission: `Submissions.Create`)
- **Request Body**:
  ```json
  {
    "assignmentId": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
    "content": "Here is my final submission for Calculus Set 2."
  }
  ```

---

### 6.2 Update / Resubmit Work (Version 2+)
- **HTTP Method**: `PUT`
- **Route**: `/api/v1/submissions/{id}`
- **Authorization**: `Bearer Token` (Permission: `Submissions.Update`)
- **Request Body**:
  ```json
  {
    "submissionId": "f9e8d7c6-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
    "content": "Revised submission with corrected solution to problem 5."
  }
  ```

---

### 6.3 Get Submission Details & Version History
- **HTTP Method**: `GET`
- **Route**: `/api/v1/submissions/{id}`
- **Authorization**: `Bearer Token` (Permission: `Submissions.View`)

---

## 🎓 Section 7: Teacher Grading & Feedback Engine (`/api/v1/grading`)

### 7.1 List Submissions for Grading
- **HTTP Method**: `GET`
- **Route**: `/api/v1/grading/assignments/{assignmentId}/submissions`
- **Authorization**: `Bearer Token` (Permission: `Submissions.Review`)
- **Query Parameters**: `status` (`Submitted` | `LateSubmitted` | `Graded` | `Returned`), `pageNumber`, `pageSize`.

---

### 7.2 Get Submission Grading Detail Payload
- **HTTP Method**: `GET`
- **Route**: `/api/v1/grading/submissions/{submissionId}`
- **Authorization**: `Bearer Token` (Permission: `Submissions.Review`)

---

### 7.3 Grade Submission
- **HTTP Method**: `POST`
- **Route**: `/api/v1/grading/submissions/{submissionId}/grade`
- **Authorization**: `Bearer Token` (Permission: `Grades.Create`)
- **Request Body**:
  ```json
  {
    "submissionId": "f9e8d7c6-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
    "scoreObtained": 92.5,
    "comments": "Excellent presentation and accurate steps throughout.",
    "isPrivateFeedback": false
  }
  ```

---

### 7.4 Add Feedback Comment
- **HTTP Method**: `POST`
- **Route**: `/api/v1/grading/submissions/{submissionId}/feedback`
- **Authorization**: `Bearer Token` (Permission: `Feedback.Create`)
- **Request Body**:
  ```json
  {
    "submissionId": "f9e8d7c6-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
    "comments": "Private note for co-teacher review.",
    "isPrivate": true
  }
  ```

---

### 7.5 Return Graded Submission to Student
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/grading/submissions/{submissionId}/return`
- **Authorization**: `Bearer Token` (Permission: `Grades.Update`)

---

## 🔔 Section 8: Notifications Engine (`/api/v1/notifications`)

### 8.1 Get User In-App Notifications
- **HTTP Method**: `GET`
- **Route**: `/api/v1/notifications`
- **Authorization**: `Bearer Token` (`[Authorize]`)
- **Query Parameters**: `status` (`Unread` | `Read`), `pageNumber`, `pageSize`.

---

### 8.2 Get Unread Notification Count
- **HTTP Method**: `GET`
- **Route**: `/api/v1/notifications/unread-count`
- **Authorization**: `Bearer Token` (`[Authorize]`)
- **Response (200 OK)**: `{"unreadCount": 3}`

---

### 8.3 Mark Single Notification as Read
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/notifications/{id}/read`
- **Authorization**: `Bearer Token` (`[Authorize]`)

---

### 8.4 Mark All User Notifications as Read
- **HTTP Method**: `PATCH`
- **Route**: `/api/v1/notifications/read-all`
- **Authorization**: `Bearer Token` (`[Authorize]`)

---

### 8.5 Trigger Deadline Reminders Check
- **HTTP Method**: `POST`
- **Route**: `/api/v1/notifications/trigger-deadline-reminders`
- **Authorization**: `Bearer Token` (Permission: `Notifications.Send`)
- **Query Parameters**: `hoursThreshold` (default: 24)

---

## ⚙️ Section 9: System Background Jobs (`/api/v1/system/jobs`)

### 9.1 Trigger Auto-Close Assignments Job
- **HTTP Method**: `POST`
- **Route**: `/api/v1/system/jobs/auto-close-assignments`
- **Authorization**: `Bearer Token` (Permission: `Settings.Update`)

---

### 9.2 Trigger Refresh Token Cleanup Job
- **HTTP Method**: `POST`
- **Route**: `/api/v1/system/jobs/cleanup-tokens`
- **Authorization**: `Bearer Token` (Permission: `Settings.Update`)

---

### 9.3 Trigger Notification Housekeeping Job
- **HTTP Method**: `POST`
- **Route**: `/api/v1/system/jobs/cleanup-notifications`
- **Authorization**: `Bearer Token` (Permission: `Settings.Update`)
- **Query Parameters**: `retentionDays` (default: 30)

---

## 📊 Section 10: Dashboard & Analytics (`/api/v1/dashboard`)

### 10.1 Admin Dashboard Metrics
- **HTTP Method**: `GET`
- **Route**: `/api/v1/dashboard/admin`
- **Authorization**: `Bearer Token` (Permission: `Dashboard.View`)

---

### 10.2 Teacher Dashboard Metrics
- **HTTP Method**: `GET`
- **Route**: `/api/v1/dashboard/teacher`
- **Authorization**: `Bearer Token` (Permission: `Dashboard.View`)

---

### 10.3 Student Dashboard Metrics
- **HTTP Method**: `GET`
- **Route**: `/api/v1/dashboard/student`
- **Authorization**: `Bearer Token` (Permission: `Dashboard.View`)

---

## 🛡️ Section 11: Audit Logging (`/api/v1/audit-logs`)

### 11.1 Search & Filter Audit Logs
- **HTTP Method**: `GET`
- **Route**: `/api/v1/audit-logs`
- **Authorization**: `Bearer Token` (Permission: `AuditLogs.View`)
- **Query Parameters**: `search`, `action`, `entityName`, `userId`, `ipAddress`, `startDate`, `endDate`, `pageNumber`, `pageSize`.

---

### 11.2 High-Priority Security Audit Logs Feed
- **HTTP Method**: `GET`
- **Route**: `/api/v1/audit-logs/security`
- **Authorization**: `Bearer Token` (Permission: `AuditLogs.View`)

---

### 11.3 User Activity Audit Logs Feed
- **HTTP Method**: `GET`
- **Route**: `/api/v1/audit-logs/user/{userId}`
- **Authorization**: `Bearer Token` (Permission: `AuditLogs.View`)

---

### 11.4 Get Audit Log Record Details
- **HTTP Method**: `GET`
- **Route**: `/api/v1/audit-logs/{id}`
- **Authorization**: `Bearer Token` (Permission: `AuditLogs.View`)
- **Response (200 OK)**: Full detail including `oldValues` and `newValues` JSON.

---

## 🩺 Section 12: System Health Check (`/api/v1/health`)

### 12.1 System & Database Connectivity Health Status
- **HTTP Method**: `GET`
- **Route**: `/api/v1/health`
- **Authorization**: Public
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "System health check passed.",
    "statusCode": 200,
    "data": {
      "status": "Healthy",
      "database": "Connected",
      "timestamp": "2026-08-08T23:25:00Z",
      "environment": "Development"
    }
  }
  ```

---

## 🧪 Step-by-Step Postman Testing Blueprint

1. **Setup Collection**:
   - Set `baseUrl` = `http://localhost:5000/api/v1`.
2. **Login as Admin**: `POST {{baseUrl}}/auth/login` ➔ Extract `data.token`.
3. **Set Collection Auth**: Bearer Token `{{token}}`.
4. **Test Core Workflows**:
   - Create User (`POST /users`) ➔ Verify `mustChangePassword: true`.
   - Create Assignment (`POST /assignments`) ➔ Publish (`PATCH /assignments/{id}/publish`).
   - Student Submit Work (`POST /submissions`).
   - Teacher Grade Work (`POST /grading/submissions/{id}/grade`).
   - Check Notifications (`GET /notifications`).
   - Check Audit Logs (`GET /audit-logs/security`).

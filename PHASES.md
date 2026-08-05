# PaperPulse Backend Architecture

## 1. High-Level Architecture

```text
                         ┌─────────────────────────┐
                         │      Next.js Frontend    │
                         │         Web Client       │
                         └────────────┬────────────┘
                                      │
                                      │ HTTPS / REST
                                      ▼
                         ┌─────────────────────────┐
                         │     ASP.NET Core API    │
                         │      PaperPulse.API     │
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
             Authentication      Application       Middleware
             Authorization       Business Logic    Error Handling
             Swagger             Validation        Logging
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      Domain Layer       │
                         │   Business Rules/Model  │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     Infrastructure      │
                         │                         │
                         │ JWT                     │
                         │ Email                   │
                         │ Notifications            │
                         │ File Storage             │
                         │ Logging                  │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       Persistence       │
                         │       EF Core            │
                         │       PostgreSQL         │
                         └─────────────────────────┘
```

---

# 2. Project Structure

I recommend keeping your current 5-project architecture:

```text
PaperPulse/
│
├── backend/
│
│   ├── PaperPulse.sln
│   │
│   ├── PaperPulse.API/
│   │
│   ├── PaperPulse.Application/
│   │
│   ├── PaperPulse.Domain/
│   │
│   ├── PaperPulse.Infrastructure/
│   │
│   ├── PaperPulse.Persistence/
│   │
│   └── tests/
│       │
│       ├── PaperPulse.UnitTests/
│       │
│       └── PaperPulse.IntegrationTests/
│
├── frontend/
│
├── docker-compose.yml
│
└── docs/
```

I would **not** add additional projects right now.

This is enough for a strong portfolio project.

---

# 3. API Layer

```text
PaperPulse.API/

├── Controllers/
│
├── Middleware/
│
├── Extensions/
│
├── Filters/
│
├── Configurations/
│
├── Swagger/
│
├── Constants/
│
├── Properties/
│
├── Program.cs
│
├── appsettings.json
│
├── appsettings.Development.json
│
└── appsettings.Production.json
```

---

# 4. Controllers

Organize controllers around resources.

```text
Controllers/

├── AuthController.cs
│
├── UsersController.cs
│
├── RolesController.cs
│
├── ClassesController.cs
│
├── SubjectsController.cs
│
├── EnrollmentsController.cs
│
├── AssignmentsController.cs
│
├── SubmissionsController.cs
│
├── GradesController.cs
│
├── NotificationsController.cs
│
├── FilesController.cs
│
├── DashboardController.cs
│
└── HealthController.cs
```

Controllers should remain thin.

```text
Controller
    ↓
Application Service / Handler
    ↓
Domain Logic
    ↓
Repository
    ↓
Database
```

Don't put business logic inside controllers.

---

# 5. Application Architecture

The Application layer should be **feature-oriented**.

Instead of:

```text
Services/
Repositories/
DTOs/
Validators/
```

with hundreds of files mixed together, use:

```text
PaperPulse.Application/

├── Features/
│
│   ├── Authentication/
│   │
│   ├── Users/
│   │
│   ├── Roles/
│   │
│   ├── Classes/
│   │
│   ├── Subjects/
│   │
│   ├── Enrollments/
│   │
│   ├── Assignments/
│   │
│   ├── Submissions/
│   │
│   ├── Grades/
│   │
│   ├── Notifications/
│   │
│   └── Dashboard/
│
├── Common/
│
├── Interfaces/
│
├── Behaviors/
│
└── DependencyInjection/
```

---

# 6. Feature Architecture

For example:

```text
Features/
└── Assignments/

    ├── Commands/
    │
    │   ├── CreateAssignment/
    │   │   ├── CreateAssignmentCommand.cs
    │   │   ├── CreateAssignmentHandler.cs
    │   │   └── CreateAssignmentValidator.cs
    │   │
    │   ├── UpdateAssignment/
    │   │
    │   ├── DeleteAssignment/
    │   │
    │   └── PublishAssignment/
    │
    ├── Queries/
    │
    │   ├── GetAssignments/
    │   │
    │   ├── GetAssignmentById/
    │   │
    │   └── GetStudentAssignments/
    │
    ├── DTOs/
    │
    └── Mappings/
```

You can implement this using services instead of MediatR if you want to avoid unnecessary CQRS complexity.

For this assignment, I recommend:

```text
Controller
    ↓
Application Service
    ↓
Repository
```

with feature-based organization.

---

# 7. Domain Layer

```text
PaperPulse.Domain/

├── Entities/
│
├── Enums/
│
├── ValueObjects/
│
├── Events/
│
├── Exceptions/
│
├── Constants/
│
└── Common/
```

Core entities:

```text
User
Role
Permission
Class
Subject
TeacherClass
TeacherSubject
StudentClass
Assignment
AssignmentAttachment
Submission
SubmissionAttachment
Grade
Feedback
Notification
RefreshToken
AuditLog
```

---

# 8. Core Database Model

I recommend this relationship model.

```text
User
 │
 ├── Teacher
 │
 └── Student

Class
 │
 ├── Students
 │
 └── Teachers

Subject
 │
 ├── Teachers
 │
 └── Assignments

Assignment
 │
 ├── Subject
 ├── Class
 ├── Teacher
 ├── Attachments
 └── Submissions

Submission
 │
 ├── Student
 ├── Assignment
 ├── Files
 └── Grade

Grade
 │
 ├── Marks
 └── Feedback
```

---

# 9. Authentication Architecture

Use:

```text
JWT Access Token
+
Refresh Token
```

Recommended flow:

```text
Login
    ↓
Validate credentials
    ↓
Generate Access Token
    ↓
Generate Refresh Token
    ↓
Hash Refresh Token
    ↓
Store Refresh Token in DB
    ↓
Return Tokens
```

For security:

```text
Access Token
→ Short-lived

Refresh Token
→ Long-lived
→ Rotated
→ Revocable
```

Include:

```text
UserId
Email
Role
Permissions
```

in JWT claims where appropriate.

---

# 10. RBAC

Roles:

```text
ADMIN
TEACHER
STUDENT
```

Permissions:

```text
Users.Read
Users.Create
Users.Update
Users.Delete

Classes.Read
Classes.Create
Classes.Update
Classes.Delete

Subjects.Read
Subjects.Create
Subjects.Update
Subjects.Delete

Assignments.Read
Assignments.Create
Assignments.Update
Assignments.Delete
Assignments.Publish

Submissions.Read
Submissions.Create
Submissions.Update
Submissions.Review

Grades.Create
Grades.Update
Grades.Read
```

This allows you to demonstrate both:

```text
Role-Based Authorization
```

and:

```text
Permission-Based Authorization
```

---

# 11. Assignment Workflow

The assignment lifecycle should be:

```text
DRAFT
   │
   │ Publish
   ▼
PUBLISHED
   │
   │ Deadline reached
   ▼
CLOSED
```

Potential statuses:

```text
Draft
Published
Closed
Archived
```

A teacher can:

```text
Create
Update
Delete
Publish
View
```

But:

```text
Published Assignment
```

should have restrictions.

For example:

```text
Cannot change Class
Cannot change Subject
Cannot change Max Marks
```

depending on your business rules.

---

# 12. Submission Workflow

```text
Assignment Published
        │
        ▼
Student Views Assignment
        │
        ▼
Student Submits
        │
        ▼
SUBMITTED
        │
        ▼
Teacher Reviews
        │
        ▼
GRADED
```

Statuses:

```text
Draft
Submitted
Late
UnderReview
Graded
Returned
```

Business rules:

```text
Student can submit only if assignment is published.

Student cannot submit after deadline
unless late submission is allowed.

Student can update submission
before deadline.

Student cannot modify a graded submission.

Teacher can review submissions
only for their assigned class/subject.
```

These are excellent candidates for unit tests.

---

# 13. Pagination

Every list endpoint should support pagination.

Example:

```http
GET /api/assignments?page=1&pageSize=20
```

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

Default:

```text
page = 1
pageSize = 20
```

Maximum:

```text
pageSize = 100
```

Never allow:

```text
?pageSize=999999999
```

---

# 14. Advanced Filtering

Example:

```http
GET /api/assignments
    ?page=1
    &pageSize=20
    &search=database
    &subjectId=xxx
    &classId=xxx
    &status=Published
    &fromDate=2026-01-01
    &toDate=2026-12-31
    &sortBy=deadline
    &sortOrder=asc
```

Support:

```text
Search
Filtering
Sorting
Pagination
Date Range
Status
Class
Subject
Teacher
```

Create reusable infrastructure:

```text
PaginationRequest
PaginationResponse<T>

FilterRequest

SortRequest

PagedResult<T>
```

This is a good production-grade feature.

---

# 15. Global API Response

Standardize your API.

Success:

```json
{
  "success": true,
  "message": "Assignment created successfully.",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "title",
      "message": "Title is required."
    }
  ]
}
```

---

# 16. Global Exception Handling

Use centralized middleware.

```text
Exception
    ↓
GlobalExceptionMiddleware
    ↓
Log Exception
    ↓
Map Exception
    ↓
Return Standard API Response
```

Handle:

```text
ValidationException → 400

UnauthorizedException → 401

ForbiddenException → 403

NotFoundException → 404

ConflictException → 409

UnhandledException → 500
```

Never expose stack traces in production.

---

# 17. Notifications

Add a notification system.

Types:

```text
AssignmentPublished
AssignmentDeadlineApproaching
SubmissionReceived
SubmissionGraded
FeedbackAdded
```

Channels initially:

```text
In-App
```

Later:

```text
Email
Push Notification
```

Database:

```text
Notification

Id
UserId
Type
Title
Message
IsRead
CreatedAt
ReadAt
```

API:

```http
GET /api/notifications

GET /api/notifications/unread-count

PATCH /api/notifications/{id}/read

PATCH /api/notifications/read-all
```

---

# 18. Background Jobs

For notifications and scheduled tasks:

```text
BackgroundService
```

or later:

```text
Hangfire
```

Potential jobs:

```text
Deadline Reminder

Auto-close Assignments

Send Email Notifications

Cleanup Expired Refresh Tokens
```

For the assignment, a simple hosted background service is enough.

---

# 19. File Uploads

Assignments may contain:

```text
PDF
DOCX
PPTX
Images
```

Submissions may contain:

```text
PDF
DOCX
Images
ZIP
```

Don't store files directly in PostgreSQL.

Use:

```text
Database
   │
   └── File Metadata
          │
          ▼
Object Storage
```

For development:

```text
Local Storage
```

For production:

```text
AWS S3
Azure Blob
Cloudinary
Supabase Storage
```

Store:

```text
FileName
OriginalName
ContentType
Size
StorageKey
Url
```

---

# 20. Audit Logging

This will make your project stand out.

Track:

```text
User Login
Assignment Created
Assignment Updated
Assignment Published
Assignment Deleted
Submission Created
Submission Updated
Grade Added
Grade Updated
User Created
User Deleted
```

Example:

```text
AuditLog

Id
UserId
Action
EntityType
EntityId
OldValues
NewValues
IpAddress
UserAgent
CreatedAt
```

API:

```http
GET /api/audit-logs
```

Admin only.

---

# 21. Health Check

Add:

```http
GET /health
```

Check:

```text
API
Database
```

Response:

```json
{
  "status": "Healthy"
}
```

This is useful for Docker and deployment.

---

# 22. API Versioning

Start with:

```text
/api/v1
```

Example:

```http
/api/v1/auth/login

/api/v1/assignments

/api/v1/submissions
```

Don't implement multiple versions yet.

Just establish the structure.

---

# 23. Swagger

Your Swagger URL:

```text
https://localhost:<port>/swagger
```

Organize endpoints using tags:

```text
Authentication

Users

Classes

Subjects

Assignments

Submissions

Grades

Notifications

Dashboard
```

Configure JWT authentication in Swagger so you can click:

```text
Authorize
```

and test protected endpoints.

---

# 24. Docker Architecture

Use:

```text
Docker Compose

        │
        ├── PaperPulse API
        │
        └── PostgreSQL
```

Optional:

```text
Redis
```

Later.

Structure:

```text
docker/

├── api/
│   └── Dockerfile
│
└── postgres/

docker-compose.yml
```

Run:

```bash
docker compose up -d
```

Services:

```text
paperpulse-api
paperpulse-postgres
```

The API should communicate with PostgreSQL through Docker's internal network.

---

# 25. Configuration

Use:

```text
appsettings.json
appsettings.Development.json
appsettings.Production.json
```

Configuration:

```text
Database
JWT
CORS
File Storage
Email
Logging
Pagination
```

Production secrets should come from:

```text
Environment Variables
```

Never commit secrets.

---

# 26. CORS

Development:

```text
http://localhost:3000
```

Production:

```text
https://paperpulse.yourdomain.com
```

Never use:

```csharp
AllowAnyOrigin()
```

in production.

---

# 27. Rate Limiting

Apply stricter limits to:

```text
Login
Refresh Token
Password Reset
```

Example:

```text
Login
5 requests / minute
```

General API:

```text
100 requests / minute
```

This demonstrates production awareness.

---

# 28. API Documentation

Swagger:

```text
/swagger
```

README should document:

```text
Base URL

Authentication

Authorization

Endpoints

Request Examples

Response Examples

Error Codes

Pagination

Filtering

Sorting
```

---

# 29. Testing Architecture

### Unit Tests

Test:

```text
Assignment rules

Submission rules

Deadline rules

Late submission

Grade validation

Authorization rules

Pagination

Filtering
```

### Integration Tests

Test:

```text
POST /api/v1/auth/login

POST /api/v1/assignments

GET /api/v1/assignments

POST /api/v1/submissions

PATCH /api/v1/submissions/{id}

POST /api/v1/grades
```

Important workflows:

```text
Teacher creates assignment
        ↓
Teacher publishes assignment
        ↓
Student views assignment
        ↓
Student submits
        ↓
Teacher reviews
        ↓
Teacher grades
        ↓
Student views result
```

This should be your most important integration test.

---

# 30. Recommended Backend Implementation Phases

Now the important part.

I recommend **17 phases**.

---

## Phase 1 — Backend Foundation

Implement:

```text
Solution structure
Project references
Dependency injection
Configuration
Environment variables
Swagger
CORS
Health checks
```

---

## Phase 2 — Database Architecture

Design:

```text
ERD
Entities
Relationships
Indexes
Constraints
Enums
Soft Delete Strategy
```

Implement:

```text
DbContext
Entity Configurations
Migrations
Database Seeder
```

---

## Phase 3 — Global API Infrastructure

Implement:

```text
API Response
Error Response
Exception Middleware
Validation Pipeline
Pagination
Filtering
Sorting
```

---

## Phase 4 — Authentication

Implement:

```text
Registration
Login
JWT
Refresh Token
Refresh Token Rotation
Logout
Token Revocation
Current User
Password Hashing
```

Endpoints:

```text
POST /api/v1/auth/login

POST /api/v1/auth/refresh

POST /api/v1/auth/logout

GET /api/v1/auth/me
```

---

## Phase 5 — RBAC

Implement:

```text
Roles
Permissions
Role Permissions
Authorization Policies
```

Roles:

```text
Admin
Teacher
Student
```

---

## Phase 6 — User Management

Admin:

```text
Create User
Update User
Delete User
Activate User
Deactivate User
Assign Role
Search User
Filter User
Pagination
```

---

## Phase 7 — Academic Structure

Implement:

```text
Classes
Subjects
Teacher Assignment
Student Enrollment
```

---

## Phase 8 — Assignment Management

Teacher:

```text
Create
Update
Delete
Publish
Archive
```

Support:

```text
Draft
Published
Closed
Archived
```

---

## Phase 9 — Student Assignment Experience

Implement:

```text
Assigned Assignments
Assignment Details
Upcoming Deadlines
Past Assignments
Submission Status
```

---

## Phase 10 — Submission Management

Implement:

```text
Create Submission
Update Submission
Resubmit
Late Submission
Submission Status
File Upload
```

---

## Phase 11 — Grading & Feedback

Teacher:

```text
View Submission
Grade
Feedback
Return Submission
Update Grade
```

Student:

```text
View Marks
View Feedback
```

---

## Phase 12 — Notifications

Implement:

```text
In-App Notifications
Unread Count
Mark as Read
Mark All as Read
```

Events:

```text
Assignment Published
Submission Received
Submission Graded
Deadline Reminder
```

---

## Phase 13 — Background Processing

Implement:

```text
Deadline Reminder
Auto-Close Assignment
Refresh Token Cleanup
Notification Processing
```

---

## Phase 14 — Audit Logging

Implement:

```text
Audit Logs
Admin Audit API
User Activity
Security Events
```

---

## Phase 15 — Dashboard & Analytics

Admin:

```text
Total Students
Total Teachers
Total Classes
Total Assignments
Submission Statistics
```

Teacher:

```text
My Assignments
Pending Reviews
Submission Statistics
```

Student:

```text
Pending Assignments
Submitted Assignments
Upcoming Deadlines
Grades
```

---

## Phase 16 — Testing & Security

Implement:

```text
Unit Tests
Integration Tests
Authorization Tests
Validation Tests
Submission Workflow Tests
Rate Limiting
Security Headers
CORS
```

---

## Phase 17 — Docker & Production Readiness

Finalize:

```text
Dockerfile
Docker Compose
PostgreSQL Container
Environment Configuration
Health Checks
Swagger
Logging
Production Configuration
```

Then:

```text
GitHub Actions
CI/CD
Deployment
```

---

# Final Backend Architecture

Your finished PaperPulse backend should conceptually look like this:

```text
                          ┌────────────────────┐
                          │    Next.js Client  │
                          └─────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     ASP.NET API     │
                         │      /api/v1        │
                         └─────────┬───────────┘
                                   │
               ┌───────────────────┼────────────────────┐
               │                   │                    │
               ▼                   ▼                    ▼
          Auth / RBAC         Middleware            Swagger
               │                   │
               └────────────┬──────┘
                            ▼
                    Application Layer
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
      Assignments       Submissions        Users
      Classes           Grading            Classes
      Subjects          Notifications      Dashboard
          │                 │                  │
          └─────────────────┼──────────────────┘
                            ▼
                      Domain Layer
                            │
                            ▼
                    Infrastructure
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
          JWT          Notifications     File Storage
            │
            ▼
                     Persistence
                            │
                            ▼
                       PostgreSQL
```

## My recommendation for your implementation order

Since your **project initialization is already complete**, I would now proceed with:

**Phase 1 → Backend Foundation & DI**

Then immediately:

**Phase 2 → Database Architecture + ERD + EF Core**

Then:

**Phase 3 → Global API Infrastructure**

Then:

**Phase 4 → Authentication + Refresh Tokens**

Then:

**Phase 5 → RBAC**

Only after those five phases should you start building **Users → Classes → Subjects → Assignments → Submissions → Grading**.

That sequence gives you a stable foundation and prevents the common mistake of building CRUD endpoints first and then having to rewrite the entire architecture when authentication, authorization, pagination, validation, and standardized responses are introduced later.

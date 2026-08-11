# 📄 PaperPulse — Academic Workspace & Assignment Submission Studio

**PaperPulse** is a multi-tenant academic assignment authoring, submission management, and evaluation platform. It provides role-differentiated workspaces for **Admins**, **Teachers**, and **Students**, featuring real-time deadline countdowns, drag-and-drop submission studios, multi-version submission timelines, automated evaluation scoring, and live role-based analytics dashboards.

---

## 🔑 Demo Login Credentials

You can test all 3 role-differentiated workspaces using the pre-configured credentials below:

| Role | Email Address | Password | Workspace Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@paperpulse.com` | `AdminPass123!` | User Administration, Role Claims, System Overviews, Audit Logs |
| **Teacher** | `teacher@paperpulse.com` | `TeacherPass123!` | Assignment Authoring Studio, Publish/Close Windows, Submission Evaluation & Grading |
| **Student** | `student@paperpulse.com` | `StudentPass123!` | Student Task Feed, Drag-and-Drop Submission Studio, Multi-Version History |

---

## 🛠️ Technology Stack & Architecture

### **Frontend**:
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core**: React 19, TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Modern Utilities)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Icons & UI**: Lucide React, Custom UI Component Tokens
- **Form Handling**: React Hook Form, Zod Validation

### **Backend**:
- **Framework**: [.NET 10 Web API](https://dotnet.microsoft.com/)
- **Database ORM**: Entity Framework Core 10 (PostgreSQL Provider)
- **Database**: PostgreSQL (Auto-Migrating & Auto-Seeding)
- **Security & Authentication**: JWT Bearer Tokens, ASP.NET Core Authorization & Permission Guards
- **API Documentation**: OpenAPI / Swagger UI

---

## 📁 Repository & Project Structure

```
PaperPulse/
├── API_DOCUMENTATION.md             # Complete REST API reference manual & Swagger guide
├── README.md                        # Master project documentation
├── backend/                         # ASP.NET Core 10 Backend
│   ├── .env.example                 # Backend environment variable template
│   ├── PaperPuls.API/               # REST API Controllers, Middlewares, Swagger Setup
│   ├── PaperPulse.Application/      # CQRS Commands, Queries, DTOs, Fluent Validators
│   ├── PaperPulse.Domain/           # Core Entities, Enums, Value Objects, Domain Exceptions
│   ├── PaperPulse.Infrastructure/   # Authorization Handlers, JWT Service, Audit Logger
│   └── PaperPulse.Persistence/      # EF Core DbContext, Migrations, Seeder Service
│       ├── Migrations/              # Database schema migrations
│       └── Seed/                    # Initial database seed service (Users, Roles, Assignments)
└── frontend/                        # Next.js 16 Web Application
    ├── .env.example                 # Frontend environment variable template
    ├── app/                         # App Router (Dashboard, Assignments, Submissions, Profile, Users)
    ├── components/                  # Design System Components (Modals, Stat Cards, Uploaders, Timelines)
    └── lib/                         # API Client, Auth Store, Query Keys
```

---

## 🗄️ Database Setup & Automatic Seeding

The backend uses Entity Framework Core 10 with automatic database migration and seeding capabilities.

- **Migration Files**: Located in [`backend/PaperPulse.Persistence/Migrations`](backend/PaperPulse.Persistence/Migrations).
- **Seed Data Service**: Located in [`backend/PaperPulse.Persistence/Seed/DatabaseSeederService.cs`](backend/PaperPulse.Persistence/Seed/DatabaseSeederService.cs).

### Automatic Database Initialization:
When you launch the backend via `dotnet run`, the application automatically:
1. Applies all EF Core migrations to ensure database tables are created.
2. Checks if database seed data exists.
3. Automatically seeds system roles, tenant records, sample classes, default subjects, test users (`Admin`, `Teacher`, `Student`), authored assignments, and submissions.

> **No manual SQL scripts or database table creation is required!**

---

## 🚀 Environment Configuration & Local Setup

### 1. Environment Configuration

Copy the example environment files into active environment files:

#### Frontend (`frontend/`):
Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5109/api/v1
```

#### Backend (`backend/`):
Copy [`backend/.env.example`](backend/.env.example) to `backend/.env` (or configure in `appsettings.json`):
```env
DB_URI=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/paperpulse_db
JWT_SECRET=PaperPulse_Super_Secret_JWT_Key_2026_Must_Be_At_Least_32_Bytes_Long!
```

---

### 2. Running the Backend (.NET Web API)

1. Open terminal and navigate to the API directory:
   ```bash
   cd backend/PaperPuls.API
   ```
2. Run the application:
   ```bash
   dotnet run
   ```
3. The API will start at `http://localhost:5109`.
4. Open your browser and navigate to **`http://localhost:5109/swagger`** to test endpoints interactively via Swagger UI.

---

### 3. Running the Frontend (Next.js Application)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:3000`** (or `http://localhost:3001`).

---

## 🧪 Running Tests & Build Verification

### Backend Build & Verification:
To verify and compile the backend solution:
```bash
cd backend/PaperPuls.API
dotnet build
```

### Frontend Type-Check & Production Build:
To run TypeScript validation and build static production routes:
```bash
cd frontend
npm run build
```

---

## 📚 API Documentation & Interactive Swagger

For detailed endpoint documentation, request/response models, and testing guides:
- 📑 **API Reference Document**: See [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).
- 🌐 **Interactive Swagger UI**: `http://localhost:5109/swagger`

---

## 💡 Assumptions & Known Limitations

1. **File Storage**: Uploaded submission attachment files are stored locally in the server's uploads folder and linked via relative paths.
2. **Session Expiration**: JWT Access Tokens expire after 7 days (`10080` minutes) for seamless user experience without frequent re-authentications.

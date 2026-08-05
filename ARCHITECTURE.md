# PaperPulse Backend Architecture

Version: 1.0

---

# Overview

PaperPulse is a production-grade Assignment & Submission Management System built using **ASP.NET Core Web API**, following **Clean Architecture**, **Feature-Based Organization**, **Repository Pattern**, and **Service Layer** principles.

The primary goals of this architecture are:

- Maintainability
- Scalability
- Testability
- Security
- Performance
- Separation of Concerns
- Easy Feature Expansion

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js + React + TypeScript |
| Backend | ASP.NET Core Web API (.NET 10) |
| Database | PostgreSQL (Supabase) |
| ORM | Entity Framework Core |
| Authentication | JWT + Refresh Token |
| Authorization | Role-Based Authorization (RBAC) |
| Validation | FluentValidation |
| Documentation | Swagger / OpenAPI |
| Logging | Serilog |
| Testing | xUnit |
| Containerization | Docker |

---

# High Level Architecture

```
                    Next.js Frontend
                           │
                           │ REST API
                           ▼
                ASP.NET Core Web API
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Authentication      Application Layer    Middleware
 Authorization       Business Logic       Validation
 JWT                 Services             Logging
 Swagger             DTOs                 Exception Handling
                           │
                           ▼
                     Domain Layer
                  Entities & Business Rules
                           │
                           ▼
                  Persistence Layer
             Entity Framework Core + PostgreSQL
                           │
                           ▼
                  Supabase PostgreSQL
```

---

# Solution Structure

```
PaperPulse/

backend/

│
├── PaperPulse.sln
│
├── PaperPulse.API
│
├── PaperPulse.Application
│
├── PaperPulse.Domain
│
├── PaperPulse.Infrastructure
│
├── PaperPulse.Persistence
│
└── tests
    ├── PaperPulse.UnitTests
    └── PaperPulse.IntegrationTests

frontend/

docs/
```

---

# Project Responsibilities

## PaperPulse.API

Responsibilities

- REST API
- Controllers
- Middleware
- Dependency Injection
- Authentication Configuration
- Swagger
- API Configuration
- Global Exception Handling
- Health Checks

Must NOT contain

- Business Logic
- Database Queries

---

## PaperPulse.Application

Responsibilities

- Business Logic
- Services
- DTOs
- Validators
- Interfaces
- Business Rules
- Feature Implementations

Must NOT contain

- Database Implementation
- HTTP Logic

---

## PaperPulse.Domain

Responsibilities

- Entities
- Enums
- Constants
- Value Objects
- Domain Exceptions

Must remain independent.

---

## PaperPulse.Persistence

Responsibilities

- DbContext
- Entity Configurations
- EF Core
- Repositories
- Migrations
- Seed Data

---

## PaperPulse.Infrastructure

Responsibilities

- JWT Generation
- Password Hashing
- Email Service
- File Storage
- Notification Providers
- Logging Providers
- External Integrations

---

# Dependency Flow

```
                API
                 │
                 ▼
          Application
                 │
                 ▼
             Domain

Infrastructure
      │
      ▼
Application

Persistence
      │
      ▼
Application
      │
      ▼
Domain
```

Dependency Rule

Inner layers must NEVER depend on outer layers.

---

# Request Flow

```
HTTP Request

↓

Controller

↓

Application Service

↓

Repository

↓

DbContext

↓

PostgreSQL

↓

Repository

↓

Service

↓

Controller

↓

HTTP Response
```

Controllers remain thin.

Business logic lives inside Services.

Database logic lives inside Repositories.

---

# Feature Based Organization

Application

```
Features

Authentication

Users

Roles

Classes

Subjects

Assignments

Submissions

Grades

Notifications

Dashboard
```

Each feature should contain

```
Feature

Commands

Queries

DTOs

Validators

Services

Interfaces

Mappings
```

---

# Folder Structure

PaperPulse.Application

```
Features

Common

Interfaces

Services

Validators

DTOs

Mappings

DependencyInjection
```

PaperPulse.Persistence

```
Context

Configurations

Repositories

Seed

Migrations
```

PaperPulse.API

```
Controllers

Middleware

Extensions

Configurations

Filters

Swagger

Program.cs
```

---

# Database Architecture

Database

PostgreSQL (Supabase)

ORM

Entity Framework Core

Naming

snake_case

Primary Keys

UUID

Audit Columns

CreatedAt

UpdatedAt

CreatedBy

UpdatedBy

DeletedAt

IsDeleted

---

# Core Modules

Identity

- Users
- Roles
- Permissions
- Refresh Tokens

Academic

- Classes
- Subjects
- Student Enrollment
- Teacher Assignment

Assignment

- Assignment
- Assignment Attachment

Submission

- Submission
- Submission Attachment
- Grade
- Feedback

Communication

- Notification

System

- Audit Log

---

# Authentication Flow

```
Login

↓

Validate User

↓

Verify Password

↓

Generate JWT

↓

Generate Refresh Token

↓

Store Hashed Refresh Token

↓

Return Tokens
```

JWT

Short-lived

Refresh Token

Long-lived

Rotated

Stored in Database

---

# Authorization

Role Based Authorization

Roles

- Admin
- Teacher
- Student

Every endpoint must require authorization unless explicitly public.

Authorization is enforced in Services and Controllers.

---

# Assignment Workflow

```
Draft

↓

Published

↓

Closed

↓

Archived
```

Teacher can

Create

Update

Delete

Publish

Archive

Student can

View

Submit

Resubmit before deadline

---

# Submission Workflow

```
Assignment Published

↓

Student Submission

↓

Teacher Review

↓

Teacher Grading

↓

Feedback

↓

Student Result
```

Submission Status

Draft

Submitted

Late

Under Review

Graded

Returned

---

# Global API Response

Success

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "message": "",
  "errors": []
}
```

Every endpoint returns the same structure.

---

# Error Handling

Global Exception Middleware

Maps

400

401

403

404

409

500

Never expose stack traces.

---

# Validation

Validation is handled using

FluentValidation

Validation lives inside Application.

Controllers never validate business rules.

---

# Repository Pattern

Repositories perform

Database Access

CRUD

Queries

Repositories never contain

Business Logic

Authorization

Validation

---

# Service Layer

Services perform

Business Rules

Authorization Checks

Workflow Management

Validation

Repositories only persist data.

---

# Pagination

Every list endpoint supports

Page

PageSize

Search

SortBy

SortOrder

Filters

Response includes

Current Page

Page Size

Total Count

Total Pages

---

# Filtering

Supported Filters

Search

Status

Teacher

Student

Class

Subject

Date Range

Sorting

Filtering logic belongs inside Repository.

---

# Notification Architecture

Notification Types

Assignment Published

Submission Received

Submission Graded

Deadline Reminder

Feedback Added

Notification States

Unread

Read

Archived

---

# File Storage

Assignments

PDF

DOCX

PPTX

Images

Submissions

PDF

DOCX

ZIP

Images

Database stores

Metadata only

Actual files stored externally or locally depending on environment.

---

# Logging

Log

Errors

Warnings

Authentication

Critical Actions

Never log

Passwords

JWT Tokens

Connection Strings

Sensitive Data

---

# Security

JWT Authentication

Refresh Tokens

Role Authorization

Password Hashing

Input Validation

Rate Limiting

Security Headers

HTTPS

Environment Variables

---

# Testing Strategy

Unit Tests

Business Rules

Validation

Authorization

Workflow

Integration Tests

Authentication

Assignments

Submissions

Grading

Notifications

API Endpoints

---

# Docker Architecture

```
Docker Compose

│

├── PaperPulse API

└── PostgreSQL (Supabase is external during production)
```

For local development PostgreSQL container can replace Supabase.

---

# API Documentation

Swagger

```
/swagger
```

Health Check

```
/health
```

API Base URL

```
/api/v1
```

---

# Future Scalability

Architecture supports future addition of

Multi-Tenant SaaS

Email Notifications

Push Notifications

Redis Caching

SignalR Real-time Notifications

Background Jobs

Hangfire

Azure Storage

AWS S3

Cloudinary

Message Queue

Microservices

GraphQL

API Versioning

CI/CD

Monitoring

Distributed Logging

---

# Architecture Principles

Every layer has a single responsibility.

Controllers coordinate.

Services implement business rules.

Repositories access the database.

Entities represent business data.

Database remains normalized.

Dependencies always point inward.

The architecture should always optimize for maintainability over short-term convenience.
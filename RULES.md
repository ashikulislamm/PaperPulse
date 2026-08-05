# PaperPulse Backend Development Rules

Version: 1.0

---

# Project Overview

PaperPulse is a production-grade Assignment & Submission Management System built using:

- ASP.NET Core Web API (.NET 10)
- C#
- Entity Framework Core
- PostgreSQL (Supabase)
- Clean Architecture
- Feature-Based Architecture
- Repository Pattern
- Service Layer
- JWT Authentication
- Role Based Authorization (RBAC)
- REST API
- Next.js Frontend

The objective is to keep the project scalable, maintainable, secure, and production-ready.

---

# General Principles

Always prioritize:

- Readability
- Maintainability
- Scalability
- Security
- Performance
- Clean Code
- SOLID Principles
- Separation of Concerns

Never sacrifice architecture for shorter code.

---

# Architecture Rules

The project follows:

Clean Architecture

Feature-Based Organization

Repository Pattern

Service Layer

Dependency Injection

Application Flow:

Controller

↓

Application Service

↓

Repository

↓

Entity Framework Core

↓

PostgreSQL

Business logic MUST NEVER exist inside Controllers.

---

# Dependency Rule

Dependency direction must always be:

API

↓

Application

↓

Domain

Infrastructure

↓

Application

Persistence

↓

Application

↓

Domain

Domain must NEVER depend on any other project.

Application must NEVER reference API.

Persistence must NEVER reference API.

Infrastructure must NEVER reference API.

---

# Folder Organization

Every feature must remain isolated.

Example:

Features

Assignments

Submissions

Users

Authentication

Notifications

Dashboard

Never mix multiple business features together.

---

# Controller Rules

Controllers must only:

Receive Request

Validate Model

Call Service

Return Response

Controllers must NEVER contain:

Business Logic

Database Queries

LINQ Queries

Validation Logic

Mapping Logic

Authorization Logic

---

# Service Rules

Services contain:

Business Logic

Business Validation

Workflow Logic

Permission Checks

Services must NEVER access DbContext directly.

Services communicate only through repositories.

---

# Repository Rules

Repositories are responsible only for:

Database Access

Entity Queries

Persistence

Repositories must NEVER:

Contain Business Logic

Perform Authorization

Return API Responses

---

# Entity Rules

Entities represent the database.

Entities must NEVER contain:

API DTOs

HTTP Information

Business Services

Infrastructure Code

Entities should remain persistence-friendly.

---

# DTO Rules

Never expose Entity objects to the API.

Always use DTOs.

Use:

Request DTO

Response DTO

Summary DTO

Details DTO

Never return EF Core entities directly.

---

# Validation Rules

Use FluentValidation.

Validation belongs inside Application.

Never validate inside Controllers.

Never use DataAnnotations for business validation.

---

# Mapping Rules

Prefer Manual Mapping.

Avoid AutoMapper unless absolutely necessary.

Manual mapping improves:

Performance

Readability

Debugging

---

# Database Rules

Database:

PostgreSQL (Supabase)

Use UUID as Primary Key.

Use snake_case naming.

Never use plural table names inconsistently.

Every table must contain:

Id

CreatedAt

UpdatedAt

CreatedBy

UpdatedBy

DeletedAt (if soft delete)

IsDeleted (if soft delete)

---

# Relationship Rules

Always define:

Foreign Keys

Delete Behavior

Indexes

Unique Constraints

Composite Indexes

Never leave relationships ambiguous.

---

# Migration Rules

Every database change requires:

Migration

Migration Review

Database Update

Never modify migrations after production.

Never delete applied migrations.

---

# Soft Delete Rules

Business entities should support soft delete.

Never physically delete important data.

Examples:

Assignments

Users

Submissions

Notifications

Audit Logs should NEVER be deleted.

---

# API Rules

Follow REST conventions.

Examples:

GET

POST

PUT

PATCH

DELETE

Use nouns.

Good:

/assignments

/submissions

/users

Bad:

/createAssignment

/getAssignments

---

# API Response Rules

Every response must follow one structure.

Success:

{
  success,
  message,
  data
}

Failure:

{
  success,
  message,
  errors
}

Never return inconsistent response formats.

---

# Pagination Rules

Every list endpoint must support:

page

pageSize

search

sortBy

sortOrder

Never return unlimited records.

Default page size:

20

Maximum:

100

---

# Filtering Rules

Support filtering whenever applicable.

Examples:

Status

Class

Subject

Teacher

Student

Date Range

Search

Filtering logic belongs inside Repository.

---

# Authentication Rules

Authentication uses:

JWT

Refresh Token

Password Hashing

Never store plaintext passwords.

Refresh Tokens must be:

Hashed

Stored in Database

Revocable

Rotatable

---

# Authorization Rules

Always use Role-Based Authorization.

Roles:

Admin

Teacher

Student

Permissions must be checked inside Services.

Never trust frontend authorization.

---

# Logging Rules

Log:

Errors

Warnings

Authentication Events

Critical Operations

Do NOT log:

Passwords

JWT Tokens

Connection Strings

Sensitive Data

---

# Exception Handling Rules

All exceptions go through:

Global Exception Middleware

Never expose stack traces.

Map exceptions correctly.

400

401

403

404

409

500

---

# Notification Rules

Notifications should be event-driven.

Examples:

Assignment Published

Submission Received

Submission Graded

Deadline Reminder

Support:

Read

Unread

Mark as Read

---

# File Upload Rules

Never store files inside PostgreSQL.

Store:

Metadata

Database

Actual File

Storage Provider

Allowed Types:

PDF

DOCX

ZIP

Images

Validate:

Size

Extension

Mime Type

---

# Configuration Rules

Never hardcode:

Connection Strings

JWT Secrets

API Keys

Passwords

Use:

Environment Variables

Options Pattern

Strongly Typed Configuration

---

# Environment Rules

Development:

.env

Production:

Environment Variables

Never commit:

.env

Never commit secrets.

Commit only:

.env.example

---

# Coding Standards

Enable:

Nullable Reference Types

Implicit Usings

Warnings as Errors (recommended)

Use:

var

only when type is obvious.

Prefer explicit names.

Avoid abbreviations.

Bad:

usr

tmp

Good:

user

assignmentSubmission

teacherAssignment

---

# Naming Rules

Classes:

PascalCase

Methods:

PascalCase

Properties:

PascalCase

Interfaces:

IRepository

IService

Variables:

camelCase

Private Fields:

_camelCase

Constants:

PascalCase

Database:

snake_case

---

# Async Rules

All database operations must be async.

Never block threads.

Avoid:

.Result

.Wait()

Use:

await

---

# Performance Rules

Always:

Use Pagination

Index Foreign Keys

Use AsNoTracking for read-only queries

Avoid N+1 Queries

Avoid unnecessary Includes

---

# Security Rules

Never trust client input.

Always validate.

Always authorize.

Always sanitize uploaded files.

Rate-limit sensitive endpoints.

Never expose internal exceptions.

---

# Testing Rules

Every feature should have:

Unit Tests

Integration Tests

Test:

Business Rules

Authorization

Validation

Submission Workflow

Assignment Workflow

---

# Git Rules

Small commits.

Meaningful commit messages.

Example:

feat: implement assignment creation

fix: resolve submission deadline validation

refactor: extract notification service

Avoid:

update

changes

fix bug

---

# Documentation Rules

Every module should have:

Purpose

Responsibilities

Business Rules

API Endpoints

Validation Rules

Error Responses

README should always stay updated.

---

# Code Review Checklist

Before every commit verify:

No Business Logic in Controllers

No DbContext in Controllers

Proper Validation

Authorization Implemented

Async Used

No Hardcoded Secrets

Standard API Response

Logging Added

Exception Handling

Tests Updated

Migration Created

README Updated

---

# Project Philosophy

Build software that:

Is easy to understand.

Easy to extend.

Easy to test.

Easy to deploy.

Easy to maintain.

Every line of code should have a clear purpose.

Optimize for long-term maintainability rather than short-term convenience.
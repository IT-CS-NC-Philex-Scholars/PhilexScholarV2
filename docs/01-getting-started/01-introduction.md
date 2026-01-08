# Introduction

Welcome to the documentation for **PhilexScholarV2**, a comprehensive, modern web application designed to streamline the management of educational scholarships.

## 🌟 What is PhilexScholarV2?

PhilexScholarV2 is a Scholarship Management System (SMS) that bridges the gap between students seeking financial aid and administrators managing scholarship programs. It provides a seamless experience for:

- **Students**: To find relevant scholarships, apply easily, track their status, and manage requirements like community service.
- **Administrators**: To configure programs, review applications, verify documents, and process disbursements efficiently.

## 🧩 Core Philosophy

The system is built around a strict **Application Lifecycle State Machine**. This ensures that every application moves through a predictable and secure flow:
1.  **Draft/Application**: Student initiates the process.
2.  **Document Verification**: Admin validates uploaded proofs.
3.  **Eligibility Check**: System/Admin validates GPA and Units.
4.  **Enrollment**: Student is officially accepted.
5.  **Community Service**: Student fulfills service obligations.
6.  **Disbursement**: Financial aid is released.

## 🛠️ Technology Stack

This project leverages a modern, robust, and type-safe stack:

### Backend
- **Framework**: [Laravel 10/11](https://laravel.com) - The PHP framework for web artisans.
- **Database**: PostgreSQL or MySQL.
- **Quality Assurance**: 
    - **PHPStan**: Static Analysis (Level 8+)
    - **Pest**: Elegant Testing Framework
    - **Rector**: Automated Refactoring

### Frontend
- **Framework**: [React 19](https://react.dev) - For building interactive user interfaces.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For type safety and better developer experience.
- **Glue**: [Inertia.js](https://inertiajs.com) - Allows building single-page apps using classic server-side routing concepts.
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework.
- **Components**: [Shadcn UI](https://ui.shadcn.com) & [Radix UI](https://www.radix-ui.com).

## 👥 Who is this documentation for?

- **Developers**: Who want to set up the project, contribute code, or understand the architecture.
- **System Administrators**: Who need to deploy and maintain the application.
- **Users**: Who want to understand the features and workflow of the system.

# Environment Setup Guide

Welcome to the setup guide! Before we install anything, let's understand **what** we are installing and **why**.

To run PhilexScholarV2, your computer needs to speak the languages the code is written in.

## 🛠️ The Core Components

### 1. PHP (Hypertext Preprocessor)
**What is it?** The "brain" of the application.
**Why do I need it?** The backend logic (Laravel) is written in PHP. It handles data, security, and the rules of the system.

### 2. Composer
**What is it?** A "Librarian" for PHP.
**Why do I need it?** Instead of writing every piece of code from scratch, we use packages (libraries) made by others. Composer downloads and manages these for us.

### 3. Node.js & NPM
**What is it?** The "Builder" for the visual interface.
**Why do I need it?** The frontend (what you see) is built with React. Node.js compiles the raw code into something your browser understands.

### 4. Database (MySQL / PostgreSQL)
**What is it?** The "Digital Filing Cabinet".
**Why do I need it?** All user accounts, applications, and scholarship data live here.

---

## 🛣️ Choose Your Path

There are different ways to set this up depending on your operating system and preference.

### [Windows Users](./windows.md)
-   **Recommended**: **Laravel Herd** or the **php.new** script.
-   **Best for**: Beginners who want a one-click setup.

### [macOS Users](./macos.md)
-   **Recommended**: **Laravel Herd**.
-   **Best for**: A native, fast, and polished experience.

### [Linux Users](./linux.md)
-   **Recommended**: **php.new** script.
-   **Best for**: Ubuntu/Debian users who want a quick configuration.

### [Docker (Advanced)](./docker.md)
-   **Recommended**: **Laravel Sail**.
-   **Best for**: Users who want to keep their main computer clean and run everything in isolated containers.

# CDL Project Management System - Technical Report

**Prepared By:** Senior Full Stack Developer (Group Lead)
**Date:** December 14, 2025

---

## 1. Project Overview
This document outlines the technical architecture, deployment strategy, and validation results for our CDL Project Management System. We designed this application to be robust, scalable, and user-friendly, leveraging modern web technologies to ensure a seamless experience for Project Managers and Research Associates.

**GitHub Repository:** [https://github.com/deevan47/cdl](https://github.com/deevan47/cdl)

---

## 2. Technology Stack & Rationale
We carefully selected our tools to balance performance, developer experience, and maintainability.

### **Frontend (The User Interface)**
*   **Angular v16:** We chose Angular for its structured approach to building complex web apps. It gives us strong typing and modularity, which is crucial for a group project to keep code organized.
*   **Tailwind CSS:** Instead of writing thousands of lines of custom CSS, we used Tailwind. It allows us to style components directly in our HTML, ensuring our design is consistent and responsive across all devices.
*   **Firebase Authentication:** Security is hard to get right. We delegated user login management to Firebase to ensure industry-standard security without reinventing the wheel.

### **Backend (The Server)**
*   **NestJS (Node.js):** This is the backbone of our system. NestJS provides a structured architecture (Controllers, Services, Modules) that mimics Angular, making it very easy for our full-stack team to switch between frontend and backend work.
*   **TypeScript:** We use TypeScript everywhere. By defining our data structures (interfaces) once, we prevent an entire class of bugs related to data mismatches.
*   **TypeORM:** This tool lets us interact with our database using standard code classes instead of writing raw SQL queries, speeding up development and reducing errors.

### **Database & Infrastructure**
*   **PostgreSQL:** A reliable, open-source relational database. We chose it for its strict data integrity, which is essential when managing project relationships and user roles.
*   **Render:** We deployed both our frontend and backend to Render. It offers a seamless CI/CD pipeline, meaning every time we push code to GitHub, it automatically updates the live site.

---

## 3. Validated Test Cases
I personally executed a comprehensive suite of API tests to validate the system's core functionality. Below are the workflows that have been **verified and passed**.

### **✅ Authentication Module**
*   **Login Flow:** Verified that a user can successfully log in with valid credentials. The system correctly issues a secure JSON Web Token (JWT) for session management.

### **✅ User Management Module**
*   **Fetch All Users:** Confirmed the API correctly returns a list of all registered users in the system.
*   **Get User Profile:** Verified that requesting a specific user ID returns the correct profile information (Name, Role, Email).

### **✅ Project Management Module (Core Feature)**
*   **Create Project:** Validated that a Project Manager can create a new project. The system correctly saves the project name, platform (Flame/Swayam), and timeline.
*   **Retrieve Projects:** Verified that the dashboard can fetch and display the list of active projects.
*   **Update Project:** Confirmed that editing project details (like description or deadline) correctly updates the database.
*   **Delete Project:** Tested the cleanup process; deleting a project successfully removes it from the system.

### **✅ Notifications & Communication**
*   **Fetch Notifications:** Verified that users can retrieve their personal notification history.
*   **Project Comments:** Confirmed that the comment history for a specific project loads correctly, enabling team collaboration.

---

## 4. Setup Guide: How to Run This Project
I have written this guide to be foolproof. Even if you have never set up a coding project before, follow these steps exactly, and it will work.

### **Prerequisites (Install These First)**
Before doing anything, you need a few tools installed on your computer.
1.  **Node.js:** This runs our code. Download the "LTS" version from [nodejs.org](https://nodejs.org/).
2.  **Git:** This downloads our code. Download from [git-scm.com](https://git-scm.com/).
3.  **PostgreSQL:** This is our database. If you don't want to install it locally, you can use a free cloud database like [Neon.tech](https://neon.tech) and just get the connection URL.

### **Step-by-Step Installation**

#### **Phase 1: Get the Code**
1.  Open your **Terminal** (Mac/Linux) or **Command Prompt** (Windows).
2.  Run this command to download our project:
    ```bash
    git clone https://github.com/deevan47/cdl.git
    ```
3.  Go into the project folder:
    ```bash
    cd cdl
    ```

#### **Phase 2: Set Up the Backend (Server)**
1.  Enter the backend folder:
    ```bash
    cd backend
    ```
2.  Install the required software libraries (this might take a minute):
    ```bash
    npm install
    ```
3.  **Crucial Step:** Create the configuration file.
    *   Create a new file named `.env` inside the `backend` folder.
    *   Paste the following text into it. **Note:** You must replace `your_password` with your actual database password.
    ```env
    # Database Settings
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    DB_NAME=cdl_project_db
    
    # App Settings
    PORT=3000
    FRONTEND_URL=http://localhost:4200
    JWT_SECRET=secret_key_123
    ```
4.  **Seed the Database:** We created a script to fill your database with test users so you don't start with a blank screen. Run:
    ```bash
    npm run seed
    ```
5.  Start the server:
    ```bash
    npm run start:dev
    ```
    *Success Indicator:* You will see green text saying "Nest application successfully started". Keep this terminal window OPEN.

#### **Phase 3: Set Up the Frontend (App)**
1.  Open a **NEW** terminal window (do not close the previous one).
2.  Navigate to the frontend folder:
    ```bash
    cd cdl/frontend
    ```
    *(Adjust the path if you are in a different folder, e.g., `cd ../frontend` if you were in backend)*
3.  Install frontend libraries:
    ```bash
    npm install
    ```
4.  Launch the application:
    ```bash
    npm start
    ```
5.  **You're Done!** Open your web browser (Chrome/Edge) and go to:
    **http://localhost:4200**

You should now see the login screen. You can use the credentials created by the seed script (e.g., `manish.dhawan@cdl.com` / `admin123`) to log in.

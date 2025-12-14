# API Test Report

**Date:** 2025-12-14
**Environment:** Local Development (localhost:3000)

## Summary
A comprehensive test of the backend API endpoints was performed using a custom Node.js script. The tests covered Authentication, Users, Projects, Tasks, Comments, and Notifications modules.

| Module | Total Tests | Passed | Failed |
| :--- | :---: | :---: | :---: |
| **Auth** | 1 | 1 | 0 |
| **Users** | 3 | 2 | 1 |
| **Projects** | 5 | 5 | 0 |
| **Tasks** | 1 | 0 | 1 |
| **Comments** | 3 | 2 | 1 |
| **Notifications** | 1 | 1 | 0 |
| **General** | 1 | 0 | 1 |

## Detailed Test Results

### 1. General / App
- **GET /health**
  - **Expected:** 200 OK
  - **Actual:** 404 Not Found
  - **Status:** 🔴 FAIL

### 2. Authentication
- **POST /auth/login**
  - **Payload:** `{ email: "deevankumar.gaddala@flame.edu.in", password: "***" }`
  - **Expected:** 200 OK with Access Token
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS

### 3. Users
- **GET /users**
  - **Expected:** 200 OK (List of users)
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS
- **GET /users/:id**
  - **Expected:** 200 OK (User profile)
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS
- **GET /users/managers**
  - **Expected:** 200 OK (List of managers)
  - **Actual:** 500 Internal Server Error
  - **Status:** 🔴 FAIL

### 4. Projects
- **GET /projects**
  - **Expected:** 200 OK (List of projects)
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS
- **POST /projects**
  - **Payload:** `{ name: "Test Project API", platform: "flame", ... }`
  - **Expected:** 201 Created
  - **Actual:** 201 Created
  - **Status:** 🟢 PASS
- **GET /projects/:id**
  - **Expected:** 200 OK
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS
- **PUT /projects/:id**
  - **Expected:** 200 OK
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS
- **DELETE /projects/:id**
  - **Expected:** 200 OK
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS

### 5. Tasks
- **POST /tasks**
  - **Payload:** `{ title: "Test Task", projectId: "...", ... }`
  - **Expected:** 201 Created
  - **Actual:** 500 Internal Server Error
  - **Status:** 🔴 FAIL

### 6. Comments
- **GET /comments**
  - **Expected:** 200 OK
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS
- **GET /comments/project/:projectId**
  - **Expected:** 200 OK
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS
- **POST /comments**
  - **Payload:** `{ content: "Test comment", projectId: "..." }`
  - **Expected:** 500 Internal Server Error
  - **Actual:** 500 Internal Server Error
  - **Status:** 🔴 FAIL

### 7. Notifications
- **GET /notifications/my**
  - **Expected:** 200 OK
  - **Actual:** 200 OK
  - **Status:** 🟢 PASS

## Test Script Used
The following script was used to execute these tests:

```javascript
const fetch = global.fetch;

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'deevankumar.gaddala@flame.edu.in';
const PASSWORD = 'admin123';

let TOKEN = '';
let USER_ID = '';
let PROJECT_ID = '';
let TASK_ID = '';

async function runTest(name, method, url, body = null, token = null) {
    // ... (See backend/test-api.js for full code)
}
// ...
```

(Full script is available at `backend/test-api.js`)

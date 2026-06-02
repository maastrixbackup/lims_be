# Backend Flow Documentation

## Overview

This backend is a Node.js + Express application that serves the LIMS APIs, manages authentication, stores land-management data in MySQL, and handles document uploads for private land, government land, and forest land workflows.

The main backend flow is:

1. Client sends an HTTP request to an API route.
2. Express receives the request in `src/index.js`.
3. Common middleware runs first, such as JSON parsing, CORS, JWT authentication, and file upload handling.
4. The request is forwarded to the matching route file in `src/routes/`.
5. The route calls a controller in `src/controllers/`.
6. The controller validates input, applies business rules, and calls one or more model methods.
7. Model files in `src/models/` execute SQL queries through the shared MySQL pool in `src/config/db.js`.
8. The controller formats the response, writes audit logs where needed, and returns JSON back to the frontend.

## Technology Stack

- Runtime: Node.js
- Framework: Express
- Database: MySQL using `mysql2/promise`
- Authentication: JWT
- Password hashing: `bcryptjs`
- File upload: `multer`
- Excel processing: `xlsx`, `exceljs`
- Email: `nodemailer`
- Environment config: `dotenv`

## Folder Structure

```text
lims_be/
├── docs/
│   └── KT/
│       └── Backend-Flow-Documentation.md
├── scripts/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── forestLandController.js
│   │   ├── govtKhataController.js
│   │   ├── govtPlotController.js
│   │   ├── khataController.js
│   │   ├── logController.js
│   │   ├── plotController.js
│   │   ├── projectController.js
│   │   ├── reportController.js
│   │   ├── roleController.js
│   │   ├── userController.js
│   │   └── villageController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── models/
│   │   ├── forestLandModel.js
│   │   ├── govtKhataModel.js
│   │   ├── govtPlotModel.js
│   │   ├── govtVillageModel.js
│   │   ├── khataModel.js
│   │   ├── logModel.js
│   │   ├── plotModel.js
│   │   ├── projectModel.js
│   │   ├── reportModel.js
│   │   ├── roleModel.js
│   │   ├── userModel.js
│   │   ├── userProjectModel.js
│   │   └── villageModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── forestLandRoutes.js
│   │   ├── govtKhataRoutes.js
│   │   ├── govtPlotRoutes.js
│   │   ├── khataRoutes.js
│   │   ├── logRoutes.js
│   │   ├── plotRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── roleRoutes.js
│   │   ├── userRoutes.js
│   │   └── villageRoutes.js
│   ├── uploads/
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   └── mailer.js
│   └── index.js
├── uploads/
├── .env
├── package.json
└── package-lock.json
```

## Responsibility of Each Layer

### 1. `src/index.js`

This is the application entry point.

- Loads environment variables.
- Creates the Express app.
- Enables CORS and JSON request parsing.
- Serves uploaded files through `/uploads`.
- Registers all route groups under `/api/...`.
- Applies `authMiddleware` to protected modules.

### 2. `src/config/db.js`

This file creates the shared MySQL connection pool using:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

All models import this pool and run SQL queries through it.

### 3. `src/middleware/`

#### `authMiddleware.js`

- Reads the `Authorization` header.
- Extracts the bearer token.
- Verifies JWT using `utils/jwt.js`.
- Stores decoded user details in `req.user`.
- Blocks unauthorized requests with `401`.

#### `upload.js`

Central upload middleware for all file types:

- Profile images
- Private plot Excel files
- Government plot Excel files
- Khata documents
- KMZ map files
- Payment proofs
- Forest stage documents
- EDS documents

Each upload type uses its own target folder and validation rules.

### 4. `src/routes/`

Each route file maps HTTP endpoints to controller functions.

Examples:

- `authRoutes.js` handles login, user creation, password reset
- `projectRoutes.js` handles project CRUD
- `plotRoutes.js` handles private land plot upload, CRUD, and payment flow
- `govtPlotRoutes.js` handles government land plot upload, CRUD, and payment flow
- `forestLandRoutes.js` handles forest schedules, forest project stages, and stage document access
- `dashboardRoutes.js` handles dashboard summary APIs
- `reportRoutes.js` handles reporting APIs

### 5. `src/controllers/`

Controllers contain the business logic:

- Request validation
- Data normalization
- Cross-module coordination
- File processing
- Logging
- Response formatting

Controllers may call multiple models in one request when data must stay synchronized.

### 6. `src/models/`

Models are responsible for direct database access.

They contain:

- `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Bulk import logic
- Aggregate queries for dashboard/reporting
- Cross-table update helpers

### 7. `src/utils/`

#### `jwt.js`

- Generates login token
- Verifies JWT
- Generates password reset token

#### `logger.js`

- Writes audit logs into the logs table using `logModel.js`

#### `mailer.js`

- Sends forgot-password/reset emails

## API Mounting Structure

The backend exposes these main route groups:

- `/api/auth`
- `/api/user`
- `/api/role`
- `/api/project`
- `/api/log`
- `/api/plots`
- `/api/govtplots`
- `/api/village`
- `/api/khata`
- `/api/govtkhata`
- `/api/report`
- `/api/forestland`
- `/api/getDashboardData` and `/api/govtDashboardData` through dashboard routes

Except for login and password reset endpoints, most APIs are protected by JWT middleware.

## Request Flow

### Standard Request Flow

```text
Frontend Request
   ->
Express App (`src/index.js`)
   ->
Route File (`src/routes/*.js`)
   ->
Middleware (auth/upload if applicable)
   ->
Controller (`src/controllers/*.js`)
   ->
Model (`src/models/*.js`)
   ->
MySQL Database
   ->
Controller Response
   ->
Frontend
```

### Protected Request Flow

```text
Client sends Bearer token
   ->
`authMiddleware.js`
   ->
JWT verified
   ->
Decoded user saved in `req.user`
   ->
Controller uses `req.user.id` and `req.user.role_id`
```

## Authentication Integration

The authentication module is handled mainly by:

- `src/routes/authRoutes.js`
- `src/controllers/authController.js`
- `src/models/userModel.js`
- `src/models/userProjectModel.js`
- `src/models/roleModel.js`
- `src/utils/jwt.js`
- `src/utils/mailer.js`

### Login Flow

1. Frontend sends email and password to `/api/auth/login`.
2. Controller fetches user by email.
3. Password is verified with `bcryptjs`.
4. Role is fetched and attached to the response.
5. User project access is loaded from `user_projects`.
6. JWT token is generated.
7. Response includes:
   - user info
   - project access
   - token

### User Creation Flow

1. Admin calls `/api/auth/createUser`.
2. Optional profile image is uploaded.
3. Role is validated.
4. Password is hashed.
5. User is inserted into `users`.
6. Project access mappings are inserted into `user_projects`.
7. Action is logged in `logs`.

### Password Reset Flow

1. User calls `/api/auth/forgot-password`.
2. Backend creates a short-lived reset token.
3. Token is stored in the `users` table.
4. Reset link is emailed using Nodemailer.
5. User submits new password to `/api/auth/reset-password`.
6. Token is verified and matched against the stored token.
7. Password hash is updated and reset token is cleared.

## Backend Integration by Module

### 1. Project Module

Files involved:

- `src/routes/projectRoutes.js`
- `src/controllers/projectController.js`
- `src/models/projectModel.js`

Integration points:

- Projects are the top-level container for land records.
- User-to-project mapping is stored in `user_projects`.
- Private, govt, and forest modules depend on `project_id`.
- Updating `client_code` triggers khata unique ID updates in the database.

### 2. Private Land Module

Files involved:

- `src/routes/plotRoutes.js`
- `src/controllers/plotController.js`
- `src/models/plotModel.js`
- `src/models/villageModel.js`
- `src/models/khataModel.js`

Key integrations:

- Excel upload inserts villages, plots, and khatas together.
- Manual plot creation also syncs related village/khata records.
- Uploaded Excel metadata is stored in plot document tables.
- Payment processing writes to the shared `plot_payments` table.
- Export feature generates Excel output for frontend download.

#### Private Land Upload Flow

```text
Excel Upload
   ->
`uploadPlotExcel`
   ->
`plotController.uploadPlots`
   ->
Read Excel with `xlsx`
   ->
Insert villages
   ->
Bulk insert plots
   ->
Insert/update khatas
   ->
Store uploaded file metadata
   ->
Return success response
```

#### Private Land Payment Flow

```text
Plot selected for payment
   ->
`paymentReady`
   ->
Plot status updated
   ->
Payment rows created in `plot_payments`
   ->
Payment proof uploaded later
   ->
Payment details updated
   ->
Payment marked complete
   ->
Plot payment status updated to `complete`
```

### 3. Government Land Module

Files involved:

- `src/routes/govtPlotRoutes.js`
- `src/controllers/govtPlotController.js`
- `src/models/govtPlotModel.js`
- `src/models/govtVillageModel.js`
- `src/models/govtKhataModel.js`

Key integrations:

- Flexible Excel headers are supported during govt plot upload.
- Govt village and govt khata are synchronized before govt plot insert.
- Govt plot supports file attachments per plot record.
- Payment flow also uses the shared `plot_payments` table.
- Payment grouping is done lease-case-wise for government land.

#### Government Land Upload Flow

```text
Govt plot Excel upload
   ->
Flexible header normalization
   ->
Required column validation
   ->
Upsert villages
   ->
Upsert govt khatas
   ->
Bulk insert/update govt plots
   ->
Store uploaded Excel file metadata
```

#### Government Plot Manual Entry Flow

```text
Frontend submits form + attachments
   ->
`uploadGovtPlotAttachments`
   ->
Controller normalizes values
   ->
Attachment-based validations
   ->
Village and khata sync
   ->
Govt plot insert
   ->
Audit log entry
```

#### Government Payment Flow

```text
Plot marked as `processing`
   ->
Lease case count resolved from govt khata
   ->
Payment records created in `plot_payments`
   ->
Demand note/payment proof uploaded
   ->
Payment fields updated
   ->
Lease-case-wise completion
   ->
Govt plot payment status updated
```

### 4. Forest Land Module

Files involved:

- `src/routes/forestLandRoutes.js`
- `src/controllers/forestLandController.js`
- `src/models/forestLandModel.js`

Key integrations:

- Forest schedule upload accepts Excel files with flexible headers.
- Forest workflow is split into:
  - land schedule
  - forest project master
  - EDS document handling
  - Stage 0
  - Stage 1
  - Stage 2
  - Post-clearance
- Each stage has its own upload bucket and validation rules.
- Stage document URLs are dynamically built for inline view and download.

#### Forest Workflow Integration

```text
Forest schedule upload
   ->
Excel parsing and normalization
   ->
Forest land records inserted/updated
   ->
Forest project created
   ->
EDS documents uploaded
   ->
Stage 0 data + documents
   ->
Stage 1 data + documents
   ->
Stage 2 data + documents
   ->
Post-clearance data + documents
```

### 5. Dashboard Module

Files involved:

- `src/routes/dashboardRoutes.js`
- `src/controllers/dashboardController.js`
- `src/models/projectModel.js`
- `src/models/plotModel.js`
- `src/models/govtPlotModel.js`
- `src/models/khataModel.js`
- `src/models/govtKhataModel.js`
- `src/models/villageModel.js`
- `src/models/logModel.js`

Integration points:

- Role-based project filtering is applied before aggregation.
- Admin can see all projects.
- Other users can see only assigned projects.
- Dashboard APIs combine counts from multiple tables.
- Recent activity comes from audit logs.

### 6. Report Module

Files involved:

- `src/routes/reportRoutes.js`
- `src/controllers/reportController.js`
- `src/models/reportModel.js`

Integration points:

- Khata summary reporting
- Khata document completeness tracking
- Village-level land register reporting
- Uploaded khata documents are exposed with generated URLs

## Upload Folder Mapping

The backend stores files in different upload folders based on business module:

- `uploads/excels` for private plot Excel files
- `uploads/profile_pics` for user profile images
- `uploads/khata` for private khata documents
- `uploads/maps` for private KMZ files
- `uploads/land_cost_payments` for private payment proofs
- `uploads/govt_plots` for government plot attachments
- `uploads/govt_plot_excels` for government plot Excel files
- `uploads/govt_khata` for government khata files
- `uploads/govt_maps` for government KMZ files
- `uploads/forest_land_excels` for forest schedule uploads
- `uploads/eds` for forest EDS documents
- `uploads/stage0` for forest Stage 0 documents
- `uploads/stage1` for forest Stage 1 documents
- `uploads/stage2` for forest Stage 2 documents
- `uploads/post_clearance` for forest post-clearance documents

These files are served publicly through the Express static mount:

```text
/uploads/*
```

## Logging and Audit Trail

Audit logging is implemented through:

- `src/utils/logger.js`
- `src/models/logModel.js`

Common actions that are logged:

- signup
- login
- create/update/delete user
- create/update/delete project
- plot uploads
- govt plot uploads
- payment actions

Each log can store:

- `userId`
- action name
- status
- message
- request payload
- response payload

## Role-Based Access Integration

Role-based behavior is used in multiple places:

- Protected APIs require JWT
- Dashboard results depend on `role_id`
- Project list depends on assigned projects
- New project creation auto-assigns the project to users with role `2`
- User access is mapped through `user_projects`

## Important Backend Design Notes

- The application uses a classic route -> controller -> model structure.
- SQL is written directly in model files instead of using an ORM.
- Private land and government land share some concepts but use separate controllers/models.
- Payment records for private and government land are both stored in `plot_payments`, distinguished by `type`.
- Forest land is the most workflow-heavy module and includes stage-wise document lifecycle management.
- File URLs are sometimes adjusted based on whether the host contains `localhost`.

## Suggested Integration Understanding for Frontend Team

When integrating frontend screens with this backend, treat the system in these groups:

1. Core access layer
   - Login
   - JWT storage
   - User/project access

2. Master data layer
   - Roles
   - Users
   - Projects

3. Private land operations
   - Plot Excel upload
   - Plot listing
   - Khata and village linkage
   - Payment flow

4. Government land operations
   - Excel upload
   - Manual plot entry with attachments
   - Lease-case-based payment flow

5. Forest operations
   - Schedule upload
   - Forest project master
   - EDS
   - Stage 0 to Post-clearance

6. Reporting and dashboards
   - Dashboard counts
   - Khata summary
   - Village report

## Conclusion

This backend is organized around business modules, with strong separation between routing, business logic, and database access. The main integration pattern is consistent across modules, while land-specific flows add their own validation, upload handling, and cross-table synchronization.

# VaultHub - Student Document Vault System

## 1. Project Overview

### Description
**VaultHub - Student Document Vault System** is a web-based application designed to provide students with a secure and centralized platform for storing, organizing, and retrieving academic documents such as certificates, transcripts, resumes, identification cards, and clearances. The system applies information security principles through secure authentication, password hashing, activity logging, and file encryption to protect sensitive information from unauthorized access. In addition, the system incorporates a subscription-based storage upgrade feature using PayMongo's sandbox environment to simulate real-world digital payment transactions and demonstrate secure payment processing within a web application.

### Problem Statement
Many students store important academic documents across multiple platforms such as personal devices, USB flash drives, messaging applications, and cloud storage services. This fragmented approach often leads to difficulties in organizing and retrieving files, increases the risk of document loss due to device failure or accidental deletion, and exposes sensitive information to unauthorized access when proper security measures are not implemented. Furthermore, students and aspiring developers have limited opportunities to understand how modern web applications implement authentication, encryption, password protection, and secure payment transactions in practical scenarios.

### Proposed Solution
The proposed solution is the development of VaultHub, a secure web-based document repository that allows students to upload, organize, and manage academic documents in a centralized environment protected by authentication, password hashing, activity logging, and file encryption mechanisms. The system will also provide subscription-based storage upgrades through PayMongo's testing environment, enabling users to experience a realistic payment workflow while demonstrating secure transaction processing and automated storage allocation within a controlled academic setting.

### Objectives
* **General Objective:**
  To develop a secure Student Document Vault System that demonstrates the implementation of authentication, password hashing, activity logging, encrypted document management, and payment-based storage subscriptions.
* **Specific Objectives:**
  1. To implement secure authentication, password hashing, and activity logging mechanisms to protect user accounts and monitor system access.
  2. To develop an encrypted document management system that allows authorized users to securely upload, organize, and retrieve academic documents.
  3. To integrate a simulated payment and subscription feature that demonstrates secure transaction processing and automated storage upgrades.

---

## 2. Scope & Limitations of the Study

### Scope of the Study
The study covers the development of a web-based Student Document Vault System that allows students to register and manage user accounts, securely upload and organize academic documents, retrieve authorized files, monitor storage usage, and manage subscriptions. The system includes secure authentication, password hashing, activity logging, file encryption and decryption, document categorization, storage management, and a subscription module integrated with PayMongo's sandbox environment for payment simulation. Administrative functions are limited to user monitoring, activity log viewing, and storage oversight necessary for system management.

### Limitations of the Study
The system is intended solely for academic and demonstration purposes and does not aim to replace commercial cloud storage platforms or enterprise document management solutions. The payment module utilizes PayMongo's testing environment and does not process actual financial transactions. The system is limited to student users, academic document storage, predefined subscription plans, and simulated storage quotas. Advanced features such as document sharing, collaboration, government document verification, multi-organization support, and enterprise-grade security compliance are outside the scope of the study.

---

## 3. System Requirements & Specifications (from Project Specification)

### Functional Requirements
| Name | Description |
| :--- | :--- |
| **User Registration** | The system shall allow users to create an account using required registration information. |
| **User Authentication** | The system shall authenticate users before granting access to protected resources. |
| **Password Hashing** | The system shall securely hash user passwords before storing them in the database. |
| **User Login and Logout** | The system shall allow users to securely log in and log out of their accounts. |
| **Activity Logging** | The system shall record login, logout, upload, download, and subscription activities for auditing purposes. |
| **Document Upload** | The system shall allow users to upload academic documents. |
| **File Encryption** | The system shall encrypt uploaded files before storing them in the server. |
| **Document Categorization** | The system shall allow users to organize documents into predefined categories. |
| **Document Retrieval** | The system shall allow authorized users to retrieve stored documents. |
| **File Decryption** | The system shall decrypt files during authorized retrieval or download. |
| **Document Deletion** | The system shall allow users to delete documents they own. |
| **Storage Monitoring** | The system shall display current storage consumption and available storage capacity. |
| **Subscription Plan Selection** | The system shall display available storage subscription plans. |
| **Payment Processing** | The system shall process subscription payments through PayMongo Sandbox. |
| **Transaction Recording** | The system shall record payment transaction details and statuses. |
| **Storage Upgrade** | The system shall automatically update user storage capacity after successful payment confirmation. |

### Non-Functional Requirements
| Name | Description |
| :--- | :--- |
| **Security** | The system shall implement secure authentication, password hashing, file encryption, and access control mechanisms. |
| **Performance** | The system shall respond to user requests within an acceptable time under normal operating conditions. |
| **Reliability** | The system shall maintain document availability and preserve stored data integrity. |
| **Usability** | The system shall provide a user-friendly interface that enables easy navigation and document management. |
| **Maintainability** | The system shall utilize a modular architecture to support future enhancements and maintenance. |

### Planned Technology Stack
| Technology | Description |
| :--- | :--- |
| **React** | Frontend JavaScript library used to build an interactive and responsive user interface. |
| **Vite** | Frontend build tool used to improve development speed and application performance. |
| **Django** | Backend web framework responsible for business logic, API development, and security implementation. |
| **MySQL** | Relational database management system used for storing user, document, and transaction data. |
| **Argon2** | Password hashing algorithm used to securely protect user credentials. |
| **AES-256 Encryption** | Symmetric encryption algorithm used to encrypt uploaded documents before storage. |
| **PayMongo API** | Payment gateway testing environment used to simulate real-world digital payment transactions. |
| **Git & GitHub** | Version control and repository management tools used for collaborative development. |

---

## 4. Planned Development Phases & Activities (from Project Specification)

| Phase | Activity |
| :--- | :--- |
| **Phase 1: Security and Document Management Implementation** | This phase focuses on the planning, design, and development of the core system functionalities. It includes frontend and backend development, database integration, user authentication, password hashing, activity logging, document management, and file encryption and decryption. The phase concludes with security testing and a prototype demonstration of the system's core features. |
| **Phase 2: Payment Simulation and System Enhancement** | This phase focuses on enhancing the system through the implementation of subscription-based storage management and payment simulation. It includes user interface improvements, PayMongo Sandbox integration, transaction management, automated storage upgrades, and final system testing. The phase concludes with the final system demonstration and evaluation. |

### Detailed Phase Narrative
* **Phase 1:** Focuses on the design, development, and implementation of the core system functionalities related to document management and security. Activities include requirements gathering, user interface prototyping, frontend development using React, backend API development using Django REST Framework, and MySQL database integration. During this phase, the system's primary security mechanisms are implemented, including user authentication, password hashing using Argon2, activity logging, file upload management, and AES-256 file encryption and decryption. The phase concludes with integration testing and a prototype demonstration showcasing secure user registration, login, document storage, encrypted file handling, and audit logging capabilities.
* **Phase 2:** Focuses on enhancing the system through the addition of subscription-based storage management and payment simulation features. The frontend interface will be updated to support storage plan selection, subscription monitoring, and transaction history viewing. Backend services will be expanded to manage subscription records, storage allocation, transaction processing, and communication with the PayMongo Sandbox API. The system will simulate realistic payment workflows, allowing users to select subscription plans and complete test transactions without processing actual financial payments.

---

## 5. Current Implementation vs. Planned Implementation

The following matrix contrasts the current state of this web application prototype against the full planned system architecture:

| Component / Module | Planned Specification (PDF) | Current Implementation Status |
| :--- | :--- | :--- |
| **Frontend Framework & Tooling** | React + Vite | **Implemented:** Built using React 19, TypeScript, Vite 8, and Tailwind CSS v4. Includes responsive layouts, high-fidelity document visualizers, and Lucide icons. |
| **UI/UX Architecture** | Centralized, user-friendly student dashboard | **Implemented (Google Drive style):** Top navigation bar featuring the student profile avatar dropdown with account actions, and a sidebar dedicated to document folders, categories, and navigation. |
| **Document Categorization** | 5 Categories: Transcripts, Certificates, Resumes, Identification Cards, Clearances | **Implemented:** All 5 predefined categories are fully supported with category filtering, visual card thumbnails, and a "Starred & Important" tagging system. |
| **Document Upload & Retrieval** | Authorized upload, preview, download, and deletion | **Implemented:** Multi-step upload modal (with drag-and-drop, category selection, and starred tagging), in-browser document preview modal, download export, and delete confirmation modal. |
| **Storage Monitoring** | Track consumption and available capacity | **Implemented:** Interactive storage gauge visualizing quota consumption (500 MB baseline) and breakdown by document category. |
| **Activity Logging** | Record logins, logouts, uploads, downloads, and deletions | **Implemented (Client State):** Audit log view tracking timestamps, actions, IP address, device, and status. |
| **Backend Framework** | Django / Django REST Framework | **Pending Backend Phase:** Application currently functions as a client-side Single Page Application (SPA). Django REST API endpoints will be connected during backend integration. |
| **Database** | MySQL Relational Database | **Pending Backend Phase:** State is currently maintained in-memory (`useState`) initialized with structured mock datasets (`src/data/mockData.ts`). MySQL schema and persistence to be connected via Django. |
| **Password Hashing** | Argon2 password hashing stored in DB | **Modeled in UI:** Authentication interface and security safeguards model Argon2 password protection; actual server-side Argon2 hashing will be enforced upon Django/MySQL integration. |
| **File Encryption & Decryption** | AES-256 symmetric encryption before server storage | **Architectural Prototype:** Upload workflows model AES-256 encryption progress, document properties display SHA-256 integrity checksums, and downloading triggers a decrypted payload file. Real binary stream encryption to be executed server-side. |
| **Payment & Subscription** | PayMongo Sandbox API for simulated upgrades | **Planned for Phase 2:** Subscription tier selection, PayMongo checkout workflow, webhook listeners, and automatic storage upgrades are queued for Phase 2 development. |

---

## 6. How to Run the Current Prototype

### Prerequisites
* Node.js (v18+ recommended)
* npm or bun

### Setup & Launch
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

### Build Verification
To check for TypeScript compiler checks and build production assets:
```bash
npm run build
```

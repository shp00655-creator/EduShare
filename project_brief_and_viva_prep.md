# Project Brief & Viva Prep: Campus Notes Exchange Platform

This document outlines the system architecture, tech stack, datasets, security protocols, and an extensive list of examiner questions with answers for your campus notes exchange application.

---

## 1. Project Overview
The **Campus Notes Exchange Platform** is a full-stack, peer-to-peer collaborative application built to allow college students to share academic resources (PDF notes, PPT slides, study materials) within a campus. 

Key features include:
*   **Gamification**: An incentivized credit system where students earn credits for uploading notes (+10 credits) and when their notes are downloaded by others (+5 credits).
*   **Smart Search & Filters**: Search capability filtering resources by branch, semester, subject code/name, instructor, and tags.
*   **Interactive Peer Feedback**: Rating system (1-5 stars) and commenting capabilities.
*   **Admin Dashboard**: A secure module for administrators to monitor system metrics, manage reported files/users, and ban users violating academic integrity.
*   **Hybrid Mobile Ready**: Ready to be packaged into an Android app using Capacitor to operate on campus Wi-Fi.

---

## 2. Technology Stack & Development Tools

### Frontend (Client-side)
*   **React (v19) / Vite**: Vite is used as the build tool for blazing-fast Hot Module Replacement (HMR) and optimized build bundles.
*   **React Router DOM**: Manages client-side routing.
*   **Tailwind CSS**: A utility-first CSS framework for custom responsive styling.
*   **Framer Motion**: Handles micro-animations and smooth page transitions.
*   **Axios**: Performs asynchronous HTTP/API requests, featuring request interceptors to automatically append JWT bearer tokens.
*   **Lucide React**: Providing modern, consistent vector icons.
*   **Canvas Confetti**: Delivers immediate visual feedback during positive actions (like successful uploads).

### Backend (Server-side)
*   **Node.js & Express.js**: Handles the REST API routes, middlewares, controller business logic, and error handlers.
*   **Multer**: Handles `multipart/form-data` uploads, managing incoming file buffers from the user.
*   **Bcryptjs**: Implements salted password hashing.
*   **Jsonwebtoken (JWT)**: Generates secure user session tokens.
*   **Cloudinary SDK**: Acts as the production-grade remote storage service for PDF and image notes.

### Database (Data Store)
*   **MongoDB & Mongoose**: A NoSQL document database used with the Mongoose Object Data Modeling (ODM) library to enforce schemas, validate data, and run pre-save database triggers.

---

## 3. Database Datasets & Schemas

The application is structured around three primary database collections:

### A. User Schema (`User.js`)
Stores account credentials, profile configurations, bookmarks, and accumulated credits.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  rollNumber: { type: String },
  branch: { type: String },
  semester: { type: String },
  profilePicture: { type: String, default: "" },
  profilePicturePublicId: { type: String, default: "" },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  credits: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false }
}
```

### B. Note Schema (`Note.js`)
Stores resource metadata, uploader links, user ratings, and nested comment sub-documents.
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  unit: { type: String },
  teacherName: { type: String },
  tags: [{ type: String }],
  fileUrl: { type: String, required: true },
  publicId: { type: String, default: "" },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  ratings: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 1, max: 5 }
  }],
  averageRating: { type: Number, default: 0 },
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    timestamps: true
  }]
}
```

### C. Report Schema (`Report.js`)
Used for maintaining accountability and moderation.
```javascript
{
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
}
```

---

## 4. Security Protocols Implemented

1.  **Salted Password Hashing**: Passwords are never stored in plain text. A Mongoose pre-save hook intercepts password edits, generates a cryptographic salt using `bcryptjs` (10 rounds), and hashes the password before insertion.
2.  **JWT Authentication**: API routes are protected by JSON Web Tokens. Authenticated endpoints require a `Bearer <JWT_TOKEN>` header.
3.  **Dynamic Token Parsing**: The authentication middleware accepts tokens from both headers and URL query parameters, allowing file downloads to be requested securely via direct links.
4.  **Role-Based Access Control (RBAC)**: Admin routes are guarded by [`adminMiddleware.js`](file:///c:/Users/PAWAN/OneDrive/Desktop/industrial/server/middleware/adminMiddleware.js) which verifies if `req.user.role === 'admin'` before letting users perform operations like deleting notes or banning users.
5.  **Banishment Validation**: Every protected route runs a query check in [`authMiddleware.js`](file:///c:/Users/PAWAN/OneDrive/Desktop/industrial/server/middleware/authMiddleware.js) to ensure `isBanned` is false. Banned accounts are locked out immediately.
6.  **Input File Validation**: Multer middleware implements a strict whitelist filter allowing only `.pdf`, `.ppt`, `.pptx`, `.jpg`, `.jpeg`, and `.png` extensions. A strict size limit of 25MB prevents server resource exhaustion.
7.  **Dynamic Networking Resolution**: The client avoids hardcoded backend endpoints during browser testing by using a dynamic hostname resolver (`window.location.hostname`), preventing static IP mismatch errors when Wi-Fi networks change.
8.  **Cloud-to-Local Fallback Storage**: The backend checks if Cloudinary is configured. If not, it falls back to a protected local uploads path (`server/uploads`), which is served statically via Express.

---

## 5. Potential Examiner (Viva) Questions & Answers

### Q1: What architecture does this application follow?
**Answer**: It follows a **Three-Tier Architecture**:
1.  **Presentation Tier**: Built using React.js and Tailwind CSS (Single Page Application).
2.  **Logic Tier**: Built with Node.js and Express.js REST APIs.
3.  **Data Tier**: Built with MongoDB (NoSQL) database, accessed via Mongoose ODM.

### Q2: Why did you choose MongoDB over a SQL database like MySQL?
**Answer**: Academic notes contain unstructured, variable data (varying metadata like units, custom tags, dynamic lists of comments, and ratings). MongoDB's document model allows us to easily embed schemas (like comments and ratings) directly within a single Note document. This avoids complex SQL JOIN tables, increases read performance, and provides schema flexibility during development.

### Q3: How do comments work? Are they in a separate table?
**Answer**: No. Comments are stored as an **embedded subdocument array** within the `Note` document. Since comments are only queried and shown when viewing a specific note, storing them directly inside the parent Note document eliminates database join operations and makes retrieval highly efficient.

### Q4: Explain how password security is maintained.
**Answer**: Passwords are hashed using `bcryptjs`. We use a Mongoose **pre-save middleware hook** on the User model. Whenever a user registers or changes their password, the hook intercepts the save operation, generates a unique salt (cryptographic noise) with 10 rounds, hashes the password, and overrides the plaintext password. A custom model method `comparePassword` compares the incoming plaintext password with the database hash using bcrypt's secure comparison.

### Q5: What is JWT, and how is it used here?
**Answer**: JSON Web Token is a stateless authentication standard. When a user logs in, the backend encodes their user ID in a cryptographically signed token and returns it to the client. The client stores it in `localStorage` and appends it to the `Authorization: Bearer <token>` header of subsequent API requests. The backend decrypts this signature to authorize the user without performing database lookups for session states.

### Q6: How does the server prevent a malicious user from uploading dangerous files (e.g. an executable `.exe` script)?
**Answer**: File uploads are secured via the custom [`uploadMiddleware.js`](file:///c:/Users/PAWAN/OneDrive/Desktop/industrial/server/middleware/uploadMiddleware.js) using Multer. It runs a `fileFilter` validation that checks the file extension against a whitelist (`.pdf`, `.ppt`, `.pptx`, `.jpg`, `.jpeg`, `.png`). If a file fails the extension check, it is rejected before the buffer is processed. Additionally, a size limit of 25MB is enforced.

### Q7: If you run your application across college Wi-Fi, how do mobile phones connect to the backend?
**Answer**: A mobile device cannot connect to `localhost:5000`. Instead, the backend binds to the developer machine's Wi-Fi network interface IP address (e.g. `10.21.254.159`). The frontend uses this IP address inside the `.env` configuration file (`VITE_API_URL`) to send API requests over the local area network (LAN).

### Q8: What does the pre-save hook in `Note.js` accomplish?
**Answer**: When a user rates a note, the rating score is pushed to the `ratings` subdocument array. The Mongoose pre-save hook evaluates if the `ratings` field was modified. If it was, it calculates the new arithmetic average rating and updates the `averageRating` field automatically before committing it to MongoDB. This ensures that frontend queries do not have to calculate the average on-the-fly, reducing server CPU utilization.

### Q9: How is gamification handled? Is there a race condition when updating credits?
**Answer**: Credits are updated on actions: +10 credits for note upload, and +5 credits when another user downloads a note. To prevent race conditions, the user record is updated directly using MongoDB document saving. For absolute scalability, MongoDB atomic update operations (like `$inc`) can be used to increment credits directly in the database.

### Q10: How does your React app communicate with your Express backend?
**Answer**: They communicate via **asynchronous REST APIs** over HTTP. We use the Axios client on the frontend. Axios is configured with a base URL matching our backend port (`5000`). It has request interceptors that automatically read the JWT token from browser `localStorage` and inject it into the HTTP headers for all outgoing API requests.

### Q11: What is CORS, and why did you use it?
**Answer**: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts resources from being loaded from another domain. Since the React app runs on port `5173` (Vite) and the backend runs on port `5000`, the browser blocks communication by default. We imported the `cors` middleware in Express to explicitly allow cross-origin requests.

### Q12: How are files stored in this project?
**Answer**: The project supports a **Hybrid Storage System**:
1.  **Cloud Storage (Cloudinary)**: If Cloudinary credentials are set in the `.env` file, Multer loads the file into memory buffer and streams it securely to Cloudinary, saving a secure URL in MongoDB.
2.  **Local Storage (Fallback)**: If offline or run on a local network without Cloudinary config, the files are written directly to the server's local disk in a `/uploads` folder, which Express serves as static files.

### Q13: What happens if a user is banned? Do they stay logged in?
**Answer**: Even if they have a valid JWT token stored in their browser, the JWT verification middleware in [`authMiddleware.js`](file:///c:/Users/PAWAN/OneDrive/Desktop/industrial/server/middleware/authMiddleware.js) fetches the user's current record on every protected request. The middleware checks if `user.isBanned === true`. If banned, it immediately rejects the request with a `403 Forbidden` status code, logging them out of system functions.

### Q14: How does search work under the hood?
**Answer**: The note search endpoint uses MongoDB queries with **Regular Expressions** (`$regex`) and logical `OR` queries (`$or`). It matches the user's search term against the `title`, `subject`, `description`, `teacherName`, and checks if the term is present in the `tags` array (`$in`).

### Q15: How would you convert this web app into a mobile application?
**Answer**: We can wrap the React build directory (`dist/`) using **Capacitor**. Capacitor initializes a native wrapper container, generating an Android Studio project. Inside the native container, the compiled frontend runs in a native WebView component and routes API calls to the server running on the campus IP. We then compile this into a standalone `.apk` file for students.

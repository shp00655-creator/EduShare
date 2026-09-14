# Android App & Campus Deployment Plan

This guide outlines how to adapt your existing React + Express + MongoDB web application into an Android application that can be run and accessed across a college campus.

---

## 1. Choosing the Android Approach

To turn your React frontend into an Android app, you have three primary approaches:

| Approach | Reuse Web Code | Development Speed | Performance | Distribution method |
| :--- | :---: | :---: | :---: | :--- |
| **Capacitor (Hybrid Wrapper)** <br> *(Recommended)* | **100%** | **Fastest** (1-2 hours) | Good | Build `.apk` directly |
| **Progressive Web App (PWA)** | **100%** | **Fast** | Good | "Add to Home Screen" from browser |
| **React Native (Rebuild Frontend)** | **~20%** | **Slow** (Weeks) | Excellent | Build `.apk` or Play Store |

### Recommended Choice: **Capacitor**
Capacitor (by Ionic) wraps your existing React production bundle into a native Android container (`WebView`). It allows you to package your current UI as a native `.apk` file that students can install on their phones, while communicating with your Node.js/Express backend.

---

## 2. Architecture & Networking for Campus Use

Currently, your frontend connects to the backend at `localhost` (or `127.0.0.1`). Mobile devices on the campus network cannot resolve `localhost` to your computer. You must change your network topology.

### Networking Options

```mermaid
graph TD
    subgraph Local Campus Wi-Fi Setup
        PC[Developer PC / Local Server] <--> Router[Campus Wi-Fi Router]
        Android[Student Android App] <--> Router
        Router -.-> |Connect via Local IP: 192.168.x.x:5000| PC
    end
    subgraph Cloud Setup (Alternative)
        AndroidCloud[Student Android App] <--> Internet[Internet]
        Internet <--> CloudBackend[Render/Railway Backend]
        CloudBackend <--> DB[MongoDB Atlas]
    end
```

#### A. Local Campus Network (No Cloud Cost)
* Both the server hosting the backend and the students' Android phones must be connected to the **same campus Wi-Fi network**.
* You configure the backend to bind to your machine's **Local IP Address** (e.g., `192.168.1.45` or `10.x.x.x`) instead of `localhost`.
* **Pros:** Totally free; very fast; doesn't require internet access if the local network is isolated.
* **Cons:** The server computer must remain turned on and connected to the Wi-Fi.

#### B. Cloud Hosting (Production Ready)
* Deploy the Node.js backend to a service like **Render**, **Railway**, or **Heroku**.
* Migrate the local MongoDB database to **MongoDB Atlas** (Free tier).
* Host file uploads using **Cloudinary** (since local storage files will get deleted on server restarts in standard cloud hostings).
* **Pros:** Accessible anywhere (inside/outside campus), stable, doesn't depend on your PC being active.
* **Cons:** Requires internet access.

---

## 3. Step-by-Step Implementation with Capacitor

If you decide to go with the **Capacitor** approach, here is the roadmap:

### Step 3.1: Prep the Frontend Configuration
In your client environment configuration (like `.env` or configuration files), update the API Base URL to use the server's network address:
* For local campus Wi-Fi testing: `VITE_API_URL=http://192.168.x.x:5000/api`
* For cloud deployment: `VITE_API_URL=https://your-app-backend.onrender.com/api`

### Step 3.2: Install Capacitor in React Project
Run the following commands in your `client` directory:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Campus Notes" "com.campusnotes.app" --web-dir=dist
```

### Step 3.3: Install Android Platform tools
1. Install [Android Studio](https://developer.android.com/studio) on your computer.
2. Install the Capacitor Android platform package:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

### Step 3.4: Build and Sync
Every time you update your React code:
1. Build the React project:
   ```bash
   npm run build
   ```
2. Copy the built files into the Android project:
   ```bash
   npx cap sync
   ```
3. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```

### Step 3.5: Generate the `.apk` File
1. In Android Studio, wait for Gradle sync to complete.
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Once completed, Android Studio will present a link to locate the compiled `.apk` file.
4. You can share this `.apk` file with campus students via Google Drive, WhatsApp, QR code, or local download link.

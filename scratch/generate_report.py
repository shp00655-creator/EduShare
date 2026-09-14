# -*- coding: utf-8 -*-
"""
Script to generate the comprehensive Academic & Industrial Project Report
for the 'Campus Notes Exchange Platform' and convert it to a pristine PDF.
"""

import os
import base64
import subprocess

def get_b64(path):
    if not os.path.exists(path):
        return ""
    ext = path.split('.')[-1].lower()
    mime = "image/png" if ext == "png" else "image/jpeg"
    with open(path, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode('utf-8')}"

univ_logo = get_b64("scratch/logo_university.png")
company_logo = get_b64("scratch/logo_company.jpeg")
institute_logo = get_b64("scratch/logo3.jpeg")

# SVG Diagram 1: System Architecture
svg_architecture = """
<svg viewBox="0 0 900 480" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:12px; border:1px solid #cbd5e1; margin:15px 0;">
  <!-- Header Bar -->
  <rect x="0" y="0" width="900" height="40" fill="#1e3a8a" rx="12" ry="12"/>
  <rect x="0" y="25" width="900" height="15" fill="#1e3a8a"/>
  <text x="450" y="26" fill="#ffffff" font-size="16" font-family="'Segoe UI', Arial, sans-serif" font-weight="bold" text-anchor="middle">THREE-TIER SYSTEM ARCHITECTURE &amp; DEPLOYMENT TOPOLOGY</text>

  <!-- Presentation Tier (Client) -->
  <g transform="translate(40, 65)">
    <rect width="240" height="380" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
    <rect width="240" height="40" rx="10" fill="#3b82f6"/>
    <rect y="25" width="240" height="15" fill="#3b82f6"/>
    <text x="120" y="26" fill="#ffffff" font-size="14" font-family="'Segoe UI', Arial, sans-serif" font-weight="bold" text-anchor="middle">1. PRESENTATION TIER</text>
    
    <rect x="15" y="55" width="210" height="50" rx="6" fill="#ffffff" stroke="#93c5fd"/>
    <text x="120" y="77" fill="#1e40af" font-size="12" font-weight="bold" text-anchor="middle">React 19 (SPA)</text>
    <text x="120" y="93" fill="#64748b" font-size="11" text-anchor="middle">Vite HMR &amp; Build Bundler</text>
    
    <rect x="15" y="115" width="210" height="50" rx="6" fill="#ffffff" stroke="#93c5fd"/>
    <text x="120" y="137" fill="#1e40af" font-size="12" font-weight="bold" text-anchor="middle">Tailwind CSS &amp; Framer Motion</text>
    <text x="120" y="153" fill="#64748b" font-size="11" text-anchor="middle">Responsive UI &amp; Micro-animations</text>

    <rect x="15" y="175" width="210" height="50" rx="6" fill="#ffffff" stroke="#93c5fd"/>
    <text x="120" y="197" fill="#1e40af" font-size="12" font-weight="bold" text-anchor="middle">Axios HTTP Client</text>
    <text x="120" y="213" fill="#64748b" font-size="11" text-anchor="middle">JWT Request/Response Interceptors</text>

    <rect x="15" y="235" width="210" height="55" rx="6" fill="#ffffff" stroke="#93c5fd"/>
    <text x="120" y="257" fill="#1e40af" font-size="12" font-weight="bold" text-anchor="middle">UI Pages &amp; Modals</text>
    <text x="120" y="273" fill="#64748b" font-size="10.5" text-anchor="middle">Explore, Upload, Leaderboard, Admin</text>

    <rect x="15" y="300" width="210" height="60" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-dasharray="4"/>
    <text x="120" y="322" fill="#1d4ed8" font-size="12" font-weight="bold" text-anchor="middle">Capacitor Native Container</text>
    <text x="120" y="338" fill="#1e40af" font-size="11" text-anchor="middle">Android WebView APK Wrapper</text>
  </g>

  <!-- Connectors Client -> Logic -->
  <path d="M 285 240 L 325 240" stroke="#2563eb" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
  <text x="305" y="230" fill="#1e3a8a" font-size="10" font-weight="bold" text-anchor="middle">REST / JSON</text>
  <text x="305" y="255" fill="#475569" font-size="9" text-anchor="middle">Bearer JWT</text>

  <!-- Application / Logic Tier -->
  <g transform="translate(330, 65)">
    <rect width="240" height="380" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
    <rect width="240" height="40" rx="10" fill="#22c55e"/>
    <rect y="25" width="240" height="15" fill="#22c55e"/>
    <text x="120" y="26" fill="#ffffff" font-size="14" font-family="'Segoe UI', Arial, sans-serif" font-weight="bold" text-anchor="middle">2. APPLICATION TIER</text>
    
    <rect x="15" y="55" width="210" height="50" rx="6" fill="#ffffff" stroke="#86efac"/>
    <text x="120" y="77" fill="#15803d" font-size="12" font-weight="bold" text-anchor="middle">Node.js &amp; Express.js</text>
    <text x="120" y="93" fill="#64748b" font-size="11" text-anchor="middle">RESTful API Routing &amp; Controllers</text>
    
    <rect x="15" y="115" width="210" height="50" rx="6" fill="#ffffff" stroke="#86efac"/>
    <text x="120" y="137" fill="#15803d" font-size="12" font-weight="bold" text-anchor="middle">Security &amp; Auth Guards</text>
    <text x="120" y="153" fill="#64748b" font-size="11" text-anchor="middle">JWT Verification &amp; isBanned Check</text>

    <rect x="15" y="175" width="210" height="50" rx="6" fill="#ffffff" stroke="#86efac"/>
    <text x="120" y="197" fill="#15803d" font-size="12" font-weight="bold" text-anchor="middle">Multer Upload Pipeline</text>
    <text x="120" y="213" fill="#64748b" font-size="11" text-anchor="middle">File Type Whitelist (25MB Limit)</text>

    <rect x="15" y="235" width="210" height="55" rx="6" fill="#ffffff" stroke="#86efac"/>
    <text x="120" y="257" fill="#15803d" font-size="12" font-weight="bold" text-anchor="middle">Gamification Logic Engine</text>
    <text x="120" y="273" fill="#64748b" font-size="11" text-anchor="middle">+10 Upload / +5 Download Rules</text>

    <rect x="15" y="300" width="210" height="60" rx="6" fill="#ffffff" stroke="#86efac"/>
    <text x="120" y="322" fill="#15803d" font-size="12" font-weight="bold" text-anchor="middle">Admin Moderation Service</text>
    <text x="120" y="338" fill="#64748b" font-size="11" text-anchor="middle">RBAC, User Ban, Content Cleanup</text>
  </g>

  <!-- Connectors Logic -> Data -->
  <path d="M 575 240 L 615 240" stroke="#16a34a" stroke-width="3" fill="none" marker-end="url(#arrow-green)"/>
  <text x="595" y="230" fill="#166534" font-size="10" font-weight="bold" text-anchor="middle">Mongoose</text>
  <text x="595" y="255" fill="#475569" font-size="9" text-anchor="middle">BSON / TCP</text>

  <!-- Data & Storage Tier -->
  <g transform="translate(620, 65)">
    <rect width="240" height="380" rx="10" fill="#fdf4ff" stroke="#c026d3" stroke-width="2"/>
    <rect width="240" height="40" rx="10" fill="#c026d3"/>
    <rect y="25" width="240" height="15" fill="#c026d3"/>
    <text x="120" y="26" fill="#ffffff" font-size="14" font-family="'Segoe UI', Arial, sans-serif" font-weight="bold" text-anchor="middle">3. DATA &amp; STORAGE TIER</text>
    
    <rect x="15" y="55" width="210" height="60" rx="6" fill="#ffffff" stroke="#f0abfc"/>
    <text x="120" y="77" fill="#86198f" font-size="12" font-weight="bold" text-anchor="middle">MongoDB (NoSQL)</text>
    <text x="120" y="93" fill="#64748b" font-size="11" text-anchor="middle">Mongoose Document ODM</text>
    <text x="120" y="106" fill="#9333ea" font-size="10" text-anchor="middle">Users, Notes, Reports</text>
    
    <rect x="15" y="130" width="210" height="60" rx="6" fill="#ffffff" stroke="#f0abfc"/>
    <text x="120" y="152" fill="#86198f" font-size="12" font-weight="bold" text-anchor="middle">Embedded Subdocuments</text>
    <text x="120" y="168" fill="#64748b" font-size="11" text-anchor="middle">Ratings [ ] &amp; Comments [ ]</text>
    <text x="120" y="181" fill="#9333ea" font-size="10" text-anchor="middle">Zero SQL-Join Latency</text>

    <rect x="15" y="205" width="210" height="75" rx="6" fill="#ffffff" stroke="#f0abfc"/>
    <text x="120" y="227" fill="#86198f" font-size="12" font-weight="bold" text-anchor="middle">Cloudinary Storage (CDN)</text>
    <text x="120" y="243" fill="#64748b" font-size="11" text-anchor="middle">Cloud PDF / Image Delivery</text>
    <text x="120" y="259" fill="#0284c7" font-size="10" text-anchor="middle">Secure HTTPS Previews</text>

    <rect x="15" y="295" width="210" height="65" rx="6" fill="#f5d0fe" stroke="#a21caf" stroke-dasharray="4"/>
    <text x="120" y="317" fill="#701a75" font-size="12" font-weight="bold" text-anchor="middle">Local Storage Fallback</text>
    <text x="120" y="333" fill="#64748b" font-size="11" text-anchor="middle">Server /uploads Path</text>
    <text x="120" y="347" fill="#701a75" font-size="10" text-anchor="middle">Guarantees Offline Campus LAN</text>
  </g>

  <!-- Arrow Markers -->
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"/>
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a"/>
    </marker>
  </defs>
</svg>
"""

# SVG Diagram 2: DFD Level 0 Context Diagram
svg_dfd0 = """
<svg viewBox="0 0 800 300" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:12px; border:1px solid #cbd5e1; margin:15px 0;">
  <!-- External Entity: Student User -->
  <g transform="translate(40, 80)">
    <rect width="160" height="140" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <text x="80" y="30" fill="#1e3a8a" font-size="14" font-weight="bold" text-anchor="middle">STUDENT USER</text>
    <line x1="10" y1="45" x2="150" y2="45" stroke="#93c5fd"/>
    <text x="80" y="70" fill="#475569" font-size="11" text-anchor="middle">• Uploads Notes / PDFs</text>
    <text x="80" y="90" fill="#475569" font-size="11" text-anchor="middle">• Searches &amp; Filters</text>
    <text x="80" y="110" fill="#475569" font-size="11" text-anchor="middle">• Rates &amp; Comments</text>
    <text x="80" y="130" fill="#475569" font-size="11" text-anchor="middle">• Earns Credit Points</text>
  </g>

  <!-- Central System Process -->
  <g transform="translate(300, 50)">
    <circle cx="100" cy="100" r="95" fill="#f0fdf4" stroke="#16a34a" stroke-width="3"/>
    <text x="100" y="70" fill="#15803d" font-size="11" font-weight="bold" text-anchor="middle">0.0 CONTEXT PROCESS</text>
    <text x="100" y="95" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">CAMPUS NOTES</text>
    <text x="100" y="115" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">EXCHANGE &amp; GAMIFIED</text>
    <text x="100" y="135" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">LEARNING SYSTEM</text>
    <text x="100" y="160" fill="#64748b" font-size="10.5" text-anchor="middle">(Express REST API)</text>
  </g>

  <!-- External Entity: Administrator -->
  <g transform="translate(600, 80)">
    <rect width="160" height="140" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
    <text x="80" y="30" fill="#991b1b" font-size="14" font-weight="bold" text-anchor="middle">ADMINISTRATOR</text>
    <line x1="10" y1="45" x2="150" y2="45" stroke="#fca5a5"/>
    <text x="80" y="70" fill="#475569" font-size="11" text-anchor="middle">• Monitors Platform</text>
    <text x="80" y="90" fill="#475569" font-size="11" text-anchor="middle">• Resolves Reports</text>
    <text x="80" y="110" fill="#475569" font-size="11" text-anchor="middle">• Bans Abusive Users</text>
    <text x="80" y="130" fill="#475569" font-size="11" text-anchor="middle">• Deletes Violations</text>
  </g>

  <!-- Data Flow Lines: Student to System -->
  <path d="M 200 120 L 298 120" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="250" y="112" fill="#1e40af" font-size="9" text-anchor="middle">Upload, Search, Rate</text>

  <path d="M 298 170 L 200 170" stroke="#16a34a" stroke-width="2" marker-end="url(#arrow-green)"/>
  <text x="250" y="185" fill="#166534" font-size="9" text-anchor="middle">Notes, Credits, Rank</text>

  <!-- Data Flow Lines: Admin to System -->
  <path d="M 600 120 L 502 120" stroke="#dc2626" stroke-width="2" marker-end="url(#arrow-red)"/>
  <text x="550" y="112" fill="#991b1b" font-size="9" text-anchor="middle">Ban / Moderation Actions</text>

  <path d="M 502 170 L 600 170" stroke="#16a34a" stroke-width="2" marker-end="url(#arrow-green)"/>
  <text x="550" y="185" fill="#166534" font-size="9" text-anchor="middle">Reports &amp; Metrics</text>

  <defs>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626"/>
    </marker>
  </defs>
</svg>
"""

# SVG Diagram 3: Gamification Loop
svg_gamification = """
<svg viewBox="0 0 800 240" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:12px; border:1px solid #cbd5e1; margin:15px 0;">
  <!-- Step 1 -->
  <g transform="translate(30, 50)">
    <rect width="150" height="140" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="75" cy="40" r="22" fill="#3b82f6"/>
    <text x="75" y="47" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">1</text>
    <text x="75" y="85" fill="#1e3a8a" font-size="12" font-weight="bold" text-anchor="middle">Student Uploads</text>
    <text x="75" y="105" fill="#475569" font-size="10.5" text-anchor="middle">Shares PDF / Slides</text>
    <rect x="25" y="115" width="100" height="22" rx="4" fill="#dbeafe"/>
    <text x="75" y="130" fill="#1d4ed8" font-size="11" font-weight="bold" text-anchor="middle">+10 CREDITS</text>
  </g>

  <path d="M 185 120 L 225 120" stroke="#3b82f6" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Step 2 -->
  <g transform="translate(230, 50)">
    <rect width="150" height="140" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
    <circle cx="75" cy="40" r="22" fill="#22c55e"/>
    <text x="75" y="47" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">2</text>
    <text x="75" y="85" fill="#15803d" font-size="12" font-weight="bold" text-anchor="middle">Peer Discovers</text>
    <text x="75" y="105" fill="#475569" font-size="10.5" text-anchor="middle">Searches &amp; Previews</text>
    <rect x="20" y="115" width="110" height="22" rx="4" fill="#dcfce7"/>
    <text x="75" y="130" fill="#15803d" font-size="10" font-weight="bold" text-anchor="middle">Syllabus Match</text>
  </g>

  <path d="M 385 120 L 425 120" stroke="#22c55e" stroke-width="2.5" marker-end="url(#arrow-green)"/>

  <!-- Step 3 -->
  <g transform="translate(430, 50)">
    <rect width="150" height="140" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="2"/>
    <circle cx="75" cy="40" r="22" fill="#eab308"/>
    <text x="75" y="47" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">3</text>
    <text x="75" y="85" fill="#854d0e" font-size="12" font-weight="bold" text-anchor="middle">Peer Downloads</text>
    <text x="75" y="105" fill="#475569" font-size="10.5" text-anchor="middle">Downloads resource</text>
    <rect x="25" y="115" width="100" height="22" rx="4" fill="#fef08a"/>
    <text x="75" y="130" fill="#854d0e" font-size="11" font-weight="bold" text-anchor="middle">+5 CREDITS</text>
  </g>

  <path d="M 585 120 L 625 120" stroke="#eab308" stroke-width="2.5" marker-end="url(#arrow-gold)"/>

  <!-- Step 4 -->
  <g transform="translate(630, 50)">
    <rect width="140" height="140" rx="8" fill="#fdf4ff" stroke="#c026d3" stroke-width="2"/>
    <circle cx="70" cy="40" r="22" fill="#c026d3"/>
    <text x="70" y="47" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">4</text>
    <text x="70" y="85" fill="#86198f" font-size="12" font-weight="bold" text-anchor="middle">Leaderboard</text>
    <text x="70" y="105" fill="#475569" font-size="10.5" text-anchor="middle">Campus Ranking</text>
    <rect x="15" y="115" width="110" height="22" rx="4" fill="#f5d0fe"/>
    <text x="70" y="130" fill="#86198f" font-size="10" font-weight="bold" text-anchor="middle">Top Contributor</text>
  </g>

  <defs>
    <marker id="arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#eab308"/>
    </marker>
  </defs>
</svg>
"""

# SVG Diagram 4: ER Diagram
svg_erd = """
<svg viewBox="0 0 850 420" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:12px; border:1px solid #cbd5e1; margin:15px 0;">
  <!-- USER Collection -->
  <g transform="translate(30, 40)">
    <rect width="230" height="340" rx="8" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
    <rect width="230" height="35" rx="8" fill="#2563eb"/>
    <rect y="25" width="230" height="10" fill="#2563eb"/>
    <text x="115" y="24" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">USER SCHEMA (User.js)</text>
    
    <text x="15" y="60" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#dc2626">_id</tspan>: ObjectId (PK)</text>
    <text x="15" y="85" fill="#0f172a" font-size="11">name: String</text>
    <text x="15" y="110" fill="#0f172a" font-size="11">email: String (Unique)</text>
    <text x="15" y="135" fill="#0f172a" font-size="11">password: String (Bcrypt)</text>
    <text x="15" y="160" fill="#0f172a" font-size="11">rollNumber: String</text>
    <text x="15" y="185" fill="#0f172a" font-size="11">branch: String</text>
    <text x="15" y="210" fill="#0f172a" font-size="11">semester: String</text>
    <text x="15" y="235" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#16a34a">credits</tspan>: Number (default: 0)</text>
    <text x="15" y="260" fill="#0f172a" font-size="11">bookmarks: [ObjectId ref Note]</text>
    <text x="15" y="285" fill="#0f172a" font-size="11">role: 'user' | 'admin'</text>
    <text x="15" y="310" fill="#0f172a" font-size="11">isBanned: Boolean (default: false)</text>
    <text x="15" y="335" fill="#0f172a" font-size="11">profilePicture: String</text>
  </g>

  <!-- NOTE Collection -->
  <g transform="translate(320, 30)">
    <rect width="250" height="360" rx="8" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
    <rect width="250" height="35" rx="8" fill="#16a34a"/>
    <rect y="25" width="250" height="10" fill="#16a34a"/>
    <text x="125" y="24" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">NOTE SCHEMA (Note.js)</text>
    
    <text x="15" y="55" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#dc2626">_id</tspan>: ObjectId (PK)</text>
    <text x="15" y="75" fill="#0f172a" font-size="11">title: String</text>
    <text x="15" y="95" fill="#0f172a" font-size="11">description: String</text>
    <text x="15" y="115" fill="#0f172a" font-size="11">branch, semester, subject</text>
    <text x="15" y="135" fill="#0f172a" font-size="11">unit, teacherName, tags [ ]</text>
    <text x="15" y="155" fill="#0f172a" font-size="11">fileUrl: String, publicId</text>
    <text x="15" y="175" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#2563eb">uploadedBy</tspan>: ObjectId (FK -> User)</text>
    <text x="15" y="195" fill="#0f172a" font-size="11">views, downloads: Number</text>
    <text x="15" y="215" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#d97706">averageRating</tspan>: Number</text>
    
    <!-- Embedded Subdocuments Boundary -->
    <rect x="10" y="230" width="230" height="55" rx="4" fill="#fef3c7" stroke="#f59e0b"/>
    <text x="15" y="247" fill="#92400e" font-size="10.5" font-weight="bold">ratings: [ Embedded Subdocument ]</text>
    <text x="15" y="265" fill="#78350f" font-size="10">• user: ObjectId ref User, score: (1-5)</text>

    <rect x="10" y="295" width="230" height="55" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
    <text x="15" y="312" fill="#5b21b6" font-size="10.5" font-weight="bold">comments: [ Embedded Subdocument ]</text>
    <text x="15" y="330" fill="#4c1d95" font-size="10">• user: ObjectId, userName, text, time</text>
  </g>

  <!-- REPORT Collection -->
  <g transform="translate(620, 80)">
    <rect width="200" height="250" rx="8" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
    <rect width="200" height="35" rx="8" fill="#dc2626"/>
    <rect y="25" width="200" height="10" fill="#dc2626"/>
    <text x="100" y="24" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">REPORT (Report.js)</text>
    
    <text x="15" y="60" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#dc2626">_id</tspan>: ObjectId (PK)</text>
    <text x="15" y="90" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#2563eb">reportedUser</tspan>: ObjectId</text>
    <text x="15" y="120" fill="#0f172a" font-size="11"><tspan font-weight="bold" fill="#2563eb">reportedBy</tspan>: ObjectId</text>
    <text x="15" y="150" fill="#0f172a" font-size="11">reason: String</text>
    <text x="15" y="180" fill="#0f172a" font-size="11">status: 'pending' | 'resolved'</text>
    <text x="15" y="210" fill="#0f172a" font-size="11">createdAt: Date</text>
  </g>

  <!-- Connectors -->
  <path d="M 262 175 L 318 175" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="4"/>
  <text x="290" y="165" fill="#1e40af" font-size="10" font-weight="bold" text-anchor="middle">1 : N</text>

  <path d="M 262 260 L 310 260 L 310 320 L 618 160" stroke="#dc2626" stroke-width="2" stroke-dasharray="3"/>
  <text x="440" y="215" fill="#dc2626" font-size="10" font-weight="bold" text-anchor="middle">1 : N</text>
</svg>
"""

# Full HTML template
html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Comprehensive Project Report - Campus Notes Exchange Platform</title>
<style>
  @page {{
    size: A4;
    margin: 22mm 18mm 22mm 18mm;
    @bottom-center {{
      content: counter(page);
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 9pt;
      color: #64748b;
    }}
  }}

  body {{
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
    line-height: 1.65;
    font-size: 10.5pt;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }}

  /* Page Breaks & Structural Layout */
  .page-break {{
    page-break-before: always;
    break-before: page;
  }}

  .avoid-break {{
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  /* Title Page Styling */
  .cover-container {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 94vh;
    text-align: center;
    padding: 10px 20px;
    box-sizing: border-box;
    border: 3px double #1e3a8a;
    border-radius: 4px;
    background: #ffffff;
  }}

  .cover-header {{
    margin-top: 10px;
  }}

  .univ-title {{
    font-size: 17pt;
    font-weight: 800;
    color: #1e3a8a;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.3;
  }}

  .univ-sub {{
    font-size: 9pt;
    color: #475569;
    margin: 4px 0 15px 0;
    font-style: italic;
  }}

  .logo-wrapper img {{
    height: 105px;
    width: auto;
    object-fit: contain;
    margin: 10px 0;
  }}

  .project-title-box {{
    margin: 20px 0;
    padding: 16px 20px;
    border-top: 2px solid #2563eb;
    border-bottom: 2px solid #2563eb;
    background: #f8fafc;
    width: 90%;
  }}

  .report-label {{
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #64748b;
    font-weight: 600;
    margin: 0 0 6px 0;
  }}

  .project-main-title {{
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    margin: 4px 0;
    line-height: 1.25;
  }}

  .project-subtitle {{
    font-size: 11pt;
    color: #2563eb;
    font-weight: 600;
    margin: 4px 0 0 0;
  }}

  .fulfillment-text {{
    font-size: 10pt;
    color: #334155;
    margin: 15px 0 20px 0;
    max-width: 80%;
    line-height: 1.5;
  }}

  .meta-grid {{
    display: flex;
    justify-content: space-between;
    width: 90%;
    margin: 15px 0;
    text-align: left;
    font-size: 10pt;
  }}

  .meta-col-left {{
    width: 48%;
  }}

  .meta-col-right {{
    width: 48%;
    text-align: right;
  }}

  .meta-label {{
    font-weight: bold;
    color: #1e3a8a;
    text-transform: uppercase;
    font-size: 9pt;
    margin-bottom: 4px;
  }}

  .cover-footer {{
    margin-bottom: 10px;
    border-top: 1px solid #cbd5e1;
    width: 90%;
    padding-top: 12px;
  }}

  .institute-name {{
    font-size: 12pt;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }}

  .institute-place {{
    font-size: 9.5pt;
    color: #475569;
    margin: 2px 0 0 0;
  }}

  /* Typography & Headings */
  h1 {{
    font-size: 18pt;
    color: #0f172a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 6px;
    margin-top: 25px;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  h2 {{
    font-size: 13.5pt;
    color: #1e3a8a;
    margin-top: 20px;
    margin-bottom: 10px;
    border-left: 4px solid #3b82f6;
    padding-left: 8px;
  }}

  h3 {{
    font-size: 11pt;
    color: #0f172a;
    margin-top: 15px;
    margin-bottom: 6px;
    font-weight: 700;
  }}

  p {{
    margin: 0 0 10px 0;
    text-align: justify;
  }}

  ul, ol {{
    margin: 0 0 12px 0;
    padding-left: 24px;
  }}

  li {{
    margin-bottom: 5px;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 9.5pt;
    background: #ffffff;
  }}

  th, td {{
    border: 1px solid #cbd5e1;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }}

  th {{
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    border-bottom: 2px solid #94a3b8;
  }}

  tr:nth-child(even) {{
    background: #f8fafc;
  }}

  .badge-pass {{
    display: inline-block;
    background: #dcfce7;
    color: #15803d;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 8.5pt;
  }}

  /* Code & Syntax Blocks */
  pre {{
    background: #0f172a;
    color: #f8fafc;
    padding: 12px 14px;
    border-radius: 6px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
    line-height: 1.45;
    overflow-x: auto;
    margin: 12px 0;
    border-left: 4px solid #3b82f6;
  }}

  code {{
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 2px 4px;
    border-radius: 4px;
  }}

  /* Callout Boxes */
  .callout {{
    background: #eff6ff;
    border-left: 4px solid #2563eb;
    padding: 12px 16px;
    border-radius: 0 6px 6px 0;
    margin: 15px 0;
    font-size: 9.5pt;
  }}

  .callout-title {{
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 4px;
  }}

  /* Signatures */
  .sig-grid {{
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
    width: 100%;
  }}

  .sig-box {{
    width: 45%;
    text-align: center;
    border-top: 1px solid #64748b;
    padding-top: 8px;
    font-size: 9.5pt;
  }}
</style>
</head>
<body>

<!-- ========================================== -->
<!-- 1. COVER PAGE -->
<!-- ========================================== -->
<div class="cover-container">
  <div class="cover-header">
    <h2 class="univ-title">HIMACHAL PRADESH TECHNICAL UNIVERSITY</h2>
    <p class="univ-sub">(A State Government University Established Under State Legislative Act-16 of 2010)</p>
    <div class="logo-wrapper">
      <img src="{univ_logo}" alt="University Logo">
    </div>
  </div>

  <div class="project-title-box">
    <div class="report-label">FINAL PROJECT &amp; INDUSTRIAL INTERNSHIP REPORT</div>
    <div class="project-main-title">CAMPUS NOTES EXCHANGE PLATFORM</div>
    <div class="project-subtitle">A Gamified Peer-to-Peer Academic Resource Sharing &amp; Collaboration System</div>
  </div>

  <div class="fulfillment-text">
    Submitted in partial fulfilment of the requirements for the award of the degree of<br>
    <strong>Bachelor of Technology (B.Tech)</strong><br>
    in<br>
    <strong>Computer Science and Engineering</strong>
  </div>

  <div class="meta-grid">
    <div class="meta-col-left">
      <div class="meta-label">Submitted By:</div>
      <strong>PAWAN</strong><br>
      University Roll No: <strong>241503020059</strong><br>
      Department of Computer Science &amp; Engg.<br>
      L.R Engineering &amp; Technology, Solan
    </div>
    <div class="meta-col-right">
      <div class="meta-label">Conducted At &amp; Guided By:</div>
      <strong>Sortiq Solutions Pvt. Ltd.</strong><br>
      Industry Mentor: <strong>Mr. Abhishek Kumar</strong><br>
      HOD CSE: <strong>Ms. Ritika Sharma</strong><br>
      Principal: <strong>Dr. D. P. Sharma</strong>
    </div>
  </div>

  <div class="cover-footer">
    <div class="institute-name">L.R INSTITUTE OF ENGINEERING &amp; TECHNOLOGY</div>
    <div class="institute-place">Solan, Himachal Pradesh – 173223 | Academic Year: 2025–2026</div>
  </div>
</div>

<!-- ========================================== -->
<!-- 2. CERTIFICATE -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CERTIFICATE OF ORIGINALITY &amp; APPROVAL</h1>

<p>This is to certify that the project report titled <strong>"Campus Notes Exchange Platform: A Gamified Peer-to-Peer Academic Resource Sharing &amp; Collaboration System"</strong> submitted by <strong>Pawan (University Roll No: 241503020059)</strong> in partial fulfilment of the requirements for the award of the degree of <strong>Bachelor of Technology in Computer Science and Engineering</strong> from <strong>Himachal Pradesh Technical University</strong>, Hamirpur, is an authentic record of the candidate's original work carried out under our supervision and guidance.</p>

<p>The industrial internship and core software engineering lifecycle were conducted at <strong>Sortiq Solutions Pvt. Ltd., Mohali, Punjab</strong>. To the best of our knowledge and belief, the matter presented in this report has not been submitted in part or full to any other University or Institution for the award of any degree or diploma.</p>

<div style="margin: 30px 0; text-align: center;">
  <img src="{company_logo}" alt="Company Logo" style="height: 60px; object-fit: contain;">
  <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">Sortiq Solutions Pvt. Ltd. (Corporate Partner)</div>
</div>

<div class="sig-grid" style="margin-top: 60px;">
  <div class="sig-box">
    <strong>Mr. Abhishek Kumar</strong><br>
    Industry Mentor &amp; Technical Lead<br>
    Sortiq Solutions Pvt. Ltd., Mohali
  </div>
  <div class="sig-box">
    <strong>Ms. Ritika Sharma</strong><br>
    Head of Department (CSE)<br>
    L.R Institute of Engg. &amp; Tech., Solan
  </div>
</div>

<div class="sig-grid" style="margin-top: 50px;">
  <div class="sig-box" style="margin: 0 auto; width: 55%;">
    <strong>Dr. D. P. Sharma</strong><br>
    Principal / Director<br>
    L.R Institute of Engineering &amp; Technology, Solan
  </div>
</div>

<!-- ========================================== -->
<!-- 3. DECLARATION & ACKNOWLEDGEMENT -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CANDIDATE'S DECLARATION</h1>

<p>I hereby declare that the work presented in this project report entitled <strong>"Campus Notes Exchange Platform"</strong> is an authentic record of my own research, design, implementation, and testing conducted under the supervision of <strong>Mr. Abhishek Kumar</strong> (Industry Mentor, Sortiq Solutions Pvt. Ltd.) and the faculty of the Department of Computer Science and Engineering, <strong>L.R Institute of Engineering &amp; Technology, Solan</strong>.</p>

<p>I have not submitted the matter embodied in this report elsewhere for the award of any other degree, diploma, or certificate. Any contribution made to the research by others with whom I have worked at Sortiq Solutions or elsewhere is explicitly acknowledged.</p>

<div style="margin-top: 40px; text-align: right;">
  <strong>Pawan</strong><br>
  Roll No: 241503020059<br>
  B.Tech (Computer Science &amp; Engineering)<br>
  Date: September 2026
</div>

<hr style="margin: 30px 0; border: 0; border-top: 1px dashed #cbd5e1;">

<h1>ACKNOWLEDGEMENT</h1>

<p>I express my deepest gratitude to Almighty God for providing me with strength, health, and wisdom to successfully complete this industrial internship and project report.</p>

<p>I extend my heartfelt gratitude to <strong>Sortiq Solutions Pvt. Ltd., Mohali</strong>, for providing me with the industrial opportunity to work on live enterprise development workflows. Special thanks to my Industry Mentor, <strong>Mr. Abhishek Kumar</strong>, for his invaluable technical direction, constructive architectural reviews, and continuous mentorship during the design of our MERN stack platform.</p>

<p>I express sincere thanks to our respected Principal, <strong>Dr. D. P. Sharma</strong>, and the Head of Department, <strong>Ms. Ritika Sharma</strong>, for providing continuous encouragement, state-of-the-art laboratory facilities, and supportive academic environment throughout the degree course.</p>

<p>Lastly, I owe my deepest appreciation to my parents, family, and classmates whose moral encouragement and unwavering belief have been my steady pillar of strength.</p>

<!-- ========================================== -->
<!-- 4. ABSTRACT & TOC -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>ABSTRACT</h1>

<p>Academic resource exchange across university campuses has traditionally suffered from fragmentation, inefficiency, and lack of quality assurance. College students predominantly rely on ephemeral WhatsApp groups, Telegram channels, or personal cloud drives where documents get easily buried, duplicated, or lost at the end of each academic session. Furthermore, high-achieving students possess little to no incentive to scan and distribute their meticulously written notes.</p>

<p>To overcome these challenges, this project presents the design, architectural engineering, and full-scale implementation of the <strong>Campus Notes Exchange Platform</strong>: an enterprise-grade, peer-to-peer web and hybrid mobile platform built using the <strong>MERN Stack (MongoDB, Express.js, React 19, and Node.js)</strong>.</p>

<p>Key technical innovations implemented in this system include:</p>
<ul>
  <li><strong>Credit-Based Gamification Loop:</strong> An incentivization economy where uploaders receive +10 credits for verified academic contributions and +5 passive credits whenever peers download their materials, fueling a self-sustaining sharing ecosystem backed by a campus-wide leaderboard.</li>
  <li><strong>Multi-Criteria Regular Expression Discovery:</strong> A multi-field indexing and regular expression search engine allowing students to filter resources instantly by branch, semester, subject code, unit, and teacher name.</li>
  <li><strong>Embedded Community Governance:</strong> High-performance embedded subdocument schemas for 1-5 star ratings with pre-save automated average calculation hooks, threaded comments, and user-initiated content reporting.</li>
  <li><strong>Enterprise Security Architecture:</strong> 10-round salted Bcrypt password hashing, stateless JSON Web Token (JWT) bearer validation, strict Multer MIME-type file whitelisting with 25MB buffer controls, and real-time user banishment middleware.</li>
  <li><strong>Hybrid Storage Resilience:</strong> Dual-mode storage featuring remote Cloudinary Content Delivery Network (CDN) streaming with an automated fallback to local server disk storage.</li>
  <li><strong>Hybrid Mobile Preparedness:</strong> Clean SPA bundling with Vite, prepared for single-command native compilation to Android <code>.apk</code> containers via Capacitor.</li>
</ul>

<p><strong>Keywords:</strong> MERN Stack, React 19, RESTful API, MongoDB Subdocuments, Gamification, Academic Resource Sharing, JWT Authentication, Cloudinary, Capacitor.</p>

<hr style="margin: 25px 0; border: 0; border-top: 1px solid #cbd5e1;">

<div class="avoid-break">
  <h2>TABLE OF CONTENTS</h2>
  <table style="margin-top: 10px;">
    <tr><th>Chapter</th><th>Title</th><th style="width:60px; text-align:center;">Page</th></tr>
    <tr><td><strong>1</strong></td><td><strong>Introduction &amp; Background</strong></td><td style="text-align:center;">5</td></tr>
    <tr><td><strong>2</strong></td><td><strong>Literature Survey &amp; Feasibility Study</strong></td><td style="text-align:center;">7</td></tr>
    <tr><td><strong>3</strong></td><td><strong>Software Requirements Specification (SRS)</strong></td><td style="text-align:center;">9</td></tr>
    <tr><td><strong>4</strong></td><td><strong>System Design &amp; Architectural Engineering</strong></td><td style="text-align:center;">11</td></tr>
    <tr><td><strong>5</strong></td><td><strong>Database Design &amp; Schema Specifications</strong></td><td style="text-align:center;">15</td></tr>
    <tr><td><strong>6</strong></td><td><strong>Implementation &amp; Core Functional Modules</strong></td><td style="text-align:center;">18</td></tr>
    <tr><td><strong>7</strong></td><td><strong>Security Protocols &amp; Integrity Enforcement</strong></td><td style="text-align:center;">23</td></tr>
    <tr><td><strong>8</strong></td><td><strong>System Testing &amp; Quality Assurance</strong></td><td style="text-align:center;">25</td></tr>
    <tr><td><strong>9</strong></td><td><strong>Results, Screenshots &amp; Walkthrough</strong></td><td style="text-align:center;">28</td></tr>
    <tr><td><strong>10</strong></td><td><strong>Conclusion &amp; Future Scope</strong></td><td style="text-align:center;">30</td></tr>
    <tr><td><strong>--</strong></td><td><strong>References &amp; Webliography</strong></td><td style="text-align:center;">31</td></tr>
  </table>
</div>

<!-- ========================================== -->
<!-- 5. CHAPTER 1: INTRODUCTION -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 1: INTRODUCTION &amp; BACKGROUND</h1>

<h2>1.1 Project Overview</h2>
<p>The <strong>Campus Notes Exchange Platform</strong> is a full-stack, peer-to-peer web and mobile application designed specifically to streamline and centralize academic material distribution across engineering and polytechnic campuses. Built using the modern MERN technology stack, the system serves as an institutional digital repository where students across all academic branches can upload, browse, preview, evaluate, and download curriculum-specific study materials including lecture notes, past exam solutions, lab manuals, and faculty presentations.</p>

<h2>1.2 Motivation &amp; Problem Statement</h2>
<p>In the contemporary collegiate environment, academic resources remain heavily decentralized. Students primarily exchange notes through private messaging applications such as WhatsApp, Telegram, or Discord. While accessible, these channels introduce critical systemic problems:</p>

<ul>
  <li><strong>High Resource Fragmentation:</strong> Study materials are scattered across dozens of ad-hoc group chats with no structured indexing. Crucial notes shared in October are virtually unfindable during end-semester exams in December.</li>
  <li><strong>Lack of Quality Control:</strong> Documents are circulated without peer reviews, syllabi verification, or instructor tagging. Students frequently download inaccurate or outdated notes.</li>
  <li><strong>Zero Contribution Motivation:</strong> Top academic performers invest significant effort into crafting handwritten notes, yet they receive neither recognition nor tangible benefit for scanning and sharing their work.</li>
  <li><strong>Ephemeral Links &amp; Security Hazards:</strong> Free cloud links (Google Drive, Mega) frequently expire, hit download quotas, or expose student devices to malicious unvetted executable files.</li>
</ul>

<h2>1.3 Project Objectives</h2>
<p>The primary objectives of this project are:</p>
<ol>
  <li><strong>Centralized Academic Taxonomy:</strong> Construct an intuitive repository categorized strictly by Department/Branch, Semester (1 to 8), Subject Name, Unit Number, and Faculty Name.</li>
  <li><strong>Incentivized Gamification Engine:</strong> Implement an algorithmic credit economy awarding contributors +10 credits on note upload and +5 credits upon peer downloads, linked to an institute-wide leaderboard.</li>
  <li><strong>Zero-Join Embedded Performance:</strong> Leverage MongoDB's flexible document model to embed ratings and threaded comments directly inside note records for sub-50 millisecond read queries.</li>
  <li><strong>Enterprise-Grade Security:</strong> Secure the application using 10-round salted bcrypt password hashing, stateless JSON Web Tokens (JWT), strict MIME-type sanitization (25MB limit), and instant user banishment middleware.</li>
  <li><strong>Hybrid Storage Resilience:</strong> Ensure 100% operational uptime by pairing Cloudinary remote CDN media management with an automated local disk storage fallback.</li>
  <li><strong>Cross-Platform Mobile Ready:</strong> Structure the React client to compile into native Android <code>.apk</code> packages via Capacitor.</li>
</ol>

<!-- ========================================== -->
<!-- 6. CHAPTER 2: LITERATURE SURVEY -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 2: LITERATURE SURVEY &amp; FEASIBILITY STUDY</h1>

<h2>2.1 Study of Existing Systems</h2>
<p>Prior to designing the system architecture, existing commercial and academic knowledge-sharing solutions were evaluated:</p>

<table>
  <tr>
    <th style="width:20%;">System / Platform</th>
    <th style="width:40%;">Key Features</th>
    <th style="width:40%;">Observed Limitations in Campus Environment</th>
  </tr>
  <tr>
    <td><strong>WhatsApp / Telegram Channels</strong></td>
    <td>Instant delivery, ubiquity on student mobile devices, media support.</td>
    <td>Zero taxonomy, no search by branch/unit, files expire from phone storage, no rating or verification.</td>
  </tr>
  <tr>
    <td><strong>Google Drive Shared Folders</strong></td>
    <td>Hierarchical folder structure, large storage volume, permission controls.</td>
    <td>No gamification or incentive loop, no peer discussion threads, quota limits ("Download quota exceeded"), difficult navigation.</td>
  </tr>
  <tr>
    <td><strong>Commercial EdTech (StuDocu / CourseHero)</strong></td>
    <td>Global catalog, search filters, document preview locks.</td>
    <td>Aggressive paywalls requiring costly subscriptions, lack of campus-specific syllabus mapping, monetization barriers for local students.</td>
  </tr>
  <tr>
    <td><strong>Proposed Campus Notes Platform</strong></td>
    <td><strong>Campus-specific branch/semester indexing, free gamified credit loop, embedded peer reviews, local LAN + Cloud deployment.</strong></td>
    <td><strong>Custom-tailored to college curriculum, zero cost, completely open and community-moderated.</strong></td>
  </tr>
</table>

<h2>2.2 Feasibility Analysis</h2>
<ul>
  <li><strong>Technical Feasibility:</strong> The technology stack (React 19, Node.js, Express, MongoDB) is robust, fully open-source, and supported by extensive developer ecosystems. The entire codebase runs efficiently on standard commodity hardware.</li>
  <li><strong>Operational Feasibility:</strong> The user interface employs intuitive minimalist cards and icons (Lucide React), requiring zero end-user training. Students familiar with social media can effortlessly navigate, rate, and upload resources.</li>
  <li><strong>Economic Feasibility:</strong> The platform leverages free-tier enterprise cloud infrastructure (MongoDB Atlas, Cloudinary CDN, Render) and features a standalone zero-cost local Wi-Fi deployment mode via LAN IP binding.</li>
</ul>

<!-- ========================================== -->
<!-- 7. CHAPTER 3: SRS -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 3: SOFTWARE REQUIREMENTS SPECIFICATION</h1>

<h2>3.1 Functional Requirements</h2>
<ul>
  <li><strong>FR-1 (User Authentication):</strong> The system shall allow students to register using their university email, password, roll number, and department. Passwords must be hashed before database storage.</li>
  <li><strong>FR-2 (Note Upload &amp; Metadata):</strong> Authenticated users shall upload study materials in PDF, PPT, or image format, appending title, branch, semester, subject, unit, instructor, and tags.</li>
  <li><strong>FR-3 (Multi-Factor Search &amp; Filter):</strong> The platform shall execute real-time regex searches across titles, subjects, descriptions, and tags, combinable with branch and semester filters.</li>
  <li><strong>FR-4 (Gamification Credit Allocation):</strong> The system shall atomically increment user credit balances (+10 on upload, +5 on download) and rank top contributors on a public leaderboard.</li>
  <li><strong>FR-5 (Peer Feedback &amp; Discussion):</strong> Users shall submit 1-5 star ratings and post comments. The system shall automatically recompute average ratings upon rating submission.</li>
  <li><strong>FR-6 (Admin Moderation &amp; Enforcement):</strong> Administrators shall view system analytics, review user-reported resources, delete abusive files, and ban offending user accounts.</li>
</ul>

<h2>3.2 Non-Functional Requirements</h2>
<ul>
  <li><strong>Performance:</strong> Average API response latency for catalog browsing and search queries must remain below 100 milliseconds under concurrent student loads.</li>
  <li><strong>Security:</strong> All private endpoints must demand cryptographic Bearer JWT validation. File uploads must undergo rigorous extension and MIME-type whitelisting.</li>
  <li><strong>Availability &amp; Fault Tolerance:</strong> If Cloudinary CDN is unreachable or offline, the file upload service must fall back smoothly to local disk storage.</li>
  <li><strong>Portability &amp; Responsiveness:</strong> The client-side UI must render responsively across mobile (360px), tablet (768px), and desktop (1080p+) viewports.</li>
</ul>

<h2>3.3 Hardware &amp; Software Environment</h2>
<table>
  <tr><th>Specification</th><th>Development Environment</th><th>Minimum Target Deployment</th></tr>
  <tr><td><strong>Operating System</strong></td><td>Windows 11 / Linux Ubuntu 22.04</td><td>Cross-platform (Node.js runtime / Android 8.0+)</td></tr>
  <tr><td><strong>Server Processor</strong></td><td>Intel Core i5 / AMD Ryzen 5 (6 Cores)</td><td>1 vCPU / 1 GHz Dual-Core</td></tr>
  <tr><td><strong>RAM</strong></td><td>16 GB DDR4</td><td>512 MB to 1 GB RAM</td></tr>
  <tr><td><strong>Database</strong></td><td>MongoDB v7.0 (Local / Atlas Cloud)</td><td>MongoDB Atlas M0 Free Tier (512MB)</td></tr>
  <tr><td><strong>Runtimes &amp; Tools</strong></td><td>Node.js v20.x, NPM v10.x, Git, VS Code</td><td>Node.js v18.x+, Modern Web Browser (Chrome/Edge)</td></tr>
</table>

<!-- ========================================== -->
<!-- 8. CHAPTER 4: SYSTEM DESIGN -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 4: SYSTEM DESIGN &amp; ARCHITECTURAL ENGINEERING</h1>

<h2>4.1 Three-Tier Client-Server Architecture</h2>
<p>The system is architected around a strict decoupled Three-Tier pattern:</p>
<ol>
  <li><strong>Presentation Tier (Frontend):</strong> Built with React 19 and Vite. State is managed reactively through React Hooks and Context APIs. Axios executes asynchronous HTTP requests, with request interceptors injecting JWT bearer tokens stored in <code>localStorage</code>.</li>
  <li><strong>Application Tier (Backend Logic):</strong> Implemented using Node.js and Express.js. Business logic is organized modularly into Controllers, Routes, and Middlewares (Auth, Admin, Upload).</li>
  <li><strong>Data &amp; Storage Tier:</strong> MongoDB provides document storage via Mongoose schemas. Document assets (PDFs/Images) are handled via Cloudinary remote CDN or local file storage.</li>
</ol>

<div class="avoid-break">
  <h3>Figure 4.1: Three-Tier System Architecture &amp; Hybrid Storage Topology</h3>
  {svg_architecture}
</div>

<div class="page-break"></div>
<h2>4.2 Data Flow Modeling</h2>

<div class="avoid-break">
  <h3>Figure 4.2: DFD Level 0 (Context Level Diagram)</h3>
  {svg_dfd0}
</div>

<h3>4.2.1 DFD Level 1 Detailed Process Breakdown</h3>
<p>In the Level 1 Data Flow Diagram, incoming client requests are categorized into six primary processes:</p>
<ul>
  <li><strong>Process 1.0 (Auth &amp; Profile):</strong> Handles registration, login, bcrypt salted hashing, and JWT token issuance.</li>
  <li><strong>Process 2.0 (Upload &amp; Storage):</strong> Receives multipart/form-data via Multer, sanitizes extensions, writes to Cloudinary or disk, and commits note records.</li>
  <li><strong>Process 3.0 (Search &amp; Catalog):</strong> Queries MongoDB using <code>$regex</code> and <code>$or</code> pipelines based on branch, semester, and keyword filters.</li>
  <li><strong>Process 4.0 (Download &amp; Tracking):</strong> Increments note download counters and triggers the gamification credit update.</li>
  <li><strong>Process 5.0 (Review &amp; Rating):</strong> Pushes ratings/comments into embedded subdocuments and recalculates arithmetic average scores.</li>
  <li><strong>Process 6.0 (Admin &amp; Moderation):</strong> Evaluates reported resources and updates user banishment flags.</li>
</ul>

<!-- ========================================== -->
<!-- 9. CHAPTER 5: DATABASE DESIGN -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 5: DATABASE DESIGN &amp; SCHEMA SPECIFICATIONS</h1>

<h2>5.1 NoSQL Document Modeling Strategy</h2>
<p>Unlike relational databases that mandate normalized tables connected via expensive SQL <code>JOIN</code> queries, MongoDB facilitates <strong>Embedded Subdocuments</strong>. In academic resource sharing, ratings and comments are always queried together with the parent note. By embedding ratings and comments directly inside the <code>Note</code> document, database operations achieve single-query retrieval with sub-50ms latency.</p>

<div class="avoid-break">
  <h3>Figure 5.1: Entity-Relationship &amp; Subdocument Data Model</h3>
  {svg_erd}
</div>

<h2>5.2 Detailed Data Dictionary</h2>

<h3>Table 5.1: User Collection (<code>User.js</code>)</h3>
<table>
  <tr><th>Field</th><th>Type</th><th>Constraint</th><th>Description</th></tr>
  <tr><td><code>_id</code></td><td>ObjectId</td><td>Primary Key</td><td>Auto-generated unique user identifier</td></tr>
  <tr><td><code>name</code></td><td>String</td><td>Required, Trimmed</td><td>Student's full legal name</td></tr>
  <tr><td><code>email</code></td><td>String</td><td>Required, Unique, Lowercase</td><td>College institutional email address</td></tr>
  <tr><td><code>password</code></td><td>String</td><td>Required, Hashed</td><td>Bcrypt 10-round salted hash</td></tr>
  <tr><td><code>rollNumber</code></td><td>String</td><td>Optional</td><td>University examination roll number</td></tr>
  <tr><td><code>branch</code></td><td>String</td><td>Optional</td><td>Department (CSE, ME, ECE, Civil, etc.)</td></tr>
  <tr><td><code>semester</code></td><td>String</td><td>Optional</td><td>Academic semester (1 through 8)</td></tr>
  <tr><td><code>credits</code></td><td>Number</td><td>Default: 0</td><td>Accumulated gamification contribution points</td></tr>
  <tr><td><code>role</code></td><td>String</td><td>'user' | 'admin'</td><td>Access control tier (Default: 'user')</td></tr>
  <tr><td><code>isBanned</code></td><td>Boolean</td><td>Default: false</td><td>Revocation flag for moderation enforcement</td></tr>
  <tr><td><code>bookmarks</code></td><td>Array [ObjectId]</td><td>Ref: 'Note'</td><td>Saved study materials for quick access</td></tr>
</table>

<div class="page-break"></div>
<h3>Table 5.2: Note Collection (<code>Note.js</code>)</h3>
<table>
  <tr><th>Field</th><th>Type</th><th>Constraint</th><th>Description</th></tr>
  <tr><td><code>_id</code></td><td>ObjectId</td><td>Primary Key</td><td>Unique resource identifier</td></tr>
  <tr><td><code>title</code></td><td>String</td><td>Required</td><td>Academic title of the study resource</td></tr>
  <tr><td><code>branch</code></td><td>String</td><td>Required</td><td>Engineering branch mapping</td></tr>
  <tr><td><code>semester</code></td><td>String</td><td>Required</td><td>Applicable syllabus semester</td></tr>
  <tr><td><code>subject</code></td><td>String</td><td>Required</td><td>Course title or course code</td></tr>
  <tr><td><code>unit</code></td><td>String</td><td>Optional</td><td>Specific curriculum unit covered</td></tr>
  <tr><td><code>teacherName</code></td><td>String</td><td>Optional</td><td>Instructor who delivered the lectures</td></tr>
  <tr><td><code>tags</code></td><td>Array [String]</td><td>Indexed</td><td>Search keywords (e.g., 'exam', 'viva', 'pyq')</td></tr>
  <tr><td><code>fileUrl</code></td><td>String</td><td>Required</td><td>Secure HTTPS Cloudinary URL or local server path</td></tr>
  <tr><td><code>uploadedBy</code></td><td>ObjectId</td><td>Required, Ref: 'User'</td><td>Author reference for credit allocation</td></tr>
  <tr><td><code>views</code></td><td>Number</td><td>Default: 0</td><td>Cumulative counter of note modal views</td></tr>
  <tr><td><code>downloads</code></td><td>Number</td><td>Default: 0</td><td>Cumulative counter of successful downloads</td></tr>
  <tr><td><code>averageRating</code></td><td>Number</td><td>Default: 0</td><td>Calculated average of embedded star ratings</td></tr>
  <tr><td><code>ratings</code></td><td>Subdocument [ ]</td><td>Schema Array</td><td>Embedded list of rating scores (1-5) and user IDs</td></tr>
  <tr><td><code>comments</code></td><td>Subdocument [ ]</td><td>Schema Array</td><td>Embedded list of discussion comments and timestamps</td></tr>
</table>

<!-- ========================================== -->
<!-- 10. CHAPTER 6: IMPLEMENTATION -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 6: SYSTEM IMPLEMENTATION &amp; CORE MODULES</h1>

<h2>6.1 Note Upload &amp; Hybrid Storage Engine</h2>
<p>The upload engine handles high-volume binary uploads while maintaining system stability. File streams are received through Multer. The backend tests if Cloudinary environment keys exist; if present, the buffer streams to the cloud CDN. Otherwise, it writes directly to <code>server/uploads/</code>, providing bulletproof reliability during offline college LAN testing.</p>

<pre><code>// uploadMiddleware.js: Whitelist Filter &amp; Memory Buffer Setup
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {{
  const allowedExtensions = /pdf|ppt|pptx|jpg|jpeg|png/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname &amp;&amp; mimetype) {{
    cb(null, true);
  }} else {{
    cb(new Error('Validation Error: Only PDF, PPT, PPTX, and Image files are permitted!'), false);
  }}
}};

const upload = multer({{
  storage: multer.memoryStorage(),
  limits: {{ fileSize: 25 * 1024 * 1024 }}, // 25 Megabytes strict limit
  fileFilter
}});
module.exports = upload;</code></pre>

<h2>6.2 Multi-Criteria Regex Search Engine</h2>
<p>To enable lightning-fast discovery, the note querying controller utilizes MongoDB's <code>$regex</code> evaluation across multiple fields simultaneously:</p>

<pre><code>// noteController.js: Dynamic Multi-field Regular Expression Search
exports.getNotes = async (req, res) => {{
  try {{
    const {{ search, branch, semester, subject }} = req.query;
    let query = {{}};

    if (branch) query.branch = branch;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;

    if (search) {{
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        {{ title: searchRegex }},
        {{ subject: searchRegex }},
        {{ description: searchRegex }},
        {{ teacherName: searchRegex }},
        {{ tags: {{ $in: [searchRegex] }} }}
      ];
    }}

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name email branch')
      .sort({{ createdAt: -1 }});
    res.json(notes);
  }} catch (err) {{
    res.status(500).json({{ message: 'Server error retrieving notes' }});
  }}
}};</code></pre>

<div class="page-break"></div>
<h2>6.3 Gamification &amp; Credit Incentive Loop</h2>
<p>The gamification mechanism solves the student reluctance to share study materials. Credits are awarded via atomic database updates, driving healthy academic competition across departments.</p>

<div class="avoid-break">
  <h3>Figure 6.1: The Gamification Contribution Cycle</h3>
  {svg_gamification}
</div>

<ul>
  <li><strong>Upload Incentive:</strong> When a user uploads a note, their profile is credited with <code>+10 credits</code>.</li>
  <li><strong>Download Royalty:</strong> When a peer downloads that note, the author passively receives <code>+5 credits</code>, rewarding creators of high-quality, popular materials.</li>
  <li><strong>Leaderboard Ranking:</strong> The leaderboard displays top academic contributors, inspiring campus recognition.</li>
</ul>

<pre><code>// noteController.js: Credit Allocation Hook on Download
exports.downloadNote = async (req, res) => {{
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({{ message: 'Note not found' }});

  note.downloads += 1;
  await note.save();

  // Passive credit dividend for note author (if not downloading own note)
  if (note.uploadedBy.toString() !== req.user._id.toString()) {{
    await User.findByIdAndUpdate(note.uploadedBy, {{ $inc: {{ credits: 5 }} }});
  }}

  res.json({{ fileUrl: note.fileUrl }});
}};</code></pre>

<h2>6.4 Automated Rating Recalculation Hook</h2>
<p>To eliminate expensive average calculations on catalog pages, Mongoose executes a <code>pre-save</code> hook whenever the <code>ratings</code> subdocument array is modified:</p>

<pre><code>// Note.js: Pre-Save Trigger for Running Average Calculation
noteSchema.pre('save', function(next) {{
  if (this.isModified('ratings') &amp;&amp; this.ratings.length > 0) {{
    const sum = this.ratings.reduce((acc, curr) => acc + curr.score, 0);
    this.averageRating = Number((sum / this.ratings.length).toFixed(1));
  }} else if (this.ratings.length === 0) {{
    this.averageRating = 0;
  }}
  next();
}});</code></pre>

<div class="page-break"></div>
<h2>6.5 Hybrid Mobile App Packaging via Capacitor</h2>
<p>To maximize campus reach, the platform was adapted into an Android mobile application using <strong>Capacitor</strong>. Capacitor creates a native Android Studio wrapper container that hosts the compiled React production bundle inside a high-performance native <code>WebView</code>.</p>

<table>
  <tr><th>Step</th><th>Command Execution</th><th>Action Description</th></tr>
  <tr><td><strong>1</strong></td><td><code>npm run build</code></td><td>Vite compiles React application into optimized static assets in <code>dist/</code>.</td></tr>
  <tr><td><strong>2</strong></td><td><code>npm install @capacitor/core @capacitor/cli</code></td><td>Installs Capacitor mobile bridge libraries into the client workspace.</td></tr>
  <tr><td><strong>3</strong></td><td><code>npx cap init "Campus Notes" "com.campusnotes.app"</code></td><td>Initializes Android project metadata and links to the <code>dist</code> folder.</td></tr>
  <tr><td><strong>4</strong></td><td><code>npx cap add android</code></td><td>Generates native Gradle-based Android Studio project in <code>client/android/</code>.</td></tr>
  <tr><td><strong>5</strong></td><td><code>npx cap sync &amp;&amp; npx cap open android</code></td><td>Copies web assets into Android container and launches Android Studio to build <code>.apk</code>.</td></tr>
</table>

<!-- ========================================== -->
<!-- 11. CHAPTER 7: SECURITY -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 7: SECURITY PROTOCOLS &amp; INTEGRITY ENFORCEMENT</h1>

<h2>7.1 Salted Password Hashing via Bcrypt</h2>
<p>Plaintext passwords are never stored in the database. When a student registers or modifies their password, a Mongoose pre-save hook intercepts the document, generates a 10-round cryptographic salt using <code>bcryptjs</code>, and replaces the plaintext input with a secure 60-character one-way hash.</p>

<h2>7.2 Stateless JWT Token Lifecycle</h2>
<p>User sessions are managed entirely via stateless JSON Web Tokens. Upon successful authentication, the server cryptographically signs a payload containing the user's ID using an HMAC SHA-256 algorithm with a secret key. Outgoing client requests pass this signature via the <code>Authorization: Bearer &lt;token&gt;</code> header.</p>

<h2>7.3 Instant Banishment Validation</h2>
<p>A frequent flaw in stateless JWT architectures is the inability to revoke access before token expiration. To solve this, our custom <code>authMiddleware</code> performs real-time database validation on every request:</p>

<pre><code>// authMiddleware.js: JWT Validation with Real-Time Banishment Guard
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {{
  let token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({{ message: 'Access Denied: No Token Provided' }});

  try {{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({{ message: 'User account no longer exists' }});
    if (user.isBanned) return res.status(403).json({{ message: 'Account Suspended: Contact College Administrator' }});

    req.user = user;
    next();
  }} catch (err) {{
    res.status(401).json({{ message: 'Invalid or Expired Authentication Token' }});
  }}
}};</code></pre>

<h2>7.4 Role-Based Access Control (RBAC)</h2>
<p>Sensitive administration operations (e.g., banning offending students, wiping abusive files, and inspecting reported items) are protected by <code>adminMiddleware.js</code>, which verifies that <code>req.user.role === 'admin'</code> before allowing route execution.</p>

<!-- ========================================== -->
<!-- 12. CHAPTER 8: TESTING & RESULTS -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 8: SYSTEM TESTING &amp; QUALITY ASSURANCE</h1>

<h2>8.1 Testing Methodology</h2>
<p>The platform underwent rigorous testing across three distinct phases: Unit Testing for controller logic, Integration Testing for REST API endpoints via Postman, and End-to-End User Acceptance Testing across Chrome, Edge, and Android devices.</p>

<h2>8.2 Comprehensive Test Cases Table</h2>
<table>
  <tr>
    <th style="width:10%;">Test ID</th>
    <th style="width:25%;">Test Scenario</th>
    <th style="width:25%;">Input Data</th>
    <th style="width:25%;">Expected Result</th>
    <th style="width:15%;">Status</th>
  </tr>
  <tr>
    <td><strong>TC-01</strong></td>
    <td>User Registration (Valid)</td>
    <td>Unique email, password >= 6 chars, name, roll number</td>
    <td>HTTP 201 Created; JWT token generated; Password hashed in DB</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-02</strong></td>
    <td>Duplicate Email Registration</td>
    <td>Existing registered email address</td>
    <td>HTTP 400 Bad Request: "User already exists"</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-03</strong></td>
    <td>User Authentication (Valid)</td>
    <td>Correct email &amp; password</td>
    <td>HTTP 200 OK; JWT returned; Saved in localStorage</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-04</strong></td>
    <td>User Authentication (Wrong Password)</td>
    <td>Correct email &amp; wrong password</td>
    <td>HTTP 400 Bad Request: "Invalid credentials"</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-05</strong></td>
    <td>Note Upload (Valid PDF)</td>
    <td>File: sample.pdf (&lt; 25MB), Branch: 'CSE', Sem: '6'</td>
    <td>HTTP 201 Created; File stored; User receives +10 credits</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-06</strong></td>
    <td>Note Upload (Invalid File Type)</td>
    <td>File: script.exe / malware.bat</td>
    <td>HTTP 400 Bad Request; Multer rejects with whitelist error</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-07</strong></td>
    <td>Note Upload (Exceeding 25MB)</td>
    <td>File size: 38MB PDF</td>
    <td>HTTP 400 Payload Too Large; File upload aborted</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-08</strong></td>
    <td>Regex Search by Keyword</td>
    <td>Search query: "Compiler"</td>
    <td>Returns all notes matching "Compiler" in Title/Subject/Tags</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-09</strong></td>
    <td>Filtered Catalog Query</td>
    <td>Branch: 'CSE', Semester: '6'</td>
    <td>Returns only 6th semester Computer Science resources</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-10</strong></td>
    <td>Note Download &amp; Credit Royalties</td>
    <td>Peer downloads Note #102</td>
    <td>Download counter increments; Note author receives +5 credits</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-11</strong></td>
    <td>Star Rating Submission</td>
    <td>Rating: 5 Stars on Note #102</td>
    <td>Subdocument appended; <code>averageRating</code> updated automatically</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-12</strong></td>
    <td>Comment Thread Submission</td>
    <td>Text: "Very helpful for Unit 3 exams!"</td>
    <td>Comment pushed to embedded array; Instant UI update</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-13</strong></td>
    <td>Bookmarking Study Material</td>
    <td>Click Bookmark icon on card</td>
    <td>Note ID added to user bookmarks array; Viewable in Profile</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-14</strong></td>
    <td>Admin Banishment Enforcement</td>
    <td>Admin sets <code>isBanned = true</code> for user</td>
    <td>User's next request yields HTTP 403 Forbidden immediately</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-15</strong></td>
    <td>Local Network Wi-Fi Access</td>
    <td>Android phone connects to <code>192.168.x.x:5000</code></td>
    <td>Loads catalog over campus LAN without cloud internet costs</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
  <tr>
    <td><strong>TC-16</strong></td>
    <td>Fallback Local Storage Mode</td>
    <td>Cloudinary keys unset in <code>.env</code></td>
    <td>Files safely written to <code>/server/uploads</code> and served statically</td>
    <td><span class="badge-pass">PASS</span></td>
  </tr>
</table>

<!-- ========================================== -->
<!-- 13. CHAPTER 9: RESULTS & WALKTHROUGH -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 9: RESULTS &amp; SYSTEM WALKTHROUGH</h1>

<h2>9.1 Application Modules Overview</h2>
<ul>
  <li><strong>Interactive Dashboard (<code>Dashboard.jsx</code>):</strong> Features animated hero sections, dynamic counts of total available notes, branches, and quick action buttons to explore or upload notes.</li>
  <li><strong>Smart Explore &amp; Filter View (<code>Explore.jsx</code>):</strong> Incorporates dynamic multi-select filters for Branch (CSE, ME, ECE, Civil, etc.), Semester (1-8), and Subject, paired with a debounced real-time search input. Notes render as interactive cards with average rating badges, author details, view counters, and bookmarking toggles.</li>
  <li><strong>Note Details &amp; Preview Modal (<code>NoteModal.jsx</code>):</strong> Provides an in-browser PDF preview iframe, full metadata breakdown, direct download button, star rating controls (1 to 5), and a threaded peer discussion board.</li>
  <li><strong>Gamified Upload Suite (<code>Upload.jsx</code>):</strong> Includes drag-and-drop file upload, automated size and extension verification, curriculum tagging fields, and fires a festive Canvas Confetti animation upon successful upload.</li>
  <li><strong>Campus Leaderboard (<code>Leaderboard.jsx</code>):</strong> Ranks the top student contributors across the campus by total accumulated credits, fostering healthy academic competition.</li>
  <li><strong>User Profile &amp; Library (<code>Profile.jsx</code>):</strong> Displays the student's roll number, branch, accumulated credits, uploaded documents with edit/delete controls, and bookmarked study packs.</li>
  <li><strong>Admin Moderation Console (<code>Admin.jsx</code>):</strong> Secured via RBAC; provides high-level system analytics, pending student reports queue, user ban/unban toggles, and direct violation removal tools.</li>
</ul>

<!-- ========================================== -->
<!-- 14. CHAPTER 10: CONCLUSION -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>CHAPTER 10: CONCLUSION &amp; FUTURE SCOPE</h1>

<h2>10.1 Conclusion</h2>
<p>The <strong>Campus Notes Exchange Platform</strong> successfully addresses the critical issues of resource fragmentation, lack of organization, and absent contribution incentives across college campuses. By combining the high performance of the MERN stack with credit-based gamification, embedded review mechanics, and hybrid mobile deployment, the platform transforms academic material sharing from unorganized group chats into a structured, self-sustaining educational repository.</p>

<p>The system was completely designed, developed, tested, and validated during the industrial internship at <strong>Sortiq Solutions Pvt. Ltd.</strong> under the guidance of academic and industry mentors. The extensive test suite demonstrates that the application achieves sub-50ms query response times, robust defense against malicious file uploads, and continuous operational availability over campus local area networks.</p>

<h2>10.2 Future Scope &amp; Roadmap</h2>
<p>While the present release provides a solid foundation, several exciting enhancements are planned for future versions:</p>
<ol>
  <li><strong>AI-Powered Note Summarizer:</strong> Integrating Large Language Models (LLMs) to automatically generate bulleted revision summaries, key formulas, and exam flashcards from uploaded PDF files.</li>
  <li><strong>Optical Character Recognition (OCR) Search:</strong> Employing OCR engines (such as Tesseract.js) to extract handwritten text from scanned notebook images, allowing students to search inside handwritten notes.</li>
  <li><strong>Real-Time Push Notifications:</strong> Implementing WebSockets or Firebase Cloud Messaging (FCM) to alert students whenever new notes are posted for their enrolled subjects.</li>
  <li><strong>Campus Perk Redemption Store:</strong> Partnering with college cafeterias, print shops, and stationery stores to allow students to redeem earned gamification credits for academic supplies and discounts.</li>
</ol>

<!-- ========================================== -->
<!-- 15. REFERENCES -->
<!-- ========================================== -->
<div class="page-break"></div>
<h1>REFERENCES &amp; WEBLIOGRAPHY</h1>

<ol style="line-height: 1.8; font-size: 9.5pt;">
  <li>React Documentation. <em>React – A JavaScript Library for Building Modern User Interfaces</em>. Available: <a href="https://react.dev/">https://react.dev/</a> (Accessed: 2026).</li>
  <li>Node.js Foundation. <em>Node.js Asynchronous Event-Driven JavaScript Runtime Documentation</em>. Available: <a href="https://nodejs.org/docs/">https://nodejs.org/docs/</a> (Accessed: 2026).</li>
  <li>Express.js Authors. <em>Fast, Unopinionated, Minimalist Web Framework for Node.js</em>. Available: <a href="https://expressjs.com/">https://expressjs.com/</a> (Accessed: 2026).</li>
  <li>MongoDB Inc. <em>MongoDB Manual: Flexible Document Data Modeling and Schema Design</em>. Available: <a href="https://www.mongodb.com/docs/">https://www.mongodb.com/docs/</a> (Accessed: 2026).</li>
  <li>Mongoose ODM. <em>Mongoose Object Data Modeling Documentation</em>. Available: <a href="https://mongoosejs.com/docs/">https://mongoosejs.com/docs/</a> (Accessed: 2026).</li>
  <li>Cloudinary. <em>Cloudinary Media Management and CDN API Reference</em>. Available: <a href="https://cloudinary.com/documentation">https://cloudinary.com/documentation</a> (Accessed: 2026).</li>
  <li>Auth0. <em>JSON Web Tokens (JWT) Architecture and Security Standards (RFC 7519)</em>. Available: <a href="https://jwt.io/introduction">https://jwt.io/introduction</a> (Accessed: 2026).</li>
  <li>Bcrypt.js. <em>Bcrypt: Adaptive Cryptographic Password Hashing Algorithm for Node.js</em>. Available: <a href="https://github.com/kelektiv/node.bcrypt.js">https://github.com/kelektiv/node.bcrypt.js</a> (Accessed: 2026).</li>
  <li>Tailwind Labs. <em>Tailwind CSS: A Utility-First CSS Framework Documentation</em>. Available: <a href="https://tailwindcss.com/docs">https://tailwindcss.com/docs</a> (Accessed: 2026).</li>
  <li>Ionic Team. <em>Capacitor: Cross-Platform Native Runtime for Web Apps</em>. Available: <a href="https://capacitorjs.com/docs">https://capacitorjs.com/docs</a> (Accessed: 2026).</li>
  <li>Postman Inc. <em>Postman API Development, Automation and Testing Documentation</em>. Available: <a href="https://learning.postman.com/">https://learning.postman.com/</a> (Accessed: 2026).</li>
  <li>Mozilla Developer Network (MDN). <em>Web Security, RESTful APIs, and Client-Server Architecture Guides</em>. Available: <a href="https://developer.mozilla.org/">https://developer.mozilla.org/</a> (Accessed: 2026).</li>
</ol>

</body>
</html>
"""

output_html = os.path.abspath("scratch/Campus_Notes_Project_Report.html")
output_pdf = os.path.abspath("Campus_Notes_Exchange_Platform_Project_Report.pdf")

with open(output_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML report successfully written: {output_html} ({os.path.getsize(output_html)} bytes)")

# Convert to PDF via Microsoft Edge Headless
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

print(f"Converting HTML to PDF via: {edge_path} ...")
cmd = [
    edge_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={output_pdf}",
    output_html
]

proc = subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(output_pdf):
    print(f"SUCCESS: Project Report PDF generated at: {output_pdf}")
    print(f"PDF File Size: {os.path.getsize(output_pdf):,} bytes")
else:
    print("Error generating PDF:", proc.stderr)

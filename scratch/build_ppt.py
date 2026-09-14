# -*- coding: utf-8 -*-
"""
Script to create a professional 12-slide Widescreen (16:9) PowerPoint presentation
for the 'Campus Notes Exchange Platform' capstone project.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # Set 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6] # completely blank layout

    # Design Palette
    BG_DARK = RGBColor(15, 23, 42)       # #0F172A Deep Navy
    BG_CARD = RGBColor(30, 41, 59)       # #1E293B Slate Container
    BG_CARD_LIGHT = RGBColor(51, 65, 85) # #334155 Lighter Card
    BORDER_COLOR = RGBColor(59, 130, 246) # #3B82F6 Blue Accent Border
    TEXT_WHITE = RGBColor(255, 255, 255) # #FFFFFF
    TEXT_MUTED = RGBColor(148, 163, 184) # #94A3B8 Slate Text
    TEXT_LIGHT = RGBColor(226, 232, 240) # #E2E8F0 Off-white
    BLUE_ACCENT = RGBColor(37, 99, 235)  # #2563EB Royal Blue
    GREEN_ACCENT = RGBColor(16, 185, 129) # #10B981 Emerald
    GOLD_ACCENT = RGBColor(245, 158, 11) # #F59E0B Amber / Gold
    RED_ACCENT = RGBColor(239, 68, 68)   # #EF4444 Red Accent
    CYAN_ACCENT = RGBColor(6, 182, 212)  # #06B6D4 Cyan Accent

    def set_slide_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text=""):
        # Top Accent Line
        top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.45), Inches(11.733), Inches(0.04))
        top_line.fill.solid()
        top_line.fill.fore_color.rgb = BLUE_ACCENT
        top_line.line.fill.background()

        # Category Badge
        if category_text:
            badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(2.2), Inches(0.32))
            badge.fill.solid()
            badge.fill.fore_color.rgb = BLUE_ACCENT
            badge.line.fill.background()
            tf_b = badge.text_frame
            tf_b.word_wrap = True
            p_b = tf_b.paragraphs[0]
            p_b.text = category_text.upper()
            p_b.font.size = Pt(10)
            p_b.font.bold = True
            p_b.font.color.rgb = TEXT_WHITE
            p_b.alignment = PP_ALIGN.CENTER

        # Title Box
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.95), Inches(11.733), Inches(0.65))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

    def add_card(slide, left, top, width, height, title, items, badge_color=BLUE_ACCENT, title_color=TEXT_WHITE):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = BG_CARD
        card.line.color.rgb = badge_color
        card.line.width = Pt(1.5)

        # Title bar pill
        header_box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.18), width - Inches(0.4), Inches(0.4))
        tf_h = header_box.text_frame
        tf_h.word_wrap = True
        p_h = tf_h.paragraphs[0]
        p_h.text = title
        p_h.font.size = Pt(13)
        p_h.font.bold = True
        p_h.font.color.rgb = title_color

        # Content Box
        content_box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.65), width - Inches(0.4), height - Inches(0.75))
        tf_c = content_box.text_frame
        tf_c.word_wrap = True
        tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0

        for i, item in enumerate(items):
            p = tf_c.add_paragraph() if i > 0 else tf_c.paragraphs[0]
            p.text = f"•  {item}"
            p.font.size = Pt(10.5)
            p.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(6)

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s1)

    # Decorative background circles/gradient effect
    card_center = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    card_center.fill.solid()
    card_center.fill.fore_color.rgb = RGBColor(22, 32, 51)
    card_center.line.color.rgb = BLUE_ACCENT
    card_center.line.width = Pt(2)

    # Add Logos if present
    if os.path.exists("scratch/logo_university.png"):
        s1.shapes.add_picture("scratch/logo_university.png", Inches(1.2), Inches(1.1), height=Inches(1.0))
    if os.path.exists("scratch/logo_company.jpeg"):
        s1.shapes.add_picture("scratch/logo_company.jpeg", Inches(11.0), Inches(1.2), height=Inches(0.8))

    # University & Organization Header
    header_box = s1.shapes.add_textbox(Inches(2.5), Inches(1.1), Inches(8.3), Inches(0.9))
    tf = header_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "HIMACHAL PRADESH TECHNICAL UNIVERSITY"
    p1.font.size = Pt(15)
    p1.font.bold = True
    p1.font.color.rgb = GOLD_ACCENT
    p1.alignment = PP_ALIGN.CENTER
    p2 = tf.add_paragraph()
    p2.text = "L.R Institute of Engineering & Technology, Solan  |  Sortiq Solutions Pvt. Ltd."
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_MUTED
    p2.alignment = PP_ALIGN.CENTER

    # Project Title
    title_box = s1.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(10.9), Inches(1.7))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    pt = tf_t.paragraphs[0]
    pt.text = "CAMPUS NOTES EXCHANGE PLATFORM"
    pt.font.size = Pt(30)
    pt.font.bold = True
    pt.font.color.rgb = TEXT_WHITE
    pt.alignment = PP_ALIGN.CENTER

    pt_sub = tf_t.add_paragraph()
    pt_sub.text = "A Gamified Peer-to-Peer Academic Resource Sharing & Collaboration System"
    pt_sub.font.size = Pt(14)
    pt_sub.font.color.rgb = CYAN_ACCENT
    pt_sub.alignment = PP_ALIGN.CENTER

    # Pill Badges: Tech Stack
    badges = ["React 19 & Vite", "Node.js & Express", "MongoDB & Mongoose", "Cloudinary CDN", "Capacitor Mobile"]
    badge_start_x = 2.4
    for b_text in badges:
        badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(badge_start_x), Inches(4.1), Inches(1.65), Inches(0.35))
        badge.fill.solid()
        badge.fill.fore_color.rgb = RGBColor(30, 58, 138)
        badge.line.color.rgb = BLUE_ACCENT
        tf_b = badge.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = b_text
        p_b.font.size = Pt(9.5)
        p_b.font.bold = True
        p_b.font.color.rgb = TEXT_WHITE
        p_b.alignment = PP_ALIGN.CENTER
        badge_start_x += 1.75

    # Bottom Presenter & Supervisor details
    bottom_box = s1.shapes.add_textbox(Inches(1.2), Inches(4.7), Inches(10.9), Inches(1.8))
    tf_bot = bottom_box.text_frame
    tf_bot.word_wrap = True

    p_cand = tf_bot.paragraphs[0]
    p_cand.text = "Presented By:  PAWAN  (Roll No: 241503020059)"
    p_cand.font.size = Pt(13)
    p_cand.font.bold = True
    p_cand.font.color.rgb = TEXT_WHITE
    p_cand.alignment = PP_ALIGN.CENTER

    p_deg = tf_bot.add_paragraph()
    p_deg.text = "B.Tech in Computer Science and Engineering"
    p_deg.font.size = Pt(11)
    p_deg.font.color.rgb = TEXT_LIGHT
    p_deg.alignment = PP_ALIGN.CENTER

    p_sup = tf_bot.add_paragraph()
    p_sup.text = "Industry Mentor: Mr. Abhishek Kumar (Sortiq)  |  HOD: Ms. Ritika Sharma  |  Principal: Dr. D. P. Sharma"
    p_sup.font.size = Pt(10.5)
    p_sup.font.color.rgb = TEXT_MUTED
    p_sup.alignment = PP_ALIGN.CENTER

    s1.notes_slide.notes_text_frame.text = (
        "Good morning respected examiners and mentors. Today I present my B.Tech capstone and industrial training project: "
        "the Campus Notes Exchange Platform. It is a full-stack, peer-to-peer academic resource platform built using React 19, "
        "Node.js, Express, MongoDB, and Capacitor to solve note-sharing inefficiency across university campuses."
    )

    # =========================================================================
    # SLIDE 2: Problem Statement & Campus Challenges
    # =========================================================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s2)
    add_header(s2, "The Problem: Academic Resource Inefficiency on Campuses", "Problem Statement")

    card_w = Inches(2.78)
    card_h = Inches(4.8)
    top_pos = Inches(1.8)

    add_card(s2, Inches(0.8), top_pos, card_w, card_h, "1. Fragmented Channels", [
        "Study notes scattered across ephemeral WhatsApp groups, Telegram channels, and drives.",
        "Crucial exam notes shared in mid-semester become impossible to find during finals.",
        "Zero centralized institutional catalog or curriculum structure."
    ], RED_ACCENT, RED_ACCENT)

    add_card(s2, Inches(3.78), top_pos, card_w, card_h, "2. No Quality Control", [
        "Notes are circulated with no syllabus verification or subject code matching.",
        "Students frequently waste revision time studying outdated or erroneous materials.",
        "No community rating or validation to identify high-quality notes."
    ], RED_ACCENT, RED_ACCENT)

    add_card(s2, Inches(6.76), top_pos, card_w, card_h, "3. Absence of Incentive", [
        "High-performing students invest hours making handwritten notes but have no motivation to share.",
        "Traditional sharing is one-sided with zero peer recognition or reward loop.",
        "Leads to a culture of resource hoarding before exams."
    ], RED_ACCENT, RED_ACCENT)

    add_card(s2, Inches(9.74), top_pos, card_w, card_h, "4. Storage & Security Risks", [
        "Free cloud drive links expire, reach download limits, or break when files move.",
        "Direct peer downloads on unvetted channels risk circulating malware (.exe, scripts).",
        "Large PDFs clog student smartphone storage."
    ], RED_ACCENT, RED_ACCENT)

    s2.notes_slide.notes_text_frame.text = (
        "In this slide, we examine why traditional note-sharing methods fail college students. Notes are scattered across WhatsApp and Telegram, "
        "lack quality reviews, offer zero incentive for contributors, and suffer from link rot and malware risks."
    )

    # =========================================================================
    # SLIDE 3: The Proposed Solution
    # =========================================================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s3)
    add_header(s3, "The Solution: A Unified, Gamified Academic Hub", "Proposed Solution")

    add_card(s3, Inches(0.8), top_pos, card_w, card_h, "Centralized Taxonomy", [
        "Organized repository classified by Branch, Semester (1-8), Subject, and Unit.",
        "Instant discovery through multi-field keyword regular expression search.",
        "Eliminates reliance on fragmented messaging apps and broken drive links."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s3, Inches(3.78), top_pos, card_w, card_h, "Credit Gamification", [
        "Incentivizes peer contributions through an automated credit reward economy.",
        "Uploaders earn +10 credits on upload and +5 passive credits upon peer downloads.",
        "Campus-wide leaderboard highlights top academic contributors."
    ], GOLD_ACCENT, GOLD_ACCENT)

    add_card(s3, Inches(6.76), top_pos, card_w, card_h, "Community Trust Layer", [
        "Embedded 1-5 star peer rating system with automatic average recalculation.",
        "Threaded discussion comments for peer clarification and feedback.",
        "Student reporting system for copyright and syllabus moderation."
    ], CYAN_ACCENT, CYAN_ACCENT)

    add_card(s3, Inches(9.74), top_pos, card_w, card_h, "Hybrid Availability", [
        "Cloudinary remote CDN for cloud storage with automatic local disk fallback.",
        "Zero-cost deployment over campus Wi-Fi local area network (LAN).",
        "Capacitor integration for native Android mobile accessibility."
    ], BLUE_ACCENT, BLUE_ACCENT)

    s3.notes_slide.notes_text_frame.text = (
        "Our platform solves these challenges through four pillars: a structured academic taxonomy, credit-based gamification to motivate uploads, "
        "a community trust layer with ratings and comments, and hybrid cloud/local deployment with Android mobile support."
    )

    # =========================================================================
    # SLIDE 4: System Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s4)
    add_header(s4, "High-Level Three-Tier Architecture & Data Flow", "System Architecture")

    col_w = Inches(3.7)
    col_h = Inches(4.8)

    add_card(s4, Inches(0.8), top_pos, col_w, col_h, "1. PRESENTATION TIER (Client)", [
        "React 19 Single Page Application (SPA) powered by Vite.",
        "Tailwind CSS for responsive design across mobile and desktop breakpoints.",
        "Framer Motion for micro-animations and Canvas Confetti feedback.",
        "Axios HTTP client with automatic JWT Bearer token request interceptors.",
        "Capacitor Android Container: Hosts compiled React bundle inside native WebView container for offline/LAN campus app."
    ], BLUE_ACCENT, CYAN_ACCENT)

    add_card(s4, Inches(4.8), top_pos, col_w, col_h, "2. APPLICATION TIER (Server)", [
        "Node.js & Express.js RESTful API handling business logic and routing.",
        "JWT Verification & Real-time Banishment Guard (authMiddleware.js).",
        "Role-Based Access Control (RBAC) protecting administrative actions.",
        "Multer File Streaming Pipeline with strict MIME whitelist (25MB limit).",
        "Gamification & Rating Calculation Hooks running on MongoDB events."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s4, Inches(8.8), top_pos, col_w, col_h, "3. DATA & STORAGE TIER", [
        "MongoDB NoSQL document database accessed via Mongoose ODM.",
        "Embedded Subdocuments: Ratings and comments stored inside Note schema for zero-join sub-50ms reads.",
        "Cloudinary Remote CDN: Secure streaming of PDF and image assets.",
        "Local Storage Fallback: Writes to /server/uploads for isolated campus Wi-Fi networks with zero cloud dependencies."
    ], GOLD_ACCENT, GOLD_ACCENT)

    s4.notes_slide.notes_text_frame.text = (
        "Our system follows a decoupled Three-Tier Architecture. The presentation tier uses React 19 and Vite with Capacitor mobile wrapper. "
        "The logic tier runs Node.js/Express with JWT and Multer middlewares. The data tier uses MongoDB with embedded subdocuments for fast reads, "
        "backed by Cloudinary and local disk fallback."
    )

    # =========================================================================
    # SLIDE 5: Technology Stack Justification
    # =========================================================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s5)
    add_header(s5, "Technology Stack & Engineering Rationale", "Tech Stack")

    grid_w = Inches(5.65)
    grid_h = Inches(2.28)

    add_card(s5, Inches(0.8), Inches(1.8), grid_w, grid_h, "Frontend Technologies", [
        "React 19 & Vite: Fast Virtual DOM diffing with sub-second HMR updates.",
        "Tailwind CSS: Utility-first CSS ensuring lightweight, responsive layouts.",
        "Lucide React: Scalable vector iconography for modern UI aesthetics."
    ], BLUE_ACCENT, CYAN_ACCENT)

    add_card(s5, Inches(6.88), Inches(1.8), grid_w, grid_h, "Backend Technologies", [
        "Node.js & Express.js: Event-driven, non-blocking asynchronous REST APIs.",
        "Multer: Streaming buffer processing for high-volume multipart form uploads.",
        "CORS: Controlled cross-origin access between frontend and backend ports."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s5, Inches(0.8), Inches(4.32), grid_w, grid_h, "Database & Cloud Storage", [
        "MongoDB & Mongoose: Flexible document schema eliminates multi-table SQL joins.",
        "Cloudinary CDN: Remote cloud storage with fast CDN delivery and preview URLs.",
        "Local Fallback: Auto-serves from Express static path if offline."
    ], GOLD_ACCENT, GOLD_ACCENT)

    add_card(s5, Inches(6.88), Inches(4.32), grid_w, grid_h, "Security & Mobile Runtimes", [
        "Bcryptjs (10 Rounds): Cryptographically salted one-way password encryption.",
        "JSON Web Tokens (JWT): Stateless bearer tokens with payload verification.",
        "Capacitor: Builds standalone native Android APK from single web codebase."
    ], CYAN_ACCENT, CYAN_ACCENT)

    s5.notes_slide.notes_text_frame.text = (
        "Each technology in our stack was chosen for speed, scalability, and security. React 19 gives rapid UI updates, "
        "Node.js handles concurrent traffic with non-blocking I/O, MongoDB enables embedded schema modeling, and Bcrypt/JWT guarantee enterprise-grade security."
    )

    # =========================================================================
    # SLIDE 6: Database Design & Schema Modeling
    # =========================================================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s6)
    add_header(s6, "Database Design: Schemas & Embedded Subdocuments", "Database Architecture")

    add_card(s6, Inches(0.8), top_pos, col_w, col_h, "User Schema (User.js)", [
        "_id: ObjectId (Primary Key)",
        "name, email (Unique), rollNumber",
        "password: 60-char Bcrypt salted hash",
        "branch, semester: Syllabus mapping",
        "credits: Accumulated gamification points",
        "bookmarks: Array of referenced Note IDs",
        "role: 'user' | 'admin' (RBAC)",
        "isBanned: Real-time suspension flag"
    ], BLUE_ACCENT, CYAN_ACCENT)

    add_card(s6, Inches(4.8), top_pos, col_w, col_h, "Note Schema (Note.js)", [
        "_id: ObjectId (Primary Key)",
        "title, subject, branch, semester, unit",
        "teacherName, tags [ ]: Search keywords",
        "fileUrl: Cloudinary or local upload path",
        "uploadedBy: Ref to User (Author)",
        "views, downloads: Metric counters",
        "averageRating: Pre-calculated score",
        "EMBEDDED SUBDOCUMENTS:",
        "  • ratings [ { user, score: 1-5 } ]",
        "  • comments [ { user, userName, text } ]"
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s6, Inches(8.8), top_pos, col_w, col_h, "Performance Strategy", [
        "Why MongoDB Embedded Subdocuments?",
        "  • Ratings & comments are only read when viewing the parent note.",
        "  • Storing them inside Note.js eliminates costly SQL JOIN operations.",
        "  • Delivers sub-50ms single-query document retrieval.",
        "Report Schema (Report.js):",
        "  • Stores reportedUser, reportedBy, reason, and moderation status for admin review."
    ], GOLD_ACCENT, GOLD_ACCENT)

    s6.notes_slide.notes_text_frame.text = (
        "Here we show our database modeling strategy. Instead of normalizing comments and ratings into separate SQL tables, "
        "we store them as embedded subdocuments inside Note.js. This eliminates multi-table joins and delivers fast sub-50ms read queries."
    )

    # =========================================================================
    # SLIDE 7: Core Features & Student User Flow
    # =========================================================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s7)
    add_header(s7, "Student Experience: Core Functional Modules", "Core Features")

    add_card(s7, Inches(0.8), top_pos, card_w, card_h, "Smart Explore & Search", [
        "Multi-criteria filtering by Branch, Semester, and Subject code.",
        "Regex search across note titles, descriptions, teacher names, and tags.",
        "Real-time debounced updates without full page refreshes."
    ], BLUE_ACCENT, CYAN_ACCENT)

    add_card(s7, Inches(3.78), top_pos, card_w, card_h, "Note Preview & Details", [
        "Interactive modal popup with instant PDF/image viewing.",
        "Displays uploader profile, download counter, and view statistics.",
        "Direct secure download link and one-click bookmarking."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s7, Inches(6.76), top_pos, card_w, card_h, "Peer Rating & Feedback", [
        "In-place 1 to 5 star rating submission.",
        "Mongoose pre-save hook automatically updates the arithmetic average.",
        "Threaded discussion comments for peer Q&A and exam tips."
    ], GOLD_ACCENT, GOLD_ACCENT)

    add_card(s7, Inches(9.74), top_pos, card_w, card_h, "Gamified Upload Suite", [
        "Drag-and-drop file upload with client & server validation.",
        "Syllabus unit and instructor tagging fields.",
        "Celebratory Canvas Confetti animation upon successful upload."
    ], CYAN_ACCENT, CYAN_ACCENT)

    s7.notes_slide.notes_text_frame.text = (
        "This slide outlines the primary student modules: Explore page with regex filtering, Note Preview modal with direct PDF viewing, "
        "in-place 5-star peer reviews, and the gamified upload suite with confetti visual feedback."
    )

    # =========================================================================
    # SLIDE 8: Gamification & Engagement Engine
    # =========================================================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s8)
    add_header(s8, "Credit Economy & Gamification Flywheel", "Gamification Engine")

    col_gam_w = Inches(2.78)
    add_card(s8, Inches(0.8), top_pos, col_gam_w, card_h, "Step 1: Upload (+10)", [
        "Student scans and uploads high-quality notes or PPT slides.",
        "System allocates +10 credit points to the student's profile instantly.",
        "Confetti micro-animation delivers immediate psychological gratification."
    ], BLUE_ACCENT, CYAN_ACCENT)

    add_card(s8, Inches(3.78), top_pos, col_gam_w, card_h, "Step 2: Peer Discovery", [
        "Peers discover the notes via branch/semester filters before exams.",
        "Quality preview lets peers inspect syllabus match before downloading.",
        "Transparent star ratings guide peers to the most reliable notes."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s8, Inches(6.76), top_pos, col_gam_w, card_h, "Step 3: Royalty (+5)", [
        "Whenever another student downloads the note, the author receives +5 credits.",
        "Creates a passive dividend loop: better notes yield higher recurring credits.",
        "Prevents self-download credit farming via author identity checks."
    ], GOLD_ACCENT, GOLD_ACCENT)

    add_card(s8, Inches(9.74), top_pos, col_gam_w, card_h, "Step 4: Leaderboard", [
        "Institute-wide leaderboard ranks top student contributors.",
        "Fosters healthy academic recognition across departments.",
        "Transforms note-sharing from a chore into an engaging campus activity."
    ], CYAN_ACCENT, CYAN_ACCENT)

    s8.notes_slide.notes_text_frame.text = (
        "Our gamification engine creates a self-sustaining sharing loop: +10 credits for uploading, +5 passive credits whenever peers download, "
        "and a public campus leaderboard. This completely solves the problem of student reluctance to share notes."
    )

    # =========================================================================
    # SLIDE 9: Security & Moderation
    # =========================================================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s9)
    add_header(s9, "Enterprise Security & Content Moderation", "Security & Governance")

    add_card(s9, Inches(0.8), top_pos, card_w, card_h, "Bcrypt Password Hashing", [
        "Passwords never stored in plaintext.",
        "Mongoose pre-save hook generates 10-round cryptographic salt.",
        "Protects against dictionary and rainbow-table attacks."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s9, Inches(3.78), top_pos, card_w, card_h, "Stateless JWT Auth", [
        "Signed HMAC SHA-256 tokens authenticate client requests.",
        "Axios interceptor injects Bearer token into outgoing headers.",
        "Query parameter token support enables direct authenticated downloads."
    ], BLUE_ACCENT, CYAN_ACCENT)

    add_card(s9, Inches(6.76), top_pos, card_w, card_h, "Multer File Sanitization", [
        "Strict extension whitelist: .pdf, .ppt, .pptx, .jpg, .jpeg, .png.",
        "Executable extensions (.exe, .bat, .sh) rejected before buffer processing.",
        "Strict 25MB file size limit prevents Denial of Service (DoS)."
    ], GOLD_ACCENT, GOLD_ACCENT)

    add_card(s9, Inches(9.74), top_pos, card_w, card_h, "Instant Banishment & RBAC", [
        "Middleware checks user.isBanned flag on every protected request.",
        "Banned accounts immediately receive HTTP 403 Forbidden.",
        "Admin console facilitates one-click user ban and content cleanup."
    ], RED_ACCENT, RED_ACCENT)

    s9.notes_slide.notes_text_frame.text = (
        "Security is implemented at multiple layers: 10-round salted Bcrypt password hashing, stateless JWT authorization, "
        "Multer file type whitelisting with 25MB caps, and real-time database banishment checks in our auth middleware."
    )

    # =========================================================================
    # SLIDE 10: Mobile Readiness & Campus Deployment
    # =========================================================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s10)
    add_header(s10, "Mobile Readiness & Campus Wi-Fi Networking", "Deployment Topology")

    add_card(s10, Inches(0.8), top_pos, card_w, card_h, "Capacitor Mobile Build", [
        "Wraps React production build (dist/) in native Android container.",
        "Generates installable .apk without rebuilding frontend in React Native.",
        "100% web code reuse with native mobile performance."
    ], BLUE_ACCENT, CYAN_ACCENT)

    add_card(s10, Inches(3.78), top_pos, card_w, card_h, "Zero-Cost Campus LAN", [
        "Node.js backend binds to host machine's Wi-Fi network interface IP.",
        "Students access platform over college Wi-Fi (e.g., 192.168.1.45:5000).",
        "Requires zero external server fees or internet dependency."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s10, Inches(6.76), top_pos, card_w, card_h, "Dynamic Host Resolution", [
        "Client uses window.location.hostname to dynamically target backend API.",
        "Prevents static IP mismatch errors when moving across campus Wi-Fi APs.",
        "Smooth transition between development and staging environments."
    ], GOLD_ACCENT, GOLD_ACCENT)

    add_card(s10, Inches(9.74), top_pos, card_w, card_h, "Cloud Production Path", [
        "Tested deployment roadmap for Render / Railway cloud servers.",
        "MongoDB Atlas M0 Free Tier for resilient cloud database hosting.",
        "Cloudinary CDN ensures persistent document storage across restarts."
    ], CYAN_ACCENT, CYAN_ACCENT)

    s10.notes_slide.notes_text_frame.text = (
        "For campus deployment, we support two modes: zero-cost local Wi-Fi hosting via LAN IP binding, and production cloud deployment. "
        "Using Capacitor, the React frontend is packaged into a native Android APK, allowing students to access notes directly on their phones."
    )

    # =========================================================================
    # SLIDE 11: Testing & Results
    # =========================================================================
    s11 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s11)
    add_header(s11, "Quality Assurance: Testing & Performance Benchmarks", "System Verification")

    add_card(s11, Inches(0.8), top_pos, Inches(5.65), Inches(4.8), "Comprehensive Test Matrix", [
        "TC-01 to TC-04: User registration & JWT authentication passed.",
        "TC-05 to TC-07: Valid PDF upload stored; malicious executables (.exe) and oversized files (>25MB) successfully blocked.",
        "TC-08 & TC-09: Regex keyword search & multi-select branch filtering verified.",
        "TC-10 to TC-12: Download counter + author credit increment (+5) validated.",
        "TC-13 & TC-14: Bookmarking & instant user banishment (HTTP 403) verified.",
        "TC-15 & TC-16: Local campus Wi-Fi access & disk fallback validated.",
        "Result: 16 / 16 Test Cases Passed (100% Pass Rate)."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s11, Inches(6.88), top_pos, Inches(5.65), Inches(4.8), "Performance Benchmarks", [
        "Sub-50ms Read Queries: Embedded subdocuments eliminate SQL joins, delivering instantaneous note view and comment loading.",
        "Lightweight Bundle: Vite tree-shaking yields optimized production JavaScript bundles for fast initial page load.",
        "Hybrid Resilience: Server automatically falls back to local disk storage if Cloudinary CDN credentials are unset or offline.",
        "Responsive Breakpoints: Validated on mobile (360px), tablet (768px), and desktop (1080p) screens with zero layout distortion.",
        "Zero Memory Leaks: Multer memory buffers cleanly cleared after Cloudinary upload completes."
    ], BLUE_ACCENT, CYAN_ACCENT)

    s11.notes_slide.notes_text_frame.text = (
        "Our quality assurance process encompassed 16 formal test cases covering authentication, upload sanitization, search accuracy, "
        "credit allocation, and ban enforcement. All 16 test cases passed with 100% success rate, achieving sub-50ms read latencies."
    )

    # =========================================================================
    # SLIDE 12: Conclusion & Future Scope
    # =========================================================================
    s12 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s12)
    add_header(s12, "Conclusion & Future Roadmap", "Conclusion & Scope")

    add_card(s12, Inches(0.8), top_pos, Inches(5.65), Inches(4.8), "Project Summary", [
        "Delivered a production-ready, peer-to-peer academic resource ecosystem.",
        "Solves campus resource fragmentation by centralizing notes by branch, semester, and unit.",
        "Incentivizes active student participation through an organic credit-based gamification loop.",
        "Robust enterprise security with Bcrypt, stateless JWT, and instant ban enforcement.",
        "Successfully developed and tested during industrial internship at Sortiq Solutions Pvt. Ltd."
    ], GREEN_ACCENT, GREEN_ACCENT)

    add_card(s12, Inches(6.88), top_pos, Inches(5.65), Inches(4.8), "Future Roadmap", [
        "AI Note Summarizer: Automated bulleted revision summaries & key formula generation from uploaded PDFs using LLMs.",
        "OCR Handwritten Search: Optical Character Recognition (Tesseract) to search text inside handwritten notes.",
        "Push Notifications: Real-time alerts when new notes are uploaded for enrolled courses.",
        "Campus Perk Store: Redeem earned gamification credits for campus bookshop and printing discounts.",
        "THANK YOU! Open for Viva Examination & Demo Questions."
    ], GOLD_ACCENT, GOLD_ACCENT)

    s12.notes_slide.notes_text_frame.text = (
        "In conclusion, the Campus Notes Exchange Platform provides a secure, organized, and gamified solution to academic resource sharing. "
        "Future enhancements will introduce AI note summarization, OCR search inside handwritten PDFs, and campus perk redemption. "
        "Thank you, and I am now ready for viva questions and project demonstration."
    )

    # Save Presentation
    output_path = os.path.abspath("Campus_Notes_Exchange_Presentation.pptx")
    prs.save(output_path)
    print(f"SUCCESS: Presentation successfully saved to: {output_path}")
    print(f"File Size: {os.path.getsize(output_path):,} bytes")

if __name__ == "__main__":
    create_deck()

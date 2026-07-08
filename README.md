# Swasthya Sarathi (स्वास्थ्य सारथी)

Swasthya Sarathi is an intelligent, AI-powered healthcare management and triage platform designed for District Health Departments. It streamlines patient triage, health centre resource monitoring, and district-wide administration, especially in resource-constrained environments.

## Features & Functionality

### 1. AI-Powered Patient Triage
*   **Intelligent Assessment:** Uses Gemini AI to analyze patient symptoms (either typed or transcribed via voice) and automatically determine triage status (RED - Critical, AMBER - Warning, GREEN - Routine).
*   **Relocation Directives:** Provides immediate, actionable directives based on priority (e.g., "Emergency ICU (Floor 2, Bed 14A)" for critical patients, or "General Waiting Room" for routine cases).
*   **Multilingual Support:** Supports input and output in both English and Marathi, ensuring accessibility for local healthcare workers.
*   **Symptom Extraction & Action Plans:** Automatically extracts key symptoms and generates suggested action plans and administrative alerts.
*   **Voice Assistant:** Built-in live voice assistant for hands-free symptom recording and triage.

### 2. Live Resource Monitoring (Grid & Map View)
*   **Real-Time Tracking:** Monitors beds, doctors, and medicine inventory across various Primary Health Centres (PHCs) and Community Health Centres (CHCs).
*   **Interactive Map View:** Integrated Google Maps view displaying the exact location and status (Critical, Warning, OK) of each health centre in real-time.
*   **Predictive Analytics & 24-Hour Trends:** 
    *   Visualizes 24-hour historical trends for bed availability and overall medicine stock indices using `recharts`.
    *   **48-Hour Shortage Forecast:** Analyzes current consumption rates to predict imminent medicine stock depletions up to 48 hours in advance, allowing for proactive restocking.

### 3. District Management Board
*   **Real-Time Critical Alerts:** Automatically generates high-priority alerts when a centre's bed availability drops to zero or specific medicine stocks fall below critical thresholds.
*   **Issue Reporting:** Allows centre administrators to manually report infrastructural, staffing, or stock-related issues directly to the district board.
*   **Centralized Overview:** Provides the District Health Department with a unified dashboard to track system-generated alerts and manually reported issues across all clinics.

### 4. User Authentication & Roles
*   **Secure Access:** Integrated with Firebase Authentication.
*   **Role-Based Views:** Supports different roles (e.g., Centre Admin, District Officer) with distinct access levels and permissions.
*   **Profile Management:** A dedicated profile view for managing user details, designations, and organizational information.

### 5. Data Persistence
*   **Cloud Storage:** All triage histories and management reports are securely stored in Firebase Firestore, allowing for historical auditing and longitudinal analysis.

## End-to-End Workflow

1.  **Authentication:** The user logs into the application using their credentials. Their role determines their level of access.
2.  **Triage (Frontline Workers):** 
    *   A patient arrives at a clinic.
    *   The healthcare worker enters the patient's symptoms via text or voice.
    *   The AI processes the input and immediately returns a triage classification, suggested action plan, and a specific relocation directive (e.g., directing a critical patient immediately to an ICU bed).
    *   The triage record is saved to the cloud for historical reference.
3.  **Resource Tracking (Centre Admins):**
    *   Admins view the **Live Resource Grid** to check the status of their own or nearby clinics.
    *   They can switch to the **Trends Tab** to see the 48-hour forecast and request supplies *before* they run out.
4.  **District Management (CMOs / District Officers):**
    *   Officers monitor the **District Management Board**.
    *   If a clinic's beds are full or medicine is critically low, a **System Alert** pops up in real-time on the board.
    *   Officers can view manual reports submitted by centre admins and take appropriate administrative action (e.g., dispatching ambulances or supplies).

## Technology Stack

*   **Frontend:** React (Next.js App Router), TypeScript, Tailwind CSS
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **Maps:** Google Maps integration via iframe
*   **Backend / AI:** Google Gemini API (Server-side API routes)
*   **Database & Auth:** Firebase (Firestore, Authentication)

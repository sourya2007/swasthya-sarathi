import express from "express";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage } from "@google/genai";
import path from "path";
import fs from "fs";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

async function callOpenRouter(systemPrompt: string, userMessage: string, model?: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://swasthya-sarathi.onrender.com",
      "X-Title": "Swasthya Sarathi",
    },
    body: JSON.stringify({
      model: model || process.env.OPENROUTER_MODEL || "qwen/qwen3-coder:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return text;
}

// Load .env file manually (no dotenv dependency needed)
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
    console.log("> Loaded environment variables from .env file");
  } else {
    console.warn("> Warning: No .env file found. GEMINI_API_KEY must be set in the environment.");
  }
} catch (e) {
  console.warn("> Warning: Could not load .env file:", e);
}

const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");
const port = parseInt(process.env.PORT || "3000", 10);

if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
  console.error("> FATAL: Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is set. AI features will not work.");
} else if (process.env.OPENROUTER_API_KEY) {
  console.log("> OpenRouter API key found — triage/management will use OpenRouter.");
}

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

async function startServer() {
  const server = express();
  server.use(express.json({ limit: "50mb" }));
  server.use(express.urlencoded({ extended: true }));

  // Helper to parse cookies manually
  function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};
    return Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const parts = c.split("=");
        return [parts[0], decodeURIComponent(parts.slice(1).join("="))];
      })
    );
  }

  // ==========================================
  // Authentication APIs (Vite-compatible session)
  // ==========================================

  // Get user session
  server.get("/api/auth/session", (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const sessionToken = cookies["session_user"];

    if (sessionToken) {
      try {
        const user = JSON.parse(sessionToken);
        return res.json({ user });
      } catch (e) {
        // Ignore parsing errors and clear session
      }
    }
    return res.json({});
  });

  // Sync Firebase authentication with the backend session
  server.post("/api/auth/firebase-signin", (req, res) => {
    const { email, name, image, role: requestedRole } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    // Check if user is administrator
    let role = requestedRole;
    if (!role) {
      const cookies = parseCookies(req.headers.cookie);
      if (cookies["session_user"]) {
        try {
          const existingUser = JSON.parse(cookies["session_user"]);
          role = existingUser.role || "healthcare_worker";
        } catch (e) {
          role = "healthcare_worker";
        }
      } else {
        role = "healthcare_worker";
      }
    }
    if (false) {
      role = "administrator";
    }

    const user = { name, email, image, role };

    // Set cookie
    res.cookie("session_user", JSON.stringify(user), {
      path: "/",
      maxAge: 86400 * 1000 * 30, // 30 days
      sameSite: "none",
      secure: true,
    });

    return res.json({ success: true, user });
  });

  // Initiate Sign-In (with Google OAuth or Local Sandbox Fallback)
  server.get("/api/auth/signin/google", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = req.query.callbackUrl as string || "";

    // If Google Credentials are not configured, display Sandbox Fallback selector
    if (!clientId || !clientSecret) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Secure Sandbox Sign-In</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-slate-50 text-slate-900 font-sans h-screen flex flex-col items-center justify-center p-6">
            <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
              <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-indigo-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 00-2.25 2.25z" />
                </svg>
              </div>
              <h1 class="text-xl font-bold mb-2">Sandbox Authentication</h1>
              <p class="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 leading-relaxed">
                Google OAuth client keys are not set. The platform has automatically loaded the high-fidelity sandbox login so you can fully explore the dashboard and triage analytics.
              </p>
              
              <div class="flex flex-col gap-3">
                <button onclick="login('administrator')" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-4 rounded-xl transition-all">
                  Sign in as District Administrator
                </button>
                <button onclick="login('healthcare_worker')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-4 rounded-xl transition-all">
                  Sign in as Rural Healthcare Worker
                </button>
              </div>
            </div>
            <script>
              function login(role) {
                const user = {
                  name: role === 'administrator' ? 'Dr. Suresh Kumar' : 'Arjun Sharma',
                  email: role === 'administrator' ? 'suresh@admin.com' : 'arjun@clinic.com',
                  role: role
                };
                document.cookie = "session_user=" + encodeURIComponent(JSON.stringify(user)) + "; path=/; max-age=86400; SameSite=None; Secure";
                window.location.href = "/auth/success";
              }
            </script>
          </body>
        </html>
      `);
    }

    // If credentials exist, redirect to real Google OAuth
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/callback/google`;
    const state = encodeURIComponent(callbackUrl);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&state=${state}`;
    return res.redirect(googleAuthUrl);
  });

  // Google OAuth Callback Handler
  server.get("/api/auth/callback/google", async (req, res) => {
    const code = req.query.code as string;
    const state = req.query.state as string; // Stores original callbackUrl
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      return res.status(400).send("Authentication callback failed due to missing code or credentials.");
    }

    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/callback/google`;
      
      // Exchange auth code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`Token exchange failed: ${errText}`);
      }

      const tokens = await tokenRes.json();
      const idToken = tokens.id_token;

      // Decode JWT token profile
      const tokenParts = idToken.split(".");
      const profile = JSON.parse(Buffer.from(tokenParts[1], "base64").toString("utf-8"));

      const email = profile.email || "";
      const name = profile.name || "Google User";
      
      // Check if user is administrator
      let role = "healthcare_worker";
      if (false) {
        role = "administrator";
      }

      const user = { name, email, role };
      
      // Set cookie
      res.cookie("session_user", JSON.stringify(user), {
        path: "/",
        maxAge: 86400 * 1000,
        sameSite: "none",
        secure: true,
      });

      return res.redirect("/auth/success");
    } catch (error) {
      console.error("Google OAuth error:", error);
      return res.status(500).send("Failed to retrieve user profile from Google OAuth.");
    }
  });

  // Auth Success Landing (signals the opener to refresh and close)
  server.get("/auth/success", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Auth Success</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #fafafa;">
          <h2>Authentication Successful!</h2>
          <p>Connecting back to Swasthya Sarathi...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS" }, "*");
            }
            window.close();
          </script>
        </body>
      </html>
    `);
  });

  // Sign-out API
  server.post("/api/auth/signout", (req, res) => {
    res.clearCookie("session_user", { 
      path: "/",
      sameSite: "none",
      secure: true
    });
    return res.json({ success: true });
  });

  // ==========================================
  // Patient Triage and Management APIs (Gemini)
  // ==========================================

  const TRIAGE_PROMPT = `You are Swasthya Sarathi, an AI Public Healthcare Triage System for Rural Primary Health Centres (PHCs).
  Analyze the patient's condition (which may be provided via text or audio).
  1. Detect the language used by the patient.
  2. Provide a triage assessment based on the clinical details.
  3. TRANSLATE all output fields and UI labels into the PREFERRED LANGUAGE (if provided in the prompt), otherwise translate to the DETECTED LANGUAGE.
  4. The triageStatus MUST remain exactly "RED", "AMBER", or "GREEN".

  You MUST respond ONLY with a valid JSON object matching the following structure exactly:
  {
    "transcription": "string (If audio was provided, transcribe what the patient said in their original language. If text was provided, mirror it back.)",
    "languageDetected": "string (name of the language detected, in that language)",
    "extractedSymptoms": ["string (translated to target language)", "string"],
    "estimatedDuration": "string (translated)",
    "triageStatus": "RED | AMBER | GREEN",
    "suggestedAction": "string (clear, actionable next step, translated)",
    "administrativeAlertFlags": ["string (translated)", "string"],
    "uiTranslations": {
      "statusBannerPriority": "string",
      "statusBannerMessage": "string",
      "estResponseTimeLabel": "string",
      "languageLabel": "string",
      "estDurationLabel": "string",
      "extractedSymptomsLabel": "string",
      "noSymptomsLabel": "string",
      "suggestedActionPlanLabel": "string",
      "administrativeAlertsLabel": "string",
      "patientIntakeLabel": "string",
      "symptomsDescriptionLabel": "string",
      "quickTestScenariosLabel": "string",
      "analyzeButtonLabel": "string"
    }
  }

  Triage Status Guide:
  RED: Emergency, requires immediate medical attention.
  AMBER: Urgent, needs care soon but not immediately life-threatening.
  GREEN: Non-urgent, routine care or self-management.`;

  async function runAITriage(systemPrompt: string, userPrompt: string): Promise<string> {
    if (process.env.OPENROUTER_API_KEY) {
      try {
        return await callOpenRouter(systemPrompt, userPrompt);
      } catch (orErr: any) {
        console.error("OpenRouter triage failed, trying Gemini:", orErr.message);
      }
    }
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [userPrompt],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      return text;
    }
    throw new Error("No AI provider available (set OPENROUTER_API_KEY or GEMINI_API_KEY)");
  }

  server.post("/api/triage", async (req, res) => {
    try {
      const { description, preferredLanguage } = req.body;
      if (!description || typeof description !== "string") {
        return res.status(400).json({ error: "Patient description is required." });
      }
      let userPrompt = preferredLanguage
        ? `Preferred Language for Output Translations: ${preferredLanguage}\n\n${description}`
        : description;

      const text = await runAITriage(TRIAGE_PROMPT, userPrompt);
      return res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Triage API Error:", error?.message || error);
      return res.status(500).json({
        error: error?.message || "Failed to process the triage request.",
        details: "Check that OPENROUTER_API_KEY or GEMINI_API_KEY is set correctly.",
      });
    }
  });

  const MANAGEMENT_PROMPT = `You are Swasthya Sarathi, an AI Public Healthcare Management System for Rural Primary Health Centres (PHCs).
  Analyze the daily centre status report (provided via text or audio).
  1. Extract key metrics (footfall, beds, doctor attendance, test availability).
  2. Generate early stock-out warnings based on the report.
  3. Provide AI-driven demand forecasts based on current conditions and historical context implied.
  4. Recommend smart resource redistributions across district PHCs/CHCs to balance load.
  5. Flag underperforming or under-resourced centres for district administrators.
  6. TRANSLATE all output fields and UI labels into the PREFERRED LANGUAGE.

  You MUST respond ONLY with a valid JSON object matching this structure exactly:
  {
    "transcription": "string",
    "metrics": {
      "footfall": "string",
      "bedsAvailable": "string",
      "doctorAttendance": "string",
      "testsAvailable": "string"
    },
    "stockWarnings": [
      { "item": "string", "daysLeft": "string", "warningLevel": "LOW" | "CRITICAL" }
    ],
    "demandForecasts": [
      { "condition": "string", "expectedSurge": "string", "reason": "string" }
    ],
    "redistributionRecommendations": [
      { "fromCentre": "string", "toCentre": "string", "resource": "string", "urgency": "HIGH" | "MEDIUM" | "LOW" }
    ],
    "flaggedCentres": [
      { "centre": "string", "reason": "string", "severity": "CRITICAL" | "WARNING" }
    ],
    "uiTranslations": {
      "metricsTitle": "string",
      "stockWarningsTitle": "string",
      "demandForecastsTitle": "string",
      "redistributionTitle": "string",
      "flaggedCentresTitle": "string"
    }
  }`;

  async function runAIManagement(systemPrompt: string, userPrompt: string): Promise<string> {
    if (process.env.OPENROUTER_API_KEY) {
      try {
        return await callOpenRouter(systemPrompt, userPrompt);
      } catch (orErr: any) {
        console.error("OpenRouter management failed, trying Gemini:", orErr.message);
      }
    }
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [userPrompt],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      return text;
    }
    throw new Error("No AI provider available (set OPENROUTER_API_KEY or GEMINI_API_KEY)");
  }

  server.post("/api/management", async (req, res) => {
    try {
      const { description, preferredLanguage } = req.body;
      if (!description || typeof description !== "string") {
        return res.status(400).json({ error: "Centre status description is required." });
      }
      let userPrompt = preferredLanguage
        ? `Preferred Language for Output Translations: ${preferredLanguage}\n\n${description}`
        : description;

      const text = await runAIManagement(MANAGEMENT_PROMPT, userPrompt);
      return res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Management API Error:", error?.message || error);
      return res.status(500).json({
        error: error?.message || "Failed to process the management request.",
        details: "Check that OPENROUTER_API_KEY or GEMINI_API_KEY is set correctly.",
      });
    }
  });

  // ==========================================
  // Development Vite Middleware or Production Static File Serving
  // ==========================================
  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    server.use(vite.middlewares);
    console.log("> Dev Mode: Mounted Vite programmatic HMR middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    server.use(express.static(distPath));
    
    server.get(/(.*)/, (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application static files not found. Please build the application.");
      }
    });
  }

  const httpServer = server.listen(port, () => {
    console.log(`> Backend Server listening at http://localhost:${port} in ${process.env.NODE_ENV || "production"} mode`);
  });

  // ==========================================
  // WebSocket Server for Live Voice API
  // ==========================================
  const wss = new WebSocketServer({ server: httpServer, path: "/live" });

  wss.on("connection", async (clientWs) => {
    console.log("Client connected to Live API");
    try {
      const session = await ai.live.connect({
        model: "gemini-2.0-flash-live-001",
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: "You are a helpful healthcare assistant. You help triage patients, understand symptoms, and create preliminary medical reports. Speak slowly, softly, and clearly. Always match the user's language exactly (e.g., if the user speaks Hindi, reply in Hindi). Do not speak too fast. You must use the `update_health_dashboard` tool to display symptoms, pain points, and medical aid instructions on the screen.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [{
              name: "update_health_dashboard",
              description: "Updates the live dashboard with the patient's symptoms, pain points, and medical aid information.",
              parameters: {
                type: "OBJECT" as any,
                properties: {
                  symptoms: {
                    type: "ARRAY" as any,
                    items: { type: "STRING" as any },
                    description: "List of identified symptoms"
                  },
                  painPoints: {
                    type: "ARRAY" as any,
                    items: { type: "STRING" as any },
                    description: "List of body parts where pain is reported (e.g. 'head', 'chest', 'left_arm', 'stomach', 'right_leg', 'back', 'neck')"
                  },
                  medicalAidCards: {
                    type: "ARRAY" as any,
                    items: {
                      type: "OBJECT" as any,
                      properties: {
                        title: { type: "STRING" as any },
                        instructions: { type: "STRING" as any }
                      }
                    },
                    description: "Interactive medical aid cards with immediate first aid or action steps"
                  }
                },
                required: ["symptoms", "painPoints", "medicalAidCards"]
              }
            }]
          }]
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ turnComplete: true }));
            }
            if (message.serverContent?.inputTranscription?.text) {
              clientWs.send(JSON.stringify({ inputTranscript: message.serverContent.inputTranscription.text }));
            }
            if (message.serverContent?.outputTranscription?.text) {
              clientWs.send(JSON.stringify({ outputTranscript: message.serverContent.outputTranscription.text }));
            }
            
            if (message.toolCall?.functionCalls) {
              for (const call of message.toolCall.functionCalls) {
                if (call.name === "update_health_dashboard") {
                  clientWs.send(JSON.stringify({ dashboardUpdate: call.args }));
                  session.sendToolResponse({
                    functionResponses: [{
                      id: call.id,
                      name: call.name,
                      response: { success: true }
                    }]
                  });
                }
              }
            }
          },
          onclose: () => {
            console.log("Gemini session closed");
            clientWs.close();
          },
          onerror: (error) => {
            console.error("Gemini session error:", error);
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (error) {
          console.error("Error processing client message:", error);
        }
      });

      clientWs.on("close", () => {
        console.log("Client disconnected");
      });
    } catch (error) {
      console.error("Error connecting to Gemini Live:", error);
      clientWs.send(JSON.stringify({ error: "Failed to connect to Live API" }));
      clientWs.close();
    }
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});

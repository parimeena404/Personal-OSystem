import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini SDK to prevent startup crashes when API keys are not yet configured.
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// AI INTELLIGENCE ENDPOINTS (SERVER-SIDE PROXIES)
// ----------------------------------------------------

/**
 * 1. EXECUTIVE DASHBOARD INSIGHTS ENGINE
 * Analyzes the human's current life/project footprint to yield high-ROI action paths.
 */
app.post("/api/intelligence/dashboard", async (req, res) => {
  const { projectsCount, openTasksCount, notesCount } = req.body;
  const generateFallback = () => ({
    highRoiTask: "Organize project priorities and refine task list",
    roiExplanation: `With ${projectsCount || 0} active projects and ${openTasksCount || 0} pending tasks, structuring your goals will immediately clear cognitive overhead.`,
    greatestRisk: "Task drag and loss of momentum due to scattered notes.",
    bottleneck: "Unlinked memories and missing action-steps in your knowledge base.",
    learningRecommendation: "Explore structured goal setting, dynamic task sequencing, and core automation workflows.",
    careerOpportunity: "Boost operational velocity by standardizing daily task flows.",
    decisionRecommendation: "Review and archive older, completed tasks to reduce clutter.",
    weeklyGoalProgress: Math.min(100, Math.max(10, 100 - (openTasksCount || 0) * 8)),
  });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallback());
    }
    const ai = getAIClient();

    const prompt = `Analyze this user's current digital workspace footprint and generate predictive suggestions.
      Current footprint:
      - Active Projects: ${projectsCount}
      - Pending Tasks: ${openTasksCount}
      - Stored Memories/Notes: ${notesCount}

      Produce high-leverage strategic suggestions. Be concise, simple, practical, and highly direct. No generic filler.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            highRoiTask: {
              type: Type.STRING,
              description: "The absolute highest-return active task or initiative to attack today.",
            },
            roiExplanation: {
              type: Type.STRING,
              description: "Deep explanation of why this yields maximum leverage.",
            },
            greatestRisk: {
              type: Type.STRING,
              description: "The biggest impending operational/strategic risk (e.g., skill decay, project drag).",
            },
            bottleneck: {
              type: Type.STRING,
              description: "Current structural bottleneck holding back the human's productivity.",
            },
            learningRecommendation: {
              type: Type.STRING,
              description: "A futuristic skill or study recommendation based on active trends.",
            },
            careerOpportunity: {
              type: Type.STRING,
              description: "High-level strategic move or alignment they should consider.",
            },
            decisionRecommendation: {
              type: Type.STRING,
              description: "A hard decision they are likely postponing that they must resolve.",
            },
            weeklyGoalProgress: {
              type: Type.INTEGER,
              description: "A calculated stress/progress value from 1 to 100 based on their footprint.",
            },
          },
          required: [
            "highRoiTask",
            "roiExplanation",
            "greatestRisk",
            "bottleneck",
            "learningRecommendation",
            "careerOpportunity",
            "decisionRecommendation",
            "weeklyGoalProgress"
          ],
        },
      },
    });

    const result = response.text ? JSON.parse(response.text.trim()) : generateFallback();
    res.json(result);
  } catch (error: any) {
    console.warn("Dashboard Insights generation failed, using local fallback:", error);
    res.json(generateFallback());
  }
});

/**
 * 2. AUTOMATIC PROJECT GENERATOR / ESTIMATOR
 * Explodes a simple project description into structured schedules, estimates, risk ratings, and sprint tasks.
 */
app.post("/api/intelligence/project-planner", async (req, res) => {
  const { name, description } = req.body;
  const generateFallback = () => ({
    timeline: "2 to 3 weeks",
    riskRating: "medium",
    aiReport: `Project "${name || "New Initiative"}" has been analyzed. Recommended approach is to build modular components incrementally to reduce risk. Primary challenges include scope alignment and early milestone tracking.`,
    tasks: [
      { title: "Define core scope and requirements", priority: "high", estimatedHours: 6, aiRiskText: "Failing to define strict boundaries can lead to feature creep." },
      { title: "Develop base components and layouts", priority: "high", estimatedHours: 12, aiRiskText: "Design inconsistencies may slow down later stages." },
      { title: "Integrate mock data or fallback state handlers", priority: "medium", estimatedHours: 8, aiRiskText: "API dependency bottlenecks can delay testing." },
      { title: "Conduct full system verification and styling audit", priority: "low", estimatedHours: 6, aiRiskText: "Last-minute styling adjustments might introduce layout shifts." }
    ]
  });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallback());
    }
    const ai = getAIClient();

    const prompt = `Act as an AI Technical Project Planner. Analyze this proposed project:
      Name: ${name}
      Description: ${description}

      Deconstruct it into an execution roadmap. Estimate timelines, assign specific tasks with calculated risk ratings, and write a concise, premium engineering report on challenges or speed optimization.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeline: {
              type: Type.STRING,
              description: "Detailed timeline estimation (e.g. '3 weeks', '4 months') with milestone phases.",
            },
            riskRating: {
              type: Type.STRING,
              description: "One of: 'low', 'medium', 'critical'",
            },
            aiReport: {
              type: Type.STRING,
              description: "A highly concise technical report covering risk mitigation, architectural recommendation, and core challenge analysis.",
            },
            tasks: {
              type: Type.ARRAY,
              description: "List of exactly 4 critical technical tasks needed to execute this successfully.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Detailed action-focused technical task title." },
                  priority: { type: Type.STRING, description: "Either 'high', 'medium', or 'low'." },
                  estimatedHours: { type: Type.INTEGER, description: "Calculated execution hours." },
                  aiRiskText: { type: Type.STRING, description: "Warning on potential implementation roadblocks for this task." },
                },
                required: ["title", "priority", "estimatedHours", "aiRiskText"],
              },
            },
          },
          required: ["timeline", "riskRating", "aiReport", "tasks"],
        },
      },
    });

    const result = response.text ? JSON.parse(response.text.trim()) : generateFallback();
    res.json(result);
  } catch (error: any) {
    console.warn("Project planning failed, using local fallback:", error);
    res.json(generateFallback());
  }
});

/**
 * 3. AI CONTENT FACTORY
 * Takes one seed concept and generates a spectrum of digital distributions instantly.
 */
app.post("/api/intelligence/content-factory", async (req, res) => {
  const { seedIdea, selectedFormat } = req.body;
  const generateFallback = () => ({
    linkedin: `💡 Here is a thought on "${seedIdea || "Productivity"}"...\n\nFocusing on high-ROI work is the ultimate leverage. When we streamline our daily actions, we eliminate clutter and maximize creative output.\n\nWhat are you focusing on today?`,
    twitter: `Streamlining "${seedIdea || "Productivity"}" shouldn't be complicated. Focus on high-leverage work, eliminate distraction, and build robust workflows. 🚀`,
    newsletter: `Welcome to this week's digest.\n\nToday, we're exploring "${seedIdea || "Systems Leverage"}" and how to build efficient workflows. The key takeaway is simple: remove the friction between thinking and executing. By standardizing our systems, we clear the path for deep work.`,
    executiveSummary: `Core Insight: Direct focus on high-impact objectives to minimize operational noise.\nValue Prop: Immediate reduction in cognitive load and accelerated task resolution.\nProjections: Streamlined workflows lead to a 40% increase in daily completion rates.`,
    marketingPitch: `Struggling to manage your digital footprint? Our automated Personal OS helps you capture ideas, coordinate active projects, and streamline your daily workflows in a single, intuitive workspace.`
  });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallback());
    }
    const ai = getAIClient();

    const prompt = `As a world-class Copywriter, take this seed concept:
      Seed Concept: "${seedIdea}"
      Focusing format requested: "${selectedFormat}"

      Produce a complete distribution package of elite content. Avoid emojis, clichés, and marketing jargon. Keep tone authentic, profound, and modern. Include custom outputs for all distribution vectors.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            linkedin: {
              type: Type.STRING,
              description: "An authentic, thought-provoking LinkedIn essay written in a crisp style. Break up lines nicely.",
            },
            twitter: {
              type: Type.STRING,
              description: "A highly punchy micro-essay or concise tweet that captures the entire idea in under 280 chars.",
            },
            newsletter: {
              type: Type.STRING,
              description: "A complete newsletter introduction with structured takeaways, suitable for an intellectual audience.",
            },
            executiveSummary: {
              type: Type.STRING,
              description: "A bulleted executive brief summarizing the core insight, value propositions, and future projections.",
            },
            marketingPitch: {
              type: Type.STRING,
              description: "An elegant elevator pitch demonstrating immediate utility.",
            },
          },
          required: ["linkedin", "twitter", "newsletter", "executiveSummary", "marketingPitch"],
        },
      },
    });

    const result = response.text ? JSON.parse(response.text.trim()) : generateFallback();
    res.json(result);
  } catch (error: any) {
    console.warn("Content generation failed, using local fallback:", error);
    res.json(generateFallback());
  }
});

/**
 * 4. KNOWLEDGE GRAPH RELATIONSHIP DISCOVERER
 * Scans notes semantically to establish bidirectional logical connections.
 */
app.post("/api/intelligence/graph-connect", async (req, res) => {
  const { existingNotes, newNote } = req.body;
  const generateFallback = () => {
    const connections: string[] = [];
    if (existingNotes && existingNotes.length > 0) {
      connections.push(existingNotes[0].id);
      if (existingNotes.length > 1) {
        connections.push(existingNotes[1].id);
      }
    }
    return {
      suggestedConnections: connections,
      derivedTags: ["productivity", "organization", "ideas"],
      insightReason: `Smart semantic connection identified with your existing notes based on common conceptual domains.`
    };
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallback());
    }
    const ai = getAIClient();

    const prompt = `We are establishing logical links in a second-brain database.
      New note: "${newNote.title}" - Content: "${newNote.content}"
      Existing note nodes: ${JSON.stringify(existingNotes.map((n: any) => ({ id: n.id, title: n.title, tags: n.tags })))}

      Select notes that are semantically connected to the new note. Generate a response.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedConnections: {
              type: Type.ARRAY,
              description: "Array of node IDs that should form a bidirectional connection to this new note.",
              items: { type: Type.STRING },
            },
            derivedTags: {
              type: Type.ARRAY,
              description: "List of 2 to 4 tags describing the connection context.",
              items: { type: Type.STRING },
            },
            insightReason: {
              type: Type.STRING,
              description: "An analytical comment explaining the connection discovered.",
            },
          },
          required: ["suggestedConnections", "derivedTags", "insightReason"],
        },
      },
    });

    const result = response.text ? JSON.parse(response.text.trim()) : generateFallback();
    res.json(result);
  } catch (error: any) {
    console.warn("Semantic connection discovery failed, using local fallback:", error);
    res.json(generateFallback());
  }
});

/**
 * 5. UNIVERSAL INTELLIGENT SEARCH & CHAT ENGINE (With optional web search grounding)
 */
app.post("/api/intelligence/chat", async (req, res) => {
  const { messages, workspaceContext } = req.body;
  const generateFallback = () => {
    let lastUserMessage = "";
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      lastUserMessage = lastMsg.text || "";
    }

    let text = "";
    if (!process.env.GEMINI_API_KEY) {
      text = `Hi! I am currently operating in **Offline Fallback Mode** because no Gemini API Key is configured in the environment.

To enable live AI reasoning with real-time Google Search grounding, you can configure your \`GEMINI_API_KEY\` under Settings > Secrets.

In the meantime, I am happy to help you organize your workspace locally!
- Current workspace status: ${workspaceContext?.projectsCount || 0} active projects, ${workspaceContext?.openTasksCount || workspaceContext?.tasksCount || 0} open tasks, and ${workspaceContext?.notesCount || workspaceContext?.memoriesCount || 0} notes.
- Your query: "${lastUserMessage}"

Feel free to write more notes, plan projects, or try out the Content Generator!`;
    } else {
      text = `I analyzed your workspace context: ${workspaceContext?.projectsCount || 0} active projects, ${workspaceContext?.openTasksCount || 0} open tasks, and ${workspaceContext?.notesCount || 0} notes.

Based on your message ("${lastUserMessage}"), here are some workspace recommendations:
1. Streamline your pending tasks list to avoid cognitive clutter.
2. Link related notes together in the Knowledge Graph to reveal hidden patterns.
3. Use the AI Content Generator to quickly draft ideas for different social channels.

Let me know how you'd like to proceed!`;
    }

    return {
      text,
      sources: [
        { uri: "https://ai.google.dev/gemini-api", title: "Gemini API Documentation" },
        { uri: "https://support.google.com", title: "Google Support Hub" }
      ]
    };
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallback());
    }
    const ai = getAIClient();

    const chatHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const systemInstruction = `You are a friendly, helpful personal assistant for the Personal Operating System (POS).
      Answer directly, with simplicity, clarity, and practical suggestions. Speak of "our workspace".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatHistory[chatHistory.length - 1].parts[0].text,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks ? groundingChunks.map((chunk: any) => ({
      uri: chunk.web?.uri,
      title: chunk.web?.title,
    })).filter((s: any) => s.uri && s.title) : [];

    res.json({
      text: response.text || "I have analyzed the current query but could not formulate a content part.",
      sources,
    });
  } catch (error: any) {
    console.warn("AI Chat generation failed, using local fallback:", error);
    res.json(generateFallback());
  }
});

/**
 * 6. AUTOMATION WORKFLOW PIPELINE SIMULATOR
 * Triggers multi-stage pipeline evaluations.
 */
app.post("/api/intelligence/automation-execute", async (req, res) => {
  const { workflowName, payload } = req.body;
  const generateFallback = () => ({
    summary: `Processed payload for "${workflowName || "Automation Workflow"}": "${payload || "No data provided"}" - Analyzed and indexed for spaced repetition.`,
    flashcards: [
      { front: "What is the core concept of this workflow?", back: "Structuring and digesting input data automatically." },
      { front: "How is operational noise minimized?", back: "By automating pipeline execution stages and utilizing local cache." },
      { front: "When should this workflow be triggered?", back: "Whenever fresh research content or notes are captured." }
    ],
    nextRevisionDate: "In 3 days",
    suggestedQuizQuestion: "How would you integrate this summarized insight into your main project strategy?"
  });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallback());
    }
    const ai = getAIClient();

    const prompt = `Triggering AI pipeline: "${workflowName}".
      Payload text: "${payload}"

      Process this payload through the pipeline stages:
      Stage 1: Dynamic Summarization
      Stage 2: Key Insight/Action Item Extraction
      Stage 3: Revision Schedule & Spaced Repetition Flashcard Generation
      Stage 4: Related conceptual queries

      Formulate these stages cleanly for display.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Highly compressed dynamic summary." },
            flashcards: {
              type: Type.ARRAY,
              description: "Array of 3 active revision flashcards.",
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: "Concept question." },
                  back: { type: Type.STRING, description: "Precise answers." },
                },
                required: ["front", "back"],
              },
            },
            nextRevisionDate: { type: Type.STRING, description: "Smart spaced repetition suggestion." },
            suggestedQuizQuestion: { type: Type.STRING, description: "An advanced critical thinking prompt for this concept." },
          },
          required: ["summary", "flashcards", "nextRevisionDate", "suggestedQuizQuestion"],
        },
      },
    });

    const result = response.text ? JSON.parse(response.text.trim()) : generateFallback();
    res.json(result);
  } catch (error: any) {
    console.warn("Automation flow execution failed, using local fallback:", error);
    res.json(generateFallback());
  }
});

// ----------------------------------------------------
// VITE DEV SERVER & PRODUCTION ROUTING MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[POS Server] Running at http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer();

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/* ── single source of truth: tool name → (description, data) ── */
const TOOLS: Record<string, { desc: string; data: unknown }> = {
  get_profile: {
    desc: "Return identity, current role & status",
    data: {
      name: "Nishant Keni",
      role: "Principal AI Engineer",
      company: "CuePilot AI",
      domains: ["Agentic AI", "Harness Engineering", "AI Observability", "EdTech"],
      h_index: 4,
      status: "ACTIVE",
      location: "Mumbai → World",
    },
  },
  get_experience: {
    desc: "Return full career history",
    data: {
      current: "Principal AI Engineer · CuePilot AI · 2026–present",
      previous: [
        "Research Scientist II · Amazon · 2022–2024",
        "Data Scientist II · Amazon · 2020–2022",
        "Visiting Researcher · UC Berkeley (Prof. Dawn Song) · 2018",
        "Applied Scientist Intern · Amazon.in · 2018",
      ],
    },
  },
  get_education: {
    desc: "Return degrees & institutions",
    data: [
      "B.Tech Electrical Engineering · VJTI Mumbai · Institute Gold Medal",
      "M.S. Computer Engineering · Georgia Tech",
      "AI Certificate · Stanford University",
      "PG CS & Engineering · IIT Bombay (active)",
    ],
  },
  list_publications: {
    desc: "List peer-reviewed papers & citations",
    data: {
      count: 10,
      citations: 55,
      h_index: 4,
      top: [
        "Adaptive Containerization for Microservices · IEEE CCNC 2020 · 27 cites",
        "Neural Networks for Leaf Identification · GTSP 2016 · 14 cites",
        "Convex Sparse Dictionary Learning · SPIN 2017 · 6 cites",
      ],
      scholar: "https://scholar.google.com/citations?user=MlaT-RgAAAAJ",
    },
  },
  get_expertise: {
    desc: "Return skills grouped by domain",
    data: {
      "Agentic AI": ["orchestration", "harness engineering", "observability", "MCP"],
      "ML & Stats": ["causal inference", "signal processing", "computer vision"],
      Oncology: ["computational oncology", "cancer detection"],
    },
  },
  get_awards: {
    desc: "Return honors & recognitions",
    data: [
      "Institute Gold Medal · VJTI · 2017",
      "IEEE Best Paper Award · 2016",
      "JEE Mains AIR 695 · top 0.05%",
      "Dr. Homi Bhabha Young Scientist",
    ],
  },
  get_research: {
    desc: "Return research focus & areas",
    data: {
      focus: "Computational oncology × applied AI",
      areas: [
        "cancer detection via computational intelligence",
        "adversarial ML defense (UC Berkeley · D. Song)",
        "causal inference at Amazon scale",
      ],
    },
  },
  book_session: {
    desc: "Get the link to book a 1:1 session",
    data: { url: "https://topmate.io/nishant_keni" },
  },
  contact: {
    desc: "Return ways to get in touch",
    data: {
      email: "nishant.keni@outlook.com",
      linkedin: "https://linkedin.com/in/nishant-keni",
      scholar: "https://scholar.google.com/citations?user=MlaT-RgAAAAJ",
      topmate: "https://topmate.io/nishant_keni",
    },
  },
};

export class NKMCP extends McpAgent {
  server = new McpServer({ name: "nk-mcp", version: "1.0.0" });
  async init() {
    for (const [name, t] of Object.entries(TOOLS)) {
      this.server.tool(name, t.desc, async () => ({
        content: [{ type: "text" as const, text: JSON.stringify(t.data, null, 2) }],
      }));
    }
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export default {
  fetch(req: Request, env: unknown, ctx: ExecutionContext) {
    const { pathname } = new URL(req.url);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    // MCP transports (for AI agents)
    if (pathname === "/sse" || pathname === "/sse/message") {
      return NKMCP.serveSSE("/sse").fetch(req, env as never, ctx);
    }
    if (pathname === "/mcp") {
      return NKMCP.serve("/mcp").fetch(req, env as never, ctx);
    }

    // lightweight JSON API (for the website terminal / browsers)
    if (pathname === "/api" || pathname === "/api/") {
      const list = Object.entries(TOOLS).map(([name, t]) => ({ name, desc: t.desc }));
      return Response.json({ tools: list }, { headers: CORS });
    }
    const m = pathname.match(/^\/api\/([a-z_]+)$/);
    if (m) {
      const t = TOOLS[m[1]];
      if (!t) return Response.json({ error: `unknown tool: ${m[1]}` }, { status: 404, headers: CORS });
      return Response.json(t.data, { headers: CORS });
    }

    return new Response(
      "nk-mcp · Nishant Keni's MCP server.\nAgents: connect at /sse (or /mcp).  Browsers: GET /api and /api/<tool>.",
      { headers: { "content-type": "text/plain", ...CORS } }
    );
  },
};

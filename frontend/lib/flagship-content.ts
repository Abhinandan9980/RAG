export interface CapabilityStoryItem {
  id: "knowledge" | "aurasql" | "analysis" | "career";
  name: string;
  statement: string;
  proof: readonly string[];
}

export const CAPABILITY_ROUTES: Record<CapabilityStoryItem["id"], string> = {
  knowledge: "/chat",
  aurasql: "/aurasql",
  analysis: "/analysis",
  career: "/career",
};

export const CAPABILITIES: readonly CapabilityStoryItem[] = [
  {
    id: "knowledge",
    name: "Keystone Chat",
    statement: "Grounded answers with evidence kept in view.",
    proof: ["Hybrid retrieval", "Source citations", "Confidence scoring"],
  },
  {
    id: "aurasql",
    name: "Keystone SQL",
    statement: "Natural-language questions become reviewable, executable SQL.",
    proof: ["Schema context", "SQL validation", "Exportable results"],
  },
  {
    id: "analysis",
    name: "Keystone Analyst",
    statement: "Multi-agent analysis becomes an executive narrative, not a log wall.",
    proof: ["Statistical methods", "Visual reports", "Persistent jobs"],
  },
  {
    id: "career",
    name: "Keystone Career",
    statement: "Resume evidence turns into targeted, explainable improvements.",
    proof: ["JD alignment", "ATS scoring", "PDF generation"],
  },
] as const;

export const PROOF_POINTS = [
  ["Retrieval", "BM25 + vector fusion with reranking"],
  ["Reasoning", "Fast and deep document navigation modes"],
  ["Data", "Schema-aware SQL generation and execution"],
  ["Operations", "Observable long-running analysis workflows"],
] as const;

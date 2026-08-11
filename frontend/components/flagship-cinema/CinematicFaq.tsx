"use client";

import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Is the source available?",
    answer:
      "Yes — Keystone is a public project on GitHub, solely designed and built by Shivam Sourav.",
  },
  {
    question: "What actually powers retrieval?",
    answer:
      "A hybrid core shared by all four studios: BM25 keyword search fused with vector search, reranked, plus a document-tree \"Think mode\" for deeper reasoning over long documents.",
  },
  {
    question: "Can this run locally?",
    answer:
      "Yes — the repository ships a documented quick start for a FastAPI backend, PostgreSQL with pgvector, and a Next.js frontend, with a Groq API key and either a local or remote embedding service.",
  },
  {
    question: "Why does every answer show a confidence score?",
    answer:
      "Because evidence and citations are treated as first-class, always-visible UI in every studio — not a hidden implementation detail you have to dig for.",
  },
  {
    question: "Which studio should I try first?",
    answer:
      "Keystone Chat for grounded question-answering over your own documents — SQL, Analyst, and Career all sit on the same retrieval core underneath.",
  },
] as const;

export function CinematicFaq() {
  return (
    <section id="faq" className="border-t border-border px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-2xl"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Questions, answered plainly.
        </h2>
        <Accordion type="single" collapsible className="mt-10">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question} className="[&_svg]:text-[hsl(var(--signal))]">
              <AccordionTrigger className="hover:no-underline">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}

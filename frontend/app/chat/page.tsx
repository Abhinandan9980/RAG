"use client";

import { useEffect, useRef, useState } from "react";
import { History, MessageSquarePlus, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";

import AuthPage from "@/app/auth/page";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Sidebar } from "@/components/layout/Sidebar";
import { CanvasHeader } from "@/components/shell/CanvasHeader";
import { ContextRibbon } from "@/components/shell/ContextRibbon";
import { FocusCanvas } from "@/components/shell/FocusCanvas";
import { Inspector } from "@/components/shell/Inspector";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionHeight, setSectionHeight] = useState<number | null>(null);
  const {
    sessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    hydrateConversation,
    latestTokenUsage,
  } = useChat();
  const { toast } = useToast();

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (searchParams.get("panel") === "history") setHistoryOpen(true);
  }, [searchParams]);

  // The calc()-based height budget this used to rely on fell out of sync with the actual
  // rendered header/ribbon/mobile-nav chrome (verified: up to ~275px of real overflow on
  // mobile, enough that the composer rendered partly behind the bottom tab bar). Measuring
  // the real available space is robust to that chrome changing size in the future.
  useEffect(() => {
    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const mobileNav = document.querySelector('nav[aria-label="Mobile applications"]');
      const mobileNavHeight = mobileNav ? mobileNav.getBoundingClientRect().height : 0;
      setSectionHeight(Math.max(240, window.innerHeight - top - mobileNavHeight));
    };

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [isMounted]);

  useEffect(() => {
    const loadActiveConversation = async () => {
      if (!user) return;
      try {
        const bootstrap = await apiClient.getChatBootstrap();
        if (bootstrap.active_session_id) {
          hydrateConversation(bootstrap.active_session_id, bootstrap.messages);
        }
      } catch (bootstrapError) {
        console.error("Failed to load active Keystone Chat conversation:", bootstrapError);
      }
    };

    loadActiveConversation();
  }, [hydrateConversation, user]);

  const handleNewChat = async () => {
    await clearChat();
    setHistoryOpen(false);
  };

  const handleLoadSession = async (sessionIdToLoad: string) => {
    try {
      const bootstrap = await apiClient.getChatBootstrap(sessionIdToLoad);
      if (bootstrap.active_session_id) {
        hydrateConversation(bootstrap.active_session_id, bootstrap.messages);
      }
      setHistoryOpen(false);
    } catch (loadError) {
      toast({
        title: "Failed to load session",
        description: loadError instanceof Error ? loadError.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    return (
      <FocusCanvas ariaLabel="Loading Keystone Chat" className="min-h-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="mt-4 h-10 w-full max-w-md" />
        <Skeleton className="mt-4 h-[calc(100svh-15.5rem)] w-full md:h-[calc(100svh-13rem)]" />
      </FocusCanvas>
    );
  }
  if (!isAuthenticated) return <AuthPage />;

  return (
    <FocusCanvas ariaLabel="Keystone Chat conversation" className="h-[calc(100svh-2rem)] min-h-0 overflow-hidden">
      <CanvasHeader
        actions={
          <>
            <Button onClick={() => setHistoryOpen(true)} size="sm" variant="outline">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button onClick={handleNewChat} size="sm">
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New chat
            </Button>
          </>
        }
        description="Ask across your evidence. Sources and confidence stay attached to every answer."
        status={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--chart-4))]" />
            Ready
          </span>
        }
        title="Conversation"
      />

      <ContextRibbon label="Conversation context">
        <span className="inline-flex h-7 items-center rounded-md border border-border/70 bg-workspace-inset px-2.5 text-xs text-muted-foreground">
          {messages.length} message{messages.length === 1 ? "" : "s"}
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-workspace-inset px-2.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {latestTokenUsage
            ? `${Math.round(latestTokenUsage.context_utilization_pct)}% context used`
            : "Context available"}
        </span>
      </ContextRibbon>

      <section
        ref={sectionRef}
        aria-label="Active conversation"
        className="mt-4 h-[calc(100svh-15.5rem)] min-h-0 overflow-hidden rounded-lg border border-border/70 bg-workspace-raised shadow-[0_28px_80px_-55px_hsl(var(--foreground)/0.4)] md:h-[calc(100svh-13rem)]"
        style={sectionHeight !== null ? { height: sectionHeight } : undefined}
      >
        <ChatInterface
          error={error}
          isLoading={isLoading}
          messages={messages}
          sendMessage={sendMessage}
          sessionId={sessionId}
          tokenUsage={latestTokenUsage}
        />
      </section>

      <Inspector onOpenChange={setHistoryOpen} open={historyOpen} title="Chat history">
        <Sidebar
          currentSessionId={sessionId}
          onLoadSession={handleLoadSession}
          onNewChat={handleNewChat}
        />
      </Inspector>
    </FocusCanvas>
  );
}

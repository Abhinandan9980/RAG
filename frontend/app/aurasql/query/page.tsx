'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageInput } from '@/components/chat/MessageInput';
import { AuraSqlResultViewport } from '@/components/aurasql/AuraSqlResultViewport';
import { ContextNameDialog } from '@/components/aurasql/ContextNameDialog';
import { CreateConnectionDialog } from '@/components/aurasql/CreateConnectionDialog';
import { ContextRibbon } from '@/components/shell/ContextRibbon';
import { FocusCanvas } from '@/components/shell/FocusCanvas';
import { Inspector } from '@/components/shell/Inspector';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AuraSqlConnection, AuraSqlContext, AuraSqlExecuteResponse, AuraSqlSession } from '@/lib/types';
import { DEFAULT_AURASQL_SETTINGS, persistLastUsed, readLastUsed, readSettings } from '@/lib/aurasql/preferences';
import { useAuthStore } from '@/lib/store';
import AuthPage from '@/app/auth/page';
import { useToast } from '@/hooks/useToast';
import { format as formatSqlWithLib } from 'sql-formatter';
import type { SqlLanguage } from 'sql-formatter';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Database,
  Download,
  Loader2,
  MessageSquarePlus,
  PlayCircle,
  RefreshCw,
  Table,
  Wand2,
} from 'lucide-react';

type AuraSqlChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  editedSql?: string;
  explanation?: string;
  sourceTables?: string[];
  confidenceScore?: number | null;
  confidenceLevel?: 'high' | 'medium' | 'low' | null;
  execution?: AuraSqlExecuteResponse | null;
  showRows?: number;
  showResults?: boolean;
  originalSql?: string;
  resultFilter?: string;
  isEditingSql?: boolean;
  validationErrors?: string[];
  executionError?: string | null;
};

const makeMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const FORMAT_LANGUAGE_BY_DIALECT: Record<string, SqlLanguage> = {
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mysql: 'mysql',
  oracle: 'plsql',
  bigquery: 'bigquery',
  snowflake: 'snowflake',
  sqlite: 'sqlite',
  tsql: 'tsql',
};

const OUTPUT_DIALECT_OPTIONS = [
  { value: 'connection', label: 'Connection DB (default)' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'tsql', label: 'T-SQL' },
];

const formatSql = (sql: string, dialect: string) => {
  try {
    const language: SqlLanguage = FORMAT_LANGUAGE_BY_DIALECT[dialect] || 'postgresql';
    return formatSqlWithLib(sql, { language });
  } catch {
    return sql;
  }
};

function AuraSqlQueryPageContent() {
  const params = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { toast, confirm } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [connections, setConnections] = useState<AuraSqlConnection[]>([]);
  const [contexts, setContexts] = useState<AuraSqlContext[]>([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [activeContextId, setActiveContextId] = useState('');
  const [tableList, setTableList] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [tableFilter, setTableFilter] = useState('');
  const [showTablesMenu, setShowTablesMenu] = useState(false);
  const [outputDialect, setOutputDialect] = useState('connection');
  const [sessionContextId, setSessionContextId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<AuraSqlChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recsOpen, setRecsOpen] = useState(false);
  const [recsByContext, setRecsByContext] = useState<Record<string, string[]>>({});
  const [historyBanner, setHistoryBanner] = useState<string | null>(null);
  const [autoScrollEnabled] = useState(true);
  const [createConnectionOpen, setCreateConnectionOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_AURASQL_SETTINGS);
  const [viewingResultsId, setViewingResultsId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionHeight, setSectionHeight] = useState<number | null>(null);
  const toastRef = useRef(toast);

  const [loading, setLoading] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [savingContext, setSavingContext] = useState(false);
  const [contextNameOpen, setContextNameOpen] = useState(false);
  const [contextSaveError, setContextSaveError] = useState<string | null>(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [executingMessageId, setExecutingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const reportError = useCallback((message: string) => {
    setError(message);
    toastRef.current({
      title: 'Action failed',
      description: message,
      variant: 'destructive',
    });
  }, []);

  useEffect(() => {
    setIsMounted(true);
    setSettings(readSettings());
  }, []);

  // The calc()-based height budget this used to rely on fell out of sync with the actual
  // rendered header/ribbon/mobile-nav chrome (same issue fixed in app/chat/page.tsx), enough
  // that the composer rendered partly offscreen. Measuring the real available space is robust
  // to that chrome changing size in the future.
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
    window.addEventListener('resize', measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, [isMounted]);

  const connectionContexts = useMemo(
    () => contexts.filter((ctx) => ctx.connection_id === selectedConnection),
    [contexts, selectedConnection]
  );

  const selectedContextRecord = useMemo(
    () => connectionContexts.find((ctx) => ctx.id === selectedContext) || null,
    [connectionContexts, selectedContext]
  );
  const sqlDisplayDialect = useMemo(() => {
    if (outputDialect !== 'connection') return outputDialect;
    return connections.find((conn) => conn.id === selectedConnection)?.db_type || 'postgresql';
  }, [connections, outputDialect, selectedConnection]);

  const filteredTables = useMemo(() => {
    const filter = tableFilter.trim().toLowerCase();
    if (!filter) return tableList;
    return tableList.filter((table) => table.toLowerCase().includes(filter));
  }, [tableFilter, tableList]);

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedContextRecord) return selectedTables.size > 0;
    const current = Array.from(selectedTables).sort();
    const baseline = [...selectedContextRecord.table_names].sort();
    if (current.length !== baseline.length) return true;
    return current.some((value, index) => value !== baseline[index]);
  }, [selectedContextRecord, selectedTables]);
  useEffect(() => {
    if (sessionContextId) {
      setActiveContextId(sessionContextId);
      return;
    }
    setActiveContextId(selectedContext);
  }, [selectedContext, sessionContextId]);

  useEffect(() => {
    if (activeContextId) {
      setHistoryBanner(null);
    }
  }, [activeContextId]);

  useEffect(() => {
    if (selectedConnection && selectedContext) {
      persistLastUsed({ connectionId: selectedConnection, contextId: selectedContext });
    }
  }, [selectedConnection, selectedContext]);

  useEffect(() => {
    if (autoScrollEnabled) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages, autoScrollEnabled]);

  useEffect(() => {
    if (!selectedContextRecord) {
      setSelectedTables(new Set());
      return;
    }
    setSelectedTables(new Set(selectedContextRecord.table_names));
  }, [selectedContextRecord]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [connData, ctxData, sessionData] = await Promise.all([
          apiClient.listAuraSqlConnections(),
          apiClient.listAuraSqlContexts(),
          apiClient.listAuraSqlSessions(),
        ]);
        setConnections(connData);
        setContexts(ctxData);

        const connectionParam = params.get('connection');
        const contextParam = params.get('context');
        const sessionParam = params.get('session');
        const lastUsed = readLastUsed();

        if (contextParam) {
          const context = ctxData.find((ctx) => ctx.id === contextParam);
          if (context) {
            setSelectedContext(context.id);
            setSelectedConnection(context.connection_id);
          }
        } else if (connectionParam) {
          setSelectedConnection(connectionParam);
        } else if (
          lastUsed &&
          connData.some((conn) => conn.id === lastUsed.connectionId) &&
          ctxData.some((ctx) => ctx.id === lastUsed.contextId)
        ) {
          setSelectedConnection(lastUsed.connectionId);
          setSelectedContext(lastUsed.contextId);
        } else if (connData.length > 0) {
          setSelectedConnection(connData[0].id);
        }

        if (sessionParam) {
          const session = sessionData.find((item) => item.id === sessionParam);
          if (session) {
            await loadSessionHistory(session, ctxData);
          }
        }
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load Keystone SQL data');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleStartNewChat = () => {
    setSessionId(null);
    setChatMessages([]);
    setHistoryBanner(null);
    setRecommendations([]);
    setRecsOpen(false);
  };

  const loadSessionHistory = async (session: AuraSqlSession, ctxData = contexts) => {
    setSessionId(session.id);
    if (session.context_id) {
      let context = ctxData.find((ctx) => ctx.id === session.context_id) || null;
      if (!context) {
        try {
          context = await apiClient.getAuraSqlContext(session.context_id);
          setContexts((prev) => [context!, ...prev]);
        } catch {
          context = null;
        }
      }
      if (context) {
        setSelectedConnection(context.connection_id);
        setSelectedContext(context.id);
        setSessionContextId(null);
        setHistoryBanner(null);
      } else {
        setHistoryBanner('Select a context to continue this chat.');
      }
    } else {
      setHistoryBanner('Select a context to continue this chat.');
    }

    try {
      const logs = await apiClient.getAuraSqlSessionHistory(session.id);
      const nextMessages: AuraSqlChatMessage[] = [];
      logs.forEach((log) => {
        if (log.natural_language_query) {
          nextMessages.push({
            id: makeMessageId(),
            role: 'user',
            content: log.natural_language_query,
          });
        }
        if (log.generated_sql && log.status === 'generated') {
          nextMessages.push({
            id: makeMessageId(),
            role: 'assistant',
            content: 'SQL generated.',
            sql: log.generated_sql,
            editedSql: log.generated_sql,
            originalSql: log.generated_sql,
            sourceTables: log.source_tables ?? [],
            confidenceScore: log.confidence_score ?? null,
            confidenceLevel: log.confidence_level ?? null,
            execution: null,
            showRows: settings.resultLimit,
            showResults: false,
          });
        }
      });
      setChatMessages(nextMessages);
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to load chat history');
    }
  };

  const handleFetchTables = useCallback(async () => {
    if (!selectedConnection) return;
    setLoadingTables(true);
    setError(null);
    try {
      const tables = await apiClient.listAuraSqlTables(selectedConnection);
      setTableList(tables);
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to load tables');
    } finally {
      setLoadingTables(false);
    }
  }, [selectedConnection, reportError]);

  useEffect(() => {
    if (!selectedConnection) {
      setTableList([]);
      return;
    }
    handleFetchTables();
  }, [selectedConnection, handleFetchTables]);

  const handleToggleTable = (table: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) {
        next.delete(table);
      } else {
        next.add(table);
      }
      return next;
    });
  };

  const handleConnectionCreated = (connection: AuraSqlConnection) => {
    setConnections((prev) => [connection, ...prev]);
    setSelectedConnection(connection.id);
    setCreateConnectionOpen(false);
    setShowTablesMenu(true);
  };

  const handleUseSessionContext = async () => {
    if (!selectedConnection || selectedTables.size === 0) return;
    setSavingContext(true);
    setError(null);
    try {
      const payload = {
        connection_id: selectedConnection,
        name: 'Session context',
        table_names: Array.from(selectedTables),
        is_temporary: true,
      };
      const context = await apiClient.createAuraSqlContext(payload);
      setSessionContextId(context.id);
      setActiveContextId(context.id);
      setHistoryBanner(null);
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to apply session context');
    } finally {
      setSavingContext(false);
    }
  };

  const handleSaveContext = async (name: string) => {
    if (!selectedConnection || selectedTables.size === 0) return;
    setSavingContext(true);
    setContextSaveError(null);
    setError(null);
    try {
      const context = await apiClient.createAuraSqlContext({
        connection_id: selectedConnection,
        name,
        table_names: Array.from(selectedTables),
      });
      setContexts((prev) => [context, ...prev]);
      setSelectedContext(context.id);
      setSessionContextId(null);
      setContextNameOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save context';
      setContextSaveError(message);
      reportError(message);
    } finally {
      setSavingContext(false);
    }
  };

  const handleUpdateContext = async () => {
    if (!selectedContextRecord) return;
    setSavingContext(true);
    setError(null);
    try {
      const context = await apiClient.updateAuraSqlContext(selectedContextRecord.id, {
        table_names: Array.from(selectedTables),
      });
      setContexts((prev) => prev.map((item) => (item.id === context.id ? context : item)));
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to update context');
    } finally {
      setSavingContext(false);
    }
  };

  const runRecommendationsFetch = async (contextId: string) => {
    setLoadingContext(true);
    setError(null);
    try {
      const recs = await apiClient.getAuraSqlRecommendations(contextId);
      setRecommendations(recs);
      setRecsByContext((prev) => ({ ...prev, [contextId]: recs }));
      setRecsOpen(true);
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoadingContext(false);
    }
  };

  const handleRecommendations = async () => {
    if (!activeContextId) return;
    const currentRecs = recsByContext[activeContextId];
    if (currentRecs && currentRecs.length > 0) {
      setRecommendations(currentRecs);
      setRecsOpen(true);
      return;
    }

    await runRecommendationsFetch(activeContextId);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeContextId) {
      reportError('Select a context to generate SQL.');
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: AuraSqlChatMessage = {
      id: makeMessageId(),
      role: 'user',
      content: trimmed,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoadingGenerate(true);
    setError(null);

    try {
      const response = await apiClient.generateAuraSqlQueryWithSession(
        activeContextId,
        trimmed,
        sessionId || undefined,
        outputDialect === 'connection' ? undefined : outputDialect
      );

      if (!response.sql) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: makeMessageId(),
            role: 'assistant',
            content: response.explanation || 'Could not generate SQL with the selected context.',
            confidenceScore: response.confidence_score ?? 0,
            confidenceLevel: response.confidence_level ?? 'low',
            validationErrors: response.validation_errors ?? [],
          },
        ]);
        return;
      }

      const assistantMessage: AuraSqlChatMessage = {
        id: makeMessageId(),
        role: 'assistant',
        content: 'SQL generated.',
        sql: response.sql,
        editedSql: response.sql,
        originalSql: response.sql,
        explanation: response.explanation,
        sourceTables: response.source_tables,
        confidenceScore: response.confidence_score ?? null,
        confidenceLevel: response.confidence_level ?? null,
        execution: null,
        showRows: settings.resultLimit,
        showResults: false,
        validationErrors: response.validation_errors ?? [],
      };
      setChatMessages((prev) => [...prev, assistantMessage]);

      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to generate SQL');
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleExecuteMessage = async (messageId: string) => {
    if (!selectedConnection) return;
    const message = chatMessages.find((item) => item.id === messageId);
    const sql = message?.editedSql || message?.sql;
    if (!sql) return;

    if (settings.confirmBeforeExecution) {
      const confirmed = await confirm({
        title: 'Run this query?',
        description: 'This executes the reviewed SQL against the connected database.',
        confirmLabel: 'Run query',
        cancelLabel: 'Cancel',
      });
      if (!confirmed) return;
    }

    setExecutingMessageId(messageId);
    setError(null);
    try {
      const result = await apiClient.executeAuraSqlWithSession(
        selectedConnection,
        sql,
        sessionId || undefined
      );
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, execution: result, executionError: null, showRows: msg.showRows ?? settings.resultLimit, showResults: true }
            : msg
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute SQL';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, executionError: errorMessage }
            : msg
        )
      );
      reportError(err instanceof Error ? err.message : 'Failed to execute SQL');
    } finally {
      setExecutingMessageId(null);
    }
  };

  const handleFormatSql = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, editedSql: formatSql(msg.editedSql ?? msg.sql ?? '', sqlDisplayDialect) }
          : msg
      )
    );
  };

  const getFilteredRows = (message: AuraSqlChatMessage) => {
    const execution = message.execution;
    if (!execution) return [];
    const needle = (message.resultFilter ?? '').trim().toLowerCase();
    if (!needle) return execution.rows;
    return execution.rows.filter((row) =>
      execution.columns.some((column) =>
        String(row[column] ?? '').toLowerCase().includes(needle)
      )
    );
  };

  const handleCopySql = async (sql?: string) => {
    if (!sql) {
      reportError('No SQL available to copy.');
      return;
    }
    try {
      await navigator.clipboard.writeText(sql);
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to copy SQL');
    }
  };

  const handleDownloadSql = (sql?: string) => {
    if (!sql) {
      reportError('No SQL available to download.');
      return;
    }
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'query.sql';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = (messageId: string) => {
    const message = chatMessages.find((item) => item.id === messageId);
    const execution = message?.execution;
    if (!execution || !message) return;
    const rows = getFilteredRows(message);
    const columns = execution.columns;
    const escapeValue = (value: unknown) => {
      const stringValue = String(value ?? '');
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    const lines = [
      columns.map(escapeValue).join(','),
      ...rows.map((row) => columns.map((column) => escapeValue(row[column])).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'results.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const getMessageChecks = (message: AuraSqlChatMessage) => {
    const joinedErrors = (message.validationErrors ?? []).join(' ').toLowerCase();
    const hasSyntaxError = joinedErrors.includes('syntax') || joinedErrors.includes('parse');
    const hasSchemaError =
      joinedErrors.includes('table') ||
      joinedErrors.includes('column') ||
      joinedErrors.includes('schema');

    const syntax: 'pass' | 'fail' | 'pending' = hasSyntaxError
      ? 'fail'
      : message.sql
      ? 'pass'
      : 'pending';
    const verification: 'pass' | 'fail' | 'pending' = hasSchemaError
      ? 'fail'
      : message.sourceTables?.length
      ? 'pass'
      : message.sql
      ? 'pass'
      : 'pending';
    const typeCheck: 'pass' | 'fail' | 'pending' = message.sql
      ? 'pass'
      : (message.validationErrors?.length ?? 0) > 0
      ? 'fail'
      : 'pending';
    const executionStatus: 'pass' | 'fail' | 'pending' = message.execution
      ? 'pass'
      : message.executionError
      ? 'fail'
      : 'pending';
    const optimization: 'pass' | 'warn' | 'fail' | 'pending' =
      message.confidenceLevel === 'high'
        ? 'pass'
        : message.confidenceLevel === 'medium'
        ? 'warn'
        : message.confidenceLevel === 'low'
        ? 'fail'
        : 'pending';

    return [
      { label: 'Verification', status: verification },
      { label: 'Types', status: typeCheck },
      { label: 'Syntax', status: syntax },
      { label: 'Execution', status: executionStatus },
      { label: 'Optimized', status: optimization },
    ];
  };

  const getCheckBadgeClass = (status: 'pass' | 'warn' | 'fail' | 'pending') => {
    if (status === 'pass') return 'bg-[hsl(var(--chart-4)/0.15)] text-[hsl(var(--chart-4))]';
    if (status === 'warn') return 'bg-[hsl(var(--copper)/0.15)] text-[hsl(var(--copper))]';
    if (status === 'fail') return 'bg-destructive/15 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  if (!isMounted) return null;
  if (!isAuthenticated) return <AuthPage />;

  const activeConnectionRecord = connections.find((connection) => connection.id === selectedConnection);
  const detailsOpen = recsOpen || showTablesMenu;
  const viewingResultsMessage = viewingResultsId
    ? chatMessages.find((message) => message.id === viewingResultsId) ?? null
    : null;

  return (
    <FocusCanvas ariaLabel="Keystone SQL query workspace" className="h-[calc(100svh-2rem)] min-h-0 overflow-hidden">
      <ContextRibbon label="Query context">
        <span
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2 text-xs font-medium",
            activeConnectionRecord
              ? "border-[hsl(var(--chart-4)/0.3)] bg-[hsl(var(--chart-4)/0.1)] text-[hsl(var(--chart-4))]"
              : "border-border/70 bg-muted text-muted-foreground",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", activeConnectionRecord ? "bg-[hsl(var(--chart-4))]" : "bg-muted-foreground")} />
          {activeConnectionRecord ? 'Connected' : 'No connection'}
        </span>
        <Select value={selectedConnection} onValueChange={setSelectedConnection}>
          <SelectTrigger aria-label="Connection" className="h-8 w-auto max-w-56 gap-2 border-border/70 bg-workspace-inset px-2 text-xs">
            <SelectValue placeholder="No connection" />
          </SelectTrigger>
          <SelectContent>
            {connections.map((connection) => (
              <SelectItem key={connection.id} value={connection.id}>{connection.name} · {connection.database}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedContext} onValueChange={setSelectedContext}>
          <SelectTrigger aria-label="Context" className="h-8 w-auto max-w-56 gap-2 border-border/70 bg-workspace-inset px-2 text-xs">
            <SelectValue placeholder="Select context" />
          </SelectTrigger>
          <SelectContent>
            {connectionContexts.map((context) => (
              <SelectItem key={context.id} value={context.id}>{context.name} · {context.table_names.length} tables</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={outputDialect} onValueChange={setOutputDialect}>
          <SelectTrigger aria-label="SQL dialect" className="h-8 w-auto gap-2 border-border/70 bg-workspace-inset px-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OUTPUT_DIALECT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8" onClick={() => setShowTablesMenu(true)}>
          <Table className="mr-2 h-3.5 w-3.5" />
          Schema
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Start new query" title="Start new query" onClick={handleStartNewChat}>
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </ContextRibbon>

      <section
        ref={sectionRef}
        aria-label="Query conversation"
        className="mt-4 flex h-[calc(100svh-9rem)] min-h-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-workspace-raised shadow-[0_28px_80px_-55px_hsl(var(--foreground)/0.4)] md:h-[calc(100svh-7rem)]"
        style={sectionHeight !== null ? { height: sectionHeight } : undefined}
      >
        <div data-scroll-owner="query-thread" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="mx-auto w-full max-w-2xl space-y-4" aria-label="Preparing connections and context" role="status">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {connections.length === 0 && !loading ? (
            <div className="grid flex-1 place-items-center px-5 text-center">
              <div className="max-w-sm">
                <Database className="mx-auto h-7 w-7 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">Connect a database first</h2>
                <p className="mt-2 text-sm text-muted-foreground">Keystone SQL keeps credentials in your existing connection profile and uses its schema to ground every query.</p>
                <Button className="mt-5" onClick={() => setCreateConnectionOpen(true)}>Create connection</Button>
              </div>
            </div>
          ) : chatMessages.length === 0 && !loading ? (
            <div className="grid flex-1 place-items-center px-5 text-center text-sm text-muted-foreground">
              Ask a question about the selected data to get started.
            </div>
          ) : (
            chatMessages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-lg rounded-lg bg-foreground px-3.5 py-2 text-sm leading-6 text-background">{message.content}</p>
                </div>
              ) : (
                <div key={message.id} className="flex justify-start">
                  <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-border/70 bg-background">
                    {message.sql ? (
                      <>
                        <div className="flex items-center justify-end gap-1 border-b border-border/60 px-2 py-1.5">
                          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Format SQL" title="Format SQL" onClick={() => handleFormatSql(message.id)}><Wand2 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Copy SQL" title="Copy SQL" onClick={() => handleCopySql(message.editedSql || message.sql)}><Copy className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Download SQL" title="Download SQL" onClick={() => handleDownloadSql(message.editedSql || message.sql)}><Download className="h-3.5 w-3.5" /></Button>
                        </div>
                        <Textarea
                          aria-label="Generated SQL"
                          value={message.editedSql || message.sql}
                          onChange={(event) => setChatMessages((previous) => previous.map((item) => item.id === message.id ? { ...item, editedSql: event.target.value } : item))}
                          className="min-h-20 max-h-48 resize-none overflow-y-auto rounded-none border-0 bg-transparent p-3 font-mono text-xs leading-6 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
                          <div className="flex flex-wrap gap-1.5">
                            {getMessageChecks(message).map((check) => <Badge key={check.label} className={getCheckBadgeClass(check.status)} variant="secondary">{check.label}</Badge>)}
                          </div>
                          {message.execution ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--chart-4))]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {message.execution.rows.length} rows
                              </span>
                              <Button size="sm" variant="outline" onClick={() => setViewingResultsId(message.id)}>View results</Button>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => handleExecuteMessage(message.id)} disabled={executingMessageId === message.id}>
                              {executingMessageId === message.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="mr-2 h-3.5 w-3.5" />}
                              Run query
                            </Button>
                          )}
                        </div>
                        {message.executionError ? <p className="border-t border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">{message.executionError}</p> : null}
                      </>
                    ) : (
                      <p className="px-3.5 py-2.5 text-sm leading-6 text-foreground">{message.content}</p>
                    )}
                  </div>
                </div>
              ),
            )
          )}

          {!loading && loadingGenerate ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Drafting and validating SQL
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div data-fixed-composer="aurasql" data-testid="aurasql-composer" className="shrink-0 border-t border-border/60 bg-workspace-raised p-3 sm:p-4">
          <MessageInput
            onSend={handleSendMessage}
            disabled={loadingGenerate || !activeContextId || (hasUnsavedChanges && !sessionContextId) || connections.length === 0}
            value={inputValue}
            onChange={setInputValue}
            placeholder={activeContextId ? 'Ask a question about the selected data…' : 'Select a schema context to begin'}
          />
          {historyBanner ? <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">{historyBanner}</p> : null}
          {!activeContextId && connections.length > 0 ? <p className="mt-2 text-xs text-muted-foreground">Choose a saved context above, or open Schema to select tables.</p> : null}
          {activeContextId && hasUnsavedChanges && !sessionContextId ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
              You changed the table selection in Schema. Use <span className="font-medium">Use for session</span> or <span className="font-medium">Save context</span> before asking.
            </p>
          ) : null}
        </div>
      </section>

      <Dialog open={Boolean(viewingResultsMessage?.execution)} onOpenChange={(open) => { if (!open) setViewingResultsId(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Query results</DialogTitle>
          </DialogHeader>
          {viewingResultsMessage?.execution ? (
            <AuraSqlResultViewport
              execution={viewingResultsMessage.execution}
              onExport={() => handleExportCsv(viewingResultsMessage.id)}
              defaultMode={settings.openResultsAsTable ? 'table' : 'graph'}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Inspector
        open={detailsOpen}
        onOpenChange={(open) => { if (!open) { setRecsOpen(false); setShowTablesMenu(false); } }}
        title="Schema and query guidance"
      >
        <div className="space-y-7">
          <section>
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="text-sm font-semibold">Question ideas</h3><p className="mt-1 text-xs text-muted-foreground">Grounded in the active schema context.</p></div>
              <Button size="sm" variant="outline" onClick={handleRecommendations} disabled={!activeContextId || loadingContext}>{loadingContext ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}</Button>
            </div>
            <div className="mt-3 grid gap-2">
              {recommendations.length === 0 ? <p className="border-y border-border/50 py-4 text-xs text-muted-foreground">Generate focused starting questions when you need them.</p> : recommendations.map((recommendation) => <button key={recommendation} type="button" className="border-b border-border/50 py-3 text-left text-sm leading-5 transition-colors hover:text-[hsl(var(--chart-2))]" onClick={() => { setInputValue(recommendation); setRecsOpen(false); setShowTablesMenu(false); }}>{recommendation}</button>)}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Tables in context</h3><p className="mt-1 text-xs text-muted-foreground">{selectedTables.size} of {tableList.length} selected</p></div><Button size="icon" variant="ghost" aria-label="Refresh tables" onClick={handleFetchTables}><RefreshCw className={`h-4 w-4 ${loadingTables ? 'animate-spin' : ''}`} /></Button></div>
            <input value={tableFilter} onChange={(event) => setTableFilter(event.target.value)} placeholder="Filter tables" className="mt-3 h-10 w-full rounded-md border border-border/70 bg-background px-3 text-sm" />
            <div className="mt-3 max-h-72 divide-y divide-border/50 overflow-y-auto border-y border-border/50">
              {filteredTables.map((table) => <label key={table} className="flex cursor-pointer items-center gap-3 py-3 text-sm"><Checkbox checked={selectedTables.has(table)} onCheckedChange={() => handleToggleTable(table)} /><span className="min-w-0 flex-1 truncate font-mono text-xs">{table}</span></label>)}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleUseSessionContext} disabled={selectedTables.size === 0 || savingContext}>Use for session</Button>
              <Button size="sm" onClick={selectedContextRecord ? handleUpdateContext : () => setContextNameOpen(true)} disabled={selectedTables.size === 0 || savingContext}>{selectedContextRecord ? 'Update context' : 'Save context'}</Button>
            </div>
          </section>
        </div>
      </Inspector>
      <CreateConnectionDialog
        open={createConnectionOpen}
        onOpenChange={setCreateConnectionOpen}
        onCreated={handleConnectionCreated}
      />
      <ContextNameDialog
        connectionLabel={activeConnectionRecord?.name ?? ''}
        error={contextSaveError}
        onCancel={() => { if (!savingContext) { setContextNameOpen(false); setContextSaveError(null); } }}
        onSave={handleSaveContext}
        open={contextNameOpen}
        saving={savingContext}
        selectedTables={Array.from(selectedTables)}
      />
    </FocusCanvas>
  );


}

export default function AuraSqlQueryPage() {
  return (
    <Suspense fallback={null}>
      <AuraSqlQueryPageContent />
    </Suspense>
  );
}

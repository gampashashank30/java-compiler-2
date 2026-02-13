import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  ExternalLink,
  Copy,
  Check,
  Info,
  PartyPopper,
  AlertTriangle,
  AlertCircle,
  Bug,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface AIExplanationData {
  status?: "OPTIMAL" | "ERROR";
  message?: string;

  topic?: string;
  topic_detected?: string;

  root_cause?: number[];
  root_cause_lines?: number[];

  summary?: string;

  explanation?: string;
  detailed_explanation?: string;

  fix_summary?: string;
  corrected_code?: string;

  minimal_fix_patch?: {
    type: string;
    line_start: number;
    line_end: number;
    replacement: string;
  } | null;

  why_console_hidden?: string;
  hints?: string[];
  learning_resources?: Array<{ title: string; type: string; url: string; }>;
  confidence?: number;
}

interface AIExplanationProps {
  explanation: AIExplanationData;
  onApplyPatch?: () => void;
  onDeepAnalyze?: () => void;
}

const AIExplanation = ({ explanation, onApplyPatch, onDeepAnalyze }: AIExplanationProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    rootCause: true,
    fix: true,
    hints: false,
  });

  // Helper to normalize fields between new and old format
  const isOptimal = explanation.status === "OPTIMAL";
  const topic = explanation.topic || explanation.topic_detected;
  const rootCauseLines = explanation.root_cause || explanation.root_cause_lines;
  const detailedText = explanation.explanation || explanation.detailed_explanation;
  const summaryText = explanation.summary || explanation.message;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCopyPatch = () => {
    const textToCopy = explanation.corrected_code || explanation.minimal_fix_patch?.replacement || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getConfidenceLevel = () => {
    const conf = explanation.confidence ?? 1;
    if (conf >= 0.8) return { label: "High", class: "badge-success" };
    if (conf >= 0.5) return { label: "Medium", class: "badge-warning" };
    return { label: "Low", class: "badge-critical" };
  };

  const getSeverityIcon = () => {
    if (isOptimal) return <CheckCircle className="h-5 w-5 text-success" />;
    if (topic?.toLowerCase().includes("syntax")) return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (topic?.toLowerCase().includes("logic")) return <Bug className="h-5 w-5 text-warning" />;
    return <AlertTriangle className="h-5 w-5 text-orange-500" />;
  };

  // RENDER: OPTIMAL CASE - Celebration UI
  if (isOptimal) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-8">
        {/* Large Success Icon with Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
          <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-8 shadow-lg">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3 text-center">
          Great Job!
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 text-center max-w-md">
          {explanation.message || "Your code is correct. Click 'AI Analysis' to see if there are even better ways to write it."}
        </p>

        {/* Success Details Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-green-200 dark:border-green-800 p-6 mb-6 w-full max-w-md">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Your code compiles correctly.</span>
          </div>
        </div>



        {/* Bottom Status */}
        <div className="mt-8 flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Analysis Complete</span>
        </div>
      </div>
    );
  }

  // RENDER: ERROR / ANALYSIS CASE
  return (
    <Card className="h-full overflow-hidden border-border/30 bg-card shadow-lg flex flex-col">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-gradient-to-r from-destructive/10 via-orange-500/10 to-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Lightbulb className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">AI Analysis</span>
            {topic && (
              <p className="text-xs text-muted-foreground">{topic}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {explanation.confidence !== undefined && (
            <span className={getConfidenceLevel().class}>
              {Math.round(explanation.confidence * 100)}% confident
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">

        {/* Why Console Hidden Alert */}
        {explanation.why_console_hidden && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 animate-fadeIn">
            <div className="p-2 rounded-lg bg-amber-500/20 h-fit">
              <Info className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-1">Why no console output?</h3>
              <p className="text-sm text-foreground/80">{explanation.why_console_hidden}</p>
            </div>
          </div>
        )}

        {/* Summary Card */}
        {summaryText && (
          <div className="bg-muted/30 border border-border/50 rounded-xl overflow-hidden animate-fadeIn">
            <button
              onClick={() => toggleSection('summary')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Analysis Summary</span>
              </div>
              {expandedSections.summary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.summary && (
              <div className="px-4 pb-4">
                <p className="text-sm text-foreground/80 leading-relaxed">{summaryText}</p>
              </div>
            )}
          </div>
        )}

        {/* Root Cause Card */}
        {rootCauseLines && rootCauseLines.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl overflow-hidden animate-fadeIn delay-75">
            <button
              onClick={() => toggleSection('rootCause')}
              className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Bug className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm font-semibold text-foreground">Root Cause</span>
              </div>
              {expandedSections.rootCause ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.rootCause && (
              <div className="px-4 pb-4">
                <div className="flex gap-2 flex-wrap">
                  {rootCauseLines.map((line) => (
                    <span key={line} className="badge-critical">
                      Line {line}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fix Summary */}
        {explanation.fix_summary && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-fadeIn delay-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">How to Fix</span>
            </div>
            <p className="text-sm text-foreground/80">{explanation.fix_summary}</p>
          </div>
        )}

        {/* Corrected Code Card */}
        {(explanation.corrected_code || explanation.minimal_fix_patch) && (
          <div className="bg-success/5 border border-success/20 rounded-xl overflow-hidden animate-fadeIn delay-150">
            <button
              onClick={() => toggleSection('fix')}
              className="w-full flex items-center justify-between p-4 hover:bg-success/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {explanation.corrected_code ? "Corrected Code" : "Suggested Fix"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleCopyPatch(); }}
                  className="h-7 px-2"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                {expandedSections.fix ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedSections.fix && (
              <div className="px-4 pb-4">
                {explanation.minimal_fix_patch && !explanation.corrected_code && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Lines {explanation.minimal_fix_patch.line_start}-{explanation.minimal_fix_patch.line_end}
                  </p>
                )}
                <pre className="text-xs font-mono text-slate-200 dark:text-slate-100 bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-64 border border-slate-700 dark:border-slate-800 whitespace-pre-wrap">
                  {explanation.corrected_code || explanation.minimal_fix_patch?.replacement}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Detailed Explanation */}
        {detailedText && (
          <div className="animate-fadeIn delay-200">
            {!showDetails ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="w-full gap-2 border-dashed"
              >
                <ChevronDown className="h-4 w-4" />
                Show Detailed Explanation
              </Button>
            ) : (
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Detailed Explanation</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                    className="h-7 px-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {detailedText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Learning Hints */}
        {explanation.hints && explanation.hints.length > 0 && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl overflow-hidden animate-fadeIn delay-300">
            <button
              onClick={() => toggleSection('hints')}
              className="w-full flex items-center justify-between p-4 hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Lightbulb className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm font-semibold text-foreground">Learning Hints</span>
                <Badge variant="secondary" className="text-xs">{explanation.hints.length}</Badge>
              </div>
              {expandedSections.hints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.hints && (
              <div className="px-4 pb-4 space-y-2">
                {explanation.hints.map((hint, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-background/50 rounded-lg">
                    <span className="text-accent font-bold">{idx + 1}.</span>
                    <span className="text-sm text-foreground/80">{hint}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Learning Resources */}
        {explanation.learning_resources && explanation.learning_resources.length > 0 && (
          <div className="space-y-2 animate-fadeIn delay-300">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning Resources
            </h3>
            <div className="space-y-2">
              {explanation.learning_resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all group border border-transparent hover:border-primary/20"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {resource.title}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Apply Fix Button */}
      {(explanation.corrected_code || explanation.minimal_fix_patch) && onApplyPatch && (
        <div className="p-4 border-t border-border/20 bg-gradient-to-t from-card to-transparent">
          <Button
            onClick={onApplyPatch}
            className="w-full btn-autofix-custom justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Apply Fix
          </Button>
        </div>
      )}
    </Card>
  );
};

// Missing import
const CheckCircle = Check;

export default AIExplanation;

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  Trash2,
  Copy,
  Check,
  Clock,
  Maximize2,
  Minimize2,
  Type,
  WrapText,
  AlertTriangle,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConsoleOutputProps {
  output: string;
  type: "success" | "error" | "info" | "warning";
  exitCode?: number;
}

const ConsoleOutput = ({ output, type, exitCode }: ConsoleOutputProps) => {
  const [copied, setCopied] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const [fontSize, setFontSize] = useState(15);
  const [wordWrap, setWordWrap] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString());
  }, [output]);

  // Scroll to bottom on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("Output copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightSyntax = (text: string) => {
    // Basic tokenizer for output highlighting
    // Splits by spaces and common delimiters but preserves them
    const parts = text.split(/(\s+|[\[\](){},=:]|"[^"]*")/g);

    return parts.map((part, i) => {
      // Numbers
      if (/^-?\d+(\.\d+)?$/.test(part)) {
        return <span key={i} style={{ color: '#60A5FA' }}>{part}</span>;
      }
      // Strings
      if (/^"[^"]*"$/.test(part)) {
        return <span key={i} style={{ color: '#86EFAC' }}>{part}</span>;
      }
      // Keywords/Types (common in C output or error messages)
      if (/^(error|warning|img|void|int|char|return|main|include|stdio|stdlib|printf)/i.test(part)) {
        return <span key={i} style={{ color: '#FB923C' }}>{part}</span>;
      }
      // Specific Headers
      if (part.includes('.h')) {
        return <span key={i} style={{ color: '#A78BFA' }}>{part}</span>;
      }
      // Error markers
      if (part.includes('^')) {
        return <span key={i} style={{ color: '#F87171', fontWeight: 'bold' }}>{part}</span>;
      }
      // Input markers (User Requirement)
      if (part.trim().startsWith('[INPUT]')) {
        return <span key={i} style={{ color: '#4ADE80', fontWeight: 'bold' }}>{part}</span>;
      }

      // Default text (Light Gray)
      return <span key={i} style={{ color: '#E2E8F0' }}>{part}</span>;
    });
  };

  return (
    <Card className="h-full overflow-hidden border-border/40 shadow-xl flex flex-col bg-slate-900 dark:bg-slate-950 rounded-xl ring-1 ring-white/5">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
        <div className="flex items-center gap-4">
          {/* Mac Traffic Lights */}
          <div className="flex items-center gap-2 group">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm group-hover:bg-red-600 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm group-hover:bg-amber-600 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm group-hover:bg-green-600 transition-colors" />
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Title */}
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-400">Console Output</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {exitCode !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
              exitCode === 0
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
            )}>
              {exitCode === 0 ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {exitCode === 0 ? "Success" : `Exit Code ${exitCode}`}
            </div>
          )}

          {/* Timestamp */}
          {output && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{timestamp}</span>
            </div>
          )}

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-800"
              onClick={() => setFontSize(s => Math.max(12, s - 1))}
              title="Decrease Font Size"
            >
              <span className="text-xs font-bold">A-</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-800"
              onClick={() => setFontSize(s => Math.min(24, s + 1))}
              title="Increase Font Size"
            >
              <span className="text-xs font-bold">A+</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 hover:bg-slate-700 dark:hover:bg-slate-800",
                wordWrap ? "text-slate-200 bg-slate-700 dark:bg-slate-800" : "text-slate-400 hover:text-slate-200"
              )}
              onClick={() => setWordWrap(!wordWrap)}
              title="Toggle Word Wrap"
            >
              <WrapText className="h-3.5 w-3.5" />
            </Button>

            {output && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-800 ml-1"
                onClick={handleCopy}
                title="Copy Output"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Console Body */}
      <div
        className="relative flex-1 bg-slate-900 dark:bg-slate-950 overflow-hidden flex"
        ref={outputRef}
      >
        {/* Output Content */}
        {!output ? (
          <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-slate-400 gap-4">
            <Terminal className="h-12 w-12 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">Ready to compile</p>
              <p className="text-xs opacity-70 mt-1">Run your code to see output here</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto custom-scrollbar flex">
            {/* Line Numbers Gutter */}
            <div className="flex flex-col items-center bg-slate-950 dark:bg-black text-slate-600 dark:text-slate-500 py-4 select-none border-r border-slate-800 dark:border-slate-900 min-w-[3rem]">
              {output.split('\n').map((_, i) => (
                <span key={i} className="text-[13px] leading-[1.8] font-mono hover:text-slate-400 transition-colors">
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Text Content */}
            <div
              className={cn(
                "flex-1 py-4 pl-3 pr-4 font-mono leading-[1.8] tracking-wide outline-none",
                wordWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"
              )}
              style={{ fontSize: `${fontSize}px` }}
            >
              {output.split('\n').map((line, i) => (
                <div key={i} className="min-h-[1.8em]">
                  {/* Optional Error/Success highlight line */}
                  {line.toLowerCase().includes('error') && (
                    <div className="absolute left-10 right-0 h-[1.8em] bg-red-500/10 pointer-events-none" style={{ marginTop: '-1.8em', transform: 'translateY(1.8em)' }} />
                  )}
                  {highlightSyntax(line || ' ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar (Optional refined touch) */}
      {output && (
        <div className="h-6 bg-slate-950 dark:bg-black border-t border-slate-800 dark:border-slate-900 flex items-center px-3 justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Ready</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-500 font-mono">UTF-8</span>
        </div>
      )}
    </Card>
  );
};

export default ConsoleOutput;

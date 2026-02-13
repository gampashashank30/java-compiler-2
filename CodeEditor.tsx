import { useRef, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Card } from "@/components/ui/card";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  errorLines?: number[];
  fixedLines?: number[];
}

const CodeEditor = ({ value, onChange, errorLines = [], fixedLines = [] }: CodeEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const [previousValue, setPreviousValue] = useState(value);

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const newDecorations: editor.IModelDeltaDecoration[] = [];

    // EXPLICIT CLEAR: If both arrays are empty, clear all decorations
    if (errorLines.length === 0 && fixedLines.length === 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    // Red Error Lines with gradient effect
    errorLines.forEach((line) => {
      newDecorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: "dsq-error-line",
          glyphMarginClassName: "dsq-error-glyph",
          overviewRuler: {
            position: monaco.editor.OverviewRulerLane.Full,
            color: "rgba(239, 68, 68, 0.6)"
          },
          minimap: {
            position: monaco.editor.MinimapPosition.Inline,
            color: { id: "minimap.errorHighlight" }
          }
        },
      });
    });

    // Green Fixed Lines with success styling
    fixedLines.forEach((line) => {
      newDecorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: "dsq-success-line",
          glyphMarginClassName: "dsq-success-glyph",
          overviewRuler: {
            position: monaco.editor.OverviewRulerLane.Full,
            color: "rgba(34, 197, 94, 0.6)"
          },
          minimap: {
            position: monaco.editor.MinimapPosition.Inline,
            color: { id: "minimap.successHighlight" }
          }
        },
      });
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  };

  // Update decorations when error/fixed lines change
  useEffect(() => {
    updateDecorations();
  }, [errorLines, fixedLines]);

  // Handle onChange with line change tracking
  const handleChange = (newValue: string | undefined) => {
    if (!newValue) {
      onChange(newValue);
      return;
    }

    // Detect which lines were modified
    const oldLines = previousValue.split('\n');
    const newLines = newValue.split('\n');
    const modifiedLineNumbers: number[] = [];

    // Find lines that changed
    const maxLength = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLength; i++) {
      if (oldLines[i] !== newLines[i]) {
        modifiedLineNumbers.push(i + 1); // 1-indexed
      }
    }

    // Track the previous value for next comparison
    setPreviousValue(newValue);

    // Pass through to parent onChange
    onChange(newValue);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom theme for enhanced visuals
    monaco.editor.defineTheme('compiler-studio-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'f472b6' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'type', foreground: '60a5fa' },
        { token: 'function', foreground: '818cf8' },
        { token: 'variable', foreground: 'e2e8f0' },
        { token: 'operator', foreground: 'f472b6' },
        { token: 'delimiter', foreground: '94a3b8' },
        { token: 'preprocessor', foreground: 'fb923c' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.lineHighlightBorder': '#334155',
        'editor.selectionBackground': '#6366f140',
        'editor.selectionHighlightBackground': '#6366f120',
        'editorCursor.foreground': '#6366f1',
        'editorWhitespace.foreground': '#334155',
        'editorIndentGuide.background': '#334155',
        'editorIndentGuide.activeBackground': '#6366f1',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#a78bfa',
        'editorGutter.background': '#0f172a',
        'editorBracketMatch.background': '#6366f130',
        'editorBracketMatch.border': '#6366f1',
        'minimap.background': '#0f172a',
        'minimapSlider.background': '#6366f120',
        'minimapSlider.hoverBackground': '#6366f140',
        'minimapSlider.activeBackground': '#6366f160',
        'scrollbar.shadow': '#00000050',
        'scrollbarSlider.background': '#47556950',
        'scrollbarSlider.hoverBackground': '#47556980',
        'scrollbarSlider.activeBackground': '#6366f180',
      }
    });

    // Apply custom theme
    monaco.editor.setTheme('compiler-studio-dark');

    // Configure bracket pair colorization colors
    editor.updateOptions({
      'bracketPairColorization.independentColorPoolPerBracketType': true,
    });

    // Initial decorations
    updateDecorations();
  };

  return (
    <Card className="h-full overflow-hidden border-border/30 bg-[#0f172a] shadow-lg shadow-black/20">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          {/* File Tab */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
            <div className="w-3 h-3 rounded-full bg-primary/60"></div>
            <span className="text-xs font-medium text-primary">main.c</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/60">UTF-8</span>
          <span className="text-[10px] font-mono text-muted-foreground/60">•</span>
          <span className="text-[10px] font-mono text-muted-foreground/60">C Language</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="h-[calc(100%-40px)]">
        <Editor
          height="100%"
          defaultLanguage="c"
          theme="compiler-studio-dark"
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            // Font Settings
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace",
            fontSize: 14,
            fontLigatures: true,
            fontWeight: '400',
            lineHeight: 1.6,
            letterSpacing: 0.5,

            // Minimap (VS Code style)
            minimap: {
              enabled: true,
              side: 'right',
              size: 'proportional',
              maxColumn: 80,
              renderCharacters: false,
              showSlider: 'mouseover',
            },

            // Line Numbers & Gutter
            lineNumbers: "on",
            lineNumbersMinChars: 4,
            glyphMargin: true,
            folding: true,
            foldingHighlight: true,
            foldingStrategy: 'auto',
            showFoldingControls: 'mouseover',

            // Bracket Pair Colorization
            bracketPairColorization: {
              enabled: true,
              independentColorPoolPerBracketType: true,
            },
            matchBrackets: 'always',

            // Indent Guides
            guides: {
              indentation: true,
              bracketPairs: true,
              bracketPairsHorizontal: true,
              highlightActiveIndentation: true,
            },

            // Active Line Highlighting
            renderLineHighlight: 'all',
            renderLineHighlightOnlyWhenFocus: false,

            // Scrolling & Layout
            scrollBeyondLastLine: false,
            automaticLayout: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
              useShadows: true,
              verticalSliderSize: 8,
              horizontalSliderSize: 8,
            },

            // Editor Behavior
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            wrappingIndent: 'indent',
            padding: { top: 16, bottom: 16 },
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            cursorStyle: 'line',
            cursorWidth: 2,

            // Suggestions & Completion
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'matchingDocuments',

            // Code Actions
            lightbulb: {
              enabled: 'on'
            },

            // Additional Enhancements
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            renderIndentGuides: true,
            highlightActiveIndentGuide: true,
            overviewRulerBorder: false,
            overviewRulerLanes: 3,
            hideCursorInOverviewRuler: false,
          }}
        />
      </div>
    </Card>
  );
};

export default CodeEditor;

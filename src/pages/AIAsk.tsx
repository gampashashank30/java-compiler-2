import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookOpen, Sparkles, Clock, ExternalLink, ArrowRight, Code, Mic, MicOff, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import CodeSizeSelector from "@/components/CodeSizeSelector";

interface ConceptExplanation {
  title: string;
  definition: string;
  key_points: string[];
  example?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface AIAskResponseWithSolution {
  problem_summary: string;
  concept_explanation: ConceptExplanation;
  prerequisite_topics: Array<{ topic: string; priority: string; why: string }>;
  quiz: QuizQuestion[];
  study_plan: Array<{ step: string; activity: string; est_time_minutes: number }>;
  practice_exercises: Array<{ title: string; difficulty: string; description: string }>;
  resources: Array<{ title: string; type: string; url: string }>;
  solution?: {
    code: string;
    language: string;
    explanation: string;
  };
}

const AIAsk = () => {
  const [problemText, setProblemText] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [response, setResponse] = useState<AIAskResponseWithSolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [provideFullSolution, setProvideFullSolution] = useState(false);
  const [explicitCodeSize, setExplicitCodeSize] = useState<"small" | "medium" | "big" | null>(null);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('ai-ask-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.problemText) setProblemText(parsed.problemText);
        if (parsed.level) setLevel(parsed.level);
        if (parsed.provideFullSolution !== undefined) setProvideFullSolution(parsed.provideFullSolution);
        if (parsed.explicitCodeSize !== undefined) setExplicitCodeSize(parsed.explicitCodeSize);
        if (parsed.response) setResponse(parsed.response);
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      problemText,
      level,
      provideFullSolution,
      explicitCodeSize,
      response
    };
    localStorage.setItem('ai-ask-state', JSON.stringify(stateToSave));
  }, [problemText, level, provideFullSolution, explicitCodeSize, response]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setProblemText((prev) => prev + (prev ? ' ' : '') + transcript);
        toast.success("Voice recognized!");
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error("Could not recognize speech. Please try again.");
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("Listening...");
    }
  };

  // Auto-map code size based on level if not explicitly set
  const codeSize = explicitCodeSize || (
    level === "beginner" ? "big" :
      level === "intermediate" ? "medium" :
        "small"
  );

  const handleSubmit = async () => {
    if (!problemText.trim()) {
      toast.error("Please enter a problem statement");
      return;
    }

    setLoading(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    toast.loading("Generating personalized study plan...");

    try {
      const { callGroqAPI } = await import("@/utils/groqClient");

      const codeSizeInstructions = {
        small: "10-20 lines max. Use beginner-friendly syntax with HEAVY inline comments (every 2-3 lines). Descriptive variable names. Simple logic, no tricks. Example: for(int i=0; i<n; i++) // Loop through each element",
        medium: "25-40 lines. Standard Java implementation with moderate comments on key sections. Clean variable names. Standard algorithms without advanced optimizations.",
        big: "50-80 lines. Comprehensive solution with detailed function-level comments. Include error handling and edge cases. Add educational comments explaining 'why' not just 'what'. Helper functions for clarity."
      };

      const prompt = `You are a concise CS study planner. Generate a JSON response (no markdown).

Topic: "${problemText}"
Level: ${level}
Include Solution: ${provideFullSolution}
Code Size: ${codeSize}

${provideFullSolution ? `CODE SIZE RULE (${codeSize}): ${codeSizeInstructions[codeSize]}. ALL sizes must be STUDENT-FRIENDLY.` : ''}

JSON Structure:
{
  "problem_summary": "1 sentence summary",
  "concept_explanation": {
    "title": "Main concept name",
    "definition": "Clear 2-sentence definition",
    "key_points": ["point 1", "point 2", "point 3"],
    "example": "Simple real-world example"
  },
  "prerequisite_topics": [
    {"topic": "name", "priority": "high", "why": "reason"}
  ] (max 3),
  "quiz": [
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "why correct"
    }
  ] (exactly 4 questions based on concept_explanation),
  "study_plan": [
    {"step": "title", "activity": "what to do", "est_time_minutes": number}
  ] (max 4),
  "practice_exercises": [
    {"title": "name", "difficulty": "easy/medium/hard", "description": "brief"}
  ] (max 3),
  "resources": [
    {"title": "name", "type": "article/video", "url": "placeholder"}
  ] (max 3)${provideFullSolution ? `,
  "solution": {
    "code": "Java code following size rules above. MUST be a full class with main method.",
    "language": "java",
    "explanation": "brief explanation"
  }` : ''}
}`;

      const studyPlan = await callGroqAPI([
        { role: "system", content: "You are a helpful study planner. Return ONLY valid JSON, no markdown." },
        { role: "user", content: prompt }
      ]);

      setResponse(studyPlan);

      toast.dismiss();
      toast.success("Study plan generated!", {
        description: "Scroll down to explore",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.dismiss();
      toast.error("An error occurred", {
        description: (error as Error).message || "Please try again",
      });
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    if (!response?.quiz) return;

    let correct = 0;
    response.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer) correct++;
    });

    setQuizScore(correct);
    setQuizSubmitted(true);

    if (correct === response.quiz.length) {
      toast.success("Perfect score! 🎉");
    } else if (correct >= response.quiz.length / 2) {
      toast.info(`Good job! ${correct}/${response.quiz.length} correct`);
    } else {
      toast.error(`Keep practicing! ${correct}/${response.quiz.length} correct`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "destructive";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/app" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowRight className="h-5 w-5 rotate-180" />
              <span className="font-semibold">Back to Editor</span>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">AI Study Assistant</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Section */}
          <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Paste Your Programming Problem
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter any programming problem or challenge, and get a personalized study plan with
                  concept explanations, quizzes, and practice exercises.
                </p>
                <div className="relative">
                  <Textarea
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    placeholder="Example: Write a C program to check if a number is prime"
                    className="min-h-[120px] font-mono text-sm pr-14"
                  />
                  <Button
                    variant={isListening ? "default" : "outline"}
                    size="icon"
                    className={`absolute bottom-3 right-3 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
                    onClick={toggleVoiceInput}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
                {isListening && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Listening... Speak now
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your Experience Level
                </label>
                <div className="flex gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                    <Button
                      key={lvl}
                      variant={level === lvl ? "default" : "outline"}
                      onClick={() => setLevel(lvl)}
                      className="capitalize"
                    >
                      {lvl}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 flex-1">
                  <Switch
                    id="full-solution"
                    checked={provideFullSolution}
                    onCheckedChange={setProvideFullSolution}
                  />
                  <Label htmlFor="full-solution" className="cursor-pointer">
                    <span className="font-medium">Provide full code solution</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get a complete, working implementation
                    </p>
                  </Label>
                </div>

                {provideFullSolution && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">Size:</span>
                    <CodeSizeSelector codeSize={codeSize} onChange={setExplicitCodeSize} />
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Generating Study Plan...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Generate Study Plan
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Response Section */}
          {response && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Problem Summary */}
              <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h3 className="text-lg font-semibold text-foreground mb-2">Problem Summary</h3>
                <p className="text-foreground/80">{response.problem_summary}</p>
              </Card>

              {/* Concept Explanation */}
              <Card className="p-6 border-border/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{response.concept_explanation.title}</h3>
                    <p className="text-sm text-muted-foreground">{response.concept_explanation.definition}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-medium text-foreground">Key Points:</h4>
                  <ul className="space-y-1.5">
                    {response.concept_explanation.key_points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {response.concept_explanation.example && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Example:</p>
                    <p className="text-sm text-foreground">{response.concept_explanation.example}</p>
                  </div>
                )}
              </Card>

              {/* Interactive Quiz */}
              {response.quiz && response.quiz.length > 0 && (
                <Card className="p-6 border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      Test Your Understanding
                    </h3>
                    {quizSubmitted && (
                      <Badge variant={quizScore === response.quiz.length ? "default" : "secondary"}>
                        Score: {quizScore}/{response.quiz.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-6">
                    {response.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 bg-background/50 rounded-lg border border-border/50">
                        <p className="font-medium text-foreground mb-3">
                          {qIdx + 1}. {q.question}
                        </p>
                        <RadioGroup
                          value={quizAnswers[qIdx]?.toString()}
                          onValueChange={(value) => setQuizAnswers({ ...quizAnswers, [qIdx]: parseInt(value) })}
                          disabled={quizSubmitted}
                        >
                          {q.options.map((option, oIdx) => {
                            const isSelected = quizAnswers[qIdx] === oIdx;
                            const isCorrect = q.correct_answer === oIdx;
                            const showFeedback = quizSubmitted && isSelected;

                            return (
                              <div
                                key={oIdx}
                                className={`flex items-center space-x-2 p-3 rounded-md border transition-colors ${showFeedback
                                  ? isCorrect
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                  : 'border-border hover:bg-accent'
                                  }`}
                              >
                                <RadioGroupItem value={oIdx.toString()} id={`q${qIdx}-${oIdx}`} />
                                <Label htmlFor={`q${qIdx}-${oIdx}`} className="flex-1 cursor-pointer flex items-center gap-2">
                                  {option}
                                  {showFeedback && (
                                    isCorrect ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )
                                  )}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>

                        {quizSubmitted && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                              <span className="font-medium">Explanation:</span> {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted && (
                    <Button
                      onClick={handleQuizSubmit}
                      className="w-full mt-4"
                      disabled={Object.keys(quizAnswers).length !== response.quiz.length}
                    >
                      Submit Quiz
                    </Button>
                  )}
                </Card>
              )}

              {/* Prerequisite Topics */}
              <Card className="p-6 border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Prerequisite Topics
                </h3>
                <div className="space-y-3">
                  {response.prerequisite_topics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{topic.topic}</h4>
                        <Badge variant={getPriorityColor(topic.priority)} className="capitalize">
                          {topic.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{topic.why}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Study Plan */}
              <Card className="p-6 border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Recommended Study Path
                </h3>
                <div className="space-y-3">
                  {response.study_plan.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{step.step}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{step.activity}</p>
                        <Badge variant="secondary" className="text-xs">
                          ~{step.est_time_minutes} min
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Practice Exercises */}
              <Card className="p-6 border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4">Practice Exercises</h3>
                <div className="space-y-3">
                  {response.practice_exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{exercise.title}</h4>
                        <Badge variant={getDifficultyColor(exercise.difficulty)} className="capitalize">
                          {exercise.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{exercise.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Learning Resources */}
              <Card className="p-6 border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4">Learning Resources</h3>
                <div className="grid gap-3">
                  {response.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </Card>

              {/* Full Code Solution (if provided) */}
              {response.solution && (
                <Card className="p-6 border-border/50 bg-gradient-to-br from-success/5 to-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="h-5 w-5 text-success" />
                    <h3 className="text-lg font-semibold text-foreground">Complete Solution</h3>
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => {
                          if (response.solution?.code) {
                            navigator.clipboard.writeText(response.solution.code);
                            toast.success("Code copied to clipboard");
                          }
                        }}
                      >
                        <Code className="h-3 w-3" />
                        Copy Code
                      </Button>
                      <Badge variant="secondary" className="capitalize">{codeSize}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <pre className="text-sm overflow-x-auto">
                        <code className="language-c">{response.solution.code}</code>
                      </pre>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Explanation:</h4>
                      <p className="text-sm text-muted-foreground">{response.solution.explanation}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIAsk;

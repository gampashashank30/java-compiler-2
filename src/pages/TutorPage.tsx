import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTutorSession } from '@/hooks/useTutorSession';
import { ProgressTracker } from '@/components/tutor/ProgressTracker';
import { ConceptView } from '@/components/tutor/ConceptView';
import { QuizView } from '@/components/tutor/QuizView';
import { LogicView } from '@/components/tutor/LogicView';
import { CodeView } from '@/components/tutor/CodeView';
import { SuccessView } from '@/components/tutor/SuccessView';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { TutorPhase } from '@/types/tutor';
import {
    generateConceptIntroductionPrompt,
    generateQuizQuestionsPrompt,
    validateLogicPrompt,
    evaluateCodePrompt,
    createSystemPrompt,
} from '@/utils/tutorPrompts';

const TutorPage = () => {
    const {
        session,
        startNewSession,
        setPhase,
        setConceptData,
        setQuizQuestions,
        submitQuizAnswer,
        calculateQuizScore,
        setLogicSubmission,
        setLogicValidation,
        setCodeSubmission,
        setCodeEvaluation,
        completeSession,
        resetSession,
    } = useTutorSession();

    const [topicInput, setTopicInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Navigation Handler
    const handlePhaseClick = (phaseId: string) => {
        const phases: TutorPhase[] = ['welcome', 'concept', 'quiz', 'logic', 'code', 'success'];
        const currentIdx = phases.indexOf(session.phase);
        const targetIdx = phases.indexOf(phaseId as TutorPhase);

        // Allow going back to any previous phase
        // Allow going forward only one step at a time (and only if data exists is handled by the component rendering check)
        // Actually, ProgressTracker already controls clickability. We just need to switch state here.
        // But we should double check data availability.

        if (targetIdx < currentIdx) {
            setPhase(phaseId as TutorPhase);
        } else if (targetIdx === currentIdx + 1) {
            // Check if we can advance (e.g., if we have data)
            if (phaseId === 'quiz' && !session.conceptData) return; // Should fail earlier
            setPhase(phaseId as TutorPhase);
        }
    };

    // Phase 1: Start new topic and fetch concept
    const handleStartTopic = async () => {
        if (!topicInput.trim()) {
            toast.error('Please enter a programming topic');
            return;
        }

        setIsLoading(true);
        toast.loading('Generating concept explanation...');

        try {
            const { callGroqAPI } = await import('@/utils/groqClient');

            const prompt = generateConceptIntroductionPrompt(topicInput);
            const systemPrompt = createSystemPrompt('concept');

            const response = await callGroqAPI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ]);

            // Start session WITH data (important: do this in one atomic update via the hook)
            startNewSession(topicInput, response);

            toast.dismiss();
            toast.success('Concept loaded!');
        } catch (error) {
            console.error('Failed to generate concept:', error);
            toast.dismiss();
            toast.error('Failed to generate concept. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Phase 2: Generate quiz from concept
    const handleContinueToQuiz = async () => {
        if (!session.conceptData) return;

        // If we already have questions, just move to quiz
        if (session.quizQuestions.length > 0) {
            setPhase('quiz');
            return;
        }

        setIsLoading(true);
        toast.loading('Generating quiz questions...');

        try {
            const { callGroqAPI } = await import('@/utils/groqClient');

            const prompt = generateQuizQuestionsPrompt(session.topic, session.conceptData);
            const systemPrompt = createSystemPrompt('quiz');

            const response = await callGroqAPI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ]);

            setQuizQuestions(response.questions);
            setPhase('quiz');

            toast.dismiss();
            toast.success('Quiz ready!');
        } catch (error) {
            console.error('Failed to generate quiz:', error);
            toast.dismiss();
            toast.error('Failed to generate quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Phase 3: Submit quiz and move to logic
    const handleQuizSubmit = () => {
        const score = calculateQuizScore();
        setPhase('logic');

        if (score === session.quizQuestions.length) {
            toast.success('Perfect score! 🎉');
        } else if (score >= session.quizQuestions.length / 2) {
            toast.success(`Good job! ${score}/${session.quizQuestions.length} correct`);
        } else {
            toast.info(`${score}/${session.quizQuestions.length} correct. Review and learn!`);
        }
    };

    // Phase 4: Validate logic
    const handleValidateLogic = async () => {
        if (!session.logicSubmission.trim()) {
            toast.error('Please describe your approach first');
            return;
        }

        setIsLoading(true);
        toast.loading('Analyzing your logic...');

        try {
            const { callGroqAPI } = await import('@/utils/groqClient');

            const prompt = validateLogicPrompt(session.topic, session.logicSubmission);
            const systemPrompt = createSystemPrompt('logic');

            const response = await callGroqAPI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ]);

            setLogicValidation(response);

            toast.dismiss();
            if (response.is_correct) {
                toast.success('Great logic! ✓');
            } else {
                toast.info('Let\'s refine your approach');
            }
        } catch (error) {
            console.error('Failed to validate logic:', error);
            toast.dismiss();
            toast.error('Failed to analyze logic. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Phase 5: Move to code implementation
    const handleContinueToCode = () => {
        setPhase('code');
        toast.success('Now implement your solution in Java!');
    };

    // Phase 6: Evaluate code
    const handleEvaluateCode = async () => {
        if (!session.codeSubmission.trim()) {
            toast.error('Please write some code first');
            return;
        }

        setIsLoading(true);
        toast.loading('Evaluating your code...');

        try {
            const { callGroqAPI } = await import('@/utils/groqClient');

            const expectedLogic = session.logicValidation?.correct_approach || session.logicSubmission;
            const prompt = evaluateCodePrompt(session.topic, session.codeSubmission, expectedLogic);
            const systemPrompt = createSystemPrompt('code');

            const response = await callGroqAPI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ]);

            setCodeEvaluation(response);

            toast.dismiss();
            if (response.status === 'success') {
                toast.success('Excellent work! 🎉');
            } else {
                toast.warning('Check the feedback for improvements');
            }
        } catch (error) {
            console.error('Failed to evaluate code:', error);
            toast.dismiss();
            toast.error('Failed to evaluate code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle follow-up questions for code
    const handleAskQuestion = async (question: string): Promise<string> => {
        try {
            const { callGroqAPI } = await import('@/utils/groqClient');

            // Revised prompt for JSON safety
            const safePrompt = `Topic: "${session.topic}"
Student Code:
${session.codeSubmission}

Student Question: "${question}"

Answer as a supportive Java programming tutor.
- Be concise (2-3 sentences max).
- Focus on the specific question.
- If asking about optimization (e.g. "why 6/10?"), explain the trade-offs gently but re-affirm their success.
- Return ONLY valid JSON: { "answer": "your response here" }`;

            const systemPrompt = createSystemPrompt('code');

            const response = await callGroqAPI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: safePrompt },
            ]);

            return response.answer;
        } catch (error) {
            console.error('Failed to answer question:', error);
            toast.error('Failed to get answer.');
            return "I couldn't generate an answer at this moment. Please try again.";
        }
    };

    // Complete and show success
    const handleCompleteSession = () => {
        completeSession();
        toast.success('Learning session completed! 🎉');
    };

    // Start over
    const handleTryAnother = () => {
        resetSession();
        setTopicInput('');
        toast.info('Ready for a new topic!');
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
                            <Sparkles className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                AI Programming Tutor
                            </h1>
                        </div>
                        <div className="w-32"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Progress Tracker */}
                {session.phase !== 'welcome' && session.phase !== 'success' && (
                    <ProgressTracker currentPhase={session.phase} onPhaseClick={handlePhaseClick} />
                )}

                <ErrorBoundary>
                    <AnimatePresence mode="wait">
                        {/* Welcome Screen */}
                        {session.phase === 'welcome' && (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-3xl mx-auto mt-12"
                            >
                                <Card className="p-8 border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                                    {/* Greeting Message */}
                                    <div className="mb-8 text-left">
                                        <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                                            👋 Welcome to AI Programming Tutor!
                                        </h2>

                                        <p className="text-lg text-foreground/90 mb-6 leading-relaxed">
                                            I'll help you master Java programming concepts through 4 phases:
                                        </p>

                                        <div className="grid gap-3 mb-6">
                                            <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                                                <span className="text-2xl">📚</span>
                                                <div>
                                                    <strong className="text-foreground">Learn Concept</strong>
                                                    <p className="text-sm text-muted-foreground">Clear explanations with real-world examples</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                                                <span className="text-2xl">🧠</span>
                                                <div>
                                                    <strong className="text-foreground">Test Knowledge</strong>
                                                    <p className="text-sm text-muted-foreground">Interactive quiz with instant feedback</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                                                <span className="text-2xl">🎯</span>
                                                <div>
                                                    <strong className="text-foreground">Design Logic</strong>
                                                    <p className="text-sm text-muted-foreground">Plan your algorithm before coding</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                                                <span className="text-2xl">💻</span>
                                                <div>
                                                    <strong className="text-foreground">Write Code</strong>
                                                    <p className="text-sm text-muted-foreground">Implement with AI-powered guidance</p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-lg font-semibold text-foreground mb-4">
                                            What would you like to learn today?
                                        </p>
                                    </div>

                                    {/* Input Section */}
                                    <div className="space-y-4">
                                        <Input
                                            type="text"
                                            value={topicInput}
                                            onChange={(e) => setTopicInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleStartTopic()}
                                            placeholder="Enter a topic: prime numbers, factorial, fibonacci, loops, arrays, pointers, etc."
                                            className="text-lg h-14"
                                            disabled={isLoading}
                                        />

                                        <Button
                                            onClick={handleStartTopic}
                                            disabled={!topicInput.trim() || isLoading}
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg h-14"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                                                    Generating Your Lesson...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-5 w-5 mr-2" />
                                                    Start Learning Journey
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Phase 1: Concept */}
                        {session.phase === 'concept' && session.conceptData && (
                            <motion.div
                                key="concept"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ConceptView
                                    conceptData={session.conceptData}
                                    onContinue={handleContinueToQuiz}
                                />
                            </motion.div>
                        )}

                        {/* Phase 2: Quiz */}
                        {session.phase === 'quiz' && session.quizQuestions.length > 0 && (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <QuizView
                                    questions={session.quizQuestions}
                                    answers={session.quizAnswers}
                                    onAnswerSelect={submitQuizAnswer}
                                    onSubmit={handleQuizSubmit}
                                />
                            </motion.div>
                        )}

                        {/* Phase 3: Logic */}
                        {session.phase === 'logic' && (
                            <motion.div
                                key="logic"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <LogicView
                                    currentLogic={session.logicSubmission}
                                    validation={session.logicValidation}
                                    onLogicChange={setLogicSubmission}
                                    onValidate={handleValidateLogic}
                                    onContinue={handleContinueToCode}
                                    isValidating={isLoading}
                                />
                            </motion.div>
                        )}

                        {/* Phase 4: Code */}
                        {session.phase === 'code' && (
                            <motion.div
                                key="code"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CodeView
                                    currentCode={session.codeSubmission}
                                    evaluation={session.codeEvaluation}
                                    onCodeChange={setCodeSubmission}
                                    onSubmit={handleEvaluateCode}
                                    onComplete={handleCompleteSession}
                                    isEvaluating={isLoading}
                                    onAskQuestion={handleAskQuestion}
                                    onTryAnother={handleTryAnother}
                                    onHome={resetSession}
                                />
                            </motion.div>
                        )}

                        {/* Success Screen */}
                        {session.phase === 'success' && session.completedAt && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5 }}
                            >
                                <SuccessView
                                    topic={session.topic}
                                    quizScore={session.quizScore}
                                    totalQuestions={session.quizQuestions.length}
                                    onTryAnother={handleTryAnother}
                                    startedAt={session.startedAt}
                                    completedAt={session.completedAt}
                                    onAskQuestion={handleAskQuestion}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ErrorBoundary>
            </main>
        </div >
    );
};

export default TutorPage;

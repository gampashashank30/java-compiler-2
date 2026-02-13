
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, TrendingDown, Target, HelpCircle, RotateCcw, Calendar, Award } from "lucide-react";
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { getAnalytics, resetAllMistakes } from "@/utils/mistakeTracker";
import { toast } from "sonner";
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#a855f7', '#f97316', '#ef4444'];

const MistakesDashboard = () => {
    const [analytics, setAnalytics] = useState<any>(null);

    const loadData = () => {
        setAnalytics(getAnalytics());
    };

    useEffect(() => {
        loadData();
        // Listen for updates
        const handler = () => loadData();
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const handleReset = () => {
        if (confirm("Are you sure you want to reset all tracking data?")) {
            resetAllMistakes();
            toast.success("Tracker reset successfully");
        }
    };

    if (!analytics) return <div className="p-8 text-center">Loading analytics...</div>;

    const { topMistakes, history, streak, totalRuns, totalSuccesses } = analytics;

    // Calculate Success Rate
    const successRate = totalRuns > 0 ? Math.round((totalSuccesses / totalRuns) * 100) : 0;

    // Prepare Pie Data
    const pieData = topMistakes.slice(0, 5).map((m: any) => ({
        name: m.label || m.id,
        value: m.count
    }));

    // Prepare Line Chart Data (Last 14 days)
    const chartData = history.slice(-14).map((h: any) => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        mistakes: h.mistakes,
        runs: h.runs
    }));

    const isEmpty = totalRuns === 0;

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-primary/10 p-6 rounded-full mb-6">
                    <Target className="h-16 w-16 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to Start Learning?</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Start coding in the compiler! We'll track your progress, identify common mistakes, and help you improve with detailed analytics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl bg-muted/30 p-6 rounded-xl border border-dashed border-border">
                    <div className="flex flex-col items-center gap-2">
                        <Zap className="h-8 w-8 text-yellow-500" />
                        <span className="font-semibold">Track Streaks</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <TrendingDown className="h-8 w-8 text-green-500" />
                        <span className="font-semibold">Reduce Errors</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Trophy className="h-8 w-8 text-purple-500" />
                        <span className="font-semibold">Earn Badges</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-yellow-500 bg-gradient-to-br from-card to-yellow-500/5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Daily Streak</p>
                            <h3 className="text-2xl font-bold mt-1 flex items-center gap-2">
                                {streak.current} <span className="text-sm font-normal text-muted-foreground">days</span>
                            </h3>
                        </div>
                        <div className="p-2 bg-yellow-500/10 rounded-full">
                            <Zap className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Best: <span className="font-semibold">{streak.max} days</span>
                    </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-green-500 bg-gradient-to-br from-card to-green-500/5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Success Rate</p>
                            <h3 className="text-2xl font-bold mt-1">{successRate}%</h3>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <Target className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <Progress value={successRate} className="h-1.5 mt-3 bg-green-100" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {totalSuccesses} successful runs
                    </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-blue-500/5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Runs</p>
                            <h3 className="text-2xl font-bold mt-1">{totalRuns}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                        Keep coding every day!
                    </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-purple-500 bg-gradient-to-br from-card to-purple-500/5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Accuracy Level</p>
                            <h3 className="text-2xl font-bold mt-1">
                                {successRate > 80 ? 'Master' : successRate > 50 ? 'Apprentice' : 'Novice'}
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-full">
                            <Trophy className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                        based on overall success
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content: Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress & Goals Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Option 4: Circular Progress Rings (Apple Watch style) */}
                        <Card className="p-6 border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500" />
                            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 w-full">
                                <Target className="h-5 w-5 text-primary" />
                                Weekly Goals
                            </h3>

                            {/* Dynamic Data Calculation */}
                            {(() => {
                                // 1. Calculate Stats for Last 7 Days
                                const today = new Date();
                                const last7DaysStats = history.filter((h: any) => {
                                    const d = new Date(h.date);
                                    const diffTime = Math.abs(today.getTime() - d.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays <= 7;
                                });

                                const daysPracticed = last7DaysStats.length;
                                const weeklyRuns = last7DaysStats.reduce((acc: number, cur: any) => acc + cur.runs, 0);
                                const weeklySuccesses = last7DaysStats.reduce((acc: number, cur: any) => acc + cur.successes, 0);

                                const weeklySuccessRate = weeklyRuns > 0 ? Math.round((weeklySuccesses / weeklyRuns) * 100) : 0;

                                // Goals
                                const GOAL_DAYS = 5;
                                const GOAL_SUCCESS_RATE = 80; // 80% success
                                const GOAL_RUNS = 10;

                                // Progress (0-1)
                                const progDays = Math.min(daysPracticed / GOAL_DAYS, 1);
                                const progSuccess = Math.min(weeklySuccessRate / GOAL_SUCCESS_RATE, 1);
                                const progRuns = Math.min(weeklySuccesses / GOAL_RUNS, 1);

                                // Grade Calculation
                                const averageProgress = (progDays + progSuccess + progRuns) / 3;
                                let grade = 'C';
                                if (averageProgress >= 0.9) grade = 'A+';
                                else if (averageProgress >= 0.8) grade = 'A';
                                else if (averageProgress >= 0.6) grade = 'B';
                                else if (averageProgress >= 0.4) grade = 'C';
                                else grade = 'D';

                                return (
                                    <>
                                        {/* Rings Container */}
                                        <div className="relative w-48 h-48 flex items-center justify-center">
                                            {/* Backing Circles */}
                                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                {/* Outer Ring Background (Days) */}
                                                <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
                                                {/* Middle Ring Background (Success Rate) */}
                                                <circle cx="96" cy="96" r="68" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
                                                {/* Inner Ring Background (Total Successes) */}
                                                <circle cx="96" cy="96" r="48" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />

                                                {/* Active Rings */}
                                                {/* Outer: Days Practiced */}
                                                <circle
                                                    cx="96" cy="96" r="88" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round"
                                                    strokeDasharray={`${progDays * 552} 552`} className="transition-all duration-1000 ease-out"
                                                />
                                                {/* Middle: Success Rate */}
                                                <circle
                                                    cx="96" cy="96" r="68" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round"
                                                    strokeDasharray={`${progSuccess * 427} 427`} className="transition-all duration-1000 ease-out delay-150"
                                                />
                                                {/* Inner: Total Successes */}
                                                <circle
                                                    cx="96" cy="96" r="48" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round"
                                                    strokeDasharray={`${progRuns * 301} 301`} className="transition-all duration-1000 ease-out delay-300"
                                                />
                                            </svg>

                                            {/* Center Stats */}
                                            <div className="text-center z-10">
                                                <span className="text-3xl font-bold">{grade}</span>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Grade</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-2 w-full">
                                            <div className="flex items-center text-xs justify-between">
                                                <span className="flex items-center gap-2" title={`Goal: ${GOAL_DAYS} Days`}><div className="w-2 h-2 rounded-full bg-red-500" /> Days Practiced</span>
                                                <span className="font-mono">{daysPracticed}/{GOAL_DAYS}</span>
                                            </div>
                                            <div className="flex items-center text-xs justify-between">
                                                <span className="flex items-center gap-2" title={`Goal: >${GOAL_SUCCESS_RATE}%`}><div className="w-2 h-2 rounded-full bg-green-500" /> Success Rate</span>
                                                <span className="font-mono">{weeklySuccessRate}%</span>
                                            </div>
                                            <div className="flex items-center text-xs justify-between">
                                                <span className="flex items-center gap-2" title={`Goal: ${GOAL_RUNS} Runs`}><div className="w-2 h-2 rounded-full bg-blue-500" /> Successful Runs</span>
                                                <span className="font-mono">{weeklySuccesses}/{GOAL_RUNS}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </Card>

                        {/* Option 1: Calendar Heatmap */}
                        <Card className="p-6 border-border/50 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-orange-500" />
                                    Activity History
                                </h3>
                                <Badge variant="outline" className="gap-1">
                                    <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    {streak.current} Day Streak
                                </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">Last 14 days of coding activity</p>

                            {/* Week Labels - Show "Last Week" and "This Week" */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                <div className="col-span-7 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                                    <span>Last Week</span>
                                    <span>This Week</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {/* Mock Data generation for previous days + real history */}
                                {Array.from({ length: 14 }).map((_, i) => {
                                    // Generate dates relative to today
                                    const d = new Date();
                                    d.setDate(d.getDate() - (13 - i)); // 13 days ago to today
                                    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    const isoDate = d.toISOString().split('T')[0];

                                    // Find data for this date
                                    const dayStat = history.find((h: any) => h.date === isoDate);
                                    const count = dayStat ? dayStat.mistakes : 0;
                                    const runs = dayStat ? dayStat.runs : 0;
                                    const hasActivity = runs > 0;

                                    // Determine color
                                    let bgClass = "bg-slate-700/40 dark:bg-slate-800/60 border-slate-600/50 dark:border-slate-700"; // Empty
                                    if (hasActivity) {
                                        if (count === 0) bgClass = "bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-500/20";
                                        else if (count <= 2) bgClass = "bg-emerald-400 border-emerald-500";
                                        else if (count <= 5) bgClass = "bg-yellow-400 border-yellow-500";
                                        else if (count <= 8) bgClass = "bg-orange-400 border-orange-500";
                                        else bgClass = "bg-red-400 border-red-500";
                                    }

                                    return (
                                        <TooltipProvider key={i}>
                                            <UITooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`
                                                            aspect-square rounded-md border-2 ${bgClass} 
                                                            transition-all duration-200 hover:scale-110 hover:shadow-md cursor-help
                                                        `}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold">{dateStr}</p>
                                                    {hasActivity ? (
                                                        <>
                                                            <p className="text-xs">{count} mistakes</p>
                                                            <p className="text-xs text-muted-foreground">{runs} runs</p>
                                                            {count === 0 && <p className="text-xs font-bold text-emerald-500 mt-1">Perfect Day! 🌟</p>}
                                                        </>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">No practice</p>
                                                    )}
                                                </TooltipContent>
                                            </UITooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-4 mt-6 text-[10px] text-muted-foreground justify-end">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded bg-emerald-500" />
                                    <div className="w-3 h-3 rounded bg-yellow-400" />
                                    <div className="w-3 h-3 rounded bg-orange-400" />
                                    <div className="w-3 h-3 rounded bg-red-400" />
                                </div>
                                <span>More Mistakes</span>
                            </div>
                        </Card>
                    </div>

                    {/* Top Mistakes Leaderboard */}
                    <Card className="p-6 border-border/50">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    <Award className="h-6 w-6 text-orange-500" />
                                    Common Mistakes To Avoid
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">Focus on fixing these frequently occurring errors</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topMistakes.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                                    <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>No specific mistakes recorded yet.</p>
                                    <p className="text-sm mt-1">Start coding to track your progress!</p>
                                </div>
                            ) : (
                                topMistakes.slice(0, 6).map((m: any, idx: number) => {
                                    // Determine styling based on mistake type
                                    let colorClass = "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
                                    let charDisplay = m.id;

                                    if (m.id.includes(';')) {
                                        colorClass = "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 shadow-amber-500/10";
                                        charDisplay = ";";
                                    } else if (m.id.includes(')') || m.id.includes('(')) {
                                        colorClass = "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 shadow-violet-500/10";
                                    } else if (m.id.includes('}') || m.id.includes('{')) {
                                        colorClass = "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-blue-500/10";
                                    } else if (m.id.includes('"')) {
                                        colorClass = "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-emerald-500/10";
                                        charDisplay = '""';
                                    } else if (m.id === 'general_error') {
                                        colorClass = "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 shadow-gray-500/10";
                                        charDisplay = "?";
                                    }

                                    // Rank Badge Colors
                                    let rankColor = "bg-muted text-muted-foreground";
                                    if (idx === 0) rankColor = "bg-yellow-500 text-white shadow-yellow-200";
                                    if (idx === 1) rankColor = "bg-slate-400 text-white shadow-slate-200";
                                    if (idx === 2) rankColor = "bg-orange-400 text-white shadow-orange-200";

                                    return (
                                        <div
                                            key={idx}
                                            className="group relative bg-card hover:bg-muted/30 p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                                        >
                                            {/* Rank Badge */}
                                            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold ${rankColor} shadow-sm`}>
                                                #{idx + 1}
                                            </div>

                                            <div className="flex gap-4 items-start pt-2">
                                                {/* Left: Character Badge */}
                                                <div className={`
                                                    h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center 
                                                    text-3xl font-mono font-bold border-2 shadow-lg mb-2 ${colorClass}
                                                    group-hover:scale-105 transition-transform duration-300
                                                `}>
                                                    {charDisplay}
                                                </div>

                                                {/* Right: Info */}
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <div>
                                                        <h4 className="font-semibold text-foreground truncate">{m.label || `Missing '${m.id}'`}</h4>
                                                        <p className="text-xs text-muted-foreground">Often missed in your code</p>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs font-medium">
                                                        <span className="text-muted-foreground">Frequency</span>
                                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                            {m.count} times
                                                        </span>
                                                    </div>

                                                    <div className="relative h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                            style={{ width: `${(m.count / Math.max(1, topMistakes[0].count)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar: Distribution & Insights */}
                <div className="space-y-6">
                    <Card className="p-6 border-border/50 flex flex-col items-center">
                        <h3 className="font-semibold text-lg mb-2 w-full text-left">Error Types</h3>
                        <div className="h-[200px] w-full relative">
                            {topMistakes.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                                    No Data
                                </div>
                            )}
                            {/* Center Text */}
                            {topMistakes.length > 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold">{pieData.reduce((a: any, b: any) => a + b.value, 0)}</span>
                                    <span className="text-xs text-muted-foreground">Total</span>
                                </div>
                            )}
                        </div>
                        <div className="w-full mt-4 space-y-2">
                            {topMistakes.slice(0, 4).map((m: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-muted-foreground truncate max-w-[120px]">{m.label || m.id}</span>
                                    </div>
                                    <span className="font-mono">{Math.round((m.count / pieData.reduce((a: any, b: any) => a + b.value, 0)) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>



                    <div className="text-center">
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Analytics
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MistakesDashboard;

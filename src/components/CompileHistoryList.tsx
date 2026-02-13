
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Calendar, Copy, ChevronDown, ChevronUp, Search, Trash2, MoreHorizontal, Filter, ArrowLeft, ArrowRight, Code } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompileJob {
    id: string;
    created_at: string;
    status: string;
    raw_compiler_output: string | null;
    run_output: string | null;
    code: string;
}

interface CompileHistoryListProps {
    history: CompileJob[];
    onClear: () => void;
}

const CodeBlock = ({ code }: { code: string }) => {
    // Simple syntax highlighting via regex splitting
    const parts = code.split(/(\b(?:int|return|void|char|if|else|for|while|printf|scanf|include|define|main)\b|"[^"]*"|\/\/.*|\b\d+\b)/g);

    return (
        <pre className="text-[13px] leading-relaxed font-mono overflow-x-auto whitespace-pre">
            {parts.map((part, i) => {
                if (/^(int|return|void|char|if|else|for|while|printf|scanf|include|define|main)$/.test(part)) return <span key={i} className="text-purple-600 dark:text-purple-400 font-bold">{part}</span>;
                if (/^".*"$/.test(part)) return <span key={i} className="text-green-600 dark:text-green-400">{part}</span>;
                if (/^\/\/.*$/.test(part)) return <span key={i} className="text-muted-foreground italic">{part}</span>;
                if (/^\d+$/.test(part)) return <span key={i} className="text-orange-500 dark:text-orange-400">{part}</span>;
                return <span key={i} className="text-foreground">{part}</span>;
            })}
        </pre>
    );
};

export const CompileHistoryList = ({ history, onClear }: CompileHistoryListProps) => {
    const navigate = useNavigate();

    const handleDeleteItem = (jobId: string) => {
        try {
            const existingHistory = JSON.parse(localStorage.getItem('compile_history') || '[]');
            const updatedHistory = existingHistory.filter((job: CompileJob) => job.id !== jobId);
            localStorage.setItem('compile_history', JSON.stringify(updatedHistory));
            window.dispatchEvent(new Event('storage')); // Trigger re-fetch
            toast.success("Item deleted");
        } catch (e) {
            console.error("Delete failed", e);
            toast.error("Failed to delete item");
        }
    };

    const handleLoadInEditor = (code: string) => {
        localStorage.setItem('editor_code', code);
        navigate('/app');
        toast.success("Code loaded in editor");
    };
    const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
    const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    // Filter & Sort Logic
    const filteredHistory = useMemo(() => {
        let data = [...history];

        if (filter !== 'all') {
            data = data.filter(job =>
                filter === 'success' ? job.status === 'done' : job.status !== 'done'
            );
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(job =>
                job.code.toLowerCase().includes(q) ||
                (job.run_output || "").toLowerCase().includes(q) ||
                (job.raw_compiler_output || "").toLowerCase().includes(q)
            );
        }

        if (sort === 'oldest') {
            data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else {
            // Default newest first (history is usually saved newest last? No, usually push adds to end. Arrays are index 0=oldest? 
            // Settings.tsx usually loads JSON.parse. 
            // We'll trust the date sort.
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return data;
    }, [history, filter, sort, searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const currentItems = filteredHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No compilation history yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Run some code in the compiler to start building your history.
            </p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search code or output..."
                        className="pl-9 bg-muted/30 border-border/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                        <SelectTrigger className="w-[120px] bg-muted/30 border-border/50">
                            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="error">Errors</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                        <SelectTrigger className="w-[140px] bg-muted/30 border-border/50">
                            <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>

                    {history.length > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto md:ml-2"
                            onClick={onClear}
                            title="Clear All History"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4 min-h-[400px]">
                {filteredHistory.length === 0 ? <EmptyState /> : (
                    currentItems.map((job, idx) => (
                        <HistoryCard
                            key={job.id}
                            job={job}
                            index={idx}
                            onCopy={() => handleCopy(job.code)}
                            onDelete={() => handleDeleteItem(job.id)}
                            onLoadInEditor={() => handleLoadInEditor(job.code)}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HistoryCard = ({ job, index, onCopy, onDelete, onLoadInEditor }: { job: CompileJob, index: number, onCopy: () => void, onDelete: () => void, onLoadInEditor: () => void }) => {
    const isSuccess = job.status === 'done';
    const [expandedError, setExpandedError] = useState(false);

    return (
        <Card
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px] border-border/60 bg-card animate-in slide-in-from-bottom-2 fade-in fill-mode-forwards"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border shadow-sm
                        ${isSuccess
                                ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-emerald-500/10'
                                : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 shadow-red-500/10'}
                    `}>
                            {isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            {isSuccess ? 'Success' : 'Error'}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                            onClick={onLoadInEditor}
                        >
                            <Code className="h-4 w-4 mr-2" />
                            Load in Editor
                        </Button>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(job.created_at).toLocaleString(undefined, {
                                month: 'numeric', day: 'numeric', year: 'numeric',
                                hour: 'numeric', minute: '2-digit', second: '2-digit'
                            })}
                        </div>

                        {/* Hover Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onCopy}>
                                    <Copy className="h-4 w-4 mr-2" /> Copy Code
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Code Section */}
                <div className="space-y-4">
                    <div className="relative group/code">
                        <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                            <Button size="icon" variant="secondary" className="h-7 w-7 bg-card shadow-sm border" onClick={onCopy}>
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div className="bg-muted/30 border border-border rounded-lg p-3 max-h-[180px] overflow-y-auto custom-scrollbar">
                            <CodeBlock code={job.code} />
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-1">
                        <h5 className="text-[13px] font-semibold text-foreground ml-1">Output:</h5>
                        {isSuccess ? (
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-3 text-[13px] font-mono text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                                <div className="whitespace-pre-wrap break-all">
                                    {job.run_output || "No output"}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-3 text-[13px] font-mono text-red-800 dark:text-red-300 flex items-start gap-2">
                                    <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                                    <div className="whitespace-pre-wrap break-all line-clamp-2">
                                        {job.raw_compiler_output || "Compilation failed"}
                                    </div>
                                </div>

                                {/* Expandable Error Details */}
                                {job.raw_compiler_output && job.raw_compiler_output.length > 50 && (
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 pl-2"
                                            onClick={() => setExpandedError(!expandedError)}
                                        >
                                            {expandedError ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                                            {expandedError ? 'Hide Details' : 'View Error Details'}
                                        </Button>

                                        {expandedError && (
                                            <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 p-3 rounded-r-lg animate-in slide-in-from-top-1 fade-in duration-200">
                                                <p className="text-xs font-mono text-amber-900 dark:text-amber-200 whitespace-pre-wrap">
                                                    {job.raw_compiler_output}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

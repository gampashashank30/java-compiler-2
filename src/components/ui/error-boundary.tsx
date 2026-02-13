import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold">Something went wrong</h3>
                            <p className="text-sm opacity-90">{this.state.error?.message}</p>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

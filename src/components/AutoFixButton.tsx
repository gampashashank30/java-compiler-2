import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AutoFixButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: () => void;
    isLoading?: boolean;
}

const AutoFixButton = ({ onClick, isLoading, className, ...props }: AutoFixButtonProps) => {
    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            className={`
        bg-gradient-to-r from-violet-600 to-indigo-600 
        hover:from-violet-700 hover:to-indigo-700 
        text-white shadow-lg shadow-indigo-500/20 
        rounded-xl px-6 py-4 font-semibold 
        transition-all hover:scale-105 active:scale-95
        flex items-center gap-2
        ${className || ""}
      `}
            {...props}
        >
            <Sparkles className={`w-5 h-5 ${isLoading ? "animate-spin" : "animate-pulse"}`} />
            {isLoading ? "Fixing..." : "Auto Fix"}
        </Button>
    );
};

export default AutoFixButton;

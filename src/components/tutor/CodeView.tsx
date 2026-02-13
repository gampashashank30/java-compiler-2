import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CodeEvaluation } from '@/types/tutor';

interface Props {
    currentCode: string;
    evaluation?: CodeEvaluation;
    onCodeChange: (val: string) => void;
    onSubmit: () => void;
    onComplete: () => void;
    isEvaluating: boolean;
    onAskQuestion: (q: string) => Promise<string>;
    onTryAnother: () => void;
    onHome: () => void;
}

export const CodeView: React.FC<Props> = ({ currentCode, onCodeChange, onSubmit, onComplete, isEvaluating }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Code Phase</h2>
            <Textarea
                value={currentCode}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="Write your C code..."
                className="font-mono"
            />
            <Button onClick={onSubmit} disabled={isEvaluating}>Evaluate Code</Button>
            <Button onClick={onComplete}>Complete Session</Button>
        </div>
    );
};

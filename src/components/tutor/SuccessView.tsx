import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    topic: string;
    quizScore: number;
    totalQuestions: number;
    onTryAnother: () => void;
    startedAt: Date;
    completedAt: Date;
    onAskQuestion: (q: string) => Promise<string>;
}

export const SuccessView: React.FC<Props> = ({ topic, quizScore, totalQuestions, onTryAnother }) => {
    return (
        <div className="p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">🎉 Session Completed!</h2>
            <p>You mastered {topic}!</p>
            <p>Quiz Score: {quizScore}/{totalQuestions}</p>
            <Button onClick={onTryAnother}>Try Another Topic</Button>
        </div>
    );
};

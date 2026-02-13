import React from 'react';
import { QuizQuestion } from '@/types/tutor';
import { Button } from '@/components/ui/button';

interface Props {
    questions: QuizQuestion[];
    answers: Record<number, number>;
    onAnswerSelect: (qId: number, optionId: number) => void;
    onSubmit: () => void;
}

export const QuizView: React.FC<Props> = ({ questions, answers, onAnswerSelect, onSubmit }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Quiz</h2>
            {questions.map((q, idx) => (
                <div key={idx} className="mb-4">
                    <p>{q.question}</p>
                    {/* Simplified options rendering */}
                    {q.options.map((opt, optIdx) => (
                        <div key={optIdx} onClick={() => onAnswerSelect(idx, optIdx)}>
                            {opt}
                        </div>
                    ))}
                </div>
            ))}
            <Button onClick={onSubmit}>Submit Quiz</Button>
        </div>
    );
};

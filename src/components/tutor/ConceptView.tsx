import React from 'react';
import { ConceptData } from '@/types/tutor';
import { Button } from '@/components/ui/button'; // Adjust path if needed

interface Props {
    conceptData: ConceptData;
    onContinue: () => void;
}

export const ConceptView: React.FC<Props> = ({ conceptData, onContinue }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">{conceptData.title || "Concept"}</h2>
            <p>{conceptData.explanation}</p>
            <Button onClick={onContinue}>Continue to Quiz</Button>
        </div>
    );
};

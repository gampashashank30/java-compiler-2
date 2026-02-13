import React from 'react';
import { TutorPhase } from '@/types/tutor';

interface Props {
    currentPhase: TutorPhase;
    onPhaseClick: (phase: string) => void;
}

export const ProgressTracker: React.FC<Props> = ({ currentPhase, onPhaseClick }) => {
    return (
        <div className="flex justify-between mb-8">
            <div className="font-bold">Current Phase: {currentPhase}</div>
        </div>
    );
};

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming textarea exists or will be created
import { LogicValidation } from '@/types/tutor';

interface Props {
    currentLogic: string;
    validation?: LogicValidation;
    onLogicChange: (val: string) => void;
    onValidate: () => void;
    onContinue: () => void;
    isValidating: boolean;
}

export const LogicView: React.FC<Props> = ({ currentLogic, onLogicChange, onValidate, onContinue, isValidating }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Logic Phase</h2>
            <Textarea
                value={currentLogic}
                onChange={(e) => onLogicChange(e.target.value)}
                placeholder="Describe your logic..."
            />
            <Button onClick={onValidate} disabled={isValidating}>Validate Logic</Button>
            <Button onClick={onContinue}>Continue to Code</Button>
        </div>
    );
};

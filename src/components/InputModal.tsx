
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputRequirement } from "@/utils/inputParser";
import { Play } from "lucide-react";

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    requirements: InputRequirement[];
    onSubmit: (inputs: string[]) => void;
}

const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, requirements, onSubmit }) => {
    const [values, setValues] = useState<Record<string, string>>({});

    // Initialize with default values when requirements change
    useEffect(() => {
        const initialValues: Record<string, string> = {};
        requirements.forEach(req => {
            initialValues[req.id] = req.defaultValue || "";
        });
        setValues(initialValues);
    }, [requirements]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert map to ordered list based on requirements order
        const orderedInputs = requirements.map(req => values[req.id] || "");
        onSubmit(orderedInputs);
    };

    const handleChange = (id: string, val: string) => {
        setValues(prev => ({ ...prev, [id]: val }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-emerald-400">
                        <Play className="w-5 h-5 fill-current" />
                        Program Inputs Required
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        This program requires {requirements.length} input{requirements.length > 1 ? 's' : ''}.
                        Please provide them below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {requirements.map((req, index) => (
                        <div key={req.id} className="grid w-full items-center gap-2">
                            <Label htmlFor={req.id} className="text-slate-300 font-medium text-sm flex justify-between">
                                <span>{req.label}</span>
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase">{req.type}</span>
                            </Label>
                            <Input
                                id={req.id}
                                value={values[req.id] || ""}
                                onChange={(e) => handleChange(req.id, e.target.value)}
                                placeholder={`Enter ${req.type}...`}
                                className="bg-slate-950 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-100 placeholder:text-slate-600"
                                autoFocus={index === 0}
                            />
                        </div>
                    ))}
                </form>

                <DialogFooter className="border-t border-slate-800 pt-3 mt-2">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-slate-800 text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-900/20">
                        Run Program
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InputModal;

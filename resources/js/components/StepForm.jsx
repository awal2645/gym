import React, { useState } from 'react';
import Button from './Button';

const steps = [
    {
        id: 1,
        question: 'What is your primary fitness goal?',
        options: [
            { value: 'weight_loss', label: 'Weight Loss' },
            { value: 'muscle_gain', label: 'Muscle Gain' },
            { value: 'endurance', label: 'Improve Endurance' },
            { value: 'general', label: 'General Fitness' },
        ],
    },
    {
        id: 2,
        question: 'What is your current fitness level?',
        options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
        ],
    },
    {
        id: 3,
        question: 'How many days per week can you commit?',
        options: [
            { value: '2-3', label: '2-3 days' },
            { value: '4-5', label: '4-5 days' },
            { value: '6-7', label: '6-7 days' },
        ],
    },
    {
        id: 4,
        question: 'Do you need nutrition guidance?',
        options: [
            { value: 'yes', label: 'Yes, I need meal plans' },
            { value: 'no', label: 'No, I have my own plan' },
        ],
    },
];

export default function StepForm({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [steps[currentStep].id]: value };
        setAnswers(newAnswers);

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Determine recommended plan
            const hasNutrition = newAnswers[4] === 'yes';
            const isAdvanced = newAnswers[2] === 'advanced';
            const recommendedPlan = hasNutrition || isAdvanced ? 2 : 1; // Premium or Basic
            onComplete(recommendedPlan);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">{steps[currentStep].question}</h2>

            <div className="space-y-3 mb-6">
                {steps[currentStep].options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {currentStep > 0 && (
                <Button variant="secondary" onClick={handleBack}>
                    Back
                </Button>
            )}
        </div>
    );
}

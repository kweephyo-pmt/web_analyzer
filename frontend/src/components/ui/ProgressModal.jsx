import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GlobeAltIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ArrowsRightLeftIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const ProgressModal = ({ analysisId, onComplete, onError }) => {
    const [progress, setProgress] = useState({
        current_step: 0,
        total_steps: 5,
        status: 'starting',
        message: 'Initializing analysis...',
        percentage: 0
    });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!analysisId) return;

        const token = localStorage.getItem('access_token');
        // EventSource doesn't support custom headers, so we pass token as query param
        const eventSource = new EventSource(
            `/api/progress/${analysisId}?token=${encodeURIComponent(token)}`
        );

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Progress update:', data);

                setProgress(data);

                // Handle completion
                if (data.status === 'complete') {
                    setTimeout(() => {
                        setIsVisible(false);
                        eventSource.close();
                        if (onComplete) onComplete();
                    }, 1500);
                }

                // Handle errors
                if (data.status === 'failed') {
                    setTimeout(() => {
                        eventSource.close();
                        if (onError) onError(data.message);
                    }, 2000);
                }
            } catch (error) {
                console.error('Error parsing progress data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [analysisId, onComplete, onError]);

    const steps = [
        { id: 1, label: 'Scraping', icon: GlobeAltIcon },
        { id: 2, label: 'Knowledge Graph', icon: ChartBarIcon },
        { id: 3, label: 'Topical Maps', icon: DocumentTextIcon },
        { id: 4, label: 'Comparison', icon: ArrowsRightLeftIcon },
        { id: 5, label: 'Finalizing', icon: CheckIcon }
    ];

    if (!isVisible) return null;

    const isComplete = progress.status === 'complete';
    const isFailed = progress.status === 'failed';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {isComplete ? 'Analysis Complete' : isFailed ? 'Analysis Failed' : 'Processing Analysis'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {progress.message}
                                </p>
                            </div>
                            {isComplete && (
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckIcon className="w-5 h-5 text-green-600" />
                                </div>
                            )}
                            {isFailed && (
                                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <XMarkIcon className="w-5 h-5 text-red-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 pb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-600">Progress</span>
                            <span className="text-xs font-semibold text-slate-900">{progress.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className={`h-full rounded-full ${isComplete ? 'bg-green-500' :
                                        isFailed ? 'bg-red-500' :
                                            'bg-blue-600'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="px-6 pb-6 space-y-2">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = step.id === progress.current_step;
                            const isStepComplete = step.id < progress.current_step || isComplete;
                            const isStepFailed = isFailed && step.id === progress.current_step;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3"
                                >
                                    {/* Step Indicator */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isStepComplete ? 'bg-green-500' :
                                                isActive ? 'bg-blue-600' :
                                                    isStepFailed ? 'bg-red-500' :
                                                        'bg-slate-200'
                                            }`}>
                                            {isStepComplete ? (
                                                <CheckIcon className="w-4 h-4 text-white" />
                                            ) : isStepFailed ? (
                                                <XMarkIcon className="w-4 h-4 text-white" />
                                            ) : (
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            )}
                                        </div>
                                        {isActive && !isStepFailed && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-blue-600"
                                                initial={{ scale: 1, opacity: 0.5 }}
                                                animate={{ scale: 1.4, opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                    </div>

                                    {/* Step Label */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium transition-colors ${isStepComplete ? 'text-slate-900' :
                                                isActive ? 'text-slate-900' :
                                                    isStepFailed ? 'text-red-600' :
                                                        'text-slate-400'
                                            }`}>
                                            {step.label}
                                        </p>
                                    </div>

                                    {/* Status Indicator */}
                                    {isActive && !isStepFailed && (
                                        <div className="flex gap-0.5">
                                            <motion.div
                                                className="w-1 h-1 bg-blue-600 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                            />
                                            <motion.div
                                                className="w-1 h-1 bg-blue-600 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="w-1 h-1 bg-blue-600 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer Message */}
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-green-50 border-t border-green-100 px-6 py-3"
                        >
                            <p className="text-sm text-green-800 text-center font-medium">
                                Redirecting to results...
                            </p>
                        </motion.div>
                    )}

                    {isFailed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 border-t border-red-100 px-6 py-3"
                        >
                            <p className="text-sm text-red-800 text-center">
                                {progress.message}
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProgressModal;

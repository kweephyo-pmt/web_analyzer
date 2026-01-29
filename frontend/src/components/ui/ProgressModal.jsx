import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GlobeAltIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ArrowsRightLeftIcon,
    CheckIcon,
    XMarkIcon,
    ClockIcon
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
    const [startTime] = useState(Date.now());
    const [estimatedTime, setEstimatedTime] = useState(null);

    useEffect(() => {
        if (!analysisId) return;

        const token = localStorage.getItem('access_token');
        const eventSource = new EventSource(
            `/api/progress/${analysisId}?token=${encodeURIComponent(token)}`
        );

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Progress update:', data);

                setProgress(data);

                // Calculate estimated time remaining
                if (data.current_step > 0 && data.current_step < data.total_steps) {
                    const elapsed = (Date.now() - startTime) / 1000; // seconds
                    const avgTimePerStep = elapsed / data.current_step;
                    const remainingSteps = data.total_steps - data.current_step;
                    const estimated = Math.ceil(avgTimePerStep * remainingSteps);
                    setEstimatedTime(estimated);
                }

                if (data.status === 'complete') {
                    setTimeout(() => {
                        setIsVisible(false);
                        eventSource.close();
                        if (onComplete) onComplete();
                    }, 1500);
                }

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
    }, [analysisId, onComplete, onError, startTime]);

    const steps = [
        {
            id: 1,
            label: 'Scraping',
            icon: GlobeAltIcon,
            description: 'Extracting website content'
        },
        {
            id: 2,
            label: 'Knowledge Graph',
            icon: ChartBarIcon,
            description: 'Building entity relationships'
        },
        {
            id: 3,
            label: 'Topical Maps',
            icon: DocumentTextIcon,
            description: 'Creating content strategy'
        },
        {
            id: 4,
            label: 'Comparison',
            icon: ArrowsRightLeftIcon,
            description: 'Analyzing competitors'
        },
        {
            id: 5,
            label: 'Finalizing',
            icon: CheckIcon,
            description: 'Saving results'
        }
    ];

    const formatTime = (seconds) => {
        if (!seconds) return '';
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (!isVisible) return null;

    const isComplete = progress.status === 'complete';
    const isFailed = progress.status === 'failed';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                    {isComplete ? 'Analysis Complete' : isFailed ? 'Analysis Failed' : 'Processing Analysis'}
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {progress.message}
                                </p>
                            </div>
                            {isComplete && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                                >
                                    <CheckIcon className="w-6 h-6 text-green-600" />
                                </motion.div>
                            )}
                            {isFailed && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
                                >
                                    <XMarkIcon className="w-6 h-6 text-red-600" />
                                </motion.div>
                            )}
                        </div>

                        {/* Time Estimate */}
                        {!isComplete && !isFailed && estimatedTime && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mt-3 text-xs text-slate-500"
                            >
                                <ClockIcon className="w-4 h-4" />
                                <span>Estimated time remaining: ~{formatTime(estimatedTime)}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 py-5 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-700">Progress</span>
                            <span className="text-sm font-bold text-blue-600">{progress.percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className={`h-full rounded-full relative ${isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                        isFailed ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                                            'bg-gradient-to-r from-blue-500 to-indigo-500'
                                    }`}
                            >
                                {/* Shimmer effect */}
                                {!isComplete && !isFailed && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                    />
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = step.id === progress.current_step;
                            const isStepComplete = step.id < progress.current_step || isComplete;
                            const isStepFailed = isFailed && step.id === progress.current_step;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
                                    className="flex items-start gap-3"
                                >
                                    {/* Step Indicator */}
                                    <div className="relative flex-shrink-0 pt-0.5">
                                        <motion.div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isStepComplete ? 'bg-green-500 shadow-lg shadow-green-500/30' :
                                                    isActive ? 'bg-blue-600 shadow-lg shadow-blue-600/30' :
                                                        isStepFailed ? 'bg-red-500 shadow-lg shadow-red-500/30' :
                                                            'bg-slate-200'
                                                }`}
                                            animate={isActive && !isStepFailed ? {
                                                scale: [1, 1.05, 1],
                                            } : {}}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            {isStepComplete ? (
                                                <CheckIcon className="w-5 h-5 text-white" />
                                            ) : isStepFailed ? (
                                                <XMarkIcon className="w-5 h-5 text-white" />
                                            ) : (
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            )}
                                        </motion.div>
                                        {isActive && !isStepFailed && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-blue-600"
                                                initial={{ scale: 1, opacity: 0.5 }}
                                                animate={{ scale: 1.6, opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className={`text-sm font-semibold transition-colors ${isStepComplete ? 'text-slate-900' :
                                                isActive ? 'text-slate-900' :
                                                    isStepFailed ? 'text-red-600' :
                                                        'text-slate-400'
                                            }`}>
                                            {step.label}
                                        </p>
                                        <p className={`text-xs mt-0.5 transition-colors ${isStepComplete ? 'text-slate-500' :
                                                isActive ? 'text-slate-600' :
                                                    isStepFailed ? 'text-red-500' :
                                                        'text-slate-400'
                                            }`}>
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Status Indicator */}
                                    {isActive && !isStepFailed && (
                                        <div className="flex gap-1 pt-2">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                />
                                            ))}
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
                            className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100 px-6 py-4"
                        >
                            <p className="text-sm text-green-800 text-center font-medium flex items-center justify-center gap-2">
                                <CheckIcon className="w-4 h-4" />
                                Redirecting to results...
                            </p>
                        </motion.div>
                    )}

                    {isFailed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-gradient-to-r from-red-50 to-rose-50 border-t border-red-100 px-6 py-4"
                        >
                            <p className="text-sm text-red-800 text-center flex items-center justify-center gap-2">
                                <XMarkIcon className="w-4 h-4" />
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

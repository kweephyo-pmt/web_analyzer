import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
    ClockIcon,
    GlobeAltIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const History = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, analysisId: null });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('/api/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalyses(response.data.analyses || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            toast.error('Failed to load history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (analysisId) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`/api/analysis/${analysisId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Analysis deleted successfully');
            // Refresh the list
            fetchHistory();
        } catch (error) {
            console.error('Failed to delete analysis:', error);
            toast.error('Failed to delete analysis');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge color="green" className="flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        Completed
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge color="blue" className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4 animate-spin" />
                        Processing
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge color="red" className="flex items-center gap-1">
                        <ExclamationCircleIcon className="w-4 h-4" />
                        Failed
                    </Badge>
                );
            default:
                return <Badge color="gray">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium text-lg">Loading analysis history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Analysis History
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600">
                                View and manage your past website analyses
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gradient-to-r from-primary-600 to-purple-600"
                        >
                            <ChartBarIcon className="w-5 h-5 mr-2" />
                            New Analysis
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <ChartBarIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-900">{analyses.length}</div>
                                    <div className="text-sm text-blue-700">Total Analyses</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-900">
                                        {analyses.filter(a => a.status === 'completed').length}
                                    </div>
                                    <div className="text-sm text-green-700">Completed</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <GlobeAltIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-900">
                                        {analyses.reduce((sum, a) => sum + a.urls.length, 0)}
                                    </div>
                                    <div className="text-sm text-purple-700">URLs Analyzed</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>

                {/* Analysis List */}
                {analyses.length === 0 ? (
                    <Card className="text-center py-16">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClockIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-900">No analyses yet</h3>
                        <p className="text-slate-600 mb-6">Start your first website analysis to see results here</p>
                        <Button onClick={() => navigate('/dashboard')}>
                            Start Analyzing
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {analyses.map((analysis, index) => (
                            <motion.div
                                key={analysis.analysis_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-xl transition-all duration-300 border-2 border-slate-200 hover:border-primary-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                    <GlobeAltIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-900">
                                                            {analysis.urls.length} Website{analysis.urls.length > 1 ? 's' : ''}
                                                        </span>
                                                        {getStatusBadge(analysis.status)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <ClockIcon className="w-4 h-4" />
                                                        {formatDate(analysis.created_at)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* URLs */}
                                            <div className="space-y-2 ml-13 pl-1">
                                                {analysis.urls.map((url, urlIndex) => (
                                                    <div
                                                        key={urlIndex}
                                                        className="text-sm flex items-center gap-2 group"
                                                    >
                                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0"></div>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 hover:text-primary-700 hover:underline truncate transition-colors"
                                                        >
                                                            {url}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-4">
                                            {analysis.status === 'completed' && (
                                                <Button
                                                    onClick={() => navigate(`/results/${analysis.analysis_id}`)}
                                                    variant="primary"
                                                >
                                                    View Results
                                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                            {analysis.status === 'processing' && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigate(`/results/${analysis.analysis_id}`)}
                                                >
                                                    Check Status
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={() => setDeleteDialog({ isOpen: true, analysisId: analysis.analysis_id })}
                                                className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, analysisId: null })}
                onConfirm={() => handleDelete(deleteDialog.analysisId)}
                title="Delete Analysis?"
                message="Are you sure you want to delete this analysis? This action cannot be undone and all associated data will be permanently removed."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default History;

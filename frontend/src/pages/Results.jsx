import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import KnowledgeGraph from '../components/visualizations/KnowledgeGraph';
import TopicalMap from '../components/visualizations/TopicalMap';
import Comparison from '../components/visualizations/Comparison';
import {
    ChartBarIcon,
    GlobeAltIcon,
    ScaleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Results = () => {
    const { analysisId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, [analysisId]);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem('access_token');

            // First check if analysis is complete
            const statusRes = await axios.get(`/api/results/${analysisId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If still processing, poll every 2 seconds
            if (statusRes.data.status === 'processing') {
                setTimeout(fetchResults, 2000);
                return;
            }

            // If failed, show error
            if (statusRes.data.status === 'failed') {
                toast.error('Analysis failed: ' + (statusRes.data.error || 'Unknown error'));
                navigate('/dashboard');
                return;
            }

            // Fetch all data
            const [kgRes, topicalRes, comparisonRes] = await Promise.all([
                axios.get(`/api/knowledge-graph/${analysisId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`/api/topical-map/${analysisId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`/api/compare/${analysisId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: { status: 'not_applicable' } })),
            ]);

            // Check if data is still processing
            if (kgRes.data.status === 'processing' || topicalRes.data.status === 'processing') {
                setTimeout(fetchResults, 2000);
                return;
            }

            // Handle comparison data - it might have a status or actual comparison data
            let comparisonData = null;
            if (comparisonRes?.data) {
                if (comparisonRes.data.comparison) {
                    // Has actual comparison data
                    comparisonData = comparisonRes.data.comparison;
                } else if (comparisonRes.data.status) {
                    // Has status (processing, not_applicable, etc.)
                    comparisonData = comparisonRes.data;
                }
            }

            console.log('Setting results with comparison:', comparisonData);

            setResults({
                full: statusRes.data,
                knowledgeGraph: kgRes.data.knowledge_graph,
                topicalMaps: topicalRes.data.topical_maps,
                comparison: comparisonData,
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch results:', error);
            toast.error('Failed to load results');
            navigate('/dashboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-slate-200 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 border-r-purple-600"></div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                        Analyzing Your Websites
                    </h2>
                    <p className="text-slate-600 text-lg mb-2">AI is generating comprehensive insights...</p>
                    <p className="text-slate-500 text-sm">This may take 10-30 seconds</p>

                    <div className="mt-8 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!results) {
        return null;
    }

    const tabs = [
        {
            label: 'Knowledge Graph',
            icon: <ChartBarIcon className="w-5 h-5" />,
            content: <KnowledgeGraph graphData={results.knowledgeGraph} />
        },
        {
            label: 'Topical Map',
            icon: <GlobeAltIcon className="w-5 h-5" />,
            content: <TopicalMap topicalMaps={results.topicalMaps} />
        },
    ];

    if (results.comparison) {
        tabs.push({
            label: 'Comparison',
            icon: <ScaleIcon className="w-5 h-5" />,
            content: <Comparison comparisonData={results.comparison} />
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header Section */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                            className="mb-4 hover:bg-white/80 transition-all"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>

                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                                    Analysis Results
                                </h1>
                                <p className="text-slate-600 text-lg">
                                    Comprehensive semantic analysis powered by AI
                                </p>
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => navigate('/dashboard')}
                                className="shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
                            >
                                <span className="text-lg">+</span> New Analysis
                            </Button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card variant="glass" className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Websites Analyzed</p>
                                        <p className="text-2xl font-bold text-blue-900">{results.full.urls.length}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="glass" className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <ChartBarIcon className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Total Insights</p>
                                        <p className="text-2xl font-bold text-purple-900">
                                            {results.knowledgeGraph?.nodes?.length || 0}+
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="glass" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Status</p>
                                        <p className="text-2xl font-bold text-green-900">Complete</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* URLs Section */}
                    <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg">
                                <GlobeAltIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Analyzed URLs</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {results.full.urls.map((url, index) => {
                                const domain = new URL(url).hostname.replace('www.', '');
                                return (
                                    <div
                                        key={index}
                                        className="group flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 hover:from-blue-50 hover:to-purple-50/50 rounded-lg border border-slate-200 hover:border-primary-300 transition-all duration-300"
                                    >
                                        <div className="flex-none w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-primary-300 group-hover:shadow-sm transition-all">
                                            <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500 font-medium mb-1">{domain}</p>
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary-600 hover:text-primary-700 font-medium truncate block group-hover:underline"
                                            >
                                                {url}
                                            </a>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Tabs Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <Tabs tabs={tabs} layoutId="results-tabs" />
                    </div>

                    {/* Footer Badge */}
                    <div className="mt-8 flex items-center justify-center">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-full border border-purple-100 shadow-sm">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-inner">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-sm">
                                <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI-Powered Analysis</span>
                                <span className="text-slate-600 mx-2">•</span>
                                <span className="text-slate-600">Generated with Groq & DeepSeek</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Results;

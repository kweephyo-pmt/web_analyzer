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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-lg font-medium">Analyzing your websites...</p>
                    <p className="text-slate-500 text-sm mt-2">This may take 10-30 seconds</p>
                </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                            className="mb-2"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold">Analysis Results</h1>
                        <p className="text-slate-600 mt-1">
                            {results.full.urls.length} {results.full.urls.length === 1 ? 'website' : 'websites'} analyzed
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard')}
                    >
                        + New Analysis
                    </Button>
                </div>

                {/* URLs Analyzed */}
                <Card className="mb-6">
                    <h3 className="font-semibold mb-3">Analyzed URLs</h3>
                    <div className="space-y-2">
                        {results.full.urls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <GlobeAltIcon className="w-4 h-4 text-primary-600" />
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:underline"
                                >
                                    {url}
                                </a>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Tabs */}
                <Tabs tabs={tabs} layoutId="results-tabs" />
            </motion.div>
        </div>
    );
};

export default Results;

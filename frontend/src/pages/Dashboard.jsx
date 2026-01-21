import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GSCPropertySelector from '../components/gsc/GSCPropertySelector';
import {
    PlusIcon,
    XMarkIcon,
    GlobeAltIcon,
    SparklesIcon,
    RocketLaunchIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const [urls, setUrls] = useState(['']);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [useGSC, setUseGSC] = useState(true);
    const [selectedProperties, setSelectedProperties] = useState([]);

    const addUrlField = () => {
        if (urls.length < 5) {
            setUrls([...urls, '']);
        }
    };

    const removeUrlField = (index) => {
        if (urls.length > 1) {
            setUrls(urls.filter((_, i) => i !== index));
        }
    };

    const updateUrl = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const handleAnalyze = async () => {
        let validUrls = [];

        if (useGSC) {
            // Use selected GSC properties
            if (selectedProperties.length === 0) {
                toast.error('Please select at least one property');
                return;
            }
            validUrls = selectedProperties.map(p => p.url);
        } else {
            // Use manual URL entry
            validUrls = urls.filter(url => url.trim() !== '');

            if (validUrls.length === 0) {
                toast.error('Please enter at least one URL');
                return;
            }

            // Validate URLs
            const urlPattern = /^https?:\/\/.+/;
            const invalidUrls = validUrls.filter(url => !urlPattern.test(url));
            if (invalidUrls.length > 0) {
                toast.error('Please enter valid URLs starting with http:// or https://');
                return;
            }
        }

        setIsAnalyzing(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post('/api/analyze',
                { urls: validUrls },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Analysis started! Redirecting to results...');
            navigate(`/results/${response.data.analysis_id}`);
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error(error.response?.data?.detail || 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-full mb-6"
                    >
                        <SparklesIcon className="w-4 h-4 text-primary-600 animate-pulse" />
                        <span className="text-sm font-semibold text-primary-700">AI-Powered Analysis Engine</span>
                    </motion.div>

                    {/* Main Headline */}
                    <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
                        <span className="block bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Unlock Website Intelligence
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Analyze multiple websites simultaneously and extract comprehensive business insights with cutting-edge AI
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="relative overflow-hidden border-2 border-slate-200 shadow-2xl">
                            {/* Gradient overlay */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

                            <div className="space-y-6 p-8">
                                {/* Mode Toggle */}
                                <div className="flex items-center justify-center gap-4 pb-6 border-b-2 border-slate-200">
                                    <Button
                                        variant={useGSC ? "primary" : "outline"}
                                        size="md"
                                        onClick={() => setUseGSC(true)}
                                        className="flex-1"
                                    >
                                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                                        Search Console
                                    </Button>
                                    <ArrowsRightLeftIcon className="w-5 h-5 text-slate-400" />
                                    <Button
                                        variant={!useGSC ? "primary" : "outline"}
                                        size="md"
                                        onClick={() => setUseGSC(false)}
                                        className="flex-1"
                                    >
                                        <GlobeAltIcon className="w-5 h-5 mr-2" />
                                        Manual Entry
                                    </Button>
                                </div>

                                {useGSC ? (
                                    /* Google Search Console Property Selector */
                                    <GSCPropertySelector
                                        selectedProperties={selectedProperties}
                                        onPropertySelect={setSelectedProperties}
                                    />
                                ) : (
                                    <>
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <GlobeAltIcon className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-900">Website URLs</h2>
                                                    <p className="text-sm text-slate-500">Enter up to 5 websites to analyze</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-200">
                                                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                                    {urls.filter(u => u.trim()).length}/{urls.length}
                                                </span>
                                            </div>
                                        </div>

                                        {/* URL Inputs */}
                                        <div className="space-y-4">
                                            {urls.map((url, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 + index * 0.05 }}
                                                    className="group relative"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="flex-none w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-600 group-hover:from-primary-100 group-hover:to-purple-100 group-hover:text-primary-600 transition-all">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 relative">
                                                            <Input
                                                                value={url}
                                                                onChange={(e) => updateUrl(index, e.target.value)}
                                                                placeholder={`https://example${index > 0 ? index + 1 : ''}.com`}
                                                                leftIcon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />}
                                                                className="pr-12 border-2 focus:border-primary-500 transition-all"
                                                            />
                                                            {url && (
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {urls.length > 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="md"
                                                                onClick={() => removeUrlField(index)}
                                                                className="hover:bg-red-50 hover:text-red-600 transition-all"
                                                            >
                                                                <XMarkIcon className="w-5 h-5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Add URL Button */}
                                        {urls.length < 5 && (
                                            <Button
                                                variant="outline"
                                                onClick={addUrlField}
                                                className="w-full border-2 border-dashed border-slate-300 hover:border-primary-500 hover:bg-primary-50 transition-all py-4"
                                            >
                                                <PlusIcon className="w-5 h-5 mr-2" />
                                                Add Another Website
                                            </Button>
                                        )}

                                    </>
                                )}

                                {/* Analyze Button - Common for both modes */}
                                <div className="pt-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleAnalyze}
                                        isLoading={isAnalyzing}
                                        disabled={isAnalyzing || (useGSC && selectedProperties.length === 0) || (!useGSC && urls.filter(u => u.trim()).length === 0)}
                                        className="w-full bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 hover:from-primary-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl shadow-primary-500/50 text-lg py-6 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                        {isAnalyzing ? (
                                            <>
                                                <SparklesIcon className="w-6 h-6 mr-2 animate-spin" />
                                                Analyzing Websites...
                                            </>
                                        ) : (
                                            <>
                                                <RocketLaunchIcon className="w-6 h-6 mr-2" />
                                                Start AI Analysis
                                                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

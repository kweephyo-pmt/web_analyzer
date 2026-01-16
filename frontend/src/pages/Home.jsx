import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import {
    ChartBarIcon,
    GlobeAltIcon,
    LightBulbIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';

const Home = () => {
    const { user } = useAuth();

    const features = [
        {
            icon: <GlobeAltIcon className="w-7 h-7" />,
            title: 'Multi-URL Analysis',
            description: 'Analyze multiple websites simultaneously with AI-powered insights and competitive intelligence',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <ChartBarIcon className="w-7 h-7" />,
            title: 'Knowledge Graphs',
            description: 'Interactive visualizations revealing business entities, relationships, and semantic connections',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: <LightBulbIcon className="w-7 h-7" />,
            title: 'Topical Mapping',
            description: 'Deep semantic analysis with business insights, audience segmentation, and content strategy',
            color: 'from-amber-500 to-orange-500'
        },
        {
            icon: <SparklesIcon className="w-7 h-7" />,
            title: 'AI-Powered',
            description: 'GPT-4 and Claude powered analysis for accurate entity extraction and comprehensive insights',
            color: 'from-green-500 to-emerald-500'
        },
    ];

    const benefits = [
        'Real-time competitive analysis',
        'Semantic relationship mapping',
        'Business intelligence extraction',
        'Automated content strategy',
        'Query template generation',
        'Audience persona insights'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-28 sm:pt-32 sm:pb-40">
                {/* Animated background gradient */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-full mb-8"
                        >
                            <SparklesIcon className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-semibold text-primary-700">AI-Powered Website Intelligence</span>
                        </motion.div>

                        {/* Main Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                            <span className="block text-slate-900">Transform Websites Into</span>
                            <span className="block bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Actionable Insights
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                            Extract business intelligence, visualize knowledge graphs, and uncover competitive advantages with cutting-edge AI technology
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                <>
                                    <Link to="/dashboard">
                                        <Button size="lg" className="text-lg px-8 py-4 shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transition-all">
                                            <RocketLaunchIcon className="w-5 h-5 mr-2" />
                                            Go to Dashboard
                                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/history">
                                        <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                                            View History
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-slate-600 bg-white px-6 py-3 rounded-full shadow-md">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                        <span className="font-medium">Sign in with Google to get started</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                        >
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-900">5+</div>
                                <div className="text-sm text-slate-600 mt-1">URLs Analyzed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-900">AI</div>
                                <div className="text-sm text-slate-600 mt-1">Powered Models</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-900">Real-time</div>
                                <div className="text-sm text-slate-600 mt-1">Analysis</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
                            Powerful Features for
                            <span className="block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                Competitive Intelligence
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Everything you need to understand your competition and dominate your market
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-300"
                            >
                                {/* Gradient border on hover */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl`}></div>

                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6 text-slate-900">
                                Why Choose Our Platform?
                            </h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Get comprehensive insights that drive strategic decisions and competitive advantages
                            </p>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex-none w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                            <CheckCircleIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{benefit}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
                                <h3 className="text-2xl font-bold mb-4">Start Analyzing Today</h3>
                                <p className="text-white/90 mb-6">
                                    Join businesses using AI-powered insights to stay ahead of the competition
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>No credit card required</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>Instant results</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>Comprehensive reports</span>
                                    </li>
                                </ul>
                                {!user && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                        <p className="text-sm">Sign in with Google to begin</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-4 text-white">
                                Ready to Unlock Insights?
                            </h2>
                            <p className="text-xl text-slate-300 mb-8">
                                Start extracting competitive intelligence in seconds
                            </p>
                            {user ? (
                                <Link to="/dashboard">
                                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-4">
                                        <RocketLaunchIcon className="w-5 h-5 mr-2" />
                                        Launch Dashboard
                                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            ) : (
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
                                    <p className="text-white font-medium">Sign in with Google to begin your analysis</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;

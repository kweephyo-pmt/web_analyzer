import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoogleAuth from '../auth/GoogleAuth';
import { useAuth } from '../../context/AuthContext';
import {
    ChartBarIcon,
    ClockIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const Header = () => {
    const { user } = useAuth();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-primary-500/50">
                                <SparklesIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Web Analyzer
                            </span>
                            <span className="text-xs text-slate-500 font-medium">AI-Powered Insights</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    {user && (
                        <nav className="hidden md:flex items-center space-x-1">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all duration-200 group"
                            >
                                <ChartBarIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/history"
                                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all duration-200 group"
                            >
                                <ClockIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>History</span>
                            </Link>
                        </nav>
                    )}
                        <GoogleAuth />
                </div>
            </div>

            {/* Subtle bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
        </motion.header>
    );
};

export default Header;

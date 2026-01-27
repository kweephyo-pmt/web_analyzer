import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import {
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    LinkIcon,
    ShieldCheckIcon,
    DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const GSCPropertySelector = ({ onPropertySelect, selectedProperties = [] }) => {
    const navigate = useNavigate();
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [properties, setProperties] = useState([]);
    const [gscToken, setGscToken] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

    // Load Google Identity Services script
    useEffect(() => {
        // Check if script is already loaded
        if (window.google?.accounts?.oauth2) {
            setIsGoogleLoaded(true);
            return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setIsGoogleLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Google Identity Services');
            toast.error('Failed to load Google services');
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript && existingScript.parentNode) {
                existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, []);

    // Check if already connected on mount
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');

        if (accessToken) {
            // Check GSC connection status from backend
            checkGSCStatus();
        }
    }, []);

    // Monitor for user logout/login - clear GSC state when access token is removed
    useEffect(() => {
        const checkAuthStatus = () => {
            const accessToken = localStorage.getItem('access_token');
            const gscToken = localStorage.getItem('gsc_token');

            // If GSC is connected but user logged out, disconnect GSC
            if (gscToken && !accessToken && isConnected) {
                console.log('User logged out, clearing GSC connection');
                setIsConnected(false);
                setGscToken(null);
                setProperties([]);
                onPropertySelect([]);
            }
        };

        // Check immediately
        checkAuthStatus();

        // Set up interval to check periodically
        const interval = setInterval(checkAuthStatus, 1000);

        return () => clearInterval(interval);
    }, [isConnected, onPropertySelect]);

    const checkGSCStatus = async () => {
        setIsCheckingStatus(true);
        try {
            const authToken = localStorage.getItem('access_token');
            const response = await axios.get('/auth/gsc/properties', {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (response.data.properties) {
                setIsConnected(true);
                setProperties(response.data.properties);
            }
        } catch (error) {
            // Not connected or error - that's okay
            if (error.response?.status !== 404) {
                console.error('Error checking GSC status:', error);
            }
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const handleGoogleConnect = async () => {
        if (!isGoogleLoaded || !window.google?.accounts?.oauth2) {
            toast.error('Google services not loaded yet. Please try again in a moment.');
            return;
        }

        setIsConnecting(true);

        try {
            // Initialize Google OAuth with Search Console scope
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/webmasters.readonly',
                callback: async (response) => {
                    if (response.access_token) {
                        const token = response.access_token;

                        // Connect to backend - token is stored in database
                        try {
                            const authToken = localStorage.getItem('access_token');
                            await axios.post('/auth/gsc/connect',
                                { gsc_token: token },
                                { headers: { Authorization: `Bearer ${authToken}` } }
                            );

                            setIsConnected(true);
                            toast.success('Successfully connected to Google Search Console!');

                            // Fetch properties from backend
                            await fetchProperties();
                        } catch (error) {
                            console.error('Connection error:', error);
                            toast.error('Failed to connect to Search Console');
                        }
                    }
                    setIsConnecting(false);
                },
            });

            client.requestAccessToken();
        } catch (error) {
            console.error('OAuth error:', error);
            toast.error('Failed to initialize Google connection');
            setIsConnecting(false);
        }
    };

    const fetchProperties = async () => {
        setIsFetching(true);
        try {
            const authToken = localStorage.getItem('access_token');
            const response = await axios.get('/auth/gsc/properties', {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            console.log('GSC Properties Response:', response.data);
            setProperties(response.data.properties || []);

            if (!response.data.properties || response.data.properties.length === 0) {
                toast('No Search Console properties found. Make sure you have websites added to your Google Search Console account.', {
                    duration: 6000
                });
            }
        } catch (error) {
            console.error('Fetch properties error:', error);
            const errorMsg = error.response?.data?.detail || 'Failed to fetch properties';
            toast.error(errorMsg);
            setIsConnected(false);
        } finally {
            setIsFetching(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            const authToken = localStorage.getItem('access_token');
            await axios.post('/auth/gsc/disconnect', {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            setIsConnected(false);
            setGscToken(null);
            setProperties([]);
            onPropertySelect([]);
            toast.success('Disconnected from Google Search Console');
        } catch (error) {
            console.error('Disconnect error:', error);
            toast.error('Failed to disconnect');
        }
    };

    const handlePropertyToggle = (property) => {
        const isSelected = selectedProperties.some(p => p.url === property.url);

        if (isSelected) {
            // Deselect
            onPropertySelect(selectedProperties.filter(p => p.url !== property.url));
        } else {
            // Check limit before selecting
            if (selectedProperties.length >= 5) {
                toast.error('Maximum 5 properties can be selected');
                return;
            }
            onPropertySelect([...selectedProperties, property]);
        }
    };

    const handleSelectPages = (property, e) => {
        e.stopPropagation();
        navigate(`/select-pages?property=${encodeURIComponent(property.url)}`);
    };

    const filteredProperties = properties.filter(prop =>
        prop.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show loading state while checking connection
    if (isCheckingStatus) {
        return (
            <Card className="border-2 border-slate-200">
                <div className="p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-slate-200 rounded animate-pulse w-48"></div>
                            <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
                        </div>
                    </div>
                    <div className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
            </Card>
        );
    }

    if (!isConnected) {
        return (
            <Card className="border-2 border-dashed border-primary-300 bg-gradient-to-br from-primary-50 to-purple-50">
                <div className="text-center py-12 px-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <ShieldCheckIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        Connect Google Search Console
                    </h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        Connect your Google Search Console account to select properties instead of manually entering URLs
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGoogleConnect}
                        isLoading={isConnecting || !isGoogleLoaded}
                        disabled={isConnecting || !isGoogleLoaded}
                        className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-xl"
                    >
                        <LinkIcon className="w-5 h-5 mr-2" />
                        {!isGoogleLoaded ? 'Loading...' : isConnecting ? 'Connecting...' : 'Connect Search Console'}
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-primary-200">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Search Console Connected</h3>
                            <p className="text-sm text-slate-500">{properties.length} properties available</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchProperties()}
                            disabled={isFetching}
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDisconnect}
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all"
                    />
                </div>

                {/* Properties List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {isFetching ? (
                        <div className="text-center py-8">
                            <ArrowPathIcon className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
                            <p className="text-slate-600">Loading properties...</p>
                        </div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="text-center py-8">
                            <XCircleIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-600">No properties found</p>
                        </div>
                    ) : (
                        <>
                            {filteredProperties.map((property) => {
                                const isSelected = selectedProperties.some(p => p.url === property.url);

                                return (
                                    <div
                                        key={property.url}
                                        onClick={() => handlePropertyToggle(property)}
                                        className={`
                                            p-4 rounded-xl border-2 cursor-pointer transition-all
                                            ${isSelected
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`
                                                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                                    ${isSelected
                                                        ? 'bg-primary-500'
                                                        : 'bg-slate-200'
                                                    }
                                                `}>
                                                    {isSelected ? (
                                                        <CheckCircleIcon className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <LinkIcon className="w-5 h-5 text-slate-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900 truncate">
                                                            {property.url}
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(property.url);
                                                                toast.success('URL copied to clipboard!');
                                                            }}
                                                            className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                                                            title="Copy URL"
                                                        >
                                                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-500 capitalize">
                                                        {property.permission_level?.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => handleSelectPages(property, e)}
                                                className="flex-shrink-0"
                                            >
                                                <DocumentMagnifyingGlassIcon className="w-4 h-4 mr-1" />
                                                Select Pages
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Selected Count */}
                {selectedProperties.length > 0 && (
                    <div className="pt-4 border-t-2 border-slate-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                <span className="font-bold text-primary-600">{selectedProperties.length}/5</span> properties selected
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPropertySelect([])}
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default GSCPropertySelector;

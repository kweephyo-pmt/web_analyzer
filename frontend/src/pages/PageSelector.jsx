import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const PageSelector = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const propertyUrl = searchParams.get('property');

    const [pages, setPages] = useState([]);
    const [filteredPages, setFilteredPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [sortBy, setSortBy] = useState('clicks'); // clicks, impressions, position

    useEffect(() => {
        if (propertyUrl) {
            fetchPages();
        }
    }, [propertyUrl]);

    useEffect(() => {
        // Filter pages based on search term
        if (searchTerm) {
            const filtered = pages.filter(page => {
                const urlMatch = page.url.toLowerCase().includes(searchTerm.toLowerCase());
                const queryMatch = page.queries.some(q =>
                    q.query.toLowerCase().includes(searchTerm.toLowerCase())
                );
                return urlMatch || queryMatch;
            });
            setFilteredPages(filtered);
        } else {
            setFilteredPages(pages);
        }
    }, [searchTerm, pages]);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`/auth/gsc/pages/${encodeURIComponent(propertyUrl)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPages(response.data.pages);
            setFilteredPages(response.data.pages);
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePage = (pageUrl) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(pageUrl)) {
            // Allow deselecting
            newSelected.delete(pageUrl);
        } else {
            // Check if adding this page would exceed the limit
            const existingPages = JSON.parse(sessionStorage.getItem('selectedPages') || '[]');
            const totalAfterAdd = existingPages.length + newSelected.size + 1;

            if (totalAfterAdd > 5) {
                toast.error(`Maximum 5 URLs allowed. You already have ${existingPages.length} pages selected in Dashboard.`);
                return;
            }
            newSelected.add(pageUrl);
        }
        setSelectedPages(newSelected);
    };

    const toggleAll = () => {
        if (selectedPages.size === filteredPages.length) {
            setSelectedPages(new Set());
        } else {
            // Check limit before selecting all
            const existingPages = JSON.parse(sessionStorage.getItem('selectedPages') || '[]');
            const totalAfterAdd = existingPages.length + filteredPages.length;

            if (totalAfterAdd > 5) {
                const canSelect = Math.max(0, 5 - existingPages.length);
                toast.error(`Maximum 5 URLs allowed. You already have ${existingPages.length} pages selected. You can only select ${canSelect} more.`);
                return;
            }
            setSelectedPages(new Set(filteredPages.map(p => p.url)));
        }
    };

    const analyzeSelected = () => {
        if (selectedPages.size === 0) {
            toast.error('Please select at least one page');
            return;
        }

        // Check total limit before navigating
        const existingPages = JSON.parse(sessionStorage.getItem('selectedPages') || '[]');
        const totalAfterAdd = existingPages.length + selectedPages.size;

        if (totalAfterAdd > 5) {
            toast.error(`Maximum 5 URLs allowed. You already have ${existingPages.length} pages selected. You can only add ${5 - existingPages.length} more.`);
            return;
        }

        // Navigate to analysis with selected URLs
        const urls = Array.from(selectedPages);
        navigate('/dashboard', { state: { urls, mode: 'cluster' } });
    };

    const sortPages = (pages) => {
        return [...pages].sort((a, b) => {
            switch (sortBy) {
                case 'clicks':
                    return b.total_clicks - a.total_clicks;
                case 'impressions':
                    return b.total_impressions - a.total_impressions;
                case 'position':
                    return a.avg_position - b.avg_position;
                default:
                    return 0;
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading pages from Search Console...</p>
                </div>
            </div>
        );
    }

    const sortedPages = sortPages(filteredPages);

    // Calculate remaining slots
    const existingPages = JSON.parse(sessionStorage.getItem('selectedPages') || '[]');
    const remainingSlots = Math.max(0, 5 - existingPages.length - selectedPages.size);
    const isAtLimit = remainingSlots === 0;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Select Pages for Cluster Analysis</h1>
                            <p className="text-sm text-slate-600 mt-1">{propertyUrl}</p>
                            {existingPages.length > 0 && (
                                <p className="text-sm text-purple-600 mt-1">
                                    {existingPages.length} page{existingPages.length !== 1 ? 's' : ''} already selected • {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
                                </p>
                            )}
                        </div>
                        <button
                            onClick={analyzeSelected}
                            disabled={selectedPages.size === 0 || isAtLimit}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Add {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''} to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search pages or queries (e.g., 'tax', 'mortgage')..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="clicks">Sort by Clicks</option>
                            <option value="impressions">Sort by Impressions</option>
                            <option value="position">Sort by Position</option>
                        </select>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                        <span>Showing {sortedPages.length} of {pages.length} pages</span>
                        <button
                            onClick={toggleAll}
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            {selectedPages.size === filteredPages.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>

                {/* Pages Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedPages.size === filteredPages.length && filteredPages.length > 0}
                                        onChange={toggleAll}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Page URL</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Top Queries</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Clicks</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Impressions</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Avg Position</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedPages.map((page) => (
                                <tr
                                    key={page.url}
                                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedPages.has(page.url) ? 'bg-purple-50' : ''
                                        }`}
                                    onClick={() => togglePage(page.url)}
                                >
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedPages.has(page.url)}
                                            onChange={() => togglePage(page.url)}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-slate-900 font-medium truncate max-w-md">
                                            {page.url}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {page.queries.slice(0, 3).map((query, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded"
                                                >
                                                    {query.query}
                                                </span>
                                            ))}
                                            {page.queries.length > 3 && (
                                                <span className="text-xs text-slate-500">
                                                    +{page.queries.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-900">
                                        {page.total_clicks.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-900">
                                        {page.total_impressions.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-900">
                                        {page.avg_position}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PageSelector;

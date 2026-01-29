import { useState } from 'react';
import {
    BriefcaseIcon,
    ServerIcon,
    UserGroupIcon,
    GlobeAltIcon,
    ChartBarIcon,
    SparklesIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';

const Comparison = ({ comparisonData }) => {
    const [expandedSections, setExpandedSections] = useState({
        business: true,
        overlap: true,
        unique: true,
        audience: true,
        technology: true,
        geographic: true,
        similarity: true
    });

    // Debug logging
    console.log('Comparison component received data:', comparisonData);

    if (!comparisonData) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
                <p>No comparison data available</p>
                <p className="text-sm mt-2">Comparison requires 2 or more URLs</p>
            </div>
        );
    }

    // Check if data is still processing
    if (comparisonData.status === 'processing') {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Generating comparison with AI...</p>
            </div>
        );
    }

    // Check if comparison is not applicable
    if (comparisonData.status === 'not_applicable') {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
                <p className="text-lg mb-2">⚠️ Comparison Not Available</p>
                <p className="text-sm">Comparison requires analyzing 2 or more URLs</p>
            </div>
        );
    }

    // Validate we have the expected data structure
    if (!comparisonData.business_models || typeof comparisonData.business_models !== 'object') {
        console.error('Invalid comparison data structure:', comparisonData);
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-red-500">
                <p>Error loading comparison data</p>
                <p className="text-sm mt-2">Please try analyzing again</p>
            </div>
        );
    }

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const SectionHeader = ({ title, color, icon: Icon, section, count }) => (
        <div
            className={`flex items-center justify-between p-4 bg-gradient-to-r ${color} cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={() => section && toggleSection(section)}
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5 text-white" />}
                <h2 className="text-lg font-bold text-white">{title}</h2>
                {count !== undefined && (
                    <span className="px-2 py-1 bg-white/20 rounded text-white text-sm font-medium">
                        {count}
                    </span>
                )}
            </div>
            {section && (
                expandedSections[section] ?
                    <ChevronUpIcon className="w-5 h-5 text-white" /> :
                    <ChevronDownIcon className="w-5 h-5 text-white" />
            )}
        </div>
    );

    // Extract domains from URLs
    const getDomain = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    const urls = Object.keys(comparisonData.business_models || {});

    return (
        <div className="space-y-6">
            {/* Business Models */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader
                    title="Business Models"
                    color="from-blue-600 to-blue-700"
                    icon={BriefcaseIcon}
                    section="business"
                    count={Object.keys(comparisonData.business_models).length}
                />
                {expandedSections.business && (
                    <div className="p-4">
                        <div className="space-y-3">
                            {Object.entries(comparisonData.business_models).map(([url, model]) => (
                                <div key={url} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-700 font-medium">{getDomain(url)}</span>
                                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        {model}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Service Overlap */}
            {comparisonData.service_overlap && comparisonData.service_overlap.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Common Services & Features"
                        color="from-green-600 to-green-700"
                        icon={ChartBarIcon}
                        section="overlap"
                        count={comparisonData.service_overlap.length}
                    />
                    {expandedSections.overlap && (
                        <div className="p-4">
                            <p className="text-sm text-slate-600 mb-3">Services found across multiple websites:</p>
                            <div className="flex flex-wrap gap-2">
                                {comparisonData.service_overlap.map((service, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                                    >
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Unique Services */}
            {comparisonData.unique_services && Object.keys(comparisonData.unique_services).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Unique Differentiators"
                        color="from-purple-600 to-purple-700"
                        icon={SparklesIcon}
                        section="unique"
                    />
                    {expandedSections.unique && (
                        <div className="p-4">
                            <div className="space-y-4">
                                {Object.entries(comparisonData.unique_services).map(([url, services]) => (
                                    services && services.length > 0 && (
                                        <div key={url} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                            <h4 className="font-semibold text-purple-900 mb-3">{getDomain(url)}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {services.map((service, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-white text-purple-700 rounded text-sm font-medium border border-purple-200"
                                                    >
                                                        {service}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Target Audiences */}
            {comparisonData.audience_comparison && Object.keys(comparisonData.audience_comparison).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Target Audience Comparison"
                        color="from-amber-600 to-amber-700"
                        icon={UserGroupIcon}
                        section="audience"
                    />
                    {expandedSections.audience && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(comparisonData.audience_comparison).map(([url, audiences]) => (
                                    <div key={url} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                                        <h4 className="font-semibold text-amber-900 mb-3 text-sm">{getDomain(url)}</h4>
                                        <div className="space-y-2">
                                            {audiences && audiences.map((audience, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                                                    <span className="text-sm text-amber-800">{audience}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Technology Stack */}
            {comparisonData.technology_stack && Object.keys(comparisonData.technology_stack).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Technology Stack"
                        color="from-indigo-600 to-indigo-700"
                        icon={ServerIcon}
                        section="technology"
                    />
                    {expandedSections.technology && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(comparisonData.technology_stack).map(([url, technologies]) => (
                                    <div key={url} className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                                        <h4 className="font-semibold text-indigo-900 mb-3 text-sm">{getDomain(url)}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {technologies && technologies.map((tech, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-white text-indigo-700 rounded text-xs font-medium border border-indigo-200"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Geographic Coverage */}
            {comparisonData.geographic_coverage && Object.keys(comparisonData.geographic_coverage).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Geographic Coverage"
                        color="from-cyan-600 to-cyan-700"
                        icon={GlobeAltIcon}
                        section="geographic"
                    />
                    {expandedSections.geographic && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(comparisonData.geographic_coverage).map(([url, locations]) => (
                                    <div key={url} className="border border-cyan-200 rounded-lg p-4 bg-cyan-50">
                                        <h4 className="font-semibold text-cyan-900 mb-3 text-sm">{getDomain(url)}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {locations && locations.map((location, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-white text-cyan-700 rounded text-xs font-medium border border-cyan-200"
                                                >
                                                    {location}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Similarity Matrix */}
            {comparisonData.similarity_matrix && Object.keys(comparisonData.similarity_matrix).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Similarity Analysis"
                        color="from-slate-600 to-slate-700"
                        icon={ChartBarIcon}
                        section="similarity"
                    />
                    {expandedSections.similarity && (
                        <div className="p-4">
                            <p className="text-sm text-slate-600 mb-4">
                                Similarity scores between websites (0% = completely different, 100% = identical)
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="text-left p-3 border border-slate-200 font-semibold"></th>
                                            {urls.map((url, index) => (
                                                <th key={index} className="p-3 border border-slate-200 text-center font-semibold text-xs">
                                                    {getDomain(url)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {urls.map((url1, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 border border-slate-200 font-semibold text-xs bg-slate-50">
                                                    {getDomain(url1)}
                                                </td>
                                                {urls.map((url2, j) => {
                                                    const score = comparisonData.similarity_matrix[url1]?.[url2] || 0;
                                                    const percentage = Math.round(score * 100);
                                                    const bgColor = score === 1
                                                        ? 'bg-slate-200'
                                                        : score >= 0.7
                                                            ? 'bg-green-100 text-green-800'
                                                            : score >= 0.4
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800';

                                                    return (
                                                        <td
                                                            key={j}
                                                            className={`p-3 border border-slate-200 text-center font-medium ${bgColor}`}
                                                        >
                                                            {percentage}%
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                                    <span>High (70%+)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                                    <span>Medium (40-69%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                                    <span>Low (&lt;40%)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Comparison;

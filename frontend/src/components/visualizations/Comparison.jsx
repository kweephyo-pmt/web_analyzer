import Card from '../ui/Card';
import Badge from '../ui/Badge';
import {
    BriefcaseIcon,
    ServerIcon,
    UserGroupIcon,
    GlobeAltIcon,
    ChartBarIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const Comparison = ({ comparisonData }) => {
    // Debug logging
    console.log('Comparison component received data:', comparisonData);

    if (!comparisonData) {
        return (
            <Card>
                <div className="text-center py-8 text-slate-500">
                    <p>No comparison data available</p>
                    <p className="text-sm mt-2">Comparison requires 2 or more URLs</p>
                </div>
            </Card>
        );
    }

    // Check if data is still processing
    if (comparisonData.status === 'processing') {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Generating comparison with AI...</p>
                </div>
            </Card>
        );
    }

    // Check if comparison is not applicable
    if (comparisonData.status === 'not_applicable') {
        return (
            <Card>
                <div className="text-center py-8 text-slate-500">
                    <p className="text-lg mb-2">⚠️ Comparison Not Available</p>
                    <p className="text-sm">Comparison requires analyzing 2 or more URLs</p>
                </div>
            </Card>
        );
    }

    // Validate we have the expected data structure
    if (!comparisonData.business_models || typeof comparisonData.business_models !== 'object') {
        console.error('Invalid comparison data structure:', comparisonData);
        return (
            <Card>
                <div className="text-center py-8 text-red-500">
                    <p>Error loading comparison data</p>
                    <p className="text-sm mt-2">Please try analyzing again</p>
                </div>
            </Card>
        );
    }

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
            <Card>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                    Business Models
                </h3>
                <div className="space-y-3">
                    {Object.entries(comparisonData.business_models).map(([url, model]) => (
                        <div key={url} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-700 font-medium">{getDomain(url)}</span>
                            <Badge color="blue" size="lg">{model}</Badge>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Service Overlap */}
            {comparisonData.service_overlap && comparisonData.service_overlap.length > 0 && (
                <Card variant="glass" className="bg-gradient-to-br from-green-50 to-emerald-50">
                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-green-600" />
                        Common Services & Features
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">Services found across multiple websites:</p>
                    <div className="flex flex-wrap gap-2">
                        {comparisonData.service_overlap.map((service, index) => (
                            <Badge key={index} color="green" size="lg">
                                {service}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            {/* Unique Services */}
            {comparisonData.unique_services && Object.keys(comparisonData.unique_services).length > 0 && (
                <Card>
                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                        Unique Differentiators
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(comparisonData.unique_services).map(([url, services]) => (
                            services && services.length > 0 && (
                                <div key={url} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                                    <h4 className="font-semibold text-purple-900 mb-2">{getDomain(url)}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {services.map((service, idx) => (
                                            <Badge key={idx} color="purple" size="sm">
                                                {service}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </Card>
            )}

            {/* Target Audiences */}
            {comparisonData.audience_comparison && Object.keys(comparisonData.audience_comparison).length > 0 && (
                <Card>
                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-amber-600" />
                        Target Audience Comparison
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(comparisonData.audience_comparison).map(([url, audiences]) => (
                            <div key={url} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <h4 className="font-semibold text-amber-900 mb-2 text-sm">{getDomain(url)}</h4>
                                <div className="space-y-1">
                                    {audiences && audiences.map((audience, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span className="text-sm text-amber-800">{audience}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Technology Stack */}
            {comparisonData.technology_stack && Object.keys(comparisonData.technology_stack).length > 0 && (
                <Card>
                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        <ServerIcon className="w-5 h-5 text-indigo-600" />
                        Technology Stack
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(comparisonData.technology_stack).map(([url, technologies]) => (
                            <div key={url} className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                <h4 className="font-semibold text-indigo-900 mb-3 text-sm">{getDomain(url)}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {technologies && technologies.map((tech, idx) => (
                                        <Badge key={idx} color="indigo" size="sm">
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Geographic Coverage */}
            {comparisonData.geographic_coverage && Object.keys(comparisonData.geographic_coverage).length > 0 && (
                <Card>
                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        <GlobeAltIcon className="w-5 h-5 text-cyan-600" />
                        Geographic Coverage
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(comparisonData.geographic_coverage).map(([url, locations]) => (
                            <div key={url} className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                                <h4 className="font-semibold text-cyan-900 mb-2 text-sm">{getDomain(url)}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {locations && locations.map((location, idx) => (
                                        <Badge key={idx} color="cyan" size="sm">
                                            {location}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Similarity Matrix */}
            {comparisonData.similarity_matrix && Object.keys(comparisonData.similarity_matrix).length > 0 && (
                <Card>
                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-slate-600" />
                        Similarity Analysis
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Similarity scores between websites (0% = completely different, 100% = identical)
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left p-3 bg-slate-50 border border-slate-200 font-semibold"></th>
                                    {urls.map((url, index) => (
                                        <th key={index} className="p-3 bg-slate-50 border border-slate-200 text-center font-semibold text-xs">
                                            {getDomain(url)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {urls.map((url1, i) => (
                                    <tr key={i}>
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
                </Card>
            )}
        </div>
    );
};

export default Comparison;

import { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
    GlobeAltIcon,
    BriefcaseIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
    CursorArrowRaysIcon,
    LightBulbIcon,
    ChartBarIcon,
    CodeBracketIcon,
    TrophyIcon,
    DocumentTextIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const TopicalMap = ({ topicalMaps }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    if (!topicalMaps || topicalMaps.length === 0) {
        return (
            <Card>
                <div className="text-center py-8 text-slate-500">
                    No topical map data available
                </div>
            </Card>
        );
    }

    const activeMap = topicalMaps[activeIndex];
    const hasComprehensive = activeMap.semantic_relationships || activeMap.audience_segments ||
        activeMap.content_strategy || activeMap.query_templates;

    return (
        <div className="space-y-6">
            {/* URL Selector */}
            {topicalMaps.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {topicalMaps.map((map, index) => {
                        const domain = new URL(map.url).hostname.replace('www.', '');
                        return (
                            <Button
                                key={index}
                                variant={activeIndex === index ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setActiveIndex(index)}
                            >
                                <GlobeAltIcon className="w-4 h-4 mr-1" />
                                {domain}
                            </Button>
                        );
                    })}
                </div>
            )}

            {/* Tab Navigation */}
            {hasComprehensive && (
                <Card className="p-2">
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={activeTab === 'overview' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('overview')}
                        >
                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                            Overview
                        </Button>
                        {activeMap.semantic_relationships && (
                            <Button
                                variant={activeTab === 'semantic' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('semantic')}
                            >
                                <SparklesIcon className="w-4 h-4 mr-1" />
                                Semantic Analysis
                            </Button>
                        )}
                        {activeMap.audience_segments && (
                            <Button
                                variant={activeTab === 'audience' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('audience')}
                            >
                                <UserGroupIcon className="w-4 h-4 mr-1" />
                                Audience Segments
                            </Button>
                        )}
                        {activeMap.content_strategy && (
                            <Button
                                variant={activeTab === 'content' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('content')}
                            >
                                <ChartBarIcon className="w-4 h-4 mr-1" />
                                Content Strategy
                            </Button>
                        )}
                        {activeMap.query_templates && (
                            <Button
                                variant={activeTab === 'queries' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('queries')}
                            >
                                <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                                Query Templates
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Central Entity & Business Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card variant="glass" className="bg-gradient-to-br from-primary-50 to-purple-50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <BriefcaseIcon className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-600">Central Entity</h3>
                            </div>
                            <p className="text-3xl font-bold text-primary-600">{activeMap.central_entity}</p>
                        </Card>

                        <Card variant="glass" className="bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <LightBulbIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-600">Business Model</h3>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{activeMap.business_model}</p>
                        </Card>
                    </div>

                    {/* Business Description */}
                    <Card>
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                            <GlobeAltIcon className="w-5 h-5 text-primary-600" />
                            Business Overview
                        </h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{activeMap.business_description}</p>
                    </Card>

                    {/* Search Intent */}
                    <Card variant="glass">
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                            <MagnifyingGlassIcon className="w-5 h-5 text-purple-600" />
                            Search Intent
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {activeMap.search_intent.map((intent, idx) => (
                                <Badge key={idx} color="purple" size="lg">
                                    {intent}
                                </Badge>
                            ))}
                        </div>
                    </Card>

                    {/* Target Audiences */}
                    <Card>
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                            <UserGroupIcon className="w-5 h-5 text-blue-600" />
                            Target Audiences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeMap.target_audiences.map((audience, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-all"
                                >
                                    <p className="font-medium text-blue-900">{audience}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Conversion Methods */}
                    <Card>
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                            <CursorArrowRaysIcon className="w-5 h-5 text-amber-600" />
                            Conversion Methods
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeMap.conversion_methods.map((method, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100"
                                >
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-amber-900">{method}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Key Topics */}
                    <Card>
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                            <LightBulbIcon className="w-5 h-5 text-green-600" />
                            Key Topics & Themes
                        </h3>
                        <div className="space-y-2">
                            {activeMap.key_topics.map((topic, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <span className="flex-none w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <p className="text-slate-700 font-medium">{topic}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Competitive Advantages & Tech Stack */}
                    {(activeMap.competitive_advantages || activeMap.technology_stack) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeMap.competitive_advantages && (
                                <Card variant="glass" className="bg-gradient-to-br from-yellow-50 to-orange-50">
                                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                                        <TrophyIcon className="w-5 h-5 text-orange-600" />
                                        Competitive Advantages
                                    </h3>
                                    <ul className="space-y-2">
                                        {activeMap.competitive_advantages.map((adv, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-orange-500 mt-1">✓</span>
                                                <span className="text-slate-700">{adv}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}

                            {activeMap.technology_stack && (
                                <Card variant="glass" className="bg-gradient-to-br from-cyan-50 to-blue-50">
                                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                                        <CodeBracketIcon className="w-5 h-5 text-cyan-600" />
                                        Technology Stack
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {activeMap.technology_stack.map((tech, idx) => (
                                            <Badge key={idx} color="blue" size="md">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Semantic Analysis Tab */}
            {activeTab === 'semantic' && activeMap.semantic_relationships && (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Semantic Relationships</h2>

                        {activeMap.semantic_relationships.core_entities?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-primary-600">Core Entities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.core_entities.map((entity, idx) => (
                                        <Badge key={idx} color="blue" size="lg">{entity}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.semantic_relationships.attributes?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-green-600">Attributes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {activeMap.semantic_relationships.attributes.map((attr, idx) => (
                                        <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-100">
                                            <span className="text-slate-700">{attr}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.semantic_relationships.context_terms?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-purple-600">Context Terms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.context_terms.map((term, idx) => (
                                        <Badge key={idx} color="purple" size="md">{term}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.semantic_relationships.synonyms?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-amber-600">Synonyms & Variations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.synonyms.map((syn, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-sm border border-amber-200">
                                            {syn}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.semantic_relationships.related_concepts?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-cyan-600">Related Concepts</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {activeMap.semantic_relationships.related_concepts.map((concept, idx) => (
                                        <div key={idx} className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                                            <span className="text-slate-700 font-medium">{concept}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Audience Segments Tab */}
            {activeTab === 'audience' && activeMap.audience_segments && (
                <div className="space-y-6">
                    {activeMap.audience_segments.map((segment, idx) => (
                        <Card key={idx} variant="glass" className="bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-blue-900">{segment.name}</h3>
                                    <Badge color="blue" size="md" className="mt-2">{segment.expertise_level}</Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-slate-700 mb-2">Primary Goal</h4>
                                    <p className="text-slate-600">{segment.primary_goal}</p>
                                </div>

                                {segment.pain_points?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-700 mb-2">Pain Points</h4>
                                        <ul className="space-y-1">
                                            {segment.pain_points.map((pain, pidx) => (
                                                <li key={pidx} className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-1">•</span>
                                                    <span className="text-slate-600">{pain}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {segment.content_types?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-700 mb-2">Preferred Content Types</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {segment.content_types.map((type, tidx) => (
                                                <Badge key={tidx} color="indigo" size="sm">{type}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Content Strategy Tab */}
            {activeTab === 'content' && activeMap.content_strategy && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeMap.content_strategy.core_topics?.length > 0 && (
                            <Card variant="glass" className="bg-gradient-to-br from-green-50 to-emerald-50">
                                <h3 className="font-semibold text-lg mb-4 text-green-700">Core Topics (Revenue Focus)</h3>
                                <ul className="space-y-2">
                                    {activeMap.content_strategy.core_topics.map((topic, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-green-600 mt-1">▸</span>
                                            <span className="text-slate-700">{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {activeMap.content_strategy.outer_topics?.length > 0 && (
                            <Card variant="glass" className="bg-gradient-to-br from-blue-50 to-cyan-50">
                                <h3 className="font-semibold text-lg mb-4 text-blue-700">Outer Topics (Authority Building)</h3>
                                <ul className="space-y-2">
                                    {activeMap.content_strategy.outer_topics.map((topic, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-1">▸</span>
                                            <span className="text-slate-700">{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {activeMap.content_strategy.content_gaps?.length > 0 && (
                        <Card variant="glass" className="bg-gradient-to-br from-yellow-50 to-orange-50">
                            <h3 className="font-semibold text-lg mb-4 text-orange-700">Content Gaps & Opportunities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {activeMap.content_strategy.content_gaps.map((gap, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-lg border border-orange-200">
                                        <span className="text-slate-700">{gap}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.content_strategy.priority_areas?.length > 0 && (
                        <Card variant="glass" className="bg-gradient-to-br from-purple-50 to-pink-50">
                            <h3 className="font-semibold text-lg mb-4 text-purple-700">Priority Areas</h3>
                            <div className="space-y-2">
                                {activeMap.content_strategy.priority_areas.map((area, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                                        <span className="flex-none w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                                            {idx + 1}
                                        </span>
                                        <span className="text-slate-700 font-medium">{area}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Query Templates Tab */}
            {activeTab === 'queries' && activeMap.query_templates && (
                <div className="space-y-6">
                    {activeMap.query_templates.informational?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-blue-700">Informational Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.informational.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-blue-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.query_templates.transactional?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-green-700">Transactional Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.transactional.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-green-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.query_templates.commercial?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-amber-700">Commercial Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.commercial.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-amber-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.query_templates.navigational?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-purple-700">Navigational Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.navigational.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-purple-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* AI Badge */}
            <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <p className="text-sm text-slate-600">
                    <span className="font-semibold text-purple-700">AI-Powered Comprehensive Analysis</span> - Generated using Claude 3.7 Sonnet with extended thinking for deep semantic insights
                </p>
            </div>
        </div>
    );
};

export default TopicalMap;

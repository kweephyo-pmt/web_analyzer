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
                        {activeMap.competitive_analysis && (
                            <Button
                                variant={activeTab === 'competitive' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('competitive')}
                            >
                                <TrophyIcon className="w-4 h-4 mr-1" />
                                Competitive Analysis
                            </Button>
                        )}
                        {activeMap.content_articles && (
                            <Button
                                variant={activeTab === 'articles' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('articles')}
                            >
                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                Content Plan
                            </Button>
                        )}
                        {activeMap.seo_optimization && (
                            <Button
                                variant={activeTab === 'seo' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('seo')}
                            >
                                <ChartBarIcon className="w-4 h-4 mr-1" />
                                SEO Optimization
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
                <div className="space-y-8">
                    <Card className="bg-gradient-to-br from-white to-slate-50/50">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Semantic Relationships</h2>
                            <p className="text-slate-600">Comprehensive linguistic and conceptual analysis</p>
                        </div>

                        {/* Core Entities */}
                        {activeMap.semantic_relationships.core_entities?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Core Entities</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.core_entities.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.core_entities.map((entity, idx) => (
                                        <Badge key={idx} color="blue" size="lg" className="shadow-sm">{entity}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Derived Entities */}
                        {activeMap.semantic_relationships.derived_entities?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Derived Entities</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.derived_entities.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.derived_entities.map((entity, idx) => (
                                        <Badge key={idx} color="indigo" size="md" className="shadow-sm">{entity}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attributes */}
                        {activeMap.semantic_relationships.attributes?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Attributes</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.attributes.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {activeMap.semantic_relationships.attributes.map((attr, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 hover:shadow-sm transition-all">
                                            <span className="text-slate-700 text-sm">{attr}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Context Terms */}
                        {activeMap.semantic_relationships.context_terms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Context Terms</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.context_terms.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.context_terms.map((term, idx) => (
                                        <Badge key={idx} color="purple" size="md" className="shadow-sm">{term}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Synonyms & Variations */}
                        {activeMap.semantic_relationships.synonyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Synonyms & Variations</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.synonyms.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.synonyms.map((syn, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-amber-50 text-amber-900 rounded-lg text-sm border border-amber-200 hover:bg-amber-100 transition-colors">
                                            {syn}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Antonyms */}
                        {activeMap.semantic_relationships.antonyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Antonyms</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.antonyms.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.antonyms.map((ant, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-red-50 text-red-900 rounded-lg text-sm border border-red-200 hover:bg-red-100 transition-colors">
                                            {ant}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hypernyms */}
                        {activeMap.semantic_relationships.hypernyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Hypernyms</h3>
                                    <span className="text-xs text-slate-500 ml-2">Broader Categories</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.hypernyms.map((hyper, idx) => (
                                        <Badge key={idx} color="purple" size="lg" className="shadow-sm">{hyper}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hyponyms */}
                        {activeMap.semantic_relationships.hyponyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Hyponyms</h3>
                                    <span className="text-xs text-slate-500 ml-2">Specific Subcategories</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {activeMap.semantic_relationships.hyponyms.map((hypo, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-lg border border-pink-100 hover:border-pink-300 hover:shadow-sm transition-all">
                                            <span className="text-slate-700 text-sm">{hypo}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Holonyms */}
                        {activeMap.semantic_relationships.holonyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Holonyms</h3>
                                    <span className="text-xs text-slate-500 ml-2">Larger Systems</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.holonyms.map((holo, idx) => (
                                        <Badge key={idx} color="teal" size="lg" className="shadow-sm">{holo}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Meronyms */}
                        {activeMap.semantic_relationships.meronyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Meronyms</h3>
                                    <span className="text-xs text-slate-500 ml-2">Component Parts</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {activeMap.semantic_relationships.meronyms.map((mero, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-lg border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all">
                                            <span className="text-slate-700 text-sm">{mero}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Troponyms */}
                        {activeMap.semantic_relationships.troponyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Troponyms</h3>
                                    <span className="text-xs text-slate-500 ml-2">Methods & Ways</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.troponyms.map((tropo, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-orange-50 text-orange-900 rounded-lg text-sm border border-orange-200 hover:bg-orange-100 transition-colors">
                                            {tropo}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Entailments */}
                        {activeMap.semantic_relationships.entailments?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Entailments</h3>
                                    <span className="text-xs text-slate-500 ml-2">Logical Consequences</span>
                                </div>
                                <ul className="space-y-3">
                                    {activeMap.semantic_relationships.entailments.map((ent, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all">
                                            <span className="flex-none text-blue-500 mt-0.5">→</span>
                                            <span className="text-slate-700">{ent}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Acronyms */}
                        {activeMap.semantic_relationships.acronyms?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Acronyms & Industry Terms</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.acronyms.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.semantic_relationships.acronyms.map((acro, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-mono text-sm border border-slate-200 hover:bg-slate-200 transition-colors">
                                            {acro}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Polysemes */}
                        {activeMap.semantic_relationships.polysemes?.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-fuchsia-500 to-fuchsia-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Polysemes</h3>
                                    <span className="text-xs text-slate-500 ml-2">Multiple Meanings</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {activeMap.semantic_relationships.polysemes.map((poly, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-lg border border-fuchsia-100 hover:border-fuchsia-300 hover:shadow-sm transition-all">
                                            <span className="text-slate-700 text-sm">{poly}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Concepts */}
                        {activeMap.semantic_relationships.related_concepts?.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full"></div>
                                    <h3 className="font-bold text-xl text-slate-800">Related Concepts</h3>
                                    <span className="text-xs text-slate-500 ml-2">({activeMap.semantic_relationships.related_concepts.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {activeMap.semantic_relationships.related_concepts.map((concept, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-lg border border-cyan-100 hover:border-cyan-300 hover:shadow-sm transition-all">
                                            <span className="text-slate-700 font-medium text-sm">{concept}</span>
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

                    {activeMap.query_templates.raw_queries?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-slate-700">Raw Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.raw_queries.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-slate-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.query_templates.contextual?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-cyan-700">Contextual Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.contextual.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-cyan-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.query_templates.audience_specific?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-indigo-700">Audience-Specific Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.audience_specific.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-indigo-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.query_templates.predictive?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-pink-700">Predictive Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.predictive.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-pink-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeMap.query_templates.voice_search?.length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-lg mb-4 text-emerald-700">Voice Search Queries</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {activeMap.query_templates.voice_search.map((query, idx) => (
                                    <div key={idx} className="p-2 bg-emerald-50 rounded text-sm text-slate-700 font-mono">
                                        {query}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Competitive Analysis Tab */}
            {activeTab === 'competitive' && activeMap.competitive_analysis && (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Competitive & Source Analysis</h2>

                        {activeMap.competitive_analysis.top_competitors?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-red-600">Top Competitors</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {activeMap.competitive_analysis.top_competitors.map((comp, idx) => (
                                        <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                                            <span className="text-slate-700 font-medium">{comp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.competitive_analysis.content_approaches?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-blue-600">Content Approaches</h3>
                                <ul className="space-y-2">
                                    {activeMap.competitive_analysis.content_approaches.map((approach, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">✓</span>
                                            <span className="text-slate-700">{approach}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeMap.competitive_analysis.gap_opportunities?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-amber-600">Gap Opportunities</h3>
                                <div className="space-y-2">
                                    {activeMap.competitive_analysis.gap_opportunities.map((gap, idx) => (
                                        <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="text-slate-700">{gap}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.competitive_analysis.serp_insights?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-purple-600">SERP Insights</h3>
                                <ul className="space-y-2">
                                    {activeMap.competitive_analysis.serp_insights.map((insight, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-purple-500 mt-1">→</span>
                                            <span className="text-slate-700">{insight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Content Plan Tab */}
            {activeTab === 'articles' && activeMap.content_articles && (
                <div className="space-y-4">
                    <Card>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Content Plan Matrix</h2>
                        <p className="text-slate-600 mb-6">Strategic article recommendations with integration context</p>
                    </Card>

                    {activeMap.content_articles.map((article, idx) => (
                        <Card key={idx} variant="glass" className={`${article.section === 'Core'
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                            : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                            }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{article.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge color={article.section === 'Core' ? 'green' : 'blue'} size="sm">
                                            {article.section}
                                        </Badge>
                                        <Badge color="purple" size="sm">{article.article_type}</Badge>
                                        <Badge color="amber" size="sm">Priority {article.priority}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                    <span className="font-semibold">Category:</span>
                                    <span>{article.category_l1}</span>
                                    {article.category_l2 && <span>→ {article.category_l2}</span>}
                                    {article.category_l3 && <span>→ {article.category_l3}</span>}
                                </div>
                            </div>

                            <div className="p-4 bg-white rounded-lg border border-slate-200">
                                <h4 className="font-semibold text-slate-700 mb-2">Integration Strategy</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{article.source_context}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* SEO Optimization Tab */}
            {activeTab === 'seo' && activeMap.seo_optimization && (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Semantic SEO Optimization</h2>

                        {activeMap.seo_optimization.topic_clusters?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-blue-600">Topic Clusters</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {activeMap.seo_optimization.topic_clusters.map((cluster, idx) => (
                                        <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <span className="text-slate-700 font-medium">{cluster}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.seo_optimization.schema_recommendations?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3 text-purple-600">Schema Recommendations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {activeMap.seo_optimization.schema_recommendations.map((schema, idx) => (
                                        <Badge key={idx} color="purple" size="lg">{schema}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMap.seo_optimization.entity_optimization?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-green-600">Entity Optimization Tips</h3>
                                <ul className="space-y-3">
                                    {activeMap.seo_optimization.entity_optimization.map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                            <span className="flex-none w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="text-slate-700">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default TopicalMap;

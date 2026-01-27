import { useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    GlobeAltIcon,
    UserGroupIcon,
    LightBulbIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    TrophyIcon,
    DocumentTextIcon,
    SparklesIcon,
    Squares2X2Icon,
    TableCellsIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const TopicalMap = ({ topicalMaps }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [expandedSections, setExpandedSections] = useState({
        semantic: true,
        audience: false,
        content: true,
        queries: false,
        competitive: true,
        articles: false,
        seo: true,
        taxonomy: true,
        ontology: true,
        tools: true
    });

    if (!topicalMaps || topicalMaps.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
                No topical map data available
            </div>
        );
    }

    const activeMap = topicalMaps[activeIndex];

    // Debug: Check if taxonomy and ontology data exists
    console.log('Taxonomy data:', activeMap.taxonomy);
    console.log('Ontology data:', activeMap.ontology);

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

    return (
        <div className="space-y-6">
            {/* URL Selector */}
            {topicalMaps.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {topicalMaps.map((map, index) => {
                        const domain = new URL(map.url).hostname.replace('www.', '');
                        return (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${activeIndex === index
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                                {domain}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Header Info */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <h1 className="text-2xl font-bold text-white mb-1">{activeMap.central_entity}</h1>
                    <p className="text-blue-100 text-sm">{activeMap.url}</p>
                </div>
                <div className="p-4 bg-slate-50">
                    <p className="text-slate-700 text-sm leading-relaxed">{activeMap.business_description}</p>
                </div>
            </div>

            {/* Key Topics - Horizontal Pills */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">KEY TOPICS</h3>
                <div className="flex flex-wrap gap-2">
                    {activeMap.key_topics?.slice(0, 10).map((topic, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                            {topic}
                        </span>
                    ))}
                </div>
            </div>

            {/* Business Overview - Two Column */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader title="Business Overview" color="from-slate-600 to-slate-700" icon={GlobeAltIcon} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200">
                    <div className="bg-white p-4">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">BUSINESS MODEL</h4>
                        <p className="text-slate-800 font-medium">{activeMap.business_model}</p>
                    </div>
                    <div className="bg-white p-4">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">SEARCH INTENT</h4>
                        <div className="flex flex-wrap gap-1">
                            {activeMap.search_intent?.map((intent, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                    {intent}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-4">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">TARGET AUDIENCES</h4>
                        <div className="space-y-1">
                            {activeMap.target_audiences?.slice(0, 3).map((audience, idx) => (
                                <div key={idx} className="text-sm text-slate-700">• {audience}</div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-4">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">CONVERSION METHODS</h4>
                        <div className="space-y-1">
                            {activeMap.conversion_methods?.slice(0, 3).map((method, idx) => (
                                <div key={idx} className="text-sm text-slate-700">• {method}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Semantic Analysis */}
            {activeMap.semantic_relationships && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Semantic Analysis"
                        color="from-indigo-600 to-indigo-700"
                        icon={SparklesIcon}
                        section="semantic"
                    />
                    {expandedSections.semantic && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Core Entities */}
                                {activeMap.semantic_relationships.core_entities?.length > 0 && (
                                    <div className="border border-slate-200 rounded-lg p-3">
                                        <h4 className="text-xs font-semibold text-indigo-600 mb-2">CORE ENTITIES</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {activeMap.semantic_relationships.core_entities.map((entity, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                                                    {entity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Derived Entities */}
                                {activeMap.semantic_relationships.derived_entities?.length > 0 && (
                                    <div className="border border-slate-200 rounded-lg p-3">
                                        <h4 className="text-xs font-semibold text-purple-600 mb-2">DERIVED ENTITIES</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {activeMap.semantic_relationships.derived_entities.map((entity, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                                    {entity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attributes */}
                                {activeMap.semantic_relationships.attributes?.length > 0 && (
                                    <div className="border border-slate-200 rounded-lg p-3">
                                        <h4 className="text-xs font-semibold text-green-600 mb-2">ATTRIBUTES</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {activeMap.semantic_relationships.attributes.map((attr, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                                    {attr}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Context Terms */}
                                {activeMap.semantic_relationships.context_terms?.length > 0 && (
                                    <div className="border border-slate-200 rounded-lg p-3">
                                        <h4 className="text-xs font-semibold text-amber-600 mb-2">CONTEXT TERMS</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {activeMap.semantic_relationships.context_terms.map((term, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                                                    {term}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content Strategy */}
            {activeMap.content_strategy && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Content Strategy"
                        color="from-teal-600 to-teal-700"
                        icon={LightBulbIcon}
                        section="content"
                    />
                    {expandedSections.content && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Core Topics */}
                                {activeMap.content_strategy.core_topics?.length > 0 && (
                                    <div className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                                        <h4 className="text-sm font-semibold text-green-700 mb-2">Core Topics (Revenue)</h4>
                                        <ul className="space-y-1">
                                            {activeMap.content_strategy.core_topics.map((topic, idx) => (
                                                <li key={idx} className="text-sm text-slate-700">• {topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Outer Topics */}
                                {activeMap.content_strategy.outer_topics?.length > 0 && (
                                    <div className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                                        <h4 className="text-sm font-semibold text-blue-700 mb-2">Outer Topics (Authority)</h4>
                                        <ul className="space-y-1">
                                            {activeMap.content_strategy.outer_topics.map((topic, idx) => (
                                                <li key={idx} className="text-sm text-slate-700">• {topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Content Gaps */}
                                {activeMap.content_strategy.content_gaps?.length > 0 && (
                                    <div className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded md:col-span-2">
                                        <h4 className="text-sm font-semibold text-orange-700 mb-2">Content Gaps & Opportunities</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {activeMap.content_strategy.content_gaps.map((gap, idx) => (
                                                <div key={idx} className="text-sm text-slate-700">• {gap}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Taxonomy Structure */}
            {activeMap.taxonomy && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Taxonomy"
                        color="from-indigo-600 to-indigo-700"
                        icon={Squares2X2Icon}
                        section="taxonomy"
                        count={activeMap.taxonomy.length}
                    />
                    {expandedSections.taxonomy && (
                        <div className="p-4">
                            {/* Group by level */}
                            {[1, 2, 3].map(level => {
                                const nodesAtLevel = activeMap.taxonomy.filter(node => node.level === level);
                                if (nodesAtLevel.length === 0) return null;

                                return (
                                    <div key={level} className="mb-4 last:mb-0">
                                        <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                                            Level {level} {level === 1 ? '(Main Categories)' : level === 2 ? '(Subcategories)' : '(Sub-subcategories)'}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {nodesAtLevel.map((node, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-3 py-2 rounded-lg text-sm font-medium text-white shadow-sm"
                                                    style={{ backgroundColor: node.color || '#6366F1' }}
                                                >
                                                    {node.name}
                                                    {node.children && node.children.length > 0 && (
                                                        <span className="ml-2 text-xs opacity-75">
                                                            ({node.children.length})
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Taxonomy Visualization */}
            {activeMap.taxonomy && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
                        <div className="flex items-center gap-3">
                            <Squares2X2Icon className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Taxonomy Visualization</h3>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50">
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full">
                                {/* Build tree structure */}
                                {(() => {
                                    // Get level 1 nodes (root nodes)
                                    const level1Nodes = activeMap.taxonomy.filter(node => node.level === 1);

                                    return (
                                        <div className="flex flex-col items-center gap-8">
                                            {level1Nodes.map((l1Node, l1Idx) => (
                                                <div key={l1Idx} className="flex flex-col items-center">
                                                    {/* Level 1 Node */}
                                                    <div
                                                        className="px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-md border-2 border-white"
                                                        style={{ backgroundColor: l1Node.color || '#4F46E5' }}
                                                    >
                                                        {l1Node.name}
                                                    </div>

                                                    {/* Connector line */}
                                                    {l1Node.children && l1Node.children.length > 0 && (
                                                        <div className="w-0.5 h-8 bg-slate-300"></div>
                                                    )}

                                                    {/* Level 2 Nodes */}
                                                    {l1Node.children && l1Node.children.length > 0 && (
                                                        <div className="flex gap-4 relative">
                                                            {/* Horizontal connector */}
                                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300" style={{ top: '-16px' }}></div>

                                                            {l1Node.children.map((l2Name, l2Idx) => {
                                                                const l2Node = activeMap.taxonomy.find(n => n.name === l2Name && n.level === 2);
                                                                if (!l2Node) return null;

                                                                return (
                                                                    <div key={l2Idx} className="flex flex-col items-center">
                                                                        {/* Vertical connector to L2 */}
                                                                        <div className="w-0.5 h-4 bg-slate-300"></div>

                                                                        {/* Level 2 Node */}
                                                                        <div
                                                                            className="px-4 py-2 rounded-lg text-xs font-medium text-white shadow-sm"
                                                                            style={{ backgroundColor: l2Node.color || '#10B981' }}
                                                                        >
                                                                            {l2Node.name}
                                                                        </div>

                                                                        {/* Connector to L3 */}
                                                                        {l2Node.children && l2Node.children.length > 0 && (
                                                                            <div className="w-0.5 h-6 bg-slate-300"></div>
                                                                        )}

                                                                        {/* Level 3 Nodes */}
                                                                        {l2Node.children && l2Node.children.length > 0 && (
                                                                            <div className="flex flex-col gap-2">
                                                                                {l2Node.children.map((l3Name, l3Idx) => {
                                                                                    const l3Node = activeMap.taxonomy.find(n => n.name === l3Name && n.level === 3);
                                                                                    if (!l3Node) return null;

                                                                                    return (
                                                                                        <div
                                                                                            key={l3Idx}
                                                                                            className="px-3 py-1.5 rounded text-xs font-medium text-white shadow-sm"
                                                                                            style={{ backgroundColor: l3Node.color || '#F59E0B' }}
                                                                                        >
                                                                                            {l3Node.name}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ontology Relationships */}
            {activeMap.ontology && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Ontology"
                        color="from-purple-600 to-purple-700"
                        icon={TableCellsIcon}
                        section="ontology"
                        count={activeMap.ontology.length}
                    />
                    {expandedSections.ontology && (
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-purple-50">
                                            <th className="border border-purple-200 px-4 py-2 text-left text-sm font-semibold text-purple-900">
                                                Subject
                                            </th>
                                            <th className="border border-purple-200 px-4 py-2 text-left text-sm font-semibold text-purple-900">
                                                Predicate
                                            </th>
                                            <th className="border border-purple-200 px-4 py-2 text-left text-sm font-semibold text-purple-900">
                                                Object
                                            </th>
                                            <th className="border border-purple-200 px-4 py-2 text-left text-sm font-semibold text-purple-900">
                                                Context
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeMap.ontology.map((relation, idx) => (
                                            <tr key={idx} className="hover:bg-purple-50 transition-colors">
                                                <td className="border border-slate-200 px-4 py-2 text-sm text-slate-700">
                                                    {relation.subject}
                                                </td>
                                                <td className="border border-slate-200 px-4 py-2 text-sm text-purple-600 font-medium">
                                                    {relation.predicate}
                                                </td>
                                                <td className="border border-slate-200 px-4 py-2 text-sm text-slate-700">
                                                    {relation.object}
                                                </td>
                                                <td className="border border-slate-200 px-4 py-2 text-sm text-slate-600 italic">
                                                    {relation.context}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Audience Segments */}
            {activeMap.audience_segments && activeMap.audience_segments.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Audience Segments"
                        color="from-purple-600 to-purple-700"
                        icon={UserGroupIcon}
                        section="audience"
                        count={activeMap.audience_segments.length}
                    />
                    {expandedSections.audience && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {activeMap.audience_segments.map((segment, idx) => (
                                    <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <UserGroupIcon className="w-5 h-5 text-purple-600" />
                                            <h4 className="font-semibold text-purple-900">{segment.expertise_level}</h4>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600 mb-1">Goal:</p>
                                                <p className="text-sm text-slate-700">{segment.primary_goal}</p>
                                            </div>

                                            {segment.content_types && segment.content_types.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-600 mb-1">Content Types:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {segment.content_types.map((type, typeIdx) => (
                                                            <span key={typeIdx} className="text-xs px-2 py-0.5 bg-white rounded text-slate-700">
                                                                {type}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {segment.pain_points && segment.pain_points.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-600 mb-1">Pain Points:</p>
                                                    <ul className="text-xs text-slate-600 space-y-0.5">
                                                        {segment.pain_points.slice(0, 3).map((pain, painIdx) => (
                                                            <li key={painIdx}>• {pain}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tools & Platforms */}
            {activeMap.technology_stack && activeMap.technology_stack.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Tools & Platforms"
                        color="from-blue-600 to-blue-700"
                        icon={WrenchScrewdriverIcon}
                        section="tools"
                        count={activeMap.technology_stack.length}
                    />
                    {expandedSections.tools && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeMap.technology_stack.map((tech, idx) => (
                                    <div key={idx} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
                                            <h4 className="font-semibold text-blue-900">{tech}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Query Research */}
            {activeMap.query_templates && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Query Research"
                        color="from-purple-600 to-purple-700"
                        icon={MagnifyingGlassIcon}
                        section="queries"
                    />
                    {expandedSections.queries && (
                        <div className="p-4 space-y-3">
                            {Object.entries(activeMap.query_templates).map(([type, queries]) => {
                                if (!queries || queries.length === 0) return null;
                                const colors = {
                                    informational: 'blue',
                                    transactional: 'green',
                                    commercial: 'amber',
                                    navigational: 'purple',
                                    contextual: 'cyan',
                                    audience_specific: 'indigo',
                                    predictive: 'pink',
                                    voice_search: 'emerald',
                                    raw_queries: 'slate'
                                };
                                const color = colors[type] || 'slate';
                                return (
                                    <div key={type} className="border border-slate-200 rounded p-3">
                                        <h4 className={`text-xs font-semibold text-${color}-600 mb-2 uppercase`}>
                                            {type.replace(/_/g, ' ')}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                            {queries.slice(0, 10).map((query, idx) => (
                                                <div key={idx} className={`text-xs text-slate-600 bg-${color}-50 px-2 py-1 rounded`}>
                                                    {query}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Competitive Analysis */}
            {activeMap.competitive_analysis && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Competitive Analysis"
                        color="from-orange-600 to-orange-700"
                        icon={TrophyIcon}
                        section="competitive"
                        count={activeMap.competitive_analysis.top_competitors?.length}
                    />
                    {expandedSections.competitive && (
                        <div className="p-4">
                            {/* Top Competitors */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Competitors</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {activeMap.competitive_analysis.top_competitors?.map((competitor, idx) => (
                                        <div key={idx} className="bg-orange-50 border border-orange-200 rounded p-2 text-sm text-slate-700 hover:bg-orange-100 transition-colors">
                                            {competitor}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SERP Insights */}
                            {activeMap.competitive_analysis.serp_insights?.length > 0 && (
                                <div className="border-t border-slate-200 pt-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">SERP Insights</h4>
                                    <div className="space-y-1">
                                        {activeMap.competitive_analysis.serp_insights.slice(0, 10).map((insight, idx) => (
                                            <div key={idx} className="text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded">
                                                {insight}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Content Plan */}
            {activeMap.content_articles && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="Content Plan"
                        color="from-blue-600 to-blue-700"
                        icon={DocumentTextIcon}
                        section="articles"
                        count={activeMap.content_articles.length}
                    />
                    {expandedSections.articles && (
                        <div className="p-4">
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                Article Title ↕
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                Section ↕
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                Article Type ↕
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                Level 1 ↕
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-8">

                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeMap.content_articles.map((article, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {article.title}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${article.section === 'Core'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {article.section}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-600 text-white">
                                                        {article.article_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {article.category_l1}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button className="text-slate-400 hover:text-slate-600">
                                                        ⋮
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SEO Optimization */}
            {activeMap.seo_optimization && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader
                        title="SEO Optimization"
                        color="from-green-600 to-green-700"
                        icon={ChartBarIcon}
                        section="seo"
                    />
                    {expandedSections.seo && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Topic Clusters */}
                                {activeMap.seo_optimization.topic_clusters?.length > 0 && (
                                    <div className="border border-purple-200 rounded p-3 bg-purple-50">
                                        <h4 className="text-sm font-semibold text-purple-700 mb-2">Topic Clusters</h4>
                                        <ul className="space-y-1">
                                            {activeMap.seo_optimization.topic_clusters.map((cluster, idx) => (
                                                <li key={idx} className="text-sm text-slate-700">• {cluster}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Schema Recommendations */}
                                {activeMap.seo_optimization.schema_recommendations?.length > 0 && (
                                    <div className="border border-blue-200 rounded p-3 bg-blue-50">
                                        <h4 className="text-sm font-semibold text-blue-700 mb-2">Schema Markup</h4>
                                        <ul className="space-y-1">
                                            {activeMap.seo_optimization.schema_recommendations.map((schema, idx) => (
                                                <li key={idx} className="text-sm text-slate-700">✓ {schema}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Entity Optimization */}
                                {activeMap.seo_optimization.entity_optimization?.length > 0 && (
                                    <div className="border border-green-200 rounded p-3 bg-green-50">
                                        <h4 className="text-sm font-semibold text-green-700 mb-2">Entity Optimization</h4>
                                        <ul className="space-y-1">
                                            {activeMap.seo_optimization.entity_optimization.map((tip, idx) => (
                                                <li key={idx} className="text-sm text-slate-700">→ {tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TopicalMap;

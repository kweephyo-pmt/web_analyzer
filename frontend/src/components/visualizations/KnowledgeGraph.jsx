import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceX, forceY } from 'd3-force';
import Card from '../ui/Card';
import Button from '../ui/Button';
import {
    ArrowsPointingOutIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const KnowledgeGraph = ({ graphData }) => {
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
    const [selectedNode, setSelectedNode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const updateDimensions = () => {
            const container = document.getElementById('graph-container');
            if (container) {
                setDimensions({
                    width: container.offsetWidth,
                    height: Math.max(800, window.innerHeight * 0.75)
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Auto-fit on load with delay
        setTimeout(() => {
            if (graphRef.current) {
                graphRef.current.zoomToFit(400, 120);
            }
        }, 1000);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Configure d3 forces for better node spacing
    useEffect(() => {
        if (!graphRef.current) return;

        // Give time for graph to initialize
        const timer = setTimeout(() => {
            const fg = graphRef.current;
            if (!fg) return;

            // Configure charge force - different strength for domains vs children
            fg.d3Force('charge').strength(node => {
                // Weaker repulsion for domain nodes so they stay closer
                if (node.type === 'domain') {
                    return -150;
                }
                // Stronger repulsion for children to spread them out
                return -500;
            }).distanceMax(400);

            // Configure link force - larger distances for domain-child, smaller for domain-domain
            fg.d3Force('link')
                .distance(link => {
                    const sourceType = typeof link.source === 'object' ? link.source.type : null;
                    const targetType = typeof link.target === 'object' ? link.target.type : null;
                    // Smaller distance between domains
                    if (sourceType === 'domain' && targetType === 'domain') {
                        return 80;
                    }
                    // Larger distance for domain-to-child connections
                    if (sourceType === 'domain' || targetType === 'domain') {
                        return 160;
                    }
                    return 100;
                })
                .strength(link => {
                    const sourceType = typeof link.source === 'object' ? link.source.type : null;
                    const targetType = typeof link.target === 'object' ? link.target.type : null;
                    // Stronger link between domains to keep them together
                    if (sourceType === 'domain' && targetType === 'domain') {
                        return 1.0;
                    }
                    return 0.3;
                });

            // Add X force - pull domains to center horizontally
            fg.d3Force('x', forceX()
                .x(0)
                .strength(node => node.type === 'domain' ? 0.3 : 0.02)
            );

            // Add Y force - pull domains to center vertically
            fg.d3Force('y', forceY()
                .y(0)
                .strength(node => node.type === 'domain' ? 0.3 : 0.02)
            );

            // Configure center force - remove default center to let x/y take over
            fg.d3Force('center', null);

            // Add collision force to prevent overlap
            fg.d3Force('collide', forceCollide()
                .radius(node => Math.sqrt(node.size || 8) * 8 + 5)
                .strength(0.8)
                .iterations(2)
            );

            // Reheat simulation to apply new forces
            fg.d3ReheatSimulation();
        }, 500);

        return () => clearTimeout(timer);
    }, [graphData]);

    // Handle search functionality
    useEffect(() => {
        if (!graphRef.current || !searchTerm) return;

        const matchingNodes = graphData.nodes.filter(node =>
            node.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (matchingNodes.length > 0) {
            // Center on first matching node
            const firstMatch = matchingNodes[0];
            if (graphRef.current && firstMatch.x !== undefined && firstMatch.y !== undefined) {
                graphRef.current.centerAt(firstMatch.x, firstMatch.y, 1000);
                graphRef.current.zoom(1.5, 1000);
            }
        }
    }, [searchTerm, graphData]);

    const handleNodeClick = (node) => {
        setSelectedNode(node);
        if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(1.5, 1000);
        }
    };

    const handleReset = () => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(400, 120);
        }
        setSelectedNode(null);
        setSearchTerm('');
    };

    // Get domain clusters
    const domains = graphData.nodes.filter(n => n.type === 'domain');

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Knowledge Graph</h2>
                        <p className="text-sm text-slate-600">
                            {graphData.nodes.length} entities • {graphData.links.length} relationships
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-48"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                            <ArrowsPointingOutIcon className="w-4 h-4 mr-1" />
                            Reset
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Domain Legend */}
            {domains.length > 0 && (
                <Card className="bg-gradient-to-br from-slate-50 to-blue-50/20">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Domain Clusters</h3>
                    <div className="flex flex-wrap gap-3">
                        {domains.map((domain) => (
                            <div
                                key={domain.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => handleNodeClick(domain)}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: domain.color }}
                                />
                                <span className="text-sm font-medium text-slate-700">{domain.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Graph Container */}
            <Card className="p-0 overflow-hidden">
                <div
                    id="graph-container"
                    className="bg-white"
                    style={{ width: '100%', height: dimensions.height }}
                >
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={graphData}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="#ffffff"

                        // Node styling - clean circles like the reference
                        nodeRelSize={6}
                        nodeVal={node => node.size || 8}
                        nodeColor={node => node.color || '#3b82f6'}
                        nodeLabel={node => node.label}

                        // Link styling - clean lines with labels
                        linkColor={() => '#94a3b8'}
                        linkWidth={2}
                        linkDirectionalArrowLength={6}
                        linkDirectionalArrowRelPos={1}
                        linkDirectionalParticles={0}
                        linkCurvature={0.15}
                        linkLabel={link => link.label || ''}
                        linkCanvasObjectMode={() => 'after'}
                        linkCanvasObject={(link, ctx) => {
                            // Draw link label in the middle of the link
                            if (link.label) {
                                const start = link.source;
                                const end = link.target;

                                // Calculate middle point
                                const textPos = {
                                    x: start.x + (end.x - start.x) / 2,
                                    y: start.y + (end.y - start.y) / 2
                                };

                                // Draw label background
                                ctx.font = '10px Inter, Arial, sans-serif';
                                const textWidth = ctx.measureText(link.label).width;
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                                ctx.fillRect(
                                    textPos.x - textWidth / 2 - 4,
                                    textPos.y - 8,
                                    textWidth + 8,
                                    16
                                );

                                // Draw label text
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = '#64748b';
                                ctx.fillText(link.label, textPos.x, textPos.y);
                            }
                        }}

                        // Node rendering - clean circles with centered labels
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.label || node.id;
                            const size = Math.sqrt(node.size || 8) * 6;
                            const isSearchMatch = searchTerm && label.toLowerCase().includes(searchTerm.toLowerCase());

                            // Draw search highlight ring
                            if (isSearchMatch) {
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
                                ctx.strokeStyle = '#fbbf24'; // Yellow highlight
                                ctx.lineWidth = 3;
                                ctx.stroke();
                            }

                            // Draw node circle
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                            ctx.fillStyle = node.color || '#3b82f6';
                            ctx.fill();

                            // Draw white border
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 3;
                            ctx.stroke();

                            // Draw label inside circle
                            ctx.font = `${node.type === 'domain' ? '11px' : '10px'} Inter, Arial, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#ffffff';

                            // Word wrap for long labels
                            const words = label.split(' ');
                            const maxWidth = size * 1.6;
                            let lines = [];
                            let currentLine = words[0];

                            for (let i = 1; i < words.length; i++) {
                                const testLine = currentLine + ' ' + words[i];
                                const metrics = ctx.measureText(testLine);
                                if (metrics.width > maxWidth) {
                                    lines.push(currentLine);
                                    currentLine = words[i];
                                } else {
                                    currentLine = testLine;
                                }
                            }
                            lines.push(currentLine);

                            // Draw lines
                            const lineHeight = 12;
                            const startY = node.y - ((lines.length - 1) * lineHeight) / 2;
                            lines.forEach((line, i) => {
                                ctx.fillText(line, node.x, startY + i * lineHeight);
                            });
                        }}

                        // Physics forces for better spacing
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.3}
                        warmupTicks={100}
                        cooldownTicks={200}

                        // Interactions
                        onNodeClick={handleNodeClick}
                        onNodeDragEnd={node => {
                            node.fx = node.x;
                            node.fy = node.y;
                        }}
                    />

                    {/* Help Text */}
                    <div className="text-center py-3 bg-slate-50 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            💡 <span className="font-medium">Click and drag</span> nodes • <span className="font-medium">Scroll</span> to zoom • <span className="font-medium">Click</span> for details
                        </p>
                    </div>
                </div>
                <br></br>
            </Card>

            {/* Selected Node Info */}
            {selectedNode && (
                <Card className="bg-white border-2 border-primary-200 shadow-xl">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                                    style={{ backgroundColor: selectedNode.color }}
                                >
                                    <span className="text-white font-bold text-sm">
                                        {selectedNode.label.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedNode.label}</h3>
                                    <p className="text-sm text-slate-500 capitalize mt-0.5">
                                        {selectedNode.type} Entity
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Entity Details */}
                        <div className="space-y-3">
                            {/* Connections */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Connections</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {graphData.links.filter(l =>
                                                l.source.id === selectedNode.id || l.target.id === selectedNode.id
                                            ).length}
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">Total Links</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-green-600">
                                            {selectedNode.size || 8}
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">Importance</div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Entities */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Related Entities</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {graphData.links
                                        .filter(l => l.source.id === selectedNode.id || l.target.id === selectedNode.id)
                                        .slice(0, 5)
                                        .map((link, idx) => {
                                            const relatedNode = link.source.id === selectedNode.id ? link.target : link.source;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                    onClick={() => handleNodeClick(relatedNode)}
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: relatedNode.color }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-slate-900 truncate">
                                                            {relatedNode.label}
                                                        </div>
                                                        {link.label && (
                                                            <div className="text-xs text-slate-500 truncate">
                                                                {link.label}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Node Type Info */}
                            <div className="pt-3 border-t border-slate-200">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Node ID: {selectedNode.id}</span>
                                    <span className="capitalize">{selectedNode.type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default KnowledgeGraph;

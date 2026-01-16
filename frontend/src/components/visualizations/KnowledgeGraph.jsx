import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import Card from '../ui/Card';
import Button from '../ui/Button';

const KnowledgeGraph = ({ graphData }) => {
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        const updateDimensions = () => {
            const container = document.getElementById('graph-container');
            if (container) {
                setDimensions({
                    width: container.offsetWidth,
                    height: Math.max(700, window.innerHeight * 0.7)
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Auto-fit on load
        setTimeout(() => {
            if (graphRef.current) {
                graphRef.current.zoomToFit(400, 100);
            }
        }, 500);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const handleNodeClick = (node) => {
        setSelectedNode(node);
        if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(2, 1000);
        }
    };

    const handleReset = () => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(400, 100);
        }
        setSelectedNode(null);
    };

    // Get domain clusters
    const domains = graphData.nodes.filter(n => n.type === 'domain');

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Knowledge Graph</h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {graphData.nodes.length} entities • {graphData.links.length} relationships • {domains.length} domains
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        Reset View
                    </Button>
                </div>
            </Card>

            {/* Domain Legend */}
            <Card>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Domain Clusters
                </h3>
                <div className="flex flex-wrap gap-3">
                    {domains.map((domain) => (
                        <div key={domain.id} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: domain.color }}
                            />
                            <span className="text-sm font-medium text-slate-700">
                                {domain.label}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

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

                        // Node appearance
                        nodeRelSize={1}
                        nodeVal={node => node.size || 10}
                        nodeColor={node => node.color}
                        nodeLabel={node => `${node.label} (${node.type})`}

                        // Link appearance
                        linkColor={() => '#cbd5e1'}
                        linkWidth={1}
                        linkDirectionalArrowLength={3}
                        linkDirectionalArrowRelPos={1}
                        linkCurvature={0.1}

                        // Interactions
                        onNodeClick={handleNodeClick}
                        onNodeDragEnd={node => {
                            node.fx = node.x;
                            node.fy = node.y;
                        }}

                        // Custom node rendering with labels directly below
                        nodeCanvasObjectMode={() => 'after'}
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.label || node.id;
                            const fontSize = node.type === 'domain' ? 7 : 6;

                            // Get actual node radius (the visual size on screen)
                            const nodeRadius = Math.sqrt(node.size || 10) * 4;  // react-force-graph uses sqrt scaling

                            // Position label very close below the node's visual edge
                            const labelY = node.y + nodeRadius + 2;

                            // Draw label
                            ctx.font = `${fontSize}px Arial, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'top';
                            ctx.fillStyle = '#1e293b';
                            ctx.fillText(label, node.x, labelY);
                        }}

                        // Optimized physics for compact, organized layout
                        d3AlphaDecay={0.015}
                        d3VelocityDecay={0.3}
                        d3Force={{
                            charge: {
                                strength: -250,  // Reduced repulsion for tighter packing
                                distanceMax: 180
                            },
                            link: {
                                distance: 30,  // Very short links for compact clusters
                                strength: 1
                            },
                            collision: {
                                radius: node => {
                                    const nodeVal = node.size || 10;
                                    return Math.sqrt(nodeVal) * 4 + 3;  // Tight collision
                                },
                                strength: 0.9
                            },
                            center: {
                                x: dimensions.width / 2,
                                y: dimensions.height / 2,
                                strength: 0.08
                            },
                            x: {
                                strength: 0.4,  // Horizontal positioning
                                x: node => {
                                    if (node.type === 'domain') {
                                        const domainIndex = graphData.nodes.filter(n => n.type === 'domain').indexOf(node);
                                        const totalDomains = graphData.nodes.filter(n => n.type === 'domain').length;
                                        const spacing = dimensions.width / (totalDomains + 1);
                                        return spacing * (domainIndex + 1);
                                    }
                                    return dimensions.width / 2;
                                }
                            }
                        }}
                        warmupTicks={200}
                        cooldownTicks={300}
                    />
                </div>
            </Card>

            {/* Selected Node Info */}
            {selectedNode && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                                {selectedNode.label}
                            </h3>
                            <p className="text-sm text-slate-600 capitalize">
                                {selectedNode.type}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="text-slate-400 hover:text-slate-600 text-xl"
                        >
                            ✕
                        </button>
                    </div>
                </Card>
            )}

            {/* Instructions */}
            <div className="text-center text-sm text-slate-500">
                💡 <strong>Tip:</strong> Click and drag nodes • Scroll to zoom • Click nodes for details
            </div>
        </div>
    );
};

export default KnowledgeGraph;

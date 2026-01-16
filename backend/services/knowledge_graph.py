"""
AI-Powered Knowledge Graph Generator
Generates separate knowledge graph clusters for each domain
"""
import networkx as nx
from typing import Dict, List
from models.schemas import KnowledgeGraphData, Node, Link
from .ai_service import ai_service
import json
from urllib.parse import urlparse


class KnowledgeGraphGenerator:
    """Generate knowledge graphs with AI-powered entity extraction and domain-based clustering"""
    
    def __init__(self):
        # Color palette for different domains
        self.domain_colors = [
            '#3b82f6',  # Blue
            '#ef4444',  # Red
            '#10b981',  # Green
            '#f59e0b',  # Amber
            '#8b5cf6',  # Purple
            '#ec4899',  # Pink
            '#06b6d4',  # Cyan
            '#f97316',  # Orange
            '#14b8a6',  # Teal
            '#a855f7',  # Violet
        ]
    
    async def extract_entities_for_domain(self, domain: str, scraped_content: Dict) -> Dict:
        """Extract entities for a specific domain using AI"""
        
        system_prompt = """You are an expert at analyzing websites and extracting key entities.
Extract the most important entities from the website content.
Return ONLY valid JSON without markdown formatting."""
        
        prompt = f"""Analyze this website and extract key entities:

Domain: {domain}
Title: {scraped_content.get('title', '')}
Description: {scraped_content.get('description', '')}
Content Preview: {scraped_content.get('text_content', '')[:2000]}

Extract entities in these categories:
- services: Main services or offerings (max 8)
- products: Specific products (max 8)
- technologies: Technologies used or mentioned (max 6)
- audiences: Target audiences (max 5)
- topics: Main topics or themes (max 6)

Return JSON format:
{{
  "services": ["Service 1", "Service 2"],
  "products": ["Product 1", "Product 2"],
  "technologies": ["Tech 1", "Tech 2"],
  "audiences": ["Audience 1", "Audience 2"],
  "topics": ["Topic 1", "Topic 2"]
}}

Keep names concise (under 40 characters)."""
        
        try:
            entities = await ai_service.extract_json(prompt, system_prompt)
            
            # Validate and clean
            cleaned = {}
            for key in ['services', 'products', 'technologies', 'audiences', 'topics']:
                if key in entities and isinstance(entities[key], list):
                    cleaned[key] = [str(item)[:40] for item in entities[key][:10]]
                else:
                    cleaned[key] = []
            
            return cleaned
            
        except Exception as e:
            print(f"AI extraction failed for {domain}: {e}")
            return {
                'services': [],
                'products': [],
                'technologies': [],
                'audiences': [],
                'topics': []
            }
    
    async def generate_graph(self, scraped_data: List[Dict]) -> KnowledgeGraphData:
        """Generate knowledge graph with separate clusters per domain"""
        
        print("🔍 Generating AI-powered knowledge graph...")
        
        nodes = []
        links = []
        node_ids = set()
        
        # Process each domain separately
        for idx, data in enumerate(scraped_data):
            if data.get('status') != 'success':
                domain = urlparse(data['url']).netloc.replace('www.', '')
                error_msg = data.get('error', 'Unknown error')
                print(f"  ⚠️  Skipping {domain}: {error_msg}")
                continue
            
            # Extract domain
            parsed = urlparse(data['url'])
            domain = parsed.netloc.replace('www.', '')
            
            # Assign color to this domain
            domain_color = self.domain_colors[idx % len(self.domain_colors)]
            
            print(f"  📊 Processing {domain}...")
            
            # Extract entities using AI
            entities = await self.extract_entities_for_domain(domain, data)
            
            # Create domain node (center of cluster)
            domain_id = f"domain_{domain}"
            nodes.append(Node(
                id=domain_id,
                label=domain,
                type='domain',
                color=domain_color,
                size=80  # Very large domain nodes like reference
            ))
            node_ids.add(domain_id)
            
            # Add entity nodes and connect to domain
            for entity_type, entity_list in entities.items():
                for entity in entity_list:
                    if not entity:
                        continue
                    
                    # Create unique node ID (domain-specific)
                    node_id = f"{domain}_{entity_type}_{entity}"
                    
                    if node_id not in node_ids:
                        nodes.append(Node(
                            id=node_id,
                            label=entity,
                            type=entity_type,
                            color=domain_color,  # Same color as domain
                            size=35  # Visible entity nodes
                        ))
                        node_ids.add(node_id)
                        
                        # Connect to domain
                        links.append(Link(
                            source=domain_id,
                            target=node_id,
                            label=entity_type,
                            inferred=False
                        ))
            
            # Create some intelligent connections within the domain
            # Connect services to products
            for service in entities.get('services', [])[:3]:
                service_id = f"{domain}_services_{service}"
                if service_id in node_ids:
                    for product in entities.get('products', [])[:2]:
                        product_id = f"{domain}_products_{product}"
                        if product_id in node_ids:
                            links.append(Link(
                                source=service_id,
                                target=product_id,
                                label='offers',
                                inferred=False
                            ))
            
            # Connect technologies to services
            for tech in entities.get('technologies', [])[:3]:
                tech_id = f"{domain}_technologies_{tech}"
                if tech_id in node_ids:
                    for service in entities.get('services', [])[:2]:
                        service_id = f"{domain}_services_{service}"
                        if service_id in node_ids:
                            links.append(Link(
                                source=tech_id,
                                target=service_id,
                                label='powers',
                                inferred=False
                            ))
        
        print(f"✅ Knowledge graph complete!")
        print(f"   - {len(nodes)} nodes")
        print(f"   - {len(links)} relationships")
        print(f"   - {len([n for n in nodes if n.type == 'domain'])} domain clusters")
        
        return KnowledgeGraphData(nodes=nodes, links=links)


# Singleton instance
kg_generator = KnowledgeGraphGenerator()

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
    
    async def extract_entities_for_domain(self, domain: str, scraped_content: Dict, additional_pages: List[Dict] = None) -> Dict:
        """Extract entities for a specific domain using AI with multi-page analysis"""
        
        # Use Firecrawl markdown if available for better content
        if scraped_content.get('source') == 'firecrawl' and scraped_content.get('markdown'):
            main_text = scraped_content.get('markdown', '')[:3000]
        else:
            main_text = scraped_content.get('text_content', '')[:2000]
        
        # Prepare comprehensive content from multiple pages
        main_content = f"""
Domain: {domain}
Title: {scraped_content.get('title', '')}
Description: {scraped_content.get('description', '')}
Main Content: {main_text}
"""
        
        # Add additional page data if available
        additional_context = ""
        if additional_pages:
            additional_context = "\n\nAdditional Pages Analyzed:\n"
            for idx, page in enumerate(additional_pages[:5], 1):
                additional_context += f"\nPage {idx}:\n"
                additional_context += f"- Title: {page.get('title', 'N/A')}\n"
                additional_context += f"- H1: {', '.join(page.get('headings', {}).get('h1', [])[:2])}\n"
                additional_context += f"- H2: {', '.join(page.get('headings', {}).get('h2', [])[:3])}\n"
        
        system_prompt = """You are an expert at analyzing websites and extracting key entities.
Extract the most important entities from the website content across multiple pages.
Return ONLY valid JSON without markdown formatting."""
        
        prompt = f"""Analyze this website comprehensively and extract key entities:

{main_content}
{additional_context}

Extract entities in these categories:
- services: Main services or offerings (max 10)
- products: Specific products (max 10)
- technologies: Technologies used or mentioned (max 8)
- audiences: Target audiences (max 6)
- topics: Main topics or themes (max 8)

Return JSON format:
{{
  "services": ["Service 1", "Service 2"],
  "products": ["Product 1", "Product 2"],
  "technologies": ["Tech 1", "Tech 2"],
  "audiences": ["Audience 1", "Audience 2"],
  "topics": ["Topic 1", "Topic 2"]
}}

Keep names concise (under 40 characters). Prioritize the most important and frequently mentioned entities."""
        
        try:
            # Use DeepSeek for entity extraction (better quality, no rate limits)
            entities = await ai_service.extract_json(prompt, system_prompt, use_deepseek=True)
            
            # Validate and clean
            cleaned = {}
            for key in ['services', 'products', 'technologies', 'audiences', 'topics']:
                if key in entities and isinstance(entities[key], list):
                    cleaned[key] = [str(item)[:40] for item in entities[key][:12]]
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
        """Generate knowledge graph with separate clusters per domain using multi-page analysis"""
        
        print("🔍 Generating AI-powered knowledge graph...")
        
        nodes = []
        links = []
        node_ids = set()
        
        # Import services for sitemap and scraping
        from .sitemap_service import sitemap_service
        from .scraper import scraper
        import asyncio
        
        # Group URLs by domain first to avoid duplicates
        domain_groups = {}
        for data in scraped_data:
            if data.get('status') != 'success':
                continue
            
            parsed = urlparse(data['url'])
            domain = parsed.netloc.replace('www.', '')
            
            if domain not in domain_groups:
                domain_groups[domain] = []
            domain_groups[domain].append(data)
        
        print(f"  📊 Found {len(domain_groups)} unique domain(s)")
        
        # Process each unique domain
        for idx, (domain, domain_data_list) in enumerate(domain_groups.items()):
            # Assign color to this domain
            domain_color = self.domain_colors[idx % len(self.domain_colors)]
            
            print(f"  📊 Processing {domain} ({len(domain_data_list)} URL(s))...")
            
            # Combine all entities from all URLs in this domain
            all_entities = {
                'services': [],
                'products': [],
                'technologies': [],
                'audiences': [],
                'topics': []
            }
            
            # Process each URL from this domain
            for data in domain_data_list:
                url = data['url']
                
                # Fetch sitemap and scrape additional pages (only for first URL to avoid duplication)
                additional_pages = []
                if domain_data_list.index(data) == 0:  # Only for first URL
                    print(f"     → Fetching sitemap...")
                    sitemap_urls = await sitemap_service.get_priority_pages(url, max_pages=5)
                    print(f"     → Found {len(sitemap_urls)} priority pages")
                    
                    # Scrape additional pages (excluding main page)
                    async def scrape_page(sitemap_url):
                        if sitemap_url == url:  # Skip the main page
                            return None
                        try:
                            page_data = await scraper.scrape_url(sitemap_url)
                            if page_data.get('status') == 'success':
                                return {
                                    'url': sitemap_url,
                                    'title': page_data.get('title', ''),
                                    'headings': page_data.get('headings', {})
                                }
                        except Exception as e:
                            print(f"     → Skipped {sitemap_url}: {str(e)}")
                        return None
                    
                    # Scrape up to 3 additional pages in parallel
                    tasks = [scrape_page(sitemap_url) for sitemap_url in sitemap_urls[:4]]
                    results = await asyncio.gather(*tasks)
                    additional_pages = [page for page in results if page is not None]
                    
                    print(f"     → Scraped {len(additional_pages)} additional pages")
                
                # Extract entities using AI
                print(f"     → Extracting entities from {url.split('/')[-1] or 'homepage'}...")
                entities = await self.extract_entities_for_domain(domain, data, additional_pages)
                
                # Merge entities (avoid duplicates)
                for entity_type, entity_list in entities.items():
                    for entity in entity_list:
                        if entity and entity not in all_entities[entity_type]:
                            all_entities[entity_type].append(entity)
            
            # Create single domain node for this domain
            domain_id = f"domain_{domain}"
            nodes.append(Node(
                id=domain_id,
                label=domain,
                type='domain',
                color=domain_color,
                size=80  # Very large domain nodes
            ))
            node_ids.add(domain_id)
            
            # Add entity nodes and connect to domain
            for entity_type, entity_list in all_entities.items():
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
            for service in all_entities.get('services', [])[:3]:
                service_id = f"{domain}_services_{service}"
                if service_id in node_ids:
                    for product in all_entities.get('products', [])[:2]:
                        product_id = f"{domain}_products_{product}"
                        if product_id in node_ids:
                            links.append(Link(
                                source=service_id,
                                target=product_id,
                                label='offers',
                                inferred=False
                            ))
            
            # Connect technologies to services
            for tech in all_entities.get('technologies', [])[:3]:
                tech_id = f"{domain}_technologies_{tech}"
                if tech_id in node_ids:
                    for service in all_entities.get('services', [])[:2]:
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
        print(f"   - {len([n for n in nodes if n.type == 'domain'])} domain cluster(s)")
        
        return KnowledgeGraphData(nodes=nodes, links=links)


# Singleton instance
kg_generator = KnowledgeGraphGenerator()

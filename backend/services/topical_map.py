from typing import Dict, List
from models.schemas import TopicalMapData
from .ai_service import ai_service
import json
import asyncio


class TopicalMapGenerator:
    """
    AI-powered topical map generator with comprehensive semantic analysis.
    
    Implements the complete 8-part semantic website analysis framework:
    - Part 1: Business Intelligence Extraction
    - Part 2: Deep Semantic Analysis
    - Part 3: Competitive & Source Analysis
    - Part 4: Content Strategy Framework
    - Part 5: Comprehensive Query Research
    - Part 6: Content Plan Generation
    - Part 7: Semantic SEO Optimization
    - Part 8: Competitive Positioning
    """
    
    def _extract_content_themes(self, pages: List[Dict]) -> List[str]:
        """Extract main content themes from existing pages"""
        themes = []
        for page in pages[:5]:
            # Extract themes from H1 and H2 headings
            h1s = page.get('headings', {}).get('h1', [])
            h2s = page.get('headings', {}).get('h2', [])[:3]
            
            if h1s:
                themes.extend(h1s)
            if h2s:
                themes.extend(h2s)
        
        # Return unique themes
        return list(set(themes))[:15]
    
    async def generate_topical_map_with_ai(self, scraped_data: Dict) -> TopicalMapData:
        """
        Generate comprehensive topical map using AI with detailed 8-part semantic analysis.
        
        This method performs:
        1. Multi-page content scraping from sitemap
        2. Comprehensive semantic analysis using DeepSeek AI
        3. Real competitor detection from SERP data
        4. Expansive content plan generation (150-200+ articles)
        """
        
        url = scraped_data.get('url', '')
        title = scraped_data.get('title', '')
        description = scraped_data.get('description', '')
        
        # Use Firecrawl markdown if available (better structure), otherwise use text_content
        if scraped_data.get('source') == 'firecrawl' and scraped_data.get('markdown'):
            # Firecrawl: Use full markdown (better structure, more context)
            text = scraped_data.get('markdown', '')[:8000]  # Use more content from markdown
            print(f"✅ Using Firecrawl markdown ({len(text)} chars)")
        else:
            # BeautifulSoup: Use text_content
            text = scraped_data.get('text_content', '')[:5000]
            print(f"📄 Using BeautifulSoup text ({len(text)} chars)")
        
        headings = scraped_data.get('headings', {})
        links = scraped_data.get('links', [])
        
        # Extract domain as central entity
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc.replace('www.', '')
        central_entity = domain.split('.')[0].title()
        
        # Fetch sitemap and scrape additional pages for better analysis
        print(f"🔍 Fetching sitemap for {domain}...")
        from .sitemap_service import sitemap_service
        from .scraper import scraper
        
        sitemap_urls = await sitemap_service.get_priority_pages(url, max_pages=5)
        print(f"📄 Found {len(sitemap_urls)} priority pages from sitemap")
        
        # Scrape additional pages in parallel with FULL content for better analysis
        async def scrape_page(sitemap_url):
            if sitemap_url == url:  # Skip the main page
                return None
            try:
                page_data = await scraper.scrape_url(sitemap_url)
                if page_data.get('status') == 'success':
                    # Get full content for content strategy analysis
                    if page_data.get('source') == 'firecrawl' and page_data.get('markdown'):
                        content_preview = page_data.get('markdown', '')[:2000]
                    else:
                        content_preview = page_data.get('text_content', '')[:1500]
                    
                    return {
                        'url': sitemap_url,
                        'title': page_data.get('title', ''),
                        'headings': page_data.get('headings', {}),
                        'content_preview': content_preview,
                        'h2_count': len(page_data.get('headings', {}).get('h2', []))
                    }
            except Exception as e:
                print(f"  -> Skipped {sitemap_url}: {str(e)}")
            return None
        
        # Scrape pages in parallel
        tasks = [scrape_page(sitemap_url) for sitemap_url in sitemap_urls[:5]]
        results = await asyncio.gather(*tasks)
        additional_pages = [page for page in results if page is not None]
        
        print(f"✅ Successfully scraped {len(additional_pages)} additional pages")
        
        # Prepare comprehensive content data
        content_data = {
            'url': url,
            'domain': domain,
            'title': title,
            'description': description,
            'h1_headings': headings.get('h1', []),
            'h2_headings': headings.get('h2', [])[:15],
            'h3_headings': headings.get('h3', [])[:15],
            'text_preview': text,
            'sample_links': [{'text': link.get('text', ''), 'url': link.get('url', '')} for link in links[:30]],
            'sitemap_pages': len(sitemap_urls),
            'additional_pages_analyzed': len(additional_pages),
            'site_structure': [     
                {
                    'url': page['url'],
                    'title': page['title'],
                    'h1': page['headings'].get('h1', [])[:3],
                    'h2': page['headings'].get('h2', [])[:5],
                    'content_preview': page.get('content_preview', '')[:500],
                    'h2_count': page.get('h2_count', 0)
                }
                for page in additional_pages[:5]
            ],
            'existing_content_themes': self._extract_content_themes(additional_pages)
        }
        
        # System prompt for AI analysis
        system_prompt = """You are an expert SEO strategist and business analyst specializing in semantic website analysis and content strategy.
Analyze the provided website data and create a comprehensive topical map following the 8-part semantic analysis framework.
Return ONLY valid JSON without markdown formatting."""
        
        # Main analysis prompt - comprehensive 8-part framework
        prompt = f"""Perform a COMPREHENSIVE semantic analysis of this website using the detailed 8-part framework below.

Website Data:
{json.dumps(content_data, indent=2)}

═══════════════════════════════════════════════════════════
COMPREHENSIVE SEMANTIC WEBSITE ANALYSIS FRAMEWORK
═══════════════════════════════════════════════════════════

PART 1: BUSINESS INTELLIGENCE EXTRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyze and document:
• Company Overview: What the business does, founding year (if available), geographic presence
• Business Model: Asset structure, revenue model, operational approach (B2B/B2C/SaaS/Marketplace/etc)
• Technology Stack: Key technologies enabling the service/product (5-10 items)
• Unique Value Propositions: What differentiates from competitors (3-5 items)
• Target Markets: Geographic regions, industry verticals served
• Service/Product Taxonomy: Primary offerings with hierarchical breakdown

PART 2: DEEP SEMANTIC ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For the central entity, document ALL these relationship types:

✦ Core Entities (5-10): Direct, fundamental concepts
✦ Derived Entities (5-10): Specialized variations
✦ Attributes (8-15): Characteristics, metrics, standards, capabilities
✦ Context Terms (8-15): Usage scenarios, applications, industry contexts
✦ Synonyms (5-10): Alternative terms, jargon, regional variations
✦ Antonyms (3-5): Contrasting concepts, what it's NOT
✦ Hypernyms (3-5): Broader categories, parent classifications
✦ Hyponyms (5-10): Specific subcategories, niche applications
✦ Holonyms (3-5): Larger systems/frameworks it belongs to
✦ Meronyms (5-10): Component parts, service elements, features
✦ Troponyms (3-5): Specific methods, process variations
✦ Entailments (3-5): Logical consequences, guaranteed outcomes
✦ Acronyms (5-10): Industry abbreviations, technical terms
✦ Polysemes (2-5): Multiple meanings in different contexts
✦ Related Concepts (5-10): Connected ideas, complementary services

PART 3: COMPETITIVE & SOURCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyze the competitive landscape:
• Top Competitors (5-10): Main competing websites/brands in the space
• Content Approaches (3-5): How competitors structure their content strategies
• Gap Opportunities (4-6): What competitors are missing that this site could capitalize on
• SERP Insights (3-5): What Google prioritizes for target keywords (content types, lengths, features, schema)

PART 4: CONTENT STRATEGY FRAMEWORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT: Analyze the 'existing_content_themes' and 'site_structure' data provided to understand what content already exists.

Based on existing content analysis:
• Audience Segments (3-5): Define detailed segments with expertise levels, goals, pain points, content preferences
• Core Topics (6-10): Direct revenue/conversion topics (identify which are MISSING from existing content)
• Outer Topics (8-12): Authority/traffic building topics (identify which are MISSING from existing content)
• Content Gaps (4-6): Specific topics/angles NOT covered in existing {len(content_data.get('existing_content_themes', []))} content themes
• Priority Areas (4-6): Top strategic content focuses based on what's missing vs what competitors rank for

PART 5: COMPREHENSIVE QUERY RESEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provide 8-15 example queries per category:

📌 Raw Queries (5-8): Direct, unmodified search terms
📌 Informational (10-15): "what is...", "how does... work", "guide to..."
📌 Transactional (8-12): "buy...", "sign up...", "order...", "get quote..."
📌 Commercial (10-15): "best...", "vs...", "compare...", "review...", "top..."
📌 Navigational (5-8): Brand + service type searches
📌 Contextual (8-12): Local, problem-solution, future-oriented
📌 Audience-Specific (10-15): Beginner/Advanced/Professional specific queries
📌 Predictive (5-8): "future of...", "trends in...", "2024..."
📌 Voice Search (5-8): Conversational, question-based queries

PART 6: CONTENT PLAN GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create 30-50 article ideas with:
• Title: Specific, SEO-optimized article title
• Section: "Core" (revenue-focused) or "Outer" (authority-building)
• Article Type: "informative", "service_page", "listicle", "tool_page"
• Categories: L1 (main), L2 (sub), L3 (sub-sub) taxonomy levels
• Priority: 1 (Core/Quick wins), 2 (Strategic), 3 (Support/Long-tail)
• Source Context: 3-5 sentences explaining how to integrate company expertise, specific features to highlight, CTAs

PART 7: SEMANTIC SEO OPTIMIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provide:
• Topic Clusters (5-8): Groups of semantically related content that should interlink
• Schema Recommendations (5-8): Specific schema types to implement (Article, Service, FAQ, Organization, etc.)
• Entity Optimization (5-8): Tips for entity co-occurrence, salience, and relationship building in content

PART 8: COMPETITIVE POSITIONING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document:
• Competitive Advantages (5-8): Key differentiators
• Technology Stack (6-10): Technologies/tools/platforms used

PART 9: TAXONOMY STRUCTURE (Content Hierarchy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create a hierarchical content taxonomy following this tree structure:

Central Topic (Business/Service Name)
├── Level 1: Major Category A
│   ├── Level 2: Subcategory A1
│   │   ├── Level 3: Topic A1a
│   │   └── Level 3: Topic A1b
│   └── Level 2: Subcategory A2
│       ├── Level 3: Topic A2a
│       └── Level 3: Topic A2b
├── Level 1: Major Category B
│   ├── Level 2: Subcategory B1
│   └── Level 2: Subcategory B2
└── Level 1: Major Category C

Requirements:
• Create 3-5 Level 1 categories (main content pillars) - color: #4F46E5 (indigo)
• Each L1 MUST have 2-4 Level 2 subcategories - color: #10B981 (green)
• Each L2 MUST have 2-3 Level 3 sub-subcategories - color: #F59E0B (amber)
• CRITICAL: EVERY Level 1 node MUST have at least 2 children (Level 2 nodes)
• CRITICAL: EVERY Level 2 node MUST have at least 2 children (Level 3 nodes)
• NO empty children arrays for L1 or L2 nodes - all must be fully populated
• Total nodes: 15-25 nodes for comprehensive coverage
• Each node must have: name, level, parent (null for L1), children array, color
• Build taxonomy from content_articles categories to ensure consistency
• Names should be clear, specific, and SEO-friendly (not generic)



PART 10: ONTOLOGY RELATIONSHIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create semantic relationships (8-12 relations):
• Format: Subject → Predicate → Object → Context
• Use semantic_relationships data to build meaningful connections
• Examples:
  - "{central_entity}" → "provides" → "Core Service" → "Target Market"
  - "Technology" → "enables" → "Business Outcome" → "Industry Context"
• Focus on business value, capabilities, and domain expertise

═══════════════════════════════════════════════════════════
REQUIRED JSON OUTPUT STRUCTURE
═══════════════════════════════════════════════════════════

Return comprehensive JSON with this EXACT structure:

{{
  "business_description": "Detailed 300-400 word description covering: what they do, business model, value props, target markets, competitive positioning",
  "central_entity": "Main business/brand name",
  "business_model": "Specific model (e.g., 'B2B SaaS Platform', 'E-commerce Marketplace', 'Professional Services')",
  "search_intent": ["Primary Intent 1", "Intent 2", "Intent 3"],
  "target_audiences": ["Audience 1 (Level)", "Audience 2 (Level)", "Audience 3"],
  "conversion_methods": ["Method 1", "Method 2", "Method 3"],
  "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
  
  "semantic_relationships": {{
    "core_entities": ["Entity 1", "Entity 2", "..."],
    "derived_entities": ["Derived 1", "Derived 2", "..."],
    "attributes": ["Attribute 1", "Attribute 2", "..."],
    "context_terms": ["Context 1", "Context 2", "..."],
    "synonyms": ["Synonym 1", "Synonym 2", "..."],
    "antonyms": ["Antonym 1", "Antonym 2", "..."],
    "hypernyms": ["Hypernym 1", "Hypernym 2", "..."],
    "hyponyms": ["Hyponym 1", "Hyponym 2", "..."],
    "holonyms": ["Holonym 1", "Holonym 2", "..."],
    "meronyms": ["Meronym 1", "Meronym 2", "..."],
    "troponyms": ["Troponym 1", "Troponym 2", "..."],
    "entailments": ["Entailment 1", "Entailment 2", "..."],
    "acronyms": ["Acronym 1", "Acronym 2", "..."],
    "polysemes": ["Polyseme 1", "Polyseme 2", "..."],
    "related_concepts": ["Concept 1", "Concept 2", "..."]
  }},
  
  "audience_segments": [
    {{
      "name": "Segment Name",
      "expertise_level": "Beginner/Intermediate/Advanced/Expert",
      "primary_goal": "What they want to achieve",
      "pain_points": ["Pain 1", "Pain 2", "Pain 3"],
      "content_types": ["Type 1", "Type 2", "Type 3"]
    }}
  ],
  
  "content_strategy": {{
    "core_topics": ["Core Topic 1", "Core Topic 2", "..."],
    "outer_topics": ["Outer Topic 1", "Outer Topic 2", "..."],
    "content_gaps": ["Gap 1", "Gap 2", "..."],
    "priority_areas": ["Priority 1", "Priority 2", "..."]
  }},
  
  "query_templates": {{
    "raw_queries": ["Query 1", "Query 2", "..."],
    "informational": ["Query 1", "Query 2", "..."],
    "transactional": ["Query 1", "Query 2", "..."],
    "commercial": ["Query 1", "Query 2", "..."],
    "navigational": ["Query 1", "Query 2", "..."],
    "contextual": ["Query 1", "Query 2", "..."],
    "audience_specific": ["Query 1", "Query 2", "..."],
    "predictive": ["Query 1", "Query 2", "..."],
    "voice_search": ["Query 1", "Query 2", "..."]
  }},
  
  "competitive_analysis": {{
    "top_competitors": ["Competitor 1", "Competitor 2", "..."],
    "content_approaches": ["Approach 1", "Approach 2", "..."],
    "gap_opportunities": ["Opportunity 1", "Opportunity 2", "..."],
    "serp_insights": ["Insight 1", "Insight 2", "..."]
  }},
  
  "content_articles": [
    {{
      "title": "Specific Article Title",
      "section": "Core or Outer",
      "article_type": "informative/service_page/listicle/tool_page",
      "category_l1": "Main Category",
      "category_l2": "Subcategory",
      "category_l3": "Sub-subcategory",
      "priority": 1,
      "source_context": "3-5 sentences explaining integration strategy, company expertise, specific features to highlight, CTAs"
    }}
  ],
  
  "seo_optimization": {{
    "topic_clusters": ["Cluster 1", "Cluster 2", "..."],
    "schema_recommendations": ["Schema 1", "Schema 2", "..."],
    "entity_optimization": ["Tip 1", "Tip 2", "..."]
  }},
  
  "competitive_advantages": ["Advantage 1", "Advantage 2", "..."],
  "technology_stack": ["Tech 1", "Tech 2", "..."],
  
  "taxonomy": [
    {{
      "name": "Main Category Name",
      "level": 1,
      "parent": null,
      "children": ["Subcategory 1", "Subcategory 2"],
      "color": "#4F46E5"
    }},
    {{
      "name": "Subcategory 1",
      "level": 2,
      "parent": "Main Category Name",
      "children": ["Sub-sub 1", "Sub-sub 2"],
      "color": "#10B981"
    }},
    {{
      "name": "Sub-sub 1",
      "level": 3,
      "parent": "Subcategory 1",
      "children": [],
      "color": "#F59E0B"
    }},
    {{
      "name": "Sub-sub 2",
      "level": 3,
      "parent": "Subcategory 1",
      "children": [],
      "color": "#F59E0B"
    }},
    {{
      "name": "Subcategory 2",
      "level": 2,
      "parent": "Main Category Name",
      "children": ["Sub-sub 3"],
      "color": "#10B981"
    }},
    {{
      "name": "Sub-sub 3",
      "level": 3,
      "parent": "Subcategory 2",
      "children": [],
      "color": "#F59E0B"
    }}
  ],
  
  "ontology": [
    {{
      "subject": "AI Solutions",
      "predicate": "help",
      "object": "Automate Processes",
      "context": "Thai Businesses"
    }},
    {{
      "subject": "Machine Learning",
      "predicate": "learns",
      "object": "From Data",
      "context": "Efficiency and optimization"
    }}
  ]
}}

CRITICAL INSTRUCTIONS:
✓ Be SPECIFIC and DETAILED - use actual industry terminology, not generic placeholders
✓ Provide COMPREHENSIVE coverage - don't skip any sections
✓ Use domain expertise - demonstrate deep understanding of the industry
✓ Be ACTIONABLE - insights should directly inform content strategy
✓ Return ONLY the JSON object, no markdown code blocks or explanations
"""
        
        try:
            # Import AI service at the start
            from .ai_service import ai_service
            
            # Use DeepSeek for all analysis (high quality, no rate limits, ~10-15 min per URL)
            print(f"🤖 Generating topical analysis for {url}...")
            
            try:
                result = await ai_service.extract_json(prompt, system_prompt, use_deepseek=True)
            except ValueError as e:
                # If JSON parsing fails, try with a simplified prompt
                error_msg = str(e)
                if "Could not extract valid JSON" in error_msg:
                    print(f"⚠️ Comprehensive analysis failed, retrying with simplified prompt...")
                    
                    # Simplified prompt with fewer requirements
                    simplified_prompt = f"""Analyze this website and return a simplified topical map.

Website Data:
{json.dumps(content_data, indent=2)}

Return ONLY valid JSON with this structure (no markdown, no code blocks):
{{
  "business_description": "200-300 word description",
  "central_entity": "{central_entity}",
  "business_model": "B2B/B2C/SaaS/etc",
  "search_intent": ["Intent 1", "Intent 2", "Intent 3"],
  "target_audiences": ["Audience 1", "Audience 2"],
  "conversion_methods": ["Method 1", "Method 2"],
  "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
  "semantic_relationships": {{
    "core_entities": ["Entity 1", "Entity 2"],
    "attributes": ["Attr 1", "Attr 2"],
    "related_concepts": ["Concept 1", "Concept 2"]
  }},
  "content_articles": [
    {{
      "title": "Article Title",
      "section": "Core",
      "article_type": "informative",
      "category_l1": "Main Category",
      "category_l2": "Subcategory",
      "category_l3": "Sub-subcategory",
      "priority": 1,
      "source_context": "Brief description"
    }}
  ],
  "taxonomy": [
    {{
      "name": "Main Category",
      "level": 1,
      "parent": null,
      "children": ["Subcategory 1"],
      "color": "#4F46E5"
    }},
    {{
      "name": "Subcategory 1",
      "level": 2,
      "parent": "Main Category",
      "children": ["Topic 1"],
      "color": "#10B981"
    }},
    {{
      "name": "Topic 1",
      "level": 3,
      "parent": "Subcategory 1",
      "children": [],
      "color": "#F59E0B"
    }}
  ]
}}

CRITICAL: Return ONLY the JSON object. No explanations, no markdown formatting."""
                    
                    result = await ai_service.extract_json(
                        simplified_prompt,
                        "You are a business analyst. Return ONLY valid JSON without markdown formatting.",
                        use_deepseek=True
                    )
                    print(f"✅ Simplified analysis succeeded")
                else:
                    raise
            
            # Parse semantic relationships
            semantic_rel = None
            if 'semantic_relationships' in result:
                from models.schemas import SemanticRelationships
                semantic_rel = SemanticRelationships(**result['semantic_relationships'])
            
            # Parse audience segments
            audience_segs = None
            if 'audience_segments' in result and result['audience_segments']:
                from models.schemas import AudienceSegment
                audience_segs = [AudienceSegment(**seg) for seg in result['audience_segments']]
            
            # Parse content strategy
            content_strat = None
            if 'content_strategy' in result:
                from models.schemas import ContentStrategy
                content_strat = ContentStrategy(**result['content_strategy'])
            
            # Parse query templates
            query_temps = None
            if 'query_templates' in result:
                from models.schemas import QueryTemplates
                query_temps = QueryTemplates(**result['query_templates'])
            
            # Parse competitive analysis (Part 3)
            competitive_analysis = None
            if 'competitive_analysis' in result:
                from models.schemas import CompetitiveAnalysis
                competitive_analysis = CompetitiveAnalysis(**result['competitive_analysis'])
            
            # Parse content articles (Part 6) - Initial batch
            content_articles = None
            if 'content_articles' in result and result['content_articles']:
                from models.schemas import ContentArticle
                content_articles = [ContentArticle(**article) for article in result['content_articles']]
            
            # Parse SEO optimization (Part 7)
            seo_optimization = None
            if 'seo_optimization' in result:
                from models.schemas import SEOOptimization
                seo_optimization = SEOOptimization(**result['seo_optimization'])
            
            # Parse taxonomy (Part 9)
            taxonomy = None
            if 'taxonomy' in result and result['taxonomy']:
                from models.schemas import TaxonomyNode
                taxonomy = [TaxonomyNode(**node) for node in result['taxonomy']]
                
                # Validate taxonomy: Remove L1/L2 nodes with empty children
                if taxonomy:
                    validated_taxonomy = []
                    nodes_to_remove = set()
                    
                    # First pass: identify L1 and L2 nodes with no children
                    for node in taxonomy:
                        if node.level in [1, 2] and (not node.children or len(node.children) == 0):
                            nodes_to_remove.add(node.name)
                            print(f"⚠️  Removing empty taxonomy node: {node.name} (Level {node.level})")
                    
                    # Second pass: remove nodes and update parent references
                    for node in taxonomy:
                        # Skip nodes marked for removal
                        if node.name in nodes_to_remove:
                            continue
                        
                        # Remove references to deleted nodes from children arrays
                        if node.children:
                            node.children = [child for child in node.children if child not in nodes_to_remove]
                        
                        # Only keep nodes that aren't marked for removal
                        validated_taxonomy.append(node)
                    
                    taxonomy = validated_taxonomy if validated_taxonomy else None
                    
                    if taxonomy:
                        print(f"✅ Validated taxonomy: {len(taxonomy)} nodes (removed {len(nodes_to_remove)} empty branches)")
            
            # Parse ontology (Part 10)
            ontology = None
            if 'ontology' in result and result['ontology']:
                from models.schemas import OntologyRelation
                ontology = [OntologyRelation(**relation) for relation in result['ontology']]

            
            # Hybrid competitor detection: AI generates smart queries + SERP gets real results
            if competitive_analysis:
                print(f"🔍 Finding competitors using AI analysis + SERP API...")
                
                # Step 1: Use AI to generate smart search queries based on scraped content
                query_generation_prompt = f"""Based on this business analysis, generate 3-5 highly specific Google search queries that would find direct competitors.

Business Information:
- Domain: {content_data.get('domain')}
- Business Model: {result.get('business_model', '')}
- Central Entity: {result.get('central_entity', '')}
- Services/Products: {', '.join(result.get('key_topics', [])[:5])}
- Target Audience: {', '.join(result.get('target_audiences', [])[:3])}
- Business Description: {result.get('business_description', '')[:500]}

Site Content Themes:
{', '.join(content_data.get('existing_content_themes', [])[:10])}

Instructions:
1. Create 3-5 search queries that would find direct competitors on Google
2. Be specific about the industry, services, and location (if applicable)
3. Use terms like "best", "top", "agency", "company", "services" to find business websites
4. Example good queries: "custom tailoring bangkok", "bespoke suits thailand", "luxury tailors asia"
5. Example bad queries: "tailoring" (too generic), "suits" (too broad)

Return ONLY a JSON array of search queries:
["query 1", "query 2", "query 3"]
"""

                try:
                    from .serp_service import serp_service
                    
                    # Generate smart search queries using AI
                    queries_result = await ai_service.extract_json(
                        query_generation_prompt,
                        "You are a search query expert. Return only valid JSON array of search queries.",
                        use_deepseek=True
                    )
                    
                    # Extract queries
                    if isinstance(queries_result, list):
                        search_queries = queries_result[:5]
                    elif isinstance(queries_result, dict) and 'queries' in queries_result:
                        search_queries = queries_result['queries'][:5]
                    else:
                        # Fallback to basic queries
                        search_queries = [
                            f"{result.get('business_model', '')} {result.get('central_entity', '')}",
                            f"{result.get('key_topics', [''])[0]} services"
                        ]
                    
                    print(f"  📊 AI-generated search queries: {search_queries}")
                    
                    # Step 2: Use SERP API to get real competitors from Google
                    serp_insights = await serp_service.get_serp_insights(search_queries, domain)
                    
                    # Extract competitor domains
                    serp_competitors = [c['domain'] for c in serp_insights['top_competitors'] if isinstance(c, dict)]
                    
                    # Step 3: Filter out generic/irrelevant domains
                    generic_domains = [
                        'linkedin', 'facebook', 'twitter', 'instagram', 'youtube',
                        'wikipedia', 'reddit', 'medium', 'quora', 'pinterest',
                        'yelp', 'tripadvisor', 'yellowpages', 'mapquest', 'google',
                        'hubspot', 'amazonaws', 'cloudfront', 'foursquare', 'booking.com'
                    ]
                    
                    real_competitors = [
                        c for c in serp_competitors 
                        if c != domain and not any(generic in c.lower() for generic in generic_domains)
                    ][:15]
                    
                    if real_competitors:
                        print(f"✅ Found {len(real_competitors)} real competitors from SERP: {', '.join(real_competitors[:3])}...")
                        competitive_analysis.top_competitors = real_competitors
                        
                        # Add SERP insights (People Also Ask, Related Searches)
                        if serp_insights.get('people_also_ask'):
                            competitive_analysis.serp_insights.extend([
                                f"PAA: {q}" for q in serp_insights['people_also_ask'][:10]
                            ])
                        
                        if serp_insights.get('related_searches'):
                            competitive_analysis.serp_insights.extend([
                                f"Related: {s}" for s in serp_insights['related_searches'][:5]
                            ])
                        
                        # Add competitor insights
                        competitive_analysis.content_approaches.extend([
                            f"Top ranking competitors: {', '.join(real_competitors[:3])}",
                            "Analyze competitor content strategies for these domains"
                        ])
                    else:
                        print(f"⚠️ No specific competitors found from SERP, keeping AI suggestions")
                        # Keep original AI competitors from main analysis
                    
                except Exception as e:
                    print(f"⚠️ Error in hybrid competitor analysis: {str(e)}")
                    # Keep original AI competitors from main analysis
                    pass

            
            # Use only the initial articles from AI response (no batch processing for speed)
            print(f"✅ Generated {len(content_articles or [])} articles from initial analysis")

            
            # Create comprehensive TopicalMapData
            return TopicalMapData(
                url=url,
                business_description=result.get('business_description', '')[:1500],
                central_entity=result.get('central_entity', central_entity),
                business_model=result.get('business_model', 'Information/Content'),
                search_intent=result.get('search_intent', ['Informational'])[:5],
                target_audiences=result.get('target_audiences', ['General Public'])[:10],
                conversion_methods=result.get('conversion_methods', ['Contact Form'])[:15],
                key_topics=result.get('key_topics', [])[:15],
                semantic_relationships=semantic_rel,
                audience_segments=audience_segs,
                content_strategy=content_strat,
                query_templates=query_temps,
                competitive_advantages=result.get('competitive_advantages', [])[:10],
                technology_stack=result.get('technology_stack', [])[:10],
                competitive_analysis=competitive_analysis,
                content_articles=content_articles,  # Initial articles from AI response
                seo_optimization=seo_optimization,
                taxonomy=taxonomy,
                ontology=ontology
            )
            
        except Exception as e:
            print(f"❌ AI topical map generation failed: {str(e)}")
            raise  # Let the error propagate instead of using fallback
    
    async def _generate_expansive_content_plan(
        self, 
        content_data: Dict, 
        content_strategy: Dict,
        semantic_relationships: Dict,
        initial_articles: List
    ) -> List:
        """
        Generate 40-50 article ideas using batch processing.
        
        This method:
        1. Extracts taxonomy categories from initial articles
        2. Generates 8-10 articles per category
        3. Processes categories sequentially to avoid rate limits
        4. Returns comprehensive content plan
        """
        import asyncio
        from models.schemas import ContentArticle
        
        # Extract taxonomy categories from initial articles
        categories = {}
        for article in initial_articles:
            l1 = article.category_l1
            if l1 not in categories:
                categories[l1] = set()
            if hasattr(article, 'category_l2') and article.category_l2:
                categories[l1].add(article.category_l2)
        
        # If no initial articles, create default categories from content strategy
        if not categories:
            core_topics = content_strategy.get('core_topics', [])
            outer_topics = content_strategy.get('outer_topics', [])
            for topic in (core_topics + outer_topics)[:10]:
                categories[topic] = set(['Overview', 'Guide', 'Best Practices'])
        
        print(f"📊 Generating content for {len(categories)} main categories...")
        
        # Generate articles sequentially with delays to avoid rate limits
        all_expanded_articles = []
        
        for idx, (category_l1, subcategories) in enumerate(list(categories.items())[:4]):
            print(f"  📁 Processing category {idx + 1}/4: {category_l1}")
            
            try:
                articles = await self._generate_category_articles(
                    content_data,
                    category_l1,
                    list(subcategories)[:5] if subcategories else ['General'],
                    semantic_relationships
                )
                all_expanded_articles.extend(articles)
                print(f"    ✅ Generated {len(articles)} articles for {category_l1}")
                
                # Add delay between categories to avoid rate limits (except for last one)
                if idx < len(list(categories.items())[:4]) - 1:
                    print(f"    ⏳ Waiting 1 second before next category...")
                    await asyncio.sleep(1)
                    
            except Exception as e:
                print(f"    ❌ Error generating articles for {category_l1}: {e}")
                # Continue with next category even if one fails
                continue
        
        print(f"✅ Generated {len(all_expanded_articles)} additional articles")
        return all_expanded_articles
    
    async def _generate_category_articles(
        self,
        content_data: Dict,
        category_l1: str,
        subcategories: List[str],
        semantic_relationships: Dict
    ) -> List:
        """
        Generate 8-10 articles for a specific category.
        
        Uses DeepSeek AI to create diverse article types:
        - Beginner guides (2-3 articles)
        - Advanced tutorials (2-3 articles)
        - Comparison/Review content (2-3 articles)
        - Tool/Resource pages (1-2 articles)
        """
        from models.schemas import ContentArticle
        
        system_prompt = """You are an expert content strategist. Generate comprehensive article ideas for the given category.
Return ONLY valid JSON array without markdown formatting."""
        
        prompt = f"""Generate 8-10 detailed article ideas for this content category.

Business Context:
- Domain: {content_data.get('domain')}
- Main Topic: {category_l1}
- Subcategories: {', '.join(subcategories)}

Semantic Context:
- Related Terms: {', '.join(semantic_relationships.get('related_concepts', [])[:10])}
- Core Entities: {', '.join(semantic_relationships.get('core_entities', [])[:10])}

Generate articles covering:
1. Beginner guides (2-3 articles)
2. Advanced tutorials (2-3 articles)
3. Comparison/Review content (2-3 articles)
4. Tool/Resource pages (1-2 articles)

Return JSON array with this structure:
[
  {{
    "title": "Specific, SEO-optimized article title",
    "section": "Core or Outer",
    "article_type": "informative/service_page/listicle/tool_page/case_study/comparison",
    "category_l1": "{category_l1}",
    "category_l2": "Subcategory from list above",
    "category_l3": "Specific sub-topic",
    "priority": 1-3,
    "source_context": "2-3 sentences on how to create this content, what to include, CTAs"
  }}
]

Make titles specific, actionable, and SEO-friendly. Vary the article types and priorities.
"""
        
        # Retry logic for rate limits
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Use DeepSeek for bulk article generation (reliable, no rate limits)
                result = await ai_service.extract_json(prompt, system_prompt, use_deepseek=True)
                
                # Handle both array and object responses
                articles_data = result if isinstance(result, list) else result.get('articles', [])
                
                articles = []
                for article_data in articles_data[:10]:  # Limit to 10 per category
                    try:
                        article = ContentArticle(**article_data)
                        articles.append(article)
                    except Exception as e:
                        print(f"      ⚠️  Error parsing article: {e}")
                        continue
                
                return articles
                
            except Exception as e:
                error_str = str(e)
                # Check if it's a rate limit error
                if 'rate_limit' in error_str.lower() or '429' in error_str:
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 2  # 2s, 4s, 6s
                        print(f"      ⏳ Rate limit hit, retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        print(f"      ❌ Max retries reached for category {category_l1}")
                        return []  # Return empty list instead of raising
                else:
                    # Non-rate-limit error, return empty list
                    print(f"      ❌ Error generating articles for category {category_l1}: {e}")
                    return []
        
        # If all retries exhausted, return empty list
        return []
    
    async def generate_multiple(self, scraped_data_list: List[Dict]) -> List[TopicalMapData]:
        """
        Generate topical maps for multiple URLs using AI.
        
        Processes multiple URLs in parallel for efficiency.
        """
        import asyncio
        
        tasks = []
        for data in scraped_data_list:
            if data.get('status') == 'success':
                tasks.append(self.generate_topical_map_with_ai(data))
        
        if tasks:
            # Use return_exceptions=True to allow partial success
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and return only successful results
            successful_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    print(f"⚠️ Topical map generation failed for URL {i+1}: {str(result)}")
                else:
                    successful_results.append(result)
            
            if not successful_results:
                raise ValueError("All topical map generations failed")
            
            return successful_results
        return []


# Singleton instance
topical_generator = TopicalMapGenerator()

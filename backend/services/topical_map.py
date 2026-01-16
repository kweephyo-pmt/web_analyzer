from typing import Dict, List
from models.schemas import TopicalMapData
from .ai_service import ai_service
import json


class TopicalMapGenerator:
    """AI-powered topical map generator with comprehensive semantic analysis"""
    
    async def generate_topical_map_with_ai(self, scraped_data: Dict) -> TopicalMapData:
        """Generate comprehensive topical map using smart thinking model with detailed prompt"""
        
        url = scraped_data.get('url', '')
        title = scraped_data.get('title', '')
        description = scraped_data.get('description', '')
        text = scraped_data.get('text_content', '')[:5000]  # More content for analysis
        headings = scraped_data.get('headings', {})
        links = scraped_data.get('links', [])
        
        # Extract domain as central entity
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc.replace('www.', '')
        central_entity = domain.split('.')[0].title()
        
        # Prepare content for AI
        content_data = {
            'url': url,
            'domain': domain,
            'title': title,
            'description': description,
            'h1_headings': headings.get('h1', []),
            'h2_headings': headings.get('h2', [])[:15],
            'h3_headings': headings.get('h3', [])[:15],
            'text_preview': text,
            'sample_links': [{'text': link.get('text', ''), 'url': link.get('url', '')} for link in links[:30]]
        }
        
        system_prompt = """You are an expert SEO strategist and business analyst specializing in semantic website analysis and content strategy.
Analyze the provided website data and create a comprehensive topical map following the 8-part semantic analysis framework.
Return ONLY valid JSON without markdown formatting."""
        
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
• Audience Segments (3-5): Define detailed segments with expertise levels, goals, pain points, content preferences
• Core Topics (6-10): Direct revenue/conversion topics
• Outer Topics (8-12): Authority/traffic building topics
• Content Gaps (4-6): Opportunities competitors missed
• Priority Areas (4-6): Top strategic content focuses

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
Create 10-20 article ideas with:
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
  "technology_stack": ["Tech 1", "Tech 2", "..."]
}}

CRITICAL INSTRUCTIONS:
✓ Be SPECIFIC and DETAILED - use actual industry terminology, not generic placeholders
✓ Provide COMPREHENSIVE coverage - don't skip any sections
✓ Use domain expertise - demonstrate deep understanding of the industry
✓ Be ACTIONABLE - insights should directly inform content strategy
✓ Return ONLY the JSON object, no markdown code blocks or explanations
"""
        
        try:
            # Use smart thinking model for complex analysis
            result = await ai_service.extract_json_with_thinking(prompt, system_prompt)
            
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
            
            # Parse content articles (Part 6)
            content_articles = None
            if 'content_articles' in result and result['content_articles']:
                from models.schemas import ContentArticle
                content_articles = [ContentArticle(**article) for article in result['content_articles']]
            
            # Parse SEO optimization (Part 7)
            seo_optimization = None
            if 'seo_optimization' in result:
                from models.schemas import SEOOptimization
                seo_optimization = SEOOptimization(**result['seo_optimization'])
            
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
                content_articles=content_articles,
                seo_optimization=seo_optimization
            )
            
        except Exception as e:
            print(f"AI topical map generation failed: {str(e)}")
            # Fallback to basic analysis
            return self._fallback_topical_map(scraped_data)
    
    def _fallback_topical_map(self, scraped_data: Dict) -> TopicalMapData:
        """Fallback topical map generation without AI"""
        url = scraped_data.get('url', '')
        title = scraped_data.get('title', '')
        description = scraped_data.get('description', '')
        text = scraped_data.get('text_content', '')
        headings = scraped_data.get('headings', {})
        
        from urllib.parse import urlparse
        parsed = urlparse(url)
        central_entity = parsed.netloc.replace('www.', '').split('.')[0].title()
        
        # Basic business description
        if description and len(description) > 50:
            business_description = description[:500]
        else:
            business_description = f"{title}. {text[:300]}"
        
        # Basic topic extraction
        key_topics = []
        for h2 in headings.get('h2', [])[:8]:
            if len(h2) < 60:
                key_topics.append(h2)
        
        return TopicalMapData(
            url=url,
            business_description=business_description,
            central_entity=central_entity,
            search_intent=['Informational'],
            target_audiences=['General Public', 'Businesses'],
            business_model='Information/Content',
            conversion_methods=['Contact Form', 'Email'],
            key_topics=key_topics[:10]
        )
    
    async def generate_multiple(self, scraped_data_list: List[Dict]) -> List[TopicalMapData]:
        """Generate topical maps for multiple URLs using AI"""
        import asyncio
        
        tasks = []
        for data in scraped_data_list:
            if data.get('status') == 'success':
                tasks.append(self.generate_topical_map_with_ai(data))
        
        if tasks:
            return await asyncio.gather(*tasks)
        return []


# Singleton instance
topical_generator = TopicalMapGenerator()

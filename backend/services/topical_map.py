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
Analyze the provided website data and create a comprehensive topical map with deep semantic insights.
Return ONLY valid JSON without markdown formatting."""
        
        prompt = f"""Perform a comprehensive semantic analysis of this website using the Quick Topical Map framework.

Website Data:
{json.dumps(content_data, indent=2)}

COMPREHENSIVE ANALYSIS REQUIREMENTS:

PART 1: BUSINESS INTELLIGENCE
- Company overview, business model, value propositions
- Target markets, geographic presence
- Primary and secondary offerings

PART 2: SEMANTIC RELATIONSHIPS
Document semantic relationships for the central entity:
- Core Entities (5-10 fundamental concepts directly related)
- Attributes (key features, metrics, standards, capabilities)
- Context Terms (usage scenarios, applications, industry contexts)
- Synonyms (alternative terms, industry jargon, regional variations)
- Related Concepts (connected ideas, complementary services)

PART 3: AUDIENCE ANALYSIS
Define 3-5 detailed audience segments with:
- Segment name and expertise level (Beginner/Intermediate/Advanced)
- Primary goals they want to achieve
- Key pain points (2-4 per segment)
- Preferred content types (tutorials, case studies, guides, etc.)

PART 4: CONTENT STRATEGY
Identify:
- Core Topics (5-8 direct revenue/conversion topics)
- Outer Topics (5-8 authority/traffic building topics)
- Content Gaps (3-5 opportunities competitors missed)
- Priority Areas (top 3-5 strategic content focuses)

PART 5: QUERY TEMPLATES
Provide 5-10 example queries per category:
- Informational queries ("what is...", "how does... work")
- Transactional queries ("buy...", "sign up...", "get...")
- Commercial queries ("best...", "compare...", "review...")
- Navigational queries (brand + service type)

PART 6: COMPETITIVE POSITIONING
- 3-5 key competitive advantages
- 3-5 technologies/tools used

Return JSON with this structure:

{{
  "business_description": "Comprehensive 250-300 word description",
  "central_entity": "Main brand name",
  "business_model": "B2B/B2C/SaaS/etc",
  "search_intent": ["Informational", "Transactional", etc],
  "target_audiences": ["Audience 1 (Level)", "Audience 2 (Level)"],
  "conversion_methods": ["Method 1", "Method 2"],
  "key_topics": ["Topic 1", "Topic 2"],
  
  "semantic_relationships": {{
    "core_entities": ["Entity 1", "Entity 2"],
    "attributes": ["Attribute 1", "Attribute 2"],
    "context_terms": ["Context 1", "Context 2"],
    "synonyms": ["Synonym 1", "Synonym 2"],
    "related_concepts": ["Concept 1", "Concept 2"]
  }},
  
  "audience_segments": [
    {{
      "name": "Segment Name",
      "expertise_level": "Beginner/Intermediate/Advanced",
      "primary_goal": "What they want to achieve",
      "pain_points": ["Pain 1", "Pain 2"],
      "content_types": ["Type 1", "Type 2"]
    }}
  ],
  
  "content_strategy": {{
    "core_topics": ["Core 1", "Core 2"],
    "outer_topics": ["Outer 1", "Outer 2"],
    "content_gaps": ["Gap 1", "Gap 2"],
    "priority_areas": ["Priority 1", "Priority 2"]
  }},
  
  "query_templates": {{
    "informational": ["Query 1", "Query 2"],
    "transactional": ["Query 1", "Query 2"],
    "commercial": ["Query 1", "Query 2"],
    "navigational": ["Query 1", "Query 2"]
  }},
  
  "competitive_advantages": ["Advantage 1", "Advantage 2"],
  "technology_stack": ["Tech 1", "Tech 2"]
}}

Provide deep, actionable insights with industry-specific terminology."""
        
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
                technology_stack=result.get('technology_stack', [])[:10]
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

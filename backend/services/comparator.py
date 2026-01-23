from typing import Dict, List
from models.schemas import ComparisonData, TopicalMapData
from .ai_service import ai_service
import json


class Comparator:
    """AI-powered website comparison engine"""
    
    async def compare_websites_with_ai(
        self, 
        scraped_data_list: List[Dict],
        topical_maps: List[TopicalMapData]
    ) -> ComparisonData:
        """Generate intelligent comparison using AI"""
        
        if len(scraped_data_list) < 2:
            return None
        
        # Prepare data for AI analysis
        websites_data = []
        for i, (data, tmap) in enumerate(zip(scraped_data_list, topical_maps)):
            if data.get('status') != 'success':
                continue
            
            # Use Firecrawl markdown if available for better preview
            if data.get('source') == 'firecrawl' and data.get('markdown'):
                text_preview = data.get('markdown', '')[:1500]
            else:
                text_preview = data.get('text_content', '')[:1000]
            
            website_info = {
                'url': data['url'],
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'business_model': tmap.business_model,
                'target_audiences': tmap.target_audiences,
                'key_topics': tmap.key_topics,
                'conversion_methods': tmap.conversion_methods,
                'h2_headings': data.get('headings', {}).get('h2', [])[:10],
                'text_preview': text_preview
            }
            websites_data.append(website_info)
        
        system_prompt = """You are an expert business analyst specializing in competitive analysis.
Analyze multiple websites and provide detailed comparison insights.
Return ONLY valid JSON without markdown formatting or explanation."""
        
        prompt = f"""Compare these {len(websites_data)} websites and provide a comprehensive analysis.

Websites Data:
{json.dumps(websites_data, indent=2)}

Return a JSON object with these exact fields:

1. business_models (object): Map of URL to business model string
   Example: {{"https://example.com": "SaaS", "https://another.com": "E-commerce"}}

2. service_overlap (array): 5-10 services/features that appear across multiple sites
   Example: ["Customer Support", "Analytics Dashboard", "API Access"]

3. unique_services (object): Map of URL to array of unique services (3-5 per site)
   Example: {{"https://example.com": ["AI-Powered Insights", "Custom Integrations"]}}

4. audience_comparison (object): Map of URL to target audiences array
   Example: {{"https://example.com": ["Small Businesses", "Startups"]}}

5. technology_stack (object): Map of URL to technologies array (5-8 items)
   Example: {{"https://example.com": ["React", "Python", "AWS", "PostgreSQL"]}}

6. geographic_coverage (object): Map of URL to locations array
   Example: {{"https://example.com": ["United States", "Canada", "Global"]}}

7. similarity_matrix (object): Nested object showing similarity scores (0.0-1.0) between each pair
   Example: {{
     "https://example.com": {{"https://example.com": 1.0, "https://another.com": 0.65}},
     "https://another.com": {{"https://example.com": 0.65, "https://another.com": 1.0}}
   }}

Provide accurate, data-driven insights based on the actual content."""
        
        try:
            # Use DeepSeek for comparison analysis (better quality, no rate limits)
            result = await ai_service.extract_json(prompt, system_prompt, use_deepseek=True)
            
            # Validate and create ComparisonData
            return ComparisonData(
                business_models=result.get('business_models', {}),
                service_overlap=result.get('service_overlap', [])[:15],
                unique_services=result.get('unique_services', {}),
                audience_comparison=result.get('audience_comparison', {}),
                technology_stack=result.get('technology_stack', {}),
                geographic_coverage=result.get('geographic_coverage', {}),
                similarity_matrix=result.get('similarity_matrix', {})
            )
            
        except Exception as e:
            print(f"AI comparison failed: {str(e)}")
            # Fallback to basic comparison
            return self._fallback_comparison(scraped_data_list, topical_maps)
    
    def _fallback_comparison(
        self,
        scraped_data_list: List[Dict],
        topical_maps: List[TopicalMapData]
    ) -> ComparisonData:
        """Fallback comparison without AI"""
        
        # Extract business models
        business_models = {}
        for tmap in topical_maps:
            business_models[tmap.url] = tmap.business_model
        
        # Basic service extraction
        all_topics = []
        url_topics = {}
        
        for data, tmap in zip(scraped_data_list, topical_maps):
            if data.get('status') != 'success':
                continue
            
            url = data['url']
            topics = tmap.key_topics[:10]
            url_topics[url] = topics
            all_topics.extend(topics)
        
        # Find overlaps (simple approach)
        from collections import Counter
        topic_counts = Counter(all_topics)
        service_overlap = [topic for topic, count in topic_counts.items() if count > 1][:10]
        
        # Unique services
        unique_services = {}
        for url, topics in url_topics.items():
            unique = [t for t in topics if topic_counts[t] == 1]
            unique_services[url] = unique[:5]
        
        # Audience comparison
        audience_comparison = {}
        for tmap in topical_maps:
            audience_comparison[tmap.url] = tmap.target_audiences
        
        # Basic technology stack
        technology_stack = {}
        for data in scraped_data_list:
            if data.get('status') == 'success':
                technology_stack[data['url']] = ['Web', 'Cloud']
        
        # Geographic coverage
        geographic_coverage = {}
        for data in scraped_data_list:
            if data.get('status') == 'success':
                geographic_coverage[data['url']] = ['Not specified']
        
        # Simple similarity matrix
        similarity_matrix = {}
        urls = [tmap.url for tmap in topical_maps]
        for url1 in urls:
            similarity_matrix[url1] = {}
            for url2 in urls:
                if url1 == url2:
                    similarity_matrix[url1][url2] = 1.0
                else:
                    # Simple overlap-based similarity
                    topics1 = set(url_topics.get(url1, []))
                    topics2 = set(url_topics.get(url2, []))
                    if topics1 and topics2:
                        intersection = len(topics1 & topics2)
                        union = len(topics1 | topics2)
                        similarity_matrix[url1][url2] = round(intersection / union, 2) if union > 0 else 0.3
                    else:
                        similarity_matrix[url1][url2] = 0.3
        
        return ComparisonData(
            business_models=business_models,
            service_overlap=service_overlap,
            unique_services=unique_services,
            audience_comparison=audience_comparison,
            technology_stack=technology_stack,
            geographic_coverage=geographic_coverage,
            similarity_matrix=similarity_matrix
        )
    
    async def compare_websites(
        self, 
        scraped_data_list: List[Dict],
        topical_maps: List[TopicalMapData]
    ) -> ComparisonData:
        """Main comparison method - uses AI if available"""
        return await self.compare_websites_with_ai(scraped_data_list, topical_maps)


# Singleton instance
comparator = Comparator()

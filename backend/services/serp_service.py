"""
SerpAPI Service for Real Google Search Data
Enhances topical maps with actual SERP insights
"""
from typing import Dict, List, Optional
from serpapi import GoogleSearch
from config import settings
import asyncio


class SerpService:
    """Service for fetching real Google search data via SerpAPI"""
    
    def __init__(self):
        self.api_key = settings.SERPAPI_KEY
    
    def _detect_location_from_domain(self, domain: str) -> str:
        """Detect country code from domain TLD"""
        # Common TLD to country code mapping
        tld_to_country = {
            '.th': 'th',  # Thailand
            '.uk': 'uk',  # United Kingdom
            '.au': 'au',  # Australia
            '.ca': 'ca',  # Canada
            '.de': 'de',  # Germany
            '.fr': 'fr',  # France
            '.jp': 'jp',  # Japan
            '.sg': 'sg',  # Singapore
            '.my': 'my',  # Malaysia
            '.ph': 'ph',  # Philippines
            '.vn': 'vn',  # Vietnam
            '.in': 'in',  # India
            '.cn': 'cn',  # China
            '.kr': 'kr',  # South Korea
        }
        
        # Check TLD
        for tld, country in tld_to_country.items():
            if domain.endswith(tld):
                return country
        
        # Default to US for .com, .net, .org, etc.
        return 'th'
    
    async def get_serp_insights(self, keywords: List[str], domain: str = None) -> Dict:
        """
        Get SERP insights for multiple keywords
        Returns competitor rankings, PAA questions, related searches
        """
        if not self.api_key:
            print("⚠️  SerpAPI key not configured, skipping SERP analysis")
            return self._empty_insights()
        
        # Detect location from domain
        location = self._detect_location_from_domain(domain) if domain else 'th'
        print(f"🔍 Fetching SERP data for {len(keywords[:3])} keywords (location: {location.upper()})...")
        
        # Limit to 3 keywords to conserve API credits
        insights = {
            'top_competitors': [],
            'people_also_ask': [],
            'related_searches': [],
            'ranking_opportunities': [],
            'content_types': {}
        }
        
        try:
            # Process keywords in parallel (but limit to 3 to save credits)
            tasks = [self._fetch_keyword_data(kw, location) for kw in keywords[:3]]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Aggregate results
            all_competitors = []
            all_paa = []
            all_related = []
            
            for result in results:
                if isinstance(result, dict):
                    all_competitors.extend(result.get('competitors', []))
                    all_paa.extend(result.get('paa', []))
                    all_related.extend(result.get('related', []))
            
            # Deduplicate and rank
            insights['top_competitors'] = self._get_top_items(all_competitors, 10)
            insights['people_also_ask'] = self._get_top_items(all_paa, 15)
            insights['related_searches'] = self._get_top_items(all_related, 10)
            
            print(f"✅ SERP insights collected:")
            print(f"   - {len(insights['top_competitors'])} competitors")
            print(f"   - {len(insights['people_also_ask'])} PAA questions")
            print(f"   - {len(insights['related_searches'])} related searches")
            
        except Exception as e:
            print(f"⚠️  SerpAPI error: {str(e)}")
            return self._empty_insights()
        
        return insights
    
    async def _fetch_keyword_data(self, keyword: str, location: str = 'th') -> Dict:
        """Fetch SERP data for a single keyword"""
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self._search_google, 
                keyword,
                location
            )
            return result
        except Exception as e:
            print(f"   ⚠️  Error fetching '{keyword}': {str(e)}")
            return {'competitors': [], 'paa': [], 'related': []}
    
    def _search_google(self, keyword: str, location: str = None) -> Dict:
        """Synchronous Google search via SerpAPI"""
        # Auto-detect location if not provided (defaults to global)
        country_code = location if location else "th"
        
        params = {
            "q": keyword,
            "api_key": self.api_key,
            "num": 10,  # Get top 10 results
            "gl": country_code,  # Country code (th for Thailand, us for USA, etc.)
            "hl": "en"   # Language
        }
        
        search = GoogleSearch(params)
        results = search.get_dict()
        
        # Extract data
        competitors = []
        paa = []
        related = []
        
        # Get organic results (competitors)
        if 'organic_results' in results:
            for result in results['organic_results'][:10]:
                competitors.append({
                    'domain': self._extract_domain(result.get('link', '')),
                    'title': result.get('title', ''),
                    'position': result.get('position', 0)
                })
        
        # Get People Also Ask
        if 'related_questions' in results:
            for question in results['related_questions']:
                paa.append(question.get('question', ''))
        
        # Get Related Searches
        if 'related_searches' in results:
            for search in results['related_searches']:
                related.append(search.get('query', ''))
        
        return {
            'competitors': competitors,
            'paa': paa,
            'related': related
        }
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            return parsed.netloc.replace('www.', '')
        except:
            return url
    
    def _get_top_items(self, items: List, limit: int) -> List:
        """Get top unique items"""
        seen = set()
        unique = []
        for item in items:
            # Handle both strings and dicts
            key = item if isinstance(item, str) else item.get('domain', '')
            if key and key not in seen:
                seen.add(key)
                unique.append(item)
                if len(unique) >= limit:
                    break
        return unique
    
    def _empty_insights(self) -> Dict:
        """Return empty insights structure"""
        return {
            'top_competitors': [],
            'people_also_ask': [],
            'related_searches': [],
            'ranking_opportunities': [],
            'content_types': {}
        }


# Singleton instance
serp_service = SerpService()

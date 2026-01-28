import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict
from urllib.parse import urljoin, urlparse
import logging

logger = logging.getLogger(__name__)


class SitemapService:
    """Service for fetching and parsing sitemaps"""
    
    def __init__(self):
        self.timeout = 30.0
    
    async def fetch_sitemap_urls(self, base_url: str, max_urls: int = 20) -> List[str]:
        """
        Fetch URLs from sitemap.xml
        
        Args:
            base_url: The base URL of the website
            max_urls: Maximum number of URLs to return
            
        Returns:
            List of URLs from sitemap
        """
        sitemap_urls = []
        
        # Try common sitemap locations
        sitemap_locations = [
            '/sitemap.xml',
            '/sitemap_index.xml',
            '/sitemap1.xml',
            '/sitemap-index.xml',
            '/post-sitemap.xml',
            '/page-sitemap.xml'
        ]
        
        parsed = urlparse(base_url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        
        for location in sitemap_locations:
            sitemap_url = urljoin(base, location)
            urls = await self._parse_sitemap(sitemap_url)
            
            if urls:
                logger.info(f"Found sitemap at {sitemap_url} with {len(urls)} URLs")
                sitemap_urls.extend(urls)
                
                # Stop if we have enough URLs
                if len(sitemap_urls) >= max_urls:
                    break
        
        # Remove duplicates and limit
        unique_urls = list(dict.fromkeys(sitemap_urls))[:max_urls]
        
        logger.info(f"Total unique URLs from sitemap: {len(unique_urls)}")
        return unique_urls
    
    async def _parse_sitemap(self, sitemap_url: str) -> List[str]:
        """Parse a sitemap XML file"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(sitemap_url)
                    
                if response.status_code != 200:
                    return []
                
                # Parse XML
                root = ET.fromstring(response.content)
                
                # Handle namespaces
                namespaces = {
                    'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
                    'image': 'http://www.google.com/schemas/sitemap-image/1.1',
                    'news': 'http://www.google.com/schemas/sitemap-news/0.9'
                }
                
                urls = []
                
                # Check if it's a sitemap index
                sitemap_elements = root.findall('.//ns:sitemap/ns:loc', namespaces)
                if sitemap_elements:
                    # It's a sitemap index, fetch child sitemaps
                    for sitemap_elem in sitemap_elements[:5]:  # Limit to 5 child sitemaps
                        child_url = sitemap_elem.text
                        child_urls = await self._parse_sitemap(child_url)
                        urls.extend(child_urls)
                else:
                    # It's a regular sitemap, extract URLs
                    url_elements = root.findall('.//ns:url/ns:loc', namespaces)
                    urls = [elem.text for elem in url_elements if elem.text]
                
                return urls
                
        except ET.ParseError as e:
            logger.warning(f"Failed to parse sitemap {sitemap_url}: XML parse error")
            return []
        except httpx.TimeoutException:
            logger.warning(f"Timeout fetching sitemap {sitemap_url}")
            return []
        except Exception as e:
            logger.warning(f"Error fetching sitemap {sitemap_url}: {str(e)}")
            return []
    
    async def get_priority_pages(self, base_url: str, max_pages: int = 15) -> List[str]:
        """
        Get priority pages from sitemap, filtering for important content
        
        Args:
            base_url: The base URL of the website
            max_pages: Maximum number of pages to return
            
        Returns:
            List of priority page URLs
        """
        all_urls = await self.fetch_sitemap_urls(base_url, max_urls=50)
        
        if not all_urls:
            # Fallback to just the base URL
            return [base_url]
        
        # Prioritize certain page types
        priority_urls = []
        other_urls = []
        
        # Keywords that indicate important pages
        priority_keywords = [
            '/about', '/services', '/products', '/solutions',
            '/pricing', '/features', '/how-it-works', '/what-we-do'
        ]
        
        # Keywords to avoid
        skip_keywords = [
            '/tag/', '/category/', '/author/', '/page/',
            '/feed/', '?', '#', '.pdf', '.jpg', '.png'
        ]
        
        for url in all_urls:
            # Skip unwanted URLs
            if any(skip in url.lower() for skip in skip_keywords):
                continue
            
            # Prioritize important pages
            if any(keyword in url.lower() for keyword in priority_keywords):
                priority_urls.append(url)
            else:
                other_urls.append(url)
        
        # Combine priority and other URLs
        selected_urls = priority_urls[:max_pages]
        
        # Fill remaining slots with other URLs
        remaining = max_pages - len(selected_urls)
        if remaining > 0:
            selected_urls.extend(other_urls[:remaining])
        
        # Always include the base URL if not already there
        if base_url not in selected_urls:
            selected_urls.insert(0, base_url)
        
        return selected_urls[:max_pages]


# Singleton instance
sitemap_service = SitemapService()

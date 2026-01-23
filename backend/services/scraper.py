import httpx
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import asyncio
from urllib.parse import urljoin, urlparse
from firecrawl import FirecrawlApp
from config import settings


class WebScraper:
    """Advanced web scraper with Firecrawl (primary) and BeautifulSoup (fallback)"""
    
    def __init__(self):
        self.timeout = 30.0
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        # Initialize Firecrawl if API key is available
        self.firecrawl = None
        if settings.FIRECRAWL_API_KEY:
            try:
                self.firecrawl = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
                print("✅ Firecrawl initialized - using advanced scraping")
            except Exception as e:
                print(f"⚠️  Firecrawl init failed: {e}, using BeautifulSoup fallback")
    
    async def scrape_url(self, url: str) -> Dict:
        """Scrape a single URL - tries Firecrawl first, falls back to BeautifulSoup"""
        
        # Try Firecrawl first if available
        if self.firecrawl:
            try:
                print(f"🔥 Scraping with Firecrawl: {url}")
                # Run Firecrawl in thread pool (it's synchronous)
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    self._scrape_with_firecrawl,
                    url
                )
                if result['status'] == 'success':
                    return result
                else:
                    print(f"⚠️  Firecrawl failed, trying BeautifulSoup...")
            except Exception as e:
                print(f"⚠️  Firecrawl error: {e}, trying BeautifulSoup...")
        
        # Fallback to BeautifulSoup
        return await self._scrape_with_beautifulsoup(url)
    
    def _scrape_with_firecrawl(self, url: str) -> Dict:
        """Scrape using Firecrawl (synchronous)"""
        try:
            # Scrape with Firecrawl v4 API - correct method is 'scrape'
            scrape_result = self.firecrawl.scrape(
                url,
                formats=['markdown'],
                only_main_content=True
            )
            
            # Extract data from Firecrawl response
            # v4 API returns data in 'data' key
            data = scrape_result.get('data', {}) if isinstance(scrape_result, dict) else scrape_result
            markdown = data.get('markdown', '') if hasattr(data, 'get') else getattr(data, 'markdown', '')
            metadata = data.get('metadata', {}) if hasattr(data, 'get') else getattr(data, 'metadata', {})
            
            # Check if we got valid content
            if not markdown or len(markdown) < 100:
                print(f"⚠️  Firecrawl returned insufficient content for {url}")
                return {
                    'url': url,
                    'status': 'error',
                    'error': 'Insufficient content from Firecrawl'
                }
            
            # Parse headings from markdown
            headings = {'h1': [], 'h2': [], 'h3': []}
            for line in markdown.split('\n'):
                line = line.strip()
                if line.startswith('# '):
                    headings['h1'].append(line[2:])
                elif line.startswith('## '):
                    headings['h2'].append(line[3:])
                elif line.startswith('### '):
                    headings['h3'].append(line[4:])
            
            print(f"✅ Firecrawl success: {len(markdown)} chars, {len(headings['h1'])} H1s")
            
            return {
                'url': url,
                'title': metadata.get('title', '') if hasattr(metadata, 'get') else getattr(metadata, 'title', ''),
                'description': metadata.get('description', '') if hasattr(metadata, 'get') else getattr(metadata, 'description', ''),
                'headings': headings,
                'text_content': markdown[:15000],  # Limit to 15k chars (more than BS4)
                'markdown': markdown,  # Full markdown for AI
                'links': [],  # Firecrawl doesn't return links easily
                'images': [],
                'status': 'success',
                'source': 'firecrawl'
            }
            
        except Exception as e:
            print(f"❌ Firecrawl error for {url}: {type(e).__name__}: {str(e)}")
            return {
                'url': url,
                'status': 'error',
                'error': f'Firecrawl error: {str(e)}'
            }
    
    async def _scrape_with_beautifulsoup(self, url: str) -> Dict:
        """Scrape using BeautifulSoup (fallback)"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Remove script and style elements
                for script in soup(["script", "style", "noscript"]):
                    script.decompose()
                
                # Extract metadata
                title = soup.find('title')
                title_text = title.get_text().strip() if title else ""
                
                meta_description = soup.find('meta', attrs={'name': 'description'})
                description = meta_description.get('content', '').strip() if meta_description else ""
                
                # Extract headings
                headings = {
                    'h1': [h.get_text().strip() for h in soup.find_all('h1')],
                    'h2': [h.get_text().strip() for h in soup.find_all('h2')],
                    'h3': [h.get_text().strip() for h in soup.find_all('h3')],
                }
                
                # Extract main content
                main_content = soup.find('main') or soup.find('article') or soup.find('body')
                text_content = main_content.get_text(separator=' ', strip=True) if main_content else ""
                
                # Clean up text
                text_content = ' '.join(text_content.split())
                
                # Extract links
                links = []
                for link in soup.find_all('a', href=True):
                    href = link.get('href')
                    if href:
                        absolute_url = urljoin(url, href)
                        links.append({
                            'url': absolute_url,
                            'text': link.get_text().strip()
                        })
                
                # Extract images
                images = []
                for img in soup.find_all('img', src=True):
                    images.append({
                        'src': urljoin(url, img.get('src')),
                        'alt': img.get('alt', '').strip()
                    })
                
                return {
                    'url': url,
                    'title': title_text,
                    'description': description,
                    'headings': headings,
                    'text_content': text_content[:10000],  # Limit to 10k chars
                    'links': links[:50],  # Limit to 50 links
                    'images': images[:20],  # Limit to 20 images
                    'status': 'success',
                    'source': 'beautifulsoup'
                }
                
        except httpx.TimeoutException:
            return {
                'url': url,
                'status': 'error',
                'error': 'Request timeout'
            }
        except httpx.HTTPStatusError as e:
            return {
                'url': url,
                'status': 'error',
                'error': f'HTTP {e.response.status_code}'
            }
        except Exception as e:
            return {
                'url': url,
                'status': 'error',
                'error': str(e)
            }
    
    async def scrape_multiple(self, urls: List[str]) -> List[Dict]:
        """Scrape multiple URLs concurrently"""
        tasks = [self.scrape_url(url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results


# Singleton instance
scraper = WebScraper()

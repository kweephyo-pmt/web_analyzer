import httpx
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import asyncio
from urllib.parse import urljoin, urlparse


class WebScraper:
    """Advanced web scraper with async support"""
    
    def __init__(self):
        self.timeout = 30.0
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    async def scrape_url(self, url: str) -> Dict:
        """Scrape a single URL and extract content"""
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
                    'status': 'success'
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

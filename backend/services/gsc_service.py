"""Google Search Console API service for fetching properties and data"""
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class GSCService:
    """Service for interacting with Google Search Console API"""
    
    SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
    
    def __init__(self, access_token: str):
        """Initialize GSC service with OAuth access token"""
        self.credentials = Credentials(token=access_token)
        self.service = build('searchconsole', 'v1', credentials=self.credentials)
    
    async def get_properties(self) -> List[Dict[str, str]]:
        """
        Fetch all Search Console properties accessible by the user
        
        Returns:
            List of properties with their URLs and permission levels
        """
        try:
            # List all sites/properties
            
            sites_list = self.service.sites().list().execute()
            
            
            properties = []
            site_entries = sites_list.get('siteEntry', [])
            
            
            for site in site_entries:
                site_url = site.get('siteUrl')
                
                # Filter out domain properties (sc-domain:)
                # Only include URL prefix properties (https://, http://)
                if site_url and not site_url.startswith('sc-domain:'):
                    property_data = {
                        'url': site_url,
                        'permission_level': site.get('permissionLevel'),
                    }
                    properties.append(property_data)
                
            
            
            logger.info(f"Found {len(properties)} URL prefix properties (domain properties filtered out)")
            return properties
            
        except HttpError as e:
            logger.error(f"HTTP Error {e.resp.status} fetching GSC properties: {str(e)}")
            raise Exception(f"Failed to fetch Search Console properties: HTTP {e.resp.status}")
        except Exception as e:
            logger.error(f"Unexpected error fetching GSC properties: {str(e)}")
            raise Exception(f"Failed to fetch Search Console properties: {str(e)}")
    
    async def verify_property_access(self, property_url: str) -> bool:
        """
        Verify that the user has access to a specific property
        
        Args:
            property_url: The URL of the property to verify
            
        Returns:
            True if user has access, False otherwise
        """
        try:
            self.service.sites().get(siteUrl=property_url).execute()
            return True
        except HttpError as e:
            if e.resp.status == 404:
                return False
            logger.error(f"Error verifying property access: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error verifying property: {str(e)}")
            return False
    
    async def get_pages_with_queries(self, property_url: str, days: int = 90) -> List[Dict]:
        """
        Fetch all pages from a property with their ranking queries
        
        Args:
            property_url: The URL of the GSC property
            days: Number of days to look back (default 90)
            
        Returns:
            List of pages with their queries, clicks, impressions, position
        """
        try:
            from datetime import datetime, timedelta
            
            # Calculate date range
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            
            # Request data grouped by page and query
            request = {
                'startDate': start_date.strftime('%Y-%m-%d'),
                'endDate': end_date.strftime('%Y-%m-%d'),
                'dimensions': ['page', 'query'],
                'rowLimit': 25000,  # Maximum allowed
                'startRow': 0
            }
            
            response = self.service.searchanalytics().query(
                siteUrl=property_url,
                body=request
            ).execute()
            
            # Group queries by page
            pages_data = {}
            rows = response.get('rows', [])
            
            for row in rows:
                page = row['keys'][0]
                query = row['keys'][1]
                clicks = row.get('clicks', 0)
                impressions = row.get('impressions', 0)
                position = row.get('position', 0)
                ctr = row.get('ctr', 0)
                
                if page not in pages_data:
                    pages_data[page] = {
                        'url': page,
                        'total_clicks': 0,
                        'total_impressions': 0,
                        'avg_position': 0,
                        'queries': []
                    }
                
                pages_data[page]['total_clicks'] += clicks
                pages_data[page]['total_impressions'] += impressions
                pages_data[page]['queries'].append({
                    'query': query,
                    'clicks': clicks,
                    'impressions': impressions,
                    'position': round(position, 1),
                    'ctr': round(ctr * 100, 2)
                })
            
            # Calculate average position for each page
            for page_url, data in pages_data.items():
                if data['queries']:
                    total_position = sum(q['position'] for q in data['queries'])
                    data['avg_position'] = round(total_position / len(data['queries']), 1)
                    # Sort queries by clicks (descending)
                    data['queries'].sort(key=lambda x: x['clicks'], reverse=True)
            
            # Convert to list and sort by total clicks
            pages_list = list(pages_data.values())
            pages_list.sort(key=lambda x: x['total_clicks'], reverse=True)
            
            logger.info(f"Fetched {len(pages_list)} pages with queries from {property_url}")
            return pages_list
            
        except HttpError as e:
            logger.error(f"HTTP Error {e.resp.status} fetching pages: {str(e)}")
            raise Exception(f"Failed to fetch pages from Search Console: HTTP {e.resp.status}")
        except Exception as e:
            logger.error(f"Unexpected error fetching pages: {str(e)}")
            raise Exception(f"Failed to fetch pages: {str(e)}")


async def get_user_properties(access_token: str) -> List[Dict[str, str]]:
    """
    Helper function to get user's Search Console properties
    
    Args:
        access_token: Google OAuth access token
        
    Returns:
        List of accessible properties
    """
    service = GSCService(access_token)
    return await service.get_properties()

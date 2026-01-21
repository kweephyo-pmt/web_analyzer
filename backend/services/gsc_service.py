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
            print("=" * 80)
            print("FETCHING SEARCH CONSOLE PROPERTIES")
            print("=" * 80)
            
            sites_list = self.service.sites().list().execute()
            
            print(f"Raw API Response: {sites_list}")
            print(f"Response keys: {sites_list.keys() if sites_list else 'None'}")
            
            properties = []
            site_entries = sites_list.get('siteEntry', [])
            
            print(f"Number of site entries found: {len(site_entries)}")
            
            for idx, site in enumerate(site_entries):
                print(f"Site {idx + 1}: {site}")
                property_data = {
                    'url': site.get('siteUrl'),
                    'permission_level': site.get('permissionLevel'),
                }
                properties.append(property_data)
            
            print(f"Total properties to return: {len(properties)}")
            print("=" * 80)
            
            logger.info(f"Found {len(properties)} Search Console properties")
            return properties
            
        except HttpError as e:
            print(f"HTTP ERROR: Status {e.resp.status}")
            print(f"Error content: {e.content}")
            logger.error(f"HTTP Error {e.resp.status} fetching GSC properties: {str(e)}")
            raise Exception(f"Failed to fetch Search Console properties: HTTP {e.resp.status}")
        except Exception as e:
            print(f"UNEXPECTED ERROR: {str(e)}")
            import traceback
            print(f"Traceback:\n{traceback.format_exc()}")
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

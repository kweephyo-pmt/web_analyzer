from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class URLAnalysisRequest(BaseModel):
    urls: List[str] = Field(..., min_items=1, max_items=5)


class UserInfo(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    message: str


class Node(BaseModel):
    id: str
    label: str
    type: str
    color: str
    size: Optional[int] = 10  # Node size based on importance (centrality metrics)


class Link(BaseModel):
    source: str
    target: str
    label: str
    inferred: Optional[bool] = False  # Whether this relationship was inferred


class KnowledgeGraphData(BaseModel):
    nodes: List[Node]
    links: List[Link]


class SemanticRelationships(BaseModel):
    """Semantic relationships for the central entity"""
    core_entities: List[str] = []
    attributes: List[str] = []
    context_terms: List[str] = []
    synonyms: List[str] = []
    related_concepts: List[str] = []


class AudienceSegment(BaseModel):
    """Detailed audience segment information"""
    name: str
    expertise_level: str
    primary_goal: str
    pain_points: List[str] = []
    content_types: List[str] = []


class ContentStrategy(BaseModel):
    """Content strategy framework"""
    core_topics: List[str] = []
    outer_topics: List[str] = []
    content_gaps: List[str] = []
    priority_areas: List[str] = []


class QueryTemplates(BaseModel):
    """Search query templates by category"""
    informational: List[str] = []
    transactional: List[str] = []
    commercial: List[str] = []
    navigational: List[str] = []


class TopicalMapData(BaseModel):
    """Comprehensive topical map with semantic analysis"""
    # Basic Information
    url: str
    business_description: str
    central_entity: str
    business_model: str
    
    # Search & Audience
    search_intent: List[str]
    target_audiences: List[str]
    conversion_methods: List[str]
    key_topics: List[str]
    
    # Comprehensive Analysis (Optional - from extended thinking)
    semantic_relationships: Optional[SemanticRelationships] = None
    audience_segments: Optional[List[AudienceSegment]] = None
    content_strategy: Optional[ContentStrategy] = None
    query_templates: Optional[QueryTemplates] = None
    competitive_advantages: Optional[List[str]] = None
    technology_stack: Optional[List[str]] = None



class ComparisonData(BaseModel):
    business_models: Dict[str, str]
    service_overlap: List[str]
    unique_services: Dict[str, List[str]]
    audience_comparison: Dict[str, List[str]]
    technology_stack: Dict[str, List[str]]
    geographic_coverage: Dict[str, List[str]]
    similarity_matrix: Dict[str, Dict[str, float]]


class FullAnalysisResult(BaseModel):
    analysis_id: str
    urls: List[str]
    created_at: datetime
    knowledge_graph: KnowledgeGraphData
    topical_maps: List[TopicalMapData]
    comparison: Optional[ComparisonData] = None

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
    """Comprehensive semantic relationships for the central entity"""
    # Primary Relationships
    core_entities: List[str] = []  # Direct, primary concepts
    derived_entities: List[str] = []  # Specialized variations
    attributes: List[str] = []  # Characteristics and properties
    context_terms: List[str] = []  # Usage scenarios and applications
    
    # Linguistic Relationships
    synonyms: List[str] = []  # Alternative terms
    antonyms: List[str] = []  # Contrasting concepts
    hypernyms: List[str] = []  # Broader categories
    hyponyms: List[str] = []  # Specific subcategories
    
    # Structural Relationships
    holonyms: List[str] = []  # Whole systems containing the entity
    meronyms: List[str] = []  # Component parts
    troponyms: List[str] = []  # Ways of doing/methods
    
    # Logical Relationships
    entailments: List[str] = []  # Logical consequences
    related_concepts: List[str] = []  # Connected ideas
    
    # Industry-Specific
    acronyms: List[str] = []  # Abbreviations and technical terms
    polysemes: List[str] = []  # Multiple meanings/contexts


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


class CompetitiveAnalysis(BaseModel):
    """Competitive and source analysis (Part 3)"""
    top_competitors: List[str] = []  # Top 5-10 competing websites
    content_approaches: List[str] = []  # How competitors approach content
    gap_opportunities: List[str] = []  # Opportunities competitors missed
    serp_insights: List[str] = []  # What Google prioritizes (content types, lengths, etc.)


class ContentArticle(BaseModel):
    """Individual article in content plan (Part 6)"""
    title: str
    section: str  # "Core" or "Outer"
    article_type: str  # "informative", "service_page", "listicle", "tool_page"
    category_l1: str  # Level 1 category
    category_l2: Optional[str] = None  # Level 2 subcategory
    category_l3: Optional[str] = None  # Level 3 sub-subcategory
    priority: int  # 1 (Core), 2 (Strategic), 3 (Support)
    source_context: str  # 3-5 sentences on integration strategy


class SEOOptimization(BaseModel):
    """Semantic SEO optimization strategies (Part 7)"""
    topic_clusters: List[str] = []  # Groups of semantically related content
    schema_recommendations: List[str] = []  # Schema markup suggestions
    entity_optimization: List[str] = []  # Entity co-occurrence and salience tips


class QueryTemplates(BaseModel):
    """Comprehensive search query templates by category"""
    # Basic Query Types
    raw_queries: List[str] = []  # Direct, unmodified search terms
    informational: List[str] = []  # What is, How does it work
    transactional: List[str] = []  # Buy, Order, Sign up
    commercial: List[str] = []  # Best, Compare, Review
    navigational: List[str] = []  # Brand + service type
    
    # Contextual Queries
    contextual: List[str] = []  # Local, Problem-Solution, Future-oriented
    
    # Audience-Specific
    audience_specific: List[str] = []  # Beginner, Advanced, Professional queries
    
    # Advanced Patterns (Optional)
    predictive: Optional[List[str]] = []  # Future trends, predictions
    voice_search: Optional[List[str]] = []  # Conversational queries


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
    
    # Part 3: Competitive Analysis
    competitive_analysis: Optional[CompetitiveAnalysis] = None
    
    # Part 6: Content Plan
    content_articles: Optional[List[ContentArticle]] = None
    
    # Part 7: SEO Optimization
    seo_optimization: Optional[SEOOptimization] = None



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

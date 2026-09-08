"""
Pydantic models for ORBITA backend
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class FindingCategory(str, Enum):
    SECURITY = "security"
    CORRECTNESS = "correctness"
    PERFORMANCE = "performance"
    MAINTAINABILITY = "maintainability"
    STYLE = "style"
    ARCHITECTURE = "architecture"


class AnalysisStatus(str, Enum):
    QUEUED = "queued"
    FETCHING = "fetching"
    ANALYZING = "analyzing"
    VALIDATING = "validating"
    SCORING = "scoring"
    GENERATING = "generating"
    COMPLETE = "complete"
    FAILED = "failed"


class CategoryScore(BaseModel):
    score: float
    max_score: float
    reasoning: str
    confidence: float


class RiskScore(BaseModel):
    overall: float = Field(ge=0, le=100)
    level: Literal["critical", "high", "medium", "low", "passed"]
    security: CategoryScore
    correctness: CategoryScore
    performance: CategoryScore
    maintainability: CategoryScore
    complexity: CategoryScore


class Finding(BaseModel):
    id: str
    pull_request_id: str
    severity: Severity
    category: FindingCategory
    title: str
    explanation: str
    reasoning: str
    impact: str
    suggested_fix: str
    file: str
    line: int
    end_line: Optional[int] = None
    code_snippet: str
    confidence: float = Field(ge=0, le=1)
    evidence: list[str]
    status: Literal["open", "dismissed", "accepted", "false_positive", "fixed"] = "open"
    source: Literal["ai", "semgrep", "ruff", "eslint", "ast"] = "ai"


class FindingDismissRequest(BaseModel):
    reason: str
    notes: Optional[str] = None


class AnalyzeRequest(BaseModel):
    pull_request_id: str
    force_reanalyze: bool = False


class PublishReviewRequest(BaseModel):
    review_id: str
    post_as_comment: bool = True
    post_inline_comments: bool = True


class RepositoryRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    rules: str
    enabled: bool = True


class WebhookPayload(BaseModel):
    action: str
    number: Optional[int] = None
    pull_request: Optional[dict] = None
    repository: Optional[dict] = None
    installation: Optional[dict] = None

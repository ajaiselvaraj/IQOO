from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()
settings = get_settings()

DEMO_REPOSITORIES = [
    {
        "id": "repo-001",
        "name": "payment-service",
        "full_name": "orbita-demo/payment-service",
        "language": "Python",
        "stars": 128,
        "open_prs": 7,
        "last_analyzed": "2026-09-08T13:17:00Z",
        "risk_distribution": {"critical": 1, "high": 3, "medium": 8, "low": 12, "passed": 2},
        "url": "https://github.com/orbita-demo/payment-service",
        "is_private": True,
    },
    {
        "id": "repo-002",
        "name": "api-gateway",
        "full_name": "orbita-demo/api-gateway",
        "language": "TypeScript",
        "stars": 94,
        "open_prs": 3,
        "last_analyzed": "2026-09-08T11:30:00Z",
        "risk_distribution": {"critical": 0, "high": 1, "medium": 4, "low": 9, "passed": 5},
        "url": "https://github.com/orbita-demo/api-gateway",
        "is_private": True,
    },
]


@router.get("")
async def list_repositories():
    return {"repositories": DEMO_REPOSITORIES, "total": len(DEMO_REPOSITORIES)}


@router.get("/{repo_id}")
async def get_repository(repo_id: str):
    repo = next((r for r in DEMO_REPOSITORIES if r["id"] == repo_id), None)
    if not repo:
        return {"error": "Repository not found"}, 404
    return repo


@router.get("/{repo_id}/pull-requests")
async def list_pull_requests(repo_id: str):
    # Return demo PRs filtered by repo
    return {"pull_requests": [], "total": 0}

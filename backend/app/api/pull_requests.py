from fastapi import APIRouter
router = APIRouter()

@router.get("")
async def list_pull_requests(): return {"pull_requests": [], "total": 0}

@router.get("/{pr_id}")
async def get_pull_request(pr_id: str): return {"id": pr_id}

@router.get("/{pr_id}/findings")
async def get_findings(pr_id: str): return {"findings": [], "total": 0}

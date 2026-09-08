from fastapi import APIRouter
from app.models.schemas import FindingDismissRequest

router = APIRouter()

@router.post("/{finding_id}/dismiss")
async def dismiss_finding(finding_id: str, body: FindingDismissRequest):
    return {"id": finding_id, "status": "dismissed", "reason": body.reason}

@router.post("/{finding_id}/accept")
async def accept_finding(finding_id: str):
    return {"id": finding_id, "status": "accepted"}

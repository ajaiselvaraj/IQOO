from fastapi import APIRouter, Request, Header, HTTPException
import hmac, hashlib, json, logging
from app.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()


def verify_signature(payload_body: bytes, signature: str) -> bool:
    secret = settings.GITHUB_WEBHOOK_SECRET
    if not secret:
        return True  # Skip verification if no secret configured
    expected = "sha256=" + hmac.new(
        secret.encode(), payload_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/github")
async def github_webhook(
    request: Request,
    x_github_event: str = Header(None),
    x_hub_signature_256: str = Header(None),
):
    """Receive GitHub webhook events."""
    body = await request.body()

    # Verify signature
    if x_hub_signature_256 and not verify_signature(body, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event = x_github_event or "unknown"
    logger.info(f"Received GitHub webhook event: {event}")

    if event == "pull_request" and payload.get("action") in ("opened", "synchronize", "reopened"):
        pr_number = payload.get("number")
        repo_name = payload.get("repository", {}).get("full_name")
        logger.info(f"Auto-triggering analysis for PR #{pr_number} in {repo_name}")
        # In production: queue analysis job

    return {"status": "received", "event": event}

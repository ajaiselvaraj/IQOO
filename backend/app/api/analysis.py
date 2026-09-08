from fastapi import APIRouter, BackgroundTasks
from app.agents.pipeline import AnalysisPipeline
import logging, uuid

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory analysis runs (use Supabase in production)
_runs: dict[str, dict] = {}


@router.post("/pull-requests/{pr_id}/analyze")
async def analyze_pull_request(pr_id: str, background_tasks: BackgroundTasks):
    """Start analysis for a pull request."""
    run_id = str(uuid.uuid4())
    _runs[run_id] = {"id": run_id, "pr_id": pr_id, "status": "queued"}

    async def run_analysis():
        _runs[run_id]["status"] = "analyzing"
        pipeline = AnalysisPipeline()
        # In production: fetch real PR data from GitHub API
        demo_pr_data = {
            "title": "Add payment retry mechanism",
            "description": "Implements automatic retry for failed payments",
            "repository": "orbita-demo/payment-service",
            "files": [
                {"filename": "services/payment_retry.py", "status": "added", "additions": 147, "deletions": 0},
                {"filename": "services/payment.py", "status": "modified", "additions": 24, "deletions": 8},
            ]
        }
        try:
            result = await pipeline.run(
                pr_data=demo_pr_data,
                diff_content="# Demo diff content",
                repository_context="",
            )
            _runs[run_id].update({"status": "complete", "result": result})
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            _runs[run_id].update({"status": "failed", "error": str(e)})

    background_tasks.add_task(run_analysis)
    return {"run_id": run_id, "status": "queued", "message": "Analysis started"}


@router.get("/runs/{run_id}")
async def get_run_status(run_id: str):
    run = _runs.get(run_id)
    if not run:
        return {"error": "Run not found"}, 404
    return run

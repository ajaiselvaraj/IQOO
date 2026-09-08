from fastapi import APIRouter

router = APIRouter()

DEMO_ANALYTICS = {
    "review_efficiency": {
        "prs_analyzed": 47,
        "findings_detected": 234,
        "findings_dismissed": 31,
        "findings_fixed": 178,
        "avg_analysis_time_seconds": 18.4,
    },
    "issue_distribution": [
        {"category": "security", "count": 18, "percentage": 32},
        {"category": "correctness", "count": 15, "percentage": 27},
        {"category": "performance", "count": 12, "percentage": 21},
        {"category": "maintainability", "count": 7, "percentage": 12},
        {"category": "style", "count": 4, "percentage": 8},
    ],
    "high_risk_files": [
        {"filename": "services/payment.py", "findings_count": 12, "critical_count": 3, "repository": "payment-service"},
        {"filename": "services/payment_retry.py", "findings_count": 8, "critical_count": 2, "repository": "payment-service"},
    ],
    "risk_trend": [
        {"date": "2026-08-25", "critical": 0, "high": 2, "medium": 5, "low": 8, "avg_score": 42},
        {"date": "2026-09-08", "critical": 1, "high": 1, "medium": 2, "low": 1, "avg_score": 72},
    ],
}


@router.get("")
async def get_analytics():
    return DEMO_ANALYTICS

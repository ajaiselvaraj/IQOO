import type {
  Repository, PullRequest, Finding, AnalysisRun, RiskScore,
  DiffFile, AnalyticsData, Notification, Review
} from '@/types';

// ─────────────────────────────────────────────
// Demo Repository
// ─────────────────────────────────────────────
export const DEMO_REPOSITORY: Repository = {
  id: 'repo-001',
  name: 'payment-service',
  fullName: 'orbita-demo/payment-service',
  language: 'Python',
  stars: 128,
  openPRs: 7,
  lastAnalyzed: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  riskDistribution: { critical: 1, high: 3, medium: 8, low: 12, passed: 2 },
  url: 'https://github.com/orbita-demo/payment-service',
  isPrivate: true,
};

export const DEMO_REPOSITORIES: Repository[] = [
  DEMO_REPOSITORY,
  {
    id: 'repo-002',
    name: 'api-gateway',
    fullName: 'orbita-demo/api-gateway',
    language: 'TypeScript',
    stars: 94,
    openPRs: 3,
    lastAnalyzed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    riskDistribution: { critical: 0, high: 1, medium: 4, low: 9, passed: 5 },
    url: 'https://github.com/orbita-demo/api-gateway',
    isPrivate: true,
  },
  {
    id: 'repo-003',
    name: 'user-service',
    fullName: 'orbita-demo/user-service',
    language: 'Go',
    stars: 67,
    openPRs: 2,
    lastAnalyzed: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    riskDistribution: { critical: 0, high: 0, medium: 2, low: 5, passed: 8 },
    url: 'https://github.com/orbita-demo/user-service',
    isPrivate: false,
  },
];

// ─────────────────────────────────────────────
// Demo Risk Score
// ─────────────────────────────────────────────
export const DEMO_RISK_SCORE: RiskScore = {
  overall: 72,
  level: 'high',
  breakdown: {
    security: {
      score: 18,
      maxScore: 25,
      reasoning: 'SQL injection risk detected in payment query construction. User-controlled input reaches database layer without proper parameterization.',
      confidence: 94,
    },
    correctness: {
      score: 14,
      maxScore: 25,
      reasoning: 'Retry logic does not account for idempotency keys, which may cause duplicate payment charges on transient failures.',
      confidence: 88,
    },
    performance: {
      score: 10,
      maxScore: 20,
      reasoning: 'N+1 query pattern detected: payment records are loaded individually within the retry loop instead of batch-fetched.',
      confidence: 76,
    },
    maintainability: {
      score: 19,
      maxScore: 20,
      reasoning: 'Code is well-structured and follows existing patterns. Minor unused variable detected.',
      confidence: 97,
    },
    complexity: {
      score: 11,
      maxScore: 10,
      reasoning: 'Retry mechanism adds control flow complexity. The exponential backoff logic is correct but introduces nested conditionals.',
      confidence: 85,
    },
  },
};

// ─────────────────────────────────────────────
// Demo Findings
// ─────────────────────────────────────────────
export const DEMO_FINDINGS: Finding[] = [
  {
    id: 'finding-001',
    pullRequestId: 'pr-142',
    severity: 'critical',
    category: 'security',
    title: 'Authentication bypass via unvalidated retry token',
    explanation: 'The retry token is extracted from the request body and used to look up payment sessions without verifying that the token belongs to the authenticated user. An attacker who obtains any valid retry token can replay payment operations for other users.',
    reasoning: 'The new `process_retry` function accepts `retry_token` from the API request and passes it directly to `PaymentSession.get_by_token()`. The session lookup does not include a `user_id` constraint, meaning any valid token grants access to that session regardless of who is making the request.',
    impact: 'An attacker could replay payment operations, charge arbitrary amounts to victims, or access payment history of other users. This is a critical authorization flaw that could result in financial loss and regulatory violations.',
    suggestedFix: `# Instead of:\nsession = PaymentSession.get_by_token(retry_token)\n\n# Use:\nsession = PaymentSession.get_by_token(\n    token=retry_token,\n    user_id=current_user.id  # Enforce ownership\n)\nif not session:\n    raise AuthorizationError("Invalid or expired retry token")`,
    file: 'services/payment_retry.py',
    line: 142,
    endLine: 148,
    codeSnippet: `async def process_retry(request: RetryRequest, user=Depends(get_current_user)):
    retry_token = request.retry_token
    # BUG: No user_id constraint — any token grants access
    session = await PaymentSession.get_by_token(retry_token)
    if not session:
        raise HTTPException(404, "Session not found")
    return await execute_payment(session)`,
    confidence: 96,
    evidence: [
      'retry_token originates from untrusted request body',
      'PaymentSession.get_by_token() has no user_id parameter',
      'No ownership validation before execute_payment() is called',
      'execute_payment() charges the card stored in the session',
    ],
    status: 'open',
    source: 'ai',
  },
  {
    id: 'finding-002',
    pullRequestId: 'pr-142',
    severity: 'high',
    category: 'security',
    title: 'User-controlled input reaches SQL query construction',
    explanation: 'The `payment_id` parameter from the request is interpolated directly into a SQL string using f-string formatting. This creates a SQL injection vulnerability that could allow an attacker to manipulate the query.',
    reasoning: 'In the new `get_payment_history` function added in this PR, the developer uses Python f-string formatting to build a raw SQL query instead of using the ORM\'s parameterized interface. The `payment_id` value originates from `request.payment_id` which is user-controlled input.',
    impact: 'An attacker could craft a malicious payment_id (e.g., `1 OR 1=1--`) to extract all payment records, exfiltrate sensitive financial data, or in extreme cases, modify or delete records.',
    suggestedFix: `# Vulnerable (current):\nquery = f"SELECT * FROM payments WHERE id = {payment_id}"\nresult = await db.execute(query)\n\n# Safe (parameterized):\nquery = "SELECT * FROM payments WHERE id = :payment_id"\nresult = await db.execute(query, {"payment_id": payment_id})`,
    file: 'services/payment.py',
    line: 89,
    endLine: 91,
    codeSnippet: `async def get_payment_history(payment_id: str, db=Depends(get_db)):
    # VULNERABILITY: Direct string interpolation
    query = f"SELECT * FROM payments WHERE id = {payment_id}"
    result = await db.execute(query)
    return result.fetchall()`,
    confidence: 94,
    evidence: [
      'payment_id comes from API request parameters',
      'f-string used for SQL construction (not parameterized)',
      'No input validation or sanitization applied',
      'payments table contains sensitive financial data',
    ],
    status: 'open',
    source: 'ai',
  },
  {
    id: 'finding-003',
    pullRequestId: 'pr-142',
    severity: 'medium',
    category: 'performance',
    title: 'N+1 query pattern in retry loop causes excessive database load',
    explanation: 'The retry mechanism loads payment records individually within the retry loop. For a batch retry operation with 50 payments, this generates 50 separate database roundtrips instead of 1 batch query.',
    reasoning: 'The `retry_all_failed` function iterates over payment IDs and calls `Payment.get(id)` in a loop. Each call issues a separate SELECT query. The existing codebase already has a `Payment.get_many(ids)` method that batch-fetches records, but it was not used here.',
    impact: 'Under load, a single batch retry request for 50 failed payments generates 50 database queries in quick succession. This increases latency from ~5ms to ~250ms and significantly increases database connection pressure.',
    suggestedFix: `# Inefficient (current):\nfor payment_id in failed_payment_ids:\n    payment = await Payment.get(payment_id)\n    await retry_payment(payment)\n\n# Efficient (batch):\npayments = await Payment.get_many(failed_payment_ids)\nfor payment in payments:\n    await retry_payment(payment)`,
    file: 'services/payment_retry.py',
    line: 67,
    endLine: 72,
    codeSnippet: `async def retry_all_failed(failed_payment_ids: list[str]):
    results = []
    for payment_id in failed_payment_ids:
        # N+1: one query per payment
        payment = await Payment.get(payment_id)
        result = await retry_payment(payment)
        results.append(result)
    return results`,
    confidence: 89,
    evidence: [
      'Payment.get() issues individual SELECT per call',
      'Loop iterates over arbitrary-length list',
      'Payment.get_many() exists and is not used',
      'No bulk operation or connection pooling benefit',
    ],
    status: 'open',
    source: 'ruff',
  },
  {
    id: 'finding-004',
    pullRequestId: 'pr-142',
    severity: 'medium',
    category: 'correctness',
    title: 'Retry logic lacks idempotency key — may cause duplicate charges',
    explanation: 'The payment retry mechanism does not generate or track idempotency keys. If the payment provider receives the same request twice (e.g., due to network timeout), it may process the charge twice.',
    reasoning: 'Stripe and most payment processors support idempotency keys to prevent duplicate charges. The original payment code uses them (see PaymentService.charge()), but the new retry path bypasses this by calling the provider directly without including an idempotency key.',
    impact: 'In the event of a transient network failure between ORBITA and the payment provider, a retry could result in a customer being charged twice for the same order. This is a real financial correctness issue.',
    suggestedFix: `# Add idempotency key based on session + attempt number:\nidempotency_key = f"{session.id}-retry-{session.retry_count}"\nawait payment_provider.charge(\n    amount=session.amount,\n    customer_id=session.customer_id,\n    idempotency_key=idempotency_key  # Prevents duplicate charges\n)`,
    file: 'services/payment_retry.py',
    line: 156,
    endLine: 162,
    codeSnippet: `async def execute_payment(session: PaymentSession):
    # Missing: idempotency_key parameter
    result = await payment_provider.charge(
        amount=session.amount,
        customer_id=session.customer_id,
        # No idempotency_key — duplicate charge risk
    )
    return result`,
    confidence: 82,
    evidence: [
      'Original PaymentService.charge() uses idempotency keys',
      'Retry path calls payment_provider directly',
      'No idempotency_key parameter passed',
      'Network timeouts are common in payment flows',
    ],
    status: 'open',
    source: 'ai',
  },
  {
    id: 'finding-005',
    pullRequestId: 'pr-142',
    severity: 'low',
    category: 'maintainability',
    title: 'Unused variable `_original_error` in exception handler',
    explanation: 'The variable `_original_error` is assigned in the exception handler but never used. This is dead code that increases cognitive load when reading the error handling path.',
    reasoning: 'Ruff (F841) detected this unused assignment. While it does not affect functionality, it suggests the original error context was intended to be logged or included in the retry decision but was accidentally omitted.',
    impact: 'Minimal functional impact. May indicate incomplete error context propagation — the original error details might be useful for debugging failed retry attempts in production.',
    suggestedFix: `# Remove unused variable:\nexcept PaymentError as e:\n    # Was: _original_error = e  (unused)\n    logger.warning(f"Payment attempt failed: {e}", extra={"payment_id": payment_id})\n    continue`,
    file: 'services/payment_retry.py',
    line: 198,
    codeSnippet: `    except PaymentError as e:
        _original_error = e  # Assigned but never read
        logger.warning("Payment attempt failed")
        continue`,
    confidence: 99,
    evidence: [
      'Ruff F841: local variable _original_error is assigned but never used',
      'Variable prefix _ convention not followed (intended vs accidental unused)',
    ],
    status: 'open',
    source: 'ruff',
  },
];

// ─────────────────────────────────────────────
// Demo Pull Request
// ─────────────────────────────────────────────
export const DEMO_PR: PullRequest = {
  id: 'pr-142',
  number: 142,
  title: 'Add payment retry mechanism',
  author: {
    login: 'alex-chen',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex-chen&backgroundColor=b6e3f4',
    name: 'Alex Chen',
  },
  repository: 'orbita-demo/payment-service',
  repositoryId: 'repo-001',
  branch: 'feat/payment-retry',
  baseBranch: 'main',
  commitSha: 'a4f9c2d',
  filesChanged: 8,
  additions: 247,
  deletions: 34,
  status: 'complete',
  riskScore: DEMO_RISK_SCORE,
  findingsCount: {
    critical: 1,
    high: 1,
    medium: 2,
    low: 1,
    info: 0,
    total: 5,
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  url: 'https://github.com/orbita-demo/payment-service/pull/142',
  description: `## Summary

Implements automatic retry mechanism for failed payment attempts.

### Changes
- Added \`PaymentRetryService\` with exponential backoff
- New API endpoint \`POST /payments/retry\`
- Retry history tracking in database
- Configurable retry limits via environment variables

### Testing
- Unit tests for retry logic
- Integration tests with payment provider sandbox

Closes #138`,
  labels: ['payment', 'critical-path', 'needs-review'],
};

export const DEMO_PRS: PullRequest[] = [
  DEMO_PR,
  {
    id: 'pr-141',
    number: 141,
    title: 'Refactor currency conversion service',
    author: {
      login: 'sarah-k',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-k&backgroundColor=c0aede',
      name: 'Sarah Kim',
    },
    repository: 'orbita-demo/payment-service',
    repositoryId: 'repo-001',
    branch: 'refactor/currency',
    baseBranch: 'main',
    commitSha: 'b2e8a1f',
    filesChanged: 12,
    additions: 189,
    deletions: 201,
    status: 'complete',
    riskScore: { overall: 38, level: 'medium', breakdown: {
      security: { score: 22, maxScore: 25, reasoning: 'No security issues detected.', confidence: 95 },
      correctness: { score: 18, maxScore: 25, reasoning: 'Minor edge case in negative amounts.', confidence: 78 },
      performance: { score: 16, maxScore: 20, reasoning: 'Exchange rate caching improved.', confidence: 90 },
      maintainability: { score: 17, maxScore: 20, reasoning: 'Code is cleaner after refactor.', confidence: 94 },
      complexity: { score: 9, maxScore: 10, reasoning: 'Complexity reduced significantly.', confidence: 91 },
    }},
    findingsCount: { critical: 0, high: 0, medium: 2, low: 3, info: 1, total: 6 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    url: 'https://github.com/orbita-demo/payment-service/pull/141',
    description: 'Refactors the currency conversion service to use a new exchange rate provider.',
    labels: ['refactor'],
  },
  {
    id: 'pr-140',
    number: 140,
    title: 'Add webhook signature validation',
    author: {
      login: 'marcus-r',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus-r&backgroundColor=d1d4f9',
      name: 'Marcus Rivera',
    },
    repository: 'orbita-demo/api-gateway',
    repositoryId: 'repo-002',
    branch: 'feat/webhook-validation',
    baseBranch: 'main',
    commitSha: 'c7d3b5e',
    filesChanged: 4,
    additions: 87,
    deletions: 12,
    status: 'complete',
    riskScore: { overall: 18, level: 'low', breakdown: {
      security: { score: 24, maxScore: 25, reasoning: 'HMAC validation properly implemented.', confidence: 98 },
      correctness: { score: 23, maxScore: 25, reasoning: 'Logic is correct with good error handling.', confidence: 95 },
      performance: { score: 19, maxScore: 20, reasoning: 'Efficient implementation.', confidence: 97 },
      maintainability: { score: 19, maxScore: 20, reasoning: 'Well-structured code with tests.', confidence: 96 },
      complexity: { score: 9, maxScore: 10, reasoning: 'Low complexity.', confidence: 99 },
    }},
    findingsCount: { critical: 0, high: 0, medium: 0, low: 2, info: 1, total: 3 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    url: 'https://github.com/orbita-demo/api-gateway/pull/140',
    description: 'Adds HMAC SHA-256 signature validation for incoming webhooks.',
    labels: ['security', 'webhook'],
  },
];

// ─────────────────────────────────────────────
// Demo Analysis Run
// ─────────────────────────────────────────────
export const DEMO_ANALYSIS_RUN: AnalysisRun = {
  id: 'run-001',
  pullRequestId: 'pr-142',
  stages: [
    { id: 's1', name: 'Fetching PR', description: 'Retrieving pull request metadata, commits, and file list from GitHub', status: 'complete', startedAt: new Date(Date.now() - 72000).toISOString(), completedAt: new Date(Date.now() - 70000).toISOString(), durationMs: 312 },
    { id: 's2', name: 'Understanding diff', description: 'Parsing unified diff, mapping changed lines, building AST for modified functions', status: 'complete', startedAt: new Date(Date.now() - 70000).toISOString(), completedAt: new Date(Date.now() - 66000).toISOString(), durationMs: 891 },
    { id: 's3', name: 'Loading repository context', description: 'Fetching surrounding functions, imports, interfaces, and related files', status: 'complete', startedAt: new Date(Date.now() - 66000).toISOString(), completedAt: new Date(Date.now() - 61000).toISOString(), durationMs: 1204 },
    { id: 's4', name: 'Running static analysis', description: 'Executing Ruff, Semgrep OWASP ruleset, and AST pattern analysis', status: 'complete', startedAt: new Date(Date.now() - 61000).toISOString(), completedAt: new Date(Date.now() - 55000).toISOString(), durationMs: 2341 },
    { id: 's5', name: 'AI reasoning over changes', description: 'Gemini reasoning about correctness, security, performance, and architecture', status: 'complete', startedAt: new Date(Date.now() - 55000).toISOString(), completedAt: new Date(Date.now() - 35000).toISOString(), durationMs: 8234 },
    { id: 's6', name: 'Validating findings', description: 'Second-pass validation to distinguish genuine issues from false positives', status: 'complete', startedAt: new Date(Date.now() - 35000).toISOString(), completedAt: new Date(Date.now() - 28000).toISOString(), durationMs: 3102 },
    { id: 's7', name: 'Calculating risk score', description: 'Weighted risk scoring across security, correctness, performance, maintainability', status: 'complete', startedAt: new Date(Date.now() - 28000).toISOString(), completedAt: new Date(Date.now() - 26000).toISOString(), durationMs: 412 },
    { id: 's8', name: 'Preparing review', description: 'Generating structured review with GitHub comment positions', status: 'complete', startedAt: new Date(Date.now() - 26000).toISOString(), completedAt: new Date(Date.now() - 24000).toISOString(), durationMs: 891 },
  ],
  startedAt: new Date(Date.now() - 72000).toISOString(),
  completedAt: new Date(Date.now() - 24000).toISOString(),
  status: 'complete',
  durationMs: 17387,
};

// ─────────────────────────────────────────────
// Demo Diff
// ─────────────────────────────────────────────
export const DEMO_DIFF_FILES: DiffFile[] = [
  {
    filename: 'services/payment_retry.py',
    status: 'added',
    additions: 147,
    deletions: 0,
    language: 'python',
    patch: `@@ -0,0 +1,147 @@
+import asyncio
+import logging
+from typing import Optional
+from fastapi import Depends, HTTPException
+from models.payment import Payment, PaymentSession
+from models.retry import RetryRequest
+from services.auth import get_current_user
+
+logger = logging.getLogger(__name__)
+
+MAX_RETRY_ATTEMPTS = 3
+BACKOFF_BASE = 2.0
+
+
+async def retry_all_failed(failed_payment_ids: list[str]):
+    """Retry all failed payments in a batch."""
+    results = []
+    for payment_id in failed_payment_ids:
+        # N+1: one query per payment - should use get_many()
+        payment = await Payment.get(payment_id)
+        result = await retry_payment(payment)
+        results.append(result)
+    return results
+
+
+async def process_retry(
+    request: RetryRequest,
+    user=Depends(get_current_user)
+):
+    retry_token = request.retry_token
+    # Missing user_id constraint — auth bypass
+    session = await PaymentSession.get_by_token(retry_token)
+    if not session:
+        raise HTTPException(404, "Session not found")
+    return await execute_payment(session)
+
+
+async def execute_payment(session: PaymentSession):
+    """Execute payment charge via provider."""
+    result = await payment_provider.charge(
+        amount=session.amount,
+        customer_id=session.customer_id,
+        # Missing: idempotency_key
+    )
+    return result`,
  },
  {
    filename: 'services/payment.py',
    status: 'modified',
    additions: 24,
    deletions: 8,
    language: 'python',
    patch: `@@ -85,8 +85,24 @@ class PaymentService:
     async def get_payment(self, payment_id: str):
         return await Payment.get(payment_id)
 
+    async def get_payment_history(
+        self,
+        payment_id: str,
+        db=Depends(get_db)
+    ):
+        # SQL injection vulnerability
+        query = f"SELECT * FROM payments WHERE id = {payment_id}"
+        result = await db.execute(query)
+        return result.fetchall()
+
     async def process_refund(self, payment_id: str, amount: float):
-        payment = await self.get_payment(payment_id)
+        payment = await Payment.get(payment_id)
         if payment.status != "completed":
             raise ValueError("Cannot refund non-completed payment")
         return await self.provider.refund(payment_id, amount)`,
  },
  {
    filename: 'api/routes/payments.py',
    status: 'modified',
    additions: 18,
    deletions: 4,
    language: 'python',
    patch: `@@ -1,4 +1,22 @@
 from fastapi import APIRouter, Depends
 from services.payment import PaymentService
+from services.payment_retry import process_retry, retry_all_failed
+from models.retry import RetryRequest, BatchRetryRequest
+
+router = APIRouter(prefix="/payments", tags=["payments"])
+
+
+@router.post("/retry")
+async def retry_payment(request: RetryRequest):
+    return await process_retry(request)
+
+
+@router.post("/retry/batch")
+async def batch_retry(request: BatchRetryRequest):
+    return await retry_all_failed(request.payment_ids)
+
+
+@router.get("/{payment_id}/history")
+async def payment_history(payment_id: str):
+    return await PaymentService().get_payment_history(payment_id)`,
  },
  {
    filename: 'models/retry.py',
    status: 'added',
    additions: 28,
    deletions: 0,
    language: 'python',
    patch: `@@ -0,0 +1,28 @@
+from pydantic import BaseModel
+from typing import Optional
+
+
+class RetryRequest(BaseModel):
+    retry_token: str
+    reason: Optional[str] = None
+
+
+class BatchRetryRequest(BaseModel):
+    payment_ids: list[str]
+    max_retries: int = 3`,
  },
  {
    filename: 'tests/test_retry.py',
    status: 'added',
    additions: 54,
    deletions: 0,
    language: 'python',
    patch: `@@ -0,0 +1,54 @@
+import pytest
+from unittest.mock import AsyncMock, patch
+from services.payment_retry import process_retry, execute_payment
+
+
+@pytest.mark.asyncio
+async def test_execute_payment_success():
+    mock_session = AsyncMock()
+    mock_session.amount = 100.00
+    mock_session.customer_id = "cust_123"
+    
+    with patch("services.payment_retry.payment_provider") as mock_provider:
+        mock_provider.charge = AsyncMock(return_value={"status": "success"})
+        result = await execute_payment(mock_session)
+        assert result["status"] == "success"`,
  },
];

// ─────────────────────────────────────────────
// Demo Analytics
// ─────────────────────────────────────────────
export const DEMO_ANALYTICS: AnalyticsData = {
  riskTrend: [
    { date: '2026-08-25', critical: 0, high: 2, medium: 5, low: 8, avgScore: 42 },
    { date: '2026-08-27', critical: 1, high: 3, medium: 6, low: 7, avgScore: 58 },
    { date: '2026-08-29', critical: 0, high: 1, medium: 4, low: 9, avgScore: 31 },
    { date: '2026-09-01', critical: 2, high: 4, medium: 8, low: 6, avgScore: 71 },
    { date: '2026-09-03', critical: 1, high: 2, medium: 5, low: 11, avgScore: 55 },
    { date: '2026-09-05', critical: 0, high: 1, medium: 3, low: 8, avgScore: 29 },
    { date: '2026-09-08', critical: 1, high: 1, medium: 2, low: 1, avgScore: 72 },
  ],
  issueDistribution: [
    { category: 'security', count: 18, percentage: 32 },
    { category: 'correctness', count: 15, percentage: 27 },
    { category: 'performance', count: 12, percentage: 21 },
    { category: 'maintainability', count: 7, percentage: 12 },
    { category: 'style', count: 4, percentage: 8 },
  ],
  highRiskFiles: [
    { filename: 'services/payment.py', findingsCount: 12, criticalCount: 3, repository: 'payment-service' },
    { filename: 'services/payment_retry.py', findingsCount: 8, criticalCount: 2, repository: 'payment-service' },
    { filename: 'api/routes/auth.py', findingsCount: 6, criticalCount: 1, repository: 'payment-service' },
    { filename: 'middleware/validation.py', findingsCount: 5, criticalCount: 0, repository: 'api-gateway' },
    { filename: 'handlers/webhook.go', findingsCount: 4, criticalCount: 0, repository: 'user-service' },
  ],
  reviewEfficiency: {
    prAnalyzed: 47,
    findingsDetected: 234,
    findingsDismissed: 31,
    findingsFixed: 178,
    avgAnalysisTime: 18.4,
  },
  commonPatterns: [
    { pattern: 'SQL injection via string interpolation', count: 8, severity: 'high', category: 'security' },
    { pattern: 'Missing input validation', count: 12, severity: 'high', category: 'security' },
    { pattern: 'N+1 query in loop', count: 6, severity: 'medium', category: 'performance' },
    { pattern: 'Unhandled async exception', count: 9, severity: 'medium', category: 'correctness' },
    { pattern: 'Unused variable assignment', count: 18, severity: 'low', category: 'maintainability' },
  ],
};

// ─────────────────────────────────────────────
// Demo Notifications
// ─────────────────────────────────────────────
export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'critical_finding',
    title: 'Critical issue detected',
    message: 'PR #142 · Authentication bypass via unvalidated retry token',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    pullRequestId: 'pr-142',
  },
  {
    id: 'notif-002',
    type: 'analysis_complete',
    title: 'Analysis complete',
    message: 'PR #142 analyzed — 5 findings, risk score 72/100 HIGH',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    pullRequestId: 'pr-142',
  },
  {
    id: 'notif-003',
    type: 'analysis_complete',
    title: 'Analysis complete',
    message: 'PR #141 analyzed — 6 findings, risk score 38/100 MEDIUM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    pullRequestId: 'pr-141',
  },
];

// ─────────────────────────────────────────────
// Demo Review
// ─────────────────────────────────────────────
export const DEMO_REVIEW: Review = {
  id: 'review-001',
  pullRequestId: 'pr-142',
  status: 'pending',
  summary: `## ORBITA Analysis — PR #142: Add payment retry mechanism

**Risk Score: 72/100 — HIGH RISK** ⚠️

ORBITA identified **5 findings** across this pull request, including **1 critical** authorization issue that should be resolved before merging.

### Critical Issues (1)
The retry token lookup does not enforce user ownership, creating an authentication bypass that could allow users to execute payments against other users' sessions.

### High Issues (1)
SQL injection vulnerability in the new payment history endpoint via direct string interpolation.

### Medium Issues (2)  
- N+1 query pattern in batch retry loop
- Missing idempotency keys may cause duplicate charges

### Low Issues (1)
Unused variable in exception handler

---
*Generated by ORBITA AI PR Intelligence · Analysis ID: run-001*`,
  findings: DEMO_FINDINGS,
  riskScore: DEMO_RISK_SCORE,
};

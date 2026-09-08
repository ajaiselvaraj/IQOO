"""
8-Stage AI Analysis Pipeline
"""
import asyncio
import logging
import uuid
import subprocess
import json
import tempfile
import os
from typing import Any
from app.services.llm import get_llm_provider
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

ANALYSIS_SYSTEM_PROMPT = """You are ORBITA, a world-class AI code review agent.
You analyze Pull Request diffs with deep understanding of security, correctness, performance, and architecture.

Your findings must be:
1. SPECIFIC — tied to exact file + line numbers in the diff
2. ACTIONABLE — every finding includes a concrete suggested fix
3. REASONED — explain why this is a problem, not just that it is
4. HONEST — if confidence is below 70%, mark as informational
5. CONTEXTUAL — consider the repository's existing patterns

You output structured JSON only. Never include raw chain-of-thought.
"""

ANALYSIS_PROMPT_TEMPLATE = """Analyze this Pull Request diff and identify security, correctness, performance, and maintainability issues.

## PR Metadata
Title: {title}
Description: {description}
Repository: {repository}

## Changed Files Summary
{files_summary}

## Diff
```
{diff}
```

## Repository Context
{context}

## Custom Rules
{custom_rules}

Output a JSON object with this exact schema:
{{
    "findings": [
        {{
            "severity": "critical|high|medium|low|info",
            "category": "security|correctness|performance|maintainability|style|architecture",
            "title": "concise finding title",
            "explanation": "detailed explanation of the issue",
            "reasoning": "why this is a problem in this specific context",
            "impact": "what could happen if this is not fixed",
            "suggested_fix": "concrete code fix",
            "file": "path/to/file.py",
            "line": 42,
            "end_line": 48,
            "code_snippet": "the problematic code",
            "confidence": 0.92,
            "evidence": ["evidence point 1", "evidence point 2"],
            "source": "ai"
        }}
    ],
    "risk_summary": "brief summary of the overall risk"
}}

Focus on real issues. Do not fabricate findings. If the code is clean, return an empty findings array."""

VALIDATION_PROMPT_TEMPLATE = """You are reviewing a list of findings from a code analysis to determine which are genuine issues vs false positives.

For each finding, assess:
1. Is this a GENUINE issue that warrants attention?
2. Is this a FALSE POSITIVE (common pattern, intentional choice, not actually problematic)?
3. Is this INFORMATIONAL only (low-impact observation)?

Input findings:
{findings_json}

Diff context:
{diff_excerpt}

Output JSON:
{{
    "validated_findings": [
        {{
            "id": "finding id",
            "verdict": "genuine|false_positive|informational",
            "confidence_adjustment": 0.0,
            "validation_note": "brief note on verdict"
        }}
    ]
}}"""

RISK_SCORING_PROMPT_TEMPLATE = """Given these validated findings, calculate a risk score breakdown.

Findings:
{findings_json}

Calculate scores on these dimensions (output 0-max for each):
- Security (max 25): severity of any security vulnerabilities
- Correctness (max 25): bugs and logic errors
- Performance (max 20): performance issues
- Maintainability (max 20): code quality issues
- Complexity (max 10): complexity added

Overall = sum of all scores (0-100). Higher = more risk.

Output JSON:
{{
    "overall": 72,
    "level": "critical|high|medium|low|passed",
    "security": {{"score": 18, "max_score": 25, "reasoning": "...", "confidence": 0.94}},
    "correctness": {{"score": 14, "max_score": 25, "reasoning": "...", "confidence": 0.88}},
    "performance": {{"score": 10, "max_score": 20, "reasoning": "...", "confidence": 0.76}},
    "maintainability": {{"score": 19, "max_score": 20, "reasoning": "...", "confidence": 0.97}},
    "complexity": {{"score": 11, "max_score": 10, "reasoning": "...", "confidence": 0.85}}
}}"""


async def run_ruff_analysis(diff_content: str, language: str) -> list[dict]:
    """Run Ruff on Python diff content."""
    if language.lower() not in ("python", "py"):
        return []
    try:
        with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as f:
            # Extract only added lines from diff
            added_lines = [
                line[1:] for line in diff_content.split("\n")
                if line.startswith("+") and not line.startswith("+++")
            ]
            f.write("\n".join(added_lines))
            tmp_path = f.name

        result = subprocess.run(
            ["ruff", "check", "--output-format=json", tmp_path],
            capture_output=True, text=True, timeout=30
        )
        os.unlink(tmp_path)

        if result.stdout:
            ruff_output = json.loads(result.stdout)
            return [
                {
                    "severity": "low" if r.get("code", "").startswith("F") else "info",
                    "category": "style" if r.get("code", "").startswith("E") else "maintainability",
                    "title": r.get("message", "Ruff lint issue"),
                    "file": r.get("filename", "unknown"),
                    "line": r.get("location", {}).get("row", 0),
                    "code": r.get("code", ""),
                    "source": "ruff",
                    "confidence": 0.99,
                    "explanation": r.get("message", ""),
                    "reasoning": f"Ruff rule {r.get('code')} violation detected in new code.",
                    "impact": "Minor code quality issue.",
                    "suggested_fix": r.get("fix", {}).get("message", "") if r.get("fix") else "Fix the lint violation.",
                    "evidence": [f"Ruff {r.get('code', '')}: {r.get('message', '')}"],
                }
                for r in ruff_output
            ]
        return []
    except Exception as e:
        logger.warning(f"Ruff analysis failed: {e}")
        return []


async def run_semgrep_analysis(diff_content: str) -> list[dict]:
    """Run Semgrep with OWASP security rules on diff content."""
    try:
        added_lines = [
            line[1:] for line in diff_content.split("\n")
            if line.startswith("+") and not line.startswith("+++")
        ]
        with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as f:
            f.write("\n".join(added_lines))
            tmp_path = f.name

        result = subprocess.run(
            ["semgrep", "--config=p/owasp-top-ten", "--json", tmp_path],
            capture_output=True, text=True, timeout=60
        )
        os.unlink(tmp_path)

        if result.stdout:
            semgrep_output = json.loads(result.stdout)
            return [
                {
                    "severity": "high",
                    "category": "security",
                    "title": r.get("check_id", "Security issue").split(".")[-1].replace("-", " ").title(),
                    "file": r.get("path", "unknown"),
                    "line": r.get("start", {}).get("line", 0),
                    "source": "semgrep",
                    "confidence": 0.88,
                    "explanation": r.get("extra", {}).get("message", ""),
                    "reasoning": "Semgrep OWASP rule flagged this pattern.",
                    "impact": r.get("extra", {}).get("message", "Security vulnerability"),
                    "suggested_fix": r.get("extra", {}).get("fix", "Review and fix the security issue."),
                    "evidence": [f"Semgrep rule: {r.get('check_id', '')}"],
                    "code_snippet": r.get("extra", {}).get("lines", ""),
                }
                for r in semgrep_output.get("results", [])
            ]
        return []
    except Exception as e:
        logger.warning(f"Semgrep analysis failed (likely not installed): {e}")
        return []


class AnalysisPipeline:
    """8-stage PR analysis pipeline."""

    def __init__(self):
        self.llm = get_llm_provider()
        self.stages = [
            "Fetching PR",
            "Understanding diff",
            "Loading repository context",
            "Running static analysis",
            "AI reasoning over changes",
            "Validating findings",
            "Calculating risk score",
            "Preparing review",
        ]

    async def run(
        self,
        pr_data: dict,
        diff_content: str,
        repository_context: str = "",
        custom_rules: str = "",
        progress_callback=None,
    ) -> dict[str, Any]:
        """Run all 8 analysis stages and return findings + risk score."""

        async def progress(stage_idx: int, **kwargs):
            if progress_callback:
                await progress_callback(stage_idx, self.stages[stage_idx], **kwargs)

        # Stage 1: PR Understanding
        await progress(0)
        await asyncio.sleep(0.1)  # Simulate work
        files_summary = "\n".join(
            f"- {f['filename']} ({f['status']}, +{f.get('additions', 0)}-{f.get('deletions', 0)})"
            for f in pr_data.get("files", [])
        )

        # Stage 2: Understanding diff
        await progress(1)
        diff_truncated = diff_content[:settings.MAX_DIFF_SIZE_CHARS]

        # Stage 3: Loading context
        await progress(2)
        await asyncio.sleep(0.5)

        # Stage 4: Static analysis
        await progress(3)
        static_findings = []

        # Detect primary language
        files = pr_data.get("files", [])
        has_python = any(f.get("filename", "").endswith(".py") for f in files)

        if has_python:
            ruff_results, semgrep_results = await asyncio.gather(
                run_ruff_analysis(diff_truncated, "python"),
                run_semgrep_analysis(diff_truncated),
            )
            static_findings.extend(ruff_results)
            static_findings.extend(semgrep_results)

        # Stage 5: AI reasoning
        await progress(4)
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(
            title=pr_data.get("title", ""),
            description=pr_data.get("description", "")[:1000],
            repository=pr_data.get("repository", ""),
            files_summary=files_summary,
            diff=diff_truncated,
            context=repository_context[:3000] if repository_context else "No additional context available.",
            custom_rules=custom_rules or "No custom rules defined.",
        )

        try:
            ai_response = await self.llm.generate(
                prompt=prompt,
                system_prompt=ANALYSIS_SYSTEM_PROMPT,
                temperature=0.1,
            )
            ai_findings = ai_response.get("findings", [])
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            ai_findings = []

        # Combine findings
        all_findings = ai_findings + [
            f for f in static_findings
            if f.get("confidence", 0) >= settings.FINDING_CONFIDENCE_THRESHOLD
        ]

        # Stage 6: Validation
        await progress(5)
        if all_findings and len(all_findings) > 0:
            try:
                validation_response = await self.llm.generate(
                    prompt=VALIDATION_PROMPT_TEMPLATE.format(
                        findings_json=json.dumps(all_findings[:10], indent=2),
                        diff_excerpt=diff_truncated[:3000],
                    ),
                    system_prompt=ANALYSIS_SYSTEM_PROMPT,
                )
                validated = validation_response.get("validated_findings", [])
                # Filter out false positives
                false_positive_ids = {
                    v["id"] for v in validated
                    if v.get("verdict") == "false_positive"
                }
                all_findings = [
                    {**f, "id": f.get("id", str(uuid.uuid4()))}
                    for f in all_findings
                    if f.get("id") not in false_positive_ids
                ]
            except Exception as e:
                logger.warning(f"Validation step failed: {e}")

        # Add IDs to all findings
        for f in all_findings:
            if not f.get("id"):
                f["id"] = str(uuid.uuid4())

        # Stage 7: Risk scoring
        await progress(6)
        try:
            risk_response = await self.llm.generate(
                prompt=RISK_SCORING_PROMPT_TEMPLATE.format(
                    findings_json=json.dumps(all_findings, indent=2)
                ),
                system_prompt=ANALYSIS_SYSTEM_PROMPT,
            )
            risk_score = risk_response
        except Exception as e:
            logger.warning(f"Risk scoring failed: {e}, using fallback")
            risk_score = _calculate_fallback_risk_score(all_findings)

        # Stage 8: Preparing review
        await progress(7)
        review_summary = _generate_review_summary(pr_data, all_findings, risk_score)

        return {
            "findings": all_findings,
            "risk_score": risk_score,
            "review_summary": review_summary,
            "static_finding_count": len(static_findings),
            "ai_finding_count": len(ai_findings),
        }


def _calculate_fallback_risk_score(findings: list[dict]) -> dict:
    """Calculate risk score from findings without LLM."""
    critical = sum(1 for f in findings if f.get("severity") == "critical")
    high = sum(1 for f in findings if f.get("severity") == "high")
    medium = sum(1 for f in findings if f.get("severity") == "medium")
    low = sum(1 for f in findings if f.get("severity") == "low")

    score = min(100, critical * 25 + high * 15 + medium * 8 + low * 2)
    level = "critical" if score >= 80 else "high" if score >= 60 else "medium" if score >= 40 else "low" if score >= 15 else "passed"

    return {
        "overall": score,
        "level": level,
        "security": {"score": min(25, critical * 20 + high * 5), "max_score": 25, "reasoning": "Calculated from findings.", "confidence": 0.7},
        "correctness": {"score": min(25, critical * 10 + high * 8 + medium * 4), "max_score": 25, "reasoning": "Calculated from findings.", "confidence": 0.7},
        "performance": {"score": min(20, medium * 6 + low * 2), "max_score": 20, "reasoning": "Calculated from findings.", "confidence": 0.7},
        "maintainability": {"score": max(0, 20 - low * 2), "max_score": 20, "reasoning": "Calculated from findings.", "confidence": 0.7},
        "complexity": {"score": min(10, (critical + high + medium) * 2), "max_score": 10, "reasoning": "Calculated from findings.", "confidence": 0.7},
    }


def _generate_review_summary(pr_data: dict, findings: list[dict], risk_score: dict) -> str:
    """Generate GitHub review summary text."""
    critical = [f for f in findings if f.get("severity") == "critical"]
    high = [f for f in findings if f.get("severity") == "high"]
    medium = [f for f in findings if f.get("severity") == "medium"]
    low = [f for f in findings if f.get("severity") == "low"]

    level = risk_score.get("level", "unknown").upper()
    overall = risk_score.get("overall", 0)

    lines = [
        f"## ORBITA Analysis — {pr_data.get('title', 'Pull Request')}",
        "",
        f"**Risk Score: {overall}/100 — {level}**",
        "",
        f"ORBITA identified **{len(findings)} finding(s)** in this pull request.",
        "",
    ]

    if critical:
        lines.append(f"### Critical Issues ({len(critical)})")
        for f in critical[:3]:
            lines.append(f"- **{f['title']}** — `{f['file']}:{f['line']}`")
        lines.append("")

    if high:
        lines.append(f"### High Issues ({len(high)})")
        for f in high[:3]:
            lines.append(f"- **{f['title']}** — `{f['file']}:{f['line']}`")
        lines.append("")

    if medium:
        lines.append(f"### Medium Issues ({len(medium)})")
        for f in medium[:3]:
            lines.append(f"- {f['title']}")
        lines.append("")

    if low:
        lines.append(f"### Low Issues ({len(low)})")
        lines.append(f"- {len(low)} low-priority observations")
        lines.append("")

    lines.append("---")
    lines.append("*Generated by ORBITA AI PR Intelligence*")

    return "\n".join(lines)

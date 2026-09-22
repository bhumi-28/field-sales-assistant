from fastapi import FastAPI
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
import os
import json

load_dotenv()

app = FastAPI(title="Field Sales AI Service")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}


@app.get("/test-groq")
def test_groq():
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "user", "content": "Say hello in one short sentence."}
        ]
    )
    return {"reply": response.choices[0].message.content}


class VisitAnalysisRequest(BaseModel):
    purpose: str
    discussion: str
    product_interest: str | None = None
    competitor: str | None = None
    requirement: str | None = None
    remarks: str | None = None


SYSTEM_PROMPT = """You are a sales intelligence assistant. Given field sales visit notes, return ONLY a valid JSON object with these exact keys:
- summary: 2-3 sentence summary of the visit
- sentiment: one of POSITIVE, NEUTRAL, NEGATIVE
- opportunity: one of LOW, MEDIUM, HIGH
- priority: one of LOW, MEDIUM, HIGH
- recommendation: one short actionable next step
- competitiveRisk: one of LOW, MEDIUM, HIGH

Return raw JSON only, no markdown, no explanation."""


@app.post("/analyze-visit")
def analyze_visit(visit: VisitAnalysisRequest):
    user_content = f"""Purpose: {visit.purpose}
Discussion: {visit.discussion}
Product Interest: {visit.product_interest or 'N/A'}
Competitor: {visit.competitor or 'N/A'}
Requirement: {visit.requirement or 'N/A'}
Remarks: {visit.remarks or 'N/A'}"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)
    return result
from fastapi import FastAPI
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
import os
import json
import requests

load_dotenv()

app = FastAPI(title="Field Sales AI Service")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8081/api")


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


# ---------------------------------------------------------------------------
# AI Sales Assistant (tool-calling agent)
# ---------------------------------------------------------------------------

class AssistantRequest(BaseModel):
    question: str
    token: str  # the caller's JWT, forwarded so we can call the backend as them


def _backend_get(path: str, token: str):
    resp = requests.get(
        f"{BACKEND_BASE_URL}{path}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def get_customers(token: str):
    return _backend_get("/customers", token)


def get_visits(token: str):
    return _backend_get("/visits", token)


def get_pending_tasks(token: str):
    tasks = _backend_get("/tasks", token)
    return [t for t in tasks if t.get("status") in ("OPEN", "IN_PROGRESS")]


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_customers",
            "description": "Get all customers with name, phone, email, city, status and assigned sales rep.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_visits",
            "description": "Get all recorded customer visits, including discussion notes, product interest, competitor info, follow-up dates, and the AI insight (summary, sentiment, opportunity, priority, recommendation) for each visit where available.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_pending_tasks",
            "description": "Get follow-up tasks that are still OPEN or IN_PROGRESS, with due dates and priority.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

AVAILABLE_FUNCTIONS = {
    "get_customers": get_customers,
    "get_visits": get_visits,
    "get_pending_tasks": get_pending_tasks,
}

ASSISTANT_SYSTEM_PROMPT = """You are a sales assistant for a field sales team.
Answer questions using ONLY the data returned by the tools available to you — never invent customers, visits, tasks, dates or numbers.
If the tool data is not enough to answer confidently, say so clearly instead of guessing.
When reasoning about relative time ("this week", "last 30 days"), use the dates present in the data.
Keep answers short and to the point, written for a busy sales manager."""


@app.post("/assistant")
def ai_assistant(req: AssistantRequest):
    messages = [
        {"role": "system", "content": ASSISTANT_SYSTEM_PROMPT},
        {"role": "user", "content": req.question},
    ]

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if not tool_calls:
        return {"answer": response_message.content}

    # Run every tool the model asked for
    tool_results = []
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        function_to_call = AVAILABLE_FUNCTIONS.get(function_name)

        try:
            function_response = (
                function_to_call(req.token)
                if function_to_call
                else {"error": f"Unknown tool: {function_name}"}
            )
        except requests.exceptions.RequestException as e:
            function_response = {"error": f"Backend call failed: {str(e)}"}

        tool_results.append({"tool": function_name, "data": function_response})

    # Fresh follow-up call with NO tools and NO prior tool-call history.
    # openai/gpt-oss-120b sometimes tries to call another tool on the
    # follow-up turn even when tool_choice="none", which Groq rejects with
    # "Tool choice is none, but model called a tool". Dropping the
    # tool-call message chain and handing the data over as plain text
    # avoids that entirely.
    followup_messages = [
        {"role": "system", "content": ASSISTANT_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Question: {req.question}\n\n"
                f"Data retrieved:\n{json.dumps(tool_results, default=str)}\n\n"
                "Answer the question using ONLY this data. Do not call any tools."
            ),
        },
    ]

    second_response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=followup_messages,
    )
    return {"answer": second_response.choices[0].message.content}
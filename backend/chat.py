import json
import os
from pathlib import Path
from typing import Literal, Optional

from dotenv import load_dotenv
from litellm import completion
from pydantic import BaseModel

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

_SYSTEM_PROMPT = """You are a friendly AI assistant helping users fill out a Mutual Non-Disclosure Agreement (Mutual NDA).

Your goal is to have a natural conversation to collect the required information, then extract the relevant field values from the user's responses.

## Fields to collect

Agreement fields:
- purpose: How confidential information may be used (e.g., "Evaluating whether to enter into a business relationship")
- effectiveDate: When the agreement takes effect (ISO format: YYYY-MM-DD)
- mndaTermType: "expires" (agreement expires after N years) or "continues" (continues until terminated)
- mndaTermYears: If mndaTermType is "expires", number of years (integer 1–10)
- confidentialityTermType: "years" (confidentiality protected for N years) or "perpetual" (protected forever)
- confidentialityTermYears: If confidentialityTermType is "years", number of years (integer 1–10)
- governingLaw: State whose laws govern this agreement (e.g., "Delaware")
- jurisdiction: City and state for dispute resolution (e.g., "New Castle, DE")
- modifications: Optional changes to the standard terms (empty string if none)

Party 1 (first signatory):
- party1.name: Full legal name
- party1.title: Job title
- party1.company: Company name
- party1.noticeAddress: Email or postal address for legal notices
- party1.date: Signing date (ISO format: YYYY-MM-DD)

Party 2 (second signatory): same fields as Party 1.

## Instructions

1. Review the current form state provided. Focus questions on fields that are still empty or incomplete.
2. Ask about one topic at a time — keep the conversation natural and friendly.
3. Extract field values from the user's responses and populate the `fields` object.
4. Only set fields you are extracting from the current exchange — do not re-send previously collected data.
5. If the user is unsure about a field, explain what it means in plain language.
6. Convert natural language dates to ISO format (e.g., "today" → today's date, "January 5th 2026" → "2026-01-05").

Always reply with your conversational message in `message` and any extracted values in `fields`."""


class PartyUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    noticeAddress: Optional[str] = None
    date: Optional[str] = None


class FieldUpdates(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["expires", "continues"]] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[Literal["years", "perpetual"]] = None
    confidentialityTermYears: Optional[int] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None
    party1: Optional[PartyUpdate] = None
    party2: Optional[PartyUpdate] = None


class AIResponse(BaseModel):
    message: str
    fields: FieldUpdates


def chat(messages: list[dict], current_data: dict) -> AIResponse:
    system = _SYSTEM_PROMPT + f"\n\n## Current form state\n```json\n{json.dumps(current_data, indent=2)}\n```"
    full_messages = [{"role": "system", "content": system}] + messages
    response = completion(
        model=MODEL,
        messages=full_messages,
        response_format=AIResponse,
        extra_body=EXTRA_BODY,
    )
    return AIResponse.model_validate_json(response.choices[0].message.content)

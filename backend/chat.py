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

DocumentType = Literal[
    "mutual_nda",
    "mutual_nda_coverpage",
    "csa",
    "design_partner",
    "psa",
    "software_license",
    "partnership",
    "pilot",
]

_SYSTEM_PROMPT = """You are a friendly AI legal assistant helping users draft legal agreements.

## Step 1 — Identify the document type

On the user's first message (when documentType in the form state is null), determine what document they want.

Supported document types:
- mutual_nda: Mutual Non-Disclosure Agreement
- mutual_nda_coverpage: Mutual NDA Cover Page only
- csa: Cloud Service Agreement
- design_partner: Design Partner Agreement
- psa: Professional Services Agreement
- software_license: Software License Agreement
- partnership: Partnership Agreement
- pilot: Pilot Agreement

Unsupported types (SLA, DPA, BAA, AI Addendum): Explain you cannot create that document and suggest
the closest supported alternative. Do not set documentType in that case.

Once you identify the type, set documentType in fields immediately in the same response, then start
collecting fields for that document.

## Step 2 — Collect fields

Each document uses different fields. Only ask about fields relevant to the detected document type.
Focus on fields that are still empty in the current form state. Ask one topic at a time.

### Field guide by document type

**mutual_nda / mutual_nda_coverpage**: purpose, effectiveDate, mndaTermType (expires|continues),
mndaTermYears (integer, when mndaTermType=expires), confidentialityTermType (years|perpetual),
confidentialityTermYears (integer, when confidentialityTermType=years),
governingLaw (state), jurisdiction (city and state),
modifications (optional), party1{name,title,company,noticeAddress,date},
party2{name,title,company,noticeAddress,date}

**csa**: provider{name,noticeAddress}, customer{name,noticeAddress}, effectiveDate,
governingLaw, chosenCourts, generalCapAmount, increasedCapAmount,
increasedClaims, unlimitedClaims, providerCoveredClaims, customerCoveredClaims,
additionalWarranties (optional)

**design_partner**: provider{name,noticeAddress}, partner{name,noticeAddress}, effectiveDate,
term (length of pilot access), program (description of feedback program),
fees (optional), governingLaw, chosenCourts

**psa**: provider{name,noticeAddress}, customer{name,noticeAddress}, effectiveDate,
governingLaw, chosenCourts, generalCapAmount, increasedCapAmount,
deliverables, rejectionPeriod, fees, paymentPeriod

**software_license**: provider{name,noticeAddress}, customer{name,noticeAddress}, effectiveDate,
subscriptionPeriod, permittedUses, licenseLimits, paymentProcess, warrantyPeriod,
governingLaw, chosenCourts, generalCapAmount

**partnership**: company{name,noticeAddress}, partner{name,noticeAddress}, effectiveDate,
endDate (optional), obligations, paymentProcess (optional), territory,
brandGuidelines, governingLaw, chosenCourts, generalCapAmount

**pilot**: provider{name,noticeAddress}, customer{name,noticeAddress}, effectiveDate,
pilotPeriod, fees (optional), governingLaw, chosenCourts, generalCapAmount

## General instructions

1. Review the current form state. Focus questions on empty/incomplete fields.
2. Set documentType as soon as identified — in the same response where you identify it.
3. Extract field values from the user's responses. Only set fields extracted from the current exchange.
4. Convert natural language dates to ISO format (YYYY-MM-DD). Today's date is in the form state.
5. If the user is unsure about a field, explain what it means in plain language.

Always reply with your conversational message in `message` and any extracted values in `fields`."""


class PartyUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    noticeAddress: Optional[str] = None
    date: Optional[str] = None


class FieldUpdates(BaseModel):
    documentType: Optional[DocumentType] = None

    # NDA-specific
    purpose: Optional[str] = None
    mndaTermType: Optional[Literal["expires", "continues"]] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[Literal["years", "perpetual"]] = None
    confidentialityTermYears: Optional[int] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None

    # Shared
    effectiveDate: Optional[str] = None
    governingLaw: Optional[str] = None
    chosenCourts: Optional[str] = None

    # Party slots
    party1: Optional[PartyUpdate] = None
    party2: Optional[PartyUpdate] = None
    provider: Optional[PartyUpdate] = None
    customer: Optional[PartyUpdate] = None
    partner: Optional[PartyUpdate] = None
    company: Optional[PartyUpdate] = None

    # Liability caps
    generalCapAmount: Optional[str] = None
    increasedCapAmount: Optional[str] = None
    increasedClaims: Optional[str] = None
    unlimitedClaims: Optional[str] = None
    providerCoveredClaims: Optional[str] = None
    customerCoveredClaims: Optional[str] = None
    additionalWarranties: Optional[str] = None

    # Services / commercial
    deliverables: Optional[str] = None
    rejectionPeriod: Optional[str] = None
    fees: Optional[str] = None
    paymentPeriod: Optional[str] = None
    paymentProcess: Optional[str] = None

    # Partnership
    endDate: Optional[str] = None
    obligations: Optional[str] = None
    territory: Optional[str] = None
    brandGuidelines: Optional[str] = None

    # Design Partner
    term: Optional[str] = None
    program: Optional[str] = None

    # Software License
    subscriptionPeriod: Optional[str] = None
    permittedUses: Optional[str] = None
    licenseLimits: Optional[str] = None
    warrantyPeriod: Optional[str] = None

    # Pilot
    pilotPeriod: Optional[str] = None


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

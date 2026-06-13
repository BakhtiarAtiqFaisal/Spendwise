from contextlib import asynccontextmanager
import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from database import get_connection, initialize_database


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def get_supabase_settings() -> tuple[str, str]:
    """Read Supabase settings used for learning-backend Auth proxy calls."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_anon_key:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_URL and SUPABASE_ANON_KEY must be configured in the backend .env file.",
        )

    return supabase_url.rstrip("/"), supabase_anon_key


class SignupRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str = ""
    location: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


async def call_supabase_auth(endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Call Supabase Auth with the anon key from backend environment variables."""
    supabase_url, supabase_anon_key = get_supabase_settings()

    headers = {
        "apikey": supabase_anon_key,
        "Authorization": f"Bearer {supabase_anon_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(f"{supabase_url}{endpoint}", json=payload, headers=headers)

    if response.status_code >= 400:
        try:
            error_body = response.json()
        except ValueError:
            error_body = {"message": response.text or "Supabase Auth request failed."}

        raise HTTPException(status_code=response.status_code, detail=error_body)

    return response.json()


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="SpendWise Backend",
    description="FastAPI backend for the SpendWise student budget tracking app.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "SpendWise Backend is running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            cursor.fetchone()

    return {"status": "healthy", "database": "connected"}


@app.post("/auth/signup")
async def signup(request: SignupRequest):
    """Create a Supabase Auth user through the backend.

    This is intentionally minimal for a learning backend. In production, add rate
    limiting, stronger validation, and a proper auth/session strategy.
    """
    return await call_supabase_auth(
        "/auth/v1/signup",
        {
            "email": request.email,
            "password": request.password,
            "data": {
                "full_name": request.name,
                "name": request.name,
                "phone_number": request.phone,
                "location": request.location,
            },
        },
    )


@app.post("/auth/login")
async def login(request: LoginRequest):
    """Login through Supabase Auth and return Supabase's session response.

    In production, tokens should be verified properly before trusting them, and
    secure httpOnly cookies are usually safer than localStorage.
    """
    return await call_supabase_auth(
        "/auth/v1/token?grant_type=password",
        {"email": request.email, "password": request.password},
    )
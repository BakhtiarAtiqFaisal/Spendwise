import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
SCHEMA_FILE = BASE_DIR / "schema.sql"


def get_database_url() -> str:
    """Load DATABASE_URL from .env without exposing credentials."""
    load_dotenv(BASE_DIR / ".env")
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is missing. Add it to your .env file.")

    return database_url


def get_connection():
    """Create a new PostgreSQL connection."""
    return psycopg2.connect(get_database_url())


def initialize_database() -> None:
    """Create all required SpendWise tables, functions, triggers, and policies."""
    if not SCHEMA_FILE.exists():
        raise FileNotFoundError(f"Schema file not found: {SCHEMA_FILE}")

    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(schema_sql)


if __name__ == "__main__":
    initialize_database()
    print("Database initialization completed successfully")
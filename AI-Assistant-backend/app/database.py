"""
database.py
-----------
Database engine and session configuration using SQLAlchemy.

This module sets up:
  - The SQLAlchemy engine (connection to PostgreSQL)
  - A session factory (SessionLocal) for creating DB sessions
  - A Base class that all ORM models inherit from
  - A get_db() dependency used in FastAPI route handlers via Depends()
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Generator

from app.config import DATABASE_URL

# ─── Engine ──────────────────────────────────────────────────────────────────
# pool_pre_ping=True: tests connections before using them (avoids stale connections)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# ─── Session Factory ─────────────────────────────────────────────────────────
# autocommit=False: we manually commit transactions
# autoflush=False:  we control when changes are flushed to the DB
SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine,
)

# ─── Base Model ──────────────────────────────────────────────────────────────
# All ORM models (User, ChatSession, Message) inherit from this Base
Base = declarative_base()


# ─── Dependency ──────────────────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request.

    Usage in a route:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...

    The session is automatically closed after the request finishes,
    even if an exception is raised.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

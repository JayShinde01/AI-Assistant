"""
routes/upload_routes.py
-----------------------
File and image upload endpoint.

The frontend uploads a file here BEFORE sending a message.
The server saves the file and returns a URL.
The frontend then includes that URL in the message payload.

Endpoint:
  POST /api/upload  → Upload a file/image, returns the file URL
"""

import os
import uuid
import logging
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles

from app.models.user import User
from app.utils.get_current_user import get_current_user
from app.config import MAX_UPLOAD_SIZE_BYTES, ALLOWED_FILE_TYPES

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Uploads"])

# Directory where uploaded files are stored on the server
# In production, replace this with S3 or another object storage service
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a file or image to the server.

    Validates:
      - File size must be under MAX_UPLOAD_SIZE_BYTES (default 5 MB)
      - MIME type must be in ALLOWED_FILE_TYPES

    Returns:
        { "url": "/uploads/<filename>", "mime_type": "image/png" }

    The returned URL can be included in a message payload so the AI
    can see the uploaded image/file.
    """

    # ── Validate MIME type ────────────────────────────────────────────────────
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' is not allowed. "
                   f"Allowed types: {', '.join(ALLOWED_FILE_TYPES)}",
        )

    # ── Read file content ─────────────────────────────────────────────────────
    content = await file.read()

    # ── Validate file size ────────────────────────────────────────────────────
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        max_mb = MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {max_mb:.0f} MB.",
        )

    # ── Generate a unique filename to avoid collisions ────────────────────────
    # Format: <uuid>_<original_filename>
    ext = os.path.splitext(file.filename or "file")[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # ── Save file to disk ─────────────────────────────────────────────────────
    with open(file_path, "wb") as f:
        f.write(content)

    logger.info(
        f"File uploaded by {current_user.email}: {unique_filename} "
        f"({len(content)} bytes, {file.content_type})"
    )

    return {
        "url": f"/uploads/{unique_filename}",
        "mime_type": file.content_type,
        "original_name": file.filename,
        "size_bytes": len(content),
    }

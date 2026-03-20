import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from models import User
from auth import require_admin
from supabase import create_client, Client

from rate_limit import limiter, RATE_LIMITS

router = APIRouter(prefix="/api/upload", tags=["Uploads"])

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "samruddhi")

if not SUPABASE_URL or not SUPABASE_KEY:
    # We'll allow it to start but upload will fail if not configured
    print("Warning: SUPABASE_URL or SUPABASE_KEY not set. Uploads will fail.")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("")
@limiter.limit(RATE_LIMITS["upload"])
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase storage is not configured.")

    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF.",
        )

    # Read file content
    content = await file.read()

    # Validate size
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB.")

    # Generate unique filename preserving extension
    ext = os.path.splitext(file.filename or "image.jpg")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"

    try:
        # Upload to Supabase Bucket
        # We use content-type from the file
        res = supabase.storage.from_(BUCKET_NAME).upload(
            path=filename,
            file=content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        # Supabase public URL format: {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
        
        return {"url": public_url}
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

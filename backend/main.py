#main.py
from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from pydantic import BaseModel, EmailStr, Field, validator
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import date
import re, os, shutil, hashlib, secrets
from PIL import Image as PILImage
import io

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Serve uploaded images
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://scotlandyardfilms-2wdf.vercel.app",
    "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        clean = {k: (str(v) if k == "ctx" else v) for k, v in err.items()}
        if "ctx" in clean and isinstance(clean["ctx"], dict):
            clean["ctx"] = {k: str(v) for k, v in clean["ctx"].items()}
        errors.append(clean)
    print(f"Validation error: {errors}")
    return JSONResponse(status_code=422, content={"detail": errors})

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Simple token store: { token: admin_id }
active_tokens: dict = {}

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_admin_from_token(token: str, db: Session):
    admin_id = active_tokens.get(token)
    if not admin_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return admin

def require_auth(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    return get_admin_from_token(token, db)

# ─── Contact ────────────────────────────────────────────────────────────────

class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    eventDate: Optional[date] = None
    eventType: str = Field(..., min_length=2, max_length=100)
    venueLocation: str = Field(..., min_length=2, max_length=255)
    message: str = Field(..., min_length=5, max_length=1000)

    @validator('phone')
    def validate_phone(cls, v):
        cleaned = re.sub(r'[\s\-\(\)\+]', '', v)
        if not re.match(r'^[6-9]\d{9}$', cleaned):
            raise ValueError('Phone number must be a valid 10-digit Indian number')
        return cleaned

    @validator('eventDate')
    def validate_future_date(cls, v):
        if v is not None and v < date.today():
            raise ValueError('Event date cannot be in the past')
        return v

@app.post("/contact")
def submit_contact(contact: ContactRequest, db: Session = Depends(get_db)):
    try:
        new_contact = models.Contact(
            name=contact.name, email=contact.email, phone=contact.phone,
            eventDate=contact.eventDate, eventType=contact.eventType,
            venueLocation=contact.venueLocation, message=contact.message
        )
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        return {"message": "Your inquiry has been saved successfully!", "id": new_contact.id, "status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contacts")
def get_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Contact).offset(skip).limit(limit).all()

# ─── Admin Auth ──────────────────────────────────────────────────────────────

class AdminLogin(BaseModel):
    username: str
    password: str

@app.post("/admin/login")
def admin_login(body: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == body.username).first()
    if not admin or admin.password_hash != hash_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = secrets.token_hex(32)
    active_tokens[token] = admin.id
    return {"token": token, "username": admin.username}

@app.post("/admin/logout")
def admin_logout(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    active_tokens.pop(token, None)
    return {"message": "Logged out"}

@app.get("/admin/me")
def admin_me(admin=Depends(require_auth)):
    return {"id": admin.id, "username": admin.username}

# ─── Projects (public) ───────────────────────────────────────────────────────

def project_to_dict(p: models.Project):
    return {
        "id": p.id,
        "title": p.title,
        "location": p.location,
        "date": p.date,
        "description": p.description,
        "coverImage": p.cover_image,
        "category": p.category,
        "testimonial": p.testimonial,
        "published": p.published,
        "images": [
            {
                "id": img.id,
                "src": img.src,
                "alt": img.alt,
                "description": img.description,
                "event_group": img.event_group,
                "sort_order": img.sort_order,
            }
            for img in p.images
        ]
    }

@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).filter(models.Project.published == True).all()
    return [project_to_dict(p) for p in projects]

@app.get("/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p or not p.published:
        raise HTTPException(status_code=404, detail="Project not found")
    return project_to_dict(p)

# ─── Projects (admin CRUD) ───────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    title: str
    location: str
    date: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    category: str
    testimonial: Optional[str] = None
    published: bool = False

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    testimonial: Optional[str] = None
    published: Optional[bool] = None

@app.get("/admin/projects")
def admin_get_projects(db: Session = Depends(get_db), admin=Depends(require_auth)):
    projects = db.query(models.Project).all()
    return [project_to_dict(p) for p in projects]

@app.post("/admin/projects")
def admin_create_project(body: ProjectCreate, db: Session = Depends(get_db), admin=Depends(require_auth)):
    p = models.Project(**body.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return project_to_dict(p)

@app.put("/admin/projects/{project_id}")
def admin_update_project(project_id: int, body: ProjectUpdate, db: Session = Depends(get_db), admin=Depends(require_auth)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in body.dict(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return project_to_dict(p)

@app.delete("/admin/projects/{project_id}")
def admin_delete_project(project_id: int, db: Session = Depends(get_db), admin=Depends(require_auth)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()
    return {"message": "Project deleted"}

# ─── Image Upload ────────────────────────────────────────────────────────────

@app.post("/admin/projects/{project_id}/images")
async def upload_images(
    project_id: int,
    files: List[UploadFile] = File(...),
    event_group: str = Form("general"),
    db: Session = Depends(get_db),
    admin=Depends(require_auth)
):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    slug = re.sub(r'[^a-z0-9]+', '-', p.title.lower()).strip('-')
    folder = os.path.join(IMAGES_DIR, slug, event_group)
    os.makedirs(folder, exist_ok=True)

    saved = []
    current_max = db.query(models.ProjectImage).filter(
        models.ProjectImage.project_id == project_id
    ).count()

    for i, file in enumerate(files):
        original_name = os.path.splitext(file.filename)[0]
        filename = original_name + ".jpg"  # always save as jpg after compression
        dest = os.path.join(folder, filename)

        # Read and compress with Pillow
        contents = await file.read()
        try:
            img = PILImage.open(io.BytesIO(contents))
            # Convert to RGB (handles PNG with alpha, CMYK, etc.)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            # Resize if larger than 1920px on longest side
            max_size = 1920
            if max(img.width, img.height) > max_size:
                img.thumbnail((max_size, max_size), PILImage.LANCZOS)
            # Save compressed
            img.save(dest, "JPEG", quality=82, optimize=True)
        except Exception:
            # Fallback: save as-is if Pillow fails
            with open(dest, "wb") as f:
                f.write(contents)

        src_path = f"/images/{slug}/{event_group}/{filename}"
        img_record = models.ProjectImage(
            project_id=project_id,
            src=src_path,
            alt=p.title,
            description="",
            event_group=event_group,
            sort_order=current_max + i
        )
        db.add(img_record)
        saved.append(src_path)

    db.commit()
    return {"uploaded": saved}

@app.delete("/admin/images/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db), admin=Depends(require_auth)):
    img = db.query(models.ProjectImage).filter(models.ProjectImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    # Delete file from disk
    file_path = os.path.join(os.path.dirname(__file__), "..", "public", img.src.lstrip("/"))
    if os.path.exists(file_path):
        os.remove(file_path)
    db.delete(img)
    db.commit()
    return {"message": "Image deleted"}

@app.put("/admin/images/{image_id}")
def update_image(image_id: int, alt: str = None, description: str = None, db: Session = Depends(get_db), admin=Depends(require_auth)):
    img = db.query(models.ProjectImage).filter(models.ProjectImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    if alt is not None:
        img.alt = alt
    if description is not None:
        img.description = description
    db.commit()
    return {"message": "Updated"}

# ─── Setup: create default admin ─────────────────────────────────────────────

@app.post("/setup")
def setup(db: Session = Depends(get_db)):
    existing = db.query(models.Admin).first()
    if existing:
        return {"message": "Admin already exists"}
    admin = models.Admin(username="admin", password_hash=hash_password("admin123"))
    db.add(admin)
    db.commit()
    return {"message": "Admin created", "username": "admin", "password": "admin123"}

@app.get("/")
def root():
    return {"status": "Backend running successfully"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

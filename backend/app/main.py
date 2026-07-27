from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import complaints, ai

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AIVOA Complaint Management API",
    description="AI-powered customer complaint intake for pharma QMS",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)
app.include_router(ai.router)


@app.get("/")
def health():
    return {"status": "ok", "service": "complaint-ai-backend"}

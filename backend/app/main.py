from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import (
    auth_router,
    inventory_router,
    forecast_router,
    risks_router,
    procurement_router,
    suppliers_router,
    expiry_router,
    simulation_router,
    alerts_router,
    analytics_router,
    demo_router
)

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Hospital Supply Chain Decision-Support Platform",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(forecast_router)
app.include_router(risks_router)
app.include_router(procurement_router)
app.include_router(suppliers_router)
app.include_router(expiry_router)
app.include_router(simulation_router)
app.include_router(alerts_router)
app.include_router(analytics_router)
app.include_router(demo_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "engine": "FastAPI + Scikit-Learn Local ML Engine",
        "compliance": "Clinical Decision Support System (Non-Diagnostic)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

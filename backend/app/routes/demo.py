from fastapi import APIRouter
from app.seed_data import seed_database

router = APIRouter(prefix="/api/demo", tags=["Demo Management"])

@router.post("/reset")
def reset_demo_database():
    try:
        seed_database()
        return {"status": "success", "message": "Demo database successfully reset to factory presentation state."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

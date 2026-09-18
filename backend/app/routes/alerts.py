from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Alert, Medicine
from app.schemas import AlertOut, AlertUpdate

router = APIRouter(prefix="/api/alerts", tags=["Alert Center"])

@router.get("", response_model=List[AlertOut])
def get_all_alerts(
    severity: Optional[str] = None,
    is_read: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity and severity != "All":
        query = query.filter(Alert.severity == severity.upper())
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)
    
    alerts = query.order_by(Alert.created_at.desc()).all()

    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "medicine_id": a.medicine_id,
            "medicine_name": a.medicine.name if a.medicine else None,
            "action_type": a.action_type,
            "is_read": a.is_read,
            "is_resolved": a.is_resolved,
            "created_at": a.created_at
        })
    return result

@router.put("/{id}/read")
def mark_alert_read(id: int, db: Session = Depends(get_db)):
    alt = db.query(Alert).filter(Alert.id == id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alert not found")
    alt.is_read = True
    db.commit()
    return {"status": "success", "message": "Alert marked as read"}

@router.put("/mark-all-read")
def mark_all_alerts_read(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All alerts marked as read"}

@router.put("/{id}/resolve")
def resolve_alert(id: int, db: Session = Depends(get_db)):
    alt = db.query(Alert).filter(Alert.id == id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alert not found")
    alt.is_resolved = True
    alt.is_read = True
    db.commit()
    return {"status": "success", "message": "Alert marked as resolved"}

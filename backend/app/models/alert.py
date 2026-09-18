from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(50), nullable=False)  # CRITICAL, WARNING, EXPIRY, INFO
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=True)
    action_type = Column(String(100), nullable=True) # e.g. "PROCURE", "TRANSFER", "MONITOR"
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    medicine = relationship("Medicine", back_populates="alerts")

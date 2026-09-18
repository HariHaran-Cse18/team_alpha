from sqlalchemy import Column, Integer, ForeignKey, Date, Float, Boolean, String
from sqlalchemy.orm import relationship
from datetime import date
from app.database import Base

class ConsumptionHistory(Base):
    __tablename__ = "consumption_history"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    quantity_used = Column(Integer, nullable=False, default=0)
    department = Column(String(100), default="Emergency / ICU")
    is_abnormal = Column(Boolean, default=False)
    z_score = Column(Float, default=0.0)

    # Relationship
    medicine = relationship("Medicine", back_populates="consumption_records")

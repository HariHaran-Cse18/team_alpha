from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class InventoryBatch(Base):
    __tablename__ = "inventory_batches"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    batch_number = Column(String(100), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    received_date = Column(Date, default=date.today)
    expiry_date = Column(Date, nullable=False, index=True)
    unit_purchase_cost = Column(Float, nullable=False, default=10.0)
    location = Column(String(100), default="Main Pharmacy A-1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    medicine = relationship("Medicine", back_populates="batches")

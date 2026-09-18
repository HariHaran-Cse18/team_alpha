from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    contact_person = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    average_lead_time = Column(Integer, nullable=False, default=5)  # in days
    reliability_score = Column(Float, nullable=False, default=95.0)  # percentage, e.g. 95.0%
    rating = Column(Float, default=4.5)                             # 1.0 to 5.0
    quality_compliance = Column(Float, default=98.0)                # %
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    medicines = relationship("Medicine", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

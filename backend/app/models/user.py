from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(String(50), default="Inventory Director") # Admin, Director, Pharmacist, Supply Officer
    is_active = Column(Boolean, default=True)
    hospital_name = Column(String(150), default="Apollo Central Medical Center")
    created_at = Column(DateTime, default=datetime.utcnow)

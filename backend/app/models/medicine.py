from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    generic_name = Column(String(150), nullable=True)
    category = Column(String(100), nullable=False, index=True)  # e.g., Critical Care, Antibiotics, Chronic Care, Emergency, Fluids, Analgesics
    dosage_form = Column(String(50), nullable=False)            # e.g., Injection, Tablet, Syrup, Inhaler, IV Fluid
    unit = Column(String(50), nullable=False)                   # e.g., Vials, Tablets, Bottles, Units, Ampoules
    unit_cost = Column(Float, nullable=False, default=10.0)     # in INR ₹
    criticality = Column(String(50), nullable=False, default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    minimum_stock = Column(Integer, nullable=False, default=100)
    safety_stock = Column(Integer, nullable=False, default=80)
    emergency_reserve = Column(Integer, nullable=False, default=50)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    description = Column(Text, nullable=True)
    storage_conditions = Column(String(100), default="Store below 25°C")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    supplier = relationship("Supplier", back_populates="medicines")
    batches = relationship("InventoryBatch", back_populates="medicine", cascade="all, delete-orphan")
    consumption_records = relationship("ConsumptionHistory", back_populates="medicine", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="medicine", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="medicine", cascade="all, delete-orphan")

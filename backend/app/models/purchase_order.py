from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, IN_TRANSIT, DELIVERED, CANCELLED
    priority = Column(String(50), default="NORMAL") # URGENT, HIGH, NORMAL, LOW
    order_date = Column(Date, default=date.today)
    expected_delivery_date = Column(Date, nullable=False)
    actual_delivery_date = Column(Date, nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    medicine = relationship("Medicine", back_populates="purchase_orders")
    supplier = relationship("Supplier", back_populates="purchase_orders")

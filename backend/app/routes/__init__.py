from app.routes.auth import router as auth_router
from app.routes.inventory import router as inventory_router
from app.routes.forecast import router as forecast_router
from app.routes.risks import router as risks_router
from app.routes.procurement import router as procurement_router
from app.routes.suppliers import router as suppliers_router
from app.routes.expiry import router as expiry_router
from app.routes.simulation import router as simulation_router
from app.routes.alerts import router as alerts_router
from app.routes.analytics import router as analytics_router
from app.routes.demo import router as demo_router

__all__ = [
    "auth_router",
    "inventory_router",
    "forecast_router",
    "risks_router",
    "procurement_router",
    "suppliers_router",
    "expiry_router",
    "simulation_router",
    "alerts_router",
    "analytics_router",
    "demo_router"
]

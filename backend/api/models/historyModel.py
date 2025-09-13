from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import func
from .base import Base

class Historico(Base):
    __tablename__ = 'historico'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    amount: Mapped[float] = mapped_column(nullable=False)
    time: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

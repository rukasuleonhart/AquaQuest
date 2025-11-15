from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func, ForeignKey
from .base import Base


class Historico(Base):
    __tablename__ = 'historico'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    amount: Mapped[float] = mapped_column(nullable=False)
    time: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    # relacionamento SEM import direto
    profile: Mapped["Profile"] = relationship("Profile", back_populates="historico")

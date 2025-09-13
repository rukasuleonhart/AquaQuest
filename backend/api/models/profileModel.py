from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Float
from .base import Base # seu arquivo de conexão com o DB

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    activity_time: Mapped[int] = mapped_column(Integer, default=0)  # em horas
    weight_kg: Mapped[float] = mapped_column(Float, default=0.0)
    ambient_temp_c: Mapped[float] = mapped_column(Float, default=25.0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    current_xp: Mapped[int] = mapped_column(Integer, default=0)
    xp_to_next: Mapped[int] = mapped_column(Integer, default=100)
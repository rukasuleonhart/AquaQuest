from pydantic import BaseModel
from typing import Optional

class ProfileSchema(BaseModel):
    id: int
    name: str
    activity_time: int
    weight_kg: float
    ambient_temp_c: float
    level: int
    current_xp: int
    xp_to_next: int

    model_config = {"from_attributes": True}


class ProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    activity_time: Optional[int] = None
    weight_kg: Optional[float] = None
    ambient_temp_c: Optional[float] = None
    level: Optional[int] = None
    current_xp: Optional[int] = None
    xp_to_next: Optional[int] = None

    model_config = {"from_attributes": True}

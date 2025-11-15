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
    name: Optional[str]
    activity_time: Optional[float]
    weight_kg: Optional[float]
    ambient_temp_c: Optional[float]
    level: Optional[int]
    current_xp: Optional[int]
    xp_to_next: Optional[int]

    model_config = {"from_attributes": True}

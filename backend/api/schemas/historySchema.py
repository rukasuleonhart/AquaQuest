from pydantic import BaseModel
from datetime import datetime

class HistorySchema(BaseModel):
    id: int
    amount: float
    time: datetime

    model_config = {"from_attributes": True}

class CreateHistorySchema(BaseModel):
    amount: float
    model_config = {"from_attributes": True}

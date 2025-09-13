from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session
from typing import List

from ..schemas.historySchema import HistorySchema, CreateHistorySchema
from ..database import get_db
from ..models.historyModel import Historico

router = APIRouter(prefix='/historico', tags=['🕑 Histórico'])

# GET: Mostrar todos os registros
@router.get("/", response_model=List[HistorySchema], status_code=status.HTTP_200_OK)
async def Mostrar_Historico(db: Session = Depends(get_db)):
    water_registers = db.query(Historico).all()
    return [HistorySchema.model_validate(w) for w in water_registers]

# POST: Registrar novo histórico
@router.post("/", response_model=HistorySchema, status_code=status.HTTP_201_CREATED)
async def Registrar_no_Historico(water: CreateHistorySchema, db: Session = Depends(get_db)):
    newHistorico = Historico(**water.model_dump())

    db.add(newHistorico)
    db.commit()
    db.refresh(newHistorico)

    return HistorySchema.model_validate(newHistorico)

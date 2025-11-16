from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..schemas.historySchema import HistorySchema, CreateHistorySchema
from ..database import get_db
from ..models.historyModel import Historico
from ..security import get_current_user        # ← Importa a dependência
from ..models.userModel import User            # ← Modelo de usuário

router = APIRouter(prefix='/historico', tags=['🕑 Histórico'])

# GET - Mostrar todos os registros do usuário autenticado
@router.get("/", response_model=List[HistorySchema], status_code=status.HTTP_200_OK)
async def Mostrar_Historico(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.profiles or len(current_user.profiles) == 0:
        raise HTTPException(status_code=404, detail="Usuário não possui perfil cadastrado")
    profile_id = current_user.profiles[0].id
    water_registers = db.query(Historico).filter(Historico.profile_id == profile_id).all()
    return [HistorySchema.model_validate(w) for w in water_registers]

# POST - Registrar novo histórico
@router.post("/", response_model=HistorySchema, status_code=status.HTTP_201_CREATED)
async def Registrar_no_Historico(
    water: CreateHistorySchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.profiles or len(current_user.profiles) == 0:
        raise HTTPException(status_code=400, detail="Usuário não possui perfil cadastrado")
    profile_id = current_user.profiles[0].id  # Altere a lógica se necessário para pegar o perfil correto
    newHistorico = Historico(**water.model_dump(), profile_id=profile_id)
    db.add(newHistorico)
    db.commit()
    db.refresh(newHistorico)
    return HistorySchema.model_validate(newHistorico)

# DELETE - Excluir histórico
@router.delete("/{id}", response_model=HistorySchema, status_code=status.HTTP_200_OK)
async def Excluir_no_Historico(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.profiles or len(current_user.profiles) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não possui perfil cadastrado")
    profile_id = current_user.profiles[0].id
    registro = db.query(Historico).filter(Historico.id == id, Historico.profile_id == profile_id).first()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Registro com id {id} não encontrado")
    db.delete(registro)
    db.commit()
    return HistorySchema.model_validate(registro)

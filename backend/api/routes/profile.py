from fastapi import APIRouter, HTTPException, status, Depends, Path
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.profileModel import Profile
from ..models.userModel import User  # Adicione seu model de usuário
from ..schemas.profileSchema import ProfileSchema, ProfileUpdateSchema
from api.security import get_current_user, hash_password # Dependência que retorna usuário autenticado

router = APIRouter(
    prefix="/perfil",
    tags=["👤 Perfil"]
)

# GET - Retorna o perfil do usuário autenticado
@router.get("/", response_model=ProfileSchema)
def get_perfil(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return profile

# POST - Cria um perfil se não existir para o usuário autenticado
@router.post("/", response_model=ProfileSchema)
def create_perfil(
    profile_create: ProfileSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Perfil já existe")
    new_profile = Profile(**profile_create.model_dump(), user_id=current_user.id)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

# PATCH - Atualiza campos do perfil do usuário autenticado
@router.patch("/", response_model=ProfileSchema)
def update_perfil(
    profile_update: ProfileUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")

    # 1) aplica add_xp, se vier
    if profile_update.add_xp is not None and profile_update.add_xp > 0:
        profile.current_xp += profile_update.add_xp

        # regra de level up
        while profile.current_xp >= profile.xp_to_next:
            profile.current_xp -= profile.xp_to_next
            profile.level += 1
            profile.xp_to_next += 100

    # 2) atualiza demais campos enviados (sem add_xp)
    update_data = profile_update.model_dump(exclude_unset=True)
    update_data.pop("add_xp", None)  # garante que não tente setar add_xp como coluna

    for key, value in update_data.items():
        setattr(profile, key, value)

    try:
        db.commit()
        db.refresh(profile)
        return profile
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao atualizar perfil")
 

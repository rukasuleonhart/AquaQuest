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

    # Atualiza campos do perfil, usando exclude_unset para pegar só os enviados
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    # Caso queira atualizar dados do próprio usuário (email, username, senha)
    # Exemplo: se o ProfileUpdateSchema tiver esses campos
    if hasattr(profile_update, "email") and profile_update.email is not None:
        current_user.email = profile_update.email
    if hasattr(profile_update, "username") and profile_update.username is not None:
        current_user.username = profile_update.username
    if hasattr(profile_update, "password") and profile_update.password is not None:
        current_user.password = hash_password(profile_update.password)

    try:
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao atualizar perfil")
 

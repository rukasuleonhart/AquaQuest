from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.profileModel import Profile
from ..schemas.profileSchema import ProfileSchema, ProfileUpdateSchema

router = APIRouter(
    prefix="/perfil",
    tags=["👤 Perfil"]
)

# GET - Retorna o primeiro perfil existente
@router.get("/", response_model=ProfileSchema)
def get_perfil(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return profile

# POST - Cria um novo perfil, apenas se ainda não existir
@router.post("/", response_model=ProfileSchema)
def create_perfil(profile_create: ProfileSchema, db: Session = Depends(get_db)):
    existing_profile = db.query(Profile).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Perfil já existe")

    new_profile = Profile(**profile_create.model_dump())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

# Patch - Atualiza campos específicos do perfil pelo ID
@router.put("/{profile_id}", response_model=ProfileSchema)
def update_perfil(
    profile_update: ProfileUpdateSchema,
    profile_id: int,
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")

    # Atualiza apenas os campos enviados
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile



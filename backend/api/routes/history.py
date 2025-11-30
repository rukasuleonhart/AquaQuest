from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..schemas.userSchema import UserCreate, UserRead, UserUpdate
from ..models.userModel import User
from ..models.profileModel import Profile
from api.database import get_db
from api.security import hash_password

router = APIRouter(prefix="/users", tags=["👤 Usuários"])


# POST - Criar novo usuário (somente se não existir)
@router.post("/", response_model=UserRead)
def criar_usuario(user_create: UserCreate, db: Session = Depends(get_db)):
    # Checa se já existe o usuário
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Esse Usuário já existe!")

    # Cria o usuário
    hashed_password = hash_password(user_create.password)
    new_user = User(
        name=user_create.name,
        email=user_create.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Cria o perfil
    new_profile = Profile(
        user_id=new_user.id,
        name=new_user.name
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    # O primeiro registro será criado no POST /historico

    return new_user


# PATCH - Atualizar Usuário
@router.patch("/{user_id}", response_model=UserUpdate)
def atualizar_usuario(
    user_update: UserUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado!")

    update_data = user_update.model_dump(exclude_unset=True)

    # Se vier "password", já transforma em hash
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data["password"])
        update_data.pop("password")

    # Atualizar os campos dinamicamente
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

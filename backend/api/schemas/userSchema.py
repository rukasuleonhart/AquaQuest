# schemas/user.py

from typing import List, Optional
from pydantic import BaseModel

# Apenas campos básicos de perfil para exibir junto ao usuário
class ProfileBase(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}

# Schema de leitura (retorno) do usuário com perfis associados
class UserRead(BaseModel):
    id: int
    name: str
    email: str
    profiles: List[ProfileBase] = []

    model_config = {"from_attributes": True}

# Schema de criação de usuário
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

# Schema para atualização (opcional)
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

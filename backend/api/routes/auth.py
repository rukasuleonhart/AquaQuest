from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from api.database import get_db
from api.models.userModel import User
from api.security import verify_password, create_access_token


router = APIRouter(prefix="/auth", tags=["🗝️ Autenticação"])

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos!")
    acess_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": acess_token, "token_type": "bearer"}

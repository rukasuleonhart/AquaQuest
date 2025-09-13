from fastapi import FastAPI
from .routes.history import router as historyRouter

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Olá Mundo!"}

app.include_router(historyRouter)


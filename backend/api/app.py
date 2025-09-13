from fastapi import FastAPI  # Importa a classe FastAPI, que é usada para criar a aplicação web
from .routes.history import router as historyRouter  # Importa o "router" das rotas de histórico e dá o nome de historyRouter

# Cria uma instância da aplicação FastAPI
app = FastAPI()

# Define uma rota básica usando o decorator @app.get("/")
# Quando alguém acessar a URL raiz ("/"), essa função será executada
@app.get("/")
def read_root():
    return {"message": "Olá Mundo!"}  # Retorna uma resposta em formato JSON

# Adiciona as rotas de histórico à aplicação principal
# Isso permite organizar rotas em arquivos separados e manter o código mais limpo
app.include_router(historyRouter)
from fastapi import FastAPI  # Importa a classe FastAPI, que é usada para criar a aplicação web
from .routes.history import router as historyRouter  # Importa o "router" das rotas de histórico e dá o nome de historyRouter
from .routes.profile import router as profileRouter
from fastapi.middleware.cors import CORSMiddleware

# Cria uma instância da aplicação FastAPI
app = FastAPI()

# Define uma rota básica usando o decorator @app.get("/")
# Quando alguém acessar a URL raiz ("/"), essa função será executada
@app.get("/")
def read_root():
    return {"message": "✅Conectado a API!"}  # Retorna uma resposta em formato JSON


# Adiciona as rotas de histórico à aplicação principal
# Isso permite organizar rotas em arquivos separados e manter o código mais limpo
app.include_router(historyRouter)
app.include_router(profileRouter)
# adicionando o middleware à nossa aplicação FastAPI
# Isso permite controlar quem pode acessar a nossa API a partir de outros domínios
app.add_middleware(
    CORSMiddleware,  # O middleware que vamos usar é o CORSMiddleware
    allow_origins=["*"],  # "*" significa que qualquer site pode acessar a API
    allow_credentials=True,  # Permite que cookies e credenciais sejam enviados nas requisições
    allow_methods=["*"],  # "*" permite todos os métodos HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # "*" permite todos os cabeçalhos nas requisições
)
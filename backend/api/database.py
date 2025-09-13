# importando classe de configuracoes
from .settings import settings

# importando biblioteca do SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

# 🚪 Criando engine para database
engine = create_engine(settings.database_url)

# 📦 Criando uma sessao para o banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# funcao para ser injetada nos endpoints
def get_db():
    db = SessionLocal()     # • Conectando ao bando de dados
    print("✅ - Sessão aberta!")
    try:
        yield db            # • Realizando operacoes e as concluindo no bando de dados)
        print("☑️ - Operacão concluída!")
    finally:
        db.close()          # • finalizando conexao com o bando de dados
        print("❌ - Sessão encerrada!")
 
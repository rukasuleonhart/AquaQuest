# importando classe de configuracoes
from settings import settings

# importando biblioteca do SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 🚪 Criando engine para database
engine = create_engine(settings.database_url)

# 📦 Criando uma sessao para o banco de dados

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# autocommit : Define se a sessao vai confimar automaticamente cada operacao no banco.
# autoflash  : Define se a sessao deve enviar alteracoes automaticamente para o banco antes de executar consultas. 
# bind       : Define qual engine de banco de dados a sessao vai usar

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
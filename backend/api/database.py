# Importando classe de configurações do projeto
# Essa classe contém variáveis como URL do banco de dados, secret keys, etc.
from .settings import settings

# Importando funções do SQLAlchemy para trabalhar com banco de dados
from sqlalchemy import create_engine          # Cria a "engine", que é a conexão com o banco
from sqlalchemy.orm import sessionmaker      # Cria sessões de comunicação com o banco

# 🚪 Criando a "engine" que conecta a aplicação ao banco de dados
# settings.database_url é a URL do banco, por exemplo: "sqlite:///./test.db" ou "postgresql://user:pass@host/db"
engine = create_engine(settings.database_url)

# 📦 Criando uma fábrica de sessões
# SessionLocal é uma função que cria sessões de banco de dados, usadas para consultar ou modificar dados
# autocommit=False -> você precisa confirmar as mudanças manualmente
# autoflush=False -> não envia mudanças automaticamente antes de consultas
# bind=engine -> vincula a sessão à engine criada acima
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Função que será usada nos endpoints para fornecer a sessão do banco
def get_db():
    db = SessionLocal()       # • Conectando ao banco de dados (abre uma sessão)
    print("✅ - Sessão aberta!")
    try:
        yield db              # • Entrega a sessão para ser usada nos endpoints
        print("☑️ - Operacão concluída!")  
    finally:
        db.close()            # • Fecha a sessão após o uso, liberando recursos
        print("❌ - Sessão encerrada!")
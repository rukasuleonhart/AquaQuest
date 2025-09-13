from sqlalchemy.orm import declarative_base  # Importa a função para criar a classe base do SQLAlchemy

# Cria a classe Base, que será a classe "pai" de todas as tabelas do banco de dados
# Todas as classes que representam tabelas devem herdar dessa Base
Base = declarative_base()

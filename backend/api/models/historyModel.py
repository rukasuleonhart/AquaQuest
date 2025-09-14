from datetime import datetime  # Importa a classe datetime para trabalhar com datas e horas
from sqlalchemy.orm import Mapped, mapped_column  # Importa tipos e funções para mapear colunas de uma tabela
from sqlalchemy import func  # Permite usar funções do banco, como NOW()
from .base import Base  # Importa a classe Base, que é a base para todas as tabelas do SQLAlchemy

# Define a classe Historico que será mapeada para uma tabela no banco
class Historico(Base):
    __tablename__ = 'historico'  # Nome da tabela no banco de dados

    # Coluna 'id': chave primária da tabela, inteiro, autoincrementa, indexado para buscas rápidas
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)

    # Coluna 'amount': valor numérico (float), não pode ser nulo
    amount: Mapped[float] = mapped_column(nullable=False)

    # Coluna 'time': armazena data e hora do registro
    # server_default=func.now() define que, se não passar valor, o banco vai usar a hora atual
    # nullable=False significa que essa coluna não pode ficar vazia
    time: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
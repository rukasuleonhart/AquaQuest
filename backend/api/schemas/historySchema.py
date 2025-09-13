from pydantic import BaseModel  # Importa BaseModel do Pydantic, usado para criar schemas de validação de dados
from datetime import datetime   # Importa datetime para representar datas e horas

# Schema que representa os dados de um histórico completo, incluindo o ID e a hora
class HistorySchema(BaseModel):
    id: int             # ID do registro, inteiro
    amount: float       # Valor numérico do registro (Agual mL)
    time: datetime      # Momento em que o registro foi criado

    # Configuração que permite criar o schema diretamente a partir de um objeto ORM (como o SQLAlchemy)
    model_config = {"from_attributes": True}


# Schema usado para criar um novo registro de histórico
# Não inclui ID e time porque esses valores serão gerados pelo banco
class CreateHistorySchema(BaseModel):
    amount: float       # Valor numérico do registro a ser criado
    model_config = {"from_attributes": True}  # Permite criar o schema a partir de um objeto ORM
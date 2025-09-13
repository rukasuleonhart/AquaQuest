# Importa ferramentas do FastAPI
from fastapi import APIRouter, status, Depends, HTTPException
# Importa Session do SQLAlchemy para manipular o banco de dados
from sqlalchemy.orm import Session
# Importa List do typing para indicar que vamos retornar listas de itens
from typing import List

# Importa os schemas (modelos de dados) que definem como os dados entram e saem da API
from ..schemas.historySchema import HistorySchema, CreateHistorySchema
# Importa a função que cria uma sessão do banco de dados
from ..database import get_db
# Importa o modelo de histórico, que é a representação da tabela no banco
from ..models.historyModel import Historico

# Cria um roteador, que é uma forma de organizar rotas da API
router = APIRouter(prefix='/historico', tags=['🕑 Histórico'])

# =============================================================================================#
# ROTA GET - Mostrar todos os registros                                                        #
# =============================================================================================#
@router.get("/", response_model=List[HistorySchema], status_code=status.HTTP_200_OK)
async def Mostrar_Historico(db: Session = Depends(get_db)):
    """
    Busca todos os registros de histórico no banco de dados e retorna como lista.
    
    - db: é a conexão com o banco de dados, fornecida pelo Depends(get_db)
    - response_model=List[HistorySchema]: define que a resposta será uma lista de objetos HistorySchema
    - status_code=200: indica sucesso na requisição
    """
    # Consulta todos os registros da tabela Historico
    water_registers = db.query(Historico).all()
    
    # Converte cada registro do banco (objeto ORM) para o schema que será retornado
    return [HistorySchema.model_validate(w) for w in water_registers]

# =============================================================================================#
# ROTA POST - Registrar novo histórico                                                         #
# =============================================================================================#
@router.post("/", response_model=HistorySchema, status_code=status.HTTP_201_CREATED)
async def Registrar_no_Historico(water: CreateHistorySchema, db: Session = Depends(get_db)):
    """
    Cria um novo registro de histórico no banco de dados.
    
    - water: dados enviados pelo cliente, validados pelo schema CreateHistorySchema
    - db: conexão com o banco, fornecida pelo Depends(get_db)
    - response_model=HistorySchema: define que a resposta será um objeto HistorySchema
    - status_code=201: indica que algo foi criado com sucesso
    """
    # Cria um objeto do modelo Historico usando os dados enviados
    newHistorico = Historico(**water.model_dump())

    # Adiciona o novo objeto na sessão do banco
    db.add(newHistorico)
    # Salva as alterações no banco
    db.commit()
    # Atualiza o objeto com os dados do banco (como id gerado automaticamente)
    db.refresh(newHistorico)

    # Retorna o novo registro convertido para o schema de saída
    return HistorySchema.model_validate(newHistorico)
# =============================================================================================#
# ROTA DELETE - Excluir um histórico                                                           #
# =============================================================================================#
@router.delete("/{id}", response_model=HistorySchema, status_code=status.HTTP_200_OK)
async def Excluir_no_Historico(id: int, db: Session = Depends(get_db)):
    """
    Exclui um registro de histórico pelo seu ID.
    
    - id: ID do registro a ser deletado
    - db: conexão com o banco de dados
    - response_model=HistorySchema: retorna o registro deletado
    """
    # Busca o registro pelo ID
    registro = db.query(Historico).filter(Historico.id == id).first()

    # Se não encontrar, retorna erro 404
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Registro com id {id} nao encontrado")
    
    # Deleta o registro
    db.delete(registro)
    db.commit()

    # Retorna o registro deletado
    return HistorySchema.model_validate(registro)
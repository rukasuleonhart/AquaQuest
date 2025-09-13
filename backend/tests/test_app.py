from fastapi.testclient import TestClient  # Ferramenta do FastAPI para testar rotas sem precisar rodar o servidor
from http import HTTPStatus                # Facilita usar códigos HTTP com nomes legíveis (ex: HTTPStatus.OK)
from api.app import app                    # Importa a instância do FastAPI do seu projeto

# === Função de teste ===
def test_read_root_return_ola_mundo():
    # Criamos um "cliente de teste" que simula requisições ao app
    client = TestClient(app)

    # Simula uma requisição GET na rota "/"
    response = client.get('/')

    # === Verificações ===
    # 1. O status da resposta deve ser 200 (OK)
    assert response.status_code == HTTPStatus.OK

    # 2. O corpo da resposta deve ser o JSON {"message": "Olá Mundo!"}
    assert response.json() == {"message":"Olá Mundo!"}

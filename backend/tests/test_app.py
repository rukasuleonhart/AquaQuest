from fastapi.testclient import TestClient
from http import HTTPStatus
from api.app import app

def test_read_root_return_ola_mundo():
    client = TestClient(app)

    response = client.get('/')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"message":"Olá Mundo!"}
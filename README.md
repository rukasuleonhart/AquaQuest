Instruções para execução
1. Clonar o repositório
git clone https://github.com/rukasuleonhart/AquaQuest
cd AquaQuest
2. Configurar o Backend (FastAPI + PostgreSQL)
1. Entrar no ambiente Poetry:
poetry shell
2. Rodar as migrações do Alembic para configurar o banco de dados PostgreSQL
(rodando no Docker):
alembic upgrade head
3. Iniciar o servidor FastAPI:
uvicorn api.app:app --host 0.0.0.0 --reload
Certifique-se de que o container do PostgreSQL esteja rodando antes de aplicar as
migrações.
3. Configurar e rodar o Frontend (React Native com Expo)
1. Entrar na pasta do frontend:
cd frontend
2. Instalar dependências:
npm install
3. Rodar a aplicação no navegador:
npm run web
Para rodar em dispositivo físico ou emulador, use o Expo conforme documentação
oficial (npm start ou expo start).

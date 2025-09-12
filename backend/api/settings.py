from dotenv import load_dotenv
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# env_path variavel que armazena o caminho do .env
env_path = Path(__file__).resolve().parent.parent / '.env' # Sobe uma pasta e encontra o .env
load_dotenv(dotenv_path = env_path) # Carregando o .env na memória

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=env_path, env_file_encoding="utf-8")

# Tipando os dados de login para DATABASE
    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    DB_HOST: str = ""
    DB_PORT: int = 5432
    POSTGRES_DB: str  = ""

# Gerando a URL para DATABASE
    @property
    def database_url(self):
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.POSTGRES_DB}"
        )

# Criando uma instancia global
settings = Settings()

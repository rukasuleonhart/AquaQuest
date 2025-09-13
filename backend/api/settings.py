from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Caminho para o arquivo .env na raiz do projeto
env_path = Path(__file__).resolve().parent.parent / '.env'

class Settings(BaseSettings):
    # Configuração do Pydantic 2.x para carregar o .env
    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8",
        extra="allow"  # Permite variáveis extras no .env sem erro
    )

    # Variáveis de ambiente para conexão com o banco
    POSTGRES_USER: str = "admin"
    POSTGRES_PASSWORD: str = "admin"
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 4090
    POSTGRES_DB: str  = "AquaQuestDB"

    # Propriedade para gerar a URL completa de conexão
    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.POSTGRES_DB}"
        )

# Instância global para usar em todo o backend
settings = Settings()

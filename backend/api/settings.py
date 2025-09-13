from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# === Definindo o caminho para o arquivo .env ===
# Path(__file__) pega o caminho do arquivo atual.
# .resolve() transforma em caminho absoluto.
# .parent.parent vai duas pastas para cima.
# '/.env' é o nome do arquivo de variáveis de ambiente.
env_path = Path(__file__).resolve().parent.parent / '.env'

# === Classe de configuração do projeto ===
# BaseSettings do Pydantic facilita carregar variáveis de ambiente.
# Aqui definimos todas as configs do projeto, como dados do banco.
class Settings(BaseSettings):
    # model_config é usado no Pydantic 2.x
    # env_file: arquivo .env para carregar variáveis
    # env_file_encoding: garante que leia acentos e caracteres especiais corretamente
    # extra="allow": permite que o .env tenha variáveis extras sem causar erro
    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8",
        extra="allow"
    )

    # === Variáveis de ambiente padrão ===
    # Essas são as informações do banco de dados
    POSTGRES_USER: str = "admin"          # Usuário do banco
    POSTGRES_PASSWORD: str = "admin"      # Senha do banco
    DB_HOST: str = "127.0.0.1"            # Endereço do servidor do banco (localhost)
    DB_PORT: int = 4090                    # Porta do banco
    POSTGRES_DB: str = "AquaQuestDB"      # Nome do banco

    # === Propriedade para gerar a URL de conexão ===
    # Ao invés de montar a URL toda hora, usamos uma função que retorna ela já pronta
    @property
    def database_url(self) -> str:
        # Exemplo de saída: postgresql://admin:admin@127.0.0.1:4090/AquaQuestDB
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.POSTGRES_DB}"
        )

# === Instância global ===
# Criamos uma instância de Settings para usar em todo o backend.
# Assim, qualquer parte do código pode acessar, por exemplo, settings.database_url
settings = Settings()
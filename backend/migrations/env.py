import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

from api.models.base import Base
from api.models.profileModel import Profile   # ⬅ importa a model
from api.models.historyModel import Historico # ⬅ importa a model

# Adiciona a raiz do projeto ao sys.path para importar settings
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Importa a instância do Settings que já lê do .env
from api.settings import settings

# Alembic Config object
config = context.config

# Configura loggers do Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Define a URL do banco dinamicamente usando settings
config.set_main_option("sqlalchemy.url", settings.database_url)

# metadata do Alembic (agora com todas as tabelas registradas)
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

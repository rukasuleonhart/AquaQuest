"""Criando tabela de Historico #2

Revision ID: 4babb7182167
Revises: a5061f311a51
Create Date: 2025-09-13 01:33:54.635631

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4babb7182167'
down_revision: Union[str, Sequence[str], None] = 'a5061f311a51'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Criando a tabela 'historico'
    op.create_table(
        'historico',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('acao', sa.String(255), nullable=False),
        sa.Column('usuario_id', sa.Integer, nullable=True),
        sa.Column('criado_em', sa.DateTime, server_default=sa.func.now(), nullable=False)
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Deletando a tabela 'historico' em caso de rollback
    op.drop_table('historico')

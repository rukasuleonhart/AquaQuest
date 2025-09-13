"""Alterando tabela Historico para WaterRegister

Revision ID: 5cdef1234567
Revises: 4babb7182167
Create Date: 2025-09-13 01:50:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import func

# revision identifiers, used by Alembic.
revision = '5cdef1234567'
down_revision = '4babb7182167'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remover colunas antigas
    with op.batch_alter_table('historico') as batch_op:
        batch_op.drop_column('acao')
        batch_op.drop_column('usuario_id')
        batch_op.drop_column('criado_em')
        # Adicionar novas colunas
        batch_op.add_column(sa.Column('amount', sa.Integer, nullable=False))
        batch_op.add_column(sa.Column('time', sa.DateTime, server_default=func.now(), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('historico') as batch_op:
        batch_op.drop_column('amount')
        batch_op.drop_column('time')
        batch_op.add_column(sa.Column('acao', sa.String(255), nullable=False))
        batch_op.add_column(sa.Column('usuario_id', sa.Integer, nullable=True))
        batch_op.add_column(sa.Column('criado_em', sa.DateTime, server_default=func.now(), nullable=False))

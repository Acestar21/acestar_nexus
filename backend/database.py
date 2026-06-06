from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session

APP_DIR = Path.home() / ".acestar_nexus"
APP_DIR.mkdir(exist_ok=True)

DB_PATH = APP_DIR / "nexus.db"

DATABASE_URL = f"sqlite:///{DB_PATH}"


engine = create_engine(DATABASE_URL, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
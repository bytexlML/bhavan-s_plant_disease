import os
import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

Base = declarative_base()

class UserRegistration(Base):
    __tablename__ = "user_registrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    plant_name = Column(String)
    predicted_disease = Column(String)
    category = Column(String)
    confidence_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# Database Setup
# VERCEL FIX: Use /tmp for SQLite databases as the root is read-only
default_db = "sqlite:////tmp/plant_health.db" if os.environ.get("VERCEL") else "sqlite:///./plant_health.db"
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", default_db)

# Only use check_same_thread: False if we are using SQLite
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

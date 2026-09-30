import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_PATH = os.path.join(BASE_DIR, 'database.db')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    SECRET_KEY = os.getenv('SECRET_KEY', 'college-mini-project-secret-key-2026')
    DEBUG = True

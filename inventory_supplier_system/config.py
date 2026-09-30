import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    # When deployed to Vercel Serverless, the root filesystem is read-only except /tmp
    if os.environ.get('VERCEL'):
        DATABASE_PATH = os.path.join('/tmp', 'database.db')
    else:
        DATABASE_PATH = os.environ.get('DATABASE_PATH', os.path.join(BASE_DIR, 'database.db'))

    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    SECRET_KEY = os.getenv('SECRET_KEY', 'college-mini-project-secret-key-2026')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ['true', '1']

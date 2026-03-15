"""
Environment Configuration Module
Loads and manages environment variables
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask Config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.environ.get('DEBUG', 'True') == 'True'
    PORT = int(os.environ.get('PORT', 5000))
    
    # Firebase Config
    FIREBASE_WEB_API_KEY = os.environ.get('FIREBASE_WEB_API_KEY', '')
    
    # Admin Config
    ADMIN_SECRET_KEY = os.environ.get('ADMIN_SECRET_KEY', '')
    
    # CORS Config
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')

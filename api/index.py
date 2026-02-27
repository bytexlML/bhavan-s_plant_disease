import sys
import os

# Add the project root to sys.path so that absolute imports work
# for the 'backend' package when running on Vercel.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app

# Vercel looks for the 'app' variable by default for Python functions.
# This makes our FastAPI app available as a serverless function.

import sys
import os

# Add the root directory to the Python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.append(root_dir)

try:
    from backend.app.main import app
except ImportError as e:
    print(f"Vercel Index: IMPORT ERROR - {e}")
    raise e

# The entry point for Vercel is 'app'

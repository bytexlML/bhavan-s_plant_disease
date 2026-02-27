import sys
import os

# Add the root directory to the Python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.append(root_dir)

print(f"Vercel Index: Python path extended with {root_dir}")

try:
    from backend.app.main import app
    print("Vercel Index: Successfully imported 'app' from backend.app.main")
except ImportError as e:
    print(f"Vercel Index: IMPORT ERROR - {e}")
    raise e

# The entry point for Vercel is 'app'

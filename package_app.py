import os
import subprocess
import sys
import shutil

def package():
    print("--- Bhavan's AI Plant Health - Packaging Script ---")
    
    # 1. Verification
    if not os.path.exists("frontend/out"):
        print("Error: frontend/out not found. Please run 'npm run build' in the frontend directory first.")
        return

    # 2. Install PyInstaller if not present
    try:
        import PyInstaller
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    # 3. Create the PyInstaller command
    # We bundle:
    # - backend/app/main.py as the entry point
    # - frontend/out as frontend/out
    # - backend/.env (optional, but good for defaults)
    # - ml_models (if needed, though we use LLM now)
    
    print("Building executable with PyInstaller...")
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onefile",
        "--windowed", 
        "--name", "BhavansPlantAI",
        "--add-data", f"frontend/out{os.pathsep}frontend/out",
        "--add-data", f"backend/.env{os.pathsep}backend",
        "--hidden-import", "uvicorn.logging",
        "--hidden-import", "uvicorn.loops",
        "--hidden-import", "uvicorn.loops.auto",
        "--hidden-import", "uvicorn.protocols",
        "--hidden-import", "uvicorn.protocols.http",
        "--hidden-import", "uvicorn.protocols.http.auto",
        "--hidden-import", "uvicorn.lifespan",
        "--hidden-import", "uvicorn.lifespan.on",
        "backend/app/main.py"
    ]
    
    try:
        subprocess.check_call(cmd)
        print("\n--- SUCCESS! ---")
        print("Your executable is located in the 'dist' folder: dist/BhavansPlantAI.exe")
    except subprocess.CalledProcessError as e:
        print(f"\n--- FAILED ---")
        print(f"PyInstaller exited with error code {e.returncode}")

if __name__ == "__main__":
    package()

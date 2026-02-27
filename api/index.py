from fastapi import FastAPI

app = FastAPI()

@app.get("/api/health")
def health():
    return {"status": "ok", "debug": "minimal"}

@app.get("/api/test")
def test():
    return {"status": "alive", "debug": "minimal"}

# The entry point for Vercel is 'app'

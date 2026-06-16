#!/usr/bin/env python3
"""
SHANNON-Ω Cortex API Server — Remote control for all automation.
Forked from n8n-workflows api_server.py, adapted for our stack.
"""
import sys, os, json, subprocess, threading, logging
from pathlib import Path

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE, "media-tools", "scripts", "lib"))

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn

from cortex_catalog import CortexCatalog

app = FastAPI(title="SHANNON-Ω Cortex API", version="3.0.0")
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

db = CortexCatalog()

class RunRequest(BaseModel):
    command: str
    args: Optional[list] = []
    async_run: Optional[bool] = False

@app.get("/")
def root():
    return {"status": "SHANNON-Ω CORTEX ACTIVE", "version": "3.0.0"}

@app.get("/stats")
def stats():
    return db.get_stats()

@app.get("/search")
def search(q: str = Query("", min_length=1)):
    return db.search(q)

@app.post("/run")
def run_automation(req: RunRequest, background: BackgroundTasks):
    """Execute a zorg-engine command via API."""
    cmd_parts = req.command.split()
    script = os.path.join(BASE, "media-tools", "scripts", "zorg-engine")
    
    full_cmd = ["bash", script] + cmd_parts + [str(a) for a in (req.args or [])]
    
    if req.async_run:
        thread = threading.Thread(target=lambda: subprocess.run(full_cmd, capture_output=True))
        thread.start()
        return {"status": "started", "command": req.command}
    else:
        result = subprocess.run(full_cmd, capture_output=True, text=True, timeout=300)
        return {
            "status": "done" if result.returncode == 0 else "error",
            "stdout": result.stdout[-2000:],
            "stderr": result.stderr[-500:],
        }

@app.post("/register")
def register_automation(name: str, type_: str, description: str = ""):
    aid = db.register(name, type_, description=description)
    return {"id": aid, "name": name}

@app.get("/workflows")
def list_workflows():
    """List all files in omega/workflows directory."""
    wf_dir = os.path.join(BASE, "omega", "workflows")
    os.makedirs(wf_dir, exist_ok=True)
    files = []
    for f in sorted(os.listdir(wf_dir)):
        if f.endswith(('.json', '.py', '.sh')):
            fp = os.path.join(wf_dir, f)
            files.append({"name": f, "size": os.path.getsize(fp), "modified": os.path.getmtime(fp)})
    return files


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 7777
    print(f"SHANNON-Ω Cortex API running on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

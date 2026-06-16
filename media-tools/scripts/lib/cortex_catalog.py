"""
SHANNON-Ω Cortex Catalog
Forked from n8n-workflows workflow_db.py — extended for our automation stack
SQLite + FTS5 full-text search for all automation scripts and workflows
"""
import sqlite3, json, os, glob, hashlib, datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE, "omega", "cortex.db")
WORKFLOWS_DIR = os.path.join(BASE, "omega", "workflows")

class CortexCatalog:
    """High-performance SQLite catalog for SHANNON-Ω automation scripts."""
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init_db()
    
    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        
        conn.execute("""
            CREATE TABLE IF NOT EXISTS automations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                script_path TEXT,
                description TEXT,
                trigger_type TEXT DEFAULT 'manual',
                integrations TEXT DEFAULT '[]',
                tags TEXT DEFAULT '[]',
                success_count INTEGER DEFAULT 0,
                fail_count INTEGER DEFAULT 0,
                last_run TEXT,
                avg_duration REAL,
                enabled BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS automations_fts USING fts5(
                name, description, tags, integrations, content='automations', content_rowid='id'
            )
        """)
        
        conn.execute("""
            CREATE TABLE IF NOT EXISTS execution_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                automation_id INTEGER,
                status TEXT,
                duration_ms INTEGER,
                output TEXT,
                error TEXT,
                run_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (automation_id) REFERENCES automations(id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def register(self, name: str, type_: str, script_path: str = None, 
                 description: str = "", trigger: str = "manual",
                 integrations: list = None, tags: list = None) -> int:
        conn = sqlite3.connect(self.db_path)
        cur = conn.execute("""
            INSERT INTO automations (name, type, script_path, description, trigger_type, integrations, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (name, type_, script_path, description, trigger, 
              json.dumps(integrations or []), json.dumps(tags or [])))
        conn.commit()
        aid = cur.lastrowid
        conn.close()
        return aid
    
    def log_execution(self, automation_id: int, status: str, 
                      duration_ms: int = 0, output: str = "", error: str = ""):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT INTO execution_logs (automation_id, status, duration_ms, output, error)
            VALUES (?, ?, ?, ?, ?)
        """, (automation_id, status, duration_ms, output, error))
        
        if status == "success":
            conn.execute("UPDATE automations SET success_count = success_count + 1, last_run = datetime('now'), updated_at = datetime('now') WHERE id = ?", (automation_id,))
        else:
            conn.execute("UPDATE automations SET fail_count = fail_count + 1, updated_at = datetime('now') WHERE id = ?", (automation_id,))
        conn.commit()
        conn.close()
    
    def search(self, query: str, limit: int = 20) -> list:
        conn = sqlite3.connect(self.db_path)
        rows = conn.execute("""
            SELECT a.id, a.name, a.type, a.description, a.trigger_type, 
                   a.success_count, a.fail_count, a.last_run, a.enabled
            FROM automations_fts f
            JOIN automations a ON f.rowid = a.id
            WHERE automations_fts MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (query, limit)).fetchall()
        conn.close()
        return [dict(zip(['id','name','type','description','trigger','success','fail','last_run','enabled'], r)) for r in rows]
    
    def get_stats(self) -> dict:
        conn = sqlite3.connect(self.db_path)
        total = conn.execute("SELECT COUNT(*) FROM automations").fetchone()[0]
        enabled = conn.execute("SELECT COUNT(*) FROM automations WHERE enabled = 1").fetchone()[0]
        by_type = conn.execute("SELECT type, COUNT(*) FROM automations GROUP BY type").fetchall()
        recent = conn.execute("SELECT COUNT(*) FROM execution_logs WHERE run_at > datetime('now', '-24 hours')").fetchone()[0]
        conn.close()
        return {"total": total, "enabled": enabled, "by_type": dict(by_type), "executions_24h": recent}


if __name__ == "__main__":
    import sys
    cmd = sys.argv[1] if len(sys.argv) > 1 else "stats"
    cat = CortexCatalog()
    if cmd == "stats":
        print(json.dumps(cat.get_stats(), indent=2))
    elif cmd == "register" and len(sys.argv) >= 4:
        aid = cat.register(sys.argv[2], sys.argv[3], description=sys.argv[4] if len(sys.argv) > 4 else "")
        print(f"Registered automation #{aid}")
    elif cmd == "search" and len(sys.argv) >= 3:
        for r in cat.search(sys.argv[2]):
            print(f"  #{r['id']} {r['name']} ({r['type']}) - {r['description'][:60]}")
    elif cmd == "log" and len(sys.argv) >= 4:
        cat.log_execution(int(sys.argv[2]), sys.argv[3])
        print(f"Logged execution for #{sys.argv[2]}")

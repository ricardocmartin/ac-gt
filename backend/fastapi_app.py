from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "savegame.sqlite"
ASSETS_DIR = BASE_DIR / "assets"

app = FastAPI(title="Assetto Corsa GT Edition API")

class SaveData(BaseModel):
    credits: int
    progress: int


def query_db(query, params=(), fetchone=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, params)
    if query.lstrip().upper().startswith("SELECT"):
        data = cur.fetchone() if fetchone else cur.fetchall()
    else:
        conn.commit()
        data = None
    conn.close()
    return data

@app.on_event("startup")
def startup():
    query_db("""
    CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY,
        name TEXT,
        credits INTEGER,
        progress INTEGER
    )""")
    query_db("""
    CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY,
        name TEXT,
        owned INTEGER DEFAULT 0
    )""")
    # insert default profile
    if not query_db("SELECT * FROM profile", fetchone=True):
        query_db("INSERT INTO profile (name, credits, progress) VALUES (?, ?, ?)", ("Player", 10000, 0))
    # load cars from json if table empty
    if not query_db("SELECT * FROM cars", fetchone=True):
        cars = json.loads((ASSETS_DIR / "cars.json").read_text())
        for car in cars:
            query_db("INSERT INTO cars (id, name, owned) VALUES (?, ?, 0)", (car["id"], car["name"]))

@app.get("/profile")
def get_profile():
    row = query_db("SELECT name, credits, progress FROM profile WHERE id=1", fetchone=True)
    return dict(row)

@app.get("/cars")
def get_cars():
    rows = query_db("SELECT id, name FROM cars WHERE owned=1")
    return [dict(r) for r in rows]

@app.get("/market")
def get_market():
    rows = query_db("SELECT id, name FROM cars")
    return [dict(r) for r in rows]

@app.get("/events")
def get_events():
    events = json.loads((ASSETS_DIR / "events.json").read_text())
    return events

@app.post("/save")
def save_progress(data: SaveData):
    query_db("UPDATE profile SET credits=?, progress=? WHERE id=1", (data.credits, data.progress))
    return {"status": "ok"}

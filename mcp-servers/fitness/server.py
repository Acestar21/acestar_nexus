import json
import logging
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from models import WorkoutEntry, FitnessSnapshot

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


DATA_DIR = Path(os.environ.get('ACESTAR_DATA_DIR', Path.home() / '.acestar_nexus'))
DATA_DIR.mkdir(parents=True, exist_ok=True)
FITNESS_LOG_PATH = DATA_DIR / 'fitness.json'

mcp = FastMCP("fitness")


def load_entries() -> list[WorkoutEntry]:
    if not FITNESS_LOG_PATH.exists():
        return []
    with open(FITNESS_LOG_PATH, "r") as f:
        data = json.load(f)
    return [WorkoutEntry(**entry) for entry in data]


def calculate_snapshot(entries: list[WorkoutEntry]) -> FitnessSnapshot:
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())  # Monday of current week

    completed = {
        entry.date
        for entry in entries
        if entry.completed
    }

    total_workouts_this_week = sum(
        1 for d in completed
        if datetime.strptime(d, "%Y-%m-%d").date() >= week_start
    )

    worked_out_today = str(today) in completed

    streak = 0
    check_date = today if str(today) in completed else today - timedelta(days=1)
    while str(check_date) in completed:
        streak += 1
        check_date -= timedelta(days=1)

    last_workout_date = max(completed) if completed else None

    return FitnessSnapshot(
        captured_at=datetime.now(timezone.utc),
        worked_out_today=worked_out_today,
        current_streak=streak,
        total_workouts_this_week=total_workouts_this_week,
        last_workout_date=last_workout_date,
    )


@mcp.tool()
async def get_fitness_activity() -> str:
    logger.info("Fetching fitness activity...")
    entries = load_entries()
    snapshot = calculate_snapshot(entries)
    return snapshot.model_dump_json()


@mcp.tool()
async def log_workout(
    date: str,
    completed: bool,
    duration_minutes: int | None = None,
    notes: str | None = None,
) -> str:
    logger.info(f"Logging workout for {date}")

    FITNESS_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

    entries = []
    if FITNESS_LOG_PATH.exists():
        with open(FITNESS_LOG_PATH, "r") as f:
            entries = json.load(f)

    # update if entry for date exists, else append
    for i, entry in enumerate(entries):
        if entry["date"] == date:
            entries[i] = {
                "date": date,
                "completed": completed,
                "duration_minutes": duration_minutes,
                "notes": notes,
            }
            break
    else:
        entries.append({
            "date": date,
            "completed": completed,
            "duration_minutes": duration_minutes,
            "notes": notes,
        })

    with open(FITNESS_LOG_PATH, "w") as f:
        json.dump(entries, f, indent=2)

    return json.dumps({"status": "ok", "date": date})


if __name__ == "__main__":
    mcp.run(transport="stdio")
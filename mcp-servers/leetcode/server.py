import logging
import os
import json
from datetime import datetime, timezone, timedelta

import httpx
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from models import LeetCodeActivity, LeetCodeSnapshot

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

LEETCODE_USERNAME = os.getenv("LEETCODE_USERNAME")
GRAPHQL_URL = "https://leetcode.com/graphql"

mcp = FastMCP("leetcode")

def get_headers() -> dict:
    headers = {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0"
    }
    return headers    

async def fetch_user_stats(username: str) -> dict:
    query = """
    query($username: String!) {
        matchedUser(username: $username) {
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
            userCalendar {
                streak
                totalActiveDays
                submissionCalendar
            }
        }
    }
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GRAPHQL_URL,
            headers=get_headers(),
            json={"query": query, "variables": {"username": username}},
        )
        response.raise_for_status()
        return response.json()

def calculate_activity(data: dict) -> LeetCodeActivity:
    user = data["data"]["matchedUser"]

    ac_submissions = user["submitStatsGlobal"]["acSubmissionNum"]
    total_solved = next(
        (x["count"] for x in ac_submissions if x["difficulty"] == "All"), 0
    )

    calendar = user["userCalendar"]
    max_streak = calendar["streak"]
    total_active_days = calendar["totalActiveDays"]
    submission_calendar = json.loads(calendar["submissionCalendar"])

    now = datetime.now(timezone.utc)
    today = now.date()
    week_start = today - timedelta(days=today.weekday())

    active_dates = set()
    solved_today = 0
    solved_this_week = 0

    for ts_str, count in submission_calendar.items():
        date = datetime.fromtimestamp(int(ts_str), tz=timezone.utc).date()
        if count > 0:
            active_dates.add(date)
        if date == today:
            solved_today = count
        if date >= week_start:
            solved_this_week += count

    # calculate current streak walking backwards from today
    current_streak = 0
    check_date = today if today in active_dates else today - timedelta(days=1)
    while check_date in active_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    return LeetCodeActivity(
        problem_solved_today=solved_today,
        problem_solved_this_week=solved_this_week,
        total_problem_solved=total_solved,
        current_streak=current_streak,
        max_streak=max_streak,
        total_active_days=total_active_days,
    )


@mcp.tool()
async def get_leetcode_activity() -> str:
    logger.info(f"Fetching LeetCode activity for {LEETCODE_USERNAME}")
    data = await fetch_user_stats(LEETCODE_USERNAME)
    activity = calculate_activity(data)
    snapshot = LeetCodeSnapshot(
        username=LEETCODE_USERNAME,
        captured_at=datetime.now(timezone.utc),
        activity=activity,
    )
    return snapshot.model_dump_json()


if __name__ == "__main__":
    mcp.run(transport="stdio")
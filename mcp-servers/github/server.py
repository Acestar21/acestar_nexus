import logging
import json 
import os
from datetime import datetime, timezone , timedelta

import httpx
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from models import GitHubSnapshot, CommitActivity

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)   

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
API_BASE = "https://api.github.com"

mcp = FastMCP("github")

def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


async def fetch_contributions(username: str) -> dict:
    query = """
    query($username: String!) {
        user(login: $username) {
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                        }
                    }
                }
            }
        }
    }
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_BASE}/graphql",
            headers=get_headers(),
            json={"query": query, "variables": {"username": username}},
        )
        response.raise_for_status()
        return response.json()


def calculate_activity(data: dict) -> CommitActivity:
    calendar = (
        data["data"]["user"]["contributionsCollection"]["contributionCalendar"]
    )
    weeks = calendar["weeks"]

    all_days = []
    for week in weeks:
        all_days.extend(week["contributionDays"])

    today = datetime.now(timezone.utc).date()
    week_ago = today - timedelta(days=7)

    commits_today = 0
    commits_this_week = 0
    last_commit_date = None
    contribution_dates = set()

    for day in all_days:
        date = datetime.strptime(day["date"], "%Y-%m-%d").date()
        count = day["contributionCount"]

        if count > 0:
            contribution_dates.add(date)
            if last_commit_date is None or date > last_commit_date:
                last_commit_date = date

        if date == today:
            commits_today = count

        if date >= week_ago:
            commits_this_week += count

    streak = 0
    check_date = today if today in contribution_dates else today - timedelta(days=1)
    while check_date in contribution_dates:
        streak += 1
        check_date -= timedelta(days=1)

    return CommitActivity(
        commits_today=commits_today,
        commits_this_week=commits_this_week,
        current_streak=streak,
        last_commit_date=str(last_commit_date) if last_commit_date else None,
    )

@mcp.tool()
async def get_github_activity() -> str:
    logger.info(f"Fetching GitHub activity for {GITHUB_USERNAME}")
    data = await fetch_contributions(GITHUB_USERNAME)
    activity = calculate_activity(data)
    snapshot = GitHubSnapshot(
        username=GITHUB_USERNAME,
        captured_at=datetime.now(timezone.utc),
        activity=activity,
    )
    return snapshot.model_dump_json()


if __name__ == "__main__":
    mcp.run(transport="stdio")
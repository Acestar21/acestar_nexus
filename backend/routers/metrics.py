import asyncio
import logging
from fastapi import APIRouter
from mcp_client import call_tool
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_metrics():
    results = await asyncio.gather(
        call_tool("leetcode", "get_leetcode_activity", {}),
        call_tool("github", "get_github_activity", {}),
        call_tool("fitness", "get_fitness_activity", {}),
        return_exceptions=True
    )

    leetcode, github, fitness = results

    return {
        "leetcode": leetcode if not isinstance(leetcode, Exception) else None,
        "github": github if not isinstance(github, Exception) else None,
        "fitness": fitness if not isinstance(fitness, Exception) else None,
    }

@router.post("/fitness/log")
async def log_fitness(
	date: str,
	completed: bool,
	duration_minutes: Optional[int] = None,
	notes: Optional[str] = None
):
	result = await call_tool("fitness", "log_workout", {
		"date": date,
		"completed": completed,
		"duration_minutes": duration_minutes,
		"notes": notes,
	})
	return result
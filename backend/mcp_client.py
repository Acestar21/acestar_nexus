import asyncio
import json
import logging
from pathlib import Path
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

logger = logging.getLogger(__name__)

SERVERS_DIR = Path(__file__).parent.parent / "mcp-servers"

def get_server_params(server_name: str) ->StdioServerParameters:
    server_path = SERVERS_DIR / server_name / "server.py"
    if not server_path.exists():
        raise FileNotFoundError(f"""GitHub provider unavailable.\n
                                    Remaining providers still operational.""")
    return StdioServerParameters(
        command="python",
        args=[str(server_path)],
    )

async def call_tool(server_name: str, tool_name: str, arguments: dict[str,Any] | None = None) -> Any:
    logger.info(f"Calling tool '{tool_name}' on server '{server_name}' with arguments: {arguments}")
    params = get_server_params(server_name)

    async with stdio_client(params) as (read,write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, arguments or {})
            if result.content and len(result.content) > 0:
                raw = result.content[0].text
                try:
                    return json.loads(raw)
                except json.JSONDecodeError:
                    return raw
            return None
        

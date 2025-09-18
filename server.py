import httpx
from fastmcp import FastMCP
import os
from dotenv import load_dotenv

load_dotenv()

CAMINO_API_BASE_URL = os.getenv("CAMINO_API_BASE_URL", "https://api.getcamino.ai")
CAMINO_API_KEY = os.getenv("CAMINO_API_KEY")

# Create an HTTP client for your API
client = httpx.AsyncClient(
    base_url=CAMINO_API_BASE_URL,
    headers={"Authorization": f"Bearer {CAMINO_API_KEY}"}
)
# Load your OpenAPI spec 
openapi_spec = httpx.get(f"{CAMINO_API_BASE_URL}/openapi.json").json()

# Create the MCP server
mcp = FastMCP.from_openapi(
    openapi_spec=openapi_spec,
    client=client,
    name="Camino AI"
)

if __name__ == "__main__":
    mcp.run()
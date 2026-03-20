from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

# Initialize the limiter with a default app-wide rate limit
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"]
)

# Preset limits for specific sensitive routes
RATE_LIMITS = {
    "login": "5/minute",
    "register": "3/minute",
    "order": "10/minute",
    "upload": "10/minute"
}

"""
Logging configuration for the application.
"""
import logging
import sys
from pathlib import Path
from app.core.config import settings

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Configure root logger
def setup_logging():
    """
    Set up logging configuration for the application.
    """
    # Determine log level from settings
    log_level = logging.DEBUG if settings.debug else logging.INFO
    
    # File handler for errors only - set level after creation
    error_file_handler = logging.FileHandler(LOG_DIR / "errors.log", encoding="utf-8")
    error_file_handler.setLevel(logging.ERROR)

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT,
        datefmt=DATE_FORMAT,
        handlers=[
            # Console handler
            logging.StreamHandler(sys.stdout),
            # File handler for all logs
            logging.FileHandler(LOG_DIR / "app.log", encoding="utf-8"),
            # File handler for errors only
            error_file_handler,
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    return logging.getLogger(__name__)


# Get logger instance
logger = setup_logging()

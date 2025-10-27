FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from docker folder (relative to build context root: agent-sdk)
COPY docker/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy agent script from agent-sdk root
COPY system_health_agent.py /app/system_health_agent.py

ENTRYPOINT ["python","/app/system_health_agent.py"]

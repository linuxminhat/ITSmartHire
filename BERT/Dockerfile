# Use Python 3.11 slim image
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app

COPY . /app

RUN uv sync --frozen

EXPOSE 6969

CMD ["uv", "run", "server.py"]

# Use a lightweight Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy dependency files (both lowercase and uppercase versions)
COPY Server/requirements.txt  ./ 

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt || \
    pip install --no-cache-dir -r Requirements.txt

# Copy the rest of the application
COPY Server /app

# Expose FastAPI port
EXPOSE 8005

# Command to run the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8005"]

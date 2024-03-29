# This dockerfile is for API, and not for the Angular frontend

# Use an official Ubuntu image as a parent image
FROM ubuntu:latest

# Install system dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip

# Set the working directory to /app
WORKDIR /app

# Copy the local repository into the Docker image
COPY . /app/wiki-chatbot

# Change the working directory to /app/wiki-chatbot
WORKDIR /app/wiki-chatbot

# Install Python requirements
RUN pip install -r py-requirements.txt

# Install en_core_web_sm model
RUN python3 -m spacy download en_core_web_sm

# Command to start the backend dev server with gunicorn
CMD ["gunicorn", "wsgi:app", "-b", "0.0.0.0:8000", "--timeout", "300", "--log-level=debug"]

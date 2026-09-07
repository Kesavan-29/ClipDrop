# Clipdrop

Clipdrop is a responsive local web app for downloading public YouTube videos and Instagram Reels. It supports video with audio, audio-only downloads, quality selection, progress tracking, pause/resume, cancellation, multilingual UI, and MP3/M4A audio output.

Downloads are processed locally through Flask, yt-dlp, and a bundled FFmpeg runtime. No media is uploaded to a third-party application server.

## Features

- YouTube and public Instagram Reel URLs
- Video quality selection up to 4K when available
- Video download with audio merged into MP4
- Audio-only downloads in M4A or MP3
- Separate video and audio progress, size, speed, and ETA
- Stream-specific pause/resume controls
- Cancel download support
- Responsive desktop and mobile interface
- English, Spanish, Hindi, French, German, Portuguese, Chinese, Japanese, Arabic, Bengali, and Tamil UI
- Local-only processing and sanitized download filenames

## Run

```powershell
cd "your project folder"
py -m pip install -r requirements.txt
py app.py
```

Open `http://127.0.0.1:5000` in your browser. Public YouTube videos and Instagram Reels are supported; private or login-required posts need cookies and are not handled by default. Use it only for videos you have permission to download.

## Project Structure

```text
app.py                 Flask API and download worker
templates/index.html   Web interface markup
static/app.js          UI behavior and translations
static/style.css       Responsive styling
requirements.txt       Python dependencies
Procfile               Production web-server command
```

## GitHub

```powershell
cd D:\Y2Local
git init
git add .
git commit -m "Initial Clipdrop downloader app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

The repository excludes `.venv`, downloaded media, Python caches, and local history through `.gitignore`.

## Deploy on Render

GitHub stores the source code; Render runs the Flask server.

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

Free hosting may sleep when idle and usually has temporary disk storage. Do not rely on hosted local files for permanent media storage.

## Responsible Use

Only download media that you own or have permission to save. Respect the terms of service and copyright rules of each platform. Private or login-required content is intentionally not supported by default.

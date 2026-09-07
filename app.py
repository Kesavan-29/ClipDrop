from __future__ import annotations

import re
import threading
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse

import imageio_ffmpeg
import yt_dlp
from yt_dlp.utils import DownloadCancelled
from flask import Flask, jsonify, render_template, request, send_file


BASE_DIR = Path(__file__).resolve().parent
DOWNLOAD_DIR = BASE_DIR / "downloads"
DOWNLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
jobs: dict[str, dict] = {}
jobs_lock = threading.Lock()
cancel_events: dict[str, threading.Event] = {}


def is_supported_url(value: str) -> bool:
    parsed = urlparse(value)
    hostname = (parsed.hostname or "").lower()
    return parsed.scheme in {"http", "https"} and (
        hostname == "youtu.be"
        or hostname.endswith("youtube.com")
        or hostname == "instagram.com"
        or hostname.endswith("instagram.com")
        or hostname == "instagr.am"
    )


def update_job(job_id: str, **changes) -> None:
    with jobs_lock:
        jobs[job_id].update(changes)


def parse_percent(value: object) -> float:
    cleaned = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", str(value))
    match = re.search(r"(\d+(?:\.\d+)?)\s*%", cleaned)
    if match:
        return float(match.group(1))
    match = re.search(r"\d+(?:\.\d+)?", cleaned)
    return float(match.group()) if match else 0.0


def format_size(value: object) -> str:
    size = float(value or 0)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024 or unit == "GB":
            return f"{size:.1f} {unit}"
        size /= 1024
    return "0 B"


def progress_hook(job_id: str):
    def hook(data: dict) -> None:
        if cancel_events.get(job_id, threading.Event()).is_set():
            raise DownloadCancelled("Download cancelled by user")
        if data["status"] == "downloading":
            downloaded = data.get("downloaded_bytes", 0)
            total = data.get("total_bytes") or data.get("total_bytes_estimate") or 0
            stream_type = "video" if data.get("info_dict", {}).get("vcodec") != "none" else "audio"
            while True:
                with jobs_lock:
                    paused = jobs.get(job_id, {}).get(f"{stream_type}_paused", False)
                if not paused:
                    break
                time.sleep(0.25)
            update_job(
                job_id,
                state="downloading",
                **{f"{stream_type}_started": True},
                speed=re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", str(data.get("_speed_str", ""))),
                eta=data.get("_eta", ""),
                **{f"{stream_type}_percent": parse_percent(data.get("_percent_str", "0"))},
                **{f"{stream_type}_downloaded": format_size(downloaded)},
                **{f"{stream_type}_total": format_size(total)},
            )
        elif data["status"] == "finished":
            update_job(job_id, state="processing", speed="", eta="")

    return hook


def download_video(job_id: str, url: str, height: int, audio_only: bool = False, audio_format: str = "m4a") -> None:
    job_dir = DOWNLOAD_DIR / job_id
    job_dir.mkdir(exist_ok=True)
    output_template = str(job_dir / "%(title)s.%(ext)s")

    options = {
        "format": "bestaudio[ext=m4a]/bestaudio/best" if audio_only else f"bestvideo[height<={height}][ext=mp4]+bestaudio[ext=m4a]/best[height<={height}][ext=mp4]/best",
        **({} if audio_only else {"merge_output_format": "mp4"}),
        "outtmpl": output_template,
        "ffmpeg_location": imageio_ffmpeg.get_ffmpeg_exe(),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "progress_hooks": [progress_hook(job_id)],
    }
    if audio_only and audio_format == "mp3":
        options["postprocessors"] = [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "0"}]

    try:
        update_job(job_id, state="starting", message="Starting download...")
        with yt_dlp.YoutubeDL(options) as downloader:
            info = downloader.extract_info(url, download=True)
            title = info.get("title", "youtube-video")
        files = [path for path in job_dir.iterdir() if path.is_file()]
        if not files:
            raise RuntimeError("The downloader finished without creating a file.")
        update_job(job_id, state="complete", title=title, file=str(files[0]))
    except Exception as error:
        state = "cancelled" if cancel_events.get(job_id, threading.Event()).is_set() else "error"
        update_job(job_id, state=state, message=str(error))


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/download")
def fetch_video():
    payload = request.get_json(silent=True) or {}
    url = str(payload.get("url", "")).strip()
    if not is_supported_url(url):
        return jsonify(error="Enter a valid YouTube or Instagram Reel URL."), 400

    try:
        options = {"quiet": True, "no_warnings": True, "noplaylist": True}
        with yt_dlp.YoutubeDL(options) as downloader:
            info = downloader.extract_info(url, download=False)
        heights = sorted(
            {
                int(format_info["height"])
                for format_info in info.get("formats", [])
                if format_info.get("height") and format_info.get("vcodec") != "none"
            },
            reverse=True,
        )
        heights = [height for height in heights if height <= 2160]
        if not heights:
            return jsonify(error="No downloadable video qualities were found."), 422
        return jsonify(
            title=info.get("title", "YouTube video"),
            thumbnail=info.get("thumbnail", ""),
            duration=info.get("duration", 0),
            qualities=[{"height": height, "label": f"{height}p"} for height in heights],
        )
    except Exception as error:
        return jsonify(error=f"Could not fetch video details: {error}"), 502


@app.post("/api/download/start")
def start_download():
    payload = request.get_json(silent=True) or {}
    url = str(payload.get("url", "")).strip()
    try:
        height = int(payload.get("height", 720))
    except (TypeError, ValueError):
        return jsonify(error="Choose a valid video quality."), 400
    if not is_supported_url(url):
        return jsonify(error="Enter a valid YouTube or Instagram Reel URL."), 400
    if height < 144 or height > 2160:
        return jsonify(error="Choose a valid video quality."), 400
    audio_only = bool(payload.get("audio_only", False))
    audio_format = str(payload.get("audio_format", "m4a")) if audio_only else "mp4"
    if audio_format not in {"m4a", "mp3"}:
        return jsonify(error="Choose MP3 or M4A for audio-only downloads."), 400

    job_id = uuid.uuid4().hex
    with jobs_lock:
        jobs[job_id] = {
            "state": "queued", "video_percent": 0, "audio_percent": 0,
            "video_started": False, "audio_started": False,
            "video_downloaded": "0 B", "video_total": "calculating...",
            "audio_downloaded": "0 B", "audio_total": "calculating...",
            "speed": "", "eta": "", "video_paused": False, "audio_paused": False,
            "id": job_id, "url": url, "format": audio_format, "height": height,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
    cancel_events[job_id] = threading.Event()
    threading.Thread(target=download_video, args=(job_id, url, height, audio_only, audio_format), daemon=True).start()
    return jsonify(job_id=job_id)


@app.post("/api/download/<job_id>/cancel")
def cancel_download(job_id: str):
    if job_id not in jobs:
        return jsonify(error="Download job not found."), 404
    cancel_events.setdefault(job_id, threading.Event()).set()
    update_job(job_id, state="cancelling")
    return jsonify(state="cancelling")


@app.post("/api/download/<job_id>/pause/<stream_type>")
def toggle_pause(job_id: str, stream_type: str):
    if stream_type not in {"video", "audio"}:
        return jsonify(error="Unknown download stream."), 400
    with jobs_lock:
        job = jobs.get(job_id)
        if job is None:
            return jsonify(error="Download job not found."), 404
        if job.get("state") in {"complete", "error", "processing"}:
            return jsonify(error="This download cannot be paused now."), 409
        key = f"{stream_type}_paused"
        job[key] = not job.get(key, False)
        return jsonify(paused=job[key], stream=stream_type)


@app.get("/api/download/<job_id>")
def download_status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if job is None:
        return jsonify(error="Download job not found."), 404
    response = {key: value for key, value in job.items() if key != "file"}
    if job.get("state") == "complete":
        response["download_url"] = f"/api/download/{job_id}/file"
    return jsonify(response)


@app.get("/api/download/<job_id>/file")
def get_download(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if not job or job.get("state") != "complete":
        return jsonify(error="This download is not ready."), 404
    path = Path(job["file"])
    safe_name = re.sub(r"[^\w .-]", "", path.name).strip() or "youtube-video.mp4"
    return send_file(path, as_attachment=True, download_name=safe_name)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
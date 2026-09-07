const form = document.querySelector("#download-form");
const input = document.querySelector("#url");
const button = document.querySelector("#submit-button");
const qualityPanel = document.querySelector("#quality-panel");
const videoThumbnail = document.querySelector("#video-thumbnail");
const qualitySelect = document.querySelector("#quality-select");
const downloadButton = document.querySelector("#download-button");
const audioOnlyButton = document.querySelector("#audio-only-button");
const audioFormatSelect = document.querySelector("#audio-format-select");
const cancelButton = document.querySelector("#cancel-button");
const pauseButtons = [document.querySelector("#video-pause-button"), document.querySelector("#audio-pause-button")];
const progressPanel = document.querySelector("#progress-panel");
const errorMessage = document.querySelector("#error-message");
const videoProgressBar = document.querySelector("#video-progress-bar");
const audioProgressBar = document.querySelector("#audio-progress-bar");
const videoPercent = document.querySelector("#video-percent");
const audioPercent = document.querySelector("#audio-percent");
const audioStreamProgress = document.querySelector("#audio-stream-progress");
const videoStreamProgress = document.querySelector("#video-stream-progress");
const statusLabel = document.querySelector("#status-label");
const speed = document.querySelector("#speed");
const eta = document.querySelector("#eta");
const languageSelect = document.querySelector("#language-select");

const translations = {
  en: { navNote: "YouTube & Instagram downloader", ready: "ready when you are", keep: "Download the good", parts: "parts.", intro: "Download videos and audio from YouTube or Instagram Reels in a clean, offline-ready format.", urlLabel: "YouTube or Instagram URL", fetch: "Fetch media", hint: "YouTube videos + Instagram Reels · up to 4K · MP4 or audio-only", videoFound: "Media found", videoQuality: "Video quality", audioQuality: "Audio quality", downloadAudio: "Download video with audio", audioOnly: "Audio only", preparing: "Preparing download", videoDownload: "Video download", audioDownload: "Audio download", save: "Save MP4 locally", permission: "For media you have permission to download.", local: "Local processing · nothing uploaded", withAudio: "MP4 with audio", pause: "Pause", resume: "Resume", starting: "Starting download", downloading: "Downloading video and audio", merging: "Merging video and audio", complete: "Download complete", cancel: "Cancel download" },
  es: { navNote: "utilidad multimedia personal", ready: "listo cuando quieras", keep: "Conserva las mejores", parts: "partes.", intro: "Pega un enlace de YouTube y obtén un MP4 con audio para guardarlo sin conexión.", urlLabel: "URL de YouTube", fetch: "Buscar video", hint: "Calidad de hasta 4K · MP4 + audio · un video a la vez", videoFound: "Video encontrado", chooseQuality: "Elige la calidad", downloadAudio: "Descargar con audio", preparing: "Preparando descarga", videoDownload: "Descarga de video", audioDownload: "Descarga de audio", save: "Guardar MP4 localmente", permission: "Para videos que tienes permiso de descargar.", local: "Procesamiento local · nada se sube", withAudio: "MP4 con audio", pause: "Pausar", resume: "Reanudar", starting: "Iniciando descarga", downloading: "Descargando video y audio", merging: "Uniendo video y audio", complete: "Descarga completa" },
  hi: { navNote: "व्यक्तिगत मीडिया उपयोगिता", ready: "जब आप तैयार हों", keep: "अच्छे", parts: "हिस्से रखें।", intro: "YouTube लिंक डालें और ऑडियो के साथ साफ MP4 ऑफलाइन सेव करें।", urlLabel: "YouTube URL", fetch: "वीडियो प्राप्त करें", hint: "4K तक गुणवत्ता · MP4 + ऑडियो · एक बार में एक वीडियो", videoFound: "वीडियो मिला", chooseQuality: "गुणवत्ता चुनें", downloadAudio: "ऑडियो के साथ डाउनलोड करें", preparing: "डाउनलोड तैयार हो रहा है", videoDownload: "वीडियो डाउनलोड", audioDownload: "ऑडियो डाउनलोड", save: "MP4 लोकल सेव करें", permission: "केवल वही वीडियो डाउनलोड करें जिसकी अनुमति है।", local: "लोकल प्रोसेसिंग · कुछ अपलोड नहीं होता", withAudio: "ऑडियो के साथ MP4", pause: "रोकें", resume: "जारी रखें", starting: "डाउनलोड शुरू हो रहा है", downloading: "वीडियो और ऑडियो डाउनलोड हो रहे हैं", merging: "वीडियो और ऑडियो जोड़े जा रहे हैं", complete: "डाउनलोड पूरा हुआ" },
  de: { navNote: "persönliches Medienwerkzeug", ready: "bereit, wenn du es bist", keep: "Behalte die guten", parts: "Momente.", intro: "Füge einen YouTube-Link ein und erhalte eine MP4-Datei mit Audio für offline.", urlLabel: "YouTube-URL", fetch: "Video abrufen", hint: "Bis zu 4K Qualität · MP4 + Audio · ein Video gleichzeitig", videoFound: "Video gefunden", chooseQuality: "Qualität auswählen", downloadAudio: "Mit Audio herunterladen", preparing: "Download wird vorbereitet", videoDownload: "Video-Download", audioDownload: "Audio-Download", save: "MP4 lokal speichern", permission: "Nur Videos herunterladen, für die du die Erlaubnis hast.", local: "Lokale Verarbeitung · nichts wird hochgeladen", withAudio: "MP4 mit Audio", pause: "Pause", resume: "Fortsetzen", starting: "Download wird gestartet", downloading: "Video und Audio werden heruntergeladen", merging: "Video und Audio werden zusammengeführt", complete: "Download abgeschlossen" },
  pt: { navNote: "utilitário de mídia pessoal", ready: "pronto quando você estiver", keep: "Guarde as melhores", parts: "partes.", intro: "Cole um link do YouTube e obtenha um MP4 com áudio para guardar offline.", urlLabel: "URL do YouTube", fetch: "Buscar vídeo", hint: "Qualidade de até 4K · MP4 + áudio · um vídeo por vez", videoFound: "Vídeo encontrado", chooseQuality: "Escolha a qualidade", downloadAudio: "Baixar com áudio", preparing: "Preparando download", videoDownload: "Download do vídeo", audioDownload: "Download do áudio", save: "Salvar MP4 localmente", permission: "Para vídeos que você tem permissão para baixar.", local: "Processamento local · nada é enviado", withAudio: "MP4 com áudio", pause: "Pausar", resume: "Retomar", starting: "Iniciando download", downloading: "Baixando vídeo e áudio", merging: "Combinando vídeo e áudio", complete: "Download concluído" },
  zh: { navNote: "个人媒体工具", ready: "随时准备就绪", keep: "保留精彩", parts: "片段。", intro: "粘贴 YouTube 链接，获取带音频的 MP4 文件以便离线观看。", urlLabel: "YouTube 链接", fetch: "获取视频", hint: "最高 4K 画质 · MP4 + 音频 · 一次一个视频", videoFound: "找到视频", chooseQuality: "选择画质", downloadAudio: "下载音频和视频", preparing: "正在准备下载", videoDownload: "视频下载", audioDownload: "音频下载", save: "保存 MP4 到本地", permission: "仅下载你有权下载的视频。", local: "本地处理 · 不会上传", withAudio: "带音频的 MP4", pause: "暂停", resume: "继续", starting: "开始下载", downloading: "正在下载视频和音频", merging: "正在合并视频和音频", complete: "下载完成" },
  ja: { navNote: "パーソナルメディアツール", ready: "準備完了", keep: "大切な", parts: "瞬間を保存。", intro: "YouTubeリンクを貼り付けて、音声付きMP4をオフライン用に保存します。", urlLabel: "YouTube URL", fetch: "動画を取得", hint: "最大4K画質 · MP4 + 音声 · 一度に1本", videoFound: "動画が見つかりました", chooseQuality: "画質を選択", downloadAudio: "音声付きでダウンロード", preparing: "ダウンロードを準備中", videoDownload: "動画ダウンロード", audioDownload: "音声ダウンロード", save: "MP4をローカルに保存", permission: "ダウンロードする権利のある動画のみ使用してください。", local: "ローカル処理 · アップロードなし", withAudio: "音声付きMP4", pause: "一時停止", resume: "再開", starting: "ダウンロード開始", downloading: "動画と音声をダウンロード中", merging: "動画と音声を結合中", complete: "ダウンロード完了" },
  ar: { navNote: "أداة وسائط شخصية", ready: "جاهز عندما تكون", keep: "احتفظ بأفضل", parts: "اللحظات.", intro: "الصق رابط YouTube واحصل على ملف MP4 مع الصوت للحفظ دون اتصال.", urlLabel: "رابط YouTube", fetch: "جلب الفيديو", hint: "جودة تصل إلى 4K · MP4 + صوت · فيديو واحد في كل مرة", videoFound: "تم العثور على الفيديو", chooseQuality: "اختر الجودة", downloadAudio: "تنزيل مع الصوت", preparing: "جارٍ تجهيز التنزيل", videoDownload: "تنزيل الفيديو", audioDownload: "تنزيل الصوت", save: "حفظ MP4 محليًا", permission: "استخدم فقط الفيديوهات المسموح لك بتنزيلها.", local: "معالجة محلية · لا يتم رفع شيء", withAudio: "MP4 مع الصوت", pause: "إيقاف مؤقت", resume: "استئناف", starting: "بدء التنزيل", downloading: "جارٍ تنزيل الفيديو والصوت", merging: "جارٍ دمج الفيديو والصوت", complete: "اكتمل التنزيل" },
  bn: { navNote: "ব্যক্তিগত মিডিয়া টুল", ready: "আপনি প্রস্তুত হলে তৈরি", keep: "ভালো", parts: "মুহূর্তগুলো রাখুন।", intro: "একটি YouTube লিংক পেস্ট করে অডিওসহ MP4 অফলাইনে সংরক্ষণ করুন।", urlLabel: "YouTube URL", fetch: "ভিডিও আনুন", hint: "সর্বোচ্চ 4K মান · MP4 + অডিও · একবারে একটি ভিডিও", videoFound: "ভিডিও পাওয়া গেছে", chooseQuality: "মান বেছে নিন", downloadAudio: "অডিওসহ ডাউনলোড", preparing: "ডাউনলোড প্রস্তুত হচ্ছে", videoDownload: "ভিডিও ডাউনলোড", audioDownload: "অডিও ডাউনলোড", save: "MP4 লোকালে সংরক্ষণ", permission: "যে ভিডিও ডাউনলোডের অনুমতি আছে শুধু সেগুলো ব্যবহার করুন।", local: "লোকাল প্রসেসিং · কিছু আপলোড হয় না", withAudio: "অডিওসহ MP4", pause: "বিরতি", resume: "চালু করুন", starting: "ডাউনলোড শুরু হচ্ছে", downloading: "ভিডিও ও অডিও ডাউনলোড হচ্ছে", merging: "ভিডিও ও অডিও যুক্ত হচ্ছে", complete: "ডাউনলোড সম্পন্ন" },
  ta: { navNote: "தனிப்பட்ட மீடியா கருவி", ready: "நீங்கள் தயாராக இருக்கும்போது", keep: "சிறந்த", parts: "பகுதிகளைச் சேமிக்கவும்.", intro: "YouTube இணைப்பை ஒட்டி, ஆடியோவுடன் MP4 கோப்பை ஆஃப்லைனில் சேமிக்கவும்.", urlLabel: "YouTube URL", fetch: "வீடியோவைப் பெறுக", hint: "4K வரை தரம் · MP4 + ஆடியோ · ஒரே நேரத்தில் ஒரு வீடியோ", videoFound: "வீடியோ கிடைத்தது", chooseQuality: "தரத்தைத் தேர்ந்தெடுக்கவும்", downloadAudio: "ஆடியோவுடன் பதிவிறக்கவும்", audioOnly: "ஆடியோ மட்டும்", preparing: "பதிவிறக்கம் தயாராகிறது", videoDownload: "வீடியோ பதிவிறக்கம்", audioDownload: "ஆடியோ பதிவிறக்கம்", save: "MP4-ஐ உள்ளூரில் சேமிக்கவும்", permission: "பதிவிறக்க அனுமதி உள்ள வீடியோக்களை மட்டும் பயன்படுத்தவும்.", local: "உள்ளூர் செயலாக்கம் · எதுவும் பதிவேற்றப்படவில்லை", withAudio: "ஆடியோவுடன் MP4", pause: "இடைநிறுத்து", resume: "தொடர்", starting: "பதிவிறக்கம் தொடங்குகிறது", downloading: "வீடியோவும் ஆடியோவும் பதிவிறக்கப்படுகின்றன", merging: "வீடியோவும் ஆடியோவும் இணைக்கப்படுகின்றன", complete: "பதிவிறக்கம் முடிந்தது" },
  fr: { navNote: "outil multimédia personnel", ready: "prêt quand vous l'êtes", keep: "Gardez les bons", parts: "moments.", intro: "Collez un lien YouTube et obtenez un MP4 avec audio à conserver hors ligne.", urlLabel: "URL YouTube", fetch: "Récupérer la vidéo", hint: "Qualité jusqu'à 4K · MP4 + audio · une vidéo à la fois", videoFound: "Vidéo trouvée", chooseQuality: "Choisir la qualité", downloadAudio: "Télécharger avec audio", preparing: "Préparation du téléchargement", videoDownload: "Téléchargement vidéo", audioDownload: "Téléchargement audio", save: "Enregistrer le MP4 localement", permission: "Pour les vidéos que vous êtes autorisé à télécharger.", local: "Traitement local · rien n'est envoyé", withAudio: "MP4 avec audio", pause: "Pause", resume: "Reprendre", starting: "Démarrage du téléchargement", downloading: "Téléchargement vidéo et audio", merging: "Fusion de la vidéo et de l'audio", complete: "Téléchargement terminé" }
};
let currentLanguage = localStorage.getItem("clipdrop-language") || "en";
languageSelect.value = currentLanguage;
const t = (key) => translations[currentLanguage][key] || translations.en[key] || (key === "audioOnly" ? "Audio only" : key === "audioSave" ? "Save audio locally" : key);
const applyLanguage = () => { document.documentElement.lang = currentLanguage; document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); }); };
applyLanguage();
languageSelect.addEventListener("change", () => { currentLanguage = languageSelect.value; localStorage.setItem("clipdrop-language", currentLanguage); applyLanguage(); });

progressPanel.hidden = true;
qualityPanel.hidden = true;
const setError = (message) => {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  progressPanel.hidden = true;
  document.querySelector("#download-link").hidden = true;
  cancelButton.hidden = true;
  qualityPanel.hidden = true;
  button.disabled = false;
  downloadButton.disabled = false;
  audioOnlyButton.disabled = false;
  button.querySelector("span").textContent = "Fetch video";
};

const pollJob = async (jobId) => {
  const response = await fetch(`/api/download/${jobId}`);
  const job = await response.json();
  if (!response.ok) throw new Error(job.error || "Could not read download status.");
  const videoValue = Math.round(job.video_percent || 0);
  const audioValue = Math.round(job.audio_percent || 0);
  audioStreamProgress.hidden = !job.audio_started;
  videoProgressBar.style.width = `${videoValue}%`;
  audioProgressBar.style.width = `${audioValue}%`;
  videoPercent.textContent = `${videoValue}%`;
  audioPercent.textContent = `${audioValue}%`;
  speed.textContent = job.speed || "";
  eta.textContent = job.eta ? `about ${job.eta}s remaining` : "";
  document.querySelector("#video-size").textContent = `${job.video_downloaded || "0 B"} / ${job.video_total || "calculating..."}`;
  document.querySelector("#audio-size").textContent = `${job.audio_downloaded || "0 B"} / ${job.audio_total || "calculating..."}`;
  statusLabel.textContent = job.state === "complete" ? t("complete") : job.state === "processing" ? t("merging") : job.state === "starting" ? t("starting") : t("downloading");
  pauseButtons.forEach((pauseButton) => {
    const stream = pauseButton.dataset.stream;
    pauseButton.textContent = job[`${stream}_paused`] ? t("resume") : t("pause");
    pauseButton.disabled = job.state === "processing" || job.state === "starting";
  });

  if (job.state === "complete") {
    const downloadLink = document.querySelector("#download-link");
    downloadLink.href = job.download_url;
    downloadLink.hidden = false;
    pauseButtons.forEach((pauseButton) => { pauseButton.disabled = true; });
    button.disabled = false;
    downloadButton.disabled = false;
    audioOnlyButton.disabled = false;
    cancelButton.hidden = true;
    loadHistory();
    button.querySelector("span").textContent = "Fetch video";
    return;
  }
  if (job.state === "error" || job.state === "cancelled") throw new Error(job.message || "The download was cancelled.");
  window.setTimeout(() => pollJob(jobId).catch((error) => setError(error.message)), 1000);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  qualityPanel.hidden = true;
  progressPanel.hidden = true;
  videoProgressBar.style.width = "0%";
  audioProgressBar.style.width = "0%";
  audioStreamProgress.hidden = true;
  videoStreamProgress.hidden = false;
  videoPercent.textContent = "0%";
  audioPercent.textContent = "0%";
  document.querySelector("#video-size").textContent = "0 B / calculating...";
  document.querySelector("#audio-size").textContent = "0 B / calculating...";
  document.querySelector("#download-link").hidden = true;
  statusLabel.textContent = t("preparing");
  button.disabled = true;
  button.querySelector("span").textContent = "Fetching...";
  try {
    const response = await fetch("/api/download", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: input.value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Enter a valid YouTube or Instagram Reel URL.");
    document.querySelector("#video-title").textContent = data.title;
    videoThumbnail.src = data.thumbnail || "";
    document.querySelector("#video-duration").textContent = data.duration ? `${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, "0")}` : "";
    qualitySelect.innerHTML = data.qualities.map((quality) => `<option value="${quality.height}">${quality.label} · ${t("withAudio")}</option>`).join("");
    qualityPanel.hidden = false;
    button.disabled = false;
    button.querySelector("span").textContent = "Fetch video";
  } catch (error) {
    setError(error.message);
  }
});

const startDownload = async (audioOnly) => {
  errorMessage.hidden = true;
  qualityPanel.hidden = true;
  progressPanel.hidden = false;
  document.querySelector("#download-link [data-i18n]").textContent = audioOnly ? t("audioSave") : t("save");
  videoStreamProgress.hidden = audioOnly;
  audioStreamProgress.hidden = true;
  downloadButton.disabled = true;
  audioOnlyButton.disabled = true;
  cancelButton.hidden = false;
  document.querySelector("#download-link").hidden = true;
  statusLabel.textContent = t("starting");
  try {
    const response = await fetch("/api/download/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: input.value, height: Number(qualitySelect.value), audio_only: audioOnly, audio_format: audioFormatSelect.value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not start the download.");
    pauseButtons.forEach((pauseButton) => { pauseButton.dataset.jobId = data.job_id; });
    cancelButton.dataset.jobId = data.job_id;
    await pollJob(data.job_id);
  } catch (error) {
    downloadButton.disabled = false;
    audioOnlyButton.disabled = false;
    setError(error.message);
  }
};

downloadButton.addEventListener("click", () => startDownload(false));
audioOnlyButton.addEventListener("click", () => startDownload(true));
cancelButton.addEventListener("click", async () => { if (!cancelButton.dataset.jobId) return; await fetch(`/api/download/${cancelButton.dataset.jobId}/cancel`, { method: "POST" }); cancelButton.hidden = true; statusLabel.textContent = "Download cancelled"; });

pauseButtons.forEach((pauseButton) => pauseButton.addEventListener("click", async () => {
  const jobId = pauseButton.dataset.jobId;
  const stream = pauseButton.dataset.stream;
  if (!jobId) return;
  pauseButtons.forEach((button) => { button.disabled = true; });
  try {
    const response = await fetch(`/api/download/${jobId}/pause/${stream}`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not change pause state.");
    pauseButton.textContent = data.paused ? t("resume") : t("pause");
    pauseButtons.forEach((button) => { button.disabled = false; });
  } catch (error) {
    setError(error.message);
  }
}));
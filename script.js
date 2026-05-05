const introVideo = document.querySelector("#introVideo");
const mainVideo = document.querySelector("#mainVideo");
const outroVideo = document.querySelector("#outroVideo");
const mainScroll = document.querySelector("#mainScroll");
const progressFill = document.querySelector("#progressFill");
const chapterNow = document.querySelector("#chapterNow");
const dockItems = [...document.querySelectorAll(".dock-item")];
const videos = [introVideo, mainVideo, outroVideo];

let mainDuration = 0;
let rafId = 0;
let activeVideo = introVideo;
let mainPlayedOnce = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function playSilently(video) {
  video.muted = true;
  const attempt = video.play();
  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(() => {});
  }
}

function measureMainProgress() {
  const rect = mainScroll.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - window.innerHeight);
  return clamp(-rect.top / scrollable, 0, 1);
}

function setVisibleVideo(progress) {
  const top = mainScroll.getBoundingClientRect().top;
  const bottom = mainScroll.getBoundingClientRect().bottom;
  const inMain = top <= window.innerHeight * 0.55 && bottom >= window.innerHeight * 0.45;
  const pastMain = bottom < window.innerHeight * 0.45;
  const nextVideo = inMain ? mainVideo : pastMain ? outroVideo : introVideo;

  videos.forEach((video) => {
    video.classList.toggle("is-visible", video === nextVideo);
  });

  if (nextVideo !== activeVideo) {
    if (nextVideo === introVideo || nextVideo === outroVideo) {
      nextVideo.currentTime = 0;
    } else if (nextVideo === mainVideo && !mainPlayedOnce) {
      mainVideo.currentTime = 0;
    }
    activeVideo = nextVideo;
  }

  if (activeVideo === introVideo) {
    playSilently(introVideo);
    outroVideo.pause();
    chapterNow.textContent = "01";
  } else if (activeVideo === outroVideo) {
    playSilently(outroVideo);
    introVideo.pause();
    chapterNow.textContent = "03";
  } else {
    introVideo.pause();
    outroVideo.pause();
    if (!mainPlayedOnce) {
      playSilently(mainVideo);
    }
    chapterNow.textContent = "02";
  }

  const chapterIndex = activeVideo === introVideo ? 0 : activeVideo === mainVideo ? 1 : 2;
  dockItems.forEach((item, index) => {
    item.classList.toggle("active", index % 3 === chapterIndex);
  });

  progressFill.style.width = `${Math.round(progress * 1000) / 10}%`;
}

function syncMainVideo() {
  const progress = measureMainProgress();
  setVisibleVideo(progress);

  rafId = requestAnimationFrame(syncMainVideo);
}

function primeVideo(video) {
  video.addEventListener("loadedmetadata", () => {
    if (video === mainVideo) {
      mainDuration = video.duration || 0;
      mainVideo.pause();
      mainVideo.currentTime = 0;
    }
  });
}

videos.forEach(primeVideo);
mainVideo.addEventListener("ended", () => {
  mainPlayedOnce = true;
  mainVideo.pause();
  if (mainDuration > 0) {
    mainVideo.currentTime = Math.max(0, mainDuration - 0.04);
  }
});
window.addEventListener("pointerdown", () => playSilently(activeVideo), { once: true });
window.addEventListener("touchstart", () => playSilently(activeVideo), { once: true, passive: true });
window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));

playSilently(introVideo);
syncMainVideo();

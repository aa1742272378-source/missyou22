const introVideo = document.querySelector("#introVideo");
const mainVideo = document.querySelector("#mainVideo");
const outroVideo = document.querySelector("#outroVideo");
const mainScroll = document.querySelector("#mainScroll");
const progressFill = document.querySelector("#progressFill");
const chapterNow = document.querySelector("#chapterNow");
const dockItems = [...document.querySelectorAll(".dock-item")];
const pageKicker = document.querySelector("#pageKicker");
const pageTitle = document.querySelector("#pageTitle");
const pageLead = document.querySelector("#pageLead");
const pageCta = document.querySelector("#pageCta");
const pageCtaText = pageCta.querySelector("span");
const pageScene = document.querySelector("#pageScene");
const statOneNumber = document.querySelector("#statOneNumber");
const statOneTitle = document.querySelector("#statOneTitle");
const statOneText = document.querySelector("#statOneText");
const statTwoNumber = document.querySelector("#statTwoNumber");
const statTwoTitle = document.querySelector("#statTwoTitle");
const statTwoText = document.querySelector("#statTwoText");
const videos = [introVideo, mainVideo, outroVideo];

const pageCopy = [
  {
    kicker: "HOME - 咖啡猫",
    title: "用猫的好奇心，<br />勾勒品牌的<br /><span>灵感瞬间</span>",
    lead: "不只是做设计，我们是在用“猫抓”般的精准度，为你捕捉市场最细腻的共鸣。",
    scene: "开启一天的元气，就像猫咪需要清晨的第一口热气。",
    cta: "开启灵感 (Start Meow)",
    href: "#mainScroll",
    stats: [
      ["50+", "品牌已上线", "就像抓到了50只蝴蝶一样兴奋。"],
      ["5+", "行业深耕", "比猫的一生还要专注。"],
    ],
  },
  {
    kicker: "PROCESS - 羽毛猫",
    title: "玩得 <span>认真</span>，<br />才能做得出彩",
    lead: "像猫咪追踪羽毛一样，我们对细节有着天生的执着。从像素到交互，每一次拨弄都是为了更完美的呈现。",
    scene: "像玩羽毛一样专注，探索每一个细节。",
    cta: "看看我们的“玩具” (Our Works)",
    href: "#outro",
    stats: [
      ["01", "从初创到成熟", "为野心勃勃的新品牌提供“猫薄荷”般的吸引力。"],
      ["02", "视觉与叙事", "把想象力搓成球，滚向无限可能的终点。"],
    ],
  },
  {
    kicker: "END - 睡觉猫",
    title: "剩下的，<br />交给 <span>好梦</span><br />去处理",
    lead: "当品牌有了清晰的灵魂，你也可以像它一样安心入睡。我们会一直守护在这里，直到下一个灵感醒来。",
    scene: "完美的交付，换来安稳的睡眠。",
    cta: "叫醒灵感 (Talk to Us)",
    href: "#intro",
    stats: [
      ["360", "全方位身份", "合伙人级的深度定制，让你的品牌自带“气场”。"],
      ["∞", "创造影响力", "我们不仅在做视觉，我们是在书写能够长久流传的“猫传”。"],
    ],
  },
];

let mainDuration = 0;
let rafId = 0;
let activeVideo = introVideo;
let mainPlayedOnce = false;
let activeCopyIndex = -1;

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

  const chapterIndex = activeVideo === introVideo ? 0 : activeVideo === mainVideo ? 1 : 2;
  updateCopy(chapterIndex);

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

  dockItems.forEach((item, index) => {
    item.classList.toggle("active", index % 3 === chapterIndex);
  });

  progressFill.style.width = `${Math.round(progress * 1000) / 10}%`;
}

function updateCopy(index) {
  if (index === activeCopyIndex) return;

  const copy = pageCopy[index];
  activeCopyIndex = index;
  pageKicker.textContent = copy.kicker;
  pageTitle.innerHTML = copy.title;
  pageLead.textContent = copy.lead;
  pageScene.textContent = copy.scene;
  pageCta.href = copy.href;
  pageCtaText.textContent = copy.cta;
  statOneNumber.textContent = copy.stats[0][0];
  statOneTitle.textContent = copy.stats[0][1];
  statOneText.textContent = copy.stats[0][2];
  statTwoNumber.textContent = copy.stats[1][0];
  statTwoTitle.textContent = copy.stats[1][1];
  statTwoText.textContent = copy.stats[1][2];
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

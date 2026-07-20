const body = document.body;
const introScreen = document.querySelector("[data-intro-screen]");
const introEnterButton = document.querySelector("[data-intro-enter]");
const header = document.querySelector("[data-header]");
const navbar = document.querySelector(".navbar");
const heroVideo = document.querySelector(".hero__video");
const dustLayer = document.querySelector(".dust-layer");
const scrollTrigger = document.querySelector("[data-scroll-trigger]");
const cursorDot = document.querySelector(".cursor--dot");
const cursorRing = document.querySelector(".cursor--ring");
const marqueeRevealItems = document.querySelectorAll("[data-marquee-reveal]");
const promoRevealItems = document.querySelectorAll("[data-promo-reveal]");
const arrivalsSection = document.querySelector(".arrivals");
const arrivalsRevealItems = document.querySelectorAll("[data-arrivals-reveal]");
const letterRevealItems = document.querySelectorAll("[data-letter-reveal]");
const vaultBridgeSection = document.querySelector("[data-vault-bridge]");
const lookbookSection = document.querySelector("[data-lookbook]");
const lookbookIntro = document.querySelector("[data-lookbook-intro]");
const lookbookSlides = document.querySelectorAll("[data-lookbook-slide]");
const vaultSection = document.querySelector("[data-vault]");
const vaultStage = document.querySelector("[data-vault-stage]");
const vaultSequence = document.querySelector("[data-vault-sequence]");
const vaultSequenceItems = vaultSection ? Array.from(vaultSection.querySelectorAll("[data-vault-sequence-item]")) : [];
const vaultSequenceVideos = vaultSection ? Array.from(vaultSection.querySelectorAll("[data-vault-sequence-video]")) : [];
const vaultGridCards = vaultSection ? Array.from(vaultSection.querySelectorAll("[data-vault-card]")) : [];
const vaultGridVideos = vaultSection ? Array.from(vaultSection.querySelectorAll("[data-vault-grid-video]")) : [];
const vaultSequenceCount = document.querySelector("[data-vault-sequence-count]");
const vaultSequenceTitle = document.querySelector("[data-vault-sequence-title]");
const interactiveElements = document.querySelectorAll("[data-cursor='grow'], a, button");
const vaultAssetManifest = {
  men: {
    poster: ["assets/vault/men-poster.jpg", "assets/vault/men-poster.jpeg", "men-poster.jpg", "men-poster.jpeg"],
    video: ["assets/vault/men.mp4"],
  },
  women: {
    poster: ["assets/vault/women-poster.jpg", "assets/vault/women-poster.jpeg", "women-poster.jpg", "women-poster.jpeg"],
    video: ["assets/vault/women.mp4"],
  },
  accessories: {
    poster: ["assets/vault/accessories-poster.jpg", "assets/vault/accessories-poster.jpeg", "accessories-poster.jpg", "accessories-poster.jpeg"],
    video: ["assets/vault/accessories.mp4"],
  },
  "new-arrivals": {
    poster: ["assets/vault/new-arrivals-poster.jpg", "assets/vault/new-arrivals-poster.jpeg", "new-arrivals-poster.jpg", "new-arrivals-poster.jpeg"],
    video: ["assets/vault/new-arrivals.mp4"],
  },
};

const cursorState = {
  enabled: window.matchMedia("(pointer:fine)").matches,
  currentX: window.innerWidth / 2,
  currentY: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
  ringX: window.innerWidth / 2,
  ringY: window.innerHeight / 2,
};
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches;

let siteRevealed = false;
let introCompleted = false;
let scrollTicking = false;
let lookbookInView = false;
let vaultInView = false;
let vaultGalleryCursor = null;
let vaultUsesGsapTimeline = false;
let vaultSequenceStarted = vaultSection?.classList.contains("is-complete") ?? false;
let vaultSequenceCompleted = vaultSection?.classList.contains("is-complete") ?? false;
let vaultSequenceRunId = 0;
let bootInitialized = false;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const mix = (start, end, amount) => start + ((end - start) * amount);
const normalizeRange = (value, start, end) => clamp((value - start) / Math.max(end - start, 0.0001), 0, 1);
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = (value) => (value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2);
const easeInOutSine = (value) => -(Math.cos(Math.PI * value) - 1) / 2;
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
const getPhaseOpacity = (value, fadeInEnd, fadeOutStart) => {
  if (value <= 0 || value >= 1) {
    return 0;
  }

  if (value < fadeInEnd) {
    return value / fadeInEnd;
  }

  if (value <= fadeOutStart) {
    return 1;
  }

  return 1 - ((value - fadeOutStart) / (1 - fadeOutStart));
};

const updateLayoutMetrics = () => {
  if (!header) {
    return;
  }

  document.documentElement.style.setProperty("--header-height", `${Math.ceil(header.offsetHeight)}px`);
};

const revealSite = () => {
  if (siteRevealed) {
    return;
  }

  siteRevealed = true;
  body.classList.remove("is-loading");
  body.classList.add("is-ready");
};

const setReadyState = () => revealSite();

const completeIntro = () => {
  if (!introScreen || introCompleted) {
    return;
  }

  introCompleted = true;
  introScreen.classList.add("is-entering");
  body.classList.add("is-intro-exit");

  window.setTimeout(() => {
    revealSite();
  }, 340);

  window.setTimeout(() => {
    body.classList.remove("is-intro-active", "is-intro-exit");
    body.classList.add("is-intro-complete");
    introScreen.classList.add("is-hidden");
  }, 1420);
};

const bindIntroScreen = () => {
  if (!introScreen || !introEnterButton || introScreen.classList.contains("is-hidden")) {
    body.classList.remove("is-intro-active", "is-intro-exit", "is-loading");
    body.classList.add("is-ready");
    setReadyState();
    return;
  }

  introEnterButton.addEventListener("click", completeIntro);
};

const createDustParticles = () => {
  const fragment = document.createDocumentFragment();

  const particleCount = window.innerWidth < 768 ? 12 : 18;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    particle.style.setProperty("--x", `${Math.random() * 100}%`);
    particle.style.setProperty("--y", `${Math.random() * 120 + 5}%`);
    particle.style.setProperty("--size", `${Math.random() * 2.2 + 1}px`);
    particle.style.setProperty("--duration", `${Math.random() * 26 + 22}s`);
    particle.style.setProperty("--delay", `${Math.random() * -24}s`);
    particle.style.setProperty("--drift", `${(Math.random() - 0.5) * 16}vw`);
    fragment.appendChild(particle);
  }

  dustLayer.appendChild(fragment);
};

const updateHeaderState = () => {
  const scrollY = window.scrollY;
  const maxScroll = Math.max(window.innerHeight * 0.7, 1);
  const progress = clamp(scrollY / maxScroll, 0, 1);
  const headerHideAnchor = vaultBridgeSection || vaultSection;
  const headerHideThreshold = headerHideAnchor
    ? Math.max(headerHideAnchor.offsetTop - header.offsetHeight - 24, 0)
    : Number.POSITIVE_INFINITY;
  const shouldHideHeader = scrollY >= headerHideThreshold;
  const lightSection = vaultBridgeSection || arrivalsSection;

  navbar.classList.toggle("is-scrolled", scrollY > 36);
  header.classList.toggle("is-scrolled", scrollY > 36);
  header.classList.toggle("is-hidden", shouldHideHeader);

  document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));
  document.documentElement.style.setProperty("--hero-scale", (1 + progress * 0.038).toFixed(4));
  document.documentElement.style.setProperty("--overlay-opacity", (0.62 + progress * 0.08).toFixed(3));
  document.documentElement.style.setProperty("--hero-brightness", (0.68 - progress * 0.08).toFixed(3));
  document.documentElement.style.setProperty("--hero-saturate", (1.08 + progress * 0.06).toFixed(3));

  if (lightSection) {
    const sectionTop = lightSection.offsetTop;
    const sectionHeight = lightSection.offsetHeight || 1;
    const sectionProgress = clamp((scrollY + window.innerHeight - sectionTop) / (sectionHeight + window.innerHeight), 0, 1);
    const lightSectionThreshold = sectionTop - Math.max(header.offsetHeight * 0.65, 110);

    if (arrivalsSection) {
      arrivalsSection.style.setProperty("--arrivals-progress", sectionProgress.toFixed(3));
    }
    navbar.classList.toggle("is-on-light-section", scrollY >= lightSectionThreshold);
    header.classList.toggle("is-on-light-section", scrollY >= lightSectionThreshold);
  }
};

const updateLookbookState = () => {
  if (!lookbookSection || !lookbookSlides.length) {
    return;
  }

  const sectionStart = lookbookSection.offsetTop;
  const scrollSpan = Math.max(lookbookSection.offsetHeight - window.innerHeight, 1);
  const progress = clamp((window.scrollY - sectionStart) / scrollSpan, 0, 1);
  const sequenceStart = 0.2;
  const sequenceEnd = 0.88;
  const sequenceProgress = clamp((progress - sequenceStart) / (sequenceEnd - sequenceStart), 0, 1);
  const sceneStep = 1 / lookbookSlides.length;
  const activeIndex = clamp(Math.floor(sequenceProgress * lookbookSlides.length), 0, lookbookSlides.length - 1);
  const introProgress = clamp(progress / 0.22, 0, 1);
  const exitProgress = clamp((progress - 0.945) / 0.055, 0, 1);
  const finalSceneProgress = clamp((progress - 0.8) / 0.15, 0, 1);

  lookbookSection.style.setProperty("--lookbook-progress", progress.toFixed(4));
  lookbookSection.style.setProperty("--lookbook-exit-opacity", exitProgress.toFixed(3));

  if (lookbookIntro) {
    lookbookIntro.style.opacity = (1 - introProgress * 1.08).toFixed(3);
    lookbookIntro.style.transform = `translate3d(0, ${(-introProgress * 46).toFixed(2)}px, 0) scale(${(1 - introProgress * 0.05).toFixed(3)})`;
    lookbookIntro.style.filter = `blur(${(introProgress * 12).toFixed(2)}px)`;
  }

  lookbookSlides.forEach((slide, index) => {
    const sceneStart = index * sceneStep;
    const sceneEnd = index === lookbookSlides.length - 1 ? 1 : sceneStart + sceneStep;
    const localProgress = clamp((sequenceProgress - sceneStart) / Math.max(sceneEnd - sceneStart, 0.0001), 0, 1);
    const isActive = index === activeIndex && progress >= sequenceStart;
    const isFinal = index === lookbookSlides.length - 1;

    let slideOpacity = 0;
    let slideY = 46;
    let slideBlur = 18;
    let wordOpacity = 0;
    let subOpacity = 0;
    let imageScale = 1.008;
    let imageBrightness = 0.74;
    let imageBlur = 2.6;
    let frameShiftY = 0;

    if (isActive) {
      slideOpacity = isFinal
        ? clamp(getPhaseOpacity(localProgress, 0.22, 1) + finalSceneProgress * 0.16, 0, 1)
        : getPhaseOpacity(localProgress, 0.22, 0.72);
      slideY = (1 - slideOpacity) * 34;
      slideBlur = (1 - slideOpacity) * 13;
      wordOpacity = isFinal
        ? getPhaseOpacity(localProgress, 0.22, 0.68)
        : getPhaseOpacity(localProgress, 0.24, 0.66);
      subOpacity = isFinal
        ? getPhaseOpacity(localProgress, 0.32, 0.74)
        : getPhaseOpacity(localProgress, 0.34, 0.76);
      imageScale = 1 + (slideOpacity * 0.015) + (isFinal ? finalSceneProgress * 0.05 : 0);
      imageBrightness = 0.78 + (slideOpacity * 0.14) - (isFinal ? finalSceneProgress * 0.14 : 0);
      imageBlur = ((1 - slideOpacity) * 1.2) + (isFinal ? finalSceneProgress * 1.7 : 0);
      frameShiftY = ((localProgress - 0.5) * -12) + (isFinal ? finalSceneProgress * -10 : 0);
    }

    slide.style.setProperty("--slide-opacity", slideOpacity.toFixed(3));
    slide.style.setProperty("--slide-y", `${slideY.toFixed(2)}px`);
    slide.style.setProperty("--slide-blur", `${slideBlur.toFixed(2)}px`);
    slide.style.setProperty("--frame-shift-y", `${frameShiftY.toFixed(2)}px`);
    slide.style.setProperty("--image-scale", imageScale.toFixed(3));
    slide.style.setProperty("--image-brightness", imageBrightness.toFixed(3));
    slide.style.setProperty("--image-blur", `${imageBlur.toFixed(2)}px`);
    slide.style.setProperty("--word-opacity", wordOpacity.toFixed(3));
    slide.style.setProperty("--word-y", `${((1 - wordOpacity) * 18).toFixed(2)}px`);
    slide.style.setProperty("--word-blur", `${((1 - wordOpacity) * 12).toFixed(2)}px`);
    slide.style.setProperty("--sub-opacity", subOpacity.toFixed(3));
    slide.style.setProperty("--sub-y", `${((1 - subOpacity) * 22).toFixed(2)}px`);

    if (isFinal) {
      slide.style.setProperty("--ending-opacity", finalSceneProgress.toFixed(3));
      slide.style.setProperty("--ending-y", `${((1 - finalSceneProgress) * 26).toFixed(2)}px`);
      slide.style.pointerEvents = finalSceneProgress > 0.42 ? "auto" : "none";
    } else {
      slide.style.setProperty("--ending-opacity", "0");
      slide.style.setProperty("--ending-y", "26px");
      slide.style.pointerEvents = slideOpacity > 0.42 ? "auto" : "none";
    }
  });
};

const setVaultSceneState = () => {};

const updateVaultTimeline = () => {};

const isVaultVideoReady = (video) => video?.dataset.ready === "true";

const tryVaultAssetCandidate = (element, candidates, attribute = "src") => {
  if (!element || !candidates?.length) {
    return;
  }

  const currentIndex = Number(element.dataset.assetCandidateIndex || 0);
  const nextIndex = currentIndex + 1;

  if (nextIndex >= candidates.length) {
    return;
  }

  element.dataset.assetCandidateIndex = nextIndex.toString();
  element.setAttribute(attribute, candidates[nextIndex]);

  if (element.tagName === "VIDEO") {
    element.dataset.loaded = "false";
    element.dataset.ready = "false";
    element.load();
  }
};

const bindVaultAssetRecovery = () => {
  if (!vaultSection) {
    return;
  }

  const vaultPosterImages = Array.from(vaultSection.querySelectorAll("img"));
  const vaultVideos = Array.from(vaultSection.querySelectorAll("video"));

  vaultPosterImages.forEach((posterImage) => {
    const key = posterImage.closest("[data-vault-sequence-item], [data-vault-card]")?.dataset.vaultSequenceItem
      || posterImage.closest("[data-vault-card]")?.dataset.vaultCard;
    const assetSet = key ? vaultAssetManifest[key] : null;

    if (!assetSet) {
      return;
    }

    posterImage.dataset.assetCandidateIndex = assetSet.poster.indexOf(posterImage.getAttribute("src")) >= 0
      ? assetSet.poster.indexOf(posterImage.getAttribute("src")).toString()
      : "0";

    posterImage.addEventListener("error", () => {
      tryVaultAssetCandidate(posterImage, assetSet.poster, "src");
    });
  });

  vaultVideos.forEach((video) => {
    const key = video.dataset.vaultSequenceVideo || video.dataset.vaultGridVideo;
    const assetSet = key ? vaultAssetManifest[key] : null;

    if (!assetSet) {
      return;
    }

    video.dataset.assetCandidateIndex = assetSet.video.indexOf(video.getAttribute("src")) >= 0
      ? assetSet.video.indexOf(video.getAttribute("src")).toString()
      : "0";

    video.addEventListener("error", () => {
      tryVaultAssetCandidate(video, assetSet.video, "src");
    });

    video.addEventListener("loadeddata", () => {
      video.dataset.ready = "true";
    });

    video.addEventListener("canplay", () => {
      video.dataset.ready = "true";
    });

    const source = video.querySelector("source");
    const currentSource = video.getAttribute("src") || source?.getAttribute("src");

    if (!currentSource) {
      if (source) {
        source.setAttribute("src", assetSet.video[0]);
      } else {
        video.setAttribute("src", assetSet.video[0]);
      }
    }
  });
};

const positionProductsAfterVault = () => {
  if (!vaultSection || !arrivalsSection) {
    return;
  }

  if (vaultSection.nextElementSibling !== arrivalsSection) {
    vaultSection.insertAdjacentElement("afterend", arrivalsSection);
  }
};

const bindVaultOpeningTimeline = () => {
  vaultUsesGsapTimeline = false;
};

const ensureVaultVideoLoaded = (video) => {
  if (!video || video.dataset.loaded === "true") {
    return;
  }

  video.preload = "auto";
  video.dataset.ready = "false";
  video.load();
  video.dataset.loaded = "true";
};

const pauseVaultVideo = (video) => {
  if (!video) {
    return;
  }

  video.pause();

  try {
    video.currentTime = 0;
  } catch {
    // Some browsers may block resetting currentTime before metadata is available.
  }
};

const pauseAllVaultVideos = () => {
  [...vaultSequenceVideos, ...vaultGridVideos].forEach((video) => {
    pauseVaultVideo(video);
  });
};

const playVaultGridVideos = () => {
  vaultGridVideos.forEach((video) => {
    ensureVaultVideoLoaded(video);
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");

    video.play().catch(() => {
      // Muted autoplay may still be blocked in some environments.
    });
  });
};

const clearVaultGalleryHover = () => {
  body.classList.remove("is-vault-gallery-hover");
  vaultGridCards.forEach((card) => {
    card.classList.remove("is-hovered");
  });
};

const updateVaultGalleryHoverState = (card, revealVideo) => {
  if (!card) {
    body.classList.remove("is-vault-gallery-hover");
    return;
  }

  card.classList.toggle("is-hovered", revealVideo);
  body.classList.toggle("is-vault-gallery-hover", revealVideo);
};

const updateVaultState = () => {
  if (!vaultSection) {
    return;
  }

  const target = vaultStage || vaultSection;
  const rect = target.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  const visibleRatio = visibleHeight > 0
    ? visibleHeight / Math.max(Math.min(rect.height, viewportHeight), 1)
    : 0;

  vaultInView = visibleRatio >= 0.18;

  if (!vaultInView) {
    clearVaultGalleryHover();
    pauseAllVaultVideos();
    return;
  }

  if (!vaultSequenceStarted && !vaultSequenceCompleted) {
    startVaultSequence();
    return;
  }

  if (vaultSequenceCompleted) {
    playVaultGridVideos();
  }
};

const setVaultSequenceCopy = (chapter) => {
  if (vaultSequenceCount) {
    vaultSequenceCount.textContent = chapter.count;
  }

  if (vaultSequenceTitle) {
    vaultSequenceTitle.textContent = chapter.title;
  }
};

const delay = (ms) => new Promise((resolve) => {
  window.setTimeout(resolve, ms);
});

const waitForVaultVideoReady = (video) => new Promise((resolve) => {
  if (!video || isVaultVideoReady(video) || video.readyState >= 2) {
    resolve();
    return;
  }

  const finalize = () => {
    video.removeEventListener("loadeddata", finalize);
    video.removeEventListener("canplay", finalize);
    resolve();
  };

  video.addEventListener("loadeddata", finalize, { once: true });
  video.addEventListener("canplay", finalize, { once: true });
});

const waitForVaultVideoEnd = (video) => new Promise((resolve) => {
  if (!video) {
    resolve();
    return;
  }

  let finished = false;
  const finalize = () => {
    if (finished) {
      return;
    }

    finished = true;
    video.removeEventListener("ended", finalize);
    resolve();
  };

  video.addEventListener("ended", finalize, { once: true });

  const fallback = Number.isFinite(video.duration) && video.duration > 0
    ? (video.duration * 1000) + 260
    : 5200;

  window.setTimeout(finalize, fallback);
});

const playVaultSequenceScene = async (item, runId) => {
  if (!item) {
    return;
  }

  const videos = Array.from(item.querySelectorAll("[data-vault-sequence-video]"));

  for (const video of videos) {
    ensureVaultVideoLoaded(video);
    await waitForVaultVideoReady(video);
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0;
  }

  item?.classList.add("is-playing");

  await Promise.all(
    videos.map(async (video) => {
      try {
        await video.play();
      } catch {
        // Muted autoplay may still fail in some environments; fallback to timed wait below.
      }
    })
  );

  await Promise.all(videos.map((video) => waitForVaultVideoEnd(video)));

  if (runId !== vaultSequenceRunId) {
    return;
  }

  item?.classList.remove("is-playing");
  videos.forEach((video) => {
    pauseVaultVideo(video);
  });
};

const activateVaultSequenceItem = (key) => {
  vaultSequenceItems.forEach((item) => {
    const isActive = item.dataset.vaultSequenceItem === key;
    item.classList.toggle("is-active", isActive);
    item.classList.remove("is-playing");

    if (!isActive) {
      item.querySelectorAll("[data-vault-sequence-video]").forEach((video) => {
        pauseVaultVideo(video);
      });
    }
  });
};

const revealVaultGrid = async (runId) => {
  if (!vaultSection || runId !== vaultSequenceRunId) {
    return;
  }

  vaultSection.classList.remove("is-door-open", "is-sequence-active");
  vaultSection.classList.add("is-grid-revealed", "is-complete");
  vaultSequenceCompleted = true;

  vaultGridCards.forEach((card, index) => {
    window.setTimeout(() => {
      if (runId !== vaultSequenceRunId) {
        return;
      }

      card.classList.add("is-visible");
    }, 160 + (index * 180));
  });

  window.setTimeout(() => {
    if (runId !== vaultSequenceRunId || !vaultInView) {
      return;
    }

    playVaultGridVideos();
  }, 220);
};

const startVaultSequence = async () => {
  if (!vaultSection || vaultSequenceStarted || vaultSequenceCompleted) {
    return;
  }

  vaultSequenceStarted = true;
  vaultSequenceRunId += 1;
  const runId = vaultSequenceRunId;
  const initialDelay = 420;
  const finalDelay = 520;
  const leadDelay = 160;
  const doorOpenDelay = 720;
  const doorCloseDelay = 520;

  vaultSection.classList.add("is-sequence-active");

  await delay(initialDelay);

  for (const chapter of vaultSequenceOrder) {
    if (runId !== vaultSequenceRunId) {
      return;
    }

    const sequenceItem = vaultSequenceItems.find((item) => item.dataset.vaultSequenceItem === chapter.key);
    setVaultSequenceCopy(chapter);
    activateVaultSequenceItem(chapter.key);

    await delay(leadDelay);
    vaultSection.classList.add("is-door-open");
    await delay(doorOpenDelay);

    if (runId !== vaultSequenceRunId) {
      return;
    }

    await playVaultSequenceScene(sequenceItem, runId);

    if (runId !== vaultSequenceRunId) {
      return;
    }

    vaultSection.classList.remove("is-door-open");
    await delay(doorCloseDelay);
  }

  if (runId !== vaultSequenceRunId) {
    return;
  }

  await delay(finalDelay);
  await revealVaultGrid(runId);
};

const animateCursor = () => {
  if (!cursorState.enabled) {
    return;
  }

  cursorState.currentX += (cursorState.targetX - cursorState.currentX) * 0.32;
  cursorState.currentY += (cursorState.targetY - cursorState.currentY) * 0.32;
  cursorState.ringX += (cursorState.targetX - cursorState.ringX) * 0.22;
  cursorState.ringY += (cursorState.targetY - cursorState.ringY) * 0.22;

  cursorDot.style.transform = `translate3d(${cursorState.currentX - 5}px, ${cursorState.currentY - 5}px, 0)`;
  cursorRing.style.transform = `translate3d(${cursorState.ringX - cursorRing.offsetWidth / 2}px, ${cursorState.ringY - cursorRing.offsetHeight / 2}px, 0)`;

  if (vaultGalleryCursor) {
    const cursorVisible = body.classList.contains("is-vault-gallery-hover");
    const cursorScale = cursorVisible ? 1.03 : 0.78;

    vaultGalleryCursor.style.opacity = cursorVisible ? "1" : "0";
    vaultGalleryCursor.style.transform = `translate3d(${cursorState.ringX - 45}px, ${cursorState.ringY - 45}px, 0) scale(${cursorScale.toFixed(3)})`;
  }

  window.requestAnimationFrame(animateCursor);
};

const bindCursor = () => {
  if (!cursorState.enabled) {
    return;
  }

  const hoverTargets = document.querySelectorAll("[data-cursor='grow'], a, button");

  cursorDot.classList.add("is-visible");
  cursorRing.classList.add("is-visible");

  vaultGalleryCursor = document.createElement("div");
  vaultGalleryCursor.className = "vault-gallery-cursor";
  vaultGalleryCursor.setAttribute("aria-hidden", "true");
  vaultGalleryCursor.innerHTML = '<span class="vault-gallery-cursor__label">VIEW</span>';
  body.appendChild(vaultGalleryCursor);

  window.addEventListener("mousemove", (event) => {
    cursorState.targetX = event.clientX;
    cursorState.targetY = event.clientY;
  });

  window.addEventListener("mousedown", () => {
    cursorRing.classList.add("is-hover");
  });

  window.addEventListener("mouseup", () => {
    cursorRing.classList.remove("is-hover");
  });

  document.addEventListener("mouseleave", () => {
    cursorDot.classList.remove("is-visible");
    cursorRing.classList.remove("is-visible");
  });

  document.addEventListener("mouseenter", () => {
    cursorDot.classList.add("is-visible");
    cursorRing.classList.add("is-visible");
  });

  hoverTargets.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursorRing.classList.add("is-hover");
    });

    element.addEventListener("mouseleave", () => {
      cursorRing.classList.remove("is-hover");
    });
  });

  window.requestAnimationFrame(animateCursor);
};

const bindVaultObserver = () => {
  if (!vaultSection) {
    return;
  }

  const observerTarget = vaultStage || vaultSection;

  const vaultObserver = new IntersectionObserver(
    (entries) => {
      vaultInView = entries.some((entry) => entry.isIntersecting);

      if (!vaultInView) {
        clearVaultGalleryHover();
        pauseAllVaultVideos();
        return;
      }

      if (!vaultSequenceStarted && !vaultSequenceCompleted) {
        startVaultSequence();
        return;
      }

      if (vaultSequenceCompleted) {
        playVaultGridVideos();
      }
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  vaultObserver.observe(observerTarget);
};

const bindVaultGalleries = () => {
  if (!vaultGridCards.length) {
    return;
  }

  vaultGridCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      if (!vaultSequenceCompleted) {
        return;
      }

      clearVaultGalleryHover();
      card.classList.add("is-hovered");
      updateVaultGalleryHoverState(card, true);
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-hovered");
      updateVaultGalleryHoverState(card, false);
    });
  });
};

const bindScrollIndicator = () => {
  if (!scrollTrigger) {
    return;
  }

  scrollTrigger.addEventListener("click", () => {
    window.scrollTo({
      top: window.innerHeight * 0.92,
      behavior: "smooth",
    });
  });
};

const bindArrivalsReveal = () => {
  if (!arrivalsRevealItems.length) {
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  arrivalsRevealItems.forEach((item) => {
    sectionObserver.observe(item);
  });
};

const prepareLetterReveal = () => {
  if (!letterRevealItems.length) {
    return;
  }

  letterRevealItems.forEach((item) => {
    if (item.dataset.letterReady === "true") {
      return;
    }

    const text = item.textContent ?? "";
    item.dataset.letterReady = "true";
    item.setAttribute("aria-label", text.trim());
    item.textContent = "";

    Array.from(text).forEach((character, index) => {
      const span = document.createElement("span");
      span.className = "letter-reveal__char";
      span.style.setProperty("--char-index", index.toString());
      span.textContent = character === " " ? "\u00A0" : character;
      item.appendChild(span);
    });
  });
};

const bindMarqueeReveal = () => {
  const revealTargets = [...marqueeRevealItems, ...promoRevealItems];

  if (!revealTargets.length) {
    return;
  }

  const marqueeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.35,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  revealTargets.forEach((item) => {
    marqueeObserver.observe(item);
  });
};

const bindLookbook = () => {
  if (!lookbookSection) {
    return;
  }

  const lookbookObserver = new IntersectionObserver(
    (entries) => {
      lookbookInView = entries.some((entry) => entry.isIntersecting);
      lookbookSection.classList.toggle("is-live", lookbookInView);
    },
    {
      threshold: 0.01,
      rootMargin: "200px 0px 200px 0px",
    }
  );

  lookbookObserver.observe(lookbookSection);

  if (!cursorState.enabled) {
    return;
  }

  lookbookSection.addEventListener("mousemove", (event) => {
    if (!lookbookInView) {
      return;
    }

    const bounds = lookbookSection.getBoundingClientRect();
    const offsetX = ((event.clientX - bounds.left) / bounds.width) - 0.5;
    const offsetY = ((event.clientY - bounds.top) / bounds.height) - 0.5;

    lookbookSection.style.setProperty("--lookbook-mouse-x", `${(offsetX * 32).toFixed(2)}px`);
    lookbookSection.style.setProperty("--lookbook-mouse-y", `${(offsetY * 32).toFixed(2)}px`);
  });

  lookbookSection.addEventListener("mouseleave", () => {
    lookbookSection.style.setProperty("--lookbook-mouse-x", "0px");
    lookbookSection.style.setProperty("--lookbook-mouse-y", "0px");
  });
};

const bindCollectionsTransition = () => {
  const section = document.querySelector("[data-collections-transition]");

  if (!section) {
    return;
  }

  const revealItems = Array.from(section.querySelectorAll("[data-collections-transition-reveal]"));
  if (prefersReducedMotion.matches || isTouchDevice) {
    section.classList.add("is-visible");
    revealItems.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "translate3d(0, 0, 0)";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        section.classList.add("is-visible");
        observer.disconnect();
      });
    },
    {
      threshold: 0.24,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  observer.observe(section);
};

const bindCollectionsCinema = () => {
  const section = document.querySelector("[data-collections-cinema]");
  const hud = section?.querySelector(".collections-cinema__hud");

  if (!section) {
    return;
  }

  const chapters = Array.from(section.querySelectorAll("[data-collection-chapter]"));
  const videos = Array.from(section.querySelectorAll("[data-collection-video]"));
  const links = Array.from(section.querySelectorAll("[data-collections-link]"));
  const activeNumber = section.querySelector("[data-collections-active-number]");
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (!chapters.length) {
    return;
  }

  if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  if (hud) {
    const syncHudVisibility = (visible) => {
      section.classList.toggle("is-hud-visible", visible);
    };

    if (typeof window.IntersectionObserver === "undefined") {
      syncHudVisibility(true);
    } else {
      const hudObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          syncHudVisibility(Boolean(entry?.isIntersecting));
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -6% 0px",
        }
      );

      hudObserver.observe(section);
    }
  }

  const setActiveChapter = (index) => {
    const safeIndex = clamp(index, 0, chapters.length - 1);

    chapters.forEach((chapter, chapterIndex) => {
      chapter.classList.toggle("is-active", chapterIndex === safeIndex);
    });

    links.forEach((link, linkIndex) => {
      link.classList.toggle("is-active", linkIndex === safeIndex);
    });

    if (activeNumber) {
      activeNumber.textContent = String(safeIndex + 1).padStart(2, "0");
    }
  };

  const playCollectionVideo = (video) => {
    if (!video) {
      return;
    }

    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");

    if (video.dataset.loaded !== "true") {
      video.load();
      video.dataset.loaded = "true";
    }

    video.play().catch(() => {
      // Muted autoplay may still fail in some environments.
    });
  };

  const pauseCollectionVideo = (video) => {
    if (!video) {
      return;
    }

    video.pause();
  };

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          playCollectionVideo(video);
        } else {
          pauseCollectionVideo(video);
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: "140px 0px 140px 0px",
    }
  );

  videos.forEach((video) => {
    video.preload = "metadata";
    videoObserver.observe(video);
  });

  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) {
        return;
      }

      const chapterIndex = chapters.indexOf(visibleEntries[0].target);
      if (chapterIndex >= 0) {
        setActiveChapter(chapterIndex);
      }
    },
    {
      threshold: [0.35, 0.5, 0.7],
      rootMargin: "-8% 0px -8% 0px",
    }
  );

  chapters.forEach((chapter) => {
    activeObserver.observe(chapter);

    if (!cursorState.enabled || prefersReducedMotion.matches || !hasGsap) {
      return;
    }

    const content = chapter.querySelector(".collection-chapter__content");
    const mediaWrap = chapter.querySelector(".collection-chapter__media-shell");
    const driftContentX = content ? window.gsap.quickTo(content, "x", { duration: 0.75, ease: "power3.out" }) : null;
    const driftContentY = content ? window.gsap.quickTo(content, "y", { duration: 0.75, ease: "power3.out" }) : null;
    const driftMediaX = mediaWrap ? window.gsap.quickTo(mediaWrap, "x", { duration: 0.9, ease: "power3.out" }) : null;
    const driftMediaY = mediaWrap ? window.gsap.quickTo(mediaWrap, "y", { duration: 0.9, ease: "power3.out" }) : null;

    chapter.addEventListener("mousemove", (event) => {
      const bounds = chapter.getBoundingClientRect();
      const offsetX = ((event.clientX - bounds.left) / bounds.width) - 0.5;
      const offsetY = ((event.clientY - bounds.top) / bounds.height) - 0.5;

      driftContentX?.(offsetX * 18);
      driftContentY?.(offsetY * -12);
      driftMediaX?.(offsetX * -22);
      driftMediaY?.(offsetY * -14);
    });

    chapter.addEventListener("mouseleave", () => {
      driftContentX?.(0);
      driftContentY?.(0);
      driftMediaX?.(0);
      driftMediaY?.(0);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  chapters.forEach((chapter) => {
    revealObserver.observe(chapter);
  });

  setActiveChapter(0);

  if (!hasGsap) {
    return;
  }

  const { gsap, ScrollTrigger } = window;

  if (prefersReducedMotion.matches || isTouchDevice) {
    gsap.set(section.querySelectorAll("[data-collection-reveal]"), { autoAlpha: 1, y: 0 });
    gsap.set(section.querySelectorAll("[data-collection-media]"), { clipPath: "inset(0 0 0 0)" });
    section.style.setProperty("--collections-progress", "1");
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      section.style.setProperty("--collections-progress", self.progress.toFixed(4));
    },
  });

  chapters.forEach((chapter, index) => {
    const media = chapter.querySelector("[data-collection-media]");
    const mediaWrap = chapter.querySelector(".collection-chapter__media-shell");
    const video = chapter.querySelector("[data-collection-video]");
    const content = chapter.querySelector(".collection-chapter__content");
    const reveals = chapter.querySelectorAll("[data-collection-reveal]");

    if (media) {
      gsap.fromTo(
        media,
        {
          clipPath: "inset(6% 2% 10% 2%)",
          y: 12,
          autoAlpha: 0.7,
        },
        {
          clipPath: "inset(0 0 0 0)",
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chapter,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        media,
        {
          yPercent: 0,
        },
        {
          yPercent: index === 2 ? 2.6 : 3.8,
          ease: "none",
          scrollTrigger: {
            trigger: chapter,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.05,
          },
        }
      );
    }

    if (reveals.length) {
      gsap.fromTo(
        reveals,
        {
          autoAlpha: 0,
          y: 28,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: chapter,
            start: "top 78%",
            once: true,
          },
        }
      );
    }

    if (content) {
      gsap.fromTo(
        content,
        {
          yPercent: index === 2 ? 2 : 0,
        },
        {
          yPercent: index === 2 ? -4 : -3,
          ease: "none",
          scrollTrigger: {
            trigger: chapter,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.05,
          },
        }
      );
    }

    if (video) {
      gsap.fromTo(
        video,
        {
          scale: 1.06,
        },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: chapter,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          },
        }
      );
    }

    if (mediaWrap) {
      gsap.fromTo(
        mediaWrap,
        {
          y: 0,
        },
        {
          y: index === 1 ? -10 : index === 3 ? 10 : -6,
          ease: "none",
          scrollTrigger: {
            trigger: chapter,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.3,
          },
        }
      );
    }

    ScrollTrigger.create({
      trigger: chapter,
      start: "top center",
      end: "bottom center",
      onEnter: () => setActiveChapter(index),
      onEnterBack: () => setActiveChapter(index),
    });
  });
};


const bestSellerSharedSizes = ["S", "M", "L", "XL", "XXL"];
const bestSellerSharedFeatures = [
  "Free Worldwide Shipping",
  "30-Day Returns",
  "2-Year Warranty",
  "Premium Materials"
];
const bestSellerFeatureIcons = [
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 8.5h11v7H3z"></path><path d="M14 10h3.6l2.4 2.6v2.9H14z"></path><circle cx="7.3" cy="18" r="1.5"></circle><circle cx="17.2" cy="18" r="1.5"></circle></svg>',
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7.5h10"></path><path d="M7 12h8"></path><path d="M7 16.5h6"></path><path d="M18 5v4h-4"></path><path d="M18 9a7 7 0 1 1-2.1-5"></path></svg>',
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.8 18.2 6v5.6c0 3.7-2.2 6.3-6.2 8.6-4-2.3-6.2-4.9-6.2-8.6V6z"></path><path d="m9.4 12.2 1.8 1.9 3.5-3.8"></path></svg>',
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.5 7.5c2.5-2.6 10.5-2.6 13 0"></path><path d="M4.8 12c2.9-2.2 11.5-2.2 14.4 0"></path><path d="M6.2 16.2c2.2-1.6 9.4-1.6 11.6 0"></path></svg>'
];
const bestSellerStarsMarkup = "&#9733;&#9733;&#9733;&#9733;&#9733;";
const bestSellersSource = [
  {
    id: "obsidian-tailored-suit",
    name: "Obsidian Tailored Suit",
    description: "Luxury formal tailoring refined with precise structure, quiet sheen and timeless evening confidence.",
    price: "$980",
    oldPrice: "$1,240",
    discount: "21% Off",
    reviewsCount: 24,
    image: "assets/images/suit_-removebg-preview.png",
    colors: ["#111111", "#3d3d3f", "#6b584a"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "Italian wool blend",
    stock: "Limited Availability",
    collection: "Best Sellers"
  },
  {
    id: "maison-white-shirt",
    name: "Maison White Shirt",
    description: "A crisp premium shirt shaped with clean lines, fluid drape and a quietly luxurious house finish.",
    price: "$340",
    oldPrice: "$420",
    discount: "19% Off",
    reviewsCount: 18,
    image: "assets/images/shirt-removebg-preview.png",
    colors: ["#f4f0e8", "#101010", "#9f9389"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "Premium cotton weave",
    stock: "In Stock",
    collection: "Best Sellers"
  },
  {
    id: "soft-structure-jersey",
    name: "Soft Structure Jersey",
    description: "Sport energy reimagined through soft structure, elevated comfort and a premium relaxed silhouette.",
    price: "$290",
    oldPrice: "$360",
    discount: "19% Off",
    reviewsCount: 32,
    image: "assets/images/jersey-removebg-preview.png",
    colors: ["#ece8e1", "#23262d"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "Premium stretch jersey",
    stock: "In Stock",
    collection: "Best Sellers"
  },
  {
    id: "noir-evening-dress",
    name: "Noir Evening Dress",
    description: "After-dark glamour expressed through sharp elegance, sculpted drama and a timeless couture line.",
    price: "$910",
    oldPrice: "$1,050",
    discount: "13% Off",
    reviewsCount: 15,
    image: "assets/images/black_dress-removebg-preview.png",
    colors: ["#0f0f10", "#94847b"],
    sizes: ["XS", "S", "M", "L", "XL"],
    material: "Fluid evening-weight fabric",
    stock: "Low Stock",
    collection: "Best Sellers"
  },
  {
    id: "rouge-silhouette-dress",
    name: "Rouge Silhouette Dress",
    description: "A cinematic statement dress cut for bold entrances, rich color depth and couture softness.",
    price: "$860",
    oldPrice: "$1,020",
    discount: "16% Off",
    reviewsCount: 21,
    image: "assets/images/red_dress-removebg-preview.png",
    colors: ["#751b25", "#240f12"],
    sizes: ["XS", "S", "M", "L"],
    material: "Signature evening drape",
    stock: "In Stock",
    collection: "Best Sellers"
  },
  {
    id: "midnight-pleated-trousers",
    name: "Midnight Pleated Trousers",
    description: "Modern essentials elevated with precise pleating, balanced structure and timeless versatility.",
    price: "$420",
    oldPrice: "$510",
    discount: "18% Off",
    reviewsCount: 12,
    image: "assets/images/bant-removebg-preview.png",
    colors: ["#16171a", "#93867d"],
    sizes: ["30", "32", "34", "36", "38"],
    material: "Premium pleated tailoring",
    stock: "In Stock",
    collection: "Best Sellers"
  }
];
const bestSellersData = bestSellersSource.map((product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  modalDescription: product.description,
  price: product.price,
  oldPrice: product.oldPrice,
  discount: product.discount,
  reviewsCount: product.reviewsCount,
  image: product.image,
  colors: product.colors,
  sizes: product.sizes.length ? product.sizes : bestSellerSharedSizes,
  features: bestSellerSharedFeatures,
  delivery: "Estimated Delivery: 3-7 Business Days",
  details: [product.material, product.stock, product.collection]
}));
const formatBestSellerReviews = (count) => `${count} Reviews`;
const buildBestSellerBadgeMarkup = (label, index) => `
  <div class="bs-badge">
    <span class="bs-badge__icon" aria-hidden="true">${bestSellerFeatureIcons[index] || ""}</span>
    <span>${label}</span>
  </div>
`;
const searchCatalog = [
  { name: "Obsidian Tailored Suit", collection: "Best Sellers", category: "Suits", priceText: "$980", image: "assets/images/suit_-removebg-preview.png", href: "#best-sellers-products", featured: true, keywords: ["suit", "tailored", "formal", "black"] },
  { name: "Maison White Shirt", collection: "Best Sellers", category: "Shirts", priceText: "$340", image: "assets/images/shirt-removebg-preview.png", href: "#best-sellers-products", featured: true, keywords: ["shirt", "white", "cotton"] },
  { name: "Soft Structure Jersey", collection: "Best Sellers", category: "Knitwear", priceText: "$290", image: "assets/images/jersey-removebg-preview.png", href: "#best-sellers-products", featured: true, keywords: ["jersey", "knitwear", "luxury"] },
  { name: "Noir Evening Dress", collection: "Best Sellers", category: "Dresses", priceText: "$910", image: "assets/images/black_dress-removebg-preview.png", href: "#best-sellers-products", featured: true, keywords: ["dress", "evening", "black"] },
  { name: "Executive Leather Backpack", collection: "Featured Collection", category: "Bags", priceText: "$620", image: "assets/images/bags_black-removebg-preview.png", href: "#collections", new: true, keywords: ["backpack", "bag", "leather"] },
  { name: "Wool Tailored Suit", collection: "Editorial Edit", category: "Suits", priceText: "$1,280", image: "assets/images/men_suit_black-removebg-preview.png", href: "#collections", keywords: ["suits", "wool", "tailored"] },
  { name: "Leather Jacket", collection: "Editorial Edit", category: "Jackets", priceText: "$980", image: "assets/images/men_jacket_black-removebg-preview.png", href: "#collections", keywords: ["jackets", "leather", "outerwear"] },
  { name: "Pique Polo Shirt", collection: "Editorial Edit", category: "Shirts", priceText: "$120", image: "assets/images/t_shirt_white-removebg-preview.png", href: "#collections", keywords: ["shirts", "polo", "cotton"] },
  { name: "Tailored Trousers", collection: "Editorial Edit", category: "Pants", priceText: "$420", image: "assets/images/pant_black-removebg-preview.png", href: "#collections", keywords: ["pants", "trousers", "tailored"] },
  { name: "Leather Loafers", collection: "Editorial Edit", category: "Shoes", priceText: "$360", image: "assets/images/shoes_black-removebg-preview.png", href: "#collections", keywords: ["shoes", "loafers", "leather"] },
  { name: "Square Sunglasses", collection: "Editorial Edit", category: "Accessories", priceText: "$210", image: "assets/images/glass_black-removebg-preview.png", href: "#collections", keywords: ["accessories", "sunglasses", "eyewear"] },
  { name: "Executive Backpack", collection: "Editorial Edit", category: "Bags", priceText: "$480", image: "assets/images/bags_black-removebg-preview.png", href: "#collections", new: true, keywords: ["bags", "backpack", "travel"] }
];
const searchTrendingProducts = searchCatalog.filter((product) => product.featured || product.new).slice(0, 4);
const normalizeSearchTerm = (value) => value.trim().toLowerCase();
const escapeSearchMarkup = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");
const hexToRgb = (hex) => {
  const cleanHex = String(hex || "").replace("#", "").trim();

  if (cleanHex.length !== 3 && cleanHex.length !== 6) {
    return null;
  }

  const normalizedHex = cleanHex.length === 3
    ? cleanHex.split("").map((value) => `${value}${value}`).join("")
    : cleanHex;
  const numeric = Number.parseInt(normalizedHex, 16);

  if (Number.isNaN(numeric)) {
    return null;
  }

  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255
  };
};

const getColorLabelFromHex = (hex) => {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return "Signature";
  }

  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;
  const average = (r + g + b) / 3;

  if (spread < 16) {
    if (average < 48) return "Noir";
    if (average < 100) return "Graphite";
    if (average < 190) return "Stone";
    return "Ivory";
  }

  if (r > 120 && g < 90 && b < 90) return "Rouge";
  if (r > g && g > b) return average < 120 ? "Espresso" : "Camel";
  if (b >= r && b > g) return average < 120 ? "Midnight" : "Slate";
  if (g > r && g > b) return "Olive";
  return "Signature";
};

const formatCartCategory = (value) => String(value || "Collection")
  .replace(/[-_]+/g, " ")
  .trim()
  .replace(/\b\w/g, (character) => character.toUpperCase());

const syncCartProductData = (element, product) => {
  window.LuxeCart?.setProductData(element, product);
  window.LuxeWishlist?.setProductData(element, product);
};

const bindBestSellers = () => {
  const section = document.querySelector('[data-bs-section]');
  const main = section?.querySelector('[data-bs-main]');
  const transitionSection = document.querySelector('[data-collections-transition]');
  const transitionItems = transitionSection ? Array.from(transitionSection.querySelectorAll('[data-collections-transition-reveal]')) : [];
  const transitionMedia = transitionSection?.querySelector('.collections-transition__media');
  const transitionSuit = transitionSection?.querySelector('[data-collections-transition-suit]');
  const heroWrapper = section?.querySelector('[data-bs-wrapper]');
  const heroImage = section?.querySelector('[data-bs-image]');
  const previewCards = section ? Array.from(section.querySelectorAll('.bs-preview')) : [];
  
  if (!section || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  if (isTouchDevice || prefersReducedMotion.matches) {
    section.classList.add("is-touch-safe");
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  let currentIndex = 0;
  let isTransitioning = false;
  const sectionElements = {
    label: section.querySelector('[data-bs-label]'),
    name: section.querySelector('[data-bs-name]'),
    desc: section.querySelector('[data-bs-description]'),
    pricing: section.querySelector('.bs-pricing'),
    price: section.querySelector('[data-bs-price]'),
    oldPrice: section.querySelector('[data-bs-old-price]'),
    discount: section.querySelector('[data-bs-discount]'),
    stars: section.querySelector('.bs-stars'),
    reviews: section.querySelector('[data-bs-reviews]'),
    image: section.querySelector('[data-bs-image]'),
    prevImg: section.querySelector('[data-bs-prev-preview] img'),
    nextImg: section.querySelector('[data-bs-next-preview] img'),
    numbers: section.querySelectorAll('.bs-number'),
    progress: section.querySelector('[data-bs-progress]'),
    sizes: section.querySelector('[data-bs-sizes]'),
    colors: section.querySelector('[data-bs-colors]'),
    quantity: section.querySelector('[data-bs-quantity]'),
    delivery: section.querySelector('[data-bs-delivery]'),
    details: section.querySelector('[data-bs-details]'),
    features: Array.from(section.querySelectorAll('[data-bs-feature]')),
    actions: section.querySelector('.bs-actions'),
    addToCart: section.querySelector('.bs-btn--primary'),
    buyNow: section.querySelector('[data-bs-buy-now]'),
    wishlist: section.querySelector('[data-bs-wishlist]'),
    quickView: section.querySelector('[data-bs-quick-view]'),
    sizeGuide: section.querySelector('[data-bs-size-guide]')
  };
  const bestSellerState = {
    sizeIndex: 1,
    colorIndex: 0,
    quantity: 1
  };
  let bestSellerModal = null;
  const bestSellerModalMotion = {
    duration: 620,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    isAnimating: false,
    scrollY: 0,
    trigger: null
  };

  const clearBestSellerMotionTimers = () => {
    if (bestSellerModalMotion.dialogTimer) {
      window.clearTimeout(bestSellerModalMotion.dialogTimer);
      bestSellerModalMotion.dialogTimer = 0;
    }

    if (bestSellerModalMotion.completeTimer) {
      window.clearTimeout(bestSellerModalMotion.completeTimer);
      bestSellerModalMotion.completeTimer = 0;
    }
  };

  const lockBestSellerScroll = () => {
    if (body.dataset.bestSellerScrollLocked === "true") {
      return;
    }

    bestSellerModalMotion.scrollY = window.scrollY || window.pageYOffset || 0;
    body.dataset.bestSellerScrollLocked = "true";
    body.style.position = "fixed";
    body.style.top = `-${bestSellerModalMotion.scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  };

  const unlockBestSellerScroll = () => {
    if (body.dataset.bestSellerScrollLocked !== "true") {
      return;
    }

    delete body.dataset.bestSellerScrollLocked;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    window.scrollTo(0, bestSellerModalMotion.scrollY || 0);
  };

  const scrubMorphClone = (node) => {
    if (!(node instanceof Element)) {
      return node;
    }

    node.removeAttribute("id");
    node.removeAttribute("data-cursor");
    node.removeAttribute("data-cart-add");
    node.removeAttribute("aria-pressed");
    node.removeAttribute("aria-label");
    node.setAttribute("aria-hidden", "true");

    node.querySelectorAll("[id]").forEach((child) => child.removeAttribute("id"));
    node.querySelectorAll("[data-cursor], [data-cart-add], [aria-pressed], [aria-label]").forEach((child) => {
      child.removeAttribute("data-cursor");
      child.removeAttribute("data-cart-add");
      child.removeAttribute("aria-pressed");
      child.removeAttribute("aria-label");
      child.setAttribute("aria-hidden", "true");
    });

    return node;
  };

  const getRect = (element) => {
    if (!(element instanceof Element)) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    return rect;
  };

  const buildFlipTransform = (startRect, endRect) => {
    const translateX = startRect.left - endRect.left;
    const translateY = startRect.top - endRect.top;
    const scaleX = startRect.width / endRect.width;
    const scaleY = startRect.height / endRect.height;
    return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`;
  };

  const createMorphPiece = (className, startNode, endNode) => {
    const startRect = getRect(startNode);
    const endRect = getRect(endNode);

    if (!startRect || !endRect) {
      return null;
    }

    const wrapper = document.createElement("div");
    wrapper.className = `best-sellers-modal__morph-piece ${className}`;
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.style.left = `${endRect.left}px`;
    wrapper.style.top = `${endRect.top}px`;
    wrapper.style.width = `${endRect.width}px`;
    wrapper.style.height = `${endRect.height}px`;
    wrapper.style.transform = buildFlipTransform(startRect, endRect);
    wrapper.style.opacity = "1";
    wrapper.style.transition = `transform ${bestSellerModalMotion.duration}ms ${bestSellerModalMotion.easing}, opacity ${bestSellerModalMotion.duration}ms ease`;

    const clone = scrubMorphClone(startNode.cloneNode(true));
    clone.classList.add("best-sellers-modal__morph-content");
    wrapper.appendChild(clone);

    return wrapper;
  };

  const createMorphShell = (startRect, endRect) => {
    if (!startRect || !endRect) {
      return null;
    }

    const shell = document.createElement("div");
    shell.className = "best-sellers-modal__morph-shell";
    shell.setAttribute("aria-hidden", "true");
    shell.style.left = `${endRect.left}px`;
    shell.style.top = `${endRect.top}px`;
    shell.style.width = `${endRect.width}px`;
    shell.style.height = `${endRect.height}px`;
    shell.style.transform = buildFlipTransform(startRect, endRect);
    shell.style.transition = `transform ${bestSellerModalMotion.duration}ms ${bestSellerModalMotion.easing}, opacity ${bestSellerModalMotion.duration}ms ease, border-radius ${bestSellerModalMotion.duration}ms ${bestSellerModalMotion.easing}`;
    return shell;
  };

  const getBestSellerSource = (trigger = null) => ({
    root: section.querySelector(".bs-container") || sectionElements.main || section,
    image: sectionElements.image,
    title: sectionElements.name,
    price: sectionElements.pricing,
    actions: sectionElements.actions,
    trigger: trigger instanceof HTMLElement ? trigger : sectionElements.quickView
  });

  const animateMorphPieces = (pieces) => {
    window.requestAnimationFrame(() => {
      pieces.forEach((piece) => {
        piece.style.transform = "translate3d(0, 0, 0) scale(1)";
        piece.style.opacity = "1";
      });
    });
  };

  const buildBestSellerCartProduct = (state) => {
    const product = bestSellersData[currentIndex];
    const size = product.sizes[state.sizeIndex] || product.sizes[0] || "One Size";
    const colorHex = product.colors[state.colorIndex] || "";
    const colorLabel = getColorLabelFromHex(colorHex);

    return {
      id: `best-seller-${currentIndex + 1}`,
      name: product.name,
      category: "Best Sellers",
      variant: `${size} / ${colorLabel}`,
      size,
      availableSizes: product.sizes,
      color: colorLabel,
      colorHex,
      price: product.price,
      priceText: product.price,
      image: product.image,
      description: product.modalDescription || product.description,
      href: "index.html#best-sellers-products",
      quantity: state.quantity
    };
  };

  const syncBestSellerCartData = () => {
    sectionElements.addToCart?.setAttribute("data-cart-add", "true");
    syncCartProductData(section, buildBestSellerCartProduct(bestSellerState));
    window.LuxeWishlist?.syncButton(sectionElements.wishlist);

    if (!bestSellerModal) {
      return;
    }

    bestSellerModal.addToCart?.setAttribute("data-cart-add", "true");
    syncCartProductData(bestSellerModal.root, buildBestSellerCartProduct(bestSellerModal.state));
  };

  const syncStateForProduct = (state, product, sourceState = null) => {
    state.sizeIndex = sourceState ? clamp(sourceState.sizeIndex, 0, product.sizes.length - 1) : clamp(1, 0, product.sizes.length - 1);
    state.colorIndex = sourceState ? clamp(sourceState.colorIndex, 0, product.colors.length - 1) : 0;
    state.quantity = sourceState ? Math.max(1, sourceState.quantity) : 1;
  };

  const setTemporaryButtonLabel = (button, label, duration = 1200) => {
    if (!button) {
      return;
    }

    const originalLabel = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = originalLabel;
    button.textContent = label;

    window.setTimeout(() => {
      button.textContent = originalLabel;
    }, duration);
  };

  const renderSizeOptions = (container, product, state, onChange) => {
    if (!container) {
      return;
    }

    const fragment = document.createDocumentFragment();

    product.sizes.forEach((size, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bs-size-chip${index === state.sizeIndex ? " is-active" : ""}`;
      button.textContent = size;
      button.setAttribute("aria-pressed", index === state.sizeIndex ? "true" : "false");
      button.addEventListener("click", () => {
        state.sizeIndex = index;
        onChange();
      });
      fragment.appendChild(button);
    });

    container.replaceChildren(fragment);
  };

  const renderColorOptions = (container, product, state, onChange) => {
    if (!container) {
      return;
    }

    const fragment = document.createDocumentFragment();

    product.colors.forEach((color, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bs-color-chip${index === state.colorIndex ? " is-active" : ""}`;
      button.setAttribute("aria-label", `Select color ${index + 1}`);
      button.setAttribute("aria-pressed", index === state.colorIndex ? "true" : "false");

      const swatch = document.createElement("span");
      swatch.className = "bs-color-chip__swatch";
      swatch.style.background = color;

      button.appendChild(swatch);
      button.addEventListener("click", () => {
        state.colorIndex = index;
        onChange();
      });
      fragment.appendChild(button);
    });

    container.replaceChildren(fragment);
  };

  const renderQuantitySelector = (container, state, onChange) => {
    if (!container) {
      return;
    }

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "bs-quantity-button";
    minus.textContent = "-";
    minus.addEventListener("click", () => {
      state.quantity = Math.max(1, state.quantity - 1);
      onChange();
    });

    const value = document.createElement("span");
    value.className = "bs-quantity-value";
    value.textContent = String(state.quantity).padStart(2, "0");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "bs-quantity-button";
    plus.textContent = "+";
    plus.addEventListener("click", () => {
      state.quantity += 1;
      onChange();
    });

    container.replaceChildren(minus, value, plus);
  };

  const renderDetailsList = (container, product) => {
    if (!container) {
      return;
    }

    const fragment = document.createDocumentFragment();

    product.details.forEach((detail) => {
      const item = document.createElement("li");
      item.textContent = detail;
      fragment.appendChild(item);
    });

    container.replaceChildren(fragment);
  };

  const renderSectionMeta = () => {
    const product = bestSellersData[currentIndex];

    if (sectionElements.stars) {
      sectionElements.stars.innerHTML = bestSellerStarsMarkup;
    }

    if (sectionElements.reviews) {
      sectionElements.reviews.textContent = formatBestSellerReviews(product.reviewsCount);
    }

    if (sectionElements.delivery) {
      sectionElements.delivery.textContent = product.delivery;
    }

    sectionElements.features.forEach((feature, index) => {
      feature.textContent = product.features[index] || "";
    });

    renderSizeOptions(sectionElements.sizes, product, bestSellerState, renderSectionMeta);
    renderColorOptions(sectionElements.colors, product, bestSellerState, renderSectionMeta);
    renderQuantitySelector(sectionElements.quantity, bestSellerState, renderSectionMeta);
    renderDetailsList(sectionElements.details, product);
    syncBestSellerCartData();
  };

  const ensureBestSellerModal = () => {
    if (bestSellerModal) {
      return bestSellerModal;
    }

    const modal = document.createElement("div");
    modal.className = "best-sellers-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="best-sellers-modal__backdrop" data-bs-modal-close></div>
      <div class="best-sellers-modal__morph" data-bs-modal-morph aria-hidden="true"></div>
      <div class="best-sellers-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="best-sellers-modal-title">
        <button class="best-sellers-modal__close" type="button" aria-label="Close quick view" data-bs-modal-close>&times;</button>
        <div class="best-sellers-modal__media">
          <div class="best-sellers-modal__glow"></div>
          <img class="best-sellers-modal__image" src="" alt="" data-bs-modal-image>
        </div>
        <div class="best-sellers-modal__content">
          <p class="best-sellers-modal__label" data-bs-modal-label></p>
          <h3 class="best-sellers-modal__title" id="best-sellers-modal-title" data-bs-modal-title></h3>
          <div class="best-sellers-modal__pricing">
            <span class="best-sellers-modal__price-current" data-bs-modal-price></span>
            <span class="best-sellers-modal__price-old" data-bs-modal-old-price></span>
            <span class="best-sellers-modal__discount" data-bs-modal-discount></span>
          </div>
          <div class="best-sellers-modal__rating">
            <span class="bs-stars" data-bs-modal-stars></span>
            <span class="best-sellers-modal__reviews" data-bs-modal-reviews></span>
          </div>
          <p class="best-sellers-modal__description" data-bs-modal-description></p>
          <div class="bs-purchase-meta best-sellers-modal__meta">
            <div class="bs-option-group">
              <span class="bs-option-label">Select Size</span>
              <div class="bs-size-options" data-bs-modal-sizes></div>
            </div>
            <div class="bs-option-group">
              <span class="bs-option-label">Select Color</span>
              <div class="bs-color-options" data-bs-modal-colors></div>
            </div>
            <div class="bs-option-group bs-option-group--inline">
              <span class="bs-option-label">Quantity</span>
              <div class="bs-quantity-selector" data-bs-modal-quantity></div>
            </div>
            <p class="bs-delivery" data-bs-modal-delivery></p>
            <a class="bs-size-guide" href="#" data-bs-modal-size-guide>View Size Guide</a>
            <ul class="bs-details" data-bs-modal-details></ul>
          </div>
          <div class="best-sellers-modal__actions">
            <button class="bs-btn bs-btn--primary" type="button" data-cart-add>Add To Cart</button>
            <button class="bs-btn bs-btn--glass" type="button" data-bs-modal-buy-now>Buy Now</button>
          </div>
          <div class="bs-badges best-sellers-modal__features" data-bs-modal-features></div>
        </div>
      </div>
    `;

    body.appendChild(modal);

    bestSellerModal = {
      root: modal,
      state: { sizeIndex: 1, colorIndex: 0, quantity: 1 },
      dialog: modal.querySelector('.best-sellers-modal__dialog'),
      backdrop: modal.querySelector('.best-sellers-modal__backdrop'),
      morph: modal.querySelector('[data-bs-modal-morph]'),
      image: modal.querySelector('[data-bs-modal-image]'),
      label: modal.querySelector('[data-bs-modal-label]'),
      title: modal.querySelector('[data-bs-modal-title]'),
      pricing: modal.querySelector('.best-sellers-modal__pricing'),
      price: modal.querySelector('[data-bs-modal-price]'),
      oldPrice: modal.querySelector('[data-bs-modal-old-price]'),
      discount: modal.querySelector('[data-bs-modal-discount]'),
      stars: modal.querySelector('[data-bs-modal-stars]'),
      reviews: modal.querySelector('[data-bs-modal-reviews]'),
      description: modal.querySelector('[data-bs-modal-description]'),
      sizes: modal.querySelector('[data-bs-modal-sizes]'),
      colors: modal.querySelector('[data-bs-modal-colors]'),
      quantity: modal.querySelector('[data-bs-modal-quantity]'),
      delivery: modal.querySelector('[data-bs-modal-delivery]'),
      sizeGuide: modal.querySelector('[data-bs-modal-size-guide]'),
      details: modal.querySelector('[data-bs-modal-details]'),
      features: modal.querySelector('[data-bs-modal-features]'),
      actions: modal.querySelector('.best-sellers-modal__actions'),
      addToCart: modal.querySelector('.bs-btn--primary'),
      buyNow: modal.querySelector('[data-bs-modal-buy-now]')
    };

    bestSellerModal.sizeGuide?.addEventListener('click', (event) => {
      event.preventDefault();
    });

    bestSellerModal.buyNow?.addEventListener('click', () => {
      setTemporaryButtonLabel(bestSellerModal.buyNow, "Checkout Ready");
    });

    return bestSellerModal;
  };

  const openBestSellerModalFallback = (modal, trigger = null) => {
    clearBestSellerMotionTimers();
    bestSellerModalMotion.isAnimating = false;
    bestSellerModalMotion.trigger = trigger instanceof HTMLElement ? trigger : sectionElements.quickView;
    modal.root.classList.remove('is-measuring', 'is-morphing');
    modal.root.classList.add('is-open', 'is-dialog-visible');
    modal.root.setAttribute('aria-hidden', 'false');
    modal.morph?.replaceChildren();
    lockBestSellerScroll();
    body.classList.add('is-best-sellers-modal-open');
  };

  const closeBestSellerModal = ({ immediate = false } = {}) => {
    if (!bestSellerModal) {
      return;
    }

    const modal = bestSellerModal;
    const isVisible = modal.root.classList.contains('is-open') || modal.root.classList.contains('is-measuring');
    if (!isVisible || bestSellerModalMotion.isAnimating) {
      return;
    }

    clearBestSellerMotionTimers();

    const finalizeClose = () => {
      modal.root.classList.remove('is-open', 'is-dialog-visible', 'is-morphing', 'is-measuring');
      modal.root.setAttribute('aria-hidden', 'true');
      modal.morph?.replaceChildren();
      body.classList.remove('is-best-sellers-modal-open');
      unlockBestSellerScroll();

      const trigger = bestSellerModalMotion.trigger;
      bestSellerModalMotion.trigger = null;
      bestSellerModalMotion.isAnimating = false;

      if (trigger instanceof HTMLElement) {
        window.requestAnimationFrame(() => {
          trigger.focus({ preventScroll: true });
        });
      }
    };

    if (immediate || prefersReducedMotion.matches) {
      finalizeClose();
      return;
    }

    const source = getBestSellerSource(bestSellerModalMotion.trigger);
    const shell = createMorphShell(getRect(modal.dialog), getRect(source.root));
    const pieces = [
      shell,
      createMorphPiece("best-sellers-modal__morph-piece--image", modal.image, source.image),
      createMorphPiece("best-sellers-modal__morph-piece--title", modal.title, source.title),
      createMorphPiece("best-sellers-modal__morph-piece--price", modal.pricing, source.price),
      createMorphPiece("best-sellers-modal__morph-piece--actions", modal.actions, source.actions)
    ].filter(Boolean);

    if (!pieces.length) {
      finalizeClose();
      return;
    }

    bestSellerModalMotion.isAnimating = true;
    modal.morph?.replaceChildren(...pieces);
    modal.root.classList.add('is-morphing');
    modal.root.classList.remove('is-dialog-visible');

    window.requestAnimationFrame(() => {
      modal.root.classList.remove('is-open');
      animateMorphPieces(pieces);
    });

    bestSellerModalMotion.completeTimer = window.setTimeout(finalizeClose, bestSellerModalMotion.duration + 80);
  };

  const bindBestSellerModalCloseActions = () => {
    const modal = ensureBestSellerModal();

    modal.root.querySelectorAll('[data-bs-modal-close]').forEach((element) => {
      element.addEventListener('click', () => {
        closeBestSellerModal();
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.root.classList.contains('is-open')) {
        closeBestSellerModal();
      }
    });
  };

  const renderBestSellerModal = () => {
    const modal = ensureBestSellerModal();
    const product = bestSellersData[currentIndex];

    modal.label.textContent = `BEST SELLER ${String(currentIndex + 1).padStart(2, '0')}`;
    modal.title.textContent = product.name;
    modal.price.textContent = product.price;
    modal.oldPrice.textContent = product.oldPrice;
    modal.discount.textContent = product.discount;
    modal.stars.innerHTML = bestSellerStarsMarkup;
    modal.reviews.textContent = formatBestSellerReviews(product.reviewsCount);
    modal.description.textContent = product.modalDescription || product.description;
    modal.image.src = product.image;
    modal.image.alt = product.name;
    modal.delivery.textContent = product.delivery;
    modal.features.innerHTML = product.features.map((feature, index) => buildBestSellerBadgeMarkup(feature, index)).join("");
    renderSizeOptions(modal.sizes, product, modal.state, renderBestSellerModal);
    renderColorOptions(modal.colors, product, modal.state, renderBestSellerModal);
    renderQuantitySelector(modal.quantity, modal.state, renderBestSellerModal);
    renderDetailsList(modal.details, product);
    syncBestSellerCartData();
  };

  const openBestSellerModal = (trigger = null) => {
    if (bestSellerModalMotion.isAnimating) {
      return;
    }

    const modal = ensureBestSellerModal();
    if (modal.root.classList.contains('is-open') || modal.root.classList.contains('is-measuring')) {
      return;
    }

    syncStateForProduct(modal.state, bestSellersData[currentIndex], bestSellerState);
    renderBestSellerModal();

    if (prefersReducedMotion.matches) {
      openBestSellerModalFallback(modal, trigger);
      return;
    }

    const source = getBestSellerSource(trigger);
    bestSellerModalMotion.trigger = source.trigger;
    clearBestSellerMotionTimers();

    modal.root.classList.add('is-measuring');
    modal.root.setAttribute('aria-hidden', 'false');

    const shell = createMorphShell(getRect(source.root), getRect(modal.dialog));
    const pieces = [
      shell,
      createMorphPiece("best-sellers-modal__morph-piece--image", source.image, modal.image),
      createMorphPiece("best-sellers-modal__morph-piece--title", source.title, modal.title),
      createMorphPiece("best-sellers-modal__morph-piece--price", source.price, modal.pricing),
      createMorphPiece("best-sellers-modal__morph-piece--actions", source.actions, modal.actions)
    ].filter(Boolean);

    if (!pieces.length) {
      modal.root.classList.remove('is-measuring');
      openBestSellerModalFallback(modal, trigger);
      return;
    }

    bestSellerModalMotion.isAnimating = true;
    modal.morph?.replaceChildren(...pieces);
    lockBestSellerScroll();
    body.classList.add('is-best-sellers-modal-open');
    modal.root.classList.remove('is-measuring');
    modal.root.classList.add('is-open', 'is-morphing');

    bestSellerModalMotion.dialogTimer = window.setTimeout(() => {
      modal.root.classList.add('is-dialog-visible');
    }, Math.round(bestSellerModalMotion.duration * 0.52));

    window.requestAnimationFrame(() => {
      animateMorphPieces(pieces);
    });

    bestSellerModalMotion.completeTimer = window.setTimeout(() => {
      modal.root.classList.remove('is-morphing');
      modal.root.classList.add('is-dialog-visible');
      modal.morph?.replaceChildren();
      bestSellerModalMotion.isAnimating = false;
    }, bestSellerModalMotion.duration + 80);
  };

  sectionElements.sizeGuide?.addEventListener('click', (event) => {
    event.preventDefault();
  });

  bindBestSellerModalCloseActions();

  sectionElements.quickView?.addEventListener('click', (event) => {
    openBestSellerModal(event.currentTarget);
  });
  sectionElements.buyNow?.addEventListener('click', () => {
    setTemporaryButtonLabel(sectionElements.buyNow, "Checkout Ready");
  });

  syncStateForProduct(bestSellerState, bestSellersData[currentIndex]);
  renderSectionMeta();

  const updateProduct = (index, direction = 1) => {
    if (isTransitioning) return;
    isTransitioning = true;

    currentIndex = (index + bestSellersData.length) % bestSellersData.length;
    const data = bestSellersData[currentIndex];

    sectionElements.numbers.forEach((n, i) => n.classList.toggle('is-active', i === currentIndex));
    if (sectionElements.progress) {
      sectionElements.progress.style.left = `${(currentIndex / bestSellersData.length) * 100}%`;
    }

    const tl = gsap.timeline({
      onComplete: () => { isTransitioning = false; }
    });

    tl.to([sectionElements.label, sectionElements.name, sectionElements.desc, sectionElements.price, sectionElements.oldPrice, sectionElements.discount, sectionElements.reviews], {
      y: -20,
      opacity: 0,
      duration: 0.3,
      stagger: 0.05
    });

    tl.to(sectionElements.image, {
      x: -100 * direction,
      opacity: 0,
      scale: 0.8,
      blur: 10,
      duration: 0.5,
      ease: "power3.in"
    }, 0);

    tl.add(() => {
      sectionElements.label.textContent = `BEST SELLER ${String(currentIndex + 1).padStart(2, '0')}`;
      sectionElements.name.textContent = data.name;
      sectionElements.desc.textContent = data.description;
      sectionElements.price.textContent = data.price;
      sectionElements.oldPrice.textContent = data.oldPrice;
      sectionElements.discount.textContent = data.discount;
      sectionElements.reviews.textContent = formatBestSellerReviews(data.reviewsCount);
      sectionElements.image.src = data.image;
      sectionElements.image.alt = data.name;
      
      const prevData = bestSellersData[(currentIndex - 1 + bestSellersData.length) % bestSellersData.length];
      const nextData = bestSellersData[(currentIndex + 1) % bestSellersData.length];
      sectionElements.prevImg.src = prevData.image;
      sectionElements.prevImg.alt = `${prevData.name} preview`;
      sectionElements.nextImg.src = nextData.image;
      sectionElements.nextImg.alt = `${nextData.name} preview`;

      syncStateForProduct(bestSellerState, data);
      renderSectionMeta();

      if (bestSellerModal?.root.classList.contains('is-open')) {
        syncStateForProduct(bestSellerModal.state, data, bestSellerState);
        renderBestSellerModal();
      }

      gsap.set(sectionElements.image, { x: 100 * direction, opacity: 0, scale: 0.8 });
    });

    tl.to([sectionElements.label, sectionElements.name, sectionElements.desc, sectionElements.price, sectionElements.oldPrice, sectionElements.discount, sectionElements.reviews], {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.05,
      ease: "power3.out"
    });

    tl.to(sectionElements.image, {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.4");
  };

  if (heroWrapper && !isTouchDevice && !prefersReducedMotion.matches) {
    gsap.to(heroWrapper, {
      y: -20,
      rotateX: 5,
      rotateY: 5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    section.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 40;
      const y = (clientY / innerHeight - 0.5) * 40;
      
      gsap.to(heroWrapper, {
        x: x,
        y: y,
        rotateY: x * 0.5,
        rotateX: -y * 0.5,
        duration: 1,
        ease: "power2.out"
      });
    });
  }

  if (main) {
    gsap.set(main, { autoAlpha: 0, y: 34 });
  }

  if (heroWrapper) {
    gsap.set(heroWrapper, { opacity: 0, y: 86, scale: 0.83, filter: "blur(18px)" });
  }

  if (heroImage) {
    gsap.set(heroImage, { opacity: 0, y: 120, scale: 0.72, rotateZ: -8, filter: "blur(16px)" });
  }

  if (previewCards.length) {
    gsap.set(previewCards, { opacity: 0, x: 34, y: 22, scale: 0.9, filter: "blur(10px)" });
  }

  const revealMain = () => {
    const infoItems = [
      section.querySelector('[data-bs-label]'),
      section.querySelector('[data-bs-name]'),
      section.querySelector('[data-bs-description]'),
      section.querySelector('[data-bs-price]'),
      section.querySelector('[data-bs-old-price]'),
      section.querySelector('[data-bs-discount]'),
      section.querySelector('[data-bs-reviews]'),
      ...Array.from(section.querySelectorAll('.bs-actions, .bs-badges'))
    ].filter(Boolean);

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    tl.to(main, {
      autoAlpha: 1,
      y: 0,
      duration: 0.78
    });

    if (infoItems.length) {
      tl.fromTo(infoItems, {
        opacity: 0,
        y: 24,
        filter: "blur(10px)"
      }, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.72,
        stagger: 0.05
      }, "-=0.42");
    }

    if (heroWrapper) {
      tl.fromTo(heroWrapper, {
        opacity: 0,
        y: 76,
        scale: 0.88,
        filter: "blur(14px)"
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.88
      }, "-=0.58");
    }

    if (heroImage) {
      tl.fromTo(heroImage, {
        opacity: 0,
        y: 96,
        scale: 0.78,
        rotateZ: -4,
        filter: "blur(14px)"
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateZ: 0,
        filter: "blur(0px)",
        duration: 0.96
      }, "-=0.72");
    }

    if (previewCards.length) {
      tl.fromTo(previewCards, {
        opacity: 0,
        x: 28,
        y: 18,
        scale: 0.92,
        filter: "blur(8px)"
      }, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.72,
        stagger: 0.1
      }, "-=0.54");
    }
  };

  section.querySelector('[data-bs-next]')?.addEventListener('click', () => updateProduct(currentIndex + 1, 1));
  section.querySelector('[data-bs-prev]')?.addEventListener('click', () => updateProduct(currentIndex - 1, -1));
  
  section.querySelectorAll('.bs-number').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      updateProduct(index, index > currentIndex ? 1 : -1);
    });
  });

  if (transitionSection && transitionItems?.length) {
    gsap.to(transitionItems, {
      opacity: 0,
      y: 30,
      filter: "blur(10px)",
      scale: 0.985,
      duration: 0.8,
      ease: "power2.inOut",
      stagger: 0.06,
      scrollTrigger: {
        trigger: transitionSection,
        start: "top top",
        end: "bottom 42%",
        scrub: 1
      }
    });

    if (transitionMedia) {
      gsap.to(transitionMedia, {
        yPercent: -4,
        scale: 1.02,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: transitionSection,
          start: "top top",
          end: "bottom 16%",
          scrub: 1
        }
      });
    }
  }

  if (transitionSuit && heroImage && transitionSection) {
    const syncSuitPath = () => {
      const heroRect = heroImage.getBoundingClientRect();
      const transitionRect = transitionSection.getBoundingClientRect();
      const startX = transitionRect.left + transitionRect.width * 0.5;
      const startY = transitionRect.top + transitionRect.height * 0.6;
      const targetX = heroRect.left + heroRect.width * 0.5;
      const targetY = heroRect.top + heroRect.height * 0.46;
      const startW = Math.min(250, transitionRect.width * 0.28);
      const targetW = Math.max(220, heroRect.width * 0.8);

      gsap.set(transitionSuit, {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.8,
        rotation: -7,
        filter: "blur(0px)",
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${startW}px`,
        transform: "translate(-50%, -50%)",
        position: "fixed"
      });

      const oldTrigger = ScrollTrigger.getById("best-sellers-suit-path");
      oldTrigger?.kill();
      gsap.killTweensOf(transitionSuit);

      const suitTimeline = gsap.timeline({
        scrollTrigger: {
          id: "best-sellers-suit-path",
          trigger: transitionSection,
          start: "top 10%",
          end: "bottom 10%",
          scrub: 1.05
        }
      });

      suitTimeline.to(transitionSuit, {
        opacity: 0.96,
        scale: 1.02,
        rotation: 1.5,
        left: `${targetX}px`,
        top: `${targetY}px`,
        width: `${targetW}px`,
        filter: "blur(0px)",
        ease: "power3.out"
      });

      suitTimeline.to(transitionSuit, {
        opacity: 0,
        scale: 0.92,
        rotation: 0,
        y: 18,
        filter: "blur(8px)",
        width: `${Math.max(200, targetW * 0.92)}px`,
        ease: "power2.in"
      }, ">-=0.14");
    };

    syncSuitPath();
    window.addEventListener("resize", syncSuitPath);
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top 78%",
    onEnter: () => revealMain(),
    once: true
  });

  window.addEventListener('keydown', (e) => {
    if (!ScrollTrigger.isInViewport(section)) return;
    if (e.key === 'ArrowRight') updateProduct(currentIndex + 1, 1);
    if (e.key === 'ArrowLeft') updateProduct(currentIndex - 1, -1);
  });

  let wheelTimeout;
  section.addEventListener('wheel', (e) => {
    if (isTransitioning) return;
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      if (e.deltaY > 0) updateProduct(currentIndex + 1, 1);
      else updateProduct(currentIndex - 1, -1);
    }, 100);
  }, { passive: true });

  let touchStartX = 0;
  section.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  section.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) updateProduct(currentIndex + 1, 1);
      else updateProduct(currentIndex - 1, -1);
    }
  }, { passive: true });
};

const bindFinalCinemaFooter = () => {
  const section = document.querySelector("[data-final-cinema]");
  const revealItems = Array.from(document.querySelectorAll("[data-final-cinema-reveal]"));
  const footer = document.querySelector("[data-footer-luxe]");
  const footerItems = footer
    ? [
        footer.querySelector(".site-footer-luxe__brand"),
        ...Array.from(footer.querySelectorAll(".site-footer-luxe__column")),
        footer.querySelector(".site-footer-luxe__bottom"),
        footer.querySelector(".site-footer-luxe__credit")
      ].filter(Boolean)
    : [];
  const video = section?.querySelector(".final-cinema__video");

  if (!section && !footer) {
    return;
  }

  const revealFinalContent = () => {
    revealItems.forEach((item, index) => {
      item.style.opacity = "1";
      item.style.transform = "translate3d(0, 0, 0)";
      item.style.transition = `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.08}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.08}s`;
    });

    if (video instanceof HTMLVideoElement) {
      video.play().catch(() => {
        // Autoplay can still be blocked on some devices.
      });
    }
  };

  const revealFooter = () => {
    footerItems.forEach((item, index) => {
      item.style.opacity = "1";
      item.style.transform = "translate3d(0, 0, 0)";
      item.style.transition = `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.07}s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.07}s`;
    });
  };

  if (window.ScrollTrigger && section) {
    ScrollTrigger.create({
      trigger: section,
      start: "top 72%",
      once: true,
      onEnter: revealFinalContent
    });
  } else if (section) {
    if ("IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealFinalContent();
            sectionObserver.disconnect();
          }
        });
      }, { threshold: 0.18 });

      sectionObserver.observe(section);
    } else {
      revealFinalContent();
    }
  }

  if (window.ScrollTrigger && footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: "top 80%",
      once: true,
      onEnter: revealFooter
    });
  } else if (footer) {
    if ("IntersectionObserver" in window) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealFooter();
            footerObserver.disconnect();
          }
        });
      }, { threshold: 0.1 });

      footerObserver.observe(footer);
    } else {
      revealFooter();
    }
  }
};

const bindRefSection = () => {
  const tabs = Array.from(document.querySelectorAll("[data-ref-tab]"));
  const cards = Array.from(document.querySelectorAll("[data-ref-card]"));
  const statValues = Array.from(document.querySelectorAll("[data-ref-stat-value]"));
  const featured = document.querySelector(".ref-featured__content");
  const stageImage = document.querySelector("[data-ref-stage-image]");
  const stageLabel = document.querySelector("[data-ref-stage-label]");
  const stageCounter = document.querySelector("[data-ref-stage-counter]");
  const thumbs = Array.from(document.querySelectorAll("[data-ref-thumb]"));

  if (!tabs.length && !cards.length && !featured && !statValues.length) {
    return;
  }

  const parsePriceValue = (value) => Number.parseFloat(String(value || "").replace(/,/g, "").replace(/[^\d.]/g, "")) || 0;
  const resolveDefaultSize = (category) => {
    if (category === "pants") {
      return "32";
    }

    if (category === "shoes") {
      return "42";
    }

    if (category === "bags" || category === "accessories") {
      return "One Size";
    }

    return "M";
  };
  const resolveSizes = (category) => {
    if (category === "pants") {
      return ["30", "32", "34", "36"];
    }

    if (category === "shoes") {
      return ["40", "41", "42", "43"];
    }

    if (category === "bags" || category === "accessories") {
      return ["One Size"];
    }

    return ["S", "M", "L", "XL"];
  };
  const firstSwatchColor = (root) => {
    const swatch = root.querySelector("[style*='--swatch']");
    const value = swatch?.getAttribute("style") || "";
    const match = value.match(/--swatch:\s*([^;]+)/i);
    return match?.[1]?.trim() || "#111111";
  };
  const buildProductFromCard = (card) => {
    const name = card.querySelector("h3")?.textContent?.trim() || "LUXE Piece";
    const variant = card.querySelector("p")?.textContent?.trim() || "Signature selection";
    const priceText = card.querySelector("strong")?.textContent?.trim() || "$0";
    const image = card.querySelector("img")?.getAttribute("src") || "";
    const category = card.dataset.category || "collection";
    const size = resolveDefaultSize(category);
    const colors = Array.from(card.querySelectorAll("[style*='--swatch']")).map((swatch) => {
      const style = swatch.getAttribute("style") || "";
      const match = style.match(/--swatch:\s*([^;]+)/i);
      return match?.[1]?.trim() || "#111111";
    });

    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      category: variant,
      collection: category.charAt(0).toUpperCase() + category.slice(1),
      variant,
      price: parsePriceValue(priceText),
      image,
      size,
      color: "Signature",
      colorHex: firstSwatchColor(card),
      colors: colors.length ? colors : [firstSwatchColor(card)],
      description: variant,
      href: "#collections",
      availableSizes: resolveSizes(category)
    };
  };
  const formatQuickViewPrice = (value) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value || 0);
  const renderQuickViewSizes = (container, product, state, onChange) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.innerHTML = "";
    product.availableSizes.forEach((size, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bs-size-chip${index === state.sizeIndex ? " is-active" : ""}`;
      button.textContent = size;
      button.setAttribute("aria-pressed", String(index === state.sizeIndex));
      button.addEventListener("click", () => {
        state.sizeIndex = index;
        onChange();
      });
      container.appendChild(button);
    });
  };
  const renderQuickViewColors = (container, product, state, onChange) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.innerHTML = "";
    product.colors.forEach((colorHex, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bs-color-chip${index === state.colorIndex ? " is-active" : ""}`;
      button.setAttribute("aria-label", `Select color ${index + 1}`);
      button.setAttribute("aria-pressed", String(index === state.colorIndex));

      const swatch = document.createElement("span");
      swatch.className = "bs-color-chip__swatch";
      swatch.style.background = colorHex;
      button.appendChild(swatch);

      button.addEventListener("click", () => {
        state.colorIndex = index;
        onChange();
      });

      container.appendChild(button);
    });
  };
  const renderQuickViewQuantity = (container, state, onChange) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.innerHTML = "";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "bs-quantity-button";
    minus.textContent = "-";
    minus.addEventListener("click", () => {
      state.quantity = Math.max(1, state.quantity - 1);
      onChange();
    });

    const value = document.createElement("span");
    value.className = "bs-quantity-value";
    value.textContent = String(state.quantity).padStart(2, "0");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "bs-quantity-button";
    plus.textContent = "+";
    plus.addEventListener("click", () => {
      state.quantity += 1;
      onChange();
    });

    container.append(minus, value, plus);
  };
  const renderQuickViewDetails = (container, product) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.innerHTML = `
      <li>${escapeSearchMarkup(product.variant)}</li>
      <li>${escapeSearchMarkup(product.collection)}</li>
      <li>${escapeSearchMarkup(product.availableSizes.join(" / "))}</li>
    `;
  };
  let refQuickView = null;
  const ensureRefQuickView = () => {
    if (refQuickView) {
      return refQuickView;
    }

    const modal = document.createElement("div");
    modal.className = "luxe-quick-view best-sellers-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="best-sellers-modal__backdrop" data-ref-quick-close></div>
      <div class="best-sellers-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="ref-quick-view-title">
        <button class="best-sellers-modal__close" type="button" aria-label="Close quick view" data-ref-quick-close>&times;</button>
        <div class="best-sellers-modal__media">
          <div class="best-sellers-modal__glow"></div>
          <img class="best-sellers-modal__image" src="" alt="" data-ref-quick-image>
        </div>
        <div class="best-sellers-modal__content">
          <p class="best-sellers-modal__label" data-ref-quick-label></p>
          <h3 class="best-sellers-modal__title" id="ref-quick-view-title" data-ref-quick-title></h3>
          <div class="best-sellers-modal__pricing">
            <span class="best-sellers-modal__price-current" data-ref-quick-price></span>
          </div>
          <p class="best-sellers-modal__description" data-ref-quick-description></p>
          <div class="bs-purchase-meta best-sellers-modal__meta">
            <div class="bs-option-group">
              <span class="bs-option-label">Select Size</span>
              <div class="bs-size-options" data-ref-quick-sizes></div>
            </div>
            <div class="bs-option-group">
              <span class="bs-option-label">Select Color</span>
              <div class="bs-color-options" data-ref-quick-colors></div>
            </div>
            <div class="bs-option-group bs-option-group--inline">
              <span class="bs-option-label">Quantity</span>
              <div class="bs-quantity-selector" data-ref-quick-quantity></div>
            </div>
            <p class="bs-delivery">Estimated Delivery: 3-7 Business Days</p>
            <ul class="bs-details" data-ref-quick-details></ul>
          </div>
          <div class="best-sellers-modal__actions">
            <button class="bs-btn bs-btn--primary" type="button" data-ref-quick-add data-cart-add>Add To Cart</button>
            <button class="bs-btn bs-btn--glass" type="button" data-ref-quick-save>Save To Wishlist</button>
          </div>
        </div>
      </div>
    `;

    body.appendChild(modal);

    refQuickView = {
      root: modal,
      dialog: modal.querySelector(".best-sellers-modal__dialog"),
      image: modal.querySelector("[data-ref-quick-image]"),
      label: modal.querySelector("[data-ref-quick-label]"),
      title: modal.querySelector("[data-ref-quick-title]"),
      price: modal.querySelector("[data-ref-quick-price]"),
      description: modal.querySelector("[data-ref-quick-description]"),
      sizes: modal.querySelector("[data-ref-quick-sizes]"),
      colors: modal.querySelector("[data-ref-quick-colors]"),
      quantity: modal.querySelector("[data-ref-quick-quantity]"),
      details: modal.querySelector("[data-ref-quick-details]"),
      add: modal.querySelector("[data-ref-quick-add]"),
      save: modal.querySelector("[data-ref-quick-save]"),
      state: { sizeIndex: 0, colorIndex: 0, quantity: 1 },
      product: null,
      trigger: null
    };

    modal.querySelectorAll("[data-ref-quick-close]").forEach((node) => {
      node.addEventListener("click", () => {
        modal.classList.remove("is-open", "is-dialog-visible");
        modal.setAttribute("aria-hidden", "true");
        body.classList.remove("is-ref-quick-view-open");
        const trigger = refQuickView?.trigger;
        refQuickView.trigger = null;
        if (trigger instanceof HTMLElement) {
          trigger.focus({ preventScroll: true });
        }
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        modal.classList.remove("is-open", "is-dialog-visible");
        modal.setAttribute("aria-hidden", "true");
        body.classList.remove("is-ref-quick-view-open");
      }
    });

    refQuickView.save?.addEventListener("click", () => {
      if (!refQuickView?.product) {
        return;
      }

      const selectedSize = refQuickView.product.availableSizes[refQuickView.state.sizeIndex] || refQuickView.product.size;
      const colorHex = refQuickView.product.colors[refQuickView.state.colorIndex] || refQuickView.product.colorHex;
      const product = {
        ...refQuickView.product,
        size: selectedSize,
        colorHex,
        color: getColorLabelFromHex(colorHex)
      };

      window.LuxeWishlist?.addItem(product);
      if (refQuickView.save instanceof HTMLElement) {
        refQuickView.save.textContent = "Saved";
      }
    });

    return refQuickView;
  };
  const renderRefQuickView = () => {
    const modal = ensureRefQuickView();
    const product = modal.product;
    if (!product) {
      return;
    }

    const selectedColor = product.colors[modal.state.colorIndex] || product.colorHex || "#111111";
    const selectedSize = product.availableSizes[modal.state.sizeIndex] || product.size || "One Size";

    if (modal.image instanceof HTMLImageElement) {
      modal.image.src = product.image;
      modal.image.alt = product.name;
    }
    if (modal.label instanceof HTMLElement) {
      modal.label.textContent = product.collection;
    }
    if (modal.title instanceof HTMLElement) {
      modal.title.textContent = product.name;
    }
    if (modal.price instanceof HTMLElement) {
      modal.price.textContent = formatQuickViewPrice(product.price);
    }
    if (modal.description instanceof HTMLElement) {
      modal.description.textContent = product.description;
    }

    renderQuickViewSizes(modal.sizes, product, modal.state, renderRefQuickView);
    renderQuickViewColors(modal.colors, product, modal.state, renderRefQuickView);
    renderQuickViewQuantity(modal.quantity, modal.state, renderRefQuickView);
    renderQuickViewDetails(modal.details, product);

    const cartProduct = {
      ...product,
      size: selectedSize,
      colorHex: selectedColor,
      color: getColorLabelFromHex(selectedColor),
      quantity: modal.state.quantity
    };

    window.LuxeCart?.setProductData(modal.root, cartProduct);
    window.LuxeWishlist?.setProductData(modal.root, cartProduct);
    if (modal.add instanceof HTMLElement) {
      modal.add.dataset.addToCart = "true";
    }
    if (modal.save instanceof HTMLElement) {
      modal.save.textContent = window.LuxeWishlist?.hasItem?.(cartProduct.id) ? "Saved" : "Save To Wishlist";
    }
  };
  const openRefQuickView = (product, trigger) => {
    const modal = ensureRefQuickView();
    modal.product = product;
    modal.trigger = trigger instanceof HTMLElement ? trigger : null;
    modal.state = { sizeIndex: 0, colorIndex: 0, quantity: 1 };
    renderRefQuickView();
    modal.root.classList.add("is-open", "is-dialog-visible");
    modal.root.setAttribute("aria-hidden", "false");
    body.classList.add("is-ref-quick-view-open");
  };

  const syncEditorialCards = () => {
    cards.forEach((card) => {
      const product = buildProductFromCard(card);
      window.LuxeCart?.setProductData(card, product);
      window.LuxeWishlist?.setProductData(card, product);

      const addButton = card.querySelector(".ref-product-card__button--gold");
      if (addButton instanceof HTMLElement) {
        addButton.dataset.addToCart = "";
      }

      const quickButton = card.querySelector(".ref-product-card__button--ghost");
      if (quickButton instanceof HTMLElement) {
        quickButton.dataset.refQuickView = product.name;
      }
    });
  };

  const syncFeaturedProduct = () => {
    if (!(featured instanceof HTMLElement)) {
      return;
    }

    const product = {
      id: "executive-leather-backpack",
      name: featured.querySelector(".ref-featured__title")?.textContent?.trim() || "Executive Leather Backpack",
      category: "Backpack",
      collection: "Featured Collection",
      variant: "Full-Grain Leather",
      price: parsePriceValue(featured.querySelector(".ref-featured__price")?.textContent?.trim() || "$620"),
      image: stageImage?.getAttribute("src") || "assets/images/bags_black-removebg-preview.png",
      size: "One Size",
      color: "Black",
      colorHex: firstSwatchColor(featured),
      description: featured.querySelector(".ref-featured__description")?.textContent?.trim() || "",
      href: "#collections",
      availableSizes: ["One Size"]
    };

    window.LuxeCart?.setProductData(featured, product);
    window.LuxeWishlist?.setProductData(featured, product);

    const primaryButton = featured.querySelector(".ref-featured__button--gold");
    if (primaryButton instanceof HTMLElement) {
      primaryButton.dataset.addToCart = "";
    }

    const secondaryButton = featured.querySelector(".ref-featured__button--ghost");
    if (secondaryButton instanceof HTMLElement) {
      secondaryButton.addEventListener("click", () => {
        const added = window.LuxeCart?.addItem?.(product);
        if (added) {
          window.LuxeCart?.openCart?.(secondaryButton);
        }
      }, { once: false });
    }
  };

  const applyTab = (targetCategory) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.categoryTarget === targetCategory;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    cards.forEach((card) => {
      const matches = targetCategory === "all" || card.dataset.category === targetCategory;
      card.hidden = !matches;
      card.classList.toggle("is-filtered-out", !matches);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => applyTab(tab.dataset.categoryTarget || "all"));
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const nextImage = thumb.dataset.image || "";
      const nextLabel = thumb.dataset.label || "";
      const nextCounter = thumb.dataset.counter || "";

      thumbs.forEach((node) => node.classList.toggle("is-active", node === thumb));
      if (stageImage instanceof HTMLImageElement && nextImage) {
        stageImage.src = nextImage;
      }
      if (stageLabel) {
        stageLabel.textContent = nextLabel;
      }
      if (stageCounter) {
        stageCounter.textContent = nextCounter;
      }
    });
  });

  if (statValues.length) {
    const animateValue = (node) => {
      const target = Number.parseInt(node.dataset.value || "0", 10) || 0;
      const suffix = node.dataset.suffix || "";
      const duration = 1200;
      const start = performance.now();

      const step = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = `${Math.round(target * eased)}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateValue(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      statValues.forEach((node) => observer.observe(node));
    } else {
      statValues.forEach(animateValue);
    }
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const quickButton = target.closest("[data-ref-quick-view]");
    if (!(quickButton instanceof HTMLElement)) {
      return;
    }

    const card = quickButton.closest("[data-ref-card]");
    if (!(card instanceof HTMLElement)) {
      return;
    }

    openRefQuickView(buildProductFromCard(card), quickButton);
  });

  syncEditorialCards();
  syncFeaturedProduct();
  applyTab("all");
  window.LuxeWishlist?.syncWithin(document);
};

const bindSearchOverlay = () => {
  const overlay = document.querySelector("[data-search-overlay]");
  const trigger = document.querySelector("[data-search-trigger]");
  const panel = overlay?.querySelector(".search-overlay__panel");
  const input = overlay?.querySelector("[data-search-input]");
  const clearButton = overlay?.querySelector("[data-search-clear]");
  const closeTargets = overlay ? Array.from(overlay.querySelectorAll("[data-search-close]")) : [];
  const resultsContainer = overlay?.querySelector("[data-search-results]");
  const countElement = overlay?.querySelector("[data-search-count]");
  const trendingContainer = overlay?.querySelector("[data-search-trending]");
  const popularButtons = overlay ? Array.from(overlay.querySelectorAll("[data-search-term]")) : [];
  const allProductsLink = overlay?.querySelector("[data-search-all-products]");
  const allResultsLink = overlay?.querySelector("[data-search-all-results]");
  let lockedScrollY = 0;

  if (!overlay || !trigger || !panel || !input || !clearButton || !resultsContainer || !countElement || !trendingContainer || !allProductsLink || !allResultsLink) {
    return;
  }

  const renderTrending = () => {
    trendingContainer.innerHTML = searchTrendingProducts.map((product) => `
      <a class="search-overlay__trend-card" href="${escapeSearchMarkup(product.href || "#collections")}">
        <div class="search-overlay__trend-media">
          <img src="${escapeSearchMarkup(product.image)}" alt="${escapeSearchMarkup(product.name)}" loading="lazy">
        </div>
        <div class="search-overlay__trend-copy">
          <strong>${escapeSearchMarkup(product.name)}</strong>
          <span>${escapeSearchMarkup(product.collection)}</span>
        </div>
      </a>
    `).join("");
  };

  const findMatches = (query) => {
    const normalized = normalizeSearchTerm(query || "");
    if (!normalized) {
      return [];
    }

    return searchCatalog.filter((product) => {
      const haystack = [
        product.name,
        product.collection,
        product.category,
        ...(product.keywords || [])
      ].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  };

  const renderResults = (query) => {
    const matches = findMatches(query);
    const hasQuery = normalizeSearchTerm(query || "").length > 0;

    countElement.textContent = hasQuery ? `RESULTS (${matches.length})` : "RESULTS";
    countElement.classList.toggle("is-active", hasQuery);
    clearButton.classList.toggle("is-visible", hasQuery);
    resultsContainer.hidden = !hasQuery || matches.length === 0;
    allResultsLink.hidden = !hasQuery || matches.length === 0;
    allResultsLink.href = matches[0]?.href || "#collections";

    if (!hasQuery || !matches.length) {
      resultsContainer.replaceChildren();
      return;
    }

    resultsContainer.innerHTML = matches.map((product, index) => `
      <article class="search-overlay__result" style="animation-delay:${Math.min(index * 0.04, 0.24)}s;">
        <a class="search-overlay__result-link" href="${escapeSearchMarkup(product.href || "#collections")}">
          <div class="search-overlay__result-media">
            <img src="${escapeSearchMarkup(product.image)}" alt="${escapeSearchMarkup(product.name)}" loading="lazy">
          </div>
          <div class="search-overlay__result-main">
            <h4 class="search-overlay__result-name">${escapeSearchMarkup(product.name)}</h4>
            <div class="search-overlay__result-meta">
              <span class="search-overlay__result-collection">${escapeSearchMarkup(product.collection)}</span>
            </div>
          </div>
          <span class="search-overlay__result-price">${escapeSearchMarkup(product.priceText)}</span>
          <span class="search-overlay__result-arrow" aria-hidden="true">&rarr;</span>
        </a>
      </article>
    `).join("");
  };

  const openOverlay = () => {
    if (overlay.classList.contains("is-open")) {
      return;
    }

    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    body.classList.add("is-search-open");
    body.style.top = `-${lockedScrollY}px`;
    input.value = "";
    renderResults("");

    window.setTimeout(() => {
      input.focus();
    }, 60);
  };

  const closeOverlay = () => {
    if (!overlay.classList.contains("is-open")) {
      return;
    }

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    body.classList.remove("is-search-open");
    body.style.top = "";
    window.scrollTo(0, lockedScrollY);
  };

  renderTrending();
  renderResults("");
  allProductsLink.href = "#collections";

  trigger.addEventListener("click", openOverlay);
  closeTargets.forEach((node) => node.addEventListener("click", closeOverlay));
  panel.addEventListener("click", (event) => event.stopPropagation());
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeOverlay();
    }
  });

  popularButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const term = button.dataset.searchTerm || "";
      input.value = term;
      renderResults(term);
      input.focus();
    });
  });

  input.addEventListener("input", () => renderResults(input.value));
  clearButton.addEventListener("click", () => {
    input.value = "";
    renderResults("");
    input.focus();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeOverlay();
    }
  });
};

const syncBestSellersPromoPlacement = () => {
  const promo = document.querySelector(".luxury-promo--bs");
  const transitionSection = document.querySelector("[data-collections-transition]");
  const bestSellersSection = document.querySelector("[data-bs-section]");
  const collectionsEnding = document.querySelector(".collections-cinema__ending");

  if (!(promo instanceof HTMLElement) || !(transitionSection instanceof HTMLElement) || !(bestSellersSection instanceof HTMLElement)) {
    return;
  }

  const mobileMedia = window.matchMedia("(max-width: 720px)");

  const placePromo = () => {
    const parent = transitionSection.parentNode;
    if (!(parent instanceof HTMLElement)) {
      return;
    }

    if (mobileMedia.matches) {
      if (collectionsEnding instanceof HTMLElement) {
        const afterEnding = collectionsEnding.nextElementSibling;
        if (afterEnding !== promo) {
          parent.insertBefore(promo, transitionSection);
        }
      } else if (transitionSection.previousElementSibling !== promo) {
        parent.insertBefore(promo, transitionSection);
      }
      return;
    }

    if (bestSellersSection.previousElementSibling !== promo) {
      parent.insertBefore(promo, bestSellersSection);
    }
  };

  placePromo();

  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", placePromo);
  } else if (typeof mobileMedia.addListener === "function") {
    mobileMedia.addListener(placePromo);
  }
};

const boot = () => {
  if (bootInitialized) {
    return;
  }

  bootInitialized = true;

  if (introScreen && !introScreen.classList.contains("is-hidden")) {
    body.classList.add("is-loading");
  } else {
    body.classList.remove("is-loading", "is-intro-active", "is-intro-exit");
    body.classList.add("is-ready");
  }
  window.scrollTo(0, 0);
  prepareLetterReveal();
  createDustParticles();
  updateLayoutMetrics();
  updateHeaderState();
  bindIntroScreen();

  bindCursor();
  bindScrollIndicator();
  bindMarqueeReveal();
  bindArrivalsReveal();
  bindCollectionsCinema();
  syncBestSellersPromoPlacement();
  bindCollectionsTransition();
  bindRefSection();
  bindBestSellers();
  bindFinalCinemaFooter();
  bindSearchOverlay();

  if (heroVideo) {
    heroVideo.defaultMuted = true;
    heroVideo.muted = true;
    heroVideo.autoplay = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute("muted", "");
    heroVideo.setAttribute("autoplay", "");
    heroVideo.setAttribute("playsinline", "");
    heroVideo.load();
    heroVideo.play().catch(() => {
      // Autoplay may be blocked on some devices even while muted.
    });
  }

};

window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateHeaderState();
      scrollTicking = false;
    });
  },
  { passive: true }
);

window.addEventListener("resize", () => {
  updateLayoutMetrics();
  updateHeaderState();

  if (window.ScrollTrigger) {
    window.ScrollTrigger.refresh();
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  window.setTimeout(boot, 0);
}

window.addEventListener("load", boot, { once: true });
window.setTimeout(boot, 2400);

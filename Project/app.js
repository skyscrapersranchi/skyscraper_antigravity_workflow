/**
 * SKYSCRAPER — Digital Architectural Experience Engine
 * Lead Product Architecture, Motion & Interaction Logic
 */

(function () {
  'use strict';

  // --- CONFIGURATION & ASSET REGISTRY ---
  const TOTAL_FRAMES = 825;
  const FRAME_BASE_PATH = 'public/frames/frame_';
  const FRAME_EXT = '.jpg';
  
  // High-Resolution Color Floor Plans (Verified from official architectural brochure)
  const FLOOR_PLANS = [
    {
      id: 'ground',
      title: 'Ground Floor & Entrance Layout',
      subtitle: 'Entrance threshold, vehicular circulation, lobby, 4 residential flats (1,320–1,496 sq.ft.)',
      src: 'public/floorplans/floor_plan_page_1.jpg',
      badge: 'Level 00 (Ground)'
    },
    {
      id: 'typical_1_3_5',
      title: 'Typical 1st, 3rd & 5th Floor Plan',
      subtitle: '5 premium 3 BHK configurations (1,378–1,643 sq.ft. Super Built-Up Area)',
      src: 'public/floorplans/floor_plan_page_2.jpg',
      badge: 'Levels 01, 03, 05'
    },
    {
      id: 'typical_2_4',
      title: 'Typical 2nd & 4th Floor Plan',
      subtitle: '5 premium 3 BHK units with extended private balcony & terrace orientations',
      src: 'public/floorplans/floor_plan_page_3.jpg',
      badge: 'Levels 02, 04'
    },
    {
      id: 'basement',
      title: 'Basement & Stilt Parking Layout',
      subtitle: '26 dedicated car parking bays, two-wheeler bays, vehicular ramp & dual lift access',
      src: 'public/floorplans/floor_plan_page_4.jpg',
      badge: 'Level -01 (Basement)'
    }
  ];

  // Approved 7 Frame-Synchronized Storytelling Scenes (Tied to 1–825 walkthrough progression)
  const SCROLL_NARRATIVE = [
    {
      id: 'scene-1',
      minFrame: 1,
      maxFrame: 110,
      accent: 'THE ARRIVAL',
      headline: 'A More Refined Way to Live.',
      subline: 'Exterior Building Elevation & Arrival Approach'
    },
    {
      id: 'scene-2',
      minFrame: 111,
      maxFrame: 240,
      accent: 'THE ENTRANCE',
      headline: 'A Grand Welcome.',
      subline: ''
    },
    {
      id: 'scene-3',
      minFrame: 241,
      maxFrame: 370,
      accent: 'THE RESIDENCE',
      headline: 'Space to Unwind.',
      subline: 'Expansive Three-Bedroom Living & Cross-Ventilated Balconies'
    },
    {
      id: 'scene-4',
      minFrame: 371,
      maxFrame: 530,
      accent: 'THE CULINARY SUITE',
      headline: 'Designed Around You.',
      subline: 'Monolithic Granite Island, Pendant Lighting & Utility Suite'
    },
    {
      id: 'scene-5',
      minFrame: 531,
      maxFrame: 630,
      accent: 'THE WELLNESS RETREAT',
      headline: 'Everyday, Elevated.',
      subline: 'Illuminated Circular Mirror Vanity & Anti-Skid Vitrified Surfaces'
    },
    {
      id: 'scene-6',
      minFrame: 631,
      maxFrame: 730,
      accent: 'THE PRIVATE HAVEN',
      headline: 'Your Space. Your Sanctuary.',
      subline: 'Master Bedroom Sanctuary & Natural Dawn Illumination'
    },
    {
      id: 'scene-7',
      minFrame: 731,
      maxFrame: 825,
      accent: 'AN ENDURING LEGACY',
      headline: 'Deonarayan Estate',
      subline: 'Crafted for Calm. Built for Life. · JHARERA/PROJECT/49/2025'
    }
  ];

  // --- STATE ---
  const state = {
    currentPlanIndex: 0,
    planZoom: 1,
    planPanX: 0,
    planPanY: 0,
    isPanningPlan: false,
    panStartX: 0,
    panStartY: 0,
    enquiryData: {
      intent: '',
      project: 'Deonarayan Estate',
      name: '',
      phone: '',
      email: '',
      notes: ''
    }
  };

  // --- DOM REFERENCES ---
  const dom = {};

  function cacheDom() {
    dom.heroVideo = document.getElementById('heroVideo');
    dom.heroReplayBtn = document.getElementById('heroReplayBtn');
    dom.heroLoader = document.getElementById('heroLoader');
    dom.heroOverlay = document.getElementById('heroOverlay');

    dom.nav = document.getElementById('mainNav');
    dom.navMenuBtn = document.getElementById('navMenuBtn');
    dom.navOverlay = document.getElementById('navOverlay');
    dom.navOverlayLinks = document.querySelectorAll('.nav__overlay-link');

    dom.brandResolve = document.getElementById('brandResolution');
    dom.brandLogo = document.querySelector('.brand-resolve__logo');
    dom.brandTagline = document.querySelector('.brand-resolve__tagline');
    dom.brandLine = document.querySelector('.brand-resolve__line');

    dom.archSection = document.getElementById('archScrollSection');
    dom.scrollCanvas = document.getElementById('scrollCanvas');
    dom.archScrollOverlay = document.getElementById('archScrollOverlay');
    dom.scrollLabel = document.getElementById('scrollLabel');
    dom.scrollLabelText = document.getElementById('scrollLabelText');
    dom.scrollHeadline = document.getElementById('scrollHeadline');
    dom.scrollSubline = document.getElementById('scrollSubline');
    dom.scrollProgressFill = document.getElementById('scrollProgressFill');
    dom.scrollFrameCounter = document.getElementById('scrollFrameCounter');

    dom.planTabs = document.getElementById('planTabs');
    dom.planImage = document.getElementById('planImage');
    dom.planTitle = document.getElementById('planTitle');
    dom.planSubtitle = document.getElementById('planSubtitle');
    dom.planBadge = document.getElementById('planBadge');
    dom.planZoomIn = document.getElementById('planZoomIn');
    dom.planZoomOut = document.getElementById('planZoomOut');
    dom.planReset = document.getElementById('planReset');
    dom.planFullscreen = document.getElementById('planFullscreen');
    dom.planViewer = document.getElementById('planViewer');

    dom.enquirySteps = document.querySelectorAll('.enquiry__step');
    dom.enquiryForm = document.getElementById('enquiryForm');
    dom.enquirySection = document.getElementById('enquiry');
    dom.footer = document.querySelector('footer');
    dom.persistentCta = document.getElementById('persistentCta');
    dom.floatingWhatsapp = document.getElementById('floatingWhatsapp');
    dom.reveals = document.querySelectorAll('.reveal');
    dom.specVideo = document.getElementById('specificationVideo');

    // Compliance Elements
    dom.disclaimerModal = document.getElementById('disclaimerModal');
    dom.disclaimerDismissBtn = document.getElementById('disclaimerDismissBtn');
    dom.disclaimerBackdrop = document.getElementById('disclaimerBackdrop');
    dom.cookieBar = document.getElementById('cookieBar');
    dom.cookieAcceptBtn = document.getElementById('cookieAcceptBtn');
    dom.cookieDeclineBtn = document.getElementById('cookieDeclineBtn');
  }

  // ============================================================
  // SECTION 1: CINEMATIC OPENING (ALWAYS MUTED, NO SOUND TOGGLE)
  // ============================================================
  function initHeroFilm() {
    if (!dom.heroVideo) return;

    // Enforce permanent muted state per strict requirement
    dom.heroVideo.muted = true;
    dom.heroVideo.defaultMuted = true;

    // Autoplay initiation with fallback
    const playPromise = dom.heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        dom.heroVideo.muted = true;
        dom.heroVideo.play().catch(() => {});
      });
    }

    // Replay button
    if (dom.heroReplayBtn) {
      dom.heroReplayBtn.addEventListener('click', () => {
        dom.heroVideo.currentTime = 0;
        dom.heroVideo.play().catch(() => {});
        if (dom.heroOverlay) dom.heroOverlay.classList.remove('active');
        if (lenisInstance) {
          lenisInstance.scrollTo(0, { duration: 1 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Video loaded state
    dom.heroVideo.addEventListener('playing', () => {
      if (dom.heroLoader) dom.heroLoader.classList.add('hidden');
    });

    // When film completes: seamlessly resolve into Brand Frame
    dom.heroVideo.addEventListener('ended', () => {
      if (dom.heroOverlay) dom.heroOverlay.classList.add('active');
      setTimeout(() => {
        if (dom.brandResolve) {
          if (lenisInstance) {
            lenisInstance.scrollTo(dom.brandResolve, { duration: 1.2 });
          } else {
            dom.brandResolve.scrollIntoView({ behavior: 'smooth' });
          }
          revealBrandElements();
          triggerPostHeroCompliance();
        }
      }, 700);
    });

    // Optimize CPU / GPU: Pause hero video when scrolled past hero
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !dom.heroVideo.paused) {
            dom.heroVideo.pause();
          } else if (entry.isIntersecting && dom.heroVideo.paused && dom.heroVideo.currentTime > 0 && !dom.heroVideo.ended) {
            dom.heroVideo.play().catch(() => {});
          }
        });
      },
      { threshold: 0.1 }
    );
    heroObserver.observe(dom.heroVideo);
  }

  function revealBrandElements() {
    if (dom.brandLogo) dom.brandLogo.classList.add('visible');
    if (dom.brandTagline) dom.brandTagline.classList.add('visible');
    if (dom.brandLine) dom.brandLine.classList.add('visible');
  }

  // ============================================================
  // SECTION 2: 35-SECOND SCROLL SEQUENCE (SHARP 4K CANVAS ENGINE)
  // ============================================================
  class FrameScroller {
    constructor() {
      this.canvas = dom.scrollCanvas;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.frames = new Map();
      this.currentFrameIndex = 1;
      this.targetFrameIndex = 1;
      this.isRendering = false;
      this.lastRenderedIndex = -1;
      this.totalFrames = TOTAL_FRAMES;
      this.preloadedCount = 0;
      this.activePhaseIndex = -1;

      this.init();
    }

    formatFrameNum(num) {
      return String(num).padStart(4, '0');
    }

    getFramePath(index) {
      return `${FRAME_BASE_PATH}${this.formatFrameNum(index)}${FRAME_EXT}`;
    }

    loadImage(index) {
      if (this.frames.has(index)) {
        return Promise.resolve(this.frames.get(index));
      }
      return new Promise((resolve) => {
        const img = new Image();
        img.src = this.getFramePath(index);
        img.onload = () => {
          this.frames.set(index, img);
          resolve(img);
        };
        img.onerror = () => {
          resolve(null);
        };
      });
    }

    preloadInitialBatch() {
      const initialLoads = [];
      for (let i = 1; i <= 30; i++) {
        initialLoads.push(this.loadImage(i));
      }
      Promise.all(initialLoads).then(() => {
        this.renderFrame(1);
      });
    }

    queueNeighborFrames(centerIndex) {
      const isForward = this.targetFrameIndex >= this.currentFrameIndex;
      const windowForward = isForward ? 35 : 15;
      const windowBack = isForward ? 12 : 30;
      for (let i = centerIndex - windowBack; i <= centerIndex + windowForward; i++) {
        if (i >= 1 && i <= this.totalFrames && !this.frames.has(i)) {
          this.loadImage(i);
        }
      }
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = rect.width;
      this.height = rect.height;

      // Set backing store dimensions to exact physical device pixels
      this.canvas.width = Math.floor(rect.width * dpr);
      this.canvas.height = Math.floor(rect.height * dpr);

      // Set CSS dimensions explicitly to prevent downscale distortion
      this.canvas.style.width = Math.floor(rect.width) + 'px';
      this.canvas.style.height = Math.floor(rect.height) + 'px';

      // Reset transform matrix
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Enable high-quality image smoothing
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';

      this.lastRenderedIndex = -1;
      this.renderFrame(Math.round(this.currentFrameIndex));
    }

    renderFrame(frameIndex) {
      const img = this.frames.get(frameIndex);
      if (!img || !img.complete || img.naturalWidth === 0) {
        let fallback = null;
        for (let dist = 1; dist < 40; dist++) {
          if (this.frames.has(frameIndex - dist)) {
            fallback = this.frames.get(frameIndex - dist);
            break;
          } else if (this.frames.has(frameIndex + dist)) {
            fallback = this.frames.get(frameIndex + dist);
            break;
          }
        }
        if (fallback && fallback.complete) {
          this.drawCover(fallback);
        }
        return;
      }

      this.drawCover(img);
      this.lastRenderedIndex = frameIndex;
    }

    drawCover(img) {
      // Work directly in high-res backing store coordinates for needle-sharp 4K rendering
      const cWidth = this.canvas.width;
      const cHeight = this.canvas.height;
      const iWidth = img.naturalWidth;
      const iHeight = img.naturalHeight;

      const imgRatio = iWidth / iHeight;
      const canvasRatio = cWidth / cHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = cWidth;
        drawHeight = cWidth / imgRatio;
        offsetX = 0;
        offsetY = (cHeight - drawHeight) / 2;
      } else {
        drawHeight = cHeight;
        drawWidth = cHeight * imgRatio;
        offsetX = (cWidth - drawWidth) / 2;
        offsetY = 0;
      }

      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(0, 0, cWidth, cHeight);
      this.ctx.drawImage(img, Math.round(offsetX), Math.round(offsetY), Math.round(drawWidth), Math.round(drawHeight));
    }

    updatePhase(frameIndex) {
      const fadeBuffer = 10; // 8-12 frame ramp
      let activeScene = null;
      let opacity = 0;

      for (let i = 0; i < SCROLL_NARRATIVE.length; i++) {
        const scene = SCROLL_NARRATIVE[i];
        if (frameIndex >= scene.minFrame && frameIndex <= scene.maxFrame) {
          activeScene = scene;
          const distStart = frameIndex - scene.minFrame;
          const distEnd = scene.maxFrame - frameIndex;

          if (distStart < fadeBuffer) {
            opacity = distStart / fadeBuffer;
          } else if (distEnd < fadeBuffer) {
            opacity = distEnd / fadeBuffer;
          } else {
            opacity = 1;
          }
          break;
        }
      }

      if (!activeScene) {
        activeScene = frameIndex < SCROLL_NARRATIVE[0].minFrame 
          ? SCROLL_NARRATIVE[0] 
          : SCROLL_NARRATIVE[SCROLL_NARRATIVE.length - 1];
        opacity = 0;
      }

      if (this.activeSceneId !== activeScene.id) {
        this.activeSceneId = activeScene.id;
        if (dom.scrollLabelText) dom.scrollLabelText.textContent = activeScene.accent;
        if (dom.scrollHeadline) dom.scrollHeadline.textContent = activeScene.headline;
        if (dom.scrollSubline) {
          dom.scrollSubline.textContent = activeScene.subline || '';
          dom.scrollSubline.style.display = activeScene.subline ? '' : 'none';
        }
      }

      // Smooth opacity & subtle lift during fade
      if (dom.archScrollOverlay) {
        dom.archScrollOverlay.style.opacity = opacity.toFixed(3);
        const yOffset = (1 - opacity) * 8;
        dom.archScrollOverlay.style.transform = `translateY(${yOffset.toFixed(1)}px)`;
      }

      if (dom.scrollProgressFill) {
        const pct = ((frameIndex - 1) / (this.totalFrames - 1)) * 100;
        dom.scrollProgressFill.style.height = `${pct.toFixed(1)}%`;
      }

      if (dom.scrollFrameCounter) {
        dom.scrollFrameCounter.textContent = `FRAME ${this.formatFrameNum(frameIndex)} / ${this.formatFrameNum(this.totalFrames)}`;
      }
    }

    onScroll() {
      if (!dom.archSection || this.isPaused) return;
      const rect = dom.archSection.getBoundingClientRect();
      const scrollHeight = dom.archSection.offsetHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollProgress = Math.max(0, Math.min(1, -rect.top / scrollHeight));
      const targetFrame = Math.round(1 + scrollProgress * (this.totalFrames - 1));
      this.targetFrameIndex = Math.max(1, Math.min(this.totalFrames, targetFrame));

      this.queueNeighborFrames(this.targetFrameIndex);

      if (!this.isRendering) {
        this.isRendering = true;
        requestAnimationFrame(() => this.loop());
      }
    }

    loop() {
      if (this.isPaused) {
        this.isRendering = false;
        return;
      }

      const diff = this.targetFrameIndex - this.currentFrameIndex;
      const absDiff = Math.abs(diff);

      if (absDiff > 0.04) {
        // Velocity-adaptive cinematic damping for velvety smooth walkthrough feel
        const lerpFactor = Math.min(0.22, 0.11 + absDiff * 0.0035);
        this.currentFrameIndex += diff * lerpFactor;
        const rounded = Math.round(this.currentFrameIndex);
        if (rounded !== this.lastRenderedIndex) {
          this.renderFrame(rounded);
          this.updatePhase(rounded);
        }

        // Steadicam focal breathing scale during active camera movement
        if (this.canvas) {
          const velocity = Math.min(1, absDiff / 25);
          const focalScale = 1.0 + velocity * 0.006;
          this.canvas.style.transform = `scale(${focalScale.toFixed(4)}) translateZ(0)`;
        }

        requestAnimationFrame(() => this.loop());
      } else {
        this.currentFrameIndex = this.targetFrameIndex;
        const rounded = Math.round(this.currentFrameIndex);
        this.renderFrame(rounded);
        this.updatePhase(rounded);
        if (this.canvas) {
          this.canvas.style.transform = 'scale(1) translateZ(0)';
        }
        this.isRendering = false;
      }
    }

    init() {
      this.isPaused = false;
      this.resize();
      this.preloadInitialBatch();
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });

      // Pause rendering when architectural walkthrough is out of viewport
      if ('IntersectionObserver' in window && dom.archSection) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            this.isPaused = !entry.isIntersecting;
            if (entry.isIntersecting && !this.isRendering) {
              this.onScroll();
            }
          });
        }, { rootMargin: '100px 0px 100px 0px', threshold: 0.01 });
        obs.observe(dom.archSection);
      }
    }
  }

  // ============================================================
  // SECTION 3: FLOOR PLAN VIEWER (FULL-COLOR SHEETS & METRICS)
  // ============================================================
  function initFloorPlanViewer() {
    if (!dom.planViewer || !dom.planImage) return;

    function renderPlan(index) {
      const plan = FLOOR_PLANS[index];
      if (!plan) return;
      state.currentPlanIndex = index;
      state.planZoom = 1;
      state.planPanX = 0;
      state.planPanY = 0;
      applyPlanTransform();

      dom.planImage.src = plan.src;
      dom.planImage.alt = `${plan.title} — Deonarayan Estate Architectural Sheet`;
      if (dom.planTitle) dom.planTitle.textContent = plan.title;
      if (dom.planSubtitle) dom.planSubtitle.textContent = plan.subtitle;
      if (dom.planBadge) dom.planBadge.textContent = plan.badge;

      if (dom.planTabs) {
        const buttons = dom.planTabs.querySelectorAll('.floor-plans__tab');
        buttons.forEach((btn, idx) => {
          btn.classList.toggle('active', idx === index);
          btn.setAttribute('aria-selected', (idx === index).toString());
        });
      }
    }

    function applyPlanTransform() {
      dom.planImage.style.transform = `translate(${state.planPanX}px, ${state.planPanY}px) scale(${state.planZoom})`;
    }

    if (dom.planTabs) {
      dom.planTabs.innerHTML = '';
      FLOOR_PLANS.forEach((plan, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `floor-plans__tab ${idx === 0 ? 'active' : ''}`;
        btn.textContent = plan.badge;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', (idx === 0).toString());
        btn.addEventListener('click', () => renderPlan(idx));
        dom.planTabs.appendChild(btn);
      });
    }

    if (dom.planZoomIn) {
      dom.planZoomIn.addEventListener('click', () => {
        state.planZoom = Math.min(state.planZoom + 0.35, 3.5);
        applyPlanTransform();
      });
    }

    if (dom.planZoomOut) {
      dom.planZoomOut.addEventListener('click', () => {
        state.planZoom = Math.max(state.planZoom - 0.35, 1);
        if (state.planZoom === 1) {
          state.planPanX = 0;
          state.planPanY = 0;
        }
        applyPlanTransform();
      });
    }

    if (dom.planReset) {
      dom.planReset.addEventListener('click', () => {
        state.planZoom = 1;
        state.planPanX = 0;
        state.planPanY = 0;
        applyPlanTransform();
      });
    }

    if (dom.planFullscreen) {
      dom.planFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          dom.planViewer.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    dom.planViewer.addEventListener('mousedown', (e) => {
      if (state.planZoom <= 1) return;
      state.isPanningPlan = true;
      state.panStartX = e.clientX - state.planPanX;
      state.panStartY = e.clientY - state.planPanY;
      dom.planViewer.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isPanningPlan) return;
      state.planPanX = e.clientX - state.panStartX;
      state.planPanY = e.clientY - state.panStartY;
      applyPlanTransform();
    });

    window.addEventListener('mouseup', () => {
      if (state.isPanningPlan) {
        state.isPanningPlan = false;
        dom.planViewer.style.cursor = state.planZoom > 1 ? 'grab' : 'default';
      }
    });

    dom.planViewer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
      const nextZoom = Math.max(1, Math.min(3.5, state.planZoom + zoomFactor));
      state.planZoom = nextZoom;
      if (state.planZoom === 1) {
        state.planPanX = 0;
        state.planPanY = 0;
      }
      applyPlanTransform();
    }, { passive: false });

    // --- Mobile Touch Gestures (Single-finger pan, Two-finger pinch-zoom, Double-tap toggle) ---
    let initialPinchDistance = 0;
    let initialPinchZoom = 1;
    let lastTapTime = 0;

    dom.planViewer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const currentTime = Date.now();
        const tapDiff = currentTime - lastTapTime;
        if (tapDiff < 300 && tapDiff > 0) {
          e.preventDefault();
          state.planZoom = state.planZoom > 1.2 ? 1 : 2;
          if (state.planZoom === 1) {
            state.planPanX = 0;
            state.planPanY = 0;
          }
          applyPlanTransform();
          return;
        }
        lastTapTime = currentTime;

        if (state.planZoom > 1) {
          state.isPanningPlan = true;
          state.panStartX = e.touches[0].clientX - state.planPanX;
          state.panStartY = e.touches[0].clientY - state.planPanY;
        }
      } else if (e.touches.length === 2) {
        state.isPanningPlan = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchZoom = state.planZoom;
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (state.isPanningPlan && e.touches.length === 1 && state.planZoom > 1) {
        e.preventDefault(); // Prevent page scroll while dragging zoomed floor plan
        state.planPanX = e.touches[0].clientX - state.panStartX;
        state.planPanY = e.touches[0].clientY - state.panStartY;
        applyPlanTransform();
      } else if (e.touches.length === 2 && initialPinchDistance > 0) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleChange = currentDistance / initialPinchDistance;
        state.planZoom = Math.max(1, Math.min(3.5, initialPinchZoom * scaleChange));
        if (state.planZoom === 1) {
          state.planPanX = 0;
          state.planPanY = 0;
        }
        applyPlanTransform();
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        state.isPanningPlan = false;
        initialPinchDistance = 0;
      } else if (e.touches.length === 1 && state.planZoom > 1) {
        state.isPanningPlan = true;
        state.panStartX = e.touches[0].clientX - state.planPanX;
        state.panStartY = e.touches[0].clientY - state.planPanY;
      }
    });

    renderPlan(0);
  }

  // ============================================================
  // SECTION 4: CONVERSATIONAL ENQUIRY FLOW (LEAD GENERATION)
  // ============================================================
  function initEnquiryFlow() {
    const steps = Array.from(dom.enquirySteps);
    if (steps.length === 0) return;

    let currentStep = 1;

    function goToStep(stepNum) {
      currentStep = stepNum;
      steps.forEach((step, idx) => {
        const isActive = idx + 1 === stepNum;
        step.classList.toggle('active', isActive);
        if (isActive) {
          const firstInput = step.querySelector('input, button');
          if (firstInput) firstInput.focus();
        }
      });
    }

    const step1Options = document.querySelectorAll('[data-enquiry-intent]');
    step1Options.forEach((btn) => {
      btn.addEventListener('click', () => {
        step1Options.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.enquiryData.intent = btn.getAttribute('data-enquiry-intent');
        setTimeout(() => goToStep(2), 220);
      });
    });

    const step2Options = document.querySelectorAll('[data-enquiry-project]');
    step2Options.forEach((btn) => {
      btn.addEventListener('click', () => {
        step2Options.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.enquiryData.project = btn.getAttribute('data-enquiry-project');
        setTimeout(() => goToStep(3), 220);
      });
    });

    const backButtons = document.querySelectorAll('[data-enquiry-back]');
    backButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        }
      });
    });

    const nameInput = document.getElementById('enquiryName');
    const phoneInput = document.getElementById('enquiryPhone');
    const emailInput = document.getElementById('enquiryEmail');
    const notesInput = document.getElementById('enquiryNotes');
    const submitBtn = document.getElementById('enquirySubmit');

    function validateField(input, testFn, errorId) {
      const err = document.getElementById(errorId);
      const valid = testFn(input.value.trim());
      input.classList.toggle('error', !valid);
      if (err) err.classList.toggle('visible', !valid);
      return valid;
    }

    // Dynamically load CRM submit module if not already loaded
    if (typeof window.submitLead !== 'function' && !document.querySelector('script[src*="crm-submit.js"]')) {
      const crmScript = document.createElement('script');
      crmScript.src = 'crm-submit.js';
      document.head.appendChild(crmScript);
    }

    // Context tracking for entry points without altering steps or visual styling
    document.querySelectorAll('a[href="#enquiry"]').forEach((link) => {
      link.addEventListener('click', () => {
        const text = (link.textContent || '').trim().toLowerCase();
        if (text.includes('folio') || text.includes('floor')) {
          state.enquiryData.sourceCta = 'floor_plan';
        } else if (text.includes('visit') || text.includes('presentation')) {
          state.enquiryData.sourceCta = 'site_visit';
        } else if (text.includes('touch')) {
          state.enquiryData.sourceCta = 'contact';
        } else {
          state.enquiryData.sourceCta = 'enquire';
        }
      });
    });

    if (dom.enquiryForm) {
      dom.enquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isNameValid = validateField(
          nameInput,
          (v) => v.length >= 2,
          'nameError'
        );
        const isPhoneValid = validateField(
          phoneInput,
          (v) => /^[+]?[\d\s-]{10,15}$/.test(v),
          'phoneError'
        );
        const isEmailValid = validateField(
          emailInput,
          (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
          'emailError'
        );

        if (!isNameValid || !isPhoneValid || !isEmailValid) {
          return;
        }

        state.enquiryData.name = nameInput.value.trim();
        state.enquiryData.phone = phoneInput.value.trim();
        state.enquiryData.email = emailInput.value.trim();
        if (notesInput) state.enquiryData.notes = notesInput.value.trim();

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Transmitting...';
        }

        const subject = encodeURIComponent(`[Website Enquiry] ${state.enquiryData.intent || 'General'} - ${state.enquiryData.project}`);
        const body = encodeURIComponent(
          `Name: ${state.enquiryData.name}\n` +
          `Phone: ${state.enquiryData.phone}\n` +
          `Email: ${state.enquiryData.email}\n` +
          `Intent: ${state.enquiryData.intent}\n` +
          `Project: ${state.enquiryData.project}\n` +
          `Notes: ${state.enquiryData.notes || 'None'}\n\n` +
          `Source: theskyscrapers.in Lead Generation Engine`
        );
        const mailtoUri = `mailto:skyscrapers.ranchi@gmail.com?subject=${subject}&body=${body}`;

        const confirmName = document.getElementById('confirmClientName');
        const mailtoAction = document.getElementById('confirmMailtoAction');
        if (confirmName) confirmName.textContent = state.enquiryData.name;
        if (mailtoAction) mailtoAction.href = mailtoUri;

        // Resolve form_type from intent or entry point
        let formType = 'enquire';
        if (typeof window.resolveFormType === 'function' && state.enquiryData.intent) {
          formType = window.resolveFormType(state.enquiryData.intent);
        } else if (state.enquiryData.sourceCta) {
          formType = state.enquiryData.sourceCta;
        }

        // Post to live Supabase CRM
        if (typeof window.submitLead === 'function') {
          try {
            await window.submitLead({
              name: state.enquiryData.name,
              phone: state.enquiryData.phone,
              email: state.enquiryData.email,
              project: state.enquiryData.project,
              interest: state.enquiryData.intent,
              message: state.enquiryData.notes,
              form_type: formType,
              consent: true,
              consent_text: 'By submitting, you agree to be contacted by Skyscraper about your enquiry by phone, WhatsApp or email.',
              consent_at: new Date().toISOString(),
              lat: state.enquiryData.lat !== undefined ? state.enquiryData.lat : null,
              lng: state.enquiryData.lng !== undefined ? state.enquiryData.lng : null
            });
          } catch (err) {
            console.error('[CRM Submit Error]', err);
          }
        }

        // Advance to existing confirmation state
        goToStep(4);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Enquiry';
        }
      });
    }
  }

  // ============================================================
  // SECTION 5: NAVIGATION & PERSISTENT CTAs (NO OBSTRUCTION ON HERO)
  // ============================================================
  function initNavigation() {
    let isSuppressed = false;

    // Intelligent concealment when user arrives at Enquiry form or Regulatory Footer
    if ('IntersectionObserver' in window) {
      const suppressObserver = new IntersectionObserver((entries) => {
        // If either enquiry or footer is visible in viewport, suppress floating CTAs
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        isSuppressed = isIntersecting;

        if (dom.persistentCta) {
          dom.persistentCta.classList.toggle('suppressed', isSuppressed);
        }
        if (dom.floatingWhatsapp) {
          dom.floatingWhatsapp.classList.toggle('suppressed', isSuppressed);
        }
      }, {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
      });

      if (dom.enquirySection) suppressObserver.observe(dom.enquirySection);
      if (dom.footer) suppressObserver.observe(dom.footer);
    }

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.9;

      if (dom.nav) {
        if (currentScrollY > 80) {
          dom.nav.classList.add('nav--scrolled');
        } else {
          dom.nav.classList.remove('nav--scrolled');
        }
      }

      // Display persistent bar and floating WhatsApp ONLY after scrolling past hero video
      const shouldShowCtas = currentScrollY > heroHeight && !isSuppressed;
      if (dom.persistentCta) {
        dom.persistentCta.classList.toggle('visible', shouldShowCtas);
      }
      if (dom.floatingWhatsapp) {
        dom.floatingWhatsapp.classList.toggle('visible', shouldShowCtas);
      }
    }, { passive: true });

    if (dom.navMenuBtn && dom.navOverlay) {
      dom.navMenuBtn.addEventListener('click', () => {
        const isOpen = dom.navOverlay.classList.contains('active');
        dom.navMenuBtn.classList.toggle('active', !isOpen);
        dom.navOverlay.classList.toggle('active', !isOpen);
        document.body.style.overflow = !isOpen ? 'hidden' : '';
      });

      dom.navOverlayLinks.forEach((link) => {
        link.addEventListener('click', () => {
          dom.navMenuBtn.classList.remove('active');
          dom.navOverlay.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // ============================================================
  // SECTION 6: EDITORIAL REVEAL OBSERVER
  // ============================================================
  function initRevealObserver() {
    if (!('IntersectionObserver' in window)) {
      dom.reveals.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    dom.reveals.forEach((el) => observer.observe(el));
  }

  // ============================================================
  // SECTION 7: KINETIC TYPOGRAPHY SYSTEM
  // Editorial, architectural masking, scale, and tracking
  // ============================================================
  function initKineticTypography() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // 1. Editorial Headings: Architectural Line Masking & Staggered Reveal
    const editorialTitles = document.querySelectorAll('.editorial__title');
    editorialTitles.forEach((heading) => {
      const originalText = heading.textContent.trim();
      if (!originalText || heading.querySelector('.kinetic-line')) return;
      heading.setAttribute('aria-label', originalText);

      // Split into balanced architectural lines
      const words = originalText.split(/\s+/);
      let lineChunks = [];
      if (words.length <= 4) {
        lineChunks = [words.join(' ')];
      } else if (words.length <= 8) {
        const mid = Math.ceil(words.length / 2);
        lineChunks = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
      } else {
        const third = Math.ceil(words.length / 3);
        lineChunks = [
          words.slice(0, third).join(' '),
          words.slice(third, third * 2).join(' '),
          words.slice(third * 2).join(' ')
        ];
      }

      heading.innerHTML = lineChunks
        .map((text) => `<span class="kinetic-line-wrap"><span class="kinetic-line">${text}</span></span>`)
        .join('');

      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              heading.querySelectorAll('.kinetic-line').forEach((line) => line.classList.add('revealed'));
              observer.unobserve(heading);
            }
          });
        }, { threshold: 0.2 });
        obs.observe(heading);
      } else {
        heading.querySelectorAll('.kinetic-line').forEach((line) => line.classList.add('revealed'));
      }
    });

    // 2. Philosophy Words: Monumental Architectural Kinetic Tracking & Depth
    const philosophyItems = document.querySelectorAll('.philosophy__item');
    if (philosophyItems.length > 0 && window.innerWidth > 768) {
      let ticking = false;
      const updatePhilosophyKinetic = () => {
        const vh = window.innerHeight;
        philosophyItems.forEach((item) => {
          const word = item.querySelector('.philosophy__word');
          if (!word) return;
          const rect = item.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < vh) {
            const centerOffset = (vh / 2 - (rect.top + rect.height / 2)) / vh;
            const yShift = centerOffset * -20;
            const tracking = 0.03 + (1 - Math.min(1, Math.abs(centerOffset) * 2)) * 0.035;
            word.style.transform = `translateY(${yShift.toFixed(1)}px) translateZ(0)`;
            word.style.letterSpacing = `${tracking.toFixed(3)}em`;
          }
        });
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updatePhilosophyKinetic);
        }
      }, { passive: true });
    }

    // 3. "The Work Continues" Expansive Letter-Spacing Reveal
    const futureTitle = document.querySelector('.future__title');
    if (futureTitle && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            futureTitle.classList.add('revealed');
            observer.unobserve(futureTitle);
          }
        });
      }, { threshold: 0.25 });
      obs.observe(futureTitle);
    }
  }

  // ============================================================
  // SECTION 8: CINEMATIC SECTION TRANSITIONS & MULTI-PLANE PARALLAX
  // ============================================================
  function initCinematicTransitions() {
    const isMobile = window.innerWidth <= 768;

    // 1. Multi-plane image parallax (smooth 5% travel within overflow container)
    if (!isMobile) {
      const parallaxImages = document.querySelectorAll(
        '.editorial__image img, .sold-out__image img, .project-hero__bg img'
      );

      if (parallaxImages.length > 0) {
        let ticking = false;
        const updateParallax = () => {
          const vh = window.innerHeight;
          parallaxImages.forEach((img) => {
            const parent = img.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < vh) {
              const progress = (vh - rect.top) / (vh + rect.height);
              const yOffset = (progress - 0.5) * -28;
              img.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0) scale(1.06)`;
            }
          });
          ticking = false;
        };

        window.addEventListener('scroll', () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateParallax);
          }
        }, { passive: true });
      }

      // 2. 3D Card Hover Perspective on Deonarayan detail cards
      const detailCards = document.querySelectorAll('.project-hero__details > div');
      detailCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const rotX = (-y / (rect.height / 2)) * 5;
          const rotY = (x / (rect.width / 2)) * 5;
          card.style.transform = `perspective(600px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-3px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
      });
    }
  }

  // ============================================================
  // SECTION 9: SELECTIVE SPATIAL THREE.JS ENHANCEMENT
  // 1-2 Subtle Architectural Moments · Strict Performance Controls
  // ============================================================
  function initSpatialMoments() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    function setupSpatialScenes() {
      if (typeof window.THREE === 'undefined') {
        window.addEventListener('load', () => {
          if (typeof window.THREE !== 'undefined') setupSpatialScenes();
        }, { once: true });
        return;
      }

      const THREE = window.THREE;
      const isMobile = window.innerWidth <= 768;

      // -------------------------------------------------------------
      // MOMENT 1: Brand Resolution Architectural Coordinate Depth Field
      // -------------------------------------------------------------
      const brandCanvas = document.getElementById('brandSpatialCanvas');
      if (brandCanvas && dom.brandResolve) {
        try {
          let brandActive = false;
          let brandAnimId = null;

          const renderer = new THREE.WebGLRenderer({
            canvas: brandCanvas,
            alpha: true,
            antialias: !isMobile,
            powerPreference: 'low-power'
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(45, (brandCanvas.clientWidth || window.innerWidth) / (brandCanvas.clientHeight || window.innerHeight || 1), 0.1, 100);
          camera.position.set(0, 1.8, 7);
          camera.lookAt(0, 0, 0);

          // Subtle architectural coordinate plane
          const grid = new THREE.GridHelper(14, 18, 0xc8a86b, 0x2e2b26);
          grid.position.y = -1.4;
          grid.material.opacity = isMobile ? 0.16 : 0.26;
          grid.material.transparent = true;
          scene.add(grid);

          // Architectural ambient dust motes
          const count = isMobile ? 24 : 70;
          const geo = new THREE.BufferGeometry();
          const pos = new Float32Array(count * 3);
          const drift = new Float32Array(count);
          for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 12;
            pos[i * 3 + 1] = Math.random() * 5 - 1.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
            drift[i] = 0.0015 + Math.random() * 0.003;
          }
          geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const mat = new THREE.PointsMaterial({
            color: 0xc8a86b,
            size: isMobile ? 0.035 : 0.048,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
          });
          const points = new THREE.Points(geo, mat);
          scene.add(points);

          let targetX = 0;
          let targetY = 0;
          if (!isMobile) {
            window.addEventListener('mousemove', (e) => {
              targetX = (e.clientX / window.innerWidth - 0.5) * 0.45;
              targetY = (e.clientY / window.innerHeight - 0.5) * 0.28;
            }, { passive: true });
          }

          const resizeBrand = () => {
            const w = brandCanvas.parentElement ? brandCanvas.parentElement.clientWidth : window.innerWidth;
            const h = brandCanvas.parentElement ? brandCanvas.parentElement.clientHeight : window.innerHeight;
            camera.aspect = w / (h || 1);
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
          };
          resizeBrand();
          window.addEventListener('resize', resizeBrand);

          const renderBrand = () => {
            if (!brandActive) return;

            camera.position.x += (targetX - camera.position.x) * 0.04;
            camera.position.y += (1.8 - targetY - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);

            const positions = points.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] += drift[i];
              if (positions[i * 3 + 1] > 3.5) positions[i * 3 + 1] = -1.5;
            }
            points.geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
            brandAnimId = requestAnimationFrame(renderBrand);
          };

          // Strict IntersectionObserver: Pause WebGL completely when not visible
          if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                brandActive = entry.isIntersecting;
                if (brandActive) {
                  if (!brandAnimId) renderBrand();
                } else {
                  if (brandAnimId) {
                    cancelAnimationFrame(brandAnimId);
                    brandAnimId = null;
                  }
                }
              });
            }, { threshold: 0.05 });
            obs.observe(dom.brandResolve);
          } else {
            brandActive = true;
            renderBrand();
          }
        } catch (err) {
          console.warn('Brand spatial WebGL fallback:', err);
        }
      }

      // -------------------------------------------------------------
      // MOMENT 2: Future Section Architectural Horizon & Spatial Ring
      // -------------------------------------------------------------
      const futureCanvas = document.getElementById('futureSpatialCanvas');
      const futureSection = document.getElementById('future');
      if (futureCanvas && futureSection) {
        try {
          let futureActive = false;
          let futureAnimId = null;

          const renderer = new THREE.WebGLRenderer({
            canvas: futureCanvas,
            alpha: true,
            antialias: !isMobile,
            powerPreference: 'low-power'
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(50, (futureCanvas.clientWidth || window.innerWidth) / (futureCanvas.clientHeight || window.innerHeight || 1), 0.1, 100);
          camera.position.set(0, 1.6, 6.5);
          camera.lookAt(0, 0, 0);

          // Architectural receding horizon grid
          const horizon = new THREE.GridHelper(16, 20, 0xc8a86b, 0x1f2226);
          horizon.position.y = -1.2;
          horizon.material.opacity = isMobile ? 0.18 : 0.28;
          horizon.material.transparent = true;
          scene.add(horizon);

          // ThreeUI Codex-inspired spatial architectural ring
          const ringGeo = new THREE.RingGeometry(1.9, 1.925, 64);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xc8a86b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI * 0.38;
          scene.add(ringMesh);

          // Outer concentric secondary compass ring
          const ringGeo2 = new THREE.RingGeometry(2.5, 2.518, 64);
          const ringMat2 = new THREE.MeshBasicMaterial({
            color: 0x9c8454,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.18
          });
          const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
          ringMesh2.rotation.x = Math.PI * 0.38;
          scene.add(ringMesh2);

          let mouseX = 0;
          let mouseY = 0;
          if (!isMobile) {
            window.addEventListener('mousemove', (e) => {
              mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
              mouseY = (e.clientY / window.innerHeight - 0.5) * 0.22;
            }, { passive: true });
          }

          const resizeFuture = () => {
            const w = futureCanvas.parentElement ? futureCanvas.parentElement.clientWidth : window.innerWidth;
            const h = futureCanvas.parentElement ? futureCanvas.parentElement.clientHeight : window.innerHeight;
            camera.aspect = w / (h || 1);
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
          };
          resizeFuture();
          window.addEventListener('resize', resizeFuture);

          const renderFuture = () => {
            if (!futureActive) return;

            ringMesh.rotation.z += 0.0016;
            ringMesh2.rotation.z -= 0.0010;

            camera.position.x += (mouseX - camera.position.x) * 0.04;
            camera.position.y += (1.6 - mouseY - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            futureAnimId = requestAnimationFrame(renderFuture);
          };

          // Strict IntersectionObserver: Pause WebGL completely when future is out of viewport
          if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                futureActive = entry.isIntersecting;
                if (futureActive) {
                  if (!futureAnimId) renderFuture();
                } else {
                  if (futureAnimId) {
                    cancelAnimationFrame(futureAnimId);
                    futureAnimId = null;
                  }
                }
              });
            }, { threshold: 0.05 });
            obs.observe(futureSection);
          } else {
            futureActive = true;
            renderFuture();
          }
        } catch (err) {
          console.warn('Future spatial WebGL fallback:', err);
        }
      }

      // Global tab visibility pause: zero CPU/GPU consumption when backgrounded
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (brandAnimId) cancelAnimationFrame(brandAnimId);
          if (futureAnimId) cancelAnimationFrame(futureAnimId);
        }
      });
    }

    setupSpatialScenes();
  }

  // ============================================================
  // SPECIFICATIONS VIDEO MOTION WINDOW
  // Must remain real video, autoplay, loop, muted, inline, zero audio
  // ============================================================
  function initSpecificationVideo() {
    const video = dom.specVideo || document.getElementById('specificationVideo');
    if (!video) return;

    // Strict requirements: autoplay, loop continuously, remain muted, inline
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = true;
    video.playsInline = true;
    video.removeAttribute('controls');

    const attemptPlay = () => {
      video.muted = true;
      video.volume = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked autoplay, attempt muted retry on user interaction
          const resumeOnAction = () => {
            video.muted = true;
            video.volume = 0;
            video.play().catch(() => {});
            window.removeEventListener('click', resumeOnAction);
            window.removeEventListener('scroll', resumeOnAction);
            window.removeEventListener('touchstart', resumeOnAction);
          };
          window.addEventListener('click', resumeOnAction, { once: true });
          window.addEventListener('scroll', resumeOnAction, { once: true, passive: true });
          window.addEventListener('touchstart', resumeOnAction, { once: true, passive: true });
        });
      }
    };

    attemptPlay();

    // IntersectionObserver to optimize and resume playing when in view
    if ('IntersectionObserver' in window) {
      const specObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            attemptPlay();
          }
        });
      }, { threshold: 0.1 });
      specObserver.observe(video);
    }

    // Ensure it continues playing
    video.addEventListener('pause', () => {
      if (!video.seeking) {
        setTimeout(attemptPlay, 100);
      }
    });

    // Enforce silence on volume changes
    video.addEventListener('volumechange', () => {
      if (!video.muted || video.volume > 0) {
        video.muted = true;
        video.volume = 0;
      }
    });
  }

  // ============================================================
  // ZERO AUDIO — GLOBAL REQUIREMENT (COMPLETE SILENCE)
  // Absolutely no audio anywhere on website
  // ============================================================
  function initGlobalAudioControl() {
    const silenceElement = (el) => {
      el.muted = true;
      el.defaultMuted = true;
      el.volume = 0;
      el.removeAttribute('controls');
      el.addEventListener('volumechange', () => {
        if (!el.muted || el.volume > 0) {
          el.muted = true;
          el.volume = 0;
        }
      });
    };

    document.querySelectorAll('video, audio').forEach(silenceElement);

    // Guard against dynamically inserted media
    const mediaObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches && (node.matches('video') || node.matches('audio'))) {
              silenceElement(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('video, audio').forEach(silenceElement);
            }
          }
        });
      });
    });
    mediaObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ============================================================
  // LENIS SMOOTH SCROLLING ENGINE
  // Controlled, premium, cinematic, natural without breaking navigation
  // ============================================================
  let lenisInstance = null;

  function initLenisSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    try {
      lenisInstance = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.25,
        infinite: false,
      });

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Anchor link clicks for smooth Lenis scrolling
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId && targetId !== '#') {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              lenisInstance.scrollTo(targetEl, {
                offset: -40,
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              });
            }
          }
        });
      });
    } catch (err) {
      console.warn('Lenis smooth scroll fallback to native:', err);
    }
  }

  // ============================================================
  // COMPLIANCE SUITE (DISCLAIMER NOTICE, COOKIE BAR, GEOLOCATION)
  // Calm architectural luxury, zero obstruction over entry film
  // ============================================================
  let complianceFlowStarted = false;
  let lastActiveFocus = null;

  function triggerPostHeroCompliance() {
    if (complianceFlowStarted) return;
    complianceFlowStarted = true;
    setTimeout(() => {
      startComplianceFlow();
    }, 600);
  }

  function startComplianceFlow() {
    const isDisclaimerDismissed = localStorage.getItem('skyscraper_disclaimer_dismissed');
    if (!isDisclaimerDismissed) {
      showDisclaimerNotice();
    } else {
      checkCookieConsent();
    }
  }

  function showDisclaimerNotice() {
    if (!dom.disclaimerModal) return;
    lastActiveFocus = document.activeElement;
    dom.disclaimerModal.classList.add('active');

    if (dom.disclaimerDismissBtn) {
      dom.disclaimerDismissBtn.focus();
    }

    const onDisclaimerKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissDisclaimerNotice();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = dom.disclaimerModal.querySelectorAll('a[href], button:not([disabled])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onDisclaimerKeyDown);
    dom._onDisclaimerKeyDown = onDisclaimerKeyDown;
  }

  function dismissDisclaimerNotice() {
    if (!dom.disclaimerModal) return;
    try {
      localStorage.setItem('skyscraper_disclaimer_dismissed', new Date().toISOString());
    } catch (e) {}

    dom.disclaimerModal.classList.remove('active');

    if (dom._onDisclaimerKeyDown) {
      window.removeEventListener('keydown', dom._onDisclaimerKeyDown);
      dom._onDisclaimerKeyDown = null;
    }

    if (lastActiveFocus && typeof lastActiveFocus.focus === 'function') {
      try {
        lastActiveFocus.focus();
      } catch (e) {}
    }

    // Sequence requirement: show cookie bar only AFTER disclaimer is dismissed
    checkCookieConsent();
  }

  function checkCookieConsent() {
    const consent = localStorage.getItem('skyscraper_cookie_consent');

    if (consent === 'accepted') {
      unGateThirdPartyEmbeds();
      return;
    }

    if (consent === 'declined') {
      return; // remains gated, do not show bar
    }

    // If neither accepted nor declined, display slim cookie bar
    if (dom.cookieBar) {
      dom.cookieBar.classList.add('active');
    }
  }

  function unGateThirdPartyEmbeds() {
    document.querySelectorAll('iframe[data-cookie-src]').forEach((iframe) => {
      if (iframe.dataset.cookieSrc && iframe.src !== iframe.dataset.cookieSrc) {
        iframe.src = iframe.dataset.cookieSrc;
      }
    });
  }

  function handleCookieChoice(choice) {
    try {
      localStorage.setItem('skyscraper_cookie_consent', choice);
      localStorage.setItem('skyscraper_cookie_consent_at', new Date().toISOString());
    } catch (e) {}

    if (dom.cookieBar) {
      dom.cookieBar.classList.remove('active');
    }

    if (choice === 'accepted') {
      unGateThirdPartyEmbeds();
    }
  }

  // Geolocation: Request strictly on user click of site-visit or location CTA
  function requestGeolocationOnUserAction() {
    if (state.enquiryData.lat !== undefined && state.enquiryData.lat !== null) return;
    if (!('geolocation' in navigator)) return;

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords) {
            state.enquiryData.lat = Math.round(pos.coords.latitude * 1000) / 1000;
            state.enquiryData.lng = Math.round(pos.coords.longitude * 1000) / 1000;
          }
        },
        (err) => {
          // Graceful fallback: silently ignore error; form submits normally
          console.warn('[Geolocation] Non-blocking permission/error:', err.message);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    } catch (e) {
      console.warn('[Geolocation] Invocation error:', e);
    }
  }

  function initComplianceSuite() {
    if (dom.disclaimerDismissBtn) {
      dom.disclaimerDismissBtn.addEventListener('click', dismissDisclaimerNotice);
    }
    if (dom.disclaimerBackdrop) {
      dom.disclaimerBackdrop.addEventListener('click', dismissDisclaimerNotice);
    }

    if (dom.cookieAcceptBtn) {
      dom.cookieAcceptBtn.addEventListener('click', () => handleCookieChoice('accepted'));
    }
    if (dom.cookieDeclineBtn) {
      dom.cookieDeclineBtn.addEventListener('click', () => handleCookieChoice('declined'));
    }

    // Check if user has already accepted cookies in a previous session
    if (localStorage.getItem('skyscraper_cookie_consent') === 'accepted') {
      unGateThirdPartyEmbeds();
    }

    // Attach Geolocation trigger to existing site-visit and location CTAs
    document.querySelectorAll('a[href="#enquiry"], a[href="#location"]').forEach((el) => {
      el.addEventListener('click', () => {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('visit') || text.includes('presentation') || el.getAttribute('href') === '#location') {
          requestGeolocationOnUserAction();
        }
      });
    });

    // Also trigger if user selects site visit intent in Step 1
    const siteVisitIntentBtn = document.querySelector('[data-enquiry-intent*="Site Visit"]');
    if (siteVisitIntentBtn) {
      siteVisitIntentBtn.addEventListener('click', requestGeolocationOnUserAction);
    }

    // Observe brand resolution section so compliance triggers once resolved
    if (dom.brandResolve && 'IntersectionObserver' in window) {
      const brandObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerPostHeroCompliance();
            brandObserver.disconnect();
          }
        });
      }, { threshold: 0.15 });
      brandObserver.observe(dom.brandResolve);
    }
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    cacheDom();
    initGlobalAudioControl();
    initHeroFilm();
    new FrameScroller();
    initSpecificationVideo();
    initFloorPlanViewer();
    initEnquiryFlow();
    initNavigation();
    initRevealObserver();
    initKineticTypography();
    initCinematicTransitions();
    initSpatialMoments();
    initLenisSmoothScroll();
    initComplianceSuite();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

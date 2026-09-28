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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
          dom.brandResolve.scrollIntoView({ behavior: 'smooth' });
          revealBrandElements();
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
      const windowForward = 25;
      const windowBack = 8;
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
      if (!dom.archSection) return;
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
      const diff = this.targetFrameIndex - this.currentFrameIndex;
      if (Math.abs(diff) > 0.05) {
        this.currentFrameIndex += diff * 0.28;
        const rounded = Math.round(this.currentFrameIndex);
        if (rounded !== this.lastRenderedIndex) {
          this.renderFrame(rounded);
          this.updatePhase(rounded);
        }
        requestAnimationFrame(() => this.loop());
      } else {
        this.currentFrameIndex = this.targetFrameIndex;
        const rounded = Math.round(this.currentFrameIndex);
        this.renderFrame(rounded);
        this.updatePhase(rounded);
        this.isRendering = false;
      }
    }

    init() {
      this.resize();
      this.preloadInitialBatch();
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
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

    if (dom.enquiryForm) {
      dom.enquiryForm.addEventListener('submit', (e) => {
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

        setTimeout(() => {
          goToStep(4);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Enquiry';
          }
        }, 600);
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
  // INIT
  // ============================================================
  function init() {
    cacheDom();
    initHeroFilm();
    new FrameScroller();
    initFloorPlanViewer();
    initEnquiryFlow();
    initNavigation();
    initRevealObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

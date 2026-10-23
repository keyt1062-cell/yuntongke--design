import { useEffect, useMemo, useRef, useState } from "react";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const thumbnailAsset = (path) => path.replace(/\.(?:jpe?g|png|webp)$/i, "-thumb.webp");
const displayAsset = (path) => path.replace(/\.(?:jpe?g|png|webp)$/i, "-display.webp");

const archiveProjects = [
  {
    id: "archive", number: "02", year: "2025", title: "Synthetic Perception Archive",
    image: "optimized/archive/emotion-entity-03.webp", category: "Speculative archive / machine cognition",
    role: "World-building, visual direction and interface narrative",
    methods: "Taxonomy design, image experimentation and editorial framing",
    outcome: "Four connected archive records",
    description: "A speculative research archive examining how artificial intelligence might reconstruct — and misread — emotion, memory, space and fear.",
    anchor: "synthetic-archive",
  },
  {
    id: "weather", number: "01", year: "2024", title: "Emotional Weather Bureau",
    image: "optimized/emotional-weather/serenity-sky.webp", category: "AIGC concept art / speculative design",
    role: "Concept, AI art direction, editing and sequencing",
    methods: "Concept mapping, prompt iteration, visual selection and retouching",
    outcome: "An eight-part visual weather system",
    description: "An exploratory system that visualises emotional states as dynamic weather landscapes.",
    anchor: "emotional-weather",
  },
  {
    id: "heritage", number: "03", year: "2026", title: "Shanxi Heritage × Dragon Mythology",
    image: "optimized/fantasy/heritage-panorama.jpg", category: "Cultural heritage / visual identity",
    role: "Research, concept development, AI art direction and layout",
    methods: "Site research, motif studies, prompt iteration and series standardisation",
    outcome: "A nine-location poster system and campaign key visual",
    description: "Historic architecture and city landmarks reframed through a recurring Chinese dragon mythology.",
    anchor: "shanxi-heritage",
  },
];

const weatherWorks = [
  ["Anxiety Storm", "optimized/emotional-weather/anxiety-storm.webp"],
  ["Loneliness Fog", "optimized/emotional-weather/loneliness-fog.webp"],
  ["Nostalgia Monsoon", "optimized/emotional-weather/nostalgia-monsoon.webp"],
  ["Anger Thunderstorm", "optimized/emotional-weather/anger-thunderstorm.webp"],
  ["Hope Aurora", "optimized/emotional-weather/hope-aurora.webp"],
  ["Algorithm Cold Wave", "optimized/emotional-weather/algorithm-cold-wave.webp"],
  ["Serenity Sky", "optimized/emotional-weather/serenity-sky.webp"],
  ["Social Media Sandstorm", "optimized/emotional-weather/social-media-sandstorm.webp"],
];

const syntheticWorks = [
  ["Emotion Entity 03", "optimized/archive/emotion-entity-03.webp"],
  ["Memory Compression Device", "optimized/archive/memory-compression-device.webp"],
  ["Perception Zone", "optimized/archive/perception-zone.webp"],
  ["Signal Collapse", "optimized/archive/signal-collapse.webp"],
];

const heritageWorks = [
  ["Yungang Grottoes", "optimized/heritage/yungang-grottoes.jpg"],
  ["Hanging Temple", "optimized/heritage/hanging-temple.jpg"],
  ["Yingxian Pagoda", "optimized/heritage/yingxian-pagoda.jpg"],
  ["Datong Wall", "optimized/heritage/datong-wall.jpg"],
  ["Mingtang Heritage Park", "optimized/heritage/mingtang.jpg"],
  ["Chunyang Palace", "optimized/heritage/chunyang-palace.jpg"],
  ["Daiwang Palace", "optimized/heritage/daiwang-palace.jpg"],
  ["Drum Tower", "optimized/heritage/drum-tower.jpg"],
  ["White Pagoda", "optimized/heritage/white-pagoda.jpg"],
];

const atmospherePalettes = {
  weather: [[0.08, 0.28, 0.42], [0.38, 0.18, 0.28]],
  archive: [[0.12, 0.36, 0.40], [0.22, 0.12, 0.36]],
  heritage: [[0.10, 0.30, 0.34], [0.48, 0.20, 0.12]],
};

function AtmosphereCanvas({ palette }) {
  const canvasRef = useRef(null);
  const paletteRef = useRef(palette);

  useEffect(() => { paletteRef.current = palette; }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return undefined;

    const vertexSource = `
      attribute vec2 aPosition;
      void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
    `;
    const fragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform float uScroll;
      uniform float uVelocity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += noise(p) * amplitude;
          p = mat2(1.6, -1.2, 1.2, 1.6) * p + 0.17;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 safeResolution = max(uResolution, vec2(1.0));
        vec2 uv = gl_FragCoord.xy / safeResolution;
        vec2 p = (gl_FragCoord.xy * 2.0 - safeResolution.xy) / min(safeResolution.x, safeResolution.y);
        vec2 pointer = vec2(uPointer.x * 2.0 - 1.0, (1.0 - uPointer.y) * 2.0 - 1.0);
        pointer.x *= safeResolution.x / safeResolution.y;

        float t = uTime * 0.075;
        vec2 flow = vec2(fbm(p * 1.18 + vec2(t, -t * 0.7)), fbm(p * 1.34 + vec2(-t * 0.55, t)));
        vec2 warped = p + (flow - 0.5) * 0.42;
        float silk = fbm(warped * 2.2 + vec2(t * 0.8, -t));
        float contour = sin((warped.x * 2.1 + warped.y * 1.35 + silk * 2.8) * 4.0 - t * 2.0);
        float caustic = pow(max(0.0, contour * 0.5 + 0.5), 7.0);

        vec2 lensCenter = vec2(-0.22, 0.12);
        lensCenter += (pointer - lensCenter) * 0.035;
        vec2 lensP = p - lensCenter;
        lensP.x *= 0.82;
        float lensWarp = fbm(lensP * 2.8 + vec2(t, -t)) * 0.075;
        float lensDistance = length(lensP) - (0.61 + lensWarp);
        float lens = 1.0 - smoothstep(-0.02, 0.055, lensDistance);
        float rim = 1.0 - smoothstep(0.0, 0.038, abs(lensDistance));
        float innerGlow = exp(-abs(lensDistance) * 18.0) * lens;

        float halo = exp(-length(p - pointer) * 1.8);
        float ripple = sin(length(p - pointer) * 18.0 - uTime * 1.25) * halo;
        vec3 color = vec3(0.009, 0.015, 0.024);
        color += mix(uColorA, uColorB, silk) * (0.11 + silk * 0.18);
        color += vec3(0.42, 0.78, 0.94) * caustic * 0.23;
        color = mix(color, color * 1.36 + vec3(0.05, 0.085, 0.115), lens * 0.76);
        color += vec3(0.55, 0.86, 1.0) * rim * 0.42;
        color += vec3(1.0, 0.43, 0.31) * rim * smoothstep(-0.15, 0.55, lensP.x) * 0.26;
        color += vec3(0.84, 0.94, 1.0) * innerGlow * 0.16;
        color += uColorA * max(0.0, ripple) * 0.025;
        color += uColorA * halo * (0.035 + uVelocity * 0.04);

        float vignette = smoothstep(1.55, 0.24, length(p * vec2(0.72, 0.9)));
        color *= 0.58 + vignette * 0.52;
        color += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.018;
        gl_FragColor = vec4(color, 0.985);
      }
    `;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, "uResolution"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      time: gl.getUniformLocation(program, "uTime"),
      scroll: gl.getUniformLocation(program, "uScroll"),
      velocity: gl.getUniformLocation(program, "uVelocity"),
      colorA: gl.getUniformLocation(program, "uColorA"),
      colorB: gl.getUniformLocation(program, "uColorB"),
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointerTarget = { x: 0.5, y: 0.45 };
    const pointerCurrent = { ...pointerTarget };
    let previousScroll = window.scrollY;
    let velocity = 0;
    let frame = 0;
    let pageVisible = !document.hidden;
    let heroVisible = true;
    let lastTime = performance.now();
    let lastPaint = 0;
    const frameInterval = window.innerWidth < 720 ? 1000 / 30 : 1000 / 45;
    let colorA = [...paletteRef.current[0]];
    let colorB = [...paletteRef.current[1]];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 0.75 : 1);
      const width = Math.max(1, Math.round(window.innerWidth * dpr));
      const height = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    const onPointerMove = (event) => {
      pointerTarget.x = event.clientX / Math.max(window.innerWidth, 1);
      pointerTarget.y = event.clientY / Math.max(window.innerHeight, 1);
    };
    const render = (now) => {
      frame = 0;
      if (!pageVisible || !heroVisible) return;
      if (!reducedMotion && now - lastPaint < frameInterval) {
        frame = requestAnimationFrame(render);
        return;
      }
      lastPaint = now;
      resize();
      const delta = Math.min(32, now - lastTime); lastTime = now;
      const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scroll = window.scrollY;
      const targetVelocity = Math.min(1, Math.abs(scroll - previousScroll) / Math.max(delta, 1) * 0.22);
      previousScroll = scroll;
      velocity += (targetVelocity - velocity) * 0.08;
      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.055;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.055;
      colorA = colorA.map((value, index) => value + (paletteRef.current[0][index] - value) * 0.025);
      colorB = colorB.map((value, index) => value + (paletteRef.current[1][index] - value) * 0.025);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.pointer, pointerCurrent.x, pointerCurrent.y);
      gl.uniform1f(uniforms.time, now * 0.001);
      gl.uniform1f(uniforms.scroll, scroll / range);
      gl.uniform1f(uniforms.velocity, velocity);
      gl.uniform3fv(uniforms.colorA, colorA);
      gl.uniform3fv(uniforms.colorB, colorB);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame && pageVisible && heroVisible) frame = requestAnimationFrame(render);
    };
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) { lastTime = performance.now(); schedule(); }
      else if (frame) { cancelAnimationFrame(frame); frame = 0; }
    };
    const hero = document.querySelector(".archive-hero");
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) schedule();
      else if (frame) { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: "12% 0px" });
    if (hero) heroObserver.observe(hero);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    render(performance.now());

    return () => {
      pageVisible = false;
      if (frame) cancelAnimationFrame(frame);
      heroObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
    };
  }, []);

  return <canvas className="ambient-canvas" ref={canvasRef} aria-hidden="true" />;
}

function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45, active: false };
    let particles = [];
    let frame = 0;
    let pageVisible = !document.hidden;
    let heroVisible = true;
    let lastPaint = 0;
    const frameInterval = window.innerWidth < 720 ? 1000 / 30 : 1000 / 45;
    let previousScroll = window.scrollY;
    let scrollEnergy = 0;

    const createParticle = (randomDepth = true) => ({
      x: (Math.random() - 0.5) * 1.9,
      y: (Math.random() - 0.5) * 1.35,
      z: randomDepth ? Math.random() * 0.92 + 0.08 : 1,
      size: Math.random() * 1.5 + 0.55,
      drift: (Math.random() - 0.5) * 0.0007,
      hue: Math.random() > 0.72 ? "255,107,91" : "113,222,246",
    });
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const desired = width < 720 ? 24 : Math.min(72, Math.round(width / 22));
      if (particles.length !== desired) particles = Array.from({ length: desired }, () => createParticle());
    };
    const onPointerMove = (event) => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; };
    const onPointerLeave = () => { pointer.active = false; };
    const draw = (now = performance.now()) => {
      frame = 0;
      if (!pageVisible || !heroVisible) return;
      if (!reducedMotion && now - lastPaint < frameInterval) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;
      const width = canvas.width;
      const height = canvas.height;
      const currentScroll = window.scrollY;
      const targetEnergy = Math.min(1, Math.abs(currentScroll - previousScroll) / 42);
      previousScroll = currentScroll;
      scrollEnergy += (targetEnergy - scrollEnergy) * 0.1;
      const baseOpacity = width < 720 ? 0.62 : 0.84;
      canvas.style.opacity = `${Math.max(0.16, baseOpacity - Math.min(1, currentScroll / Math.max(window.innerHeight, 1)) * 0.66)}`;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      particles.forEach((particle) => {
        const previousZ = particle.z;
        particle.z -= 0.0016 + scrollEnergy * 0.012;
        particle.x += particle.drift;
        if (particle.z < 0.035 || Math.abs(particle.x) > 1.25) Object.assign(particle, createParticle(false));
        const perspective = 1 / (particle.z * 1.7 + 0.18);
        let screenX = width * 0.5 + particle.x * width * 0.38 * perspective;
        let screenY = height * 0.5 + particle.y * height * 0.48 * perspective;
        const dx = screenX - pointer.x;
        const dy = screenY - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (pointer.active && distance < 180) {
          const push = (1 - distance / 180) * 20;
          screenX += (dx / Math.max(distance, 1)) * push;
          screenY += (dy / Math.max(distance, 1)) * push;
        }
        const alpha = Math.min(0.82, (1 - particle.z) * 0.72 + 0.08);
        const radius = particle.size * perspective * (1 + scrollEnergy * 1.8);
        const trail = Math.max(2, (previousZ - particle.z) * height * perspective * (10 + scrollEnergy * 32));
        const gradient = context.createLinearGradient(screenX, screenY - trail, screenX, screenY + radius);
        gradient.addColorStop(0, `rgba(${particle.hue},0)`);
        gradient.addColorStop(1, `rgba(${particle.hue},${alpha})`);
        context.strokeStyle = gradient;
        context.lineWidth = Math.max(0.45, radius * 0.48);
        context.beginPath(); context.moveTo(screenX, screenY - trail); context.lineTo(screenX, screenY); context.stroke();
        context.fillStyle = `rgba(${particle.hue},${alpha})`;
        context.beginPath(); context.arc(screenX, screenY, Math.max(0.7, radius), 0, Math.PI * 2); context.fill();

        if (pointer.active && distance < 145) {
          context.strokeStyle = `rgba(${particle.hue},${(1 - distance / 145) * 0.16})`;
          context.lineWidth = 0.55;
          context.beginPath(); context.moveTo(screenX, screenY); context.lineTo(pointer.x, pointer.y); context.stroke();
        }
      });
      context.globalCompositeOperation = "source-over";
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!frame && pageVisible && heroVisible) frame = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) schedule();
      else if (frame) { cancelAnimationFrame(frame); frame = 0; }
    };
    const hero = document.querySelector(".archive-hero");
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) schedule();
      else if (frame) { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: "12% 0px" });
    if (hero) heroObserver.observe(hero);
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    draw();
    return () => {
      pageVisible = false;
      if (frame) cancelAnimationFrame(frame);
      heroObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas className="particle-canvas" ref={canvasRef} aria-hidden="true" />;
}

function CursorLens() {
  const lensRef = useRef(null);
  useEffect(() => {
    const lens = lensRef.current;
    if (!lens) return undefined;
    const move = (event) => {
      lens.style.setProperty("--lens-x", `${event.clientX}px`);
      lens.style.setProperty("--lens-y", `${event.clientY}px`);
      lens.classList.add("is-visible");
    };
    const leave = () => lens.classList.remove("is-visible");
    const down = () => lens.classList.add("is-pressed");
    const up = () => lens.classList.remove("is-pressed");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);
  return <span className="cursor-lens" ref={lensRef} aria-hidden="true"><i /></span>;
}

function ProjectPlate({ project, position, dragX, onSelect }) {
  const isActive = position === 0;
  return (
    <button
      className={`archive-plate archive-plate-${position} ${isActive ? "is-active" : ""}`}
      style={{ "--drag-x": `${dragX}px` }} type="button"
      onClick={() => onSelect(project.id)} aria-pressed={isActive}
    >
      <img src={asset(isActive ? displayAsset(project.image) : thumbnailAsset(project.image))} alt="" draggable="false" fetchPriority={isActive ? "high" : "low"} />
      <span className="plate-shade" aria-hidden="true" />
      <span className="plate-light" aria-hidden="true" />
      <span className="plate-index">{project.number}</span>
      <span className="plate-copy"><strong>{project.title}</strong><small>{project.year}</small></span>
      <span className="plate-category">{project.category}</span>
    </button>
  );
}

function WorkGallery({ items, label }) {
  const [active, setActive] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const closeRef = useRef(null);
  const lastFocusRef = useRef(null);
  const selectRelative = (direction) => setActive((current) => (current + direction + items.length) % items.length);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    lastFocusRef.current = document.activeElement;
    document.body.classList.add("lightbox-open");
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowLeft") selectRelative(-1);
      if (event.key === "ArrowRight") selectRelative(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", handleKey);
      lastFocusRef.current?.focus?.();
    };
  }, [isLightboxOpen, items.length]);

  const moveLight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--gallery-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--gallery-y", `${event.clientY - bounds.top}px`);
  };
  return (
    <div className="work-gallery">
      <figure className="work-gallery-main" onPointerMove={moveLight}>
        <button className="work-gallery-image-button" type="button" onClick={() => setIsLightboxOpen(true)} aria-label={`Open ${items[active][0]} in fullscreen`}>
          <img
            key={items[active][1]}
            src={asset(displayAsset(items[active][1]))}
            srcSet={`${asset(thumbnailAsset(items[active][1]))} 420w, ${asset(displayAsset(items[active][1]))} 720w, ${asset(items[active][1])} 1000w`}
            sizes="(max-width: 720px) calc(100vw - 38px), (max-width: 1200px) calc(100vw - 12vw), 1120px"
            alt={items[active][0]}
            loading="lazy"
            decoding="async"
          />
          <span className="fullscreen-hint"><i aria-hidden="true" />View fullscreen</span>
        </button>
        <figcaption aria-live="polite"><span>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><strong>{items[active][0]}</strong></figcaption>
        <div className="gallery-step-controls" aria-label="Artwork navigation">
          <button type="button" onClick={() => selectRelative(-1)} aria-label="Previous artwork">←</button>
          <button type="button" onClick={() => selectRelative(1)} aria-label="Next artwork">→</button>
        </div>
      </figure>
      <div className="work-gallery-list" role="group" aria-label={label} style={{ "--item-count": Math.min(items.length, 9) }}>
        {items.map(([title, src], index) => (
          <button key={src} className={index === active ? "is-active" : ""} type="button" onClick={() => setActive(index)} aria-pressed={index === active}>
            <img src={asset(thumbnailAsset(src))} alt="" loading="lazy" decoding="async" />
            <span><i>{String(index + 1).padStart(2, "0")}</i>{title}</span>
          </button>
        ))}
      </div>
      {isLightboxOpen && (
        <div className="artwork-lightbox" role="dialog" aria-modal="true" aria-label={`${label}: ${items[active][0]}`} onPointerDown={(event) => { if (event.target === event.currentTarget) setIsLightboxOpen(false); }}>
          <div className="lightbox-topline">
            <span>{label}</span>
            <span>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            <button ref={closeRef} type="button" onClick={() => setIsLightboxOpen(false)}>Close <i>×</i></button>
          </div>
          <figure>
            <img key={`lightbox-${items[active][1]}`} src={asset(items[active][1])} alt={items[active][0]} />
            <figcaption>{items[active][0]}</figcaption>
          </figure>
          <div className="lightbox-controls">
            <button type="button" onClick={() => selectRelative(-1)} aria-label="Previous artwork">← <span>Previous</span></button>
            <small>Use arrow keys to explore · Esc to close</small>
            <button type="button" onClick={() => selectRelative(1)} aria-label="Next artwork"><span>Next</span> →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectSection({ project, eyebrow, statement, items, process, nextProject }) {
  return (
    <section className="project-case" id={project.anchor} data-project={project.number}>
      <div className="project-case-heading" data-reveal>
        <span>{project.number}</span><p>{eyebrow}</p><h2>{project.title}</h2><h3>{statement}</h3>
      </div>
      <div className="project-case-intro" data-reveal>
        <p>{project.description}</p>
        <dl>
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Methods</dt><dd>{project.methods}</dd></div>
          <div><dt>Outcome</dt><dd>{project.outcome}</dd></div>
        </dl>
      </div>
      <ol className="process-line" aria-label={`${project.title} process`} data-reveal>
        {process.map((step, index) => <li key={step}><i>{String(index + 1).padStart(2, "0")}</i><span>{step}</span></li>)}
      </ol>
      <div data-reveal><WorkGallery items={items} label={`${project.title} artwork`} /></div>
      <a className="next-project" href={`#${nextProject.anchor}`} data-reveal>
        <span>Continue to project {nextProject.number}</span><strong>{nextProject.title}</strong><i aria-hidden="true">↘</i>
      </a>
    </section>
  );
}

const portfolioKnowledge = [
  {
    id: "profile",
    keywords: "who about yuntong ke 柯雲童 柯云童 designer profile education based location background 介绍 关于 教育 学校",
    text: "Yuntong Ke is an independent visual designer and Digital Media Art student at Chengdu College of Arts and Sciences, currently based in Beijing, China. Her practice connects cultural research, speculative storytelling, AIGC, moving image and digital experience.",
  },
  {
    id: "practice",
    keywords: "practice focus skill tools software 方法 技能 软件 工具 擅长 方向",
    text: "Yuntong focuses on AIGC, visual narrative, interaction and culturally grounded creative direction. Her tools include Photoshop, Illustrator, After Effects, Cinema 4D, Maya and Unity. She treats emerging technology as a creative material rather than a replacement for critical design decisions.",
  },
  {
    id: "weather",
    keywords: "emotional weather bureau anxiety loneliness nostalgia anger hope algorithm serenity sandstorm project 情绪 天气 项目",
    text: "Emotional Weather Bureau (2024) is an eight-part AIGC concept-art system that translates inner states into environmental weather. The sequence includes Anxiety Storm, Loneliness Fog, Nostalgia Monsoon, Anger Thunderstorm, Hope Aurora, Algorithm Cold Wave, Serenity Sky and Social Media Sandstorm. Yuntong led concept development, AI art direction, editing and sequencing.",
  },
  {
    id: "archive",
    keywords: "synthetic perception archive ai machine cognition memory signal emotion entity project 合成 感知 档案 人工智能 项目",
    text: "Synthetic Perception Archive (2025) is a speculative future-museum interface about how AI might reconstruct — and misread — emotion, memory, space and fear. Its four records are Emotion Entity 03, Memory Compression Device, Perception Zone and Signal Collapse. Yuntong developed the world, taxonomy, visual direction and interface narrative.",
  },
  {
    id: "heritage",
    keywords: "shanxi heritage dragon mythology yungang hanging temple pagoda datong mingtang chunyang daiwang drum tower white pagoda 山西 龙 云冈 悬空寺 应县木塔 大同 古建 项目",
    text: "Shanxi Heritage × Dragon Mythology (2026) reframes architectural memory through a recurring Chinese dragon. The series contains nine works: Yungang Grottoes, Hanging Temple, Yingxian Pagoda, Datong Wall, Mingtang Heritage Park, Chunyang Palace, Daiwang Palace, Drum Tower and White Pagoda. Its four-stage process was: research the sites, extract motifs, develop a shared visual language, then standardise the full series. Yuntong led research, concept development, AI art direction and layout.",
  },
  {
    id: "recognition",
    keywords: "award recognition prize competition 获奖 奖项 比赛 荣誉",
    text: "Selected recognition includes a National Third Prize and Provincial Second Prize in the 17th National College Student Advertising Art Competition, selection for the Sichuan Student Innovation & Entrepreneurship Programme, and a Provincial Third Prize in the Sichuan Student Digital Media Art & Design Competition.",
  },
  {
    id: "contact",
    keywords: "contact email collaborate commission available hire work study 联系 邮箱 合作 委托",
    text: "Yuntong is available for study, commissions and international collaboration. Contact her directly at keyuntong@126.com.",
  },
];

const agentSuggestions = [
  "Which project best shows her design process?",
  "Tell me about the Shanxi heritage series.",
  "What tools and methods does Yuntong use?",
];

const normaliseQuery = (value) => value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff\s]/g, " ").split(/\s+/).filter(Boolean);

function retrieveKnowledge(query, limit = 3) {
  const tokens = normaliseQuery(query);
  const scored = portfolioKnowledge.map((entry) => {
    const haystack = `${entry.keywords} ${entry.text}`.toLowerCase();
    const keywordTokens = normaliseQuery(entry.keywords);
    const directScore = tokens.reduce((total, token) => total + (haystack.includes(token) ? Math.max(1, token.length) : 0), 0);
    const reverseScore = keywordTokens.reduce((total, token) => total + (query.toLowerCase().includes(token) ? Math.max(2, token.length * 2) : 0), 0);
    const score = directScore + reverseScore;
    return { ...entry, score };
  }).sort((a, b) => b.score - a.score);
  return (scored[0]?.score > 0 ? scored : portfolioKnowledge.slice(0, 3)).slice(0, limit);
}

function localPortfolioAnswer(query, matches) {
  const lower = query.toLowerCase();
  const chinese = /[\u4e00-\u9fff]/.test(query);
  const joined = matches.map((item) => item.text).join(" ");
  if (/email|contact|reach|联系|邮箱|合作/.test(lower)) return chinese ? "你可以通过 keyuntong@126.com 联系柯雲童。她目前接受升学交流、设计委托与国际合作。" : "You can reach Yuntong at keyuntong@126.com. She is available for study, commissions and international collaboration.";
  if (/which|best|recommend|strongest|哪个|推荐|最能/.test(lower)) return chinese ? "如果你想快速理解她的设计方法，我建议先看《山西文化遗产 × 龙神话》：它最完整地呈现了从场地研究、母题提取、视觉语言开发到九张系列标准化的过程。之后可看《情绪气象局》，了解她如何把抽象情绪转译成视觉系统。" : "Start with Shanxi Heritage × Dragon Mythology: it most clearly shows her process from site research and motif extraction to visual-language development and a consistent nine-piece system. Then view Emotional Weather Bureau to see how she translates abstract emotions into a visual system.";
  return chinese ? `根据作品集资料：${joined}` : joined;
}

function PortfolioAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi — I’m YK Archive Agent. Ask me about Yuntong’s projects, process, skills or availability.", source: "Portfolio knowledge" },
  ]);
  const inputRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (isOpen) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const ask = async (rawQuestion) => {
    const question = rawQuestion.trim().slice(0, 420);
    if (!question || isThinking) return;
    const matches = retrieveKnowledge(question);
    const fallback = localPortfolioAnswer(question, matches);
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setIsThinking(true);
    try {
      const endpoint = window.__PORTFOLIO_AGENT_ENDPOINT__ || "https://yuntongke-portfolio-agent.netlify.app/api/portfolio-agent";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context: matches.map(({ id, text }) => ({ id, text })),
          history: messages.slice(-4).map(({ role, text }) => ({ role, content: text })),
        }),
      });
      if (!response.ok) throw new Error("Agent service unavailable");
      const payload = await response.json();
      if (!payload.answer) throw new Error("Empty answer");
      setMessages((current) => [...current, { role: "assistant", text: payload.answer, source: "Qwen · grounded in portfolio" }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: fallback, source: "Local portfolio answer" }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <aside className={`portfolio-agent ${isOpen ? "is-open" : ""}`} aria-label="Portfolio assistant">
      <button className="agent-orb" type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} aria-controls="portfolio-agent-panel">
        <span className="sr-only">{isOpen ? "Close" : "Open"} YK portfolio agent</span>
        <span className="agent-orb-core" aria-hidden="true"><i /><i /><i /></span>
        <span><strong>Ask YK</strong><small>Portfolio agent</small></span>
      </button>
      <section className="agent-panel" id="portfolio-agent-panel" aria-hidden={!isOpen}>
        <header>
          <div><span className="agent-live"><i />Online</span><strong>YK Archive Agent</strong><small>Answers from this portfolio · powered by Qwen</small></div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close portfolio agent">×</button>
        </header>
        <div className="agent-messages" ref={logRef} role="log" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`agent-message is-${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === "assistant" ? "YK" : "You"}</span>
              <p>{message.text}</p>
              {message.source && <small>{message.source}</small>}
            </div>
          ))}
          {isThinking && <div className="agent-message is-assistant is-thinking"><span>YK</span><p><i /><i /><i /></p><small>Reading the archive</small></div>}
        </div>
        {messages.length < 3 && (
          <div className="agent-suggestions">
            {agentSuggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}<i>↗</i></button>)}
          </div>
        )}
        <form onSubmit={(event) => { event.preventDefault(); ask(input); }}>
          <label htmlFor="agent-question">Ask about the work</label>
          <div><input ref={inputRef} id="agent-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type your question…" maxLength="420" autoComplete="off" /><button type="submit" disabled={!input.trim() || isThinking} aria-label="Send question">↑</button></div>
          <small>Public access · no login required</small>
        </form>
      </section>
    </aside>
  );
}

function App() {
  const [activeId, setActiveId] = useState("weather");
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSection, setCurrentSection] = useState("home");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const stageRef = useRef(null);
  const startXRef = useRef(0);
  const activeIndex = archiveProjects.findIndex((project) => project.id === activeId);
  const activeProject = archiveProjects[activeIndex];
  const positions = useMemo(() => archiveProjects.map((_, index) => index - activeIndex), [activeIndex]);

  const selectByIndex = (nextIndex) => {
    const bounded = Math.max(0, Math.min(archiveProjects.length - 1, nextIndex));
    setActiveId(archiveProjects[bounded].id);
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (document.body.classList.contains("lightbox-open")) return;
      if (event.key === "ArrowLeft") selectByIndex(activeIndex - 1);
      if (event.key === "ArrowRight") selectByIndex(activeIndex + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex]);

  useEffect(() => {
    const revealNodes = [...document.querySelectorAll("[data-reveal]")];
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    revealNodes.forEach((node) => revealObserver.observe(node));

    const sectionNodes = [...document.querySelectorAll("main > section[id]")];
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        setCurrentSection(visible.target.id);
        const matchingProject = archiveProjects.find((project) => project.anchor === visible.target.id);
        if (matchingProject) setActiveId(matchingProject.id);
      }
    }, { rootMargin: "-35% 0px -55%", threshold: [0, 0.1, 0.5] });
    sectionNodes.forEach((node) => sectionObserver.observe(node));

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(range > 0 ? Math.min(1, window.scrollY / range) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handlePointerDown = (event) => {
    if (event.target.closest("a")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startXRef.current = event.clientX; setIsDragging(true); stageRef.current?.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (bounds) {
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      stageRef.current.style.setProperty("--pointer-x", `${x * 100}%`);
      stageRef.current.style.setProperty("--pointer-y", `${y * 100}%`);
      stageRef.current.style.setProperty("--tilt-x", `${(x - 0.5) * 5}deg`);
      stageRef.current.style.setProperty("--tilt-y", `${(0.5 - y) * 4}deg`);
    }
    if (isDragging) setDragX(Math.max(-170, Math.min(170, event.clientX - startXRef.current)));
  };

  const copyEmail = async () => {
    await navigator.clipboard?.writeText("keyuntong@126.com");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const endDrag = (event) => {
    if (!isDragging) return;
    if (dragX > 72) selectByIndex(activeIndex - 1);
    if (dragX < -72) selectByIndex(activeIndex + 1);
    setIsDragging(false); setDragX(0);
    if (stageRef.current?.hasPointerCapture(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId);
  };
  const resetStageTilt = () => {
    if (isDragging || !stageRef.current) return;
    stageRef.current.style.setProperty("--tilt-x", "0deg");
    stageRef.current.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div className="site-shell">
      <AtmosphereCanvas palette={atmospherePalettes[activeId]} />
      <ParticleField />
      <CursorLens />
      <PortfolioAgent />
      <div className="page-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <a className="skip-link" href="#selected-work">Skip to selected work</a>
      <header className="site-header">
        <a className="identity" href="#home">
          <span className="identity-mark">YK</span><span><strong>Yuntong Ke</strong><small>Visual Design / AIGC / Narrative</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a className={currentSection === "home" ? "is-current" : ""} href="#home">Index</a>
          <a className={["selected-work", "emotional-weather", "synthetic-archive", "shanxi-heritage"].includes(currentSection) ? "is-current" : ""} href="#selected-work">Archive</a>
          <a className={currentSection === "profile" ? "is-current" : ""} href="#profile">Profile</a>
          <a className={currentSection === "contact" ? "is-current" : ""} href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="archive-hero" id="home">
          <div className="optical-field-label" aria-hidden="true"><span>PERCEPTION FIELD</span><i>LIVE / 0.82</i></div>
          <div className="hero-status"><i />Independent visual designer <span>Beijing / Available worldwide</span></div>
          <div className="hero-heading">
            <p>2024 <span /> 2026</p>
            <h1>An evolving archive<br />of <em>imagined</em> systems.</h1>
            <span>Visual narratives for culture, emotion and emerging technology.</span>
          </div>
          <div className={`archive-stage ${isDragging ? "is-dragging" : ""}`} ref={stageRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={resetStageTilt}>
            <div className="archive-stage-perspective">
              {archiveProjects.map((project, index) => <ProjectPlate key={project.id} project={project} position={positions[index]} dragX={dragX} onSelect={setActiveId} />)}
            </div>
            <aside className="active-project-meta" aria-live="polite">
              <small>Featured project / {activeProject.number}</small>
              <div><span>Role</span><p>{activeProject.role}</p></div>
              <div><span>Methods</span><p>{activeProject.methods}</p></div>
              <div><span>Outcome</span><p>{activeProject.outcome}</p></div>
              <a href={`#${activeProject.anchor}`}>Open case study</a>
            </aside>
          </div>
          <div className="archive-controls">
            <button type="button" onClick={() => selectByIndex(activeIndex - 1)} disabled={activeIndex === 0}>Previous</button>
            <div className="archive-progress" aria-label={`Project ${activeIndex + 1} of ${archiveProjects.length}`}>
              {archiveProjects.map((project, index) => <button key={project.id} type="button" className={index === activeIndex ? "is-active" : ""} onClick={() => selectByIndex(index)} aria-label={`Show ${project.title}`} />)}
            </div>
            <span className="drag-instruction">Drag to explore / use arrow keys</span>
            <button type="button" onClick={() => selectByIndex(activeIndex + 1)} disabled={activeIndex === archiveProjects.length - 1}>Next</button>
          </div>
          <div className="spring-readout" aria-hidden="true"><span>Spring</span><strong>0.82</strong><i /><i /><i /><i /><i /><i /></div>
        </section>

        <section className="archive-intro" id="selected-work" data-reveal>
          <span>Selected work / 01—03</span><h2>Three visual systems built from research, experimentation and narrative.</h2>
          <p>Each project moves from a question or cultural reference to a coherent visual language, combining critical context with emerging image-making tools.</p>
        </section>

        <ProjectSection project={archiveProjects[1]} eyebrow="AIGC concept art / speculative design" statement="Translating inner states into environmental systems." items={weatherWorks} process={["Map emotion", "Define atmosphere", "Iterate imagery", "Edit the system"]} nextProject={archiveProjects[0]} />
        <ProjectSection project={archiveProjects[0]} eyebrow="Synthetic archive / future museum" statement="Using machine error as material, not as a neutral tool." items={syntheticWorks} process={["Build taxonomy", "Generate artefacts", "Test the interface", "Frame the fiction"]} nextProject={archiveProjects[2]} />
        <ProjectSection project={archiveProjects[2]} eyebrow="Cultural heritage / visual identity" statement="Reframing architectural memory through a shared mythology." items={heritageWorks} process={["Research sites", "Extract motifs", "Develop a visual language", "Standardise the series"]} nextProject={{ anchor: "profile", number: "—", title: "Profile & practice" }} />

        <section className="profile-section" id="profile">
          <div><span>Profile / Practice</span><h2>I connect cultural research, speculative storytelling and digital experience.</h2></div>
          <div className="profile-copy">
            <p>I am a Digital Media Art student at Chengdu College of Arts and Sciences. My practice explores AIGC, moving image and digital product design, with particular interest in how emerging tools can support — rather than replace — critical and culturally grounded creative decisions.</p>
            <dl>
              <div><dt>Education</dt><dd>BA Digital Media Art</dd></div><div><dt>Current focus</dt><dd>AIGC, visual narrative and interaction</dd></div>
              <div><dt>Based in</dt><dd>Beijing, China</dd></div><div><dt>Tools</dt><dd>Photoshop, Illustrator, After Effects, Cinema 4D, Maya, Unity</dd></div>
            </dl>
          </div>
          <div className="recognition" data-reveal>
            <span>Selected recognition</span>
            <ol>
              <li><strong>National Third Prize</strong><small>17th National College Student Advertising Art Competition</small></li>
              <li><strong>Provincial Second Prize</strong><small>17th National College Student Advertising Art Competition</small></li>
              <li><strong>Selected Project</strong><small>Sichuan Student Innovation &amp; Entrepreneurship Programme</small></li>
              <li><strong>Provincial Third Prize</strong><small>Sichuan Student Digital Media Art &amp; Design Competition</small></li>
            </ol>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <span>About / Contact</span><h2>Let&apos;s build an<br /><em>imagined world.</em></h2>
          <div className="contact-line">
            <p>Available for study, commissions and collaboration.</p>
            <div><a href="mailto:keyuntong@126.com">keyuntong@126.com</a><button type="button" onClick={copyEmail} aria-live="polite">{copied ? "Copied" : "Copy email"}</button></div>
          </div>
          <footer><span>Yuntong Ke © 2026</span><span>Beijing, China</span></footer>
        </section>
      </main>
    </div>
  );
}

export default App;

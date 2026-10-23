import { useEffect, useMemo, useRef, useState } from "react";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

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
    image: "optimized/emotional-weather/serenity-sky.jpg", category: "AIGC concept art / speculative design",
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
  ["Anxiety Storm", "optimized/emotional-weather/anxiety-storm.jpg"],
  ["Loneliness Fog", "optimized/emotional-weather/loneliness-fog.jpg"],
  ["Nostalgia Monsoon", "optimized/emotional-weather/nostalgia-monsoon.jpg"],
  ["Anger Thunderstorm", "optimized/emotional-weather/anger-thunderstorm.jpg"],
  ["Hope Aurora", "optimized/emotional-weather/hope-aurora.jpg"],
  ["Algorithm Cold Wave", "optimized/emotional-weather/algorithm-cold-wave.jpg"],
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

      float grain(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 safeResolution = max(uResolution, vec2(1.0));
        vec2 uv = gl_FragCoord.xy / safeResolution;
        vec2 p = (gl_FragCoord.xy * 2.0 - safeResolution.xy) / min(safeResolution.x, safeResolution.y);
        vec2 pointer = vec2(uPointer.x * 2.0 - 1.0, (1.0 - uPointer.y) * 2.0 - 1.0);
        pointer.x *= safeResolution.x / safeResolution.y;

        float drift = sin(p.x * 1.25 + uTime * 0.16 + sin(p.y * 1.8 - uTime * 0.11));
        drift += cos(p.y * 1.55 - uTime * 0.13 + p.x * 0.7);
        drift = drift * 0.25 + 0.5;

        float halo = exp(-length(p - pointer) * 1.65);
        float ripple = sin(length(p - pointer) * 15.0 - uTime * 1.8) * halo;
        float scrollWave = sin((p.y + uScroll * 2.4) * 2.1 + uTime * 0.08) * 0.5 + 0.5;
        float field = smoothstep(0.08, 0.96, drift * 0.62 + scrollWave * 0.38 + ripple * 0.07);

        vec3 color = mix(vec3(0.014, 0.024, 0.038), uColorA, field * 0.58);
        color = mix(color, uColorB, smoothstep(0.28, 1.1, length(p + vec2(0.48, -0.18))) * 0.35);
        color += uColorA * halo * (0.10 + uVelocity * 0.08);

        vec2 gridUv = abs(fract(uv * vec2(26.0, 16.0) + vec2(uScroll * 0.28, 0.0)) - 0.5);
        float grid = 1.0 - smoothstep(0.47, 0.5, max(gridUv.x, gridUv.y));
        color += vec3(0.12, 0.23, 0.28) * grid * 0.025;
        color += (grain(gl_FragCoord.xy + uTime) - 0.5) * 0.025;

        float vignette = smoothstep(1.35, 0.22, length(p * vec2(0.76, 0.92)));
        color *= 0.68 + vignette * 0.42;
        gl_FragColor = vec4(color, 0.96);
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
    let running = true;
    let lastTime = performance.now();
    let colorA = [...paletteRef.current[0]];
    let colorB = [...paletteRef.current[1]];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1 : 1.35);
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
      if (!running) return;
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
    const onVisibility = () => {
      running = !document.hidden;
      if (running && !reducedMotion) { lastTime = performance.now(); frame = requestAnimationFrame(render); }
      else if (frame) cancelAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    render(performance.now());

    return () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
    };
  }, []);

  return <canvas className="ambient-canvas" ref={canvasRef} aria-hidden="true" />;
}

function ProjectPlate({ project, position, dragX, onSelect }) {
  const isActive = position === 0;
  return (
    <button
      className={`archive-plate archive-plate-${position} ${isActive ? "is-active" : ""}`}
      style={{ "--drag-x": `${dragX}px` }} type="button"
      onClick={() => onSelect(project.id)} aria-label={`View ${project.title}`} aria-pressed={isActive}
    >
      <img src={asset(project.image)} alt="" draggable="false" fetchPriority={isActive ? "high" : "auto"} />
      <span className="plate-shade" aria-hidden="true" />
      <span className="plate-light" aria-hidden="true" />
      <span className="plate-index">{project.number}</span>
      <span className="plate-copy"><strong>{project.title}</strong><small>{project.year}</small></span>
    </button>
  );
}

function WorkGallery({ items, label }) {
  const [active, setActive] = useState(0);
  const moveLight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--gallery-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--gallery-y", `${event.clientY - bounds.top}px`);
  };
  return (
    <div className="work-gallery">
      <figure className="work-gallery-main" onPointerMove={moveLight}>
        <img key={items[active][1]} src={asset(items[active][1])} alt={items[active][0]} loading="lazy" decoding="async" />
        <figcaption><span>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><strong>{items[active][0]}</strong></figcaption>
      </figure>
      <div className="work-gallery-list" role="list" aria-label={label} style={{ "--item-count": Math.min(items.length, 9) }}>
        {items.map(([title, src], index) => (
          <button key={src} className={index === active ? "is-active" : ""} type="button" onClick={() => setActive(index)} aria-pressed={index === active}>
            <img src={asset(src)} alt="" loading="lazy" decoding="async" />
            <span><i>{String(index + 1).padStart(2, "0")}</i>{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectSection({ project, eyebrow, statement, items }) {
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
      <div data-reveal><WorkGallery items={items} label={`${project.title} artwork`} /></div>
    </section>
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
      if (visible) setCurrentSection(visible.target.id);
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
      <div className="page-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <header className="site-header">
        <a className="identity" href="#home" aria-label="Yuntong Ke home">
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
          <div className="film-strip" aria-hidden="true">
            <video autoPlay muted loop playsInline preload="auto" poster={asset("optimized/emotional-weather/anxiety-storm.jpg")}>
              <source src={asset("assets/video/hero-background.mp4")} type="video/mp4" />
            </video>
          </div>
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

        <ProjectSection project={archiveProjects[1]} eyebrow="AIGC concept art / speculative design" statement="Translating inner states into environmental systems." items={weatherWorks} />
        <ProjectSection project={archiveProjects[0]} eyebrow="Synthetic archive / future museum" statement="Using machine error as material, not as a neutral tool." items={syntheticWorks} />
        <ProjectSection project={archiveProjects[2]} eyebrow="Cultural heritage / visual identity" statement="Reframing architectural memory through a shared mythology." items={heritageWorks} />

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

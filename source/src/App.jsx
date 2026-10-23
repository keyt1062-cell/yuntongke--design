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
];

function ProjectPlate({ project, position, dragX, onSelect }) {
  const isActive = position === 0;
  return (
    <button
      className={`archive-plate archive-plate-${position} ${isActive ? "is-active" : ""}`}
      style={{ "--drag-x": `${dragX}px` }} type="button"
      onClick={() => onSelect(project.id)} aria-label={`View ${project.title}`} aria-pressed={isActive}
    >
      <img src={asset(project.image)} alt="" draggable="false" />
      <span className="plate-shade" aria-hidden="true" />
      <span className="plate-index">{project.number}</span>
      <span className="plate-copy"><strong>{project.title}</strong><small>{project.year}</small></span>
    </button>
  );
}

function WorkGallery({ items, label }) {
  const [active, setActive] = useState(0);
  return (
    <div className="work-gallery">
      <figure className="work-gallery-main">
        <img src={asset(items[active][1])} alt={items[active][0]} loading="lazy" decoding="async" />
        <figcaption><span>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><strong>{items[active][0]}</strong></figcaption>
      </figure>
      <div className="work-gallery-list" role="list" aria-label={label}>
        {items.map(([title, src], index) => (
          <button key={src} className={index === active ? "is-active" : ""} type="button" onClick={() => setActive(index)} aria-pressed={index === active}>
            <img src={asset(src)} alt="" loading="lazy" decoding="async" /><span>{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectSection({ project, eyebrow, statement, items }) {
  return (
    <section className="project-case" id={project.anchor}>
      <div className="project-case-heading">
        <span>{project.number}</span><p>{eyebrow}</p><h2>{project.title}</h2><h3>{statement}</h3>
      </div>
      <div className="project-case-intro">
        <p>{project.description}</p>
        <dl>
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Methods</dt><dd>{project.methods}</dd></div>
          <div><dt>Outcome</dt><dd>{project.outcome}</dd></div>
        </dl>
      </div>
      <WorkGallery items={items} label={`${project.title} artwork`} />
    </section>
  );
}

function App() {
  const [activeId, setActiveId] = useState("weather");
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startXRef.current = event.clientX; setIsDragging(true); stageRef.current?.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event) => {
    if (!isDragging) return;
    setDragX(Math.max(-170, Math.min(170, event.clientX - startXRef.current)));
  };
  const endDrag = (event) => {
    if (!isDragging) return;
    if (dragX > 72) selectByIndex(activeIndex - 1);
    if (dragX < -72) selectByIndex(activeIndex + 1);
    setIsDragging(false); setDragX(0);
    if (stageRef.current?.hasPointerCapture(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="identity" href="#home" aria-label="Yuntong Ke home">
          <span className="identity-mark">YK</span><span><strong>Yuntong Ke</strong><small>Visual Design / AIGC / Narrative</small></span>
        </a>
        <nav aria-label="Primary navigation"><a href="#home">Index</a><a href="#selected-work">Archive</a><a href="#profile">Profile</a><a href="#contact">Contact</a></nav>
      </header>

      <main>
        <section className="archive-hero" id="home">
          <div className="film-strip" aria-hidden="true">
            <video autoPlay muted loop playsInline preload="auto" poster={asset("optimized/emotional-weather/anxiety-storm.jpg")}>
              <source src={asset("assets/video/hero-background.mp4")} type="video/mp4" />
            </video>
          </div>
          <div className="hero-heading">
            <p>2024 <span /> 2026</p>
            <h1>An evolving archive<br />of <em>imagined</em> systems.</h1>
            <span>Visual narratives for culture, emotion and emerging technology.</span>
          </div>
          <div className={`archive-stage ${isDragging ? "is-dragging" : ""}`} ref={stageRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <div className="archive-stage-perspective">
              {archiveProjects.map((project, index) => <ProjectPlate key={project.id} project={project} position={positions[index]} dragX={dragX} onSelect={setActiveId} />)}
            </div>
            <aside className="active-project-meta" aria-live="polite">
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

        <section className="archive-intro" id="selected-work">
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
        </section>

        <section className="contact-section" id="contact">
          <span>About / Contact</span><h2>Let&apos;s build an<br /><em>imagined world.</em></h2>
          <div><p>Available for study, commissions and collaboration.</p><a href="mailto:keyuntong@126.com">keyuntong@126.com</a></div>
          <footer><span>Yuntong Ke © 2026</span><span>Beijing, China</span></footer>
        </section>
      </main>
    </div>
  );
}

export default App;

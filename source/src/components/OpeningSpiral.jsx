import { useEffect, useRef } from "react";

class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static random(min, max) {
    return min + Math.random() * (max - min);
  }
}

class Vector3D {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Star {
  constructor(cameraZ, cameraTravelDistance) {
    this.angle = Math.random() * Math.PI * 2;
    this.distance = 30 * Math.random() + 15;
    this.rotationDirection = Math.random() > 0.5 ? -1 : 1;
    this.expansionRate = 1.2 + Math.random() * 0.8;
    this.finalScale = 0.7 + Math.random() * 0.6;

    this.dx = this.distance * Math.cos(this.angle);
    this.dy = this.distance * Math.sin(this.angle);
    this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3)) / 1.3;
    this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ);
    this.z = this.z * 0.7 + (cameraTravelDistance / 2) * 0.3;
    this.strokeWeightFactor = Math.pow(Math.random(), 2);
  }

  render(progress, controller) {
    const spiralPos = controller.spiralPath(this.spiralLocation);
    const q = progress - this.spiralLocation;

    if (q <= 0) return;

    const displacementProgress = controller.constrain(4 * q, 0, 1);
    const linearEasing = displacementProgress;
    const elasticEasing = controller.easeOutElastic(displacementProgress);
    const powerEasing = Math.pow(displacementProgress, 2);

    let easing = linearEasing;
    if (displacementProgress < 0.3) {
      easing = controller.lerp(linearEasing, powerEasing, displacementProgress / 0.3);
    } else if (displacementProgress < 0.7) {
      const t = (displacementProgress - 0.3) / 0.4;
      easing = controller.lerp(powerEasing, elasticEasing, t);
    } else {
      easing = elasticEasing;
    }

    let screenX;
    let screenY;

    if (displacementProgress < 0.3) {
      screenX = controller.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3);
      screenY = controller.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3);
    } else if (displacementProgress < 0.7) {
      const midProgress = (displacementProgress - 0.3) / 0.4;
      const curveStrength = Math.sin(midProgress * Math.PI) * this.rotationDirection * 1.5;
      const baseX = spiralPos.x + this.dx * 0.3;
      const baseY = spiralPos.y + this.dy * 0.3;
      const targetX = spiralPos.x + this.dx * 0.7;
      const targetY = spiralPos.y + this.dy * 0.7;
      const perpX = -this.dy * 0.4 * curveStrength;
      const perpY = this.dx * 0.4 * curveStrength;

      screenX = controller.lerp(baseX, targetX, midProgress) + perpX * midProgress;
      screenY = controller.lerp(baseY, targetY, midProgress) + perpY * midProgress;
    } else {
      const finalProgress = (displacementProgress - 0.7) / 0.3;
      const baseX = spiralPos.x + this.dx * 0.7;
      const baseY = spiralPos.y + this.dy * 0.7;
      const targetDistance = this.distance * this.expansionRate * 1.5;
      const spiralTurns = 1.2 * this.rotationDirection;
      const spiralAngle = this.angle + spiralTurns * finalProgress * Math.PI;
      const targetX = spiralPos.x + targetDistance * Math.cos(spiralAngle);
      const targetY = spiralPos.y + targetDistance * Math.sin(spiralAngle);

      screenX = controller.lerp(baseX, targetX, finalProgress);
      screenY = controller.lerp(baseY, targetY, finalProgress);
    }

    const vx = (this.z - controller.cameraZ) * screenX / controller.viewZoom;
    const vy = (this.z - controller.cameraZ) * screenY / controller.viewZoom;
    const position = new Vector3D(vx, vy, this.z);

    let sizeMultiplier = 1;
    if (displacementProgress < 0.6) {
      sizeMultiplier = 1 + displacementProgress * 0.2;
    } else {
      const t = (displacementProgress - 0.6) / 0.4;
      sizeMultiplier = 1.2 * (1 - t) + this.finalScale * t;
    }

    const dotSize = 8.5 * this.strokeWeightFactor * sizeMultiplier;
    controller.showProjectedDot(position, dotSize);
  }
}

class AnimationController {
  constructor(canvas, ctx, width, height) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.baseSize = Math.max(width, height);
    this.time = 0;
    this.changeEventTime = 0.32;
    this.cameraZ = -400;
    this.cameraTravelDistance = 3400;
    this.startDotYOffset = this.baseSize * 0.024;
    this.viewZoom = 100;
    this.numberOfStars = width < 760 ? 280 : 520;
    this.trailLength = width < 760 ? 28 : 42;
    this.frameId = 0;
    this.startedAt = 0;
    this.lastFrameAt = 0;
    this.stars = [];
    this.setupRandomGenerator();
    this.createStars();
  }

  setupRandomGenerator() {
    const originalRandom = Math.random;
    let seed = 1234;
    Math.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    this.createStars();
    Math.random = originalRandom;
  }

  createStars() {
    this.stars = [];
    for (let i = 0; i < this.numberOfStars; i += 1) {
      this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance));
    }
  }

  ease(p, g) {
    if (p < 0.5) return 0.5 * Math.pow(2 * p, g);
    return 1 - 0.5 * Math.pow(2 * (1 - p), g);
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 4.5;
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
  }

  map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  spiralPath(p) {
    let progress = this.constrain(1.2 * p, 0, 1);
    progress = this.ease(progress, 1.8);
    const numberOfSpiralTurns = 6;
    const theta = 2 * Math.PI * numberOfSpiralTurns * Math.sqrt(progress);
    const r = this.baseSize * 0.145 * Math.sqrt(progress);

    return new Vector2D(
      r * Math.cos(theta),
      r * Math.sin(theta) + this.startDotYOffset,
    );
  }

  rotate(v1, v2, p, orientation) {
    const middle = new Vector2D((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
    const dx = v1.x - middle.x;
    const dy = v1.y - middle.y;
    const angle = Math.atan2(dy, dx);
    const direction = orientation ? -1 : 1;
    const r = Math.sqrt(dx * dx + dy * dy);
    const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p);

    return new Vector2D(
      middle.x + r * (1 + bounce) * Math.cos(angle + direction * Math.PI * this.easeOutElastic(p)),
      middle.y + r * (1 + bounce) * Math.sin(angle + direction * Math.PI * this.easeOutElastic(p)),
    );
  }

  showProjectedDot(position, sizeFactor) {
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    const newCameraZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance;

    if (position.z <= newCameraZ) return;

    const dotDepthFromCamera = position.z - newCameraZ;
    const x = this.viewZoom * position.x / dotDepthFromCamera;
    const y = this.viewZoom * position.y / dotDepthFromCamera;
    const sw = 400 * sizeFactor / dotDepthFromCamera;

    this.ctx.lineWidth = sw;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawStartDot() {
    if (this.time <= this.changeEventTime) return;
    const dy = this.cameraZ * this.startDotYOffset / this.viewZoom;
    const position = new Vector3D(0, dy, this.cameraTravelDistance);
    this.showProjectedDot(position, 2.5);
  }

  drawTrail(t1) {
    for (let i = 0; i < this.trailLength; i += 1) {
      const f = this.map(i, 0, this.trailLength, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3 * Math.sin(Math.PI * t1)) * f;
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = sw;

      const pathTime = t1 - 0.00015 * i;
      const position = this.spiralPath(pathTime);
      const offset = new Vector2D(position.x + 5, position.y + 5);
      const rotated = this.rotate(
        position,
        offset,
        Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5,
        i % 2 === 0,
      );

      this.ctx.beginPath();
      this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  render = (timestamp) => {
    this.frameId = 0;
    if (timestamp - this.lastFrameAt < 32) {
      this.frameId = window.requestAnimationFrame(this.render);
      return;
    }
    this.lastFrameAt = timestamp;
    if (!this.startedAt) this.startedAt = timestamp;
    const elapsed = (timestamp - this.startedAt) % 15000;
    this.time = elapsed / 15000;

    const ctx = this.ctx;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1);
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);

    ctx.rotate(-Math.PI * this.ease(t2, 2.7));
    this.drawTrail(t1);
    ctx.fillStyle = "white";
    this.stars.forEach((star) => star.render(t1, this));
    this.drawStartDot();
    ctx.restore();

    this.frameId = window.requestAnimationFrame(this.render);
  };

  start() {
    if (this.frameId) return;
    this.frameId = window.requestAnimationFrame(this.render);
  }

  destroy() {
    window.cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }
}

export default function OpeningSpiral() {
  const canvasRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (controllerRef.current) {
        controllerRef.current.destroy();
      }

      controllerRef.current = new AnimationController(canvas, ctx, width, height);
      if (!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        controllerRef.current.start();
      }
    };

    const handleVisibility = () => {
      if (!controllerRef.current) return;
      if (document.hidden) controllerRef.current.destroy();
      else controllerRef.current.start();
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="opening-spiral-canvas" aria-hidden="true" />;
}

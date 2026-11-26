/**
 * Apply CTA (Jiro "Miles" File 8), recoloured. The bead ball is real-time WebGL (three.js r128
 * from the `three` package, lazy-loaded; the portal CSP blocks cdnjs) with metallic gold beads.
 * Still frame for reduced motion; static gold glow if WebGL is unavailable.
 * Used on the landing page only; program pages use CTABand (no WebGL).
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Artboard, Badge, Button, Reveal, Responsive, at, prefersReducedMotion } from "./kit";

function Heading({ className = "" }: { className?: string }) {
  return (
    <h2 className={`m-0 font-gilda font-normal capitalize text-joat-cream ${className}`}>
      Ready To <span className="font-glory leading-[0] text-joat-gold">Start?</span>
    </h2>
  );
}

const BADGE = "Free to join. No purchase required.";

// ── Desktop (≥1024px): fixed 1600 × 830 artboard ──────────────────
function CTADesktop() {
  return (
    <Artboard id="apply-cta" height={830} className="bg-joat-black">
      <BeadBall className="pointer-events-none" style={at(0, 0, 1600, 830)} />
      <Reveal className="flex justify-center" style={at(0, 68, 1600)}>
        <Badge>{BADGE}</Badge>
      </Reveal>
      <Reveal delay={200} style={at(374, 117, 851)}>
        <Heading className="text-center text-[82px] leading-[86px] tracking-[-2.46px]" />
      </Reveal>
      <Reveal delay={320} className="flex justify-center" style={at(0, 240, 1600)}>
        <Button to="/apply">Apply now</Button>
      </Reveal>
    </Artboard>
  );
}

// ── Mobile (<1024px) ───────────────────────────────────────────────
function CTAMobile() {
  return (
    <section id="apply-cta" className="overflow-hidden bg-joat-black pt-[64px]">
      <div className="px-[20px] text-center">
        <Reveal className="flex justify-center [&_p]:!whitespace-normal [&_p]:!text-[15px]">
          <Badge>{BADGE}</Badge>
        </Reveal>
        <Reveal delay={200} className="mt-[16px]">
          <Heading className="text-[44px] leading-[50px] tracking-[-1.3px]" />
        </Reveal>
        <Reveal delay={320} className="mt-[24px] flex justify-center">
          <Button to="/apply">Apply now</Button>
        </Reveal>
      </div>
      <div className="relative mt-[8px] aspect-[1600/520] w-full overflow-hidden">
        {/* same ball, showing the bottom part of the desktop frame */}
        <BeadBall className="pointer-events-none absolute bottom-0 left-0 aspect-[1600/830] w-full" />
      </div>
    </section>
  );
}

export default function CTAMiles() {
  return <Responsive desktop={<CTADesktop />} mobile={<CTAMobile />} />;
}

/** CTA without WebGL, for the program pages (the beads stay on the landing page). */
export function CTABand({
  heading = <Heading className="text-[40px] leading-[48px] sm:text-[60px] sm:leading-[68px]" />,
  children,
}: {
  heading?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-joat-black px-[20px] py-[80px] text-center sm:px-[40px] lg:py-[110px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_50%_100%,color-mix(in_srgb,var(--color-joat-gold)_22%,transparent),transparent_70%)]"
      />
      <div className="relative">
        <Reveal className="flex justify-center [&_p]:!whitespace-normal">
          <Badge>{BADGE}</Badge>
        </Reveal>
        <Reveal delay={200} className="mt-[16px]">
          {heading}
        </Reveal>
        <Reveal delay={320} className="mt-[28px] flex flex-wrap justify-center gap-[12px]">
          {children ?? <Button to="/apply">Apply now</Button>}
        </Reveal>
      </div>
    </section>
  );
}

// ── WebGL bead sphere ─────────────────────────────────────────────
// A big ball wrapped in strands of glossy gold beads; only its top shows above the bottom edge.
// Same materials and lighting as the hero rope. Beads fly in when the section scrolls into view,
// the ball turns slowly, and beads under the pointer ripple and lift off the surface.
const BALL = {
  W: 1600,
  H: 830,
  fov: 50, // wide lens: near beads look big, far ones small
  radius: 760, // ball radius (world units ≈ design px at z = 0)
  center: [0, -770, 300] as [number, number, number], // ball centre; the frame centre is (0, 0, 0)
  tilt: [0.5, 0, 0.32] as [number, number, number], // rotation of the strand axis (x, y, z radians)
  bead: 24, // bead radius
  along: 0.98, // bead spacing on a strand (1 = touching)
  ringGap: 2.75, // distance between strands, in bead radii (> 2 leaves small gaps)
  innerShell: 1.75, // second, inner layer of beads this many bead radii further in
  spin: 0.07, // radians per second the ball turns
  color: "#c9a227",
  rough: 0.3,
  metal: 0.55,
  exposure: 0.95,
  env: 1.0,
  ao: [0.85, 1.1, 0, 0],
  directOcc: 0.4,
  bounce: 0.25,
  sky: "#e0bc4a",
  ground: "#6b4a2f",
  hemi: 0.4,
  keyColor: "#ffe2a8",
  key: 2.5,
  keyPos: [-200, 1000, 500],
  hlDir: [-0.5, 0.7, 0.6],
  hl: [0.15, 10, 0.3, 60],
  // hover
  hoverRadius: 220,
  hoverLift: 42,
  waveHeight: 20,
  waveLength: 240,
};

type Ball = {
  render: (t: number, intro: number) => void;
  resize: () => void;
  pointer: (x: number, y: number) => void;
  hover: (ndcX: number, ndcY: number, inside: boolean) => void;
  dispose: () => void;
};

/* eslint-disable @typescript-eslint/no-explicit-any -- template code drives three.js untyped */
function createBeadBall(THREE: any, canvas: HTMLCanvasElement): Ball {
  const P = BALL;
  const { W, H } = P;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  // filmic tone mapping keeps the gold highlights from blowing out to white
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = P.exposure;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const fov = P.fov;
  const D = H / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
  const camera = new THREE.PerspectiveCamera(fov, W / H, 10, 8000);
  camera.position.set(0, 0, D);

  // studio light, same as the hero rope
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.background = new THREE.Color("#1a130e");
  const box = (w: number, h: number, x: number, y: number, z: number, c: string, i: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(c).multiplyScalar(i),
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  box(14, 9, -3, 8, 5, "#fff4dc", 3.0);
  box(14, 3, 4, 4, 8, "#fff1d6", 0.8);
  box(16, 16, 0, -9, 0, "#c9a227", 0.5);
  box(20, 10, 0, 0, -10, "#6b4a2f", 0.35);
  const envRT = pmrem.fromScene(env, 0.02);
  scene.environment = envRT.texture;
  scene.add(new THREE.HemisphereLight(P.sky, P.ground, P.hemi));
  const key = new THREE.DirectionalLight(P.keyColor, P.key);
  key.position.set(P.keyPos[0], P.keyPos[1], P.keyPos[2]);
  scene.add(key);

  // ── beads: rings of touching beads around a tilted axis, two layers ──
  const r = P.bead;
  const C = new THREE.Vector3(...P.center);
  const tiltQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(...P.tilt));
  type Bead = { phi: number; theta0: number; shell: number; id: number };
  const list: Bead[] = [];
  const shells = [P.radius, P.radius - P.innerShell * r];
  shells.forEach((Rs, shell) => {
    const rings = Math.floor((Math.PI * Rs) / (P.ringGap * r));
    for (let j = 0; j < rings; j++) {
      const phi = ((j + 0.5 + shell * 0.5) / rings) * Math.PI;
      const rho = Rs * Math.sin(phi);
      const n = Math.max(1, Math.floor((2 * Math.PI * rho) / (2 * r * P.along)));
      const off = (j * 0.618 + shell * 0.31) * 2 * Math.PI;
      for (let i = 0; i < n; i++)
        list.push({ phi, theta0: off + (2 * Math.PI * i) / n, shell, id: list.length });
    }
  });
  const count = list.length;
  const rand = (i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  const geo = new THREE.SphereGeometry(r, 24, 18);
  const radialAttr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  const alongAttr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  geo.setAttribute("aRadial", radialAttr);
  geo.setAttribute("aAlong", alongAttr);
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(P.color).convertSRGBToLinear(),
    roughness: P.rough,
    metalness: P.metal,
    envMapIntensity: P.env,
  });
  const assembleU = { value: 1 };
  mat.onBeforeCompile = (sh: any) => {
    sh.uniforms.uAO = { value: new THREE.Vector4(P.ao[0], P.ao[1], P.ao[2], P.ao[3]) };
    sh.uniforms.uGeo = {
      value: new THREE.Vector4(
        2 * P.along,
        P.ringGap,
        P.radius / r,
        (P.radius - (P.innerShell + 0.4) * r) / r,
      ),
    };
    sh.uniforms.uDirect = { value: P.directOcc };
    sh.uniforms.uBounce = { value: P.bounce };
    sh.uniforms.uHL = { value: new THREE.Vector4(P.hlDir[0], P.hlDir[1], P.hlDir[2], 0) };
    sh.uniforms.uHS = { value: new THREE.Vector4(P.hl[0], P.hl[1], P.hl[2], P.hl[3]) };
    sh.uniforms.uAssemble = assembleU;
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec3 aRadial;\nattribute vec3 aAlong;\nvarying vec3 vRadial;\nvarying vec3 vAlong;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvRadial = normalize(normalMatrix * aRadial);\nvAlong = normalize(normalMatrix * aAlong);",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec4 uAO; uniform vec4 uGeo; uniform float uDirect; uniform float uBounce; uniform vec4 uHL; uniform vec4 uHS; uniform float uAssemble;
        varying vec3 vRadial; varying vec3 vAlong;
        float sphOcc(vec3 p, vec3 n, vec3 c, float ra) {
          vec3 d = c - p; float l = length(d);
          return max(0.0, dot(n, d / l)) * (ra * ra) / (l * l);
        }`,
      )
      .replace(
        "#include <lights_fragment_end>",
        `#include <lights_fragment_end>
        {
          vec3 nn = normalize(normal);
          vec3 rad = normalize(vRadial);
          vec3 al = normalize(vAlong - rad * dot(vAlong, rad));
          vec3 sd = normalize(cross(rad, al));
          vec3 p = nn;
          float o = 0.0;
          o += sphOcc(p, nn,  al * uGeo.x, 1.0);
          o += sphOcc(p, nn, -al * uGeo.x, 1.0);
          o += sphOcc(p, nn,  sd * uGeo.y, 1.0);
          o += sphOcc(p, nn, -sd * uGeo.y, 1.0);
          o += sphOcc(p, nn, -rad * 1.9, 1.0);
          float ao = clamp(1.0 - uAO.x * o * uAssemble, 0.0, 1.0);
          ao = pow(ao, uAO.y);
          reflectedLight.indirectDiffuse *= ao;
          reflectedLight.indirectSpecular *= ao;
          reflectedLight.directDiffuse *= mix(1.0 - uDirect, 1.0, ao);
          reflectedLight.directSpecular *= 0.0;
          vec3 Lh = normalize(uHL.xyz);
          vec3 Hh = normalize(Lh + geometry.viewDir);
          float nh = max(dot(nn, Hh), 0.0);
          reflectedLight.directSpecular += vec3(1.0, 0.94, 0.82) * (uHS.x * pow(nh, uHS.y) + uHS.z * pow(nh, uHS.w)) * ao;
          reflectedLight.indirectDiffuse += diffuseColor.rgb * uBounce * (1.0 - ao) * (0.6 + 0.4 * max(dot(nn, rad), 0.0));
        }`,
      );
  };
  const beads = new THREE.InstancedMesh(geo, mat, count);
  beads.frustumCulled = false;
  scene.add(beads);

  // ── intro + hover state ──
  const INTRO = { maxDelay: 0.6, flight: 1.9 };
  const INTRO_END = INTRO.maxDelay + INTRO.flight;
  const easeOut = (x: number) => 1 - Math.pow(1 - x, 4);
  const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const hp = new THREE.Vector3();
  const hpTarget = new THREE.Vector3();
  const ray = new THREE.Ray();
  let hoverOn = false;
  let hoverAmt = 0;
  let hoverVel = 0;
  let lastT = 0;
  let residual = 0;
  const off = new Float32Array(count * 4);
  const kWave = (2 * Math.PI) / P.waveLength;

  const m4 = new THREE.Matrix4();
  const loc = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const tan = new THREE.Vector3();

  function layout(time: number, intro: number) {
    const flying = intro < INTRO_END;
    const now = performance.now() / 1000;
    const dt = lastT ? Math.min(0.05, now - lastT) : 0;
    lastT = now;
    const goal = hoverOn && !flying ? 1 : 0;
    hoverVel += (25 * (goal - hoverAmt) - 10 * hoverVel) * dt;
    hoverAmt = Math.min(1, Math.max(0, hoverAmt + hoverVel * dt));
    const amt = hoverAmt * hoverAmt * (3 - 2 * hoverAmt);
    hp.lerp(hpTarget, 1 - Math.exp(-dt * 4.5));
    const follow = 1 - Math.exp(-dt * 7);
    const waving = hoverAmt > 0.002 || Math.abs(hoverVel) > 0.001 || residual > 0.02;
    let maxOff = 0;
    const spin = time * P.spin;

    for (let k = 0; k < count; k++) {
      const b = list[k];
      const Rs = shells[b.shell];
      const th = b.theta0 + spin * (b.shell ? 0.97 : 1);
      const sp = Math.sin(b.phi);
      loc.set(sp * Math.cos(th), Math.cos(b.phi), sp * Math.sin(th)); // unit vector in axis space
      dir.copy(loc).applyQuaternion(tiltQ);
      tan.set(-Math.sin(th), 0, Math.cos(th)).applyQuaternion(tiltQ);
      let x = C.x + dir.x * Rs;
      let y = C.y + dir.y * Rs;
      let z = C.z + dir.z * Rs;
      let scale = 1 + (rand(b.id * 3.17 + 9.4) - 0.5) * 0.06;

      // hide beads that are behind the ball or below the frame (cheap culling)
      const hidden = y < -H / 2 - 3 * r || dir.z < -0.35;
      if (flying) {
        const delay = rand(b.id * 1.73 + 0.31) * INTRO.maxDelay;
        const e = easeOut(Math.min(1, Math.max(0, (intro - delay) / INTRO.flight)));
        const ang = rand(b.id * 2.91 + 5.7) * Math.PI * 2;
        const dist = (700 + rand(b.id * 4.13 + 1.9) * 900) * (1 - e);
        const sw = (1 - e) * 1.6;
        x += Math.cos(ang + sw) * dist;
        y -= Math.abs(Math.sin(ang + sw)) * dist * 0.6; // they arrive from the sides and from below, not over the heading
        z -= rand(b.id * 6.07 + 2.2) * 1400 * (1 - e); // from behind, never through the camera (it is close)
        scale *= 0.3 + 0.7 * e * e;
      }

      const o4 = k * 4;
      if (waving && !b.shell) {
        // beads near the pointer lift off the ball and ripple like a wave spreading outward
        const d = Math.hypot(x - hp.x, y - hp.y);
        const near = Math.exp(-((d / P.hoverRadius) ** 2));
        const ripple = Math.sin(d * kWave - now * 3.2);
        const bob = Math.sin(now * 1.8 + rand(b.id * 5.3 + 0.7) * 6.28);
        const lift = amt * near * (P.hoverLift + P.waveHeight * ripple + 5 * bob);
        off[o4] += (dir.x * lift - off[o4]) * follow;
        off[o4 + 1] += (dir.y * lift + amt * near * 12 - off[o4 + 1]) * follow;
        off[o4 + 2] += (dir.z * lift - off[o4 + 2]) * follow;
        off[o4 + 3] += (amt * near * (0.1 + 0.04 * ripple) - off[o4 + 3]) * follow;
        maxOff = Math.max(maxOff, Math.abs(off[o4 + 1]), Math.abs(off[o4 + 2]));
      } else if (off[o4 + 1] !== 0) {
        off[o4] = off[o4 + 1] = off[o4 + 2] = off[o4 + 3] = 0;
      }
      x += off[o4];
      y += off[o4 + 1];
      z += off[o4 + 2];
      scale *= 1 + off[o4 + 3];
      if (hidden) scale = 0; // also while flying in, so no bead passes right in front of the (close) camera

      m4.makeScale(scale, scale, scale);
      m4.setPosition(x, y, z);
      beads.setMatrixAt(k, m4);
      radialAttr.setXYZ(k, dir.x, dir.y, dir.z);
      alongAttr.setXYZ(k, tan.x, tan.y, tan.z);
    }
    residual = maxOff;
    beads.instanceMatrix.needsUpdate = true;
    radialAttr.needsUpdate = true;
    alongAttr.needsUpdate = true;
  }

  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  function render(time: number, intro: number) {
    layout(time, intro);
    assembleU.value = smooth(INTRO.maxDelay + INTRO.flight * 0.45, INTRO_END, intro);
    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;
    camera.position.set(mx * 40, -my * 24, D);
    camera.lookAt(mx * 10, -my * 6, 0);
    renderer.render(scene, camera);
  }
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const onScreen = canvas.getBoundingClientRect().width / w || 1;
    renderer.setPixelRatio(Math.min(2, (window.devicePixelRatio || 1) * Math.min(1, onScreen)));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fitH = Math.max(H, W / camera.aspect);
    camera.fov = (2 * Math.atan(fitH / 2 / D) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  }
  resize();
  return {
    render,
    resize,
    pointer: (x: number, y: number) => {
      tx = x;
      ty = y;
    },
    hover: (nx: number, ny: number, inside: boolean) => {
      if (!inside) {
        hoverOn = false;
        return;
      }
      // only when the pointer is actually on the ball
      ray.origin.copy(camera.position);
      ray.direction.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
      const hit = ray.intersectSphere(
        new THREE.Sphere(C, P.radius + r + (hoverOn ? P.hoverLift : 0)),
        new THREE.Vector3(),
      );
      hoverOn = !!hit;
      if (!hit) return;
      hpTarget.copy(hit);
      if (hoverAmt < 0.01) hp.copy(hpTarget);
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Canvas with the bead ball. Intro replays each time it scrolls into view; still frame for reduced motion. */
function BeadBall({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let ball: Ball | null = null;
    let raf = 0;
    let visible = false;
    let cancelled = false;
    const reduce = prefersReducedMotion();
    let clock = 0;
    let intro = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = 0;
      if (!ball || !visible) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      clock += dt;
      intro += dt;
      ball.render(clock, intro);
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) {
        intro = reduce ? Infinity : 0; // beads fly in again every time the section comes into view
        if (!raf) raf = requestAnimationFrame(tick);
      }
    });
    const ro = new ResizeObserver(() => {
      ball?.resize();
      if (reduce && ball) ball.render(0, Infinity);
    });
    const onMove = (e: PointerEvent) => {
      ball?.pointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
      const b = canvas.getBoundingClientRect();
      const over =
        e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      ball?.hover(
        ((e.clientX - b.left) / b.width) * 2 - 1,
        -((e.clientY - b.top) / b.height) * 2 + 1,
        over,
      );
    };
    // Load three.js only when the CTA gets close to the viewport.
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        import("three")
          .then((THREE) => {
            if (cancelled) return;
            ball = createBeadBall(THREE, canvas); // throws without WebGL
            ball.resize();
            ball.render(0, reduce ? Infinity : 0);
            setReady(true);
            io.observe(canvas);
            ro.observe(canvas);
            if (!reduce) window.addEventListener("pointermove", onMove);
          })
          .catch(() => {
            if (!cancelled) setFailed(true);
          });
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(canvas);
    return () => {
      cancelled = true;
      near.disconnect();
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      ball?.dispose();
    };
  }, []);
  if (failed)
    return (
      <div
        aria-hidden
        className={`bg-[radial-gradient(ellipse_60%_45%_at_50%_100%,color-mix(in_srgb,var(--color-joat-gold)_40%,transparent),transparent_70%)] ${className}`}
        style={style}
      />
    );
  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`block transition-opacity duration-1000 motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"} ${className}`}
      style={style}
    />
  );
}

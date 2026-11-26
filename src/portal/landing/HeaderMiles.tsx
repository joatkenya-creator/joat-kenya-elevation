/**
 * Hero + navbar (Jiro "Miles" template, section 01), recoloured to the JOAT
 * palette. The navbar scrolls away with the hero (not sticky).
 * The gold bead rope is real-time WebGL; three.js r128 is lazy-loaded from the
 * `three` package only when the hero mounts.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import joatLogo from "@/assets/joat-logo.png";
import { usePrograms } from "../account";
import { NavLinks } from "../nav";
import {
  Artboard,
  Button,
  Reveal,
  at,
  focusRing,
  prefersReducedMotion,
  useDesignScale,
  useIsDesktop,
} from "./kit";

function Eyebrow({ className = "" }: { className?: string }) {
  return (
    <p className={`m-0 font-medium uppercase tracking-[0.18em] text-joat-gold ${className}`}>
      JOAT Global Brand Ambassador Program
    </p>
  );
}

function Headline({ className = "" }: { className?: string }) {
  return (
    <h1 className={`m-0 font-gilda font-normal text-joat-cream ${className}`}>
      Recommend <span className="text-joat-gold">brands</span> you believe in.{" "}
      <span className="font-glory leading-[0] text-joat-gold">Earn</span> on the sales you refer.
    </h1>
  );
}

function Intro({ className = "" }: { className?: string }) {
  return (
    <p className={`m-0 text-joat-body ${className}`}>
      One portal, two independent programs. Free to join, no purchase required, and you earn only on
      your own verified referrals.{" "}
      <span className="italic text-joat-cream">
        There is no reward for recruiting other ambassadors.
      </span>
    </p>
  );
}

function Ctas() {
  const { data: programs } = usePrograms();
  return (
    <div className="flex flex-wrap gap-[12px]">
      {programs?.some((p) => p.accepting_applications) && <Button to="/apply">Apply now</Button>}
      <Button href="#how-it-works" outline>
        How it works
      </Button>
    </div>
  );
}

function LogoTile({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative h-[180px] w-[188px] overflow-hidden rounded-[12px] border border-joat-border bg-joat-surface ${className}`}
    >
      <img
        src={joatLogo}
        alt="JOAT Global logo"
        className="absolute inset-0 size-full object-contain p-[18%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06]"
      />
    </div>
  );
}

// ── Desktop (≥1024px): fixed 1600 × 900 artboard ─────────────────
function HeroDesktop() {
  return (
    <Artboard id="home" height={900} className="bg-joat-black">
      {/* the artboard is taller than the rope's 769px frame: fade the rope out instead of a hard edge */}
      <BeadRope
        style={at(0, 1, 1600, 769)}
        className="[mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
      />

      <div style={at(60, 123, 380)}>
        <Reveal>
          <Intro className="text-[20px] leading-[29px]" />
        </Reveal>
        <Reveal delay={150} className="mt-[24px]">
          <LogoTile />
        </Reveal>
      </div>

      <div style={at(850, 510, 700)}>
        <Reveal delay={120}>
          <Eyebrow className="text-[15px]" />
        </Reveal>
        <Reveal delay={200} className="mt-[16px]">
          <Headline className="text-[62px] leading-[70px] tracking-[-1.8px]" />
        </Reveal>
        <Reveal delay={320} className="mt-[30px]">
          <Ctas />
        </Reveal>
      </div>
    </Artboard>
  );
}

// ── Mobile (<1024px) ──────────────────────────────────────────────
function HeroMobile() {
  return (
    <section id="home" className="overflow-hidden bg-joat-black pb-[40px] pt-[96px]">
      <div className="px-[20px] sm:px-[40px]">
        <Reveal>
          <Eyebrow className="text-[12px]" />
        </Reveal>
        <Reveal delay={60} className="mt-[12px]">
          <Headline className="text-[38px] leading-[44px] tracking-[-1.1px] sm:text-[52px] sm:leading-[60px]" />
        </Reveal>
        <Reveal delay={120} className="mt-[20px]">
          <Intro className="text-[17px] leading-[26px]" />
        </Reveal>
        <Reveal delay={200} className="mt-[24px]">
          <Ctas />
        </Reveal>
      </div>
      <div className="relative mt-[28px] aspect-[1600/769] w-full">
        <BeadRope className="absolute inset-0 size-full" />
        <Reveal delay={260} className="absolute left-[20px] top-[-8px]">
          <LogoTile className="!h-[110px] !w-[115px]" />
        </Reveal>
      </div>
    </section>
  );
}

// ── Navbar: sits on top of the hero and scrolls away with it (not sticky) ──
function Navbar() {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const s = useDesignScale();
  const close = () => setOpen(false);
  const link = `inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat py-[6px] text-left text-[16px] text-joat-cream no-underline transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-joat-gold ${focusRing}`;

  const bar = (
    <div
      className={`relative rounded-[8px] border border-joat-border bg-joat-surface transition-shadow duration-300 ${
        open ? "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]" : ""
      }`}
    >
      <div className="flex h-[42px] items-center justify-between px-[14px]">
        <Link
          to="/"
          className={`flex items-center gap-[8px] text-joat-cream no-underline ${focusRing}`}
          onClick={close}
        >
          <img src={joatLogo} alt="" className="h-[24px] w-[24px] object-contain" />
          <span className="font-gilda text-[16px] leading-none">JOAT Global Partners</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="landing-menu"
          onClick={() => setOpen((o) => !o)}
          className={`group relative flex h-[22px] w-[30px] cursor-pointer flex-col items-end justify-center gap-[5px] border-0 bg-transparent p-0 ${focusRing}`}
        >
          <span
            className={`block h-[2px] rounded-[10px] bg-joat-cream transition-all duration-300 ${
              open ? "w-[24px] translate-y-[7px] rotate-45" : "w-[28px]"
            }`}
          />
          <span
            className={`block h-[2px] rounded-[10px] bg-joat-cream transition-all duration-300 ${
              open ? "w-0 opacity-0" : "w-[23px] group-hover:w-[28px]"
            }`}
          />
          <span
            className={`block h-[2px] rounded-[10px] bg-joat-cream transition-all duration-300 ${
              open ? "w-[24px] -translate-y-[7px] -rotate-45" : "w-[17px] group-hover:w-[28px]"
            }`}
          />
        </button>
      </div>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        {/* inert while closed so the hidden links aren't tabbable */}
        <nav id="landing-menu" aria-label="Main" className="overflow-hidden" inert={!open}>
          <div className="flex flex-col items-start gap-[2px] px-[14px] pb-[14px] pt-[4px]">
            <NavLinks
              linkClass={link}
              activeClass={`${link} text-joat-gold`}
              applyClass={`${link} font-medium text-joat-gold`}
              onNavigate={close}
            />
          </div>
        </nav>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center font-inter-tight">
        <div
          className="pointer-events-auto w-[384px]"
          style={{ marginTop: 21 * s, transform: `scale(${s})`, transformOrigin: "top center" }}
        >
          {bar}
        </div>
      </div>
    );
  }
  return (
    <div className="absolute left-[20px] right-[20px] top-[14px] z-50 font-inter-tight">{bar}</div>
  );
}

export default function Hero() {
  const isDesktop = useIsDesktop();
  return (
    <div className="relative font-inter-tight antialiased">
      <Navbar />
      {isDesktop ? <HeroDesktop /> : <HeroMobile />}
    </div>
  );
}

// ── WebGL bead rope ──────────────────────────────────────────────
// 12 strands of glossy gold beads twisted into a rope. Lighting: soft studio box + key light,
// analytic sphere-to-sphere ambient occlusion and warm bounce light between the beads.
const ROPE = {
  // centre line traced from the Figma hero: [x, y, size] on the 1600 × 769 frame (size fakes perspective)
  path: [
    [-260, 860, 1.285],
    [0, 790, 1.263],
    [100, 772, 1.263],
    [200, 742, 1.255],
    [300, 688, 1.24],
    [400, 606, 1.225],
    [500, 520, 1.21],
    [600, 446, 1.24],
    [700, 386, 1.18],
    [800, 338, 1.112],
    [900, 302, 1.068],
    [1000, 278, 1.038],
    [1100, 260, 1.022],
    [1200, 236, 1.045],
    [1300, 196, 1.105],
    [1400, 152, 1.18],
    [1500, 96, 1.225],
    [1600, 30, 1.27],
    [1760, -80, 1.3],
  ] as [number, number, number][],
  envBg: "#1a130e",
  softbox: 3.0,
  fill: 0.8,
  floor: 0.5,
  floorColor: "#c9a227",
  back: 0.35,
  backColor: "#6b4a2f",
  sky: "#e0bc4a",
  ground: "#6b4a2f",
  hemi: 0.45,
  keyColor: "#ffe2a8",
  key: 2.5,
  keyPos: [-200, 1000, 500],
  bead: 30,
  strands: 12,
  touch: 0.97,
  along: 0.95,
  twist: 0.005,
  jitter: 0.05,
  color: "#c9a227",
  rough: 0.3,
  metal: 0.55, // metallic gold, not plastic
  exposure: 0.95,
  env: 1.0,
  ao: [0.85, 1.1, 0, 0],
  coreColor: "#4a3410",
  flow: 0.5, // beads per second travelling left → right along the rope
  spin: 0.24, // radians per second the whole rope turns around its own axis
  boost: 1.8, // max speed multiplier when the pointer moves over the hero
  // hover: a wave runs through the beads around the pointer and they float up a little
  hoverRadius: 260, // design px around the pointer that react
  hoverLift: 85, // how far beads rise (screen-up) under the pointer
  waveHeight: 20, // height of the ripples running out from the pointer
  waveLength: 240, // design px between wave crests
  swellHeight: 10, // gentle swell rolling along the whole rope while hovering
  directOcc: 0.4,
  bounce: 0.25,
  phaseJitter: 0.6,
  hex: 0.5,
  sbW: 14,
  sbH: 9,
  sbColor: "#fff4dc",
  lump: 0.05,
  sizeVar: 0.05,
  dirSpec: 0.0,
  hlDir: [-0.5, 0.7, 0.6],
  hl: [0.12, 14, 0.5, 90],
};

type Rope = {
  render: (t: number, intro: number) => void;
  resize: () => void;
  pointer: (x: number, y: number) => void;
  hover: (ndcX: number, ndcY: number, inside: boolean) => void;
  dispose: () => void;
};

/* eslint-disable @typescript-eslint/no-explicit-any -- template code drives three.js untyped */
function createBeadRope(THREE: any, canvas: HTMLCanvasElement): Rope {
  const P = ROPE;
  const W = 1600,
    H = 769;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  // filmic tone mapping keeps the gold highlights from blowing out to white
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = P.exposure;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const fov = 30;
  const D = H / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
  const camera = new THREE.PerspectiveCamera(fov, W / H, 10, 6000);
  camera.position.set(0, 0, D);

  // studio: big soft box above-front-left, dim warm surroundings
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.background = new THREE.Color(P.envBg);
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
  box(P.sbW, P.sbH, -3, 8, 5, P.sbColor, P.softbox); // main soft box
  box(14, 3, 4, 4, 8, "#fff1d6", P.fill); // front fill strip
  box(16, 16, 0, -9, 0, P.floorColor, P.floor); // warm floor bounce
  box(20, 10, 0, 0, -10, P.backColor, P.back); // backdrop
  const envRT = pmrem.fromScene(env, 0.02);
  scene.environment = envRT.texture;

  const hemi = new THREE.HemisphereLight(P.sky, P.ground, P.hemi);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(P.keyColor, P.key);
  key.position.set(P.keyPos[0], P.keyPos[1], P.keyPos[2]);
  scene.add(key);

  // ── centre line + fake perspective size ──
  const Z = new THREE.Vector3(0, 0, 1);
  const curve = new THREE.CatmullRomCurve3(
    P.path.map(([x, y]) => new THREE.Vector3(x - W / 2, H / 2 - y, 0)),
    false,
    "centripetal",
  );
  const length = curve.getLength();
  const sizeAtX = (x: number) => {
    const pth = P.path;
    if (x <= pth[0][0] - W / 2) return pth[0][2];
    for (let i = 1; i < pth.length; i++) {
      const x0 = pth[i - 1][0] - W / 2,
        x1 = pth[i][0] - W / 2;
      if (x <= x1) {
        const f = (x - x0) / (x1 - x0),
          e = f * f * (3 - 2 * f);
        return pth[i - 1][2] + (pth[i][2] - pth[i - 1][2]) * e;
      }
    }
    return pth[pth.length - 1][2];
  };
  const samples = 1000;
  const fr: { p: any; t: any; n: any; k: number }[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples,
      t = curve.getTangentAt(u),
      pt = curve.getPointAt(u);
    fr.push({ p: pt, t, n: new THREE.Vector3().crossVectors(t, Z).normalize(), k: sizeAtX(pt.x) });
  }
  const p = new THREE.Vector3(),
    T = new THREE.Vector3(),
    N = new THREE.Vector3(),
    tmp = new THREE.Vector3();
  let K = 1;
  const frameAt = (s: number) => {
    const u = Math.min(1, Math.max(0, s / length)) * samples;
    const i = Math.min(samples - 1, Math.floor(u)),
      f = u - i,
      a = fr[i],
      c = fr[i + 1];
    p.lerpVectors(a.p, c.p, f);
    T.lerpVectors(a.t, c.t, f).normalize();
    N.lerpVectors(a.n, c.n, f).normalize();
    K = a.k + (c.k - a.k) * f;
    if (s < 0) p.addScaledVector(T, s);
    else if (s > length) p.addScaledVector(T, s - length);
  };

  // ── strands ──
  const r = P.bead,
    S = P.strands;
  const R = (r * P.touch) / Math.sin(Math.PI / S); // neighbouring strands touch side by side
  const helix = Math.sqrt(1 + (R * P.twist) ** 2); // a strand is longer than the rope it wraps
  const rand = (i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const strands: { list: number[]; a0: number }[] = [];
  for (let j = 0; j < S; j++) {
    const list: number[] = [];
    for (
      let s = -r * 8 - (j % 2) * r * P.along * P.hex - rand(j) * P.phaseJitter * r;
      s < length + r * 8;
    ) {
      list.push(s);
      frameAt(s);
      s += (2 * r * P.along * K) / helix;
    }
    strands.push({ list, a0: (2 * Math.PI * j) / S + (rand(j + 50) - 0.5) * P.jitter });
  }
  const count = strands.reduce((n, st) => n + st.list.length - 1, 0);

  // ── intro: beads start scattered all around the frame and fly in to form the rope ──
  const INTRO = { maxDelay: 0.6, flight: 1.9 }; // seconds
  const INTRO_END = INTRO.maxDelay + INTRO.flight;
  const assembleU = { value: 1 };

  const geo = new THREE.SphereGeometry(r, 32, 24);
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(P.color).convertSRGBToLinear(),
    roughness: P.rough,
    metalness: P.metal,
    envMapIntensity: P.env,
  });
  const radialAttr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  const alongAttr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  geo.setAttribute("aRadial", radialAttr);
  geo.setAttribute("aAlong", alongAttr);
  mat.onBeforeCompile = (sh: any) => {
    sh.uniforms.uAO = { value: new THREE.Vector4(P.ao[0], P.ao[1], P.ao[2], P.ao[3]) };
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec3 aRadial;\nattribute vec3 aAlong;\nvarying vec3 vRadial;\nvarying vec3 vAlong;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvRadial = normalize(normalMatrix * aRadial);\nvAlong = normalize(normalMatrix * aAlong);",
      );
    sh.uniforms.uGeo = {
      value: new THREE.Vector4(2 * P.along, 2 * P.touch, R / r, (R - 0.9 * r) / r),
    };
    sh.uniforms.uDirect = { value: P.directOcc };
    sh.uniforms.uSinA = { value: Math.sin(Math.PI / S) };
    sh.uniforms.uBounce = { value: P.bounce };
    sh.uniforms.uDirSpec = { value: P.dirSpec };
    sh.uniforms.uHL = { value: new THREE.Vector4(P.hlDir[0], P.hlDir[1], P.hlDir[2], 0) };
    sh.uniforms.uHS = { value: new THREE.Vector4(P.hl[0], P.hl[1], P.hl[2], P.hl[3]) };
    sh.uniforms.uAssemble = assembleU;
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec4 uAO; uniform vec4 uGeo; uniform float uDirect; uniform float uSinA; uniform float uBounce; uniform float uDirSpec; uniform vec4 uHL; uniform vec4 uHS; uniform float uAssemble;
        varying vec3 vRadial; varying vec3 vAlong;
        // analytic sphere occlusion (Quilez): occluder centre c, radius ra, surface point p, normal n
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
          vec3 p = nn; // point on a unit bead
          float cosA = sqrt(1.0 - uSinA * uSinA);
          vec3 sideOff = sd * cosA - rad * uSinA;
          vec3 sideOff2 = -sd * cosA - rad * uSinA;
          float o = 0.0;
          o += sphOcc(p, nn,  al * uGeo.x, 1.0);
          o += sphOcc(p, nn, -al * uGeo.x, 1.0);
          o += sphOcc(p, nn,  sideOff  * uGeo.y + al * 0.5, 0.85);
          o += sphOcc(p, nn,  sideOff  * uGeo.y - al * 0.5, 0.85);
          o += sphOcc(p, nn,  sideOff2 * uGeo.y + al * 0.5, 0.85);
          o += sphOcc(p, nn,  sideOff2 * uGeo.y - al * 0.5, 0.85);
          o += sphOcc(p, nn, -rad * uGeo.z, uGeo.w);
          float ao = clamp(1.0 - uAO.x * o * uAssemble, 0.0, 1.0); // no contact shadows while beads are still flying in
          ao = pow(ao, uAO.y);
          reflectedLight.indirectDiffuse *= ao;
          reflectedLight.indirectSpecular *= ao;
          reflectedLight.directDiffuse *= mix(1.0 - uDirect, 1.0, ao);
          reflectedLight.directSpecular *= ao * uDirSpec;
          // soft studio highlight: broad lobe + tighter core, from a big light up-left-front
          vec3 Lh = normalize(uHL.xyz);
          vec3 Hh = normalize(Lh + geometry.viewDir);
          float nh = max(dot(nn, Hh), 0.0);
          float hl = uHS.x * pow(nh, uHS.y) + uHS.z * pow(nh, uHS.w);
          reflectedLight.directSpecular += vec3(1.0, 0.94, 0.82) * hl * ao;
          // warm inter-reflection: light bouncing between the beads fills the crevices with deep gold
          reflectedLight.indirectDiffuse += diffuseColor.rgb * uBounce * (1.0 - ao) * (0.6 + 0.4 * max(dot(nn, rad), 0.0));
        }`,
      );
  };
  const beads = new THREE.InstancedMesh(geo, mat, count);
  beads.frustumCulled = false;
  scene.add(beads);

  // dark inside so gaps read as deep crevices
  const coreGeo = new THREE.SphereGeometry(1, 20, 14);
  const coreMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(P.coreColor).convertSRGBToLinear(),
  });
  const coreSteps = Math.ceil(length / (r * 1.5)) + 16;
  const core = new THREE.InstancedMesh(coreGeo, coreMat, coreSteps);
  core.frustumCulled = false;
  scene.add(core);
  const m4 = new THREE.Matrix4();
  const coreAt: number[][] = [];
  for (let i = 0; i < coreSteps; i++) {
    frameAt(-r * 12 + i * r * 1.5);
    coreAt.push([p.x, p.y, p.z, (R - r * 0.9) * K]);
  }
  const setCore = (k: number) => {
    coreAt.forEach(([x, y, z, cr], i) => {
      m4.makeScale(cr * k + 1e-3, cr * k + 1e-3, cr * k + 1e-3);
      m4.setPosition(x, y, z);
      core.setMatrixAt(i, m4);
    });
    core.instanceMatrix.needsUpdate = true;
  };
  setCore(1);

  const easeOut = (x: number) => 1 - Math.pow(1 - x, 4);
  const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  const B = new THREE.Vector3();
  // pointer on the rope plane (world units = design px) and an eased hover strength 0…1
  const hp = new THREE.Vector3();
  const hpTarget = new THREE.Vector3();
  const hit = new THREE.Vector3();
  let hoverOn = false;
  let hoverAmt = 0;
  let hoverVel = 0;
  let lastWave = 0;
  // per-bead smoothed hover offset (dx, dy, dz, scale) so every bead glides instead of snapping
  const off = new Float32Array(count * 4);
  let residual = 0; // largest offset last frame, so beads finish settling before the effect switches off
  function layout(time: number, intro: number) {
    const flying = intro < INTRO_END;
    const now = performance.now() / 1000;
    const dtw = lastWave ? Math.min(0.05, now - lastWave) : 0;
    lastWave = now;
    // critically-damped spring toward on/off: soft start, soft stop, no overshoot
    const goal = hoverOn && !flying ? 1 : 0;
    const w0 = 5;
    hoverVel += (w0 * w0 * (goal - hoverAmt) - 2 * w0 * hoverVel) * dtw;
    hoverAmt = Math.min(1, Math.max(0, hoverAmt + hoverVel * dtw));
    const amt = hoverAmt * hoverAmt * (3 - 2 * hoverAmt); // smoothstep
    hp.lerp(hpTarget, 1 - Math.exp(-dtw * 4.5)); // the wave centre glides after the pointer
    const follow = 1 - Math.exp(-dtw * 7); // how quickly each bead eases to its wave position
    const waving = hoverAmt > 0.002 || Math.abs(hoverVel) > 0.001 || residual > 0.02;
    let maxOff = 0;
    const kWave = (2 * Math.PI) / P.waveLength;
    const steps = time * P.flow;
    const f = steps - Math.floor(steps); // 0 → 1 = every bead moves one place along its strand
    const cycle = Math.floor(steps);
    let k = 0;
    for (let j = 0; j < strands.length; j++) {
      const L = strands[j].list;
      const st = strands[j];
      for (let i = 0; i < L.length - 1; i++) {
        // stable id per physical bead, so its small size / position jitter travels with it
        const id = j * 10007 + (i - cycle);
        const s = L[i] + (L[i + 1] - L[i]) * f;
        frameAt(s);
        B.crossVectors(T, N); // = +z for a planar curve
        const th = st.a0 + P.twist * s - time * P.spin; // twist + rotation = a screw that visibly rolls left → right
        const c = Math.cos(th),
          sn = Math.sin(th);
        tmp.copy(N).multiplyScalar(c).addScaledVector(B, sn); // radial direction
        const h = rand(id * 7.31 + 3.1);
        const rad = R * K * (1 + (h - 0.5) * P.lump);
        const sc = K * (1 + (rand(id * 3.17 + 9.4) - 0.5) * P.sizeVar);
        let x = p.x + tmp.x * rad;
        let y = p.y + tmp.y * rad;
        let z = p.z + tmp.z * rad;
        let scale = sc;
        if (flying) {
          // each bead has its own start point around (and in front of / behind) the frame
          const delay = rand(id * 1.73 + 0.31) * INTRO.maxDelay;
          const e = easeOut(Math.min(1, Math.max(0, (intro - delay) / INTRO.flight)));
          const ang = rand(id * 2.91 + 5.7) * Math.PI * 2;
          const dist = (700 + rand(id * 4.13 + 1.9) * 900) * (1 - e);
          const swirl = (1 - e) * 1.6; // they curl in slightly as they arrive
          const ox = Math.cos(ang + swirl) * dist;
          const oy = Math.sin(ang + swirl) * dist * 0.75;
          const oz = (rand(id * 6.07 + 2.2) - 0.35) * 1300 * (1 - e);
          x += ox;
          y += oy;
          z += oz;
          scale = sc * (0.55 + 0.45 * e);
        }
        const o4 = k * 4;
        if (waving) {
          // beads near the pointer float up and ripple like a wave spreading outward
          const d = Math.hypot(x - hp.x, y - hp.y);
          const near = Math.exp(-((d / P.hoverRadius) ** 2));
          const ripple = Math.sin(d * kWave - now * 3.2);
          const bob = Math.sin(now * 1.8 + rand(id * 5.3 + 0.7) * 6.28); // each bead bobs on its own rhythm
          const swell = Math.sin(s * 0.009 - now * 1.6);
          const ty =
            amt * (near * (P.hoverLift + P.waveHeight * ripple + 5 * bob) + P.swellHeight * swell);
          const tx = amt * near * ripple * P.waveHeight * 0.3 * T.x;
          const tz = amt * near * (35 + 12 * ripple); // crest comes toward the viewer
          const ts = amt * near * (0.1 + 0.04 * ripple);
          off[o4] += (tx - off[o4]) * follow;
          off[o4 + 1] += (ty - off[o4 + 1]) * follow;
          off[o4 + 2] += (tz - off[o4 + 2]) * follow;
          off[o4 + 3] += (ts - off[o4 + 3]) * follow;
          maxOff = Math.max(maxOff, Math.abs(off[o4 + 1]), Math.abs(off[o4 + 2]));
        } else if (off[o4 + 1] !== 0) {
          off[o4] = off[o4 + 1] = off[o4 + 2] = off[o4 + 3] = 0;
        }
        x += off[o4];
        y += off[o4 + 1];
        z += off[o4 + 2];
        scale *= 1 + off[o4 + 3];
        m4.makeScale(scale, scale, scale);
        m4.setPosition(x, y, z);
        beads.setMatrixAt(k, m4);
        radialAttr.setXYZ(k, tmp.x, tmp.y, tmp.z);
        // strand direction = rope tangent + helical swirl
        const sw = R * P.twist;
        alongAttr.setXYZ(
          k,
          T.x + (-sn * N.x + c * B.x) * sw,
          T.y + (-sn * N.y + c * B.y) * sw,
          T.z + (-sn * N.z + c * B.z) * sw,
        );
        k++;
      }
    }
    residual = maxOff;
    beads.instanceMatrix.needsUpdate = true;
    radialAttr.needsUpdate = true;
    alongAttr.needsUpdate = true;
  }

  let mx = 0,
    my = 0,
    tx = 0,
    ty = 0;
  function render(time: number, intro: number) {
    layout(time, intro);
    if (intro < INTRO_END + 0.1) {
      const g = smooth(INTRO.maxDelay + INTRO.flight * 0.45, INTRO_END, intro);
      assembleU.value = g;
      setCore(g); // the dark core only fills in once the beads have nearly arrived
    }
    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;
    camera.position.set(mx * 40, -my * 24, D);
    camera.lookAt(mx * 10, -my * 6, 0);
    renderer.render(scene, camera);
  }
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    // the canvas may sit inside a scaled artboard: match the real on-screen size
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
      // pointer ray → the rope's plane (z = 0)
      hit.set(nx, ny, 0.5).unproject(camera).sub(camera.position);
      hit.multiplyScalar(-camera.position.z / hit.z).add(camera.position);
      // only react when the pointer is actually on the beads, not the empty space beside the rope
      let onRope = false;
      for (let i = 0; i <= samples; i += 2) {
        const fp = fr[i];
        // once active, allow for the lifted beads so the effect doesn't flicker off at the crest
        const reach = (R + r) * fp.k + (hoverOn ? P.hoverLift + 20 : 0);
        const dx = hit.x - fp.p.x;
        const dy = hit.y - fp.p.y;
        if (dx * dx + dy * dy <= reach * reach) {
          onRope = true;
          break;
        }
      }
      hoverOn = onRope;
      if (!onRope) return;
      hpTarget.copy(hit);
      if (hoverAmt < 0.01) hp.copy(hpTarget);
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Canvas that draws the bead rope; only animates while on screen, still frame for reduced
 * motion, and a static gold glow if three.js or WebGL is unavailable.
 */
function BeadRope({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let rope: Rope | null = null;
    let raf = 0;
    let visible = false;
    let seen = false;
    let cancelled = false;
    const reduce = prefersReducedMotion();
    // animation clock that only advances while frames are drawn (no jump after scrolling back or switching tabs)
    let clock = 0;
    let last = 0;
    let speed = 0; // eases from 0 → 1 on load
    let intro = 0; // seconds of intro played (only advances while the hero is on screen)
    let push = 0; // extra speed from pointer movement, decays
    const tick = (now: number) => {
      raf = 0;
      if (!rope || !visible) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      // ease in on load; pointer movement adds a temporary push
      push *= Math.exp(-dt * 1.6);
      speed += (1 + push - speed) * Math.min(1, dt * 2.5);
      clock += dt * speed;
      intro += dt;
      last = now;
      rope.render(clock, reduce ? Infinity : intro); // reduced motion: always the finished rope
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (!visible) seen = false;
      // every time the hero comes back into view the beads scatter and fly in again
      if (visible && !was && !seen && !reduce) intro = 0;
      if (visible) seen = true;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    const ro = new ResizeObserver(() => {
      rope?.resize();
      if (reduce && rope) rope.render(0, Infinity);
    });
    let px = -1;
    let py = -1;
    const onMove = (e: PointerEvent) => {
      rope?.pointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
      // moving the pointer over the hero gives the rope a push; it eases back afterwards
      const b = canvas.getBoundingClientRect();
      const inside = e.clientY >= b.top && e.clientY <= b.bottom;
      if (inside && px >= 0)
        push = Math.min(ROPE.boost - 1, push + Math.hypot(e.clientX - px, e.clientY - py) / 260);
      px = e.clientX;
      py = e.clientY;
      const over = inside && e.clientX >= b.left && e.clientX <= b.right;
      rope?.hover(
        ((e.clientX - b.left) / b.width) * 2 - 1,
        -((e.clientY - b.top) / b.height) * 2 + 1,
        over,
      );
    };
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) rope?.hover(0, 0, false); // pointer left the window
    };
    import("three")
      .then((THREE) => {
        if (cancelled) return;
        rope = createBeadRope(THREE, canvas); // throws without WebGL
        rope.resize();
        rope.render(0, reduce ? Infinity : 0);
        setReady(true);
        io.observe(canvas);
        ro.observe(canvas);
        if (!reduce) {
          window.addEventListener("pointermove", onMove);
          document.addEventListener("pointerout", onLeave);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      rope?.dispose();
    };
  }, []);
  if (failed)
    return (
      <div
        aria-hidden
        className={`bg-[radial-gradient(ellipse_60%_35%_at_55%_45%,color-mix(in_srgb,var(--color-joat-gold)_45%,transparent),transparent_70%)] ${className}`}
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

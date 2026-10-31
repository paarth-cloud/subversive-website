/**
 * Voxel brain shaders. One vertex program feeds two passes over the same
 * instanced cubes: an opaque pass with flat isometric face shading, and an
 * additive pass that draws glowing cube edges (the wireframe look).
 *
 * Stages driven by uMorph: 0 organic voxels, 1 digitised wireframe,
 * 2 stacked neural layers, 3 brain of light with orbital rings.
 */
export const voxelVertex = /* glsl */ `
  attribute vec3 aBrain;
  attribute vec3 aLayer;
  attribute vec3 aFinal;
  attribute vec3 aFrom;
  attribute vec3 aExplode;
  attribute vec4 aSeed;
  attribute vec4 aRing;
  attribute float aShade;

  uniform float uTime;
  uniform float uMorph;
  uniform float uIntro;
  uniform float uEnergy;
  uniform float uCalm;
  uniform float uCell;
  uniform vec2 uPointer;
  uniform float uPointerAmt;
  uniform float uAspect;
  uniform mat3 uRing1;
  uniform mat3 uRing2;

  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vColor;
  varying vec3 vEdgeColor;
  varying float vSolid;
  varying float vWire;
  varying float vEmit;
  varying float vSpark;

  const vec3 RED = vec3(0.91, 0.1, 0.17);
  const vec3 CORAL = vec3(1.0, 0.36, 0.27);
  const vec3 PINK = vec3(1.0, 0.24, 0.53);
  const vec3 AMBER = vec3(1.0, 0.54, 0.0);
  const vec3 VIOLET = vec3(0.42, 0.29, 1.0);
  const vec3 BLUE = vec3(0.13, 0.45, 1.0);
  const vec3 CYAN = vec3(0.0, 0.76, 0.82);
  const vec3 ICE = vec3(0.84, 0.93, 1.0);

  // Per-voxel progress through a 0..1 segment, offset by a sweep delay.
  float stagger(float t, float d, float w) {
    float s = d * (1.0 - w);
    return smoothstep(s, s + w, t);
  }

  // Mostly signal red warming to coral toward the crown, with sparse accents.
  vec3 warmColor(float p, float h) {
    vec3 c = mix(RED, CORAL, clamp(h * 0.75 + (p - 0.5) * 0.3, 0.0, 1.0));
    c = mix(c, PINK, step(0.95, p) * 0.6);
    c = mix(c, AMBER, step(0.975, p) * 0.8);
    return c * (0.86 + 0.24 * h);
  }

  vec3 coolColor(float p, float h) {
    vec3 c = mix(VIOLET, BLUE, smoothstep(0.08, 0.7, p));
    c = mix(c, CYAN, smoothstep(0.82, 1.0, p));
    return c * (0.82 + 0.3 * h);
  }

  void main() {
    float m = clamp(uMorph, 0.0, 3.0);
    float d = aSeed.x;
    float k0 = stagger(clamp(m, 0.0, 1.0), d, 0.42);
    float k1 = stagger(clamp(m - 1.0, 0.0, 1.0), aSeed.y * 0.35 + (aLayer.y * 0.5 + 0.5) * 0.65, 0.45);
    float k2 = stagger(clamp(m - 2.0, 0.0, 1.0), d, 0.45);
    bool isRing = aRing.x > 0.5;
    bool isCore = aRing.w > 1.5;

    // Digitised: the shell separates along its axes like an exploded diagram.
    vec3 c = aBrain + aExplode * (k0 * (1.0 - k1)) * uCell * 2.2;
    c = mix(c, aLayer, k1);

    vec3 fin = aFinal;
    if (isRing) {
      float dir = aRing.x > 1.5 ? -1.0 : 1.0;
      float a = aRing.y + uTime * 0.16 * dir;
      vec3 r = vec3(cos(a) * aRing.z, 0.0, sin(a) * aRing.z);
      fin = (aRing.x > 1.5 ? uRing2 : uRing1) * r;
    }
    c = mix(c, fin, k2);

    // Voxels arc upward while they travel between stages.
    c.y += (sin(k1 * 3.14159) * 0.42 + sin(k2 * 3.14159) * 0.3) * (0.35 + aSeed.y * 0.65);

    // Intro: the brain is built bottom-up, each voxel dropping into place.
    float ki = stagger(uIntro, clamp(aBrain.y * 0.5 + 0.5, 0.0, 1.0) * 0.75 + aSeed.z * 0.25, 0.3);
    c = mix(aFrom, c, ki);

    float organic = 1.0 - k0;
    c.y += sin(uTime * 1.25 + aBrain.x * 2.6 + aBrain.z * 2.0) * 0.012 * organic;

    // Voxels under the cursor rise, like pressing into a tactile grid.
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(c, 1.0);
    vec2 delta = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
    c.y += smoothstep(0.3, 0.0, length(delta)) * uPointerAmt * uCell * 2.6;

    float size = uCell * mix(0.86, 0.74, k0);
    size = mix(size, uCell * 0.62, k1);
    size = mix(size, uCell * (isRing ? 0.52 : (isCore ? 0.82 : 0.8)), k2);
    size *= ki;

    vec3 p = position * size + c;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vUv = uv;

    float h = clamp(aBrain.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 warm = warmColor(aSeed.z, h);
    vec3 cool = coolColor(aSeed.z, h);
    vec3 col = mix(warm, cool, k0);
    col = mix(col, mix(cool, ICE, 0.28), k2);
    // Fold floors sit darker in the organic stage, so the channels read as depth.
    col *= mix(aShade, 1.0, k0);
    col *= 1.0 - uCalm * 0.55;
    vColor = col;
    vEdgeColor = mix(warm * 1.2, mix(cool * 1.15, ICE, 0.15), k0) * (1.0 - uCalm * 0.5);

    // Solid in every stage except the digitised wireframe.
    vSolid = clamp(1.0 - k0 + k1, 0.0, 1.0);
    vWire = 0.14 + k0 * (1.0 - k1) * 0.5 + k1 * 0.3 + k2 * 0.3;

    // Synapses: a few surface voxels flare warm-white, slower when congested.
    float spark = pow(max(0.0, sin(uTime * (0.7 + aSeed.w * 1.3) * mix(1.0, 0.3, uCalm) + aSeed.w * 80.0)), 48.0);
    vSpark = spark * organic * uEnergy * step(0.6, aShade) * step(0.78, aSeed.w);
    float wave = fract(uTime * 0.3 + aSeed.y * 0.04) * 3.2 - 1.6;
    float forwardPass = 1.0 - smoothstep(0.0, 0.2, abs(wave - aLayer.y));
    vEmit = forwardPass * k1 * (1.0 - k2) * uEnergy * 0.95
      + k2 * (isCore ? 1.1 : (isRing ? 0.65 : 0.32));
  }
`

export const voxelSolidFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vSolid;
  varying float vEmit;
  varying float vSpark;

  void main() {
    if (vSolid < 0.5) discard;
    // Isometric illustration shading: bright tops, mid-tone left, dark right.
    vec3 n = normalize(vNormal);
    float diffuse = max(dot(n, normalize(vec3(-0.5, 0.82, 0.32))), 0.0);
    vec3 col = vColor * (0.2 + 0.8 * diffuse) + vColor * vEmit;
    vec2 e = min(vUv, 1.0 - vUv);
    col += vColor * (1.0 - smoothstep(0.0, 0.09, min(e.x, e.y))) * 0.2;
    col += vec3(1.0, 0.8, 0.58) * vSpark * 1.1;
    gl_FragColor = vec4(col, 1.0);
  }
`

export const voxelEdgeFragment = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vEdgeColor;
  varying float vWire;

  void main() {
    vec2 e = min(vUv, 1.0 - vUv);
    float dist = min(e.x, e.y);
    float w = fwidth(dist);
    float line = 1.0 - smoothstep(w * 0.6, w * 1.9, dist);
    float a = line * vWire;
    if (a < 0.004) discard;
    // Premultiplied light: alpha equals brightness (see GLOW_PREMULTIPLIED).
    vec3 c = min(vEdgeColor * a, vec3(1.0));
    gl_FragColor = vec4(c, max(max(c.r, c.g), c.b));
  }
`

export const linkVertex = /* glsl */ `
  attribute float aT;
  attribute float aPhase;
  varying float vT;
  varying float vPhase;

  void main() {
    vT = aT;
    vPhase = aPhase;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const linkFragment = /* glsl */ `
  uniform float uTime;
  uniform float uLinks;
  varying float vT;
  varying float vPhase;

  void main() {
    float head = fract(uTime * 0.55 + vPhase);
    float pulse = exp(-pow((vT - head) * 8.0, 2.0));
    float a = uLinks * (0.14 + pulse);
    if (a < 0.004) discard;
    vec3 c = min(vec3(0.42, 0.62, 1.0) * a, vec3(1.0));
    gl_FragColor = vec4(c, max(max(c.r, c.g), c.b));
  }
`

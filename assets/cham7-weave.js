/* CHẠM 7 — lightweight, procedural WebGL craft sculpture.
   One canvas, no external network or dependency. The photograph remains the fallback. */
(() => {
  'use strict';
  const stage = document.querySelector('[data-cham7-weave]');
  if (!stage) return;
  const canvas = stage.querySelector('canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!canvas || reduced.matches || (navigator.deviceMemory && navigator.deviceMemory < 4)) return;
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (_) {}
  if (!gl) return;
  const vertex = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute float aTone;
    attribute float aPhase;
    uniform float uTime;
    uniform float uAspect;
    uniform vec2 uPointer;
    uniform float uScroll;
    varying vec3 vNormal;
    varying float vTone;
    varying float vPhase;
    void main() {
      vec3 p = aPosition;
      p.z += sin(uTime * 0.42 + aPhase * 2.5) * .028;
      float ry = .32 + uPointer.x * .26 + sin(uTime * .16) * .17 + uScroll * .35;
      float rx = -.26 + uPointer.y * .13 + cos(uTime * .12) * .09;
      mat3 rotY = mat3(cos(ry),0.,-sin(ry), 0.,1.,0., sin(ry),0.,cos(ry));
      mat3 rotX = mat3(1.,0.,0., 0.,cos(rx),sin(rx), 0.,-sin(rx),cos(rx));
      mat3 rot = rotX * rotY;
      p = rot * p * .71;
      p.y -= .015;
      vNormal = normalize(rot * aNormal);
      vTone = aTone;
      vPhase = aPhase;
      float perspective = 2.38 / (3.85 - p.z);
      float frame = min(1., 1.42 / max(uAspect, .6));
      gl_Position = vec4(p.x * perspective * frame, p.y * perspective, p.z * .03, 1.);
    }`;
  const fragment = `
    precision mediump float;
    varying vec3 vNormal;
    varying float vTone;
    varying float vPhase;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 light = normalize(vec3(-.55,.7,1.));
      float diffuse = max(dot(n,light),0.);
      float back = max(dot(n,normalize(vec3(.65,-.15,.7))),0.);
      vec3 dark = vec3(.43,.26,.15);
      vec3 bamboo = vec3(.87,.66,.40);
      vec3 lightBamboo = vec3(.97,.85,.63);
      vec3 color = mix(dark,bamboo,clamp(vTone,0.,1.));
      color = mix(color,lightBamboo,.11 + .16 * sin(vPhase * 13.));
      float lighting = .48 + .43 * diffuse + .17 * back;
      float weaveGrain = .018 * sin(vPhase * 175.);
      gl_FragColor = vec4(color * (lighting + weaveGrain), 1.);
    }`;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (e) {
    stage.dataset.cham7Fallback = 'shader';
    return;
  }
  const vertices = [], indices = [];
  const segments = 52, bands = 13;
  function strip(family, band) {
    const start = vertices.length / 8;
    const off = (band - (bands - 1) / 2) * .20;
    const odd = band % 2;
    const phase = band * .61 + family * 2.3;
    for (let k=0; k<=segments; k++) {
      const t = k / segments, s = t * 2 - 1;
      const bend = .07 * Math.sin(s * 3.3 + phase);
      const a = s * 1.38;
      const c = off + bend;
      const x = family === 0 ? c : a;
      const y = family === 0 ? a : c;
      const radial = Math.hypot(x,y);
      const z = .32 * Math.cos(radial * 1.52) + (family === 0 ? .11 : -.08) + .15 * Math.cos(s * 10.2 + odd * 3.14159) + .028 * Math.sin(s * 4.5 + phase);
      const width = .084 + .009 * Math.cos(s * 4. + phase);
      for (let side=-1; side<=1; side+=2) {
        const px = x + (family === 0 ? width * side : .025 * Math.sin(s*4.)) ;
        const py = y + (family === 1 ? width * side : .012 * Math.cos(s*3.));
        const normal = family === 0 ? [-.18 * side,.12,.976] : [.13,.16 * side,.978];
        const tone = .25 + .62 * (band / (bands - 1)) + (family === 1 ? -.13 : .06);
        vertices.push(px,py,z,normal[0],normal[1],normal[2],tone,t+phase);
      }
      if (k<segments) {
        const n=start+k*2;
        indices.push(n,n+1,n+2,n+1,n+3,n+2);
      }
    }
  }
  for(let band=0; band<bands; band++) strip(0, band);
  for(let band=0; band<bands; band++) strip(1, band);
  const data = new Float32Array(vertices);
  const positions = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positions);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const faces = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faces);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  gl.useProgram(program);
  const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
  [['aPosition',3,0],['aNormal',3,3],['aTone',1,6],['aPhase',1,7]].forEach(([name,count,offset])=>{
    const loc=gl.getAttribLocation(program,name);
    if(loc<0)return;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,count,gl.FLOAT,false,stride,offset*4);
  });
  const uniforms = Object.fromEntries(['uTime','uAspect','uPointer','uScroll'].map(n=>[n,gl.getUniformLocation(program,n)]));
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0,0,0,0);
  let active = true, visible = false, raf=0, start=performance.now();
  let pointer=[0,0], target=[0,0], scroll=0, targetScroll=0;
  const resize=()=>{
    const rect=stage.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    const w=Math.max(1,Math.min(1500,Math.round(rect.width*dpr)));
    const h=Math.max(1,Math.min(1000,Math.round(rect.height*dpr)));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);
  };
  const onScroll=()=>{
    const r=stage.getBoundingClientRect();
    targetScroll=Math.max(0,Math.min(1,-r.top/Math.max(1,innerHeight)));
  };
  const draw=()=>{
    raf=0;
    if(!active||!visible||document.hidden||reduced.matches)return;
    pointer[0]+=(target[0]-pointer[0])*.045;
    pointer[1]+=(target[1]-pointer[1])*.045;
    scroll+=(targetScroll-scroll)*.055;
    resize();
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(uniforms.uTime,(performance.now()-start)/1000);
    gl.uniform1f(uniforms.uAspect,canvas.width/canvas.height);
    gl.uniform2f(uniforms.uPointer,pointer[0],pointer[1]);
    gl.uniform1f(uniforms.uScroll,scroll);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    raf=requestAnimationFrame(draw);
  };
  const schedule=()=>{if(!raf&&active&&visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(draw);};
  const visibility=new IntersectionObserver(entries=>{
    visible=entries.some(x=>x.isIntersecting);
    if(visible){onScroll();schedule();}
    else{cancelAnimationFrame(raf);raf=0;}
  },{rootMargin:'100px'});
  visibility.observe(stage);
  const onPointer=e=>{
    const r=stage.getBoundingClientRect();
    target=[(e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2];
  };
  stage.addEventListener('pointermove',onPointer,{passive:true});
  stage.addEventListener('pointerleave',()=>{target=[0,0];},{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener?.('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;}else schedule();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);stage.classList.remove('cham7-ready');});
  stage.classList.add('cham7-ready');
  onScroll();resize();schedule();
})();
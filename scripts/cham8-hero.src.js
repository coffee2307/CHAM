/* CHẠM 8 — Living Artifact. Built with Three.js, bundled locally.
   Scroll-responsive ceramic sculpture; documentary fallback stays in the DOM. */
import * as THREE from 'three';

const host = document.querySelector('[data-cham8-hero]');
if (host) {
  const canvas = host.querySelector('[data-cham8-canvas]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const smallMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4;
  const supportsWebGL = (() => {
    try { const test = document.createElement('canvas'); return Boolean(test.getContext('webgl2') || test.getContext('webgl')); }
    catch { return false; }
  })();

  if (supportsWebGL && !smallMemory && !reduceMotion.matches) {
    let renderer, scene, camera, vessel, material, shadow, observer, frame = 0, clock;
    let visible = false, ready = false, lost = false, lastScroll = 0;
    let firstValidFrame = false;
    let context;
    function showFallback(reason) {
      if (lost) return;
      lost = true; ready = false;
      host.classList.remove('cham8-hero--ready');
      host.dataset.cham8Render = 'fallback';
      cancelAnimationFrame(frame); frame = 0;
      if (reason) console.warn('CHẠM 8.1: ceramic 3D fallback', reason);
    }

    const pointer = new THREE.Vector2(0,0);
    const target = new THREE.Vector2(0,0);

    function clayTexture() {
      const size = 512;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d', { willReadFrequently: false });
      ctx.fillStyle = '#e8cfac'; ctx.fillRect(0,0,size,size);
      const rng = (() => { let seed=314159; return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); })();
      for (let i=0; i<42000; i++) {
        const x=rng()*size,y=rng()*size,r=.15+rng()*1.8;
        ctx.fillStyle = rng()>.48?'rgba(78,51,36,.095)':'rgba(255,250,222,.16)';
        ctx.fillRect(x,y,r,r);
      }
      for (let i=0; i<145; i++) {
        const y=rng()*size;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(72,43,31,'+(0.016+rng()*.038)+')';
        ctx.lineWidth = .3+rng()*1.5;
        ctx.moveTo(0,y);
        ctx.bezierCurveTo(size*.27,y+2,size*.6,y-1.5,size,y+1);
        ctx.stroke();
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.6,1.25);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    }
    function buildVessel() {
      const profile = [
        [.20,-1.16],[.37,-1.17],[.44,-1.12],[.48,-1.04],
        [.55,-.94],[.65,-.77],[.72,-.58],[.78,-.27],
        [.775,.04],[.73,.24],[.64,.40],[.53,.53],
        [.45,.66],[.43,.82],[.44,.94],[.49,.98],
        [.49,1.04],[.44,1.08],[.40,1.06],[.40,.98]
      ].map(([r,y])=>new THREE.Vector2(r,y));
      const geo = new THREE.LatheGeometry(profile, 160, 0, Math.PI*2);
      const pos = geo.attributes.position;
      for(let i=0;i<pos.count;i++) {
        const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
        const angle=Math.atan2(z,x);
        const undulation=1+.014*Math.sin(angle*5.5+y*2.9)+.010*Math.sin(angle*11.2-y*6.4)+.006*Math.sin(y*28);
        pos.setXYZ(i,x*undulation + .018*Math.sin(y*3),y,z*undulation);
      }
      pos.needsUpdate=true;geo.computeVertexNormals();
      const clay = new THREE.MeshPhysicalMaterial({
        color: '#c7a07a', map: clayTexture(), roughness:.82,
        metalness:0,clearcoat:.055,clearcoatRoughness:.88,
        bumpMap:null, side:THREE.DoubleSide
      });
      material=clay;
      const pot=new THREE.Group();
      const exterior=new THREE.Mesh(geo,clay);
      exterior.castShadow=true;exterior.receiveShadow=true;
      pot.add(exterior);

      // The top stays open: inner glazed well and a hand-rolled rim.
      const innerShape = [
        [0,.61],[.16,.62],[.30,.69],[.36,.84],[.39,1.00],[.44,1.066]
      ].map(([r,y])=>new THREE.Vector2(r,y));
      const inner = new THREE.Mesh(
        new THREE.LatheGeometry(innerShape,160),
        new THREE.MeshPhysicalMaterial({color:'#4a3129',roughness:.39,metalness:.04,side:THREE.DoubleSide,clearcoat:.24})
      );
      pot.add(inner);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.45,.038,14,160),
        new THREE.MeshStandardMaterial({color:'#af7853',roughness:.65,metalness:0}));
      rim.rotation.x=Math.PI/2;rim.position.y=1.033;rim.castShadow=true;pot.add(rim);

      // Subtle thrown-clay concentric marks, part of the object, not floating ornaments.
      for(const [r,y,w] of [[.72,-.57,.008],[.77,-.18,.006],[.68,.33,.007]]) {
        const ring=new THREE.Mesh(
          new THREE.TorusGeometry(r,w,8,128),
          new THREE.MeshStandardMaterial({color:'#80583d',transparent:true,opacity:.28,roughness:1})
        );
        ring.rotation.x=Math.PI/2;ring.position.y=y;ring.scale.x=1.015;
        pot.add(ring);
      }

      const shelf=new THREE.Mesh(
        new THREE.CylinderGeometry(.98,1.04,.11,96),
        new THREE.MeshStandardMaterial({color:'#514237',roughness:.92})
      );
      shelf.position.y=-1.28;shelf.castShadow=true;shelf.receiveShadow=true;
      pot.add(shelf);
      const ground=new THREE.Mesh(
        new THREE.PlaneGeometry(20,20),
        new THREE.ShadowMaterial({opacity:.29})
      );
      ground.rotation.x=-Math.PI/2;ground.position.y=-1.34;ground.receiveShadow=true;
      pot.add(ground);
      pot.position.y=.14;
      return pot;
    }
    function init(){
      try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35,1,.1,60);
        camera.position.set(0,.34,8.5);camera.lookAt(0,.14,0);
        renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
        context=renderer.getContext();
        const debugInfo=context.getExtension('WEBGL_debug_renderer_info');
        const rendererName=debugInfo?String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)||''):'';
        if (/SwiftShader|llvmpipe|Software Rasterizer/i.test(rendererName)) {
          throw new Error('software WebGL renderer');
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio||1, coarse.matches?1.20:1.5));
        renderer.outputColorSpace=THREE.SRGBColorSpace;
        renderer.toneMapping=THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure=1.62;
        renderer.shadowMap.enabled=true;
        renderer.shadowMap.type=THREE.PCFSoftShadowMap;
        scene.add(new THREE.AmbientLight(0xfff0db,.72));
        const key=new THREE.DirectionalLight(0xffe8ca,3.15);
        key.position.set(-3.5,6.5,4.4);key.castShadow=true;
        key.shadow.mapSize.set(1024,1024);
        key.shadow.camera.left=-4;key.shadow.camera.right=4;
        key.shadow.camera.top=4;key.shadow.camera.bottom=-4;
        key.shadow.bias=-.0004; key.shadow.radius=5;
        scene.add(key);
        const fill=new THREE.DirectionalLight(0xa7b8ad,1.10);
        fill.position.set(4,1.5,3);scene.add(fill);
        const back=new THREE.DirectionalLight(0xe6a16c,2.25);
        back.position.set(1.8,3,-4);scene.add(back);
        vessel=buildVessel();scene.add(vessel);
        clock=new THREE.Clock();ready=true;
        host.dataset.cham8Render = 'loading';
        resize();
        renderer.domElement.addEventListener('webglcontextlost',event=>{
          event.preventDefault();showFallback('context lost');
        },{once:true});
      } catch(e){
        showFallback(e.message);
        renderer?.dispose();
      }
    }
    function resize(){
      if(!ready)return;
      const r=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      const narrow=w<720;
      camera.position.set(0,narrow?.14:.34,narrow?5.5:8.5);
      camera.fov=narrow?41:35;
      camera.lookAt(0,narrow?.06:.14,0);
      camera.updateProjectionMatrix();
      vessel.scale.setScalar(narrow?.96:1.17);
      vessel.position.x=narrow?0:camera.aspect*.88;
      vessel.position.y=narrow?-.12:.06;
      if(reduceMotion.matches)render(0);
    }
    function scroll(){
      const r=host.getBoundingClientRect();
      lastScroll=THREE.MathUtils.clamp(-r.top/Math.max(1,r.height),0,1);
    }
    function render(time){
      if(!ready||lost)return;
      const progress=lastScroll;
      pointer.lerp(target,0.052);
      const idle=reduceMotion.matches?0:time;
      vessel.rotation.y=.36+idle*.12+pointer.x*.18+progress*.95;
      vessel.rotation.x=-.07+pointer.y*.09 + progress*.12;
      vessel.rotation.z=Math.sin(idle*.23)*.016;
      vessel.position.y=(host.clientWidth<720?-.12:.06)+Math.sin(idle*.6)*.024+progress*.17;
      vessel.scale.setScalar((host.clientWidth<720?.96:1.17)*(1+progress*.07));
      material.color.set('#c7a07a').lerp(new THREE.Color('#ad6b4d'),progress*.85);
      material.roughness=.82-progress*.21;
      try {
        renderer.render(scene,camera);
        if (!firstValidFrame) {
          const error=context.getError();
          if (error!==context.NO_ERROR) { showFallback('WebGL error '+error); return; }
          if (renderer.info.render.calls===0) { showFallback('no draw calls'); return; }
          firstValidFrame=true;
          host.classList.add('cham8-hero--ready');
          host.dataset.cham8Render = '3d';
        }
      } catch(e) { showFallback(e.message); }
    }
    function loop(){
      frame=0;
      if(!ready||!visible||document.hidden)return;
      render(clock.getElapsedTime());
      if(!reduceMotion.matches)frame=requestAnimationFrame(loop);
    }
    function wake(){
      if(!ready||!visible||document.hidden)return;
      if(frame)cancelAnimationFrame(frame);
      frame=requestAnimationFrame(loop);
    }
    init();
    if(ready){
      observer=new IntersectionObserver(entries=>{
        visible=Boolean(entries[0]?.isIntersecting);
        if(visible)wake();else {cancelAnimationFrame(frame);frame=0;}
      },{rootMargin:'160px'});
      observer.observe(host);
      host.addEventListener('pointermove',event=>{
        if(coarse.matches)return;
        const r=host.getBoundingClientRect();
        target.set((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2);
        if(reduceMotion.matches)wake();
      },{passive:true});
      host.addEventListener('pointerleave',()=>target.set(0,0),{passive:true});
      window.addEventListener('scroll',scroll,{passive:true});
      window.addEventListener('resize',resize,{passive:true});
      document.addEventListener('visibilitychange',wake);
      reduceMotion.addEventListener?.('change',wake);
      scroll();wake();
    }
  }
}

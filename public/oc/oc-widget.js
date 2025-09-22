(function(){
  const d=document;const w=window;
  if(w.__OC_WIDGET_LOADED__) return; w.__OC_WIDGET_LOADED__=true;

  const defaults={
    url:"https://oc-assistant-68142597623.us-central1.run.app/?embed=1",
    brandColor:"#1f6feb",
    bubbleText:"Habla con Oficios Circulares",
    greet:{text:"¿Puedo ayudarte en algo?", delay:2500, oncePer:"session"},
    utm:{source:"web", medium:"bubble"},
    zIndex:9999
  };

  function init(userCfg){
    const cfg=Object.assign({},defaults,userCfg||{});
    // inject CSS
    if(!d.getElementById('oc-widget-css')){
      const link=d.createElement('link');
      link.id='oc-widget-css'; link.rel='stylesheet'; link.href=(cfg.cssHref||'')||'https://'+location.host+'/web-widget/oc-widget.css';
      // fallback inline if load fails
      link.onerror=()=>{console.warn('OC widget CSS not found; using inline styles')}
      d.head.appendChild(link);
    }

    // elements
    const bubble=d.createElement('button');
    bubble.className='oc-bubble';
    bubble.type='button';
    bubble.setAttribute('aria-haspopup','dialog');
    bubble.setAttribute('aria-label','Abrir asistente de Oficios Circulares');
    bubble.textContent=cfg.bubbleText;
    bubble.style.background=cfg.brandColor;
    bubble.style.zIndex=String(cfg.zIndex);

    const panel=d.createElement('div');
    panel.className='oc-panel';
    panel.style.zIndex=String(cfg.zIndex-1);
    const head=d.createElement('div');head.className='oc-head';
    const title=d.createElement('div');title.className='oc-title'; title.textContent='Asistente de Oficios Circulares';
    const close=d.createElement('button'); close.className='oc-close'; close.type='button'; close.innerHTML='✕'; close.setAttribute('aria-label','Cerrar');
    const iframe=d.createElement('iframe'); iframe.className='oc-iframe';
    const sid = (localStorage.getItem('oc_sid')|| (localStorage.setItem('oc_sid',crypto.randomUUID()), localStorage.getItem('oc_sid')));
    const url=new URL(cfg.url);
    url.searchParams.set('embed','1');
    url.searchParams.set('utm_source',cfg.utm.source||'web');
    url.searchParams.set('utm_medium',cfg.utm.medium||'bubble');
    iframe.src=url.toString();
    head.appendChild(title); head.appendChild(close);
    panel.appendChild(head); panel.appendChild(iframe);

    // greeting
    const greet=d.createElement('div'); greet.className='oc-greet'; greet.textContent=cfg.greet.text||'';

    d.body.appendChild(bubble); d.body.appendChild(panel); d.body.appendChild(greet);

    let open=false; let greetShown=false;
    function showPanel(){ open=true; panel.style.display='block'; bubble.setAttribute('aria-expanded','true'); setTimeout(()=>iframe.focus(),50); }
    function hidePanel(){ open=false; panel.style.display='none'; bubble.setAttribute('aria-expanded','false'); }
    function toggle(){ open?hidePanel():showPanel(); }
    function showGreet(){
      if(greetShown) return; const key='oc_greet_'+(cfg.greet.oncePer||'session');
      const storage = (cfg.greet.oncePer==='session')? sessionStorage : localStorage;
      if(storage.getItem(key)) return;
      greet.style.display='block'; setTimeout(()=>{greet.style.display='none'}, 5000);
      storage.setItem(key,'1'); greetShown=true;
    }

    bubble.addEventListener('click',toggle);
    bubble.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }});
    close.addEventListener('click',hidePanel);
    d.addEventListener('keydown',e=>{ if(e.key==='Escape' && open) hidePanel(); });

    if(cfg.greet && cfg.greet.text){ setTimeout(showGreet, cfg.greet.delay||2000); }
  }

  // Expose init
  w.OCWidget={ init };
})();


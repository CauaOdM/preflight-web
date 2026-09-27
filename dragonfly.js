const html = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = {
  raf(){},
  stop(){},
  start(){},
  scrollTo(target){ target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }
};
let scrollLocks = 1;

function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
window.scrollTo(0,0);
lenis.stop();
html.style.overflow = 'hidden';

function lockScroll(){ scrollLocks += 1; lenis.stop(); html.style.overflow='hidden'; }
function unlockScroll(){ scrollLocks = Math.max(0,scrollLocks-1); if(!scrollLocks){ lenis.start(); html.style.removeProperty('overflow'); } }
function applyAdaptiveGrid(){ const base=1920,coef=.6666,w=innerWidth; const reduction=((base-w)/base)*100; const size=16-(16*(reduction*coef))/100; if(size>16) html.style.fontSize=size+'px'; else html.style.removeProperty('font-size'); }
applyAdaptiveGrid(); addEventListener('resize',applyAdaptiveGrid);

const loader = document.querySelector('#loader');
const fill = document.querySelector('#loaderFill');
const counter = document.querySelector('#loaderCount');
const start = performance.now();
const easeInOutCubic = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
function loadFrame(now){
  const p=Math.min((now-start)/1300,1); const value=Math.round(easeInOutCubic(p)*100);
  if(fill) fill.style.width=value+'%';
  if(counter) counter.textContent=String(value).padStart(3,'0');
  if(p<1) requestAnimationFrame(loadFrame); else setTimeout(()=>{
    loader?.classList.add('is-leaving'); document.querySelector('#siteHeader')?.classList.add('ready'); document.querySelector('.hero')?.classList.add('ready');
    setTimeout(()=>{ loader?.remove(); unlockScroll(); },720);
  },120);
}
requestAnimationFrame(loadFrame);

const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('in-view'); observer.unobserve(entry.target); }}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const teamAccordion = document.querySelector('.team-accordion');
if(teamAccordion){
  const teamCards = [...teamAccordion.querySelectorAll('.team-card')];
  const teamTriggers = teamCards.map(card=>card.querySelector('.team-card-trigger'));
  const closeTeamCards = ()=>{
    teamAccordion.classList.remove('has-active');
    teamCards.forEach(card=>card.classList.remove('is-active'));
    teamTriggers.forEach(trigger=>trigger.setAttribute('aria-expanded','false'));
  };
  const openTeamCard = (selectedCard, selectedTrigger)=>{
    const isAlreadyOpen = selectedCard.classList.contains('is-active');
    closeTeamCards();
    if(isAlreadyOpen) return;
    teamAccordion.classList.add('has-active');
    selectedCard.classList.add('is-active');
    selectedTrigger.setAttribute('aria-expanded','true');
  };
  teamTriggers.forEach((trigger,index)=>{
    trigger.addEventListener('click',()=>openTeamCard(teamCards[index],trigger));
    trigger.addEventListener('keydown',event=>{
      const lastIndex=teamTriggers.length-1;
      let nextIndex=index;
      if(event.key==='ArrowRight'||event.key==='ArrowDown') nextIndex=index===lastIndex?0:index+1;
      else if(event.key==='ArrowLeft'||event.key==='ArrowUp') nextIndex=index===0?lastIndex:index-1;
      else if(event.key==='Escape'){closeTeamCards();trigger.blur();return;}
      else return;
      event.preventDefault();
      teamTriggers[nextIndex].focus();
    });
  });
  document.addEventListener('click',event=>{if(!teamAccordion.contains(event.target)) closeTeamCards();});
}

function updateClock(){
  const now=new Date(); let hour=now.getHours(); const meridiem=hour>=12?'pm':'am'; hour=hour%12||12;
  const time=`${hour}:${String(now.getMinutes()).padStart(2,'0')}${meridiem}`;
  const date=new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(now);
  document.querySelectorAll('.js-time').forEach(el=>el.textContent=time); document.querySelectorAll('.js-date').forEach(el=>el.textContent=date);
}
updateClock(); setInterval(updateClock,1000);

const menu=document.querySelector('#navMenu'); const openMenu=document.querySelector('#openMenu'); const closeMenu=document.querySelector('#closeMenu');
function showMenu(){ menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); openMenu.setAttribute('aria-expanded','true'); lockScroll(); }
function hideMenu(){ if(!menu.classList.contains('open')) return; menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); openMenu.setAttribute('aria-expanded','false'); unlockScroll(); }
openMenu.addEventListener('click',showMenu); closeMenu.addEventListener('click',hideMenu);

function goTo(id){ const target=document.getElementById(id); if(!target) return; hideMenu(); setTimeout(()=>lenis.scrollTo(target,{offset:0,duration:1.25}),50); }
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();goTo(button.dataset.scroll);}));
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{ const id=link.getAttribute('href').slice(1); if(id&&document.getElementById(id)){event.preventDefault();goTo(id);} }));

const modal=document.querySelector('#requestModal'); const formState=document.querySelector('#modalFormState'); const success=document.querySelector('#modalSuccess');
function showModal(){ hideMenu(); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); lockScroll(); setTimeout(()=>modal.querySelector('input')?.focus(),250); }
function hideModal(){ if(!modal.classList.contains('open')) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); unlockScroll(); setTimeout(()=>{success.classList.remove('show');formState.style.display='block';document.querySelector('#interestForm').reset();},350); }
document.querySelectorAll('.js-open-modal').forEach(button=>button.addEventListener('click',showModal));
document.querySelector('#closeModal').addEventListener('click',hideModal); document.querySelector('#successClose').addEventListener('click',hideModal);
modal.addEventListener('click',event=>{if(event.target===modal)hideModal();});
document.querySelector('#interestForm').addEventListener('submit',event=>{event.preventDefault();formState.style.display='none';success.classList.add('show');});
addEventListener('keydown',event=>{if(event.key==='Escape'){if(modal.classList.contains('open'))hideModal();else hideMenu();}});

const carouselItems=[
  {caption:'Entrada',title:'Briefing + base + regras.'},
  {caption:'Auditoria',title:'Política estruturada e auditoria verificável.'},
  {caption:'Entrega',title:'Base preparada para o próximo processo.'}
];
let current=0; const copy=document.querySelector('#carouselCopy'); const dots=document.querySelector('#carouselDots');
carouselItems.forEach((_,index)=>{const dot=document.createElement('span');dot.className='carousel-dot'+(index===0?' active':'');dots.append(dot);});
function updateCarousel(step){ current=(current+step+carouselItems.length)%carouselItems.length; copy.classList.add('swapping'); setTimeout(()=>{copy.querySelector('.carousel-caption').textContent=carouselItems[current].caption;copy.querySelector('.carousel-title').textContent=carouselItems[current].title;document.querySelectorAll('.carousel-dot').forEach((dot,index)=>dot.classList.toggle('active',index===current));copy.classList.remove('swapping');},180); }
document.querySelector('#carouselPrev').addEventListener('click',event=>{event.stopPropagation();updateCarousel(-1);});
document.querySelector('#carouselNext').addEventListener('click',event=>{event.stopPropagation();updateCarousel(1);});
document.querySelector('#heroCard').addEventListener('click',()=>updateCarousel(1));
document.querySelector('#heroCard').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();updateCarousel(1);}});

const statObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return; const el=entry.target; const target=Number(el.dataset.count); const currency=el.dataset.format==='currency'; const duration=reducedMotion?0:1200; const began=performance.now();
  const format=value=>currency?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value):new Intl.NumberFormat('pt-BR').format(value);
  function tick(now){const p=duration?Math.min((now-began)/duration,1):1;el.textContent=format(Math.round((1-Math.pow(1-p,3))*target));if(p<1)requestAnimationFrame(tick);}
  requestAnimationFrame(tick); statObserver.unobserve(el);
}),{threshold:.55});
document.querySelectorAll('[data-count]').forEach(el=>statObserver.observe(el));

// LiquidReveal preservado do template. As imagens ainda são placeholders.
if(!reducedMotion){
  const container=document.querySelector('#liquidReveal'); const canvas=document.querySelector('#heroCanvas'); const ctx=canvas.getContext('2d');
  const revealImage=new Image(); revealImage.src='assets/imagem2.jpeg';
  let cover=document.createElement('canvas'),coverCtx=cover.getContext('2d'),brush=document.createElement('canvas'),brushCtx=brush.getContext('2d');
  let dpr=1,radius=143,points=[],last=null,idle=121,ready=false;
  function resizeCanvas(){ const rect=container.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';cover.width=canvas.width;cover.height=canvas.height;radius=143*dpr;const size=Math.ceil(radius*2);brush.width=size;brush.height=size;if(revealImage.complete&&revealImage.naturalWidth)drawCover(); }
  function drawCover(){ const scale=Math.max(cover.width/revealImage.naturalWidth,cover.height/revealImage.naturalHeight);const w=revealImage.naturalWidth*scale,h=revealImage.naturalHeight*scale;coverCtx.clearRect(0,0,cover.width,cover.height);coverCtx.drawImage(revealImage,(cover.width-w)/2,(cover.height-h)/2,w,h);ready=true; }
  revealImage.addEventListener('load',drawCover); new ResizeObserver(resizeCanvas).observe(container); resizeCanvas();
  addEventListener('pointermove',event=>{if(!ready)return;const rect=container.getBoundingClientRect();const x=(event.clientX-rect.left)*dpr,y=(event.clientY-rect.top)*dpr;if(x<-radius||y<-radius||x>canvas.width+radius||y>canvas.height+radius){last=null;return;}if(!last)last={x,y};const dx=x-last.x,dy=y-last.y,dist=Math.hypot(dx,dy),step=Math.max(radius*.3,1),n=Math.min(Math.ceil(dist/step),60);for(let i=1;i<=Math.max(n,1);i++)points.push({x:last.x+dx*i/Math.max(n,1),y:last.y+dy*i/Math.max(n,1)});last={x,y};idle=0;});
  function stamp(x,y){const size=brush.width,c=size/2;brushCtx.clearRect(0,0,size,size);const gradient=brushCtx.createRadialGradient(c,c,0,c,c,c);gradient.addColorStop(0,'rgba(191,80,141,1)');gradient.addColorStop(.55,'rgba(191,80,141,.82)');gradient.addColorStop(1,'rgba(191,80,141,0)');brushCtx.globalCompositeOperation='source-over';brushCtx.fillStyle=gradient;brushCtx.fillRect(0,0,size,size);brushCtx.globalCompositeOperation='source-in';brushCtx.drawImage(cover,x-c,y-c,size,size,0,0,size,size);brushCtx.globalCompositeOperation='source-atop';brushCtx.fillStyle='rgba(191,80,141,.38)';brushCtx.fillRect(0,0,size,size);brushCtx.globalCompositeOperation='source-over';ctx.drawImage(brush,x-c,y-c);}
  function liquidTick(){if(points.length){idle=0;ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.016)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';points.splice(0).forEach(point=>stamp(point.x,point.y));}else if(idle<=120){idle++;const fade=Math.min(.016+idle*.004,.5);ctx.globalCompositeOperation='destination-out';ctx.fillStyle=`rgba(0,0,0,${fade})`;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';if(idle===120)ctx.clearRect(0,0,canvas.width,canvas.height);}requestAnimationFrame(liquidTick);}
  requestAnimationFrame(liquidTick);
}

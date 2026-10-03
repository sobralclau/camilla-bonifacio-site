const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function setMenu(open, returnFocus = false) {
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('is-open', open);
  if (returnFocus) toggle.focus();
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true); });
document.addEventListener('click', e => { if (!e.target.closest('.header-inner')) setMenu(false); });
nav?.addEventListener('focusout', () => { setTimeout(() => { if (!nav.contains(document.activeElement) && document.activeElement !== toggle) setMenu(false); }, 0); });
matchMedia('(min-width:821px)').addEventListener('change', () => setMenu(false));

// Optional adapter. No tracking SDK, cookies or identifiers are loaded by this site.
// Configure window.siteAnalytics = (eventName, payload) => ... only after privacy review.
if (document.documentElement.dataset.analytics === 'true') {
  document.addEventListener('click', event => {
    const a = event.target.closest('a[data-cta-id]');
    if (!a || typeof window.siteAnalytics !== 'function') return;
    const payload = { cta_id: a.dataset.ctaId, section: a.dataset.section };
    if (a.dataset.itemId) payload.item_id = a.dataset.itemId;
    try { window.siteAnalytics('whatsapp_click', payload); } catch { /* Navigation remains native. */ }
  });
}

const LEAD_API='/api/leads';
const leadModal=document.querySelector('#lead-modal');
const leadForm=document.querySelector('#lead-capture-form');
const leadStatus=document.querySelector('#lead-status');
let pendingLead={message:'',ctaId:'',section:'',itemId:'',fallbackUrl:'',auto:false};

function leadDigits(v){return String(v||'').replace(/\D/g,'')}
function formatLeadPhone(v){
  const d=leadDigits(v).slice(0,11);
  if(d.length<=2)return d;
  if(d.length<=6)return '('+d.slice(0,2)+') '+d.slice(2);
  if(d.length<=10)return '('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);
  return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);
}
function openLeadModal(link=null,{auto=false}={}){
  if(link){
    sessionStorage.setItem(LEAD_CTA_INTERACTED_KEY,'1');
    stopLeadPopupAutoTriggers();
  }
  pendingLead=link ? {
    message:link.dataset.leadMessage||'Olá, Camilla! Vim pelo seu site e gostaria de iniciar um atendimento.',
    ctaId:link.dataset.ctaId||'site',
    section:link.dataset.section||'site',
    itemId:link.dataset.itemId||'',
    fallbackUrl:link.href,
    auto:false
  } : {
    message:'',
    ctaId:'popup_engajamento',
    section:'captacao_modal',
    itemId:'popup',
    fallbackUrl:'',
    auto:true
  };
  if(!leadModal){
    if(link) location.href=link.href;
    return;
  }
  leadModal.classList.add('is-open');
  leadModal.setAttribute('aria-hidden','false');
  document.body.classList.add('lead-modal-open');
  leadStatus.textContent='';
  const sector=leadForm?.elements.sector;
  if(sector && auto) sector.value='';
  setTimeout(()=>leadForm?.elements.name?.focus(),50);
}
function closeLeadModal(){
  if(!leadModal)return;
  leadModal.classList.remove('is-open');
  leadModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('lead-modal-open');
}
document.querySelectorAll('a[data-lead-capture="true"]').forEach(link=>{
  link.addEventListener('click',e=>{e.preventDefault();openLeadModal(link);});
});
document.querySelectorAll('[data-lead-close]').forEach(el=>el.addEventListener('click',closeLeadModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&leadModal?.classList.contains('is-open'))closeLeadModal();});
leadForm?.elements.phone?.addEventListener('input',e=>{e.target.value=formatLeadPhone(e.target.value);});

const LEAD_POPUP_SESSION_KEY='camilla_lead_popup_shown';
const LEAD_CTA_INTERACTED_KEY='camilla_lead_cta_interacted';
const LEAD_DATA_PROVIDED_KEY='camilla_lead_data_provided';
const LEAD_EXIT_POPUP_SHOWN_KEY='camilla_lead_exit_popup_shown';
const LEAD_POPUP_DELAY_MS=25000;
const LEAD_POPUP_SCROLL_RATIO=0.4;
let leadPopupTimer=null;
let leadPopupScrollHandler=null;
let leadPopupExitHandler=null;

function stopLeadPopupAutoTriggers(){
  if(leadPopupTimer){
    window.clearTimeout(leadPopupTimer);
    leadPopupTimer=null;
  }
  if(leadPopupScrollHandler){
    window.removeEventListener('scroll',leadPopupScrollHandler);
    leadPopupScrollHandler=null;
  }
}

function stopLeadPopupTriggers(){
  stopLeadPopupAutoTriggers();
  if(leadPopupExitHandler){
    document.removeEventListener('mouseout',leadPopupExitHandler);
    leadPopupExitHandler=null;
  }
}

function showAutomaticLeadPopup(){
  if(!leadModal || sessionStorage.getItem(LEAD_POPUP_SESSION_KEY))return;
  if(leadModal.classList.contains('is-open'))return;
  sessionStorage.setItem(LEAD_POPUP_SESSION_KEY,'1');
  stopLeadPopupAutoTriggers();
  openLeadModal(null,{auto:true});
}

function setupAutomaticLeadPopup(){
  if(!leadModal)return;

  if(!sessionStorage.getItem(LEAD_POPUP_SESSION_KEY)){
    leadPopupTimer=window.setTimeout(showAutomaticLeadPopup,LEAD_POPUP_DELAY_MS);

    leadPopupScrollHandler=()=>{
      const scrollable=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
      const progress=Math.min(window.scrollY/scrollable,1);
      if(progress>=LEAD_POPUP_SCROLL_RATIO)showAutomaticLeadPopup();
    };
    window.addEventListener('scroll',leadPopupScrollHandler,{passive:true});
  }

  const isDesktop=window.matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine)').matches;
  if(isDesktop && !sessionStorage.getItem(LEAD_EXIT_POPUP_SHOWN_KEY)){
    leadPopupExitHandler=e=>{
      if(e.relatedTarget!==null || e.clientY>10 || leadModal.classList.contains('is-open'))return;
      if(!sessionStorage.getItem(LEAD_CTA_INTERACTED_KEY))return;
      if(sessionStorage.getItem(LEAD_DATA_PROVIDED_KEY))return;
      sessionStorage.setItem(LEAD_EXIT_POPUP_SHOWN_KEY,'1');
      stopLeadPopupTriggers();
      openLeadModal(null,{auto:true});
    };
    document.addEventListener('mouseout',leadPopupExitHandler);
  }
}

setupAutomaticLeadPopup();

function sectorData(sector,name){
  if(sector==='arquitetura'){
    return {
      section:'arquitetura',
      source:'popup_arquitetura',
      context:'Atendimento consultivo de arquitetura',
      message:'Olá, Camilla! Vim pelo seu site e gostaria de um atendimento consultivo de arquitetura. Meu nome é '+name+'. Quero conversar sobre meu projeto e entender como você pode me orientar.'
    };
  }
  return {
    section:'curadoria_imobiliaria',
    source:'popup_curadoria_imobiliaria',
    context:'Curadoria imobiliária exclusiva',
    message:'Olá, Camilla! Vim pelo seu site e gostaria de uma curadoria imobiliária exclusiva. Meu nome é '+name+'. Quero receber orientação para encontrar um imóvel alinhado ao meu perfil, rotina e objetivos.'
  };
}
function openLeadWhatsApp(name,sector){
  const chosen=sectorData(sector,name);
  const baseContext=pendingLead.message && !pendingLead.auto ? pendingLead.message : chosen.message;
  const msg=pendingLead.auto ? chosen.message : [
    baseContext,
    '',
    'Meu nome é '+name+'. Meu interesse principal é '+chosen.context.toLowerCase()+'. Preenchi meus dados no site para dar continuidade ao atendimento.'
  ].join('\n');
  window.location.href='https://wa.me/5583999318581?text='+encodeURIComponent(msg);
}
leadForm?.addEventListener('submit',async e=>{
  e.preventDefault();
  const name=String(leadForm.elements.name.value||'').trim();
  const phone=leadDigits(leadForm.elements.phone.value);
  const sector=String(leadForm.elements.sector.value||'').trim();
  const consent=leadForm.elements.consent.checked;
  if(name.length<2){leadStatus.textContent='Informe seu nome para continuar.';leadForm.elements.name.focus();return;}
  if(phone.length<10){leadStatus.textContent='Confira o WhatsApp informado.';leadForm.elements.phone.focus();return;}
  if(!sector){leadStatus.textContent='Escolha o tipo de atendimento desejado.';leadForm.elements.sector.focus();return;}
  if(!consent){leadStatus.textContent='Confirme a autorização para continuar.';leadForm.elements.consent.focus();return;}
  const chosen=sectorData(sector,name);
  sessionStorage.setItem(LEAD_DATA_PROVIDED_KEY,'1');
  stopLeadPopupTriggers();
  const submit=leadForm.querySelector('button[type="submit"]');
  submit.disabled=true;submit.textContent='Registrando...';leadStatus.textContent='Registrando seu contato...';
  const payload={
    name,phone,
    cta_id:pendingLead.ctaId,
    section:chosen.section,
    context:pendingLead.message && !pendingLead.auto ? pendingLead.message+' | Interesse: '+chosen.context : chosen.context,
    source:pendingLead.auto ? chosen.source : (pendingLead.itemId?('site_'+pendingLead.itemId):'site_camilla'),
    page:location.href,
    referrer:document.referrer
  };
  try{
    const res=await fetch(LEAD_API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    if(!res.ok)throw new Error('SAVE_FAILED');
    leadStatus.textContent='Contato registrado. Abrindo o WhatsApp...';
  }catch{
    leadStatus.textContent='Abrindo o WhatsApp para continuar o atendimento...';
  }finally{
    submit.disabled=false;submit.textContent='Continuar no WhatsApp';
    openLeadWhatsApp(name,sector);
  }
});

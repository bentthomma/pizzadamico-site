const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/result-panel-BlfUQI6Y.js","https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/index-C2jiFvkb.js","https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/index-Cvyr6GZu.css","https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/submit-CSIyH32G.js"])))=>i.map(i=>d[i]);
import{q as _,e as T,c as n,s as I,_ as R,a as Ae,o as Le,b as te}from"https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/index-C2jiFvkb.js";const we="damico.wizard.v3",G={step:1,eventType:null,date:null,time:null,durationHours:null,availabilityChecked:!1,availabilityResult:null,address:null,addressCoords:null,distanceKm:null,adults:0,children:0,vegetarian:0,toppings:[],setup:{power:null,space:null,shelter:null,access:null},name:null,email:null,phone:null,note:null,acceptedTerms:!1,submitted:!1,submittedAt:null,reference:null};let D={...G};const J=new Set;try{const e=localStorage.getItem(we);if(e){const t=JSON.parse(e);t.submitted||(D={...G,...t})}}catch{}function Q(){try{localStorage.setItem(we,JSON.stringify(D))}catch{}}function ee(){const e=S();for(const t of J)t(e)}function S(){return{...D,toppings:[...D.toppings],setup:{...D.setup},addressCoords:D.addressCoords?[...D.addressCoords]:null}}function A(e,t){if(!(e in G))throw new Error(`unknown wizard field: ${e}`);D[e]=t,Q(),ee()}function F(e){for(const[t,i]of Object.entries(e)){if(!(t in G))throw new Error(`unknown wizard field: ${t}`);D[t]=i}Q(),ee()}function j(e){return J.add(e),e(S()),()=>J.delete(e)}function Te(){D={...G},Q(),ee()}function De(){return!D.date||!D.time?null:`${D.date}T${D.time}:00`}function Ne(){if(!D.date||!D.time||!D.durationHours)return null;const[e,t]=D.time.split(":").map(Number),i=new Date(`${D.date}T${String(e).padStart(2,"0")}:${String(t).padStart(2,"0")}:00`).getTime();if(isNaN(i))return null;const a=i+D.durationHours*3600*1e3,r=new Date(a),l=r.getFullYear(),p=String(r.getMonth()+1).padStart(2,"0"),d=String(r.getDate()).padStart(2,"0"),f=String(r.getHours()).padStart(2,"0"),o=String(r.getMinutes()).padStart(2,"0");return`${l}-${p}-${d}T${f}:${o}:00`}const Me=new Set(["hochzeit","firma","geburtstag","privat"]),_e=/^\d{2}:\d{2}$/,Ie=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,Oe=6;function $e(e){return Number.isInteger(e)&&e>=1&&e<=12}function Pe(){return new Date().toISOString().slice(0,10)}function Re(e){return typeof e=="number"&&Number.isFinite(e)}function Fe(e){const t=[];return(!e.eventType||!Me.has(e.eventType))&&t.push({field:"eventType",msg:"Bitte Anlass wählen."}),t}function je(e){const t=[];if(e.date?e.date<Pe()&&t.push({field:"date",msg:"Datum darf nicht in der Vergangenheit liegen."}):t.push({field:"date",msg:"Datum wählen."}),(!e.time||!_e.test(e.time))&&t.push({field:"time",msg:"Uhrzeit setzen."}),$e(e.durationHours)||t.push({field:"durationHours",msg:"Dauer wählen (1-12 Stunden)."}),!e.availabilityChecked)t.push({field:"availabilityChecked",msg:"Verfügbarkeit prüfen."});else{const i=e.availabilityResult;if(!i||i.available!==!0){const a=i&&i.conflictOn?` (${i.conflictOn})`:"";t.push({field:"availabilityResult",msg:`Termin nicht verfügbar.${a}`})}}return t}function He(e){const t=[];return(!e.address||String(e.address).trim().length===0)&&t.push({field:"address",msg:"Event-Ort angeben."}),(!Re(e.distanceKm)||e.distanceKm<0)&&t.push({field:"distanceKm",msg:"Distanz konnte nicht berechnet werden."}),t}function Be(e){const t=[],i=Number(e.adults)||0,a=Number(e.children)||0;return i+a<1&&t.push({field:"adults",msg:"Mindestens ein Gast."}),t}function Ke(e){const t=[];return(Array.isArray(e.toppings)?e.toppings.length:0)>Oe&&t.push({field:"toppings",msg:"Maximal 6 Zutaten."}),t}function Ue(e){const t=[];return(e.setup||{}).power==null&&t.push({field:"setup.power",msg:"Frage beantworten: Strom."}),t}function We(e){const t=[];return(typeof e.name=="string"?e.name.trim():"").length<2&&t.push({field:"name",msg:"Name angeben."}),(!e.email||!Ie.test(e.email))&&t.push({field:"email",msg:"Gültige E-Mail."}),(typeof e.phone=="string"?e.phone.replace(/\D/g,""):"").length<8&&t.push({field:"phone",msg:"Telefonnummer angeben."}),t}function Ge(e){const t=[];e.acceptedTerms||t.push({field:"acceptedTerms",msg:"AGB bestätigen."});for(let i=2;i<=8;i++)t.push(...H(i,e));return t}function H(e,t){switch(e){case 1:return[];case 2:return Fe(t);case 3:return je(t);case 4:return He(t);case 5:return Be(t);case 6:return Ke(t);case 7:return Ue(t);case 8:return We(t);case 9:return Ge(t);default:return[]}}function B(e,t){switch(e){case 1:return!0;case 2:case 3:case 4:case 5:case 6:case 7:case 8:return H(e,t).length===0;case 9:return t.acceptedTerms===!0;default:return!1}}const X=["Willkommen","Anlass","Datum","Ort","Gäste","Zutaten","Setup","Kontakt","Übersicht"],K=X.length;function q(e){return!!(e.date&&e.time&&e.durationHours)}function ne(e){switch(e){case 2:return"Anlass wählen";case 3:return"Datum, Uhrzeit und Dauer wählen";case 4:return"Adresse mit km-Berechnung";case 5:return"Mindestens 30 Gäste";case 6:return"Bis zu 6 Zutaten wählen";case 7:return"Alle 4 Fragen beantworten";case 8:return"Name, E-Mail und Telefon";case 9:return"AGB bestätigen";default:return""}}function Ve({onStepChange:e}){const t=_("#wizard-steps"),i=_("#wizard-prev"),a=_("#wizard-next"),r=_("#wizard-progress-num"),l=_("#wizard-progress-title"),p=_("#wizard-footer-meta"),d=_("#wizard-modal");let f=null,o=!1;const c=[];if(t){T(t);for(let s=0;s<K;s++){const y=s+1,k=n("li",{"aria-label":X[s],dataset:{step:String(y),state:"pending"}});k.addEventListener("click",()=>{if(k.dataset.state!=="done")return;const E=S().step;y!==E&&A("step",y)}),k.addEventListener("keydown",E=>{if(k.dataset.state==="done"&&(E.key==="Enter"||E.key===" ")){E.preventDefault();const N=S().step;if(y===N)return;A("step",y)}}),t.appendChild(k),c.push(k)}}function h(s){for(let y=0;y<K;y++){const k=y+1;let E;k<s.step?E="done":k===s.step?E="active":E="pending";const N=c[y];N&&(N.dataset.state=E,E==="done"?(N.setAttribute("role","button"),N.setAttribute("tabindex","0"),N.classList.add("is-clickable")):(N.removeAttribute("role"),N.removeAttribute("tabindex"),N.classList.remove("is-clickable")),E==="active"?N.setAttribute("aria-current","step"):N.removeAttribute("aria-current"))}t&&t.setAttribute("aria-valuenow",String(s.step))}function v(s){I(r,`Schritt ${s.step} von ${K}`),I(l,X[s.step-1]||"")}function m(s){const y=s.step<=1,k=s.step===K;let E;if(s.step===3?E=B(3,s)||q(s):E=B(s.step,s),i&&(i.disabled=y,i.hidden=y,i.setAttribute("aria-hidden",y?"true":"false")),a){if(o)return;k?a.textContent="Reservation bestätigen":(T(a),a.appendChild(n("span",{},["Weiter"])),a.appendChild(n("span",{"aria-hidden":"true"},["→"]))),a.disabled=!E,a.setAttribute("aria-disabled",E?"false":"true"),a.dataset.final=k?"true":"false"}}function g(s){if(!p)return;if(s.step===1){I(p,"Nimm dir kurz Zeit — dann los.");return}if(s.step===3){I(p,q(s)?"":ne(3));return}const y=B(s.step,s);I(p,y?"":ne(s.step))}j(s=>{if(h(s),v(s),m(s),g(s),f===null)f=s.step,typeof e=="function"&&e({step:s.step,direction:"initial"});else if(s.step!==f){const y=s.step>f?"forward":"backward";f=s.step,typeof e=="function"&&e({step:s.step,direction:y})}});function z(){const s=S();s.step<=1||A("step",s.step-1)}async function C(){var y,k,E,N;const s=S();if(s.step===K){const x=H(s.step,s);if(x.length>0||!B(s.step,s)){document.dispatchEvent(new CustomEvent("wizard:invalid",{detail:{step:s.step,errors:x}}));return}document.dispatchEvent(new CustomEvent("wizard:submit"));return}if(s.step===3){if(s.availabilityChecked&&s.availabilityResult&&s.availabilityResult.available===!0){A("step",s.step+1);return}if(!q(s)){try{const x=await R(()=>Promise.resolve().then(()=>Y),void 0,import.meta.url);(y=x.renderAvailabilityError)==null||y.call(x,"Bitte Datum, Uhrzeit und Dauer ausfüllen.")}catch{}document.dispatchEvent(new CustomEvent("wizard:invalid",{detail:{step:3,errors:H(3,s)}}));return}if(o)return;o=!0,u(!0);try{const x=await R(()=>Promise.resolve().then(()=>Y),void 0,import.meta.url),L=await x.runAvailabilityCheck();if(L.ok){u(!1),A("step",s.step+1);return}if(L.result){(k=x.renderAvailabilityConflict)==null||k.call(x,L.result),u(!1);return}(E=x.renderAvailabilityError)==null||E.call(x,L.error||"Verbindung fehlgeschlagen. Noch einmal?"),document.dispatchEvent(new CustomEvent("wizard:invalid",{detail:{step:3,errors:[{field:"availabilityResult",msg:L.error||"Verbindung fehlgeschlagen."}]}})),u(!1)}catch{try{const L=await R(()=>Promise.resolve().then(()=>Y),void 0,import.meta.url);(N=L.renderAvailabilityError)==null||N.call(L,"Verbindung fehlgeschlagen. Noch einmal?")}catch{}u(!1)}return}if(!B(s.step,s)){if(s.step===8){const x=H(s.step,s);x.length>0&&document.dispatchEvent(new CustomEvent("wizard:invalid",{detail:{step:s.step,errors:x}}))}return}if(s.step===5&&(Number(s.adults)||0)+(Number(s.children)||0)<30){const L=_("#wizard-stage");L&&R(()=>Promise.resolve().then(()=>Ct),void 0,import.meta.url).then($=>{typeof $.showUnder30Popup=="function"&&$.showUnder30Popup(L)}).catch(()=>{});return}A("step",s.step+1)}i&&i.addEventListener("click",z),a&&a.addEventListener("click",C);function u(s){if(a)if(s)o=!0,T(a),a.appendChild(document.createTextNode("Prüfe Verfügbarkeit …")),a.disabled=!0,a.setAttribute("aria-disabled","true"),a.setAttribute("aria-busy","true"),a.style.cursor="wait";else{o=!1,a.removeAttribute("aria-busy"),a.style.cursor="";const y=S();m(y),g(y)}}function b(){a&&(T(a),a.appendChild(document.createTextNode("Sende Anfrage …")),a.classList.add("is-loading"),a.disabled=!0,a.setAttribute("aria-disabled","true"),a.setAttribute("aria-busy","true"),a.style.cursor="wait",i&&(i.disabled=!0,i.setAttribute("aria-disabled","true")))}function w(){if(!a)return;a.classList.remove("is-loading"),a.removeAttribute("aria-busy"),a.style.cursor="";const s=S();m(s),g(s),i&&i.removeAttribute("aria-disabled")}document.addEventListener("wizard:submitting",b),document.addEventListener("wizard:submitted",w),document.addEventListener("wizard:error",s=>{w();const y=s&&s.detail&&s.detail.msg||"";y&&p&&I(p,y)}),document.addEventListener("keydown",s=>{if(s.key!=="Enter"||!d||!(d.getAttribute("aria-hidden")==="false"||d.classList.contains("is-open")))return;const k=s.target;if(!(k instanceof HTMLElement))return;const E=k.tagName;E==="INPUT"||E==="TEXTAREA"||E==="SELECT"||k.isContentEditable||E==="BUTTON"||E==="A"||k.closest("[data-no-enter]")||(s.preventDefault(),a&&a.click())})}const qe=260,ie=700;function ae(){try{return window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}async function ye(e,t,i){if(!e||typeof t!="function")return;if(i==="initial"){t(e),e.scrollTop=0;const f=e.querySelector(".wizard-step");f&&(f.classList.add("active"),ae()?f.classList.remove("is-mounting"):setTimeout(()=>f.classList.remove("is-mounting"),ie));return}const a=ae(),r=e.querySelector(".wizard-step");if(!r)return ye(e,t,"initial");const l=i==="forward"?"to-left":"to-right";r.dataset.leave=l,r.classList.remove("active"),a||await Ye(qe),t(e),e.scrollTop=0;const p=e.querySelector(".wizard-step");if(!p)return;const d=i==="forward"?"from-right":"from-left";if(p.dataset.enter=d,a){delete p.dataset.enter,p.classList.add("active"),p.classList.remove("is-mounting");return}requestAnimationFrame(()=>{requestAnimationFrame(()=>{delete p.dataset.enter,p.classList.add("active")})}),setTimeout(()=>p.classList.remove("is-mounting"),ie)}function Ye(e){return new Promise(t=>setTimeout(t,e))}function Ze(e){T(e);const t=n("section",{class:"wizard-step is-mounting step1-intro"},[n("div",{class:"wizard-step-head step1-intro-head"},[n("div",{class:"wizard-step-kicker"},["Willkommen · Schritt 1 von 9"]),n("h2",{class:"wizard-step-title step1-intro-title"},["Euer Fest.",n("br",{}),"Unser Handwerk."]),n("p",{class:"wizard-step-lede step1-intro-lede"},["In 3 Minuten seid ihr durch. Pietro meldet sich persönlich. Verbindlich wird die Reservation nach CHF 250.– Anzahlung per TWINT."])]),n("div",{class:"step1-intro-preview"},[n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["01"]),n("span",{class:"step1-intro-label"},["Anlass"])]),n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["02"]),n("span",{class:"step1-intro-label"},["Datum & Zeit"])]),n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["03"]),n("span",{class:"step1-intro-label"},["Ort"])]),n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["04"]),n("span",{class:"step1-intro-label"},["Gäste"])]),n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["05"]),n("span",{class:"step1-intro-label"},["Zutaten"])]),n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["06"]),n("span",{class:"step1-intro-label"},["Setup"])]),n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["07"]),n("span",{class:"step1-intro-label"},["Kontakt"])]),n("div",{class:"step1-intro-row"},[n("span",{class:"step1-intro-num"},["08"]),n("span",{class:"step1-intro-label"},["Übersicht"])])]),n("div",{class:"step1-intro-pricing"},[n("div",{class:"step1-intro-pricing-head"},["So rechnen wir"]),n("div",{class:"step1-intro-pricing-row"},[n("span",{class:"step1-intro-pricing-label"},["Erwachsene",n("small",{},["Pizza à discrétion"])]),n("span",{class:"step1-intro-pricing-amount"},["CHF 25.–"])]),n("div",{class:"step1-intro-pricing-row"},[n("span",{class:"step1-intro-pricing-label"},["Kinder",n("small",{},["5–10 Jahre"])]),n("span",{class:"step1-intro-pricing-amount"},["CHF 12.–"])]),n("div",{class:"step1-intro-pricing-row"},[n("span",{class:"step1-intro-pricing-label"},["Anfahrt",n("small",{},["hin & zurück, pro km"])]),n("span",{class:"step1-intro-pricing-amount"},["CHF 1.50"])]),n("div",{class:"step1-intro-pricing-row"},[n("span",{class:"step1-intro-pricing-label"},["Reservation",n("small",{},["Anzahlung via TWINT"])]),n("span",{class:"step1-intro-pricing-amount"},["CHF 250.–"])]),n("p",{class:"step1-intro-pricing-vat"},["+ 8.1 % MwSt auf den Gesamtbetrag"])])]);e.appendChild(t)}const Je="http://www.w3.org/2000/svg",Xe=[{id:"hochzeit",title:"Hochzeit",sub:"Der schönste Tag — einmalig, nicht wiederholbar.",icon:e=>{e.appendChild(V("circle",{cx:"9",cy:"14",r:"5"})),e.appendChild(V("circle",{cx:"15",cy:"14",r:"5"}))}},{id:"firma",title:"Firmenevent",sub:"Sommerfest, Weihnachtsfeier, Team-Offsite.",icon:e=>{e.appendChild(M("M3 21h18")),e.appendChild(M("M5 21V7l7-4 7 4v14")),e.appendChild(M("M9 9h2")),e.appendChild(M("M13 9h2")),e.appendChild(M("M9 13h2")),e.appendChild(M("M13 13h2")),e.appendChild(M("M9 17h2")),e.appendChild(M("M13 17h2"))}},{id:"geburtstag",title:"Geburtstag",sub:"Runder, halbrunder, oder einfach so.",icon:e=>{e.appendChild(M("M4 18h16v3H4z")),e.appendChild(M("M6 14c0-2 2-4 6-4s6 2 6 4v4H6z")),e.appendChild(M("M12 3v5")),e.appendChild(M("M9 6h6"))}},{id:"privat",title:"Privates Fest",sub:"Hausfest, Jubiläum, Einladung im Garten.",icon:e=>{e.appendChild(M("M3 12l9-8 9 8v8H3z")),e.appendChild(M("M9 20v-6h6v6"))}}];function V(e,t={}){const i=document.createElementNS(Je,e);for(const[a,r]of Object.entries(t))i.setAttribute(a,String(r));return i}function M(e){return V("path",{d:e})}function Qe(e){const t=V("svg",{class:"wz-card-icon",viewBox:"0 0 24 24",stroke:"currentColor","stroke-width":"1.4",fill:"none","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true"});return e.icon(t),t}function et(e){T(e);const t=n("section",{class:"wizard-step is-mounting"}),i=n("div",{class:"wizard-step-head"},[n("div",{class:"wizard-step-kicker"},["Schritt 2 von 9"]),n("h2",{class:"wizard-step-title"},["Was für ein Anlass?"]),n("p",{class:"wizard-step-lede"},["Einer dieser vier — damit Pietro weiss, was euch wichtig ist."])]),a=n("div",{class:"wz-card-grid"}),r=[],l=S().eventType;for(const d of Xe){const f=l===d.id,o=n("button",{type:"button",class:"wz-card","aria-pressed":f?"true":"false",dataset:{event:d.id},tabindex:"0"});o.appendChild(Qe(d)),o.appendChild(n("div",{class:"wz-card-title"},[d.title])),o.appendChild(n("div",{class:"wz-card-sub"},[d.sub])),o.addEventListener("click",()=>{A("eventType",d.id);for(const c of r)c.setAttribute("aria-pressed",c.dataset.event===d.id?"true":"false")}),o.addEventListener("keydown",c=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(c.key))return;c.preventDefault();const v=r.indexOf(o);if(v===-1)return;let m=v;c.key==="ArrowLeft"||c.key==="ArrowUp"?m=(v-1+r.length)%r.length:m=(v+1)%r.length,r[m].focus()}),r.push(o),a.appendChild(o)}const p=n("div",{class:"wizard-step-body"},[a]);t.appendChild(i),t.appendChild(p),e.appendChild(t)}const se="wz-step2-styles";function tt(){if(document.getElementById(se))return;const e=n("style",{id:se},[`
    .step2-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
    }
    @media (max-width: 640px) { .step2-grid { grid-template-columns: 1fr; } }

    .step2-duration .wz-card-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    @media (max-width: 900px) {
      .step2-duration .wz-card-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 520px) {
      .step2-duration .wz-card-grid { grid-template-columns: 1fr; }
    }
    .step2-duration .wz-card { padding: 18px 18px; }
    .step2-duration .wz-card-badge {
      display: inline-block;
      font-family: var(--ff-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--wz-accent);
      margin-top: 4px;
    }

    .step2-duration input[type="number"]::-webkit-outer-spin-button,
    .step2-duration input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none; margin: 0;
    }
    .step2-duration input[type="number"] { -moz-appearance: textfield; max-width: 180px; }
    .step2-placeholder-span {
      font-family: var(--ff-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--wz-fg-dim);
    }

    .step2-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 1px solid var(--wz-line);
      border-radius: 999px;
      font-family: var(--ff-editorial);
      font-style: italic;
      font-size: 13.5px;
      color: var(--wz-fg-soft);
      background: color-mix(in srgb, var(--wz-accent) 6%, transparent);
      align-self: flex-start;
    }

    .step3-status {
      border: 1px solid var(--wz-line);
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: color-mix(in srgb, var(--wz-fg) 2%, transparent);
      transition: border-color 260ms var(--wz-e-soft),
                  background 260ms linear;
    }
    .step3-status:empty {
      display: none;
    }
    .step3-status[data-state="conflict"] {
      border-color: color-mix(in srgb, var(--wz-danger) 45%, var(--wz-line));
      background: color-mix(in srgb, var(--wz-danger) 5%, transparent);
    }
    .step3-status[data-state="error"] {
      border-color: color-mix(in srgb, var(--wz-danger) 40%, var(--wz-line));
    }

    .step3-status-line {
      display: flex;
      align-items: baseline;
      gap: 10px;
      font-size: 17px;
      line-height: 1.4;
    }
    .step3-status-line[data-tone="conflict"] { color: var(--wz-fg); }
    .step3-status-line[data-tone="error"]    { color: var(--wz-danger); }
    .step3-status-icon {
      font-size: 18px;
      line-height: 1;
      flex: 0 0 auto;
    }

    .step2-alt-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .step2-alt-title {
      font-family: var(--ff-mono);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--wz-fg-dim);
    }

    .step2-alt-slots {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .step2-alt-chip {
      appearance: none;
      background: transparent;
      border: 1px solid var(--wz-line);
      color: var(--wz-fg);
      padding: 8px 14px;
      border-radius: 999px;
      font-family: var(--ff-mono);
      font-size: 13px;
      letter-spacing: 0.06em;
      cursor: pointer;
      transition: background 200ms linear, border-color 200ms linear,
                  transform 200ms var(--wz-e-soft);
    }
    .step2-alt-chip:hover {
      background: color-mix(in srgb, var(--wz-accent) 12%, transparent);
      border-color: var(--wz-accent);
      transform: translateY(-1px);
    }

    .step2-alt-days {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .step2-alt-day {
      appearance: none;
      text-align: left;
      background: transparent;
      border: 1px solid var(--wz-line);
      color: var(--wz-fg);
      padding: 10px 14px;
      border-radius: 10px;
      font-family: var(--ff-display);
      font-size: 15px;
      cursor: pointer;
      transition: background 200ms linear, border-color 200ms linear;
    }
    .step2-alt-day:hover {
      background: color-mix(in srgb, var(--wz-accent) 10%, transparent);
      border-color: var(--wz-accent);
    }
  `]);document.head.appendChild(e)}const nt={hochzeit:{time:"16:00",duration:5},firma:{time:"18:00",duration:4},geburtstag:{time:"18:00",duration:4},privat:{time:"18:30",duration:4}},it=["So","Mo","Di","Mi","Do","Fr","Sa"],at=["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sept.","Okt.","Nov.","Dez."];function st(){const e=new Date,t=e.getFullYear(),i=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${t}-${i}-${a}`}function re(e){try{const[t,i,a]=e.split("-").map(Number),r=new Date(t,i-1,a);return`${it[r.getDay()]}, ${a}. ${at[i-1]}`}catch{return e}}function rt(){const e=S();if(!e.eventType)return;const t=nt[e.eventType];if(!t)return;const i={};e.time||(i.time=t.time),e.durationHours||(i.durationHours=t.duration),Object.keys(i).length&&F(i)}function W(){F({availabilityChecked:!1,availabilityResult:null});const e=document.querySelector(".step3-status");e&&(e.dataset.state="idle",T(e))}function xe(e){tt(),T(e),rt();const t=n("section",{class:"wizard-step is-mounting"}),i=n("div",{class:"wizard-step-head"},[n("div",{class:"wizard-step-kicker"},["Schritt 3 von 9"]),n("h2",{class:"wizard-step-title"},["Wann soll's stattfinden?"]),n("p",{class:"wizard-step-lede"},["Pietro hält euch das Datum frei, sobald die CHF 250.– Anzahlung per TWINT eingegangen ist."])]),a=n("div",{class:"step2-grid"}),r=n("div",{class:"wz-field"});r.appendChild(n("label",{class:"wz-label",for:"step2-date"},["Datum"]));const l=n("input",{id:"step2-date",type:"date",class:"wz-input",min:st(),value:S().date??""});l.addEventListener("change",m=>{A("date",m.target.value||null),W()}),r.appendChild(l),a.appendChild(r);const p=n("div",{class:"wz-field"});p.appendChild(n("label",{class:"wz-label",for:"step2-time"},["Startzeit"]));const d=n("input",{id:"step2-time",type:"time",class:"wz-input",value:S().time??""});d.addEventListener("change",m=>{A("time",m.target.value||null),W()}),p.appendChild(d),a.appendChild(p);const f=n("div",{class:"wz-field step2-duration"});f.appendChild(n("div",{class:"wz-label"},["Dauer (Stunden)"]));const o=n("input",{id:"step2-duration",type:"number",min:"1",max:"12",step:"1",class:"wz-input",inputmode:"numeric",placeholder:"z.B. 4",value:Number.isInteger(S().durationHours)?String(S().durationHours):""});o.addEventListener("input",()=>{const m=o.value.trim();if(m==="")return;const g=parseInt(m,10);Number.isInteger(g)&&g>=1&&g<=12&&(A("durationHours",g),W())}),o.addEventListener("blur",()=>{const m=S();Number.isInteger(m.durationHours)?o.value=String(m.durationHours):o.value=""}),f.appendChild(o),f.appendChild(n("p",{class:"wz-helper"},["Zwischen 1 und 12 Stunden."]));const c=n("div",{class:"step3-status",dataset:{state:"idle"},"aria-live":"polite"}),h=n("div",{class:"wizard-step-body"},[a,f,c]);t.appendChild(i),t.appendChild(h),e.appendChild(t);const v=j(m=>{document.body.contains(l)&&(l.value||"")!==(m.date||"")&&(l.value=m.date||""),document.body.contains(d)&&(d.value||"")!==(m.time||"")&&(d.value=m.time||"");const g=m.durationHours;if(document.activeElement!==o){const z=Number.isInteger(g)?String(g):"";o.value!==z&&(o.value=z)}document.body.contains(c)||v()})}function ot(){const e=S();return!!(e.date&&e.time&&e.durationHours)}async function lt(){if(!ot())return{ok:!1,error:"Bitte Datum, Uhrzeit und Dauer ausfüllen."};const e=De(),t=Ne();try{const i=await Ae(e,t);return F({availabilityChecked:!0,availabilityResult:i}),{ok:i&&i.available===!0,result:i}}catch{return F({availabilityChecked:!1,availabilityResult:null}),{ok:!1,error:"Verbindung fehlgeschlagen. Noch einmal?"}}}function dt(e){const t=document.querySelector(".step3-status");if(!t)return;T(t),t.dataset.state="conflict";const i=e!=null&&e.conflictOn?`Leider belegt. ${e.conflictOn}.`:"Leider belegt.";t.appendChild(n("div",{class:"step3-status-line",dataset:{tone:"conflict"}},[n("span",{class:"step3-status-icon"},["✕"]),n("span",null,[i])]));const a=Array.isArray(e==null?void 0:e.alternativesSameDay)?e.alternativesSameDay:[];if(a.length){const l=n("div",{class:"step2-alt-group"});l.appendChild(n("div",{class:"step2-alt-title"},["Andere Zeiten am selben Tag"]));const p=n("div",{class:"step2-alt-slots"});for(const d of a){const f=typeof d=="string"?d:d.time||d.start||"";if(!f)continue;const o=n("button",{type:"button",class:"step2-alt-chip",dataset:{time:f}},[f]);o.addEventListener("click",()=>{A("time",f),W()}),p.appendChild(o)}l.appendChild(p),t.appendChild(l)}const r=Array.isArray(e==null?void 0:e.nextAvailableDays)?e.nextAvailableDays.slice(0,5):[];if(r.length){const l=n("div",{class:"step2-alt-group"});l.appendChild(n("div",{class:"step2-alt-title"},["Nächste freie Tage"]));const p=n("div",{class:"step2-alt-days"});for(const d of r){const f=typeof d=="string"?d:d.date||"";if(!f)continue;const o=typeof d=="object"&&(d.from||d.time)||"",c=o?`${re(f)} · frei ab ${o}`:`${re(f)} · frei`,h=n("button",{type:"button",class:"step2-alt-day",dataset:{date:f}},[c]);h.addEventListener("click",()=>{A("date",f),o&&A("time",o),W()}),p.appendChild(h)}l.appendChild(p),t.appendChild(l)}}function ct(e){const t=document.querySelector(".step3-status");t&&(T(t),t.dataset.state="error",t.appendChild(n("div",{class:"step3-status-line",dataset:{tone:"error"}},[n("span",{class:"step3-status-icon"},["⚠"]),n("span",null,[e||"Verbindung fehlgeschlagen. Noch einmal?"])])))}const Y=Object.freeze(Object.defineProperty({__proto__:null,renderAvailabilityConflict:dt,renderAvailabilityError:ct,renderStep2:xe,runAvailabilityCheck:lt},Symbol.toStringTag,{value:"Module"})),ze="eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ0OTA0YzAwNWFkMDQzNjRhNjM3MTUzYWNmMWIxNTQyIiwiaCI6Im11cm11cjY0In0=",oe=[7.5645,46.8789],pt="https://api.openrouteservice.org/geocode/autocomplete",ut="https://api.openrouteservice.org/v2/directions/driving-car";let le=null;function ft(e,t){if(clearTimeout(le),!e||e.length<3){t([]);return}le=setTimeout(async()=>{try{const i=new URLSearchParams({api_key:ze,text:e,"boundary.country":"CH",size:5}),l=((await(await fetch(`${pt}?${i}`)).json()).features||[]).map(p=>({label:p.properties.label,coords:p.geometry.coordinates}));t(l)}catch(i){console.error("ORS Geocoding failed:",i),t([])}},300)}function mt(e,t){const a=h=>h*Math.PI/180,[r,l]=e,[p,d]=t,f=a(d-l),o=a(p-r),c=Math.sin(f/2)**2+Math.cos(a(l))*Math.cos(a(d))*Math.sin(o/2)**2;return 2*6371*Math.asin(Math.sqrt(c))}async function de(e){var t,i,a;try{const l=await fetch(ut,{method:"POST",headers:{Authorization:ze,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({coordinates:[oe,e],radiuses:[2e3,2e3],units:"km"})});if(!l.ok)throw new Error(`HTTP ${l.status}`);const d=(a=(i=(t=(await l.json()).routes)==null?void 0:t[0])==null?void 0:i.summary)==null?void 0:a.distance;if(typeof d=="number")return Math.round(d*10)/10;throw new Error("Invalid response shape")}catch(r){console.warn("ORS Directions failed, using haversine fallback:",r.message);const l=mt(oe,e);return Math.round(l*1.35*10)/10}}const ce="wz-step3-style";function ht(){if(document.getElementById(ce))return;const e=document.createElement("style");e.id=ce,e.textContent=`
    .step3-root { display: flex; flex-direction: column; gap: 16px; }
    .step3-suggestions {
      list-style: none;
      margin: 4px 0 0;
      padding: 0;
      border: 1px solid var(--wz-line);
      border-radius: 8px;
      max-height: 240px;
      overflow: auto;
      background: color-mix(in srgb, var(--wz-bg) 94%, var(--wz-fg));
      box-shadow: 0 12px 28px -18px color-mix(in srgb, var(--wz-bg) 80%, black);
    }
    .step3-suggestions:empty { display: none; }
    .step3-suggestions[hidden] { display: none; }
    .step3-suggestions li {
      padding: 10px 14px;
      cursor: pointer;
      font-size: 15px;
      line-height: 1.4;
      color: var(--wz-fg);
      transition: background 120ms ease;
    }
    .step3-suggestions li + li {
      border-top: 1px solid var(--wz-line-soft);
    }
    .step3-suggestions li:hover,
    .step3-suggestions li[aria-selected="true"] {
      background: color-mix(in srgb, var(--wz-fg) 8%, transparent);
      outline: none;
    }
    .step3-loading {
      margin-top: 8px;
      font-family: var(--ff-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--wz-fg-dim);
    }
    .step3-address-badge {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      align-items: center;
      padding: 14px 16px;
      border: 1px solid var(--wz-accent);
      border-radius: 12px;
      background: color-mix(in srgb, var(--wz-accent) 8%, transparent);
      margin-top: 12px;
    }
    .step3-address-badge-text {
      flex: 1;
      min-width: 0;
      font-size: 17px;
      line-height: 1.35;
      color: var(--wz-fg);
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .step3-address-badge-km {
      font-variant-numeric: tabular-nums;
      font-family: var(--ff-mono);
      color: var(--wz-accent);
      white-space: nowrap;
    }
    .step3-address-badge-clear {
      appearance: none;
      background: transparent;
      border: 1px solid var(--wz-line);
      width: 32px;
      height: 32px;
      border-radius: 999px;
      color: var(--wz-fg-soft);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
    }
    .step3-address-badge-clear:hover {
      border-color: var(--wz-fg-soft);
      color: var(--wz-fg);
      background: color-mix(in srgb, var(--wz-fg) 6%, transparent);
    }
    .step3-error {
      margin-top: 8px;
      font-size: 13px;
      color: #ff6b6b;
    }
  `,document.head.appendChild(e)}function gt(e){ht(),T(e);const t=S();e.appendChild(n("div",{class:"kicker"},["Schritt 4 / 9"])),e.appendChild(n("h3",{class:"display",style:"font-size: clamp(26px, 3.2vw, 44px);"},["Wo findet's statt?"])),e.appendChild(n("p",{class:"lede editorial"},["Pietros Foodtruck steht in Münsingen — wir rechnen die Anfahrt direkt aus."]));const i=n("div",{class:"step3-root",style:"margin-top: 20px;"});e.appendChild(i);const a=n("div",{class:"wz-field"});a.appendChild(n("label",{class:"wz-label",for:"step3-address-input"},["Event-Adresse"]));const r=n("input",{id:"step3-address-input",type:"search",class:"wz-input",autocomplete:"off",placeholder:"Strasse, Hausnummer, PLZ Ort",aria:{autocomplete:"list",controls:"step3-suggestions",expanded:"false"},role:"combobox"}),l=n("ul",{id:"step3-suggestions",class:"step3-suggestions",role:"listbox",hidden:"hidden"});a.appendChild(r),a.appendChild(l),i.appendChild(a);const p=n("p",{class:"step3-loading",hidden:"hidden"},["Berechne Distanz …"]),d=n("div"),f=n("p",{class:"wz-error step3-error",hidden:"hidden"},[""]);i.appendChild(p),i.appendChild(d),i.appendChild(f);let o=[],c=-1;function h(b){if(!b){f.hidden=!0,f.textContent="";return}f.hidden=!1,f.textContent=b}function v(b){p.hidden=!b}function m(){T(l),l.hidden=!0,o=[],c=-1,r.setAttribute("aria-expanded","false")}function g(b){const w=l.querySelectorAll("li");c=b,w.forEach((s,y)=>{y===b?(s.setAttribute("aria-selected","true"),s.scrollIntoView({block:"nearest"})):s.removeAttribute("aria-selected")})}function z(b){if(o=Array.isArray(b)?b:[],T(l),!o.length){l.hidden=!0,r.setAttribute("aria-expanded","false");return}o.forEach((w,s)=>{const y=n("li",{role:"option",id:`step3-sugg-${s}`,dataset:{index:String(s)}},[w.label]);y.addEventListener("mousedown",k=>{k.preventDefault(),C(s)}),y.addEventListener("mouseenter",()=>g(s)),l.appendChild(y)}),l.hidden=!1,r.setAttribute("aria-expanded","true"),c=-1}function C(b){const w=o[b];w&&(F({address:w.label,addressCoords:w.coords,distanceKm:null}),r.value=w.label,m(),h(null),v(!0),u(w.label,null),de(w.coords).then(s=>{v(!1),A("distanceKm",s),u(w.label,s)}).catch(()=>{v(!1),A("distanceKm",null),u(w.label,null),h("Distanz konnte nicht berechnet werden.")}))}function u(b,w){if(T(d),!b)return;const s=n("div",{class:"step3-address-badge"}),y=n("span",{class:"step3-address-badge-text"},[`✓ ${b}`]),k=n("span",{class:"step3-address-badge-km"},[w!=null?`${w.toFixed?w.toFixed(1):w} km`:"– km"]),E=n("button",{type:"button",class:"step3-address-badge-clear","aria-label":"Adresse zurücksetzen",title:"Adresse zurücksetzen",onclick:()=>{F({address:null,addressCoords:null,distanceKm:null}),T(d),h(null),v(!1),r.value="",m(),r.focus()}},["×"]);s.appendChild(y),s.appendChild(k),s.appendChild(E),d.appendChild(s)}r.addEventListener("input",b=>{const w=b.target.value;if(h(null),S().address&&(F({address:null,addressCoords:null,distanceKm:null}),T(d)),!w||!w.trim()){m();return}ft(w,s=>{document.activeElement===r&&z(s)})}),r.addEventListener("keydown",b=>{if(b.key==="ArrowDown"){if(!o.length)return;b.preventDefault();const w=Math.min(c<0?0:c+1,o.length-1);g(w)}else if(b.key==="ArrowUp"){if(!o.length)return;b.preventDefault();const w=Math.max(c-1,0);g(w)}else b.key==="Enter"?c>=0&&o[c]&&(b.preventDefault(),C(c)):b.key==="Escape"&&m()}),r.addEventListener("blur",()=>{setTimeout(()=>{document.activeElement!==r&&!a.contains(document.activeElement)&&m()},120)}),t.address&&(r.value=t.address,u(t.address,t.distanceKm),t.distanceKm==null&&t.addressCoords&&(v(!0),de(t.addressCoords).then(b=>{v(!1),A("distanceKm",b),u(t.address,b)}).catch(()=>{v(!1),h("Distanz konnte nicht berechnet werden.")}))),document.dispatchEvent(new CustomEvent("wizard:step3-mounted",{detail:{inputEl:r}}))}const pe="wz-step4-inline-style",bt=`
.step4-summary {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--wz-accent-soft);
  border-radius: 12px;
  background: color-mix(in srgb, var(--wz-accent) 6%, transparent);
}
.step4-summary-total {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 18px;
}
.step4-total-value {
  font-family: var(--ff-display);
  font-size: 32px;
  font-weight: 540;
  color: var(--wz-accent);
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  display: inline-block;
}
.step4-summary-warn {
  margin-top: 8px;
  font-size: 14px;
  color: var(--wz-fg-soft);
}
.step4-summary-warn[data-state="warn"] { color: var(--c-fuoco); }
.step4-summary-warn[data-state="ok"]   { color: var(--wz-success); }
.step4-counters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Editable counter value input */
input.wz-counter-value {
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  color: var(--wz-fg);
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-size: 22px;
  font-weight: 540;
  min-width: 3ch;
  width: 3ch;
  padding: 0;
  -moz-appearance: textfield;
  appearance: textfield;
}
input.wz-counter-value::-webkit-outer-spin-button,
input.wz-counter-value::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input.wz-counter-value:focus-visible {
  outline: 2px solid var(--wz-accent);
  outline-offset: 4px;
  border-radius: 4px;
}

/* Under-30 popup modal */
.step4-under30-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 24px;
  opacity: 0;
  animation: step4-under30-fade 240ms ease forwards;
}
.step4-under30-dialog {
  max-width: 480px;
  width: 100%;
  background: var(--wz-bg);
  border: 1px solid var(--wz-line);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.6);
  transform: scale(0.96);
  animation: step4-under30-pop 240ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}
.step4-under30-title {
  font-family: var(--ff-display, 'Bricolage Grotesque', serif);
  font-size: 28px;
  font-weight: 540;
  color: var(--wz-fg);
  margin: 0;
  line-height: 1.15;
}
.step4-under30-text {
  font-family: var(--ff-editorial, 'Tinos', Georgia, serif);
  font-style: italic;
  font-size: 16px;
  line-height: 1.5;
  color: var(--wz-fg-soft);
  margin: 16px 0 24px;
}
.step4-under30-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.step4-under30-actions .wizard-btn {
  text-decoration: none;
}
.step4-under30-meta {
  margin-top: 16px;
  font-size: 13px;
  opacity: 0.7;
  color: var(--wz-fg-soft);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
@keyframes step4-under30-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes step4-under30-pop {
  from { transform: scale(0.96); }
  to   { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .step4-under30-overlay,
  .step4-under30-dialog {
    animation-duration: 1ms;
  }
}
`;function ke(){if(document.getElementById(pe))return;const e=document.createElement("style");e.id=pe,e.textContent=bt,document.head.appendChild(e)}const vt=0,wt=200,yt=0,xt=50;function ue(e,t,i){return Math.max(t,Math.min(i,e))}function zt(){try{typeof navigator<"u"&&typeof navigator.vibrate=="function"&&navigator.vibrate(8)}catch{}}function fe({field:e,title:t,hint:i,ariaLabel:a,getValue:r,getMin:l,getMax:p}){const d=n("div",{class:"wz-counter"}),f=n("div",{class:"wz-counter-label"},[n("div",{class:"wz-counter-title"},[t]),n("div",{class:"wz-counter-hint"},[i])]),o=n("button",{class:"wz-counter-btn",type:"button","data-dec":"","aria-label":"Weniger"},["−"]),c=n("input",{type:"text",inputmode:"numeric",pattern:"[0-9]*",class:"wz-counter-value",value:String(r()),"aria-label":a||`${t} Anzahl`,"aria-live":"polite",maxlength:"3",autocomplete:"off"}),h=n("button",{class:"wz-counter-btn",type:"button","data-inc":"","aria-label":"Mehr"},["+"]),v=n("div",{class:"wz-counter-controls"},[o,c,h]);d.appendChild(f),d.appendChild(v);function m(u){const b=r(),w=ue(b+u,l(),p());return w===b?!1:(A(e,w),zt(),!0)}o.addEventListener("click",()=>m(-1)),h.addEventListener("click",()=>m(1));function g(u,b){if(u.key==="Enter"||u.key===" "||u.key==="Spacebar"){u.preventDefault(),m(b);return}if(u.key==="ArrowUp"||u.key==="ArrowRight"){u.preventDefault(),m(u.shiftKey?5:1);return}if(u.key==="ArrowDown"||u.key==="ArrowLeft"){u.preventDefault(),m(u.shiftKey?-5:-1);return}}o.addEventListener("keydown",u=>g(u,-1)),h.addEventListener("keydown",u=>g(u,1));function z(u){return String(u).replace(/\D+/g,"").slice(0,3)}c.addEventListener("input",()=>{const u=c.value,b=z(u);if(b!==u&&(c.value=b),b==="")return;const w=parseInt(b,10);if(!Number.isFinite(w))return;const s=ue(w,l(),p());s!==w&&(c.value=String(s)),s!==r()&&A(e,s)}),c.addEventListener("focus",()=>{requestAnimationFrame(()=>{try{c.select()}catch{}})}),c.addEventListener("blur",()=>{const u=r();c.value=String(u)}),c.addEventListener("keydown",u=>{if(u.key==="Enter"){u.preventDefault(),c.blur();return}if(u.key==="ArrowUp"){u.preventDefault(),m(u.shiftKey?5:1);return}if(u.key==="ArrowDown"){u.preventDefault(),m(u.shiftKey?-5:-1);return}u.key==="Escape"&&(u.preventDefault(),c.value=String(r()),c.blur())});function C(){const u=r(),b=l(),w=p();document.activeElement!==c&&(c.value=String(u)),o.disabled=u<=b,h.disabled=u>=w}return C(),{el:d,sync:C}}function Ee(e){T(e),ke();const t=n("div",{class:"wizard-step","data-enter":"active"}),i=n("div",{class:"wizard-step-head"},[n("div",{class:"wizard-step-kicker"},["Schritt 5 / 9"]),n("h2",{class:"wizard-step-title"},["Wer kommt?"]),n("p",{class:"wizard-step-lede"},["Ab 30 Personen — darunter ruft euch Pietro persönlich an, um die Details zu klären."])]),a=n("div",{class:"wizard-step-body step4-counters"}),r=fe({field:"adults",title:"Erwachsene",hint:"ab 11 Jahren · CHF 25.–",ariaLabel:"Erwachsene Anzahl",getValue:()=>S().adults||0,getMin:()=>vt,getMax:()=>wt}),l=fe({field:"children",title:"Kinder (5–10)",hint:"CHF 12.– · unter 5 Jahren gratis",ariaLabel:"Kinder Anzahl",getValue:()=>S().children||0,getMin:()=>yt,getMax:()=>xt});a.appendChild(r.el),a.appendChild(l.el);const p=n("strong",{class:"step4-total-value"},["0"]),d=n("div",{class:"step4-summary-warn wz-helper","data-state":"warn"},[""]),f=n("div",{class:"step4-summary"},[n("div",{class:"step4-summary-total"},[n("span",{},["Gesamt"]),p,n("span",{},["Personen"])]),d]);t.appendChild(i),t.appendChild(a),t.appendChild(f),e.appendChild(t);function o(){const v=S(),m=v.adults||0,g=v.children||0,z=m+g;I(p,String(z)),z>=30?(d.setAttribute("data-state","ok"),I(d,"")):(d.setAttribute("data-state","warn"),I(d,"Unter 30? Pietro klärt das persönlich mit euch."))}const c=j(()=>{r.sync(),l.sync(),o()}),h=new MutationObserver(()=>{e.contains(t)||(c(),h.disconnect())});h.observe(e,{childList:!0})}const Se="step4-under30-overlay",kt="+41763313259",Et="076 331 32 59";function Ce(e){ke(),getComputedStyle(e).position==="static"&&(e.style.position="relative");const i=n("div",{class:Se,role:"presentation"}),a=n("h3",{class:"step4-under30-title",id:"step4-under30-title"},["Unter 30 Personen?"]),r=n("p",{class:"step4-under30-text",id:"step4-under30-desc"},["Für kleinere Events ruft euch Pietro gerne persönlich an, um die Details zu klären. So finden wir die beste Lösung für euren Anlass."]),l=n("a",{class:"wizard-btn wizard-btn-primary",href:`tel:${kt}`,"data-action":"call"},["📞 Pietro anrufen"]),p=n("button",{class:"wizard-btn wizard-btn-secondary",type:"button","data-action":"back"},["Zurück zur Eingabe"]),d=n("div",{class:"step4-under30-actions"},[l,p]),f=n("div",{class:"step4-under30-meta"},[Et]),o=n("div",{class:"step4-under30-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"step4-under30-title","aria-describedby":"step4-under30-desc",tabindex:"-1"},[a,r,d,f]);i.appendChild(o),e.appendChild(i);const c=document.activeElement instanceof HTMLElement?document.activeElement:null;requestAnimationFrame(()=>{try{o.focus()}catch{}});let h=!1;function v(){if(!h&&(h=!0,document.removeEventListener("keydown",m,!0),i.removeEventListener("click",g),i.parentNode&&i.parentNode.removeChild(i),c&&typeof c.focus=="function"))try{c.focus()}catch{}}function m(z){z.key==="Escape"&&(z.preventDefault(),z.stopPropagation(),v())}document.addEventListener("keydown",m,!0);function g(z){z.target===i&&v()}return i.addEventListener("click",g),p.addEventListener("click",()=>v()),l.addEventListener("click",()=>{setTimeout(v,50)}),{el:i,cleanup:v}}function St(e){if(!e)return null;const t=e.querySelector(`.${Se}`);if(t)return t;const{el:i}=Ce(e);return i}const Ct=Object.freeze(Object.defineProperty({__proto__:null,renderStep4:Ee,renderUnder30Popup:Ce,showUnder30Popup:St},Symbol.toStringTag,{value:"Module"})),At=[{id:"champignons",label:"Champignons",emoji:"🍄",hue:36},{id:"zwiebeln",label:"Zwiebeln",emoji:"🧅",hue:32},{id:"zucchetti",label:"Zucchetti",emoji:"🥒",hue:88},{id:"spinat",label:"Spinat",emoji:"🥬",hue:108},{id:"aubergine",label:"Aubergine",emoji:"🍆",hue:276},{id:"peperoni",label:"Peperoni",emoji:"🌶️",hue:8},{id:"artischocken",label:"Artischocken",emoji:"🌱",hue:120},{id:"oliven",label:"Oliven",emoji:"🫒",hue:78},{id:"kapern",label:"Kapern",emoji:"🫐",hue:140},{id:"knoblauch",label:"Knoblauch",emoji:"🧄",hue:42},{id:"schinken",label:"Schinken",emoji:"🍖",hue:12},{id:"salami",label:"Salami",emoji:"🍕",hue:4},{id:"speck",label:"Speck",emoji:"🥓",hue:16},{id:"thunfisch",label:"Thunfisch",emoji:"🐟",hue:210},{id:"sardellen",label:"Sardellen",emoji:"🐠",hue:200},{id:"rahm",label:"Rahm",emoji:"🥛",hue:48},{id:"gorgonzola",label:"Gorgonzola",emoji:"🧀",hue:44}],U=6,me="step5-style-injected",Lt=`
.step5-counter {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--wz-line);
  background: color-mix(in srgb, var(--wz-fg) 3%, transparent);
  width: fit-content;
}
.step5-counter-value {
  font-family: var(--ff-display);
  font-size: 22px;
  font-weight: 540;
  font-variant-numeric: tabular-nums;
  color: var(--wz-fg);
}
.step5-counter-label {
  color: var(--wz-fg-dim);
  font-size: 14px;
}
.step5-counter-check {
  color: var(--wz-accent);
  font-size: 18px;
  margin-left: auto;
}
.step5-counter[data-state="complete"] .step5-counter-value { color: var(--wz-accent); }
.step5-counter.shake { animation: step5-shake 360ms; }
@keyframes step5-shake {
  0%, 100% { transform: translateX(0); }
  20%  { transform: translateX(-4px); }
  40%  { transform: translateX(4px); }
  60%  { transform: translateX(-3px); }
  80%  { transform: translateX(3px); }
}

.step5-helper-inline {
  color: var(--c-fuoco);
  font-size: 13px;
  margin: 8px 0 0 2px;
  font-style: italic;
  min-height: 16px;
}

.step5-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: clamp(10px, 1.5vw, 18px);
  margin-top: 14px;
  max-width: 1000px;
}

.wz-topping {
  appearance: none;
  background: transparent;
  border: none;
  color: var(--wz-fg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
  transition: transform 200ms var(--wz-e-soft);
  font-family: inherit;
}
.wz-topping:focus-visible {
  outline: 2px solid var(--wz-accent);
  outline-offset: 4px;
  border-radius: 12px;
}
.wz-topping-image {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 30% 30%,
    hsl(var(--wz-topping-hue) 70% 68%),
    hsl(var(--wz-topping-hue) 60% 28%));
  border: 2px solid transparent;
  box-shadow: 0 4px 12px -4px rgba(0,0,0,0.4);
  transition: transform 220ms var(--wz-e-premium),
              border-color 180ms,
              box-shadow 220ms;
  position: relative;
  overflow: hidden;
}
.wz-topping-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  position: absolute;
  inset: 0;
}
/* When image fails, JS sets data-img-failed on the image wrapper → show emoji */
.wz-topping-image[data-img-failed="true"] .wz-topping-photo { display: none; }
.wz-topping-image:not([data-img-failed="true"]) .wz-topping-emoji { display: none; }
.wz-topping-emoji {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
}
.wz-topping-name {
  font-size: 13px;
  text-align: center;
  color: var(--wz-fg-soft);
  font-family: var(--ff-display);
  letter-spacing: 0.005em;
  line-height: 1.3;
}
.wz-topping:hover .wz-topping-image { transform: scale(1.06); }
.wz-topping[aria-pressed="true"] .wz-topping-image {
  border-color: var(--wz-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--wz-accent) 25%, transparent),
              0 8px 20px -6px color-mix(in srgb, var(--wz-accent) 50%, transparent);
  transform: scale(1.06);
}
.wz-topping[aria-pressed="true"] .wz-topping-name {
  color: var(--wz-fg);
  font-weight: 600;
}
.wz-topping[aria-pressed="true"] .wz-topping-image::after {
  content: "✓";
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--wz-accent);
  color: var(--wz-bg);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  animation: wz-topping-check 220ms var(--wz-e-premium);
}
@keyframes wz-topping-check {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.step5-always-note {
  font-family: var(--ff-editorial);
  font-style: italic;
  font-size: 13px;
  color: var(--wz-fg-dim);
  margin: 14px 0 0 2px;
  letter-spacing: 0.02em;
}

@media (max-width: 640px) {
  .step5-grid {
    grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
    gap: 12px;
  }
  .wz-topping-image { width: 64px; height: 64px; }
  .wz-topping-emoji { font-size: 30px; }
  .wz-topping-name { font-size: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .wz-topping,
  .wz-topping-image,
  .step5-counter {
    transition: none !important;
    animation: none !important;
  }
}
`;function Tt(){if(document.getElementById(me))return;const e=document.createElement("style");e.id=me,e.textContent=Lt,document.head.appendChild(e)}function Dt(e){Tt(),T(e);const t=n("div",{class:"step5"});e.appendChild(t),t.appendChild(n("div",{class:"kicker"},["Schritt 6 / 9"])),t.appendChild(n("h3",{class:"display",style:"font-size: clamp(26px, 3.2vw, 44px); margin: 4px 0 10px;"},["Welche Zutaten?"])),t.appendChild(n("p",{class:"lede editorial",style:"margin: 0 0 14px;"},["Tomatensauce, Fior di Latte und frische handgemachte Pizzabasen sind immer dabei. Wählt bis zu 6 zusätzliche Zutaten — oder keine, wenn ihr's klassisch mögt."]));const i=n("span",{class:"step5-counter-value"},["0"]),a=n("span",{class:"step5-counter-label"},[` von max. ${U}`]),r=n("span",{class:"step5-counter-check"},["✓"]);r.style.display="none";const l=n("div",{class:"step5-counter",role:"status","aria-live":"polite"},[i,a,r]);t.appendChild(l);const p=n("p",{class:"step5-helper-inline"},["Max 6 — erst eine entfernen."]);p.style.visibility="hidden",t.appendChild(p);const d=n("div",{class:"step5-grid",role:"group","aria-label":"Bis zu 6 Zutaten auswählen"});t.appendChild(d);const f=new Map;function o(){p.style.visibility="visible",clearTimeout(o._t),o._t=setTimeout(()=>{p.style.visibility="hidden"},2600)}function c(){l.classList.remove("shake"),l.offsetWidth,l.classList.add("shake")}function h(g){const z=S().toppings;z.includes(g)?(A("toppings",z.filter(u=>u!==g)),p.style.visibility="hidden"):z.length<U?(A("toppings",[...z,g]),p.style.visibility="hidden"):(o(),c())}for(const g of At){const z=n("span",{class:"wz-topping-image",style:`--wz-topping-hue: ${g.hue}`,"aria-hidden":"true"}),C=document.createElement("picture"),u=document.createElement("source");u.srcset=`https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/zutaten/${g.id}.avif`,u.type="image/avif";const b=document.createElement("source");b.srcset=`https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/zutaten/${g.id}.webp`,b.type="image/webp";const w=n("img",{class:"wz-topping-photo",src:`https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/zutaten/${g.id}.png`,alt:"",width:"72",height:"72",loading:"eager",decoding:"sync",fetchpriority:"high"});w.onerror=()=>z.setAttribute("data-img-failed","true"),C.append(u,b,w),z.appendChild(C),z.appendChild(n("span",{class:"wz-topping-emoji","aria-hidden":"true"},[g.emoji]));const s=n("span",{class:"wz-topping-name"},[g.label]),y=n("button",{type:"button",class:"wz-topping","aria-pressed":"false","aria-label":g.label,"data-topping-id":g.id,onclick:()=>h(g.id)},[z,s]);d.appendChild(y),f.set(g.id,y)}function v(g){const z=g.toppings.length;i.textContent=String(z),a.textContent=` von max. ${U}`,r.style.display=z===U?"":"none",l.dataset.state=z===U?"complete":"";for(const[C,u]of f){const b=g.toppings.includes(C);u.setAttribute("aria-pressed",b?"true":"false")}}v(S());const m=j(g=>{if(!t.isConnected){m();return}v(g)})}const he="step6-setup-style",ge=[{field:"power",label:"Strom vor Ort?",options:[{value:"230v",title:"230V",sub:"Normaler Hausstrom-Anschluss"},{value:"380v",title:"380V Starkstrom",sub:"CEE-Stecker, 3-phasig"},{value:"nein",title:"Kein Strom",sub:"Nicht verfügbar"},{value:"unklar",title:"Unklar",sub:"Wir klären das per Telefon"}]}];function Nt(){if(document.getElementById(he))return;const e=document.createElement("style");e.id=he,e.textContent=`
    .step6-question { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .step6-question-head .wizard-step-kicker {
      font-size: 13px;
      color: var(--wz-fg);
      letter-spacing: 0.1em;
      font-weight: 600;
    }
    .step6-options {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
    }
    .step6-option { text-align: left; padding: 10px 14px; }
    .step6-option .wz-card-title { font-size: 14px; font-weight: 600; }
    .step6-option .wz-card-sub { font-size: 12px; margin-top: 2px; }
    .step6-summary {
      margin-top: 16px;
      padding: 14px 18px;
      border: 1px solid var(--wz-success);
      border-radius: 10px;
      color: var(--wz-success);
      font-size: 14px;
      display: none;
    }
    .step6-summary[data-state="complete"] { display: block; }
  `,document.head.appendChild(e)}function Mt(e,t){const i={...S().setup,[e]:t};A("setup",i)}function _t(e){T(e),Nt(),e.appendChild(n("div",{class:"kicker"},["Schritt 7 / 9"])),e.appendChild(n("h3",{class:"display",style:"font-size: clamp(26px, 3.2vw, 44px);"},["Ist alles bereit für den Truck?"])),e.appendChild(n("p",{class:"lede editorial"},["Kurzer Check — damit vor Ort nichts fehlt. Bei Unklarheit: melde uns 'unklar', wir rufen an."]));const t=n("div",{class:"step6-questions"});e.appendChild(t);const i={};for(const l of ge){const p=n("div",{class:"step6-question"}),d=n("div",{class:"step6-question-head"});d.appendChild(n("div",{class:"wizard-step-kicker"},[l.label])),p.appendChild(d);const f=n("div",{class:"wz-card-grid step6-options"}),o=new Map;for(const c of l.options){const h=n("button",{type:"button",class:"wz-card step6-option","aria-pressed":"false",dataset:{field:l.field,value:c.value},onclick:()=>Mt(l.field,c.value)},[n("div",{class:"wz-card-title"},[c.title]),n("div",{class:"wz-card-sub"},[c.sub])]);o.set(c.value,h),f.appendChild(h)}i[l.field]=o,p.appendChild(f),t.appendChild(p)}const a=j(l=>{const p=l.setup||{};for(const d of ge){const f=p[d.field],o=i[d.field];if(o)for(const[c,h]of o.entries()){const v=f===c;h.setAttribute("aria-pressed",v?"true":"false")}}}),r=new MutationObserver(()=>{e.contains(t)||(a(),r.disconnect())});r.observe(e,{childList:!0})}function It(){if(document.getElementById("step7-inline-style"))return;const e=n("style",{id:"step7-inline-style"});e.textContent=`
    .step7-textarea { min-height: 100px; resize: vertical; }
  `,document.head.appendChild(e)}const Ot=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;function $t(e){return(e||"").trim().length>=2?null:"Name angeben."}function Pt(e){return Ot.test((e||"").trim())?null:"Gültige E-Mail."}function Rt(e){return(e||"").replace(/\D/g,"").length>=8?null:"Telefonnummer angeben."}function Ft(e){It(),T(e);const t=S(),i={name:null,email:null,phone:null};e.appendChild(n("div",{class:"kicker"},["Schritt 8 / 9"])),e.appendChild(n("h3",{class:"display",style:"font-size: clamp(26px, 3.2vw, 44px);"},["Wie dürfen wir euch erreichen?"])),e.appendChild(n("p",{class:"lede editorial"},["Für Rückfragen zur Reservation — keine Newsletter, keine Weitergabe."]));const a=n("div",{class:"step7-form",style:"display: flex; flex-direction: column; gap: 20px; margin-top: 24px;"});e.appendChild(a);const r={};function l({key:h,label:v,type:m,autocomplete:g,inputmode:z,helper:C,validate:u}){const b=n("div",{class:"wz-field"});b.appendChild(n("label",{class:"wz-label",for:`step7-${h}`},[v]));const w={id:`step7-${h}`,name:h,type:m,class:"wz-input",autocomplete:g,required:"required",value:t[h]??""};z&&(w.inputmode=z);const s=n("input",w),y=n("p",{class:"wz-error",role:"alert"},[""]);return s.addEventListener("input",k=>{A(h,k.target.value),i[h]&&(i[h]=null,y.textContent="")}),s.addEventListener("blur",()=>{const k=u(s.value);i[h]=k,y.textContent=k||""}),b.appendChild(s),C&&b.appendChild(n("p",{class:"wz-helper"},[C])),b.appendChild(y),r[h]={input:s,errorEl:y},b}a.appendChild(l({key:"name",label:"Name",type:"text",autocomplete:"name",validate:$t})),a.appendChild(l({key:"email",label:"E-Mail",type:"email",autocomplete:"email",inputmode:"email",validate:Pt})),a.appendChild(l({key:"phone",label:"Telefon",type:"tel",autocomplete:"tel",inputmode:"tel",helper:"Schweizer Nummer — mit Ländercode wenn möglich (+41 …).",validate:Rt}));const p=n("div",{class:"wz-field"});p.appendChild(n("label",{class:"wz-label",for:"step7-note"},["Nachricht (optional)"]));const d=n("textarea",{id:"step7-note",name:"note",class:"wz-textarea step7-textarea",rows:"4"});d.value=t.note??"",d.addEventListener("input",h=>A("note",h.target.value)),p.appendChild(d),p.appendChild(n("p",{class:"wz-helper"},["Besonderheiten, Wünsche, Fragen — Pietro liest es vor dem Event."])),a.appendChild(p),r.note={input:d};const f=["name","email","phone"];requestAnimationFrame(()=>{var h,v,m;for(const g of f){const z=(h=r[g])==null?void 0:h.input;if(z&&!(z.value||"").trim()){z.focus();return}}(m=(v=r.name)==null?void 0:v.input)==null||m.focus()});const o=j(h=>{for(const v of["name","email","phone","note"]){const m=r[v];if(!m||!m.input)continue;const g=h[v]??"";m.input.value!==g&&document.activeElement!==m.input&&(m.input.value=g)}}),c=new MutationObserver(()=>{e.contains(a)||(o(),c.disconnect())});c.observe(e,{childList:!0})}const O=Object.freeze({adult:25,child:12,kmRate:1.5,deposit:250,vatPercent:8.1});function jt(e){const t=e.adults||0,i=e.children||0,a=typeof e.distanceKm=="number"?e.distanceKm:null,r=t*O.adult,l=i*O.child,p=a!=null?a*2*O.kmRate:0,d=O.deposit,f=d+r+l+p,o=f*(O.vatPercent/100),c=f+o;return{lines:[{label:"Reservation (Infrastruktur)",amount:d,fixed:!0},{label:`${t} Erwachsene × ${O.adult}.–`,amount:r,dim:t===0},{label:`${i} Kinder × ${O.child}.–`,amount:l,dim:i===0},{label:a!=null?`Anfahrt ${(a*2).toFixed(1)} km × ${O.kmRate}`:"Anfahrt (Ort fehlt)",amount:p,dim:a==null}],netto:f,vat:o,total:c,deposit:d,complete:t+i>0&&a!=null}}function Z(e){return e==null||!isFinite(e)?"—":e.toLocaleString("de-CH",{minimumFractionDigits:2,maximumFractionDigits:2})}const Ht=["So","Mo","Di","Mi","Do","Fr","Sa"],Bt=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];function Kt(e){if(!e||typeof e!="string")return"—";const t=e.split("-");if(t.length!==3)return e;const[i,a,r]=t.map(d=>parseInt(d,10));if(!Number.isFinite(i)||!Number.isFinite(a)||!Number.isFinite(r))return e;const l=new Date(Date.UTC(i,a-1,r));return`${Ht[l.getUTCDay()]}, ${r}. ${Bt[a-1]} ${i}`}const Ut={hochzeit:"Hochzeit",firma:"Firmenfeier",geburtstag:"Geburtstag",privat:"Privatfest",sonstiges:"Sonstiges"},Wt={power:{"230v":"230V · Hausstrom-Anschluss","380v":"380V Starkstrom · CEE, 3-phasig",nein:"Kein Strom verfügbar",unklar:"Unklar · wir klären telefonisch"}},be={champignons:"Champignons",zwiebeln:"Zwiebeln",zucchetti:"Zucchetti",spinat:"Spinat",aubergine:"Aubergine",peperoni:"Peperoni",artischocken:"Artischocken",oliven:"Oliven",kapern:"Kapern",knoblauch:"Knoblauch",schinken:"Schinken",salami:"Salami",speck:"Speck",thunfisch:"Thunfisch",sardellen:"Sardellen",rahm:"Rahm",gorgonzola:"Gorgonzola"};function ve(e){return be[e]?be[e]:typeof e!="string"||e.length===0?e:e.charAt(0).toUpperCase()+e.slice(1).replace(/-/g," ")}function Gt(e,t){const i=Wt[e];return i&&i[t]!=null?i[t]:"—"}function Vt(){const e="step8-style";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
.step8-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.step8-group { border: 1px solid var(--wz-line); border-radius: 12px; padding: 10px 14px; background: color-mix(in srgb, var(--wz-fg) 2%, transparent); }
.step8-group-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 4px; }
.step8-group-head .wizard-step-kicker { color: var(--wz-fg-dim); letter-spacing: 0.14em; margin: 0; font-size: 10px; }
.step8-edit { appearance: none; background: transparent; border: none; color: var(--wz-accent); font-family: var(--ff-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: background 180ms ease; }
.step8-edit:hover { background: color-mix(in srgb, var(--wz-accent) 12%, transparent); }
.step8-edit:focus-visible { outline: 2px solid var(--wz-accent); outline-offset: 2px; }
.step8-group-body { font-size: 14px; color: var(--wz-fg); line-height: 1.4; }
.step8-toppings { list-style: none; padding: 0; margin: 0 0 4px 0; display: flex; flex-wrap: wrap; gap: 4px; }
.step8-toppings li { padding: 2px 8px; border: 1px solid var(--wz-line); border-radius: 999px; font-size: 11px; background: color-mix(in srgb, var(--wz-fg) 3%, transparent); }
.step8-total { margin-top: 14px; padding: 14px 18px; border: 1px solid var(--wz-accent); border-radius: 14px; background: color-mix(in srgb, var(--wz-accent) 8%, transparent); text-align: center; display: flex; flex-direction: column; gap: 2px; }
.step8-total-label { font-family: var(--ff-mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--wz-fg-dim); }
.step8-total-amount { font-family: var(--ff-display); font-size: clamp(26px, 3vw, 36px); font-weight: 540; color: var(--wz-accent); font-variant-numeric: tabular-nums; line-height: 1.1; }
.step8-total-split { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 8px; font-family: var(--ff-editorial); font-style: italic; color: var(--wz-fg-soft); font-size: 12px; margin-top: 2px; }
.step8-agb { margin-top: 10px; padding: 12px 14px; border: 1px dashed var(--wz-line); border-radius: 10px; display: flex; align-items: flex-start; gap: 12px; font-size: 13px; }
.step8-agb a { color: var(--wz-accent); text-decoration: underline; text-underline-offset: 2px; }
.step8-agb-text { flex: 1; line-height: 1.4; font-size: 13px; }
@media (max-width: 640px) {
  .step8-summary { grid-template-columns: 1fr; }
}
  `,document.head.appendChild(t)}function P({kicker:e,gotoStep:t,body:i}){const a=n("div",{class:"step8-group-head"},[n("div",{class:"wizard-step-kicker"},[e]),n("button",{class:"step8-edit",type:"button","data-goto":String(t),"aria-label":`${e} bearbeiten`},["Ändern"])]),r=n("div",{class:"step8-group-body"},Array.isArray(i)?i:[i]);return n("section",{class:"step8-group"},[a,r])}function qt(e){T(e),Vt();const t=S(),i=jt(t);e.appendChild(n("div",{class:"wizard-step-kicker"},["Schritt 9 / 9"])),e.appendChild(n("h3",{class:"display",style:"font-size: clamp(26px, 3.2vw, 44px); margin: 4px 0 8px;"},["Passt alles?"])),e.appendChild(n("p",{class:"wz-helper",style:"margin-bottom: 14px; font-size: 14px;"},["Alle Angaben auf einen Blick. Nach Bestätigung sendet Pietro euch die TWINT-QR per E-Mail — sobald die CHF 250.– eingegangen sind, ist die Reservation definitiv."]));const a=[];for(let x=2;x<=8;x++)a.push(...H(x,t));if(a.length>0){const x=a.map(L=>L.msg).join(" · ");e.appendChild(n("p",{class:"wz-error",style:"margin-bottom: 10px; padding: 8px 12px; border: 1px solid var(--wz-danger); border-radius: 8px; background: color-mix(in srgb, var(--wz-danger) 8%, transparent); font-size: 13px;"},[`Bitte ergänze: ${x}`]))}const r=n("div",{class:"step8-summary"});r.appendChild(P({kicker:"Anlass",gotoStep:2,body:Ut[t.eventType]??"—"}));const l=[Kt(t.date),t.time??"—",t.durationHours?`${t.durationHours} Stunden`:"—"];r.appendChild(P({kicker:"Datum · Uhrzeit · Dauer",gotoStep:3,body:l.join(" · ")}));const p=t.address?`${t.address}${typeof t.distanceKm=="number"?` · ${t.distanceKm.toFixed(1)} km`:""}`:"—";r.appendChild(P({kicker:"Ort",gotoStep:4,body:p}));const d=Number(t.adults)||0,f=Number(t.children)||0;r.appendChild(P({kicker:"Gäste",gotoStep:5,body:`${d} Erwachsene · ${f} Kinder`}));const o=Array.isArray(t.toppings)?t.toppings:[],c=[];if(o.length===0)c.push(n("p",{style:"margin:0 0 4px 0;"},["—"]));else if(o.length>4){const x=o.slice(0,3).map(ve).join(", ");c.push(n("p",{style:"margin:0 0 4px 0;"},[`${o.length} Zutaten · ${x}…`]))}else{const x=n("ul",{class:"step8-toppings"});for(const L of o)x.appendChild(n("li",{},[ve(L)]));c.push(x)}c.push(n("p",{class:"wz-helper",style:"margin: 0; font-size: 11px;"},["Immer dabei: Tomatensauce · Fior di Latte · frische handgemachte Pizzabasen"])),r.appendChild(P({kicker:"Zutaten",gotoStep:6,body:c}));const h=t.setup||{},v=`Strom: ${Gt("power",h.power)}`;r.appendChild(P({kicker:"Setup",gotoStep:7,body:v}));const m=[t.name,t.email,t.phone].filter(x=>x&&String(x).trim()!=="");let g=m.length?m.join(" · "):"—";t.note&&String(t.note).trim()&&(g+=` · Notiz: ${t.note}`),r.appendChild(P({kicker:"Kontakt",gotoStep:8,body:g})),e.appendChild(r),r.addEventListener("click",x=>{const L=x.target.closest(".step8-edit");if(!L)return;const $=parseInt(L.dataset.goto,10);Number.isFinite($)&&$>=1&&$<=9&&A("step",$)});const z=n("div",{class:"step8-total"},[n("div",{class:"step8-total-label"},["Voraussichtlicher Gesamtbetrag"]),n("div",{class:"step8-total-amount"},[`CHF ${Z(i.total)}`]),n("div",{class:"step8-total-split"},[n("span",{},[`CHF ${Z(i.netto)} netto`]),n("span",{"aria-hidden":"true"},["·"]),n("span",{},[`+ ${Z(i.vat)} MwSt (8.1 %)`]),n("span",{"aria-hidden":"true"},["·"]),n("span",{},["davon CHF 250.– Reservation per TWINT"])])]);e.appendChild(z);const C=n("input",{type:"checkbox","data-agb":""});C.checked=!!t.acceptedTerms,C.addEventListener("change",x=>{A("acceptedTerms",!!x.target.checked)});const u=n("span",{class:"wz-check-box"}),b="http://www.w3.org/2000/svg",w=document.createElementNS(b,"svg");w.setAttribute("viewBox","0 0 14 14"),w.setAttribute("aria-hidden","true");const s=document.createElementNS(b,"path");s.setAttribute("d","M2 7l3 3 7-7"),w.appendChild(s),u.appendChild(w);const y=n("a",{href:"#","data-modal-target":"modal-agb"},["AGB & Bedingungen"]);y.addEventListener("click",x=>{x.preventDefault();const L=document.getElementById("modal-agb");L&&Le(L)});const k=n("span",{class:"step8-agb-text"},["Ich habe die ",y," gelesen und akzeptiere sie. Mir ist bewusst, dass die Reservation erst nach Eingang der CHF 250.– Anzahlung per TWINT definitiv ist."]),E=n("label",{class:"wz-check step8-agb"},[C,u,k]);e.appendChild(E);const N=j(x=>{if(!e.isConnected){N();return}C.checked!==!!x.acceptedTerms&&(C.checked=!!x.acceptedTerms)})}const Yt=[null,Ze,et,xe,gt,Ee,Dt,_t,Ft,qt],Zt=400,Jt=600,Xt=["a[href]","button:not([disabled])",'input:not([disabled]):not([type="hidden"])',"select:not([disabled])","textarea:not([disabled])",'[tabindex]:not([tabindex="-1"])'].join(",");function Qt(){const e=_("#wizard-modal");if(!e)return;const t=_("#wizard-stage"),i=e.querySelector(".wizard-shell"),a=te("[data-wizard-open]");te("[data-wizard-close]");let r=null,l=null;Ve({onStepChange:({step:o,direction:c})=>{const h=Yt[o];!h||!t||ye(t,v=>h(v),c)}}),en(),tn();function d(){e.classList.contains("is-open")||(r=document.activeElement instanceof HTMLElement?document.activeElement:null,S().submitted&&Te(),document.body.classList.add("wizard-open-lock"),e.setAttribute("aria-hidden","false"),e.removeAttribute("inert"),e.classList.remove("is-closing"),e.classList.add("is-open"),l&&(clearTimeout(l),l=null),setTimeout(()=>{if(t&&e.classList.contains("is-open")){t.setAttribute("tabindex","-1");try{t.focus({preventScroll:!0})}catch{t.focus()}}},Zt))}function f(){if(!(!e.classList.contains("is-open")&&e.getAttribute("aria-hidden")!=="false")&&(e.classList.remove("is-open"),e.classList.add("is-closing"),l=setTimeout(()=>{e.setAttribute("aria-hidden","true"),e.setAttribute("inert",""),e.classList.remove("is-closing"),document.body.classList.remove("wizard-open-lock"),l=null},Jt),r&&typeof r.focus=="function"))try{r.focus({preventScroll:!0})}catch{r.focus()}}for(const o of a)o.addEventListener("click",c=>{c.preventDefault(),d()});e.addEventListener("click",o=>{o.target instanceof Element&&o.target.closest("[data-wizard-close]")&&(o.preventDefault(),f())}),document.addEventListener("keydown",o=>{if(!(e.classList.contains("is-open")||e.getAttribute("aria-hidden")==="false"))return;if(o.key==="Escape"){o.preventDefault(),f();return}if(o.key!=="Tab"||!i)return;const h=Array.from(i.querySelectorAll(Xt)).filter(C=>C instanceof HTMLElement&&!C.hasAttribute("disabled")&&C.offsetParent!==null);if(h.length===0){o.preventDefault();return}const v=h[0],m=h[h.length-1],g=document.activeElement;if(!(g instanceof Node&&i.contains(g))){o.preventDefault(),(o.shiftKey?m:v).focus();return}o.shiftKey&&g===v?(o.preventDefault(),m.focus()):!o.shiftKey&&g===m&&(o.preventDefault(),v.focus())}),document.addEventListener("wizard:submitted",()=>{})}async function en(){try{const e=await R(()=>import("https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/result-panel-BlfUQI6Y.js"),__vite__mapDeps([0,1,2]),import.meta.url);typeof e.initResultPanel=="function"&&e.initResultPanel()}catch(e){console.warn("[wizard] result-panel init failed:",e)}}async function tn(){try{const e=await R(()=>import("https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/submit-CSIyH32G.js"),__vite__mapDeps([3,1,2]),import.meta.url);if(typeof e.initSubmit=="function"){e.initSubmit();return}typeof e.submitReservation=="function"&&document.addEventListener("wizard:submit",async()=>{const t=await e.submitReservation();try{const i=await R(()=>import("https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static/assets/result-panel-BlfUQI6Y.js"),__vite__mapDeps([0,1,2]),import.meta.url);typeof i.showResult=="function"&&i.showResult(t)}catch{}document.dispatchEvent(new CustomEvent("wizard:submitted",{detail:t}))})}catch(e){console.warn("[wizard] submit init failed:",e)}}const an=Object.freeze(Object.defineProperty({__proto__:null,initWizard:Qt},Symbol.toStringTag,{value:"Module"}));export{De as a,Ne as b,jt as c,S as g,an as m,F as p,Te as r};

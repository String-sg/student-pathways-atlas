(function(){
"use strict";
const SUB = {
  EL:{n:"English Language",c:"EL",lv:[3,2,1]}, MATH:{n:"Mathematics",c:"M",lv:[3,2,1]}, MTL:{n:"Mother Tongue",c:"MTL",lv:[3,2,1]},
  SCI:{n:"Science (Combined Science, Physics, Chemistry etc.)",etc:["Combined Science (Physics/Chemistry)","Combined Science (Chemistry/Biology)","Combined Science (Physics/Biology)","Physics (G3 only)","Chemistry (G3 only)","Biology (G3 only)","Science (G1)"],c:"S",lv:[3,2,1]}, HUM:{n:"Humanities (History/Geography elective etc.)",etc:["Humanities (Social Studies + Geography)","Humanities (Social Studies + History)","Humanities (Social Studies + Literature in English)","Geography","History","Literature in English","Literature in Chinese / Malay / Tamil (G3 only)"],c:"H",lv:[3,2]},
  AMATH:{n:"Additional Mathematics",c:"M",lv:[3,2]}, PHY:{n:"Physics",c:"S",lv:[3]}, CHEM:{n:"Chemistry",c:"S",lv:[3]}, BIO:{n:"Biology",c:"S",lv:[3]},
  GEOG:{n:"Geography",c:"H",lv:[3,2]}, HIST:{n:"History",c:"H",lv:[3,2]}, LIT:{n:"Literature in English",c:"H",lv:[3,2]},
  HMTL:{n:"Higher Mother Tongue",c:"MTL",lv:[3]}, POA:{n:"Principles of Accounts",c:"O",lv:[3,2]}, ART:{n:"Art",c:"O",lv:[3,2,1]},
  DT:{n:"Design & Technology",c:"O",lv:[3,2,1]}, NFS:{n:"Nutrition & Food Science",c:"O",lv:[3,2,1]}, COMP:{n:"Computing",c:"O",lv:[3,2,1]},
  MUS:{n:"Music",c:"O",lv:[3,1]}, ELEC:{n:"Electronics",c:"O",lv:[3]}, ROBO:{n:"Mobile Robotics",c:"O",lv:[1]}, RETL:{n:"Retail Operations",c:"O",lv:[1]}, SET:{n:"Smart Electrical Technology",c:"O",lv:[1]}, EBS:{n:"Elements of Business Skills",c:"O",lv:[1]}
};
SUB.E1={n:"Elective 1",c:"O",lv:[3,2,1]}; SUB.E2={n:"Elective 2",c:"O",lv:[3,2,1]}; SUB.E3={n:"Elective 3",c:"O",lv:[3,2,1]};
/* Starts blank: no level or result chosen. Electives start as not taken. */
const blank=()=>[
  {k:"EL",lv:null,pass:null},{k:"MATH",lv:null,pass:null},{k:"MTL",lv:null,pass:null},{k:"SCI",lv:null,pass:null},{k:"HUM",lv:null,pass:null},
  {k:"E1",lv:null,pass:null,el:1,taken:false},{k:"E2",lv:null,pass:null,el:2,taken:false},{k:"E3",lv:null,pass:null,el:3,taken:false}
];
/* Saved grades live in this browser's localStorage until Reset. */
const SAVE_KEY="pathwayGrades";
function loadSaved(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY)), b=blank();
    if(Array.isArray(s) && s.length===b.length && s.every((r,i)=>r && r.k===b[i].k)) return s;
  }catch(e){}
  return null;
}
let rows=loadSaved()||blank();
/* Save button turns green while the grades on screen match the saved copy. */
function updateSave(){
  let saved=false;
  try{ saved=localStorage.getItem(SAVE_KEY)===JSON.stringify(rows); }catch(e){}
  const b=document.getElementById("save");
  b.classList.toggle("saved",saved); b.textContent=saved?"Saved ✓":"Save Grades";
}
const isSet=r=>r.taken===false || (r.lv!=null && r.pass!=null);
const shortName=k=>SUB[k].n.split(" (")[0];
/* Hover definitions for aggregate names and the Eligible label */
const TERMS={
  "L1R4":"First Language and 4 Relevant subjects, all at G3. Used for JC and MI. Lower is better.",
  "ELR2B2":"English Language, 2 Relevant subjects and Best 2 other subjects. Used for polytechnic diploma courses. Lower is better.",
  "ELR2B2-C":"The ELR2B2 aggregate used for the Diploma in Nursing. Lower is better.",
  "ELMAB3":"English Language, Mathematics and Best 3 other subjects. Used for PFP, Higher Nitec and NAFA. Lower is better."
};
const ELIG="Minimum entry requirements met. Not a guaranteed place in a course.";
const tipSpan=(label,def,cls)=>`<span class="${cls}" tabindex="0" role="button" aria-expanded="false" aria-label="${esc(label)}: ${esc(def)}">${label}<span class="pop" role="tooltip">${esc(def)}</span></span>`;
const terms=html=>html.replace(/ELR2B2-C|ELR2B2|L1R4|ELMAB3/g,t=>tipSpan(t,TERMS[t],"term"));
const PATHS=[
  {id:"jc",url:"https://www.moe.gov.sg/post-secondary/admissions/pse/jc-and-mi",name:"Junior College",next:"2-year A-Level course, then university"},
  {id:"mi",url:"https://www.moe.gov.sg/post-secondary/admissions/pse/jc-and-mi",name:"Millennia Institute",next:"3-year A-Level course, then university"},
  {id:"poly",url:"https://www.moe.gov.sg/post-secondary/admissions/pse/polytechnic-diploma-course",name:"Polytechnic Year 1",next:"3-year diploma, then work or university"},
  {id:"pfp",url:"https://www.moe.gov.sg/post-secondary/admissions/pse/pfp",name:"Polytechnic Foundation Programme",next:"1-year foundation, then a poly diploma"},
  {id:"hn2",url:"https://www.moe.gov.sg/post-secondary/admissions/pse/ite-2-year-higher-nitec",name:"2-Year Higher Nitec (Year 2 entry)",next:"Higher Nitec, then work or poly"},
  {id:"hn3",url:"https://www.moe.gov.sg/post-secondary/admissions/pse/ite-3-year-higher-nitec",name:"3-Year Higher Nitec (Year 1 entry)",next:"Higher Nitec, then work or poly"},
  {id:"nfp",url:"https://www.nafa.edu.sg/admissions/foundation-admissions",name:"NAFA Foundation Programme",next:"Foundation year, then an arts diploma"},
  {id:"arts",url:"https://www.lasalle.edu.sg/study/admissions/diploma-admissions/",name:"Arts Institutions (NAFA, LASALLE)",next:"Arts diploma"}
];
/* Small icons showing what kind of institution each pathway leads to.
   Classes: d = soft tint of the main colour, a = solid accent fill, as = accent stroke. */
const ICON_SVG={
  cap:'<path class="d" d="M2 9l10-5 10 5-10 5z"/><path class="d" d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path class="as" d="M22 9v6"/><circle class="a" cx="22" cy="16.2" r="1.7"/>',
  inst:'<path class="d" d="M3 9l9-5 9 5z"/><circle class="a" cx="12" cy="7.2" r="1.2"/><path d="M4 20h16"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
  flask:'<path class="a" d="M6.7 14.8h10.6l2.2 3.7A1.7 1.7 0 0 1 18 21H6a1.7 1.7 0 0 1-1.5-2.5z"/><circle class="a" cx="12.4" cy="11.6" r=".9"/><path d="M9 3h6"/><path d="M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/>',
  steps:'<path class="d" stroke="none" d="M3 21h5v-5h5v-5h5V6h3v15z"/><path d="M3 21h5v-5h5v-5h5V6h3"/><path class="as" d="M15 3.5l3.5-.5-.5 3.5M18.5 3l-5 5"/>',
  wrench:'<path class="d" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><circle class="a" cx="5.4" cy="18.6" r="1.1"/>',
  masks:'<path class="d" d="M10 3h11v6a5.5 5.5 0 0 1-11 0z"/><path d="M13.4 6.4h1.8M17.4 6.4h1.8M15 11.6c.9-.9 2.9-.9 3.8 0"/><path class="fm" d="M3 8h11v6a5.5 5.5 0 0 1-11 0z"/><path d="M5.6 11.6q.8-.8 1.6 0M9.8 11.6q.8-.8 1.6 0M6.2 15c1.3 1.5 3.5 1.5 4.8 0"/>',
  palette:'<path class="d" d="M12 2a10 10 0 0 0 0 20c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z"/><circle cx="13.5" cy="6.5" r="1.6" fill="#e0484f" stroke="none"/><circle cx="17.5" cy="10.5" r="1.6" fill="#3b7fd9" stroke="none"/><circle cx="8.5" cy="7.5" r="1.6" fill="#f2b821" stroke="none"/><circle cx="6.5" cy="12.5" r="1.6" fill="#3fa66a" stroke="none"/>'
};
/* c = main colour, a = accent colour */
const KIND={
  jc:{i:"cap",c:"#2f5d8a",a:"#e0a526",t:"Academic: A-Levels, then university"},
  mi:{i:"inst",c:"#6b4fa0",a:"#d4a72c",t:"Academic: centralised institute, 3-year A-Levels"},
  poly:{i:"flask",c:"#11707e",a:"#2bb3c7",t:"Applied learning: polytechnic diploma"},
  pfp:{i:"steps",c:"#3a63c4",a:"#e8812c",t:"Foundation year: bridge into a polytechnic"},
  hn2:{i:"wrench",c:"#b8571a",a:"#5f7383",t:"Technical and vocational: ITE"},
  hn3:{i:"wrench",c:"#b8571a",a:"#5f7383",t:"Technical and vocational: ITE"},
  nfp:{i:"palette",c:"#9a6a2c",a:"#e0484f",t:"Arts foundation year: drawing and design basics, then a NAFA diploma"},
  arts:{i:"masks",c:"#a3324a",a:"#e0a526",t:"Creative and performing arts: art, design, music, dance and theatre diplomas"}
};
const instIcon=id=>{const k=KIND[id];return k?`<span class="inst" style="--ic:${k.c};--ia:${k.a}" role="img" aria-label="${esc(k.t)}" title="${esc(k.t)}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON_SVG[k.i]}</svg></span>`:"";};
const TIERS=[{id:"g3",label:"5 G3"},{id:"g3g2",label:"4 G3 + 1 G2"},{id:"g2",label:"5 G2"},{id:"g1",label:"4 G1"}];

const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const $=id=>document.getElementById(id);
/* A failed G3 subject at D7 or E8 converts to G2 grade 3 or 4 (a G2 pass). A G3 grade 9 cannot be used as a G2 pass. */
const FG_G2={7:3,8:4,9:5};
function subjects(list){ return (list||rows).filter(r=>r.taken!==false).map((r,i)=>{
  const o={id:i+":"+r.k,k:r.k,lv:r.lv,pass:r.pass,c:SUB[r.k].c,fam:(r.k==="MTL"||r.k==="HMTL")?"mt":r.k};
  if(r.lv===3 && !r.pass){ o.fg=r.fg||9; if(o.fg<=8){ o.lv=2; o.pass=true; o.g2=FG_G2[o.fg]; o.mapped=true; } }
  return o; }); }
const isH=s=>s.c==="H", isM=s=>s.c==="M", isS=s=>s.c==="S", isMS=s=>isM(s)||isS(s), isHMS=s=>isH(s)||isMS(s);
const count=list=>new Set(list.map(s=>s.fam)).size;
function fill(slots,pool){ const used=new Set(); return (function go(i){ if(i===slots.length) return true;
  for(const s of pool){ if(used.has(s.fam)||!slots[i](s)) continue; used.add(s.fam); if(go(i+1)) return true; used.delete(s.fam);} return false; })(0); }

function evaluate(list){
  const subs=subjects(list), P=subs.filter(s=>s.pass), P3=P.filter(s=>s.lv===3), P23=P.filter(s=>s.lv>=2);
  const n3=count(P3), n23=count(P23), n=count(P);
  const met={g3:n3>=5, g3g2:n3>=4&&n23>=5, g2:n23>=5, g1:n>=4};
  const top=(TIERS.find(t=>met[t.id])||{}).id||null;
  const mtTaken=subs.some(s=>s.c==="MTL"), mtPass=P.some(s=>s.c==="MTL" && !(s.mapped && s.fg===8));
  const out={};
  const R=(id)=>({id, state:"bad", what:"", miss:[]});
  /* JC & MI */
  const g3MathFail = subs.some(s=>isM(s)&&s.lv===3&&!s.pass);
  const MT_TIP="JC/MI accept Mother Tongue at G3 D7 or better, G2 grade 5 or better, or G1 grade D or better. G3 E8 is not accepted; the G3-to-G2 conversion does not apply here.";
  function jcMiss(pool){
    const m=[], cnt=count(pool);
    if(cnt<5) m.push(`5 subjects passed at G3 (has ${n3})`);
    if(!pool.some(s=>s.k==="EL")) m.push("English passed at G3");
    if(!pool.some(isH)) m.push("a Humanities passed at G3");
    if(!pool.some(isM)) m.push("Maths passed at G3 – compulsory");
    if(!m.length && !fill([s=>s.k==="EL",isH,isMS,isHMS,()=>true],pool)) m.push("one more Humanities, Maths or Science passed at G3");
    if(mtTaken && !mtPass) m.push({t:"Mother Tongue at G3 D7, G2 grade 5 or G1 grade D or better", tip:MT_TIP});
    return m;
  }
  ["jc","mi"].forEach(id=>{
    const r=R(id);
    r.miss=jcMiss(P3);
    if(!r.miss.length){ r.state="ok"; r.what = id==="jc" ? "L1R4 of 16 or less." : "L1R4 of 20 or less."; }
    out[id]=r;
  });
  /* Poly Y1 */
  (()=>{ const r=R("poly");
    if(!met.g3g2 && !met.g3) r.miss.push(`5 G3 passes, or 4 G3 + 1 G2 (has ${n3} at G3)`);
    if(!P3.some(s=>s.k==="EL")) r.miss.push("English passed at G3");
    if(!P3.some(isM)) r.miss.push("Maths passed at G3 – compulsory");
    if(!r.miss.length){ r.state="ok"; r.what="ELR2B2 of 22 or less (Nursing: ELR2B2-C of 24 or less)."; }
    r.note = "Individual poly courses state G3 Maths as a requirement: a pass (C6 or better).";
    out.poly=r; })();
  /* PFP, 2-yr HN */
  ["pfp","hn2"].forEach(id=>{ const r=R(id);
    if(!met.g2) r.miss.push(`5 subjects passed at G2 or G3 (has ${n23})`);
    if(!P23.some(s=>s.k==="EL")) r.miss.push("English passed at G2 or G3");
    const mm = P23.find(isM), ee = P23.find(s=>s.k==="EL");
    if(id==="pfp" && ee && ee.mapped && ee.g2>3) r.miss.push(`English at G2 grade 3 or better – G3 E8 converts to G2 grade ${ee.g2}`);
    if(!mm){
      r.miss.push(id==="pfp" ? "Maths passed at G2 or G3 – compulsory (PFP needs G2 grade 3 or better)" : "Maths (or A-Maths) passed at G2 or G3 – compulsory");
    } else if(id==="pfp" && mm.mapped && mm.g2>3){
      r.miss.push(`Maths at G2 grade 3 or better – G3 ${mm.fg===8?"E8":"D7"} converts to G2 grade ${mm.g2}`);
    }
    if(!r.miss.length && r.state==="bad"){ r.state="ok"; r.what = id==="pfp" ? "ELMAB3 of 12 or less." : "ELMAB3 of 19 or less.";
      if(mm && mm.mapped) r.what += ` Maths: G3 ${mm.fg===7?"D7":"E8"} counts as G2 grade ${mm.g2}.`;
      r.req = id==="pfp"
        ? ["Maths is compulsory: a G3 pass, or G2 grade 3 or better (65%+).",
           "English and one course-relevant subject: same minimum (a G3 pass or G2 grade 3).",
           "Two other subjects: a G3 pass or G2 grade 4 or better (60%+)."]
        : ["Maths is compulsory and must be passed at G2 or G3. G1 Maths cannot be used."]; }
    else if(id==="hn2" && met.g1 && !met.g2 && r.state==="bad"){
      r.miss=[{t:"Students with G1 subjects only are not eligible. They join Year 1 of 3-Year Higher Nitec instead.",
        tip:"They may be offered the accelerated pathway only if they meet the academic requirements in their Year 1 Semester 1 exams. This lets them finish a Higher Nitec in about two years."}]; }
    out[id]=r; });
  /* 3-yr HN */
  (()=>{ const r=R("hn3");
    const mP = P.some(isM), sP = P.some(isS), eP = P.some(s=>s.k==="EL");
    if(!met.g1){ r.miss.push(`4 subjects passed at any level (has ${n})`); }
    else if(mP){ r.state="ok"; r.what="Maths passed: all courses open, subject to each course's requirements."; }
    else {
      r.state="amber"; r.tag="Fewer courses";
      r.what = "Maths not passed, so some courses are closed. "
        + "Can't apply: courses that need Maths (e.g. Electrical Engineering, Nursing)"
        + (sP ? ". " : ", or Maths or Science (most engineering and IT). ")
        + "Can apply: "
        + (sP ? "most engineering and IT (Science counts instead of Maths), " : "")
        + (eP ? "courses that need English (e.g. Accounting, Hospitality), " : "")
        + "and courses with no subject requirement (e.g. Culinary Arts, Beauty & Wellness, Automotive).";
      r.req=["Course list based on ITE's 2026 entry requirements; 2028 requirements are published in mid-2027."];
    }
    if(met.g1 && !met.g2) r.what += " Accelerated pathway (about 2 years) may be offered if Year 1 Sem 1 results meet ITE's requirements.";
    out.hn3=r; })();
  /* NFP, Arts */
  (()=>{ const r=R("nfp");
    if(!met.g2) r.miss.push(`At least 5 G2 subjects passed (5 G3, 4 G3 + 1 G2, or 5 G2) – has ${n23} at G2 or G3`);
    const ne = P23.find(s=>s.k==="EL");
    if(!ne) r.miss.push("English at G2 grade 3 or better (a G3 D7 converts to G2 grade 3)");
    else if(ne.mapped && ne.g2>3) r.miss.push("English at G2 grade 3 or better – G3 E8 converts to G2 grade 4");
    if(!P23.some(isM)) r.miss.push("Maths passed at G2 or G3 – compulsory");
    if(!r.miss.length){ r.state="ok"; r.what="Meets MOE's 2028 chart (5 G3, 4 G3 + 1 G2, or 5 G2). Apply directly to NAFA.";
      r.req=["Profile needed: at least 5 G2 subjects (G3 passes also count), including English and Maths.","NAFA also uses ELMAB3 of 15 or less, with English at G2 grade 3 or better (a G3 D7 converts to G2 grade 3). A portfolio, audition or interview may be required."]; }
    out.nfp=r; })();
  (()=>{ const r=R("arts");
    if(!(met.g3||met.g3g2)) r.miss.push(`5 G3 passes, or 4 G3 + 1 G2 (has ${n3} at G3)`);
    if(!P3.some(s=>s.k==="EL")) r.miss.push("English passed at G3 (C6 or better)");
    if(!P23.some(isM)) r.miss.push("Maths passed at G2 or G3 – compulsory");
    if(!r.miss.length){ r.state="ok"; r.what="Same structure as Poly Year 1. Apply directly to NAFA or LASALLE.";
      r.req=["English at G3, C6 or better.","4 other subjects (3 at G3 + 1 at G2) with an aggregate of 21 or less. If all four are G3, the weakest is mapped to G2.","A portfolio, audition or interview is also part of admission."]; }
    out.arts=r; })();
  return {n3,n23,n,met,top,out};
}

/* ---------- render ---------- */
function renderRows(){
  const box=$("rows"); box.innerHTML="";
  rows.forEach((r,i)=>{
    const row=document.createElement("div");
    const off = r.taken===false;
    row.className="row"+(off?" empty":(r.pass===false?" fail":""));
    const nameEl=document.createElement("span"); nameEl.className="name";
    if(SUB[r.k].etc){
      const [pre,post]=SUB[r.k].n.split("etc.");
      nameEl.append(pre);
      const e=document.createElement("span"); e.className="etc"; e.tabIndex=0; e.setAttribute("role","button"); e.setAttribute("aria-label","Show subjects included: "+SUB[r.k].etc.join(", ")); e.setAttribute("aria-expanded","false"); e.textContent="etc.";
      const pop=document.createElement("span"); pop.className="pop"; pop.setAttribute("role","tooltip");
      const ul=document.createElement("ul"); SUB[r.k].etc.forEach(t=>{ const li=document.createElement("li"); li.textContent=t; ul.appendChild(li); }); pop.appendChild(ul);
      e.appendChild(pop); nameEl.append(e,post||"");
    } else nameEl.textContent=SUB[r.k].n;
    const lvs=off?[]:SUB[r.k].lv;
    const lv=document.createElement("div"); lv.className="seg lv"; lv.setAttribute("role","group"); lv.setAttribute("aria-label",SUB[r.k].n+" level");
    [3,2,1].forEach(n=>{ const b=document.createElement("button"); b.type="button"; b.textContent="G"+n; b.dataset.focus=r.k+"-level-"+n;
      if(!off && !lvs.includes(n)){
        /* Level not offered: looks disabled but still shows why on hover, focus or tap */
        const msg = r.k==="HUM" ? "Humanities is not offered at G1. The SEC has no G1 Humanities subject." : `${SUB[r.k].n} is not offered at G${n} in the SEC.`;
        b.className="na"; b.setAttribute("aria-disabled","true"); b.setAttribute("aria-pressed","false"); b.setAttribute("aria-expanded","false"); b.setAttribute("aria-label",`G${n} not available. ${msg}`);
        const pop=document.createElement("span"); pop.className="pop"; pop.setAttribute("role","tooltip"); pop.textContent=msg; b.appendChild(pop);
      } else {
        b.disabled=!lvs.includes(n); b.setAttribute("aria-pressed",lvs.length>0&&r.lv===n);
        b.addEventListener("click",()=>{ r.lv=n; render(); });
      }
      lv.appendChild(b); });
    const pf=document.createElement("div"); pf.className="seg pf"; pf.setAttribute("role","group"); pf.setAttribute("aria-label",SUB[r.k].n+" result");
    const opts=[["Pass",true,"p"],["Fail",false,"f"]].concat(r.el||r.k==="HUM"||r.k==="MTL"?[["None",null,"x"]]:[]);
    opts.forEach(([t,v,c])=>{ const b=document.createElement("button"); b.type="button"; b.textContent=t; b.className=c; b.dataset.focus=r.k+"-result-"+c;
      if(v===null){ b.title="Not taken"; b.setAttribute("aria-label","Not taken"); b.setAttribute("aria-pressed",off); b.addEventListener("click",()=>{ r.taken=false; render(); }); }
      else { b.setAttribute("aria-pressed",!off&&r.pass===v); b.addEventListener("click",()=>{ r.taken=true; r.pass=v; render(); }); }
      pf.appendChild(b); });
    row.append(nameEl,lv,pf);
    if(!off && r.lv===3 && r.pass===false){
      const fgw=document.createElement("div"); fgw.className="fgw";
      const lab=document.createElement("span"); lab.className="fgl"; lab.textContent="G3 fail grade";
      const seg=document.createElement("div"); seg.className="seg fg"; seg.setAttribute("role","group"); seg.setAttribute("aria-label",SUB[r.k].n+" G3 fail grade");
      [[7,"D7"],[8,"E8"],[9,"9"]].forEach(([v,t])=>{ const b=document.createElement("button"); b.type="button"; b.textContent=t;
        b.setAttribute("aria-pressed",(r.fg||9)===v); b.dataset.focus=r.k+"-grade-"+v; b.addEventListener("click",()=>{ r.fg=v; render(); }); seg.appendChild(b); });
      const cap=document.createElement("span"); cap.className="fgc";
      cap.textContent = ({7:"→ G2 grade 3 (a G2 pass)",8:"→ G2 grade 4 (a G2 pass)",9:"→ G3 Grade 9 cannot be used as a G2 pass"})[r.fg||9];
      fgw.append(lab,seg,cap); row.appendChild(fgw);
    }
    box.appendChild(row);
  });
}

function card(p, r){
  const cls = r.state==="ok" ? "c-ok" : r.state==="amber" ? "c-amber" : "c-bad";
  const ic = r.state==="ok" ? "✓" : r.state==="amber" ? "→" : "✕";
  const pill = r.state==="ok" ? tipSpan("Eligible",ELIG,"pill p-ok st term") : r.state==="amber" ? `<span class="pill p-amber st">Possible, with conditions</span>` : `<span class="pill p-bad st">Not eligible</span>`;
  const body = r.state==="bad"
    ? `<p class="what">Missing:</p><ul>${r.miss.map(m=>typeof m==="string"?`<li>${esc(m)}</li>`:`<li>${esc(m.t)} <span class="tip" tabindex="0" role="button" aria-label="Why? ${esc(m.tip)}">?<span class="pop" role="tooltip">${esc(m.tip)}</span></span></li>`).join("")}</ul>`
    : `<div class="main"><p class="what">${r.state==="amber"&&r.tag?`<b>${esc(r.tag)}:</b> `:""}${terms(esc(r.what))}</p>${r.req?`<div class="req"><b>Check grades</b><ul>${r.req.map(x=>`<li>${terms(esc(x))}</li>`).join("")}</ul></div>`:""}</div><p class="next"><span aria-hidden="true">→</span> ${esc(p.next)}</p>`;
  const note = r.note ? `<p class="star"><b>*</b> ${esc(r.note)}${r.warn?`<span class="warn">${esc(r.warn)}</span>`:""}</p>` : "";
  return `<article class="card ${cls}"><div class="card-h"><div class="badge">${instIcon(p.id)}<span class="mark" aria-hidden="true">${ic}</span></div><div style="min-width:0"><h3><a class="plink" href="${p.url}" target="_blank" rel="noopener" title="Admission criteria (opens in a new tab)">${esc(p.name)}<span class="ext" aria-hidden="true">↗</span></a>${r.note?"<sup>*</sup>":""}</h3>${p.id==="arts"?`<p class="alink">Also: <a href="https://www.nafa.edu.sg/admissions/diploma-admissions/faculty-of-art-design" target="_blank" rel="noopener">NAFA diploma admissions ↗</a></p>`:""}${pill}</div></div><div class="card-body">${body}${note}</div></article>`;
}

function renderSummary(e){
  [["c3",e.n3],["c2",e.n23-e.n3],["c1",e.n-e.n23]].forEach(([id,v])=>{ $(id).textContent=v; $(id).parentElement.classList.toggle("zero",v===0); });
  const pill=(k,label)=>{ const r=rows.find(x=>x.k===k);
    if(!isSet(r)) return `<span class="unset">– ${label} <i>not set</i></span>`;
    let res = `G${r.lv} ${r.pass?"Pass":"Fail"}`;
    if(r.lv===3 && !r.pass){ const fg=r.fg||9; res = fg===9 ? "G3 9 · cannot be used" : `G3 ${fg===7?"D7":"E8"} → G2 grade ${FG_G2[fg]}`; }
    return `<span class="${r.pass?"ok":"bad"}">${r.pass?"✓":"✕"} ${label} <i>${res}</i></span>`; };
  $("em").innerHTML=pill("EL","English")+pill("MATH","Maths");
}
function render(){
  const focusKey=document.activeElement?.dataset.focus;
  renderRows();
  updateSave();
  const todo=rows.filter(r=>!isSet(r));
  const e=evaluate(rows.filter(isSet));
  renderSummary(e);
  $("jump").classList.toggle("off",todo.length>0);
  if(todo.length){
    const names=todo.map(r=>shortName(r.k)).join(", ");
    $("okN").textContent="–"; $("badN").textContent="–";
    $("okCards").innerHTML=`<div class="empty-note">Set a level and a result for every subject to see the pathways. Still to set: ${esc(names)}.</div>`;
    $("badCards").innerHTML="";
    $("resultStatus").textContent=`Still to set: ${names}.`;
    if(focusKey) document.querySelector(`[data-focus="${focusKey}"]`)?.focus({preventScroll:true});
    return;
  }
  const ok=PATHS.filter(p=>e.out[p.id].state!=="bad"), bad=PATHS.filter(p=>e.out[p.id].state==="bad");
  $("okN").textContent=ok.length; $("badN").textContent=bad.length;
  $("jOk").textContent=ok.length; $("jBad").textContent=bad.length;
  $("okCards").innerHTML = ok.length ? ok.map(p=>card(p,e.out[p.id])).join("") : `<div class="empty-note">No pathways yet. A student needs at least 4 passes for 3-Year Higher Nitec.</div>`;
  $("badCards").innerHTML = bad.length ? bad.map(p=>card(p,e.out[p.id])).join("") : `<div class="empty-note">None. Every pathway is open.</div>`;
  $("resultStatus").textContent=`${ok.length} pathways eligible or possible with conditions. ${bad.length} pathways not eligible.`;
  if(focusKey) document.querySelector(`[data-focus="${focusKey}"]`)?.focus({preventScroll:true});
}


function placePop(t){
  const p=t.querySelector(".pop"); if(!p) return;
  const r=t.getBoundingClientRect(), w=p.offsetWidth, h=p.offsetHeight;
  p.style.left=Math.max(12,Math.min(r.left,document.documentElement.clientWidth-w-12))+"px";
  p.style.top=Math.max(12,r.bottom+h+12>window.innerHeight ? r.top-h-8 : r.bottom+8)+"px";
}
document.addEventListener("mouseover",e=>{ const t=e.target.closest(".etc,.tip,.na,.term"); if(t) placePop(t); });
document.addEventListener("focusin",e=>{ const t=e.target.closest(".etc,.tip,.na,.term"); if(t) placePop(t); });
function closeTips(){document.querySelectorAll(".is-open").forEach(t=>{t.classList.remove("is-open");t.setAttribute("aria-expanded","false");});}
function toggleTip(t){const open=!t.classList.contains("is-open");closeTips();t.classList.toggle("is-open",open);t.setAttribute("aria-expanded",String(open));placePop(t);}
document.addEventListener("click",e=>{const t=e.target.closest(".etc,.tip,.na,.term");if(t) toggleTip(t);else closeTips();});
document.addEventListener("keydown",e=>{const t=e.target.closest(".etc,.tip,.na,.term");if(t&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggleTip(t);}if(e.key==="Escape"){closeTips();document.activeElement?.closest(".etc,.tip,.na,.term")?.blur();}});
window.addEventListener("scroll",()=>document.querySelectorAll(".is-open,.etc:focus,.tip:focus,.na:focus,.term:focus").forEach(placePop),true);
window.addEventListener("resize",()=>document.querySelectorAll(".is-open,.etc:focus,.tip:focus,.na:focus,.term:focus").forEach(placePop));


/* Overview and glossary popups */
[["ov","ovOpen","ovClose"],["gl","glOpen","glClose"]].forEach(([d,o,c])=>{
  const dlg=document.getElementById(d);
  document.getElementById(o).addEventListener("click",()=>{ if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open",""); });
  document.getElementById(c).addEventListener("click",()=>dlg.close ? dlg.close() : dlg.removeAttribute("open"));
  dlg.addEventListener("click",e=>{ if(e.target===dlg) dlg.close(); });
});

/* Same icons on the overview table's column headings (left-to-right column order). */
["hn3","hn2","nfp","arts","pfp","poly","mi","jc"].forEach((id,i)=>{
  const th=document.querySelectorAll('.ovt thead th[scope="col"]')[i];
  if(th) th.insertAdjacentHTML("afterbegin",instIcon(id));
});

/* Phone version of the overview: the same table flipped, so pathways are rows and the
   4 subject combinations are columns. It fits the screen without sideways scrolling. */
(function(){
  const src=document.querySelector(".ovt"), wrap=src&&src.closest(".ov-scroll"); if(!wrap) return;
  const ids=["hn3","hn2","nfp","arts","pfp","poly","mi","jc"];
  const cols=[...src.querySelectorAll('thead th[scope="col"]')], tiers=[...src.querySelectorAll("tbody tr")];
  let h=`<table class="ovt ovm"><colgroup><col class="c-path"><col span="${tiers.length}"></colgroup><thead><tr class="band"><th class="corner"></th><th colspan="${tiers.length}">STUDENTS TAKING AT LEAST</th></tr>`
    + `<tr><th class="corner" scope="col">Pathway</th>${tiers.map(r=>`<th scope="col">${r.querySelector("th b").outerHTML}</th>`).join("")}</tr></thead><tbody>`;
  cols.forEach((c,j)=>{
    const a=c.querySelector("a").cloneNode(true); a.querySelectorAll("br").forEach(b=>b.replaceWith(" ")); a.innerHTML=a.innerHTML.replace("Year 1","Year&nbsp;1");
    h+=`<tr><th scope="row">${instIcon(ids[j])}${a.outerHTML}</th>${tiers.map(r=>r.querySelectorAll("td")[j].outerHTML).join("")}</tr>`;
  });
  wrap.insertAdjacentHTML("afterend",h+"</tbody></table>");
})();

(function(){
  if(!matchMedia("(hover:hover) and (pointer:fine)").matches || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  let cur=null;
  const reset=c=>{ if(!c) return; c.classList.remove("is-tilt"); c.style.transform=""; };
  document.addEventListener("pointermove",e=>{
    const c=e.target.closest(".card");
    if(c!==cur){ reset(cur); cur=c; }
    if(!c || e.target.closest(".tip,.term") || c.querySelector(".is-open")){ reset(c); return; }
    const r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    c.style.setProperty("--mx",(x*100)+"%"); c.style.setProperty("--my",(y*100)+"%");
    c.style.transform=`perspective(900px) rotateX(${((.5-y)*5).toFixed(2)}deg) rotateY(${((x-.5)*6).toFixed(2)}deg) translateY(-3px)`;
    c.classList.add("is-tilt");
  });
  document.addEventListener("pointerleave",()=>{ reset(cur); cur=null; });
})();

/* Floating results bar: shown while the results are still below the screen. */
(function(){
  const bar=$("jump"), res=document.getElementById("results");
  if(!bar||!res||!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([en])=>{
    const below=!en.isIntersecting && en.boundingClientRect.top>0;
    bar.classList.toggle("show",below); bar.tabIndex=below?0:-1; bar.setAttribute("aria-hidden",String(!below));
  },{rootMargin:"0px 0px -80px 0px"}).observe(res);
})();

$("reset").addEventListener("click",()=>{ rows=blank(); try{ localStorage.removeItem(SAVE_KEY); }catch(e){} closeTips(); render(); });
$("save").addEventListener("click",()=>{
  try{ localStorage.setItem(SAVE_KEY,JSON.stringify(rows)); updateSave(); }
  catch(e){ $("save").textContent="Could not save"; }
});

render();
window.__pe={evaluate,set:x=>{rows=x;render();}};
})();

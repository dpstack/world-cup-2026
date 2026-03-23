import React, { useState, useEffect } from 'react';

function useLocalStorageState(key, initialValueFactory) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch (e) {
      console.warn("localStorage error", e);
    }
    return typeof initialValueFactory === 'function' ? initialValueFactory() : initialValueFactory;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

// ─── PALETTE ───────────────────────────────────────────────────────────────
const C = {
  bg:"radial-gradient(circle at 40% 5%, #1f1a10 0%, #080e14 60%)", gold:"#f0c040", green:"#40e080", red:"#f06060",
  card:"rgba(18, 22, 28, 0.4)", card2:"rgba(255,255,255,0.04)",
  border:"rgba(240,192,64,0.22)", borderGreen:"rgba(64,224,128,0.3)",
};
const font = "'Outfit', 'Twemoji Country Flags', 'Segoe UI Emoji', sans-serif";

// ─── STATIC DATA ───────────────────────────────────────────────────────────
const PLAYOFF_ROUTES = [
  { id:"A", label:"Ruta A", destGroup:"B",
    semis:[{id:"rA_s1",t1:"🏴󠁧󠁢󠁷󠁬󠁳󠁿 Gales",t2:"🇧🇦 Bosnia"},{id:"rA_s2",t1:"🇮🇹 Italia",t2:"🇬🇧 Irlanda del Norte"}] },
  { id:"B", label:"Ruta B", destGroup:"F",
    semis:[{id:"rB_s1",t1:"🇺🇦 Ucrania",t2:"🇸🇪 Suecia"},{id:"rB_s2",t1:"🇵🇱 Polonia",t2:"🇦🇱 Albania"}] },
  { id:"C", label:"Ruta C", destGroup:"D",
    semis:[{id:"rC_s1",t1:"🇹🇷 Turquía",t2:"🇷🇴 Rumanía"},{id:"rC_s2",t1:"🇸🇰 Eslovaquia",t2:"🇽🇰 Kosovo"}] },
  { id:"D", label:"Ruta D", destGroup:"A",
    semis:[{id:"rD_s1",t1:"🇩🇰 Dinamarca",t2:"🇲🇰 Macedonia N."},{id:"rD_s2",t1:"🇨🇿 Rep. Checa",t2:"🇮🇪 Irlanda"}] },
];
const IC_SEMIS_META = [
  {id:"ic_s1",t1:"🇳🇨 Nueva Caledonia",t2:"🇯🇲 Jamaica",date:"26 Mar",city:"Guadalajara"},
  {id:"ic_s2",t1:"🇧🇴 Bolivia",t2:"🇸🇷 Surinam",date:"26 Mar",city:"Monterrey"},
];
const IC_FINALS_META = [
  {id:"ic_f1",seed:"🇨🇩 RD Congo",semiIdx:0,destGroup:"K",date:"31 Mar",city:"Guadalajara"},
  {id:"ic_f2",seed:"🇮🇶 Irak",semiIdx:1,destGroup:"I",date:"31 Mar",city:"Monterrey"},
];
const BASE_GROUPS = {
  A:["🇲🇽 México","🇿🇦 Sudáfrica","🇰🇷 Corea del Sur","TBD:UEFA-D"],
  B:["🇨🇦 Canadá","TBD:UEFA-A","🇶🇦 Qatar","🇨🇭 Suiza"],
  C:["🇧🇷 Brasil","🇲🇦 Marruecos","🇭🇹 Haití","🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia"],
  D:["🇺🇸 EE.UU.","🇵🇾 Paraguay","🇦🇺 Australia","TBD:UEFA-C"],
  E:["🇩🇪 Alemania","🇨🇼 Curazao","🇨🇮 Costa de Marfil","🇪🇨 Ecuador"],
  F:["🇳🇱 Países Bajos","🇯🇵 Japón","TBD:UEFA-B","🇹🇳 Túnez"],
  G:["🇧🇪 Bélgica","🇪🇬 Egipto","🇮🇷 Irán","🇳🇿 Nueva Zelanda"],
  H:["🇪🇸 España","🇨🇻 Cabo Verde","🇸🇦 Arabia Saudita","🇺🇾 Uruguay"],
  I:["🇫🇷 Francia","🇸🇳 Senegal","TBD:IC-F2","🇳🇴 Noruega"],
  J:["🇦🇷 Argentina","🇩🇿 Argelia","🇦🇹 Austria","🇯🇴 Jordania"],
  K:["🇵🇹 Portugal","TBD:IC-F1","🇺🇿 Uzbekistán","🇨🇴 Colombia"],
  L:["🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra","🇭🇷 Croacia","🇬🇭 Ghana","🇵🇦 Panamá"],
};
const GROUP_KEYS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const ROUND_NAMES = ["16avos de Final","Octavos de Final","Cuartos de Final","Semifinal","Final"];

// ─── HELPERS ───────────────────────────────────────────────────────────────
function emptyMatch(t1,t2){return{t1:t1||"",t2:t2||"",g1:"",g2:"",p1:"",p2:"",confirmed:false,winner:null};}

function makeGroupMatches(teams){
  if(teams.length === 4) {
    // Official round-robin 4-team tournament order
    return [
      emptyMatch(teams[0], teams[1]),
      emptyMatch(teams[2], teams[3]),
      emptyMatch(teams[0], teams[2]),
      emptyMatch(teams[1], teams[3]),
      emptyMatch(teams[0], teams[3]),
      emptyMatch(teams[1], teams[2]),
    ];
  }
  // Generic fallback
  const m=[];
  for(let i=0;i<teams.length;i++)
    for(let j=i+1;j<teams.length;j++) m.push(emptyMatch(teams[i],teams[j]));
  return m;
}

function computeTable(teams,matches,tieBreakers={}){
  const s={};
  teams.forEach(t=>{s[t]={team:t,pj:0,gf:0,gc:0,pts:0};});
  matches.forEach(m=>{
    if(!m.confirmed)return;
    const g1=+m.g1,g2=+m.g2;
    s[m.t1].pj++;s[m.t2].pj++;
    s[m.t1].gf+=g1;s[m.t1].gc+=g2;
    s[m.t2].gf+=g2;s[m.t2].gc+=g1;
    if(g1>g2)s[m.t1].pts+=3;
    else if(g2>g1)s[m.t2].pts+=3;
    else{s[m.t1].pts+=1;s[m.t2].pts+=1;}
  });
  return Object.values(s).sort((a,b)=>{
    if(b.pts!==a.pts)return b.pts-a.pts;
    const da=a.gf-a.gc,db=b.gf-b.gc;
    if(db!==da)return db-da;
    if(b.gf!==a.gf)return b.gf-a.gf;
    return (tieBreakers[b.team]||0)-(tieBreakers[a.team]||0);
  });
}

function resolveWinner(t1,t2,g1,g2,p1,p2){
  if(+g1>+g2)return t1;
  if(+g2>+g1)return t2;
  return +p1>+p2?t1:t2;
}

function initIcState(){
  return{
    semis:IC_SEMIS_META.map(m=>emptyMatch(m.t1,m.t2)),
    finals:IC_FINALS_META.map(m=>emptyMatch("",m.seed)),
  };
}
function initRoutesState(){
  return PLAYOFF_ROUTES.map(r=>({
    semis:r.semis.map(s=>emptyMatch(s.t1,s.t2)),
    final:emptyMatch("",""),
  }));
}

// ─── STYLE HELPERS ─────────────────────────────────────────────────────────
const tdBase={padding:"6px 8px",textAlign:"center",fontFamily:font,color:"#ccc",fontSize:13};

function solveMatch(m, allowTies) {
  if(m.confirmed) return m;
  const rs = () => {
    const r=Math.random();
    if(r<0.2) return 0; if(r<0.5) return 1; if(r<0.8) return 2; if(r<0.95) return 3; return 4;
  };
  const g1 = m.g1!=="" ? +m.g1 : rs();
  const g2 = m.g2!=="" ? +m.g2 : rs();
  let p1=m.p1, p2=m.p2;
  if(!allowTies && g1===g2 && (p1===""||p2==="")) {
      p1=Math.floor(Math.random()*4)+2; p2=Math.floor(Math.random()*4)+2;
      while(p1===p2) p2=Math.floor(Math.random()*4)+2;
  }
  return { ...m, g1, g2, p1, p2, confirmed: true, winner: resolveWinner(m.t1,m.t2,g1,g2,p1,p2) };
}

const primaryBtn={
  padding:"12px 32px",background:`linear-gradient(135deg,${C.gold},#c89010)`,
  color:"#080e14",border:"none",borderRadius:10,fontWeight:700,
  cursor:"pointer",fontSize:16,fontFamily:font,letterSpacing:1,
  boxShadow:`0 4px 20px rgba(240,192,64,0.3)`,
};
const secBtn={
  padding:"8px 16px",background:"rgba(255,255,255,0.06)",
  color:"#e0d8c8",border:`1px solid ${C.border}`,borderRadius:8,fontWeight:600,
  cursor:"pointer",fontSize:13,fontFamily:font,
};

function Card({children,style}){
  return React.createElement("div",{style:{background:C.card,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:`1px solid rgba(240,192,64,0.12)`,boxShadow:"0 8px 32px 0 rgba(0,0,0,0.4)",borderRadius:12,padding:16,...(style||{})}},children);
}
function GoldTitle({children,sub}){
  return React.createElement("div",{style:{marginBottom:14}},
    React.createElement("span",{style:{fontSize:15,fontWeight:700,color:C.gold,fontFamily:font}},children),
    sub&&React.createElement("span",{style:{fontSize:11,color:"#777",marginLeft:8}},sub)
  );
}
function MiniLabel({children}){
  return React.createElement("div",{style:{fontSize:10,color:C.gold,letterSpacing:2,marginBottom:8,fontWeight:700,fontFamily:font}},children);
}

// ─── SCORE BOX ─────────────────────────────────────────────────────────────
function ScoreBox({value,onChange,error}){
  return React.createElement("input",{
    type:"number",min:"0",max:"99",
    value:value,
    onChange:e=>{
      let val = e.target.value.replace(/[^0-9]/g, '');
      if(val.length > 2) val = val.slice(0,2);
      onChange(val);
    },
    style:{
      width:44,height:44,textAlign:"center",fontSize:20,fontWeight:700,
      background:"rgba(255,255,255,0.07)",
      border:`2px solid ${error?C.red:value!==""?C.green:"rgba(255,255,255,0.15)"}`,
      borderRadius:8,color:"#fff",outline:"none",fontFamily:font,
      boxSizing:"border-box",
      boxShadow:error?`0 0 8px ${C.red}`:"none",
    }
  });
}

// ─── MATCH ENTRY (stateless) ───────────────────────────────────────────────
function MatchEntry({match,label,onChange,onConfirm,onEdit,isKnockout=false}){
  const{t1,t2,g1,g2,p1,p2,confirmed,winner}=match;
  const hasScores=g1!==""&&g2!=="";
  const isDraw=hasScores&&+g1===+g2;
  const pErr=p1!==""&&p2!==""&&+p1===+p2;
  const pensFilled=p1!==""&&p2!==""&&!pErr;
  const canConfirm=hasScores&&(!isKnockout||!isDraw||pensFilled);

  if(confirmed){
    return React.createElement("div",{style:{
      display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",
      padding:"10px 14px",background:"rgba(64,224,128,0.04)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
      border:`1px solid ${C.borderGreen}`,boxShadow:"inset 0 0 10px rgba(64,224,128,0)",borderRadius:10,marginBottom:8,
    }},
      React.createElement("span",{style:{flex:1,fontSize:13,color:winner===t1?C.green:"#ccc",fontWeight:winner===t1?700:400,fontFamily:font}},t1||"—"),
      React.createElement("div",{style:{textAlign:"center",minWidth:70}},
        React.createElement("div",{style:{fontWeight:700,fontSize:17,color:C.green}},`${g1} – ${g2}`),
        p1!==""&&React.createElement("div",{style:{fontSize:11,color:"#999"}},`(${p1}–${p2} pen)`)
      ),
      React.createElement("span",{style:{flex:1,textAlign:"right",fontSize:13,color:winner===t2?C.green:"#ccc",fontWeight:winner===t2?700:400,fontFamily:font}},t2||"—"),
      React.createElement("button",{onClick:onEdit,style:{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:15,padding:2}},"✏️")
    );
  }

  return React.createElement("div",{style:{padding:"12px 14px",background:C.card2,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",border:`1px solid rgba(255,255,255,0.06)`,boxShadow:"0 4px 16px 0 rgba(0,0,0,0.2)",borderRadius:10,marginBottom:8}},
    label&&React.createElement("div",{style:{fontSize:10,color:C.gold,letterSpacing:1.5,marginBottom:8,fontFamily:font}},label),
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}},
      React.createElement("span",{style:{flex:1,fontSize:13,color:"#e0d8c8",fontFamily:font,minWidth:90}},t1||"—"),
      React.createElement(ScoreBox,{value:g1,onChange:v=>onChange({g1:v}),error:g1!==""&&+g1<0}),
      React.createElement("span",{style:{color:"#555",fontSize:16}},"–"),
      React.createElement(ScoreBox,{value:g2,onChange:v=>onChange({g2:v}),error:g2!==""&&+g2<0}),
      React.createElement("span",{style:{flex:1,textAlign:"right",fontSize:13,color:"#e0d8c8",fontFamily:font,minWidth:90}},t2||"—")
    ),
    isDraw&&isKnockout&&React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.08)"}},
      React.createElement("span",{style:{fontSize:12,color:C.gold,fontFamily:font,minWidth:60}},"Penales:"),
      React.createElement("span",{style:{flex:1,fontSize:11,color:"#aaa",textAlign:"right",fontFamily:font}},t1),
      React.createElement(ScoreBox,{value:p1,onChange:v=>onChange({p1:v}),error:pErr}),
      React.createElement("span",{style:{color:"#555"}},"–"),
      React.createElement(ScoreBox,{value:p2,onChange:v=>onChange({p2:v}),error:pErr}),
      React.createElement("span",{style:{flex:1,fontSize:11,color:"#aaa",fontFamily:font}},t2)
    ),
    isDraw&&isKnockout&&!pensFilled&&!pErr&&React.createElement("div",{style:{fontSize:11,color:"#f0a040",marginTop:6,fontFamily:font,animation:"pulse 1.5s infinite"}},"⚠ Empate — ingresa penales (deben ser distintos)"),
    isDraw&&isKnockout&&pErr&&React.createElement("div",{style:{fontSize:11,color:C.red,marginTop:6,fontFamily:font,fontWeight:700}},"❌ Los penales no pueden empatar"),
    React.createElement("button",{
      disabled:!canConfirm,
      onClick:onConfirm,
      style:{
        marginTop:10,padding:"7px 20px",
        background:canConfirm?`linear-gradient(135deg,${C.gold},#c89010)`:"rgba(255,255,255,0.06)",
        color:canConfirm?"#080e14":"#444",
        border:"none",borderRadius:8,fontWeight:700,
        cursor:canConfirm?"pointer":"default",
        fontSize:13,fontFamily:font,
      }
    },"Confirmar resultado")
  );
}

// ─── PHASE 1 ───────────────────────────────────────────────────────────────
function Phase1({ic,setIc,routes,setRoutes,onComplete}){
  function patchIcSemi(idx,patch){
    setIc(prev=>{
      const semis=prev.semis.map((m,i)=>i===idx?{...m,...patch}:m);
      const finals=prev.finals.map((f,fi)=>fi===idx?{...f,t1:semis[idx].winner||""}:f);
      return{semis,finals};
    });
  }
  function confirmIcSemi(idx){
    const m=ic.semis[idx];
    patchIcSemi(idx,{confirmed:true,winner:resolveWinner(m.t1,m.t2,m.g1,m.g2,m.p1,m.p2)});
  }
  function editIcSemi(idx){
    setIc(prev=>({
      semis:prev.semis.map((m,i)=>i===idx?{...m,confirmed:false,winner:null}:m),
      finals:prev.finals.map((f,fi)=>fi===idx?{...f,t1:"",confirmed:false,winner:null}:f),
    }));
  }
  function patchIcFinal(idx,patch){
    setIc(prev=>({...prev,finals:prev.finals.map((m,i)=>i===idx?{...m,...patch}:m)}));
  }
  function confirmIcFinal(idx){
    const t1=ic.semis[IC_FINALS_META[idx].semiIdx].winner||"";
    const t2=IC_FINALS_META[idx].seed;
    const m={...ic.finals[idx],t1,t2};
    patchIcFinal(idx,{t1,t2,confirmed:true,winner:resolveWinner(t1,t2,m.g1,m.g2,m.p1,m.p2)});
  }
  function editIcFinal(idx){patchIcFinal(idx,{confirmed:false,winner:null});}

  function patchRouteSemi(ri,si,patch){
    setRoutes(prev=>prev.map((r,i)=>i!==ri?r:{...r,semis:r.semis.map((m,j)=>j!==si?m:{...m,...patch})}));
  }
  function confirmRouteSemi(ri,si){
    const m=routes[ri].semis[si];
    patchRouteSemi(ri,si,{confirmed:true,winner:resolveWinner(m.t1,m.t2,m.g1,m.g2,m.p1,m.p2)});
  }
  function editRouteSemi(ri,si){
    setRoutes(prev=>prev.map((r,i)=>i!==ri?r:{
      ...r,
      semis:r.semis.map((m,j)=>j!==si?m:{...m,confirmed:false,winner:null}),
      final:emptyMatch("",""),
    }));
  }
  function patchRouteFinal(ri,patch){
    setRoutes(prev=>prev.map((r,i)=>i!==ri?r:{...r,final:{...r.final,...patch}}));
  }
  function confirmRouteFinal(ri){
    const r=routes[ri];
    const t1=r.semis[0].winner||"";
    const t2=r.semis[1].winner||"";
    const m={...r.final,t1,t2};
    patchRouteFinal(ri,{t1,t2,confirmed:true,winner:resolveWinner(t1,t2,m.g1,m.g2,m.p1,m.p2)});
  }
  function editRouteFinal(ri){patchRouteFinal(ri,{confirmed:false,winner:null});}

  function autoSimulate() {
    setIc(prev => {
      const semis = prev.semis.map(m => solveMatch(m, false));
      const finals = prev.finals.map((f, i) => solveMatch({...f, t1: semis[IC_FINALS_META[i].semiIdx].winner}, false));
      return { semis, finals };
    });
    setRoutes(prev => prev.map(r => {
      const semis = r.semis.map(m => solveMatch(m, false));
      const final = solveMatch({...r.final, t1: semis[0].winner, t2: semis[1].winner}, false);
      return { ...r, semis, final };
    }));
  }

  const allDone=ic.semis.every(m=>m.confirmed)&&ic.finals.every(m=>m.confirmed)&&routes.every(r=>r.final.confirmed);

  return React.createElement("div",null,
    // Intercontinental card
    React.createElement(Card,{style:{marginBottom:24}},
      React.createElement(GoldTitle,{sub:"2 cupos"},"🌍 Repechaje Intercontinental"),
      React.createElement("div",{className:"grid-2col"},
        // Semis
        React.createElement("div",null,
          React.createElement(MiniLabel,null,"SEMIFINALES"),
          IC_SEMIS_META.map((meta,i)=>React.createElement(MatchEntry,{
            key:meta.id,
            match:ic.semis[i],
            label:`${meta.date} · ${meta.city}`,
            onChange:p=>patchIcSemi(i,p),
            onConfirm:()=>confirmIcSemi(i),
            onEdit:()=>editIcSemi(i),
          }))
        ),
        // Finals
        React.createElement("div",null,
          React.createElement(MiniLabel,null,"FINALES → GRUPOS "+IC_FINALS_META.map(f=>f.destGroup).join(" / ")),
          IC_FINALS_META.map((meta,i)=>{
            const semiDone=ic.semis[meta.semiIdx].confirmed;
            if(!semiDone)return React.createElement("div",{key:meta.id,style:{padding:"12px 14px",background:C.card,border:`1px dashed ${C.border}`,borderRadius:10,marginBottom:8,color:"#555",fontSize:12,fontFamily:font}},`⏳ Esperando Semi ${i+1}…`);
            const dm={...ic.finals[i],t1:ic.semis[meta.semiIdx].winner||`Ganador Semi ${i+1}`,t2:meta.seed};
            return React.createElement(MatchEntry,{
              key:meta.id,match:dm,
              label:`→ Grupo ${meta.destGroup} · ${meta.date} · ${meta.city}`,
              onChange:p=>patchIcFinal(i,p),
              onConfirm:()=>confirmIcFinal(i),
              onEdit:()=>editIcFinal(i),
            });
          })
        )
      )
    ),
    // UEFA card
    React.createElement(Card,{style:{marginBottom:24}},
      React.createElement(GoldTitle,{sub:"4 cupos"},"🇪🇺 Playoffs UEFA"),
      React.createElement("div",{className:"grid-2col"},
        PLAYOFF_ROUTES.map((route,ri)=>{
          const rs=routes[ri];
          const bothDone=rs.semis.every(s=>s.confirmed);
          const finalMatch={...rs.final,t1:rs.semis[0].winner||"",t2:rs.semis[1].winner||""};
          return React.createElement("div",{
            key:route.id,
            style:{background:"rgba(255,255,255,0.02)",borderRadius:12,padding:14,border:`1px solid ${rs.final.confirmed?C.borderGreen:C.border}`}
          },
            React.createElement("div",{style:{color:C.gold,fontWeight:700,marginBottom:12,fontSize:14,fontFamily:font}},
              `${route.label} → Grupo ${route.destGroup}`,
              rs.final.confirmed&&React.createElement("span",{style:{color:C.green,marginLeft:8,fontSize:12}},`✓ ${rs.final.winner}`)
            ),
            React.createElement(MiniLabel,null,"SEMIFINALES"),
            route.semis.map((s,si)=>React.createElement(MatchEntry,{
              key:s.id,match:rs.semis[si],label:`Semifinal ${si+1}`,
              onChange:p=>patchRouteSemi(ri,si,p),
              onConfirm:()=>confirmRouteSemi(ri,si),
              onEdit:()=>editRouteSemi(ri,si),
            })),
            !bothDone
              ? React.createElement("div",{style:{padding:"10px 14px",background:C.card,border:`1px dashed ${C.border}`,borderRadius:10,marginTop:4,color:"#555",fontSize:12,fontFamily:font}},"🔒 Final — completa ambas semifinales")
              : React.createElement("div",null,
                  React.createElement(MiniLabel,null,`FINAL → GRUPO ${route.destGroup}`),
                  React.createElement(MatchEntry,{
                    match:finalMatch,label:null,
                    onChange:p=>patchRouteFinal(ri,p),
                    onConfirm:()=>confirmRouteFinal(ri),
                    onEdit:()=>editRouteFinal(ri),
                  })
                )
          );
        })
      )
    ),
    React.createElement("div",{style:{textAlign:"center",marginTop:28,display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}},
      !allDone&&React.createElement("button",{onClick:autoSimulate,style:secBtn},"🎲 Simular todo el Repechaje"),
      allDone&&React.createElement("button",{onClick:onComplete,style:primaryBtn},"▶ Avanzar a Fase de Grupos")
    )
  );
}

// ─── PHASE 2 ───────────────────────────────────────────────────────────────
function GroupPanel({gk,gd,onUpdate}){
  const{teams,matches,tieBreakers}=gd;
  const table=computeTable(teams,matches,tieBreakers);
  const allConfirmed=matches.every(m=>m.confirmed);

  function patch(idx,p){onUpdate({...gd,matches:matches.map((m,i)=>i===idx?{...m,...p}:m)});}
  function confirm(idx){const m=matches[idx];if(m.g1===""||m.g2==="")return;patch(idx,{confirmed:true});}
  function edit(idx){patch(idx,{confirmed:false});}

  return React.createElement("div",{className:"grid-2col-gap24"},
    React.createElement("div",null,
      React.createElement(MiniLabel,null,"PARTIDOS"),
      matches.map((m,i)=>{
        if(m.confirmed)return React.createElement("div",{key:i,style:{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(64,224,128,0.04)",border:`1px solid ${C.borderGreen}`,borderRadius:8,marginBottom:6}},
          React.createElement("span",{style:{flex:1,fontSize:12,color:"#ccc",fontFamily:font}},m.t1),
          React.createElement("span",{style:{fontWeight:700,color:C.green,minWidth:40,textAlign:"center",fontSize:15}},`${m.g1}–${m.g2}`),
          React.createElement("span",{style:{flex:1,textAlign:"right",fontSize:12,color:"#ccc",fontFamily:font}},m.t2),
          React.createElement("button",{onClick:()=>edit(i),style:{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:13}},"✏️")
        );
        const valid=m.g1!==""&&m.g2!=="";
        return React.createElement("div",{key:i,style:{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,marginBottom:6}},
          React.createElement("span",{style:{flex:1,fontSize:12,color:"#bbb",fontFamily:font}},m.t1),
          React.createElement(ScoreBox,{value:m.g1,onChange:v=>patch(i,{g1:v})}),
          React.createElement("span",{style:{color:"#444"}},"–"),
          React.createElement(ScoreBox,{value:m.g2,onChange:v=>patch(i,{g2:v})}),
          React.createElement("span",{style:{flex:1,textAlign:"right",fontSize:12,color:"#bbb",fontFamily:font}},m.t2),
          React.createElement("button",{disabled:!valid,onClick:()=>confirm(i),style:{padding:"5px 11px",background:valid?`linear-gradient(135deg,${C.gold},#c89010)`:"#1a1a1a",color:valid?"#080e14":"#444",border:"none",borderRadius:6,cursor:valid?"pointer":"default",fontSize:13,fontWeight:700}},"✓")
        );
      })
    ),
    React.createElement("div",null,
      React.createElement(MiniLabel,null,`TABLA — GRUPO ${gk}`),
      React.createElement("table",{style:{width:"100%",borderCollapse:"collapse"}},
        React.createElement("thead",null,
          React.createElement("tr",{style:{borderBottom:`1px solid ${C.border}`}},
            ["#","Selección","PJ","GF","GC","DG","Pts"].map((h,i)=>React.createElement("th",{key:h,style:{...tdBase,color:C.gold,textAlign:i===1?"left":"center"}},h))
          )
        ),
        React.createElement("tbody",null,
          table.map((row,i)=>{
            const dg=row.gf-row.gc;
            const q=allConfirmed&&i<2;
            return React.createElement("tr",{key:row.team,style:{background:q?"rgba(64,224,128,0.07)":"transparent",backdropFilter:q?"blur(4px)":"none",WebkitBackdropFilter:q?"blur(4px)":"none",borderBottom:"1px solid rgba(255,255,255,0.04)"}},
              React.createElement("td",{style:{...tdBase,color:q?C.green:"#777",fontWeight:700}},i+1),
              React.createElement("td",{style:{...tdBase,textAlign:"left",color:"#e0d8c8",fontSize:12}},row.team),
              React.createElement("td",{style:tdBase},row.pj),
              React.createElement("td",{style:tdBase},row.gf),
              React.createElement("td",{style:tdBase},row.gc),
              React.createElement("td",{style:{...tdBase,color:dg>0?C.green:dg<0?C.red:"#888",fontWeight:600}},`${dg>0?"+":""}${dg}`),
              React.createElement("td",{style:{...tdBase,fontWeight:700,color:"#fff"}},row.pts)
            );
          })
        )
      ),
      allConfirmed&&React.createElement("div",{style:{marginTop:10,padding:"8px 12px",background:"rgba(64,224,128,0.07)",border:`1px solid ${C.borderGreen}`,borderRadius:8,fontSize:12,color:C.green,textAlign:"center",fontFamily:font}},
        `✓ ${table[0].team} & ${table[1].team} clasificados`
      )
    )
  );
}

function getLiveStandings(groupData){
  const ranked={};
  GROUP_KEYS.forEach(k=>{if(groupData[k])ranked[k]=computeTable(groupData[k].teams,groupData[k].matches,groupData[k].tieBreakers);});
  const firsts=[], seconds=[], thirds=[];
  GROUP_KEYS.forEach(k=>{
    if(!ranked[k]) return;
    if(ranked[k][0]) firsts.push({...ranked[k][0], group:k});
    if(ranked[k][1]) seconds.push({...ranked[k][1], group:k});
    if(ranked[k][2]) thirds.push({...ranked[k][2], group:k});
  });
  const sortGlobal=(a,b)=>{
    if(b.pts!==a.pts)return b.pts-a.pts;
    const da=a.gf-a.gc,db=b.gf-b.gc;
    if(db!==da)return db-da;
    if(b.gf!==a.gf)return b.gf-a.gf;
    const tbB = groupData[b.group].tieBreakers ? groupData[b.group].tieBreakers[b.team] : 0;
    const tbA = groupData[a.group].tieBreakers ? groupData[a.group].tieBreakers[a.team] : 0;
    return (tbB || 0) - (tbA || 0);
  };
  firsts.sort(sortGlobal);
  seconds.sort(sortGlobal);
  thirds.sort(sortGlobal);
  return {firsts, seconds, thirds};
}

function StandingsTable({title, data, cutoffIndex, cutColor, normalColor}) {
  if(!data||data.length===0) return null;
  return React.createElement("div",{style:{marginBottom:20}},
    React.createElement(MiniLabel,null,title),
    React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11}},
      React.createElement("thead",null,
        React.createElement("tr",null,["#","Gr","Equipo","Pts","DG","GF"].map(h=>React.createElement("th",{key:h,style:{color:C.gold,textAlign:"left",paddingBottom:8}},h)))
      ),
      React.createElement("tbody",null,
        data.map((t,i)=>{
           const passes = i<cutoffIndex;
           const style = {borderBottom:`1px solid rgba(255,255,255,0.05)`,color:passes?cutColor:normalColor};
           return React.createElement("tr",{key:t.team,style},
             React.createElement("td",{style:{padding:"6px 0",color:"rgba(255,255,255,0.3)"}},i+1),
             React.createElement("td",{style:{fontWeight:"bold"}},t.group),
             React.createElement("td",null,t.team),
             React.createElement("td",{style:{fontWeight:"bold"}},t.pts),
             React.createElement("td",null,t.gf-t.gc),
             React.createElement("td",null,t.gf)
           );
        })
      )
    )
  );
}

function LivePanel({groupData}) {
  const {firsts,seconds,thirds} = getLiveStandings(groupData);
  return React.createElement(Card,{style:{maxHeight:"85vh",overflowY:"auto",padding:"16px 20px"}},
    React.createElement(GoldTitle,null,"🏆 Clasificatorios en Vivo"),
    React.createElement(StandingsTable, {title:"🥇 1ros LUGARES (Top 8 contra Terceros)", data:firsts, cutoffIndex:8, cutColor:C.green, normalColor:"#88cc88"}),
    React.createElement(StandingsTable, {title:"🥈 2dos LUGARES", data:seconds, cutoffIndex:8, cutColor:C.green, normalColor:"#88cc88"}),
    React.createElement(StandingsTable, {title:"🥉 TABLA DE TERCEROS (Pasan 8)", data:thirds, cutoffIndex:8, cutColor:C.green, normalColor:C.red})
  );
}

function Phase2({groupData,setGroupData,onComplete}){
  const[activeGroup,setActiveGroup]=useState("A");
  const allDone=GROUP_KEYS.every(k=>groupData[k]&&groupData[k].matches.every(m=>m.confirmed));
  
  function autoSimulateGroup() {
    setGroupData(prev => ({...prev, [activeGroup]: { ...prev[activeGroup], matches: prev[activeGroup].matches.map(m => solveMatch(m, true)) }}));
  }
  function autoSimulateAll() {
    setGroupData(prev => {
      const next = {...prev};
      GROUP_KEYS.forEach(k => { next[k] = { ...next[k], matches: next[k].matches.map(m => solveMatch(m, true)) }; });
      return next;
    });
  }

  return React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}},
      GROUP_KEYS.map(k=>{
        const done=groupData[k]&&groupData[k].matches.every(m=>m.confirmed);
        const active=activeGroup===k;
        return React.createElement("button",{key:k,onClick:()=>setActiveGroup(k),style:{
          padding:"7px 18px",borderRadius:8,
          border:`1.5px solid ${active?C.gold:done?C.borderGreen:C.border}`,
          background:active?"rgba(240,192,64,0.13)":"transparent",
          color:done?C.green:active?C.gold:"#999",
          fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:font,
        }},k+(done?"✓":""));
      })
    ),
    React.createElement("div",{className:"grid-2col"},
      groupData[activeGroup]&&React.createElement("div",null,
        React.createElement(Card,null,
          React.createElement(GoldTitle,null,`Grupo ${activeGroup}`),
          React.createElement(GroupPanel,{
            gk:activeGroup,gd:groupData[activeGroup],
            onUpdate:updated=>setGroupData(prev=>({...prev,[activeGroup]:updated}))
          })
        ),
        React.createElement("div",{style:{textAlign:"center",marginTop:28,display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}},
          !allDone&&React.createElement("button",{onClick:autoSimulateGroup,style:secBtn},`🎲 Simular Grupo ${activeGroup}`),
          !allDone&&React.createElement("button",{onClick:autoSimulateAll,style:secBtn},"🎲 Simular Todos los Grupos"),
          allDone&&React.createElement("button",{onClick:onComplete,style:primaryBtn},"▶ Generar Cuadro Eliminatorio")
        )
      ),
      React.createElement(LivePanel,{groupData})
    )
  );
}

// ─── BRACKET BUILDER ───────────────────────────────────────────────────────
function buildBracket(groupData){
  const { firsts, seconds, thirds } = getLiveStandings(groupData);
  const best8Firsts = firsts.slice(0, 8);
  const bottom4Firsts = firsts.slice(8, 12);
  const best8Seconds = seconds.slice(0, 8);
  const bottom4Seconds = seconds.slice(8, 12);
  const best8Thirds = thirds.slice(0, 8);

  const safeTeam = (arr, i) => arr[i] ? arr[i].team : "TBD";

  const pairs=[
    [safeTeam(best8Firsts, 0), safeTeam(best8Thirds, 7)],
    [safeTeam(best8Firsts, 1), safeTeam(best8Thirds, 6)],
    [safeTeam(best8Firsts, 2), safeTeam(best8Thirds, 5)],
    [safeTeam(best8Firsts, 3), safeTeam(best8Thirds, 4)],
    [safeTeam(best8Firsts, 4), safeTeam(best8Thirds, 3)],
    [safeTeam(best8Firsts, 5), safeTeam(best8Thirds, 2)],
    [safeTeam(best8Firsts, 6), safeTeam(best8Thirds, 1)],
    [safeTeam(best8Firsts, 7), safeTeam(best8Thirds, 0)],
    
    [safeTeam(bottom4Firsts, 0), safeTeam(bottom4Seconds, 3)],
    [safeTeam(bottom4Firsts, 1), safeTeam(bottom4Seconds, 2)],
    [safeTeam(bottom4Firsts, 2), safeTeam(bottom4Seconds, 1)],
    [safeTeam(bottom4Firsts, 3), safeTeam(bottom4Seconds, 0)],

    [safeTeam(best8Seconds, 0), safeTeam(best8Seconds, 7)],
    [safeTeam(best8Seconds, 1), safeTeam(best8Seconds, 6)],
    [safeTeam(best8Seconds, 2), safeTeam(best8Seconds, 5)],
    [safeTeam(best8Seconds, 3), safeTeam(best8Seconds, 4)],
  ];
  return pairs.map(([t1,t2])=>emptyMatch(t1,t2));
}

// ─── PHASE 3 ───────────────────────────────────────────────────────────────
function Phase3({rounds,setRounds,onComplete}){
  function patchMatch(ri,mi,patch){
    setRounds(prev=>prev.map((r,i)=>i!==ri?r:r.map((m,j)=>j!==mi?m:{...m,...patch})));
  }
  function confirmMatch(ri,mi){
    setRounds(prev=>{
      const m=prev[ri][mi];
      const w=resolveWinner(m.t1,m.t2,m.g1,m.g2,m.p1,m.p2);
      const updated=prev.map((r,i)=>i!==ri?r:r.map((m,j)=>j!==mi?m:{...m,confirmed:true,winner:w}));
      const updRound=updated[ri];
      if(updRound.every(m=>m.confirmed)&&ri+1<ROUND_NAMES.length){
        const winners=updRound.map(m=>m.winner);
        const next=[];
        for(let k=0;k<winners.length;k+=2)next.push(emptyMatch(winners[k],winners[k+1]));
        if(updated.length<=ri+1)return[...updated,next];
        return updated.map((r,i)=>i===ri+1?next:r);
      }
      return updated;
    });
  }
  function editMatch(ri,mi){
    setRounds(prev=>prev.map((r,i)=>{
      if(i<ri)return r;
      if(i===ri)return r.map((m,j)=>j!==mi?m:{...m,confirmed:false,winner:null});
      return null;
    }).filter(r=>r!==null));
  }

  const allFinalDone=rounds.length===5&&rounds[4]&&rounds[4].every(m=>m.confirmed);
  const activeRound=rounds.length-1;

  function autoSimulateActiveRound() {
    setRounds(prev => {
       const curr = prev[activeRound].map(m => solveMatch(m, false));
       let updated = [...prev];
       updated[activeRound] = curr;
       if(curr.every(m=>m.confirmed) && activeRound+1 < ROUND_NAMES.length){
          const winners = curr.map(m=>m.winner);
          const nextMatches = [];
          for(let k=0; k<winners.length; k+=2) nextMatches.push(emptyMatch(winners[k],winners[k+1]));
          if(updated.length <= activeRound+1) updated.push(nextMatches);
          else updated[activeRound+1] = nextMatches;
       }
       return updated;
    });
  }

  return React.createElement("div",{className:"bracket-container"},
    rounds.map((round, ri) => React.createElement("div",{key:ri, className: "bracket-column"},
      React.createElement(GoldTitle,null,ROUND_NAMES[ri]),
      round.map((m, mi) => React.createElement(MatchEntry,{
        key:mi,match:m,label:`Partido ${mi+1}`,isKnockout:true,
        onChange:p=>patchMatch(ri,mi,p),
        onConfirm:()=>confirmMatch(ri,mi),
        onEdit:()=>editMatch(ri,mi)
      }))
    )),
    !allFinalDone&&React.createElement("div",{className:"bracket-column",style:{alignItems:"center",justifyContent:"center",minWidth:200}},
       React.createElement("button",{onClick:autoSimulateActiveRound,style:secBtn},`🎲 Autocompletar ${ROUND_NAMES[activeRound]}`)
    ),
    allFinalDone&&React.createElement("div",{className:"bracket-column",style:{alignItems:"center",justifyContent:"center",minWidth:250}},
      React.createElement("button",{onClick:onComplete,style:primaryBtn,className:"pulse-anim"},"🏆 Ver Campeón del Mundo")
    )
  );
}

// ─── PHASE 4 ───────────────────────────────────────────────────────────────
function Phase4({rounds,champion}){
  if(!champion)return React.createElement("div",{style:{color:"#777",textAlign:"center",padding:40,fontFamily:font}},"No hay campeón aún.");
  const path=rounds.map((round,i)=>{
    const m=round.find(m=>m.winner===champion);
    if(!m)return null;
    return{round:ROUND_NAMES[i],rival:m.t1===champion?m.t2:m.t1,g1:m.g1,g2:m.g2,p1:m.p1,p2:m.p2};
  }).filter(Boolean);
  const flag=champion.split(" ")[0];
  const name=champion.replace(/^\S+\s/,"");
  return React.createElement("div",{style:{textAlign:"center",padding:"20px 0 40px"}},
    React.createElement("div",{style:{fontSize:80,marginBottom:8}},"🏆"),
    React.createElement("div",{style:{fontSize:72,marginBottom:4}},flag),
    React.createElement("div",{style:{fontSize:34,fontWeight:700,fontFamily:font,letterSpacing:3,background:`linear-gradient(135deg,${C.gold} 0%,#fff8e0 50%,#c89010 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}},name),
    React.createElement("div",{style:{fontSize:20,color:"#fff",letterSpacing:4,fontFamily:font,marginBottom:6}},"CAMPEÓN DEL MUNDO 2026"),
    React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:36,fontFamily:font}},"19 Jul 2026 · MetLife Stadium, Nueva York"),
    React.createElement("div",{style:{maxWidth:520,margin:"0 auto",textAlign:"left"}},
      React.createElement(MiniLabel,null,"RUTA AL TÍTULO"),
      React.createElement("table",{style:{width:"100%",borderCollapse:"collapse"}},
        React.createElement("thead",null,
          React.createElement("tr",{style:{borderBottom:`1px solid ${C.border}`}},
            ["Ronda","Rival","Marcador","Penales"].map((h,i)=>React.createElement("th",{key:h,style:{...tdBase,color:C.gold,textAlign:i<2?"left":"center",paddingBottom:10}},h))
          )
        ),
        React.createElement("tbody",null,
          path.map((row,i)=>React.createElement("tr",{key:i,style:{borderBottom:"1px solid rgba(255,255,255,0.05)"}},
            React.createElement("td",{style:{...tdBase,textAlign:"left",color:"#888",fontSize:12}},row.round),
            React.createElement("td",{style:{...tdBase,textAlign:"left",color:"#e0d8c8"}},row.rival),
            React.createElement("td",{style:{...tdBase,color:C.green,fontWeight:700}},`${row.g1}–${row.g2}`),
            React.createElement("td",{style:{...tdBase,color:"#999",fontSize:12}},row.p1?`${row.p1}–${row.p2}`:"—")
          ))
        )
      )
    )
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────
export default function WorldCup2026(){
  const[phase,setPhase]=useLocalStorageState('wc2026_phase', 0);
  const[ic,setIc]=useLocalStorageState('wc2026_ic', initIcState);
  const[routes,setRoutes]=useLocalStorageState('wc2026_routes', initRoutesState);
  const[groupData,setGroupData]=useLocalStorageState('wc2026_groupData', {});
  const[rounds,setRounds]=useLocalStorageState('wc2026_rounds', []);

  function resetTournament(){
    if(!window.confirm("¿Estás seguro de que quieres borrar todo el torneo y empezar de cero?")) return;
    window.localStorage.removeItem('wc2026_phase');
    window.localStorage.removeItem('wc2026_ic');
    window.localStorage.removeItem('wc2026_routes');
    window.localStorage.removeItem('wc2026_groupData');
    window.localStorage.removeItem('wc2026_rounds');
    setPhase(0);
    setIc(initIcState());
    setRoutes(initRoutesState());
    setGroupData({});
    setRounds([]);
  }

  function handlePhase1Complete(){
    const q={};
    ic.finals.forEach((f,i)=>{q[`IC-F${i+1}`]=f.winner;});
    routes.forEach((r,i)=>{q[`UEFA-${PLAYOFF_ROUTES[i].id}`]=r.final.winner;});
    const data={};
    GROUP_KEYS.forEach(k=>{
      const teams=BASE_GROUPS[k].map(t=>t.startsWith("TBD:")?q[t.replace("TBD:","")]||t:t);
      const tieBreakers={};
      teams.forEach(t=>{tieBreakers[t]=Math.random();});
      data[k]={teams,matches:makeGroupMatches(teams),tieBreakers};
    });
    setGroupData(data);
    setPhase(1);
  }
  function handlePhase2Complete(){
    setRounds([buildBracket(groupData)]);
    setPhase(2);
  }
  const champion=rounds[4]&&rounds[4][0]?rounds[4][0].winner:null;

  const tabs=[
    {label:"🎟️ Repechajes",ph:0},
    {label:"🏟️ Grupos",ph:1},
    {label:"⚔️ Eliminatoria",ph:2},
    {label:"🏆 Campeón",ph:3},
  ];

  return React.createElement("div",{style:{minHeight:"100vh",background:C.bg,color:"#e0d8c8",fontFamily:font}},
    React.createElement("div",{style:{height:4,background:"linear-gradient(90deg,#c89010,#f0c040,#fff8c0,#f0c040,#c89010)"}}),
    React.createElement("div",{style:{textAlign:"center",padding:"30px 20px 14px"}},
      React.createElement("div",{style:{fontSize:11,color:"#666",letterSpacing:6,marginBottom:6}},"FIFA"),
      React.createElement("div",{style:{fontSize:40,fontWeight:700,fontFamily:font,letterSpacing:3,background:`linear-gradient(135deg,${C.gold} 0%,#fff8e0 50%,#c89010 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}},"WORLD CUP 2026"),
      React.createElement("div",{style:{fontSize:12,color:"#777",marginTop:6,letterSpacing:2}},"🇺🇸 EE.UU.  ·  🇨🇦 Canadá  ·  🇲🇽 México")
    ),
    React.createElement("div",{className:"tabs-container"},
      tabs.map(t=>{
        const unlocked=t.ph<=phase;
        return React.createElement("button",{key:t.ph,disabled:!unlocked,onClick:()=>unlocked&&setPhase(t.ph),style:{
          padding:"10px 22px",borderRadius:10,
          border:`1.5px solid ${phase===t.ph?C.gold:C.border}`,
          background:phase===t.ph?"rgba(240,192,64,0.12)":"transparent",
          color:unlocked?(phase===t.ph?C.gold:"#aaa"):"#333",
          fontWeight:600,cursor:unlocked?"pointer":"default",fontSize:14,fontFamily:font,
        }},t.label);
      })
    ),
    React.createElement("div",{style:{maxWidth:1120,margin:"0 auto",padding:"0 20px 80px"}},
      phase===0&&React.createElement(Phase1,{ic,setIc,routes,setRoutes,onComplete:handlePhase1Complete}),
      phase===1&&Object.keys(groupData).length>0&&React.createElement(Phase2,{groupData,setGroupData,onComplete:handlePhase2Complete}),
      phase===2&&React.createElement(Phase3,{rounds,setRounds,onComplete:()=>setPhase(3)}),
      phase===3&&React.createElement(Phase4,{rounds,champion})
    ),
    React.createElement("div",{style:{textAlign:"center", paddingBottom: "24px"}},
      React.createElement("button",{onClick:resetTournament,style:{background:"transparent",border:"none",color:"#777",cursor:"pointer",fontSize:13,textDecoration:"underline",fontFamily:font}},"Borrar simulación y reiniciar torneo")
    ),
    React.createElement("div",{style:{height:4,background:"linear-gradient(90deg,#c89010,#f0c040,#fff8c0,#f0c040,#c89010)"}})
  );
}

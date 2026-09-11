import {
  TECH_H, TECH_TPL, TECH_W, drawRich, ensureTechFonts, finishTechSlide, headFont,
  monoFont, newTechSlide, rgba, rotuloOculto, techContentBottom, techHeader,
} from "@/lib/techBase";
import type { CarouselEngineContent, CarouselEngineSlide, SVGElement } from "@/components/social-on/carousel-engine/carousel-engine.types";

const PAD = 60;
const BODY_BOTTOM = techContentBottom();

const diagram = (ctx: CanvasRenderingContext2D, element: SVGElement, x: number, y: number, w: number, h: number) => {
  ctx.save(); ctx.translate(x, y); const sx = w / 520; const sy = h / 270; ctx.scale(sx, sy);
  ctx.strokeStyle = TECH_TPL.cyan; ctx.lineWidth = 3 / Math.min(sx, sy); ctx.fillStyle = rgba(TECH_TPL.cyan, .06);
  if (["mitocondria", "krebs", "cadeia_eletrons", "glicolise"].includes(element)) {
    ctx.beginPath(); ctx.ellipse(260, 130, 205, 100, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = TECH_TPL.gold; ctx.beginPath(); ctx.moveTo(70, 135); for (let i=0;i<9;i++) ctx.lineTo(100+i*43, 80+(i%2)*100); ctx.stroke();
  } else if (["receptor", "eixo", "feedback"].includes(element)) {
    ctx.beginPath(); ctx.moveTo(30, 200); ctx.lineTo(490, 200); ctx.stroke();
    ctx.strokeStyle = TECH_TPL.gold; ctx.beginPath(); ctx.moveTo(260, 200); ctx.lineTo(260, 90); ctx.lineTo(215, 45); ctx.moveTo(260, 90); ctx.lineTo(305, 45); ctx.stroke();
    [100,260,420].forEach((cx,i)=>{ctx.beginPath();ctx.arc(cx,200-(i%2)*55,25,0,Math.PI*2);ctx.fill();ctx.stroke();});
  } else if (["radar_mce", "habito", "neuronio"].includes(element)) {
    ctx.beginPath(); ctx.moveTo(260,20); ctx.lineTo(35,230); ctx.lineTo(485,230); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=TECH_TPL.gold;ctx.beginPath();ctx.moveTo(260,75);ctx.lineTo(125,205);ctx.lineTo(395,205);ctx.closePath();ctx.stroke();
  } else {
    ctx.beginPath(); ctx.ellipse(260,135,220,90,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle=TECH_TPL.gold; for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(90+i*36,75);ctx.lineTo(90+i*36,195);ctx.stroke();}
  }
  ctx.font=monoFont(700,13);ctx.fillStyle=TECH_TPL.cyan;ctx.textAlign="center";ctx.fillText(element.replace(/_/g," ").toUpperCase(),260,263);ctx.restore();ctx.textAlign="left";
};

const angularCard = (ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number, accent:"cyan"|"gold"="cyan") => {
  const color=accent === "gold" ? TECH_TPL.gold : TECH_TPL.cyan;
  ctx.fillStyle="rgba(255,255,255,.025)";ctx.fillRect(x,y,w,h);ctx.strokeStyle=rgba(color,.3);ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
  ctx.fillStyle=color;ctx.fillRect(x,y,6,h);ctx.fillRect(x,y,w*.18,3);
};

/** Carrega a foto de capa (dataURL ou URL) sem quebrar a geração. */
const loadImage = (src:string) => new Promise<HTMLImageElement|null>((resolve)=>{
  const img=new Image(); img.crossOrigin="anonymous";
  img.onload=()=>resolve(img); img.onerror=()=>resolve(null); img.src=src;
});

/** Foto em cover-fit dentro de um retângulo, com véu escuro para o texto respirar. */
const drawPhoto = (ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number) => {
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  const scale=Math.max(w/img.width,h/img.height); const dw=img.width*scale; const dh=img.height*scale;
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,rgba(TECH_TPL.bg,.25)); g.addColorStop(1,rgba(TECH_TPL.bg,.85));
  ctx.fillStyle=g; ctx.fillRect(x,y,w,h); ctx.restore();
  ctx.strokeStyle=rgba(TECH_TPL.cyan,.45); ctx.lineWidth=2; ctx.strokeRect(x,y,w,h);
  ctx.fillStyle=TECH_TPL.gold; ctx.fillRect(x,y,w*.16,4); ctx.fillRect(x,y,4,h*.16);
};

const renderCover = (ctx:CanvasRenderingContext2D,s:Extract<CarouselEngineSlide,{type:"cover"}>,photo?:HTMLImageElement|null) => {
  let y=techHeader(ctx,s.eyebrow,s.title,s.subtitle);
  if(photo) drawPhoto(ctx,photo,80,y+25,920,440); else diagram(ctx,s.svg_element,80,y+25,920,440);
  angularCard(ctx,PAD,880,TECH_W-PAD*2,175,"gold");
  drawRich(ctx,"CIÊNCIA QUE VOCÊ CONSEGUE APLICAR",PAD+32,940,{size:22,weight:700,color:TECH_TPL.gold,family:"mono",maxWidth:850});
  drawRich(ctx,s.subtitle,PAD+32,1000,{size:31,weight:600,color:TECH_TPL.ink,maxWidth:850,maxHeight:95,minSize:22});
};
const renderContent = (ctx:CanvasRenderingContext2D,s:Extract<CarouselEngineSlide,{type:"content"}>) => {
  let y=techHeader(ctx,s.category_tag||"EVIDÊNCIA",s.header); diagram(ctx,s.svg_element,600,55,390,220);
  const items = s.cards?.length ? s.cards.map(x=>({title:x.title,text:x.description,ref:"",accent:x.accent})) : s.blocks?.length ? s.blocks.map(x=>({title:x.title,text:x.description,ref:x.reference||"",accent:"cyan" as const})) : (s.paragraphs||[]).map(x=>({title:x.title||"",text:x.text,ref:x.reference||"",accent:"cyan" as const}));
  const shown=items.slice(0,3); const gap=18; const h=Math.min(245,(BODY_BOTTOM-y-gap*(shown.length-1)-20)/Math.max(1,shown.length));
  shown.forEach((it,i)=>{const yy=y+i*(h+gap);angularCard(ctx,PAD,yy,TECH_W-PAD*2,h,it.accent||"cyan");if(it.title&&!rotuloOculto(it.title))drawRich(ctx,it.title.toUpperCase(),PAD+28,yy+43,{size:19,weight:700,color:it.accent==="gold"?TECH_TPL.gold:TECH_TPL.cyan,family:"mono",maxWidth:850,maxHeight:28,minSize:14});drawRich(ctx,it.text,PAD+28,yy+86,{size:29,weight:500,color:TECH_TPL.ink,maxWidth:850,maxHeight:h-112,minSize:20,lineHeight:1.25});if(it.ref){ctx.font=monoFont(400,12);ctx.fillStyle=TECH_TPL.muted;ctx.fillText(it.ref.slice(0,100),PAD+28,yy+h-18);}});
};
const renderCta=(ctx:CanvasRenderingContext2D,s:Extract<CarouselEngineSlide,{type:"cta"}>)=>{diagram(ctx,"neuronio",180,80,720,390);angularCard(ctx,PAD,500,TECH_W-PAD*2,420,"gold");drawRich(ctx,s.impact_phrase.toUpperCase(),PAD+45,595,{size:62,weight:700,color:TECH_TPL.ink,accent:TECH_TPL.gold,maxWidth:830,maxHeight:190,minSize:34,lineHeight:1.03});drawRich(ctx,s.cta_text,PAD+45,790,{size:31,weight:600,color:TECH_TPL.gold,maxWidth:830,maxHeight:90,minSize:22});ctx.font=monoFont(700,14);ctx.fillStyle=TECH_TPL.cyan;ctx.fillText("SALVE · COMPARTILHE · APROFUNDE",PAD+45,875);};

export async function renderCarouselCientifico(content:CarouselEngineContent, handle="diogo.mell0") {
  await ensureTechFonts(); const out:string[]=[];
  for (const [i,s] of content.slides.slice(0,5).entries()) { const {canvas,ctx}=newTechSlide(i+41,{text:`${i+1}/5`,color:i===4?TECH_TPL.gold:TECH_TPL.cyan}); if(s.type==="cover") renderCover(ctx,s); else if(s.type==="content") renderContent(ctx,s); else renderCta(ctx,s); out.push(finishTechSlide(canvas,ctx,handle)); }
  return out;
}

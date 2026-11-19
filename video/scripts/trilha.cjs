// Gera a trilha ambiente do vídeo (acordes Am-F-C-G e arpejo a 100 BPM), sem música de terceiros.
// Uso: node scripts/trilha.cjs public/som/trilha.wav
const fs=require("fs");
const SR=44100, DUR=64, N=SR*DUR;
const hz=m=>440*Math.pow(2,(m-69)/12);
// Am  F  C  G  (2x)  — 8 s cada
const acordes=[[45,52,57,60,64],[41,48,53,57,60],[48,55,60,64,67],[43,50,55,59,62]];
const L=new Float32Array(N), R=new Float32Array(N);
for(let i=0;i<N;i++){
  const t=i/SR; const idx=Math.floor(t/8)%4; const pos=t%8;
  const prox=(idx+1)%4;
  const xf=pos>6?(pos-6)/2:0; // crossfade nos 2 s finais
  let l=0,r=0;
  for(const [ac,g] of [[acordes[idx],1-xf],[acordes[prox],xf]]){
    if(g<=0)continue;
    ac.forEach((m,k)=>{const f=hz(m);const det=1+0.0025*(k%2?1:-1);
      const v=(Math.sin(2*Math.PI*f*t)+0.35*Math.sin(2*Math.PI*f*2*det*t)+0.15*Math.sin(2*Math.PI*f*3*t))*g*0.05;
      const pan=(k/(ac.length-1))-0.5; l+=v*(1-pan*0.6); r+=v*(1+pan*0.6);});
  }
  // tremolo lento
  const trem=0.85+0.15*Math.sin(2*Math.PI*0.125*t);
  L[i]=l*trem; R[i]=r*trem;
}
// arpejo em colcheias a 100 BPM (0,3 s), notas do acorde uma oitava acima
const passo=60/100/2;
for(let n=0;n*passo<DUR;n++){
  const t0=n*passo; const ac=acordes[Math.floor(t0/8)%4]; const m=ac[[1,2,3,4,3,2][n%6]]+12; const f=hz(m);
  const vel=(n%2?0.5:0.8)*0.06;
  for(let j=0;j<SR*1.2;j++){const i=Math.floor(t0*SR)+j; if(i>=N)break; const tt=j/SR;
    const v=Math.sin(2*Math.PI*f*tt)*Math.exp(-tt*4.5)*vel*(1-Math.exp(-tt*200));
    const pan=(n%4)/3-0.5; L[i]+=v*(1-pan*0.5); R[i]+=v*(1+pan*0.5);}
}
// eco simples
const d=Math.floor(passo*3*SR);
for(let i=d;i<N;i++){L[i]+=R[i-d]*0.22; R[i]+=L[i-d]*0.22;}
// filtro passa-baixa leve
let pl=0,pr=0; const a=0.18;
for(let i=0;i<N;i++){pl+=a*(L[i]-pl); pr+=a*(R[i]-pr); L[i]=pl; R[i]=pr;}
let pico=0; for(let i=0;i<N;i++) pico=Math.max(pico,Math.abs(L[i]),Math.abs(R[i]));
const k=0.89/pico;
const buf=Buffer.alloc(44+N*4);
buf.write("RIFF",0);buf.writeUInt32LE(36+N*4,4);buf.write("WAVE",8);buf.write("fmt ",12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write("data",36);buf.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){buf.writeInt16LE(Math.round(L[i]*k*32767),44+i*4);buf.writeInt16LE(Math.round(R[i]*k*32767),46+i*4);}
fs.writeFileSync(process.argv[2],buf); console.log("ok",(buf.length/1e6).toFixed(1),"MB");

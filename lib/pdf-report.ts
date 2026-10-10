/** Render complete report blocks on A4 pages, keeping each table together. */
export async function downloadPdfReport(body: string, lang: 'en' | 'zh') {
 const [{jsPDF},{default:html2canvas}]=await Promise.all([import('jspdf'),import('html2canvas')]);
 const frame=document.createElement('iframe');
 frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
 frame.style.cssText='position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;pointer-events:none';
 document.body.appendChild(frame);
 try {
  const doc=frame.contentDocument!;
  doc.open();doc.write(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;color:#202d48;font:16px Arial,"Noto Sans SC",sans-serif;line-height:1.55;background:white}
  .page{width:794px;height:1123px;padding:48px;position:relative;background:white}.content{height:999px;overflow:visible}
  h1{font-size:30px;color:#243e72;margin:0 0 14px}h2{font-size:23px;margin:0 0 14px}h3{font-size:18px;margin:20px 0 12px}
  p{margin:0 0 14px;overflow-wrap:anywhere}ul{margin:0 0 16px;padding-left:24px}li{margin-bottom:7px}
  table{table-layout:fixed;width:100%;border-collapse:collapse;margin:0 0 20px;font-size:13px}td{padding:6px 7px;border-bottom:1px solid #e3e7ef;overflow-wrap:anywhere}thead{background:#edf1fa;font-weight:bold;color:#243e72}
  .footer{position:absolute;left:48px;right:48px;bottom:28px;display:flex;justify-content:space-between;border-top:1px solid #e3e7ef;padding-top:10px;color:#748097;font-size:12px}
  </style></head><body></body></html>`);doc.close();
  const source=doc.createElement('div');source.innerHTML=body;
  await doc.fonts.ready;
  const pages:HTMLElement[]=[];
  let content:HTMLElement;
  const newPage=()=>{const page=doc.createElement('section');page.className='page';content=doc.createElement('div');content.className='content';page.appendChild(content);doc.body.appendChild(page);pages.push(page);};
  newPage();
  let sectionStarted=false;
  for(const block of Array.from(source.children)) {
   if(block.tagName==='H2'){if(sectionStarted&&content!.children.length)newPage();sectionStarted=true;}
   content!.appendChild(block);
   if(content!.scrollHeight>999&&content!.children.length>1){block.remove();const heading=content!.lastElementChild?.tagName==='H3'?content!.lastElementChild:null;heading?.remove();newPage();if(heading)content!.appendChild(heading);content!.appendChild(block);}
  }
  const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  pdf.setProperties({title:'SecondOrder Scenario Analysis Report',subject:'Saved scenario analysis',creator:'SecondOrder Scenario V0.5'});
  for(let i=0;i<pages.length;i++){
   const footer=doc.createElement('div');footer.className='footer';footer.innerHTML=`<span>SecondOrder Scenario / V0.5</span><span>${i+1} / ${pages.length}</span>`;pages[i].appendChild(footer);
   const canvas=await html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',logging:false,scrollX:0,scrollY:0,windowWidth:794,windowHeight:1123});
   if(i)pdf.addPage();pdf.addImage(canvas.toDataURL('image/jpeg',.95),'JPEG',0,0,210,297,undefined,'FAST');
   canvas.width=0;canvas.height=0;
  }
  pdf.save('SecondOrder Scenario-report.pdf');
 } finally {frame.remove();}
}

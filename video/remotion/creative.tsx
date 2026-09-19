import React from 'react';
import {AbsoluteFill,Composition,OffthreadVideo,Sequence,registerRoot,staticFile,useCurrentFrame} from 'remotion';

type Scene={src:string;durationFrames:number;label:string};
type Caption={start:number;end:number;text:string};
type Props={creativeId:string;editVersion:number;scenes:Scene[];hook:string;productName:string;cta:string;captions:Caption[];audioIntent:'silent';price:null|{amount:string;currency:string;variant_id:string}};
const defaults:Props={creativeId:'PREVIEW',editVersion:1,scenes:[],hook:'Your next layer.',productName:'The Sloane Cropped Jacket',cta:'Explore Sloane',captions:[],audioIntent:'silent',price:null};
const Ad:React.FC<Props>=p=>{
  const frame=useCurrentFrame();
  const total=p.scenes.reduce((n,s)=>n+s.durationFrames,0);
  const caption=p.captions.find(c=>frame>=Math.round(c.start*30)&&frame<Math.round(c.end*30));
  const heading=frame<90?p.hook:frame>=total-120?p.cta:p.productName;
  let cursor=0;
  return <AbsoluteFill style={{background:'#f5f2eb',color:'#252722',fontFamily:'Arial'}}>
    {p.scenes.map((s,i)=>{const from=cursor;cursor+=s.durationFrames;return <Sequence key={i} from={from} durationInFrames={s.durationFrames}><AbsoluteFill><div style={{position:'absolute',top:260,left:60,right:120,height:1070}}><OffthreadVideo muted src={staticFile(s.src)} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div></AbsoluteFill></Sequence>;})}
    <div style={{position:'absolute',top:170,left:80,right:150,fontSize:27,letterSpacing:5}}>SLOANE EDIT</div>
    <div style={{position:'absolute',left:80,right:150,top:1370}}>
      <div style={{fontFamily:'Georgia',fontSize:66,lineHeight:1.08,overflowWrap:'break-word'}}>{heading}</div>
      {caption&&<div style={{fontSize:32,lineHeight:1.3,marginTop:24}}>{caption.text}</div>}
      {p.price&&<div style={{fontSize:30,marginTop:18}}>{p.price.currency} {p.price.amount}</div>}
    </div>
  </AbsoluteFill>;
};
const Root=()=> <Composition id="SloaneCreative" component={Ad} width={1080} height={1920} fps={30} durationInFrames={450} defaultProps={defaults} calculateMetadata={({props})=>({durationInFrames:props.scenes.reduce((n,s)=>n+s.durationFrames,0)||450})}/>;
registerRoot(Root);

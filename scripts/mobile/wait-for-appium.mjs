import {setTimeout as pause} from 'node:timers/promises';
export async function waitForAppium(port=Number(process.env.APPIUM_PORT || 4723), timeoutMs=60000) {
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){
    try{
      const response=await fetch('http://127.0.0.1:'+port+'/status',{signal:AbortSignal.timeout(1000)});
      const data=await response.json();
      if(response.ok && data.value?.ready===true)return;
    }catch{}
    await pause(500);
  }
  throw new Error('Appium no respondió listo en /status. Inicia npm run appium:start y revisa su log.');
}

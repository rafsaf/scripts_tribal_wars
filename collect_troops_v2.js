/*!
MIT License

Copyright (c) 2022 rafal.safin12@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 

About
-----

Tool to gather informations about Troops and Defence informations of every
player in the tribe. When clicked, in the middle of the screen, a "counter" 
with progress appears,then the result in the window. It works in both the 
Army and Defense tabs. The default settings to copy have the cache set to 
true a cacheTime for 5 minutes, during which time the script spits out the 
result saved in the browser instead of flying all the members all over again 
and collecting data. In case of doubt whether we are dealing with a new or 
old result, the date of the generation appears at the bottom.

Configuration
-------------

Configuration takes place by using object "COLLECT_TROOPS_DATA_V2" or for
legacy purposes if "COLLECT_TROOPS_DATA_V2" is undefined, "Data" var
will be used. Note every parameter IS OPTIONAL, if both variables are
undefined or are defined, but there are no keys there, sensible 
defaults will be used.

- cache: <boolean> (default: true) is responsible for storing the result 
in the browser so as not to accidentally click a few times in a row and 
load the game servers, setting cache: false causes not to store the result 
(eg, when we intend to collect data from two tribes jumping immediately 
to the other). Note if the tribe has huge amount of villages, it may take way 
too much storage in localStorage (~max 5MB), beacuse of that limit is 1MB,
if output is > 1MB, save to localStorage will be skipped.

- cacheTime: <number> (default: 5) is the time of storing the result in 
the browser, in minutes.

- removedPlayers: <string> (default: "") here we enter the nicknames of players
from whom we do not want to collect troops info, separating with semicolons as in 
the messages in game, e.g. "Rafsaf;kmic;someoneelse"

- allowedPlayers: <string> (default: "") here we enter the nicknames of players 
from whom ONLY! (if it's empty, all players in the tribe will be used) we want to 
collect troops info, separating with semicolons as in the messages in game, 
e.g. "Rafsaf;kmic;someoneelse"

- language: <string> (default: "pl") this should be "en" or "pl", if anything
different is used, script will use english 

- showNicknamesTroops: <boolean> (default: false) when set to true cause that 
at each line appears at its beginning additionally the nickname of the player,
applies only in Troops tab, similar to showNicknamesDeff

- showFirstLineTroops: <boolean> (default: false) when set to true cause that 
at result additional line at the top will be added, that is specified by
firstLineDeff variable, applies only in Troops tab, similar to showFirstLineDeff

- firstLineTroops: <string> (default: "") line that will be showed at the result top
when showFirstLineTroops is true, applies only in Troops tab, similar to 
showNicknamesDeff

- showNicknamesDeff: <boolean> (default: false) when set to true cause that 
at each line appears at its beginning additionally the nickname of the player,
applies only in Defence tab, similar to showNicknamesTroops

- showFirstLineDeff: <boolean> (default: false) when set to true cause that 
at result additional line at the top will be added, that is specified by
firstLineDeff variable, applies only in Defence tab, similar to showFirstLineTroops

- firstLineDeff: <string> (default: "") line that will be showed at the result top
when showFirstLineTroops is true, applies only in Defence tab, similar 
to firstLineTroops

*///!
var UI,Dialog,COLLECT_TROOPS_DATA_V2,Data,CT_EN_MESSAGES_V2={GO_TO_TRIBE_MEMBERS_TAB:"Error: Go to the Tribe -> Members -> Troops or Defence",EMPTY_PLAYERS_TABLE:"Error: Could not get players from current page!",SCRIPT_NAME_ARMY:"Army Collection",SCRIPT_NAME_DEFF:"Deff Collection",SCRIPT_NAME_WITH_AUTHOR:"Script collect_troops_v2 by Rafsaf",CONFIG_DISABLED_PLAYERS:"Ommited because of script config or complete lack of overview",EMPTY_RESULT_PLAYERS:"Ommited because of empty result",ATTENTION_PARTIAL_OR_LACK_OVERVIEW:"Ommited because of partial lack of overview",FINAL_SCRAPED_PLAYERS:"Sucessfully collected players",GENERATED:"Generated at",SCRIPT_HELP:"HELP",WAIT:"Wait",NO_PLAYERS_SELECTOR_ON_PAGE:"Fatal error: Could not find html selector with players, hCaptcha bot protection?",CRITICAL_ERROR_HCAPTCHA:"Fatal error: No player page table selector, hCaptcha bot protection?"},CT_PL_MESSAGES_V2={GO_TO_TRIBE_MEMBERS_TAB:"B\u0142\u0105d: Przejd\u017A do Plemi\u0119 -> Cz\u0142onkowie -> Wojska/Obrona",EMPTY_PLAYERS_TABLE:"B\u0142\u0105d: Brak graczy na obecnej stronie!",SCRIPT_NAME_ARMY:"Zbi\xF3rka Wojska",SCRIPT_NAME_DEFF:"Zbi\xF3rka Deffa",SCRIPT_NAME_WITH_AUTHOR:"Skrypt collect_troops_v2 by Rafsaf",CONFIG_DISABLED_PLAYERS:"Pomini\u0119ci przez ustawienia skryptu lub ca\u0142kowity brak dost\u0119pu",EMPTY_RESULT_PLAYERS:"Pomini\u0119ci z powodu pustego wyniku zbi\xF3rki",ATTENTION_PARTIAL_OR_LACK_OVERVIEW:"Pomini\u0119ci przez cz\u0119\u015Bciowy dost\u0119p do przegl\u0105du",GENERATED:"Wygenerowano",FINAL_SCRAPED_PLAYERS:"Pomy\u015Blnie zebrany przegl\u0105d",WAIT:"Czekaj",SCRIPT_HELP:"POMOC",NO_PLAYERS_SELECTOR_ON_PAGE:"B\u0142\u0105d krytyczny: Nie istnieje selektor z list\u0105 graczy, ochrona botowa hCaptcha?",CRITICAL_ERROR_HCAPTCHA:"B\u0142\u0105d krytyczny: Brak tabeli na stronie gracza, ochrona botowa hCaptcha?"},collectTroopsScriptByRafsafV2=async()=>{var C,w,N,M,O,k,D,v,B,W,Y,$;const u=[],P=[],m=[],S=new URLSearchParams(location.search);let y="",_="";const A=S.get("mode"),E=()=>A==="members_troops",H=()=>A==="members_defense",o=(w=(C=COLLECT_TROOPS_DATA_V2!=null?COLLECT_TROOPS_DATA_V2:void 0)!=null?C:Data)!=null?w:{},L=(N=o.language)!=null?N:"pl",l=L==="pl"?CT_PL_MESSAGES_V2:CT_EN_MESSAGES_V2,n={cache:(M=o.cache)!=null?M:!0,cacheTime:(O=o.cacheTime)!=null?O:5,removedPlayers:o.removedPlayers?o.removedPlayers.split(";"):[],allowedPlayers:o.allowedPlayers?o.allowedPlayers.split(";"):[],showFirstLine:E()?(k=o.showFirstLineTroops)!=null?k:!1:(D=o.showFirstLineDeff)!=null?D:!1,showNicknames:E()?(v=o.showNicknamesTroops)!=null?v:!1:(B=o.showNicknamesDeff)!=null?B:!1,scriptName:E()?l.SCRIPT_NAME_ARMY:l.SCRIPT_NAME_DEFF,firstLine:E()?(W=o.firstLineTroops)!=null?W:"":(Y=o.firstLineTroops)!=null?Y:"",villagesPerPage:E()?1e3:2e3,language:L};if(console.log("start collectTroopsScriptByRafsafV2 with config:",n),S.get("screen")!=="ally"||!H()&&!E()){UI.ErrorMessage(l.GO_TO_TRIBE_MEMBERS_TAB,"3000");return}const b=document.querySelector("#ally_content .input-nicer");if(b===null){UI.ErrorMessage(l.NO_PLAYERS_SELECTOR_ON_PAGE,"4000");return}for(let s of Array.from(b))s.hidden||s instanceof HTMLOptGroupElement||u.push({id:s.value,nick:s.text.trim(),disabled:s.disabled});if(u.length===0){UI.ErrorMessage(l.EMPTY_PLAYERS_TABLE,"4000");return}const I=document.getElementById("content_value");if(I!==null){const s=I.querySelector("h2");if(s!==null){_=($=s.textContent)!=null?$:"";const i=_.indexOf("(");i!==-1&&(_=_.slice(0,i).trim())}}const z=(s,i)=>{const t=s.querySelectorAll(".table-responsive .vis tr");let T=!1,c="",f="",d=0;return t.length===0?(P.push(i),0):(t.forEach((g,r)=>{if(r===0)return;d+=1,(y!==""||c!=="")&&(c+=`\r
`),n.showNicknames&&(c+=i.nick+","),g.querySelectorAll("td").forEach((e,p)=>{let a=String(e.innerHTML).trim();if(a==="?"&&(T=!0),p===0)if(a.includes("|")){a=a.split("").reverse().join("");const x=a.search("[)]"),h=a.search("[(]");a=a.slice(x+1,h),a=a.split("").reverse().join(""),f=a}else c+=f+",";c+=a+","})}),T?(m.push(i),0):(y+=c,d))},F=(s,i)=>{const t=new URLSearchParams(location.search);return t.set("player_id",s),t.set("page",String(i)),`${window.location.origin}${window.location.pathname}?${t.toString()}`},G=s=>new DOMParser().parseFromString(s,"text/html").body;async function V(){const s=`collectTroopsScriptByRafsafV2:${A}`,i=window.localStorage.getItem(s);let t,T=null,c=[],f=[],d=[];if(i!==null&&(T=JSON.parse(i),T!==null&&(new Date().getTime()>=T.expiresAt||!n.cache)&&(T=null)),T!==null)t=T;else{n.allowedPlayers.length===0?c=u.filter(e=>!e.disabled&&!n.removedPlayers.includes(e.nick)):c=u.filter(e=>!e.disabled&&n.allowedPlayers.includes(e.nick)&&!n.removedPlayers.includes(e.nick));const g=e=>`
        <h1 style="margin-top:10px;font-size:40px">
        ${e}/${c.length}
        </h1>
        <h1>${l.WAIT}...</h1>
        `,r=document.createElement("div");r.setAttribute("id","collectTroopsScriptByRafsafV2ProgressBar"),r.style.width="300px",r.style.height="200px",r.style.position="absolute",r.style.background="#f4e4bc",r.style.margin="auto",r.style.color="#803000",r.style.top="0",r.style.bottom="20%",r.style.left="0",r.style.right="0",r.style.border="5px solid #804000",r.style.textAlign="center",r.style.fontSize="40px",r.innerHTML=g(0),document.body.appendChild(r);let R=1;for(let e of c){let p=1,a=0;for(;(p-1)*n.villagesPerPage===a;){r.innerHTML=g(R);const h=await(await fetch(F(e.id,p))).text(),U=G(h);a+=z(U,e),console.info(`${e.nick} page ${p} villages: ${a}`),p+=1,await new Promise(j=>setTimeout(j,300))}R+=1}if(r.remove(),f=c.filter(e=>!m.includes(e)&&!P.includes(e)),d=u.filter(e=>!m.includes(e)&&!f.includes(e)&&!P.includes(e)),t={output:y,generatedAt:new Date().getTime(),expiresAt:new Date().getTime()+n.cacheTime*60*1e3,tribeName:_,finalPlayers:f,disabledPlayers:d,lackOfAccessPlayers:m,emptyResultPlayers:P},!n.cache)console.log("script cache not enabled, skipping save to localStorage");else try{const e=JSON.stringify(t),p=new Blob([e]).size;p<=1048576?(localStorage.setItem(s,e),console.log("result saved to localStorage, size in bytes",p)):console.warn("size of result in bytes more than 1MB, skipping save in localStorage",p)}catch(e){console.warn("could not save result of script to localStorage",e)}}Dialog.show("collectTroopsScriptByRafsafV2ResultDialog",`
        <h3 style="width:600px;">${n.scriptName}: ${t.tribeName}</h3>
        ${t.finalPlayers.length===0?"":`<h4>${l.FINAL_SCRAPED_PLAYERS}:</h4><p>${t.finalPlayers.map(g=>g.nick).join(";")}</p>`}
        ${t.disabledPlayers.length===0?"":`<h4>${l.CONFIG_DISABLED_PLAYERS}:</h4><p>${t.disabledPlayers.map(g=>g.nick).join(";")}</p>`}
        ${t.lackOfAccessPlayers.length===0?"":`<h4>${l.ATTENTION_PARTIAL_OR_LACK_OVERVIEW}:</h4><p>${t.lackOfAccessPlayers.map(g=>g.nick).join(";")}</p>`}
        ${t.emptyResultPlayers.length===0?"":`<h4>${l.EMPTY_RESULT_PLAYERS}:</h4><p>${t.emptyResultPlayers.map(g=>g.nick).join(";")}</p>`}
        <textarea rows="15" style="width:95%;margin-top:15px;margin-bottom:25px;">${n.showFirstLine?n.firstLine+`\r
`:""}${t.output}</textarea>
        <p style="text-align:right; margin:2px">
        <small>${l.SCRIPT_NAME_WITH_AUTHOR}</small>
        <p style="text-align:right; margin:2px">
        <small>${l.GENERATED} ${new Date(t.generatedAt).toLocaleString()}</small></p>
        <p style="text-align:right; margin:2px">
        <a target="_blank" rel="noopener" href="https://forum.plemiona.pl/index.php?threads/zbi%C3%B3rka-wojska-i-obrony.128630/">${l.SCRIPT_HELP}</a>
        </p>
        `)}await V()};collectTroopsScriptByRafsafV2().catch(u=>{const P=document.getElementById("collectTroopsScriptByRafsafV2ProgressBar");P!==null&&P.remove(),UI.ErrorMessage(String(u),"5000")});

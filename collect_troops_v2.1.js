/*!
MIT License

Copyright (c) 2022 rafal.safin12@gmail.com
Source https://github.com/rafsaf/scripts_tribal_wars/blob/2024-09-09/src/collect_troops_v2.1.ts

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

- language: <string> (default: "pl") this should be "en", "de", "cz" or "pl", if anything
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

Usage
-----

Using as a script for the bar:

javascript: var COLLECT_TROOPS_DATA_V2 = {
    cache: true,
    cacheTime: 5,
    removedPlayers: "",
    allowedPlayers: "",
    firstLineTroops: "",
    showFirstLineTroops: false,
    showNicknamesTroops: false,
    firstLineDeff: "",
    showFirstLineDeff: false,
    showNicknamesDeff: false,
    language: "en",
};
$.getScript("official-innogames-cdn-url-where-script-is-hosted");
void 0;

*///!
var UI,Dialog,COLLECT_TROOPS_DATA_V2,Data,CT_EN_MESSAGES_V2={GO_TO_TRIBE_MEMBERS_TAB:"Error: Go to the Tribe -> Members -> Troops or Defence",EMPTY_PLAYERS_TABLE:"Error: Could not get players from current page!",SCRIPT_NAME_ARMY:"Army Collection",SCRIPT_NAME_DEFF:"Deff Collection",SCRIPT_NAME_WITH_AUTHOR:"Script collect_troops_V2 by Rafsaf",CONFIG_DISABLED_PLAYERS:"Ommited because of script config or complete lack of overview",EMPTY_RESULT_PLAYERS:"Ommited because of empty result",ATTENTION_PARTIAL_OR_LACK_OVERVIEW:"Ommited because of partial lack of overview",FINAL_SCRAPED_PLAYERS:"Sucessfully collected players",GENERATED:"Generated at",WAIT:"Wait",NO_PLAYERS_SELECTOR_ON_PAGE:"Fatal error: Could not find html selector with players, hCaptcha bot protection?",CRITICAL_ERROR_HCAPTCHA:"Fatal error: No player page table selector, hCaptcha bot protection?"},CT_PL_MESSAGES_V2={GO_TO_TRIBE_MEMBERS_TAB:"B\u0142\u0105d: Przejd\u017A do Plemi\u0119 -> Cz\u0142onkowie -> Wojska/Obrona",EMPTY_PLAYERS_TABLE:"B\u0142\u0105d: Brak graczy na obecnej stronie!",SCRIPT_NAME_ARMY:"Zbi\xF3rka Wojska",SCRIPT_NAME_DEFF:"Zbi\xF3rka Deffa",SCRIPT_NAME_WITH_AUTHOR:"Skrypt collect_troops_V2 by Rafsaf",CONFIG_DISABLED_PLAYERS:"Pomini\u0119ci przez ustawienia skryptu lub ca\u0142kowity brak dost\u0119pu",EMPTY_RESULT_PLAYERS:"Pomini\u0119ci z powodu pustego wyniku zbi\xF3rki",ATTENTION_PARTIAL_OR_LACK_OVERVIEW:"Pomini\u0119ci przez cz\u0119\u015Bciowy dost\u0119p do przegl\u0105du",GENERATED:"Wygenerowano",FINAL_SCRAPED_PLAYERS:"Pomy\u015Blnie zebrany przegl\u0105d",WAIT:"Czekaj",NO_PLAYERS_SELECTOR_ON_PAGE:"B\u0142\u0105d krytyczny: Nie istnieje selektor z list\u0105 graczy, ochrona botowa hCaptcha?",CRITICAL_ERROR_HCAPTCHA:"B\u0142\u0105d krytyczny: Brak tabeli na stronie gracza, ochrona botowa hCaptcha?"},CT_DE_MESSAGES_V2={GO_TO_TRIBE_MEMBERS_TAB:"Fehler: Gehe zu Stamm -> Mitglieder -> Truppen oder Verteidigung",EMPTY_PLAYERS_TABLE:"Fehler: Konnte keine Spieler von der aktuellen Seite abrufen!",SCRIPT_NAME_ARMY:"Truppensammlung",SCRIPT_NAME_DEFF:"Verteidigungssammlung",SCRIPT_NAME_WITH_AUTHOR:"Skript collect_troops_V2 von Rafsaf",CONFIG_DISABLED_PLAYERS:"Ausgelassen aufgrund der Skripteinstellungen oder vollst\xE4ndigem Mangel an \xDCbersicht",EMPTY_RESULT_PLAYERS:"Ausgelassen aufgrund eines leeren Ergebnisses",ATTENTION_PARTIAL_OR_LACK_OVERVIEW:"Ausgelassen aufgrund teilweiser oder fehlender \xDCbersicht",FINAL_SCRAPED_PLAYERS:"Erfolgreich gesammelte Spieler",GENERATED:"Generiert am",WAIT:"Warten",NO_PLAYERS_SELECTOR_ON_PAGE:"Kritischer Fehler: Konnte keinen HTML-Selektor mit Spielern finden, hCaptcha Bot-Schutz?",CRITICAL_ERROR_HCAPTCHA:"Kritischer Fehler: Kein Spielertabellen-Selektor auf der Seite, hCaptcha Bot-Schutz?"},CT_CZ_MESSAGES_V2={GO_TO_TRIBE_MEMBERS_TAB:"Chyba: P\u0159ejd\u011Bte na Kmen -> \u010Clenov\xE9 -> Vojensk\xE9 jednotky nebo Obrana",EMPTY_PLAYERS_TABLE:"Chyba: Nepoda\u0159ilo se na\u010D\xEDst hr\xE1\u010De z aktu\xE1ln\xED str\xE1nky!",SCRIPT_NAME_ARMY:"Sb\u011Br vojsk",SCRIPT_NAME_DEFF:"Sb\u011Br obrany",SCRIPT_NAME_WITH_AUTHOR:"Skript collect_troops_V2 od Rafsaf",CONFIG_DISABLED_PLAYERS:"P\u0159esko\u010Deno kv\u016Fli nastaven\xED skriptu nebo \xFApln\xE9mu nedostatku p\u0159ehledu",EMPTY_RESULT_PLAYERS:"P\u0159esko\u010Deno kv\u016Fli pr\xE1zdn\xE9mu v\xFDsledku",ATTENTION_PARTIAL_OR_LACK_OVERVIEW:"P\u0159esko\u010Deno kv\u016Fli \u010D\xE1ste\u010Dn\xE9mu nebo \xFApln\xE9mu nedostatku p\u0159ehledu",FINAL_SCRAPED_PLAYERS:"\xDAsp\u011B\u0161n\u011B shrom\xE1\u017Ed\u011Bn\xED hr\xE1\u010Di",GENERATED:"Vygenerov\xE1no dne",WAIT:"\u010Cekejte",NO_PLAYERS_SELECTOR_ON_PAGE:"Kritick\xE1 chyba: Nepoda\u0159ilo se naj\xEDt HTML selektor s hr\xE1\u010Di, ochrana proti bot\u016Fm hCaptcha?",CRITICAL_ERROR_HCAPTCHA:"Kritick\xE1 chyba: Na str\xE1nce nen\xED selektor tabulky hr\xE1\u010D\u016F, ochrana proti bot\u016Fm hCaptcha?"},collectTroopsScriptByRafsafV2=async()=>{var b,N,M,O,k,w,D,v,B,Y,W,F;const T=[],u=[],d=[],h=new URLSearchParams(location.search);let f="",P="";const m=h.get("mode"),p=()=>m==="members_troops",G=()=>m==="members_defense",n=(N=(b=COLLECT_TROOPS_DATA_V2!=null?COLLECT_TROOPS_DATA_V2:void 0)!=null?b:Data)!=null?N:{},z={pl:CT_PL_MESSAGES_V2,en:CT_EN_MESSAGES_V2,de:CT_DE_MESSAGES_V2,cz:CT_CZ_MESSAGES_V2},L=(M=n.language)!=null?M:"pl",i=z[L],o={cache:(O=n.cache)!=null?O:!0,cacheTime:(k=n.cacheTime)!=null?k:5,removedPlayers:n.removedPlayers?n.removedPlayers.split(";"):[],allowedPlayers:n.allowedPlayers?n.allowedPlayers.split(";"):[],showFirstLine:p()?(w=n.showFirstLineTroops)!=null?w:!1:(D=n.showFirstLineDeff)!=null?D:!1,showNicknames:p()?(v=n.showNicknamesTroops)!=null?v:!1:(B=n.showNicknamesDeff)!=null?B:!1,scriptName:p()?i.SCRIPT_NAME_ARMY:i.SCRIPT_NAME_DEFF,firstLine:p()?(Y=n.firstLineTroops)!=null?Y:"":(W=n.firstLineTroops)!=null?W:"",villagesPerPage:p()?1e3:2e3,language:L};if(console.log("start collectTroopsScriptByRafsafV2 with config:",o),h.get("screen")!=="ally"||!G()&&!p()){UI.ErrorMessage(i.GO_TO_TRIBE_MEMBERS_TAB,"3000");return}const I=document.querySelector("#ally_content .input-nicer");if(I===null){UI.ErrorMessage(i.NO_PLAYERS_SELECTOR_ON_PAGE,"4000");return}for(let s of Array.from(I))s.hidden||s instanceof HTMLOptGroupElement||T.push({id:s.value,nick:s.text.trim(),disabled:s.disabled});if(T.length===0){UI.ErrorMessage(i.EMPTY_PLAYERS_TABLE,"4000");return}const C=document.getElementById("content_value");if(C!==null){const s=C.querySelector("h2");if(s!==null){P=(F=s.textContent)!=null?F:"";const c=P.indexOf("(");c!==-1&&(P=P.slice(0,c).trim())}}const V=(s,c)=>{const t=s.querySelectorAll(".table-responsive .vis tr");let _=!1,l="",A="",R=0;return t.length===0?(u.push(c),0):(t.forEach((E,r)=>{if(r===0)return;R+=1,(f!==""||l!=="")&&(l+=`\r
`),o.showNicknames&&(l+=c.nick+","),E.querySelectorAll("td").forEach((e,g)=>{let a=String(e.innerHTML).trim();if(a==="?"&&(_=!0),g===0)if(a.includes("|")){a=a.split("").reverse().join("");const H=a.search("[)]"),y=a.search("[(]");a=a.slice(H+1,y),a=a.split("").reverse().join(""),A=a}else l+=A+",";l+=a+","})}),_?(d.push(c),0):f.includes(l)?0:(f+=l,R))},$=(s,c)=>{const t=new URLSearchParams(location.search);return t.set("player_id",s),t.set("page",String(c)),`${window.location.origin}${window.location.pathname}?${t.toString()}`},x=s=>new DOMParser().parseFromString(s,"text/html").body;async function j(){const s=`collectTroopsScriptByRafsafV2:${m}`,c=window.localStorage.getItem(s);let t,_=null,l=[],A=[],R=[];if(c!==null&&(_=JSON.parse(c),_!==null&&(new Date().getTime()>=_.expiresAt||!o.cache)&&(_=null)),_!==null)t=_;else{o.allowedPlayers.length===0?l=T.filter(e=>!e.disabled&&!o.removedPlayers.includes(e.nick)):l=T.filter(e=>!e.disabled&&o.allowedPlayers.includes(e.nick)&&!o.removedPlayers.includes(e.nick));const E=e=>`
        <h1 style="margin-top:10px;font-size:40px">
        ${e}/${l.length}
        </h1>
        <h1>${i.WAIT}...</h1>
        `,r=document.createElement("div");r.setAttribute("id","collectTroopsScriptByRafsafV2ProgressBar"),r.style.width="300px",r.style.height="200px",r.style.position="absolute",r.style.background="#f4e4bc",r.style.margin="auto",r.style.color="#803000",r.style.top="0",r.style.bottom="20%",r.style.left="0",r.style.right="0",r.style.border="5px solid #804000",r.style.textAlign="center",r.style.fontSize="40px",r.innerHTML=E(0),document.body.appendChild(r);let S=1;for(let e of l){let g=1,a=0;for(;(g-1)*o.villagesPerPage===a;){r.innerHTML=E(S);const y=await(await fetch($(e.id,g))).text(),U=x(y);a+=V(U,e),console.info(`${e.nick} page ${g} villages: ${a}`),g+=1,await new Promise(K=>setTimeout(K,300))}S+=1}if(r.remove(),A=l.filter(e=>!d.includes(e)&&!u.includes(e)),R=T.filter(e=>!d.includes(e)&&!A.includes(e)&&!u.includes(e)),t={output:f,generatedAt:new Date().getTime(),expiresAt:new Date().getTime()+o.cacheTime*60*1e3,tribeName:P,finalPlayers:A,disabledPlayers:R,lackOfAccessPlayers:d,emptyResultPlayers:u},!o.cache)console.log("script cache not enabled, skipping save to localStorage");else try{const e=JSON.stringify(t),g=new Blob([e]).size;g<=1048576?(localStorage.setItem(s,e),console.log("result saved to localStorage, size in bytes",g)):console.warn("size of result in bytes more than 1MB, skipping save in localStorage",g)}catch(e){console.warn("could not save result of script to localStorage",e)}}Dialog.show("collectTroopsScriptByRafsafV2ResultDialog",`
        <h3 style="width:600px;">${o.scriptName}: ${t.tribeName}</h3>
        ${t.finalPlayers.length===0?"":`<h4>${i.FINAL_SCRAPED_PLAYERS}:</h4><p>${t.finalPlayers.map(E=>E.nick).join(";")}</p>`}
        ${t.disabledPlayers.length===0?"":`<h4>${i.CONFIG_DISABLED_PLAYERS}:</h4><p>${t.disabledPlayers.map(E=>E.nick).join(";")}</p>`}
        ${t.lackOfAccessPlayers.length===0?"":`<h4>${i.ATTENTION_PARTIAL_OR_LACK_OVERVIEW}:</h4><p>${t.lackOfAccessPlayers.map(E=>E.nick).join(";")}</p>`}
        ${t.emptyResultPlayers.length===0?"":`<h4>${i.EMPTY_RESULT_PLAYERS}:</h4><p>${t.emptyResultPlayers.map(E=>E.nick).join(";")}</p>`}
        <textarea rows="15" style="width:95%;margin-top:15px;margin-bottom:25px;">${o.showFirstLine?o.firstLine+`\r
`:""}${t.output}</textarea>
        <p style="text-align:right; margin:2px">
        <small>${i.SCRIPT_NAME_WITH_AUTHOR}</small>
        <p style="text-align:right; margin:2px">
        <small>${i.GENERATED} ${new Date(t.generatedAt).toLocaleString()}</small></p>
        `)}await j()};collectTroopsScriptByRafsafV2().catch(T=>{const u=document.getElementById("collectTroopsScriptByRafsafV2ProgressBar");u!==null&&u.remove(),UI.ErrorMessage(String(T),"5000")});

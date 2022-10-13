/* 
MIT License
===========

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
=====

Tool to gather informations about Troops and Defence informations of every
player in the tribe. When clicked, in the middle of the screen, a "counter" 
with progress appears,then the result in the window. It works in both the 
Army and Defense tabs. The default settings to copy have the cache set to 
true a cacheTime for 5 minutes, during which time the script spits out the 
result saved in the browser instead of flying all the members all over again 
and collecting data. In case of doubt whether we are dealing with a new or 
old result, the date of the generation appears at the bottom.

Configuration
=============

- "cache" is responsible for storing the result in the browser so as not 
to accidentally click a few times in a row and load the game servers, 
setting cache: false causes not to store the result (eg when we intend 
to collect data from two members jumping immediately to the other)

- "cacheTime" is the time of storing the result in the browser, in minutes

- "removedPlayers" here we enter the nicknames of players from whom we 
do not want to collect troops info, separating with semicolons as in 
the messages in game, e.g. "Rafsaf;kmic"

- "allowedPlayers" here we enter the nicknames of players from whom ONLY! 
(if it's empty, all players in the tribe will be used) we want to collect troops 
info, separating with semicolons as in the messages in game, e.g. "Rafsaf;kmic"

- "showFirstLineDeff" and "showFirstLineTroops" optionally stick the header 
(first line) to the results respectively in the Defense and Army output, I did 
not want to decide on the convention so you can determine for yourself what should 
be in the line, so that it shows we set to true and the content of the lines in 
"firstLineDeff" and "firstLineTroops" respectively according to your taste.

- "showNicknamesDeff" and "showNicknamesTroops" when set to true cause that 
at each line appears at its beginning additionally the nickname of the player 
(owner of a given village)

- "language" this should be "en" or "pl"

*/

interface TribalWarsUI {
  ErrorMessage: (message: string, showTime: string) => void;
}
interface TribalWarsDialog {
  show: (dialogName: string, dialogHTML: string) => void;
}
interface CollectTroopsData {
  cache: boolean;
  cacheTime: number;
  removedPlayers: string;
  allowedPlayers: string;
  firstLineTroops: string;
  showFirstLineTroops: boolean;
  showNicknamesTroops: boolean;
  firstLineDeff: string;
  showFirstLineDeff: boolean;
  showNicknamesDeff: boolean;
  language: "en" | "pl";
}

interface InitScriptData {
  scriptMode: "members_defense" | "members_troops";
}

interface TWPlayer {
  id: string;
  nick: string;
  disabled: boolean;
}

interface I18nLanguageMessages {
  GO_TO_TRIBE_MEMBERS_TAB: string;
  EMPTY_PLAYERS_TABLE: string;
  SCRIPT_NAME_ARMY: string;
  SCRIPT_NAME_DEFF: string;
  OMMITED_PLAYERS: string;
  ATTENTION_PARTIAL_OR_LACK_OVERVIEW: string;
  GENERATED: string;
  WAIT: string;
}

var UI: TribalWarsUI;
var Dialog: TribalWarsDialog;
var COLLECT_TROOPS_DATA_V2: CollectTroopsData;

var CT_EN_MESSAGES_V2: I18nLanguageMessages = {
  GO_TO_TRIBE_MEMBERS_TAB:
    "Error: Go to the Tribe -> Members -> Troops or Defence",
  EMPTY_PLAYERS_TABLE: "Error: Could not get players from current page",
  SCRIPT_NAME_ARMY: "Army Collection",
  SCRIPT_NAME_DEFF: "Deff Collection",
  OMMITED_PLAYERS: "Ommited",
  ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
    "Attention, partial or complete lack of overview",
  GENERATED: "Generated at",
  WAIT: "Wait...",
};
var CT_PL_MESSAGES_V2: I18nLanguageMessages = {
  GO_TO_TRIBE_MEMBERS_TAB:
    "Błąd: Przejdź do Plemię -> Członkowie -> Wojska/Obrona",
  EMPTY_PLAYERS_TABLE: "Could not get players from current page",
  SCRIPT_NAME_ARMY: "Army Collection",
  SCRIPT_NAME_DEFF: "Deff Collection",
  OMMITED_PLAYERS: "Nieuwzględnieni",
  ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
    "Uwaga! Częściowy lub całkowity brak podglądu",
  GENERATED: "Wygenerowano",
  WAIT: "Czekaj...",
};

var collectTroopsScriptByRafsafV2 = () => {
  let output: string = "";
  let lackOfAccessPlayers: string = "";
  const players: TWPlayer[] = [];
  let I18N: I18nLanguageMessages;

  // Set translations language based on config
  if (COLLECT_TROOPS_DATA_V2.language === "pl") {
    I18N = CT_PL_MESSAGES_V2;
  } else {
    I18N = CT_EN_MESSAGES_V2;
  }

  // Check url location
  const params = new URLSearchParams(location.search);
  const scriptMode = params.get("mode");
  if (
    params.get("screen") !== "ally" ||
    (scriptMode !== "members_defense" && scriptMode !== "members_troops")
  ) {
    UI.ErrorMessage(I18N.GO_TO_TRIBE_MEMBERS_TAB, "2e3");
    return;
  }

  // Adds players from current html to get array with players nicknames and ids
  const setAllPlayersList = () => {
    const playersTableElement: HTMLSelectElement | null =
      document.querySelector("#ally_content .input-nicer");
    if (playersTableElement === null) {
      return;
    }
    for (let playerElement of Array.from(playersTableElement)) {
      if (
        playerElement.hidden ||
        playerElement instanceof HTMLOptGroupElement
      ) {
        continue;
      }
      players.push({
        id: playerElement.value,
        nick: playerElement.text.trim(),
        disabled: playerElement.disabled,
      });
    }
  };
  setAllPlayersList();
  if (players.length === 0) {
    UI.ErrorMessage(I18N.EMPTY_PLAYERS_TABLE, "3e3");
    return;
  }

  // Uses some methods to get all stuff from table with units from current html player page
  const AddPlayerPageToOutput = (
    playerPageDocument: HTMLElement,
    playerNick: string
  ) => {
    const tableRows = playerPageDocument.querySelectorAll(
      ".table-responsive .vis tr"
    );
    let noAccess = false;
    let playerOutputTroops = "";
    let coord = "";
    let villages = 0;
    tableRows.forEach((oneVillageNode, rowIndex) => {
      if (rowIndex === 0) {
        return;
      }
      villages += 1;
      if (output !== "" || playerOutputTroops !== "") {
        playerOutputTroops += "\r\n";
      }

      if (
        scriptMode === "members_defense" &&
        COLLECT_TROOPS_DATA_V2.showNicknamesDeff
      ) {
        playerOutputTroops += playerNick + ",";
      } else if (
        scriptMode === "members_troops" &&
        COLLECT_TROOPS_DATA_V2.showNicknamesTroops
      ) {
        playerOutputTroops += playerNick + ",";
      }

      let unitRow = oneVillageNode.querySelectorAll("td");
      unitRow.forEach((col, colIndex) => {
        let value = String(col.innerHTML).trim();
        if (value === "?") {
          noAccess = true;
        }
        if (colIndex === 0) {
          if (value.includes("|")) {
            value = value.split("").reverse().join("");
            const coordIndex1 = value.search("[)]");
            const coordIndex2 = value.search("[(]");
            value = value.slice(coordIndex1 + 1, coordIndex2);
            value = value.split("").reverse().join("");
            coord = value;
          } else {
            playerOutputTroops += coord + ",";
          }
        }
        playerOutputTroops += value + ",";
      });
    });
    if (noAccess) {
      lackOfAccessPlayers += `<p style="margin:0">${playerNick}</p>`;
      return 0;
    } else {
      output += playerOutputTroops;
      return villages;
    }
  };
  // To add player_id to current path
  const getPlayerURL = (playerId: string, pageNumber: number) => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("player_id", playerId);
    urlParams.set("page", String(pageNumber));
    return `${window.location.origin}${
      window.location.pathname
    }?${urlParams.toString()}`;
  };
  // Used to parse string from fetch func to html
  const ConvertToHTML = (pageText: string) => {
    const parser = new DOMParser();
    const playerPageDocument = parser.parseFromString(pageText, "text/html");
    return playerPageDocument.body;
  };

  // 0. If cacheTime smaller than actual Time, use localStorage output.
  // 1. Use AllPlayersList to get Players.
  // 2. If no access to a player, his nick goes to lackAccess variable.
  // 3. ForLoop players with access.
  // 3.1 Fetch a player page.
  // 3.2 Add his troops to output -> AddPlayerPageToOutput.
  // 4. Add results to localStorage.
  // 5. Dialog with results.

  async function RenderPlayerTroops() {
    const LS_CREATE_TIME = `cacheCollectTroopsScriptByRafsafV2Create${scriptMode}${COLLECT_TROOPS_DATA_V2.language}`;
    const LS_EXPIRE_TIME = `cacheCollectTroopsScriptByRafsafV2Expire${scriptMode}${COLLECT_TROOPS_DATA_V2.language}`;
    const LS_OUTPUT_TEXT = `cacheCollectTroopsScriptByRafsafV2Output${scriptMode}${COLLECT_TROOPS_DATA_V2.language}`;
    const LS_LACK_PLAYERS_TEXT = `cacheCollectTroopsScriptByRafsafV2LackPlayers${scriptMode}${COLLECT_TROOPS_DATA_V2.language}`;

    const removedPlayers = COLLECT_TROOPS_DATA_V2.removedPlayers.split(";");
    const allowedPlayers = COLLECT_TROOPS_DATA_V2.allowedPlayers.split(";");
    const now = new Date();

    const cacheExpire = Number(localStorage.getItem(LS_EXPIRE_TIME));

    let generatedAt: string;

    if (now.getTime() < cacheExpire && COLLECT_TROOPS_DATA_V2.cache) {
      generatedAt = new Date(
        Number(localStorage.getItem(LS_CREATE_TIME))
      ).toLocaleDateString();
      output = String(localStorage.getItem(LS_OUTPUT_TEXT));
      lackOfAccessPlayers = String(localStorage.getItem(LS_LACK_PLAYERS_TEXT));
    } else {
      generatedAt = now.toLocaleDateString();

      // calculate lackOfAccessPlayers
      for (let player of players) {
        if (player.disabled) {
          let nick = player.nick;
          const index = nick.search("[(]");
          nick = nick.slice(0, index).trim();
          lackOfAccessPlayers += `<p style="margin:0">${nick}</p>`;
        }
      }

      let notDisabledPlayers: TWPlayer[] = [];

      if (allowedPlayers.length) {
        notDisabledPlayers = players.filter((player) => {
          return !player.disabled && !removedPlayers.includes(player.nick);
        });
      } else {
        notDisabledPlayers = players.filter((player) => {
          return !player.disabled && allowedPlayers.includes(player.nick);
        });
      }

      const newProgressBar = (progressNumber: number) => {
        return `
        <h1 style="margin-top:10px;font-size:40px">
        ${progressNumber}/${notDisabledPlayers.length}
        </h1>
        <h1>${I18N.WAIT}...</h1>
        `;
      };

      const progress = document.createElement("div");
      progress.setAttribute("id", "super-simple-progress-bar");
      progress.style.width = "300px";
      progress.style.height = "200px";
      progress.style.position = "absolute";
      progress.style.background = "#f4e4bc";
      progress.style.margin = "auto";
      progress.style.color = "#803000";
      progress.style.top = "0";
      progress.style.bottom = "20%";
      progress.style.left = "0";
      progress.style.right = "0";
      progress.style.border = "5px solid #804000";
      progress.style.textAlign = "center";
      progress.style.fontSize = "40px";
      progress.innerHTML = newProgressBar(0);
      document.body.appendChild(progress);

      let playerCounter = 1;
      for (let player of notDisabledPlayers) {
        let currentPage = 1;
        let addedVillages = 0;
        while (
          currentPage === 1 ||
          (currentPage - 1) * 1000 === addedVillages
        ) {
          progress.innerHTML = newProgressBar(playerCounter);
          const response = await fetch(getPlayerURL(player.id, currentPage));
          const html = await response.text();
          const playerPageDocument = ConvertToHTML(html);
          addedVillages += AddPlayerPageToOutput(
            playerPageDocument,
            player.nick
          );
          currentPage += 1;
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        playerCounter += 1;
      }
      progress.style.display = "none";

      localStorage.setItem(LS_CREATE_TIME, String(now.getTime()));
      localStorage.setItem(
        LS_EXPIRE_TIME,
        String(now.getTime() + COLLECT_TROOPS_DATA_V2.cacheTime * 60 * 1000)
      );
      localStorage.setItem(LS_OUTPUT_TEXT, output);
      localStorage.setItem(LS_LACK_PLAYERS_TEXT, lackOfAccessPlayers);
    }
    const showDialog = (
      scriptName: string,
      showFirstLine: boolean,
      firstLine: string
    ) => {
      Dialog.show(
        "collectTroopsScriptByRafsafV2ResultDialog",
        `
        <h2 style="width:600px;">${scriptName}:</h2>
        ${
          COLLECT_TROOPS_DATA_V2.removedPlayers === ""
            ? ""
            : `<p>${I18N.OMMITED_PLAYERS}: ${COLLECT_TROOPS_DATA_V2.removedPlayers}</p>`
        }
        ${
          lackOfAccessPlayers === ""
            ? ``
            : `<h4>${I18N.ATTENTION_PARTIAL_OR_LACK_OVERVIEW}:</h4> ${lackOfAccessPlayers}`
        }
        <textarea rows="15" style="width:95%;margin-top:15px;margin-bottom:25px;">
        ${showFirstLine ? firstLine + "\r\n" : ""}
        ${output}
        </textarea>
        <p style="text-align:right">
        <small>${I18N.GENERATED} ${generatedAt}.</small>
        </p>
        `
      );
    };
    if (scriptMode === "members_defense") {
      showDialog(
        I18N.SCRIPT_NAME_DEFF,
        COLLECT_TROOPS_DATA_V2.showFirstLineDeff,
        COLLECT_TROOPS_DATA_V2.firstLineDeff
      );
    } else {
      showDialog(
        I18N.SCRIPT_NAME_ARMY,
        COLLECT_TROOPS_DATA_V2.showFirstLineTroops,
        COLLECT_TROOPS_DATA_V2.firstLineTroops
      );
    }
  }
  RenderPlayerTroops();
};
collectTroopsScriptByRafsafV2();

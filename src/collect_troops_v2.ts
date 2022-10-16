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

*/ //!
interface TribalWarsUI {
  ErrorMessage: (message: string, showTime: string) => void;
}
interface TribalWarsDialog {
  show: (dialogName: string, dialogHTML: string) => void;
}
interface CollectTroopsDataConfig {
  cache?: boolean;
  cacheTime?: number;
  removedPlayers?: string;
  allowedPlayers?: string;
  firstLineTroops?: string;
  showFirstLineTroops?: boolean;
  showNicknamesTroops?: boolean;
  firstLineDeff?: string;
  showFirstLineDeff?: boolean;
  showNicknamesDeff?: boolean;
  language?: string;
}

interface Config {
  cache: boolean;
  cacheTime: number;
  removedPlayers: string[];
  allowedPlayers: string[];
  showFirstLine: boolean;
  showNicknames: boolean;
  scriptName: string;
  firstLine: string;
  language: string;
  villagesPerPage: number;
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
  SCRIPT_NAME_WITH_AUTHOR: string;
  SCRIPT_HELP: string;
  CONFIG_DISABLED_PLAYERS: string;
  FINAL_SCRAPED_PLAYERS: string;
  ATTENTION_PARTIAL_OR_LACK_OVERVIEW: string;
  GENERATED: string;
  WAIT: string;
  NO_PLAYERS_SELECTOR_ON_PAGE: string;
  CRITICAL_ERROR_HCAPTCHA: string;
}

interface localStorageResult {
  output: string;
  generatedAt: number;
  expiresAt: number;

  tribeName: string;
  finalPlayers: TWPlayer[];
  disabledPlayers: TWPlayer[];
  lackOfAccessPlayers: TWPlayer[];
}

var UI: TribalWarsUI;
var Dialog: TribalWarsDialog;
var COLLECT_TROOPS_DATA_V2: CollectTroopsDataConfig | undefined;
var Data: CollectTroopsDataConfig | undefined;

var CT_EN_MESSAGES_V2: I18nLanguageMessages = {
  GO_TO_TRIBE_MEMBERS_TAB:
    "Error: Go to the Tribe -> Members -> Troops or Defence",
  EMPTY_PLAYERS_TABLE: "Error: Could not get players from current page!",
  SCRIPT_NAME_ARMY: "Army Collection",
  SCRIPT_NAME_DEFF: "Deff Collection",
  SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops_v2 by Rafsaf",
  CONFIG_DISABLED_PLAYERS:
    "Ommited because of script config or complete lack of overview",
  ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
    "Ommited because of partial lack of overview",
  FINAL_SCRAPED_PLAYERS: "Sucessfully collected players",
  GENERATED: "Generated at",
  SCRIPT_HELP: "HELP",
  WAIT: "Wait",
  NO_PLAYERS_SELECTOR_ON_PAGE:
    "Fatal error: Could not find html selector with players, hCaptcha bot protection?",
  CRITICAL_ERROR_HCAPTCHA:
    "Fatal error: No player page table selector, hCaptcha bot protection?",
};
var CT_PL_MESSAGES_V2: I18nLanguageMessages = {
  GO_TO_TRIBE_MEMBERS_TAB:
    "Błąd: Przejdź do Plemię -> Członkowie -> Wojska/Obrona",
  EMPTY_PLAYERS_TABLE: "Błąd: Brak graczy na obecnej stronie!",
  SCRIPT_NAME_ARMY: "Zbiórka Wojska",
  SCRIPT_NAME_DEFF: "Zbiórka Deffa",
  SCRIPT_NAME_WITH_AUTHOR: "Skrypt collect_troops_v2 by Rafsaf",
  CONFIG_DISABLED_PLAYERS:
    "Pominięci przez ustawienia skryptu lub całkowity brak dostępu",
  ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
    "Pominięci przez częściowy dostęp do przeglądu",
  GENERATED: "Wygenerowano",
  FINAL_SCRAPED_PLAYERS: "Pomyślnie zebrany przegląd",
  WAIT: "Czekaj",
  SCRIPT_HELP: "POMOC",
  NO_PLAYERS_SELECTOR_ON_PAGE:
    "Błąd krytyczny: Nie istnieje selektor z listą graczy, ochrona botowa hCaptcha?",
  CRITICAL_ERROR_HCAPTCHA:
    "Błąd krytyczny: Brak tabeli na stronie gracza, ochrona botowa hCaptcha?",
};

var collectTroopsScriptByRafsafV2 = async () => {
  const players: TWPlayer[] = [];
  const lackOfAccessPlayers: TWPlayer[] = [];
  const params = new URLSearchParams(location.search);
  let output: string = "";
  let tribeName: string = "";

  const scriptMode = params.get("mode");
  const scriptModeTroops = () => {
    return scriptMode === "members_troops";
  };
  const scriptModeDefence = () => {
    return scriptMode === "members_defense";
  };
  console.log("dss");

  const userConfig: CollectTroopsDataConfig =
    COLLECT_TROOPS_DATA_V2 ?? undefined ?? Data ?? {};
  const language: string = userConfig.language ?? "pl";
  const I18N: I18nLanguageMessages =
    language === "pl" ? CT_PL_MESSAGES_V2 : CT_EN_MESSAGES_V2;

  const scriptConfig: Config = {
    cache: userConfig.cache ?? true,
    cacheTime: userConfig.cacheTime ?? 5,
    removedPlayers: userConfig.removedPlayers
      ? userConfig.removedPlayers.split(";")
      : [],
    allowedPlayers: userConfig.allowedPlayers
      ? userConfig.allowedPlayers.split(";")
      : [],
    showFirstLine: scriptModeTroops()
      ? userConfig.showFirstLineTroops ?? false
      : userConfig.showFirstLineDeff ?? false,
    showNicknames: scriptModeTroops()
      ? userConfig.showNicknamesTroops ?? false
      : userConfig.showNicknamesDeff ?? false,
    scriptName: scriptModeTroops()
      ? I18N.SCRIPT_NAME_ARMY
      : I18N.SCRIPT_NAME_DEFF,
    firstLine: scriptModeTroops()
      ? userConfig.firstLineTroops ?? ""
      : userConfig.firstLineTroops ?? "",
    villagesPerPage: scriptModeTroops() ? 1000 : 2000,
    language: language,
  };

  console.log("start collectTroopsScriptByRafsafV2 with config:", scriptConfig);

  // Check url location
  if (
    params.get("screen") !== "ally" ||
    (!scriptModeDefence() && !scriptModeTroops())
  ) {
    UI.ErrorMessage(I18N.GO_TO_TRIBE_MEMBERS_TAB, "3000");
    return;
  }

  // Adds players from current html to get array with players nicknames and ids
  const playersTableElement: HTMLSelectElement | null = document.querySelector(
    "#ally_content .input-nicer"
  );
  if (playersTableElement === null) {
    UI.ErrorMessage(I18N.NO_PLAYERS_SELECTOR_ON_PAGE, "4000");
    return;
  }
  for (let playerElement of Array.from(playersTableElement)) {
    if (playerElement.hidden || playerElement instanceof HTMLOptGroupElement) {
      continue;
    }
    players.push({
      id: playerElement.value,
      nick: playerElement.text.trim(),
      disabled: playerElement.disabled,
    });
  }

  if (players.length === 0) {
    UI.ErrorMessage(I18N.EMPTY_PLAYERS_TABLE, "4000");
    return;
  }

  // Get tribe name from current html
  const membersHTMLElement = document.getElementById("content_value");
  if (membersHTMLElement !== null) {
    const tribeH2Element = membersHTMLElement.querySelector("h2");
    if (tribeH2Element !== null) {
      tribeName = tribeH2Element.textContent ?? "";
      const tribeLevelInName = tribeName.indexOf("(");
      if (tribeLevelInName !== -1) {
        tribeName = tribeName.slice(0, tribeLevelInName).trim();
      }
    }
  }

  // Uses some methods to get all stuff from table with units from current html player page
  const AddPlayerPageToOutput = (
    playerPageDocument: HTMLElement,
    player: TWPlayer
  ) => {
    const tableRows = playerPageDocument.querySelectorAll(
      ".table-responsive .vis tr"
    );
    let noAccess = false;
    let playerOutputTroops = "";
    let coord = "";
    let villages = 0;
    if (tableRows.length === 0) {
      throw I18N.CRITICAL_ERROR_HCAPTCHA;
    }
    tableRows.forEach((oneVillageNode, rowIndex) => {
      if (rowIndex === 0) {
        return;
      }
      villages += 1;
      if (output !== "" || playerOutputTroops !== "") {
        playerOutputTroops += "\r\n";
      }

      if (scriptConfig.showNicknames) {
        playerOutputTroops += player.nick + ",";
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
      lackOfAccessPlayers.push(player);
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

  // 1. If cacheTime smaller than actual time, use localStorage output.
  // 3. Loop over players with access.
  // 3.1 Fetch a player page.
  // 3.2 Add his troops to output.
  // 4. Add results to localStorage.
  // 5. Dialog with results.

  async function RenderPlayerTroops() {
    const cacheKey = `collectTroopsScriptByRafsafV2:${scriptMode}`;
    const cacheItem = window.localStorage.getItem(cacheKey);

    let result: localStorageResult;
    let cachedResult: localStorageResult | null = null;
    let notDisabledPlayers: TWPlayer[] = [];
    let finalPlayers: TWPlayer[] = [];
    let disabledPlayers: TWPlayer[] = [];

    if (cacheItem !== null) {
      cachedResult = JSON.parse(cacheItem);
      if (cachedResult !== null) {
        if (
          new Date().getTime() >= cachedResult.expiresAt ||
          !scriptConfig.cache
        ) {
          cachedResult = null;
        }
      }
    }

    if (cachedResult !== null) {
      result = cachedResult;
    } else {
      if (scriptConfig.allowedPlayers.length === 0) {
        notDisabledPlayers = players.filter((player) => {
          return (
            !player.disabled &&
            !scriptConfig.removedPlayers.includes(player.nick)
          );
        });
      } else {
        notDisabledPlayers = players.filter((player) => {
          return (
            !player.disabled &&
            scriptConfig.allowedPlayers.includes(player.nick) &&
            !scriptConfig.removedPlayers.includes(player.nick)
          );
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
      progress.setAttribute("id", "collectTroopsScriptByRafsafV2ProgressBar");
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
          (currentPage - 1) * scriptConfig.villagesPerPage ===
          addedVillages
        ) {
          progress.innerHTML = newProgressBar(playerCounter);
          const response = await fetch(getPlayerURL(player.id, currentPage));
          const html = await response.text();
          const playerPageDocument = ConvertToHTML(html);
          addedVillages += AddPlayerPageToOutput(playerPageDocument, player);
          console.info(
            `${player.nick} page ${currentPage} villages: ${addedVillages}`
          );
          currentPage += 1;
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        playerCounter += 1;
      }
      progress.remove();

      finalPlayers = notDisabledPlayers.filter((player) => {
        return !lackOfAccessPlayers.includes(player);
      });
      disabledPlayers = players.filter((player) => {
        return (
          !lackOfAccessPlayers.includes(player) &&
          !finalPlayers.includes(player)
        );
      });

      result = {
        output: output,
        generatedAt: new Date().getTime(),
        expiresAt: new Date().getTime() + scriptConfig.cacheTime * 60 * 1000,
        tribeName: tribeName,
        finalPlayers: finalPlayers,
        disabledPlayers: disabledPlayers,
        lackOfAccessPlayers: lackOfAccessPlayers,
      };

      if (!scriptConfig.cache) {
        console.log("script cache not enabled, skipping save to localStorage");
      } else {
        try {
          // take up to 1MB of localStorage space, modern browsers have maximum 5MB
          const resultString = JSON.stringify(result);
          const resultSize = new Blob([resultString]).size;
          // result in bytes
          if (resultSize <= 1048576) {
            localStorage.setItem(cacheKey, resultString);
            console.log(
              "result saved to localStorage, size in bytes",
              resultSize
            );
          } else {
            console.warn(
              "size of result in bytes more than 1MB, skipping save in localStorage",
              resultSize
            );
          }
        } catch (error) {
          console.warn(
            "could not save result of script to localStorage",
            error
          );
        }
      }
    }

    Dialog.show(
      "collectTroopsScriptByRafsafV2ResultDialog",
      `
        <h3 style="width:600px;">${scriptConfig.scriptName}: ${
        result.tribeName
      }</h3>
        ${
          result.finalPlayers.length === 0
            ? ``
            : `<h4>${I18N.FINAL_SCRAPED_PLAYERS}:</h4><p>${result.finalPlayers
                .map((player) => {
                  return player.nick;
                })
                .join(";")}</p>`
        }
        ${
          result.disabledPlayers.length === 0
            ? ``
            : `<h4>${
                I18N.CONFIG_DISABLED_PLAYERS
              }:</h4><p>${result.disabledPlayers
                .map((player) => {
                  return player.nick;
                })
                .join(";")}</p>`
        }
        ${
          result.lackOfAccessPlayers.length === 0
            ? ``
            : `<h4>${
                I18N.ATTENTION_PARTIAL_OR_LACK_OVERVIEW
              }:</h4><p>${result.lackOfAccessPlayers
                .map((player) => {
                  return player.nick;
                })
                .join(";")}</p>`
        }
        <textarea rows="15" style="width:95%;margin-top:15px;margin-bottom:25px;">${
          scriptConfig.showFirstLine ? scriptConfig.firstLine + "\r\n" : ""
        }${result.output}</textarea>
        <p style="text-align:right; margin:2px">
        <small>${I18N.SCRIPT_NAME_WITH_AUTHOR}</small>
        <p style="text-align:right; margin:2px">
        <small>${I18N.GENERATED} ${new Date(
        result.generatedAt
      ).toLocaleString()}</small></p>
        <p style="text-align:right; margin:2px">
        <a target="_blank" rel="noopener" href="https://forum.plemiona.pl/index.php?threads/zbi%C3%B3rka-wojska-i-obrony.128630/">${
          I18N.SCRIPT_HELP
        }</a>
        </p>
        `
    );
  }
  await RenderPlayerTroops();
};
collectTroopsScriptByRafsafV2().catch((error) => {
  const progress = document.getElementById(
    "collectTroopsScriptByRafsafV2ProgressBar"
  );
  if (progress !== null) {
    progress.remove();
  }
  UI.ErrorMessage(String(error), "5000");
});

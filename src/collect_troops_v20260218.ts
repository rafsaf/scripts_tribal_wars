/*!
MIT License

Copyright (c) 2022 rafal.safin12@gmail.com
Source https://github.com/rafsaf/scripts_tribal_wars/blob/2026-02-18/src/collect_troops_v20260218.ts

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

Important Notice: Submission License
------------------------------------

By submitting a user-generated modification (script) for use in Tribal Wars,
the creator grants InnoGames a perpetual, irrevocable, worldwide, royalty-free,
non-exclusive license to use, reproduce, distribute, publicly display, modify
and create derivative works based on this modification. This license allows
InnoGames to incorporate modifications into any aspect of the game and related
services, including promotional and commercial activities, without the need
to pay compensation or credit the author. The uploader represents and warrants
that he has the legal right to grant this license and that the modification
does not infringe the rights of any third party.

About
-----

Tool to gather informations about Troops and Defence informations of every
player in the tribe. When clicked, a settings dialog appears where the user
can configure all options. Settings are automatically saved in the browser's
localStorage. After clicking "RUN", the script validates the current page
and proceeds with data collection. It works in both the Army and Defense tabs.

Configuration
-------------

Configuration is done through the built-in settings dialog that appears
when the script is launched. All settings are saved to localStorage and
restored automatically on next use. No external configuration variables
are needed. The language is auto-detected from the game server hostname,
but can be changed manually in the settings.

Available settings:
- Language: ar, cz, de, en, es, fr, gr, hu, it, nl, pl, pt, ro, ru, sk, tr
  (auto-detected from hostname, e.g. plemiona.pl -> pl, tribalwars.net -> en)
- Cache: enable/disable result caching
- Cache time: how long to cache results (in minutes)
- Removed players: nicknames to skip (semicolon separated)
- Allowed players: only collect from these (semicolon separated, empty = all)
- Show nicknames (Troops/Defence): add player name to each line
- Show first line (Troops/Defence): add custom header line
- First line text (Troops/Defence): the custom header text

Usage
-----

Simply add to quickbar:

javascript: $.getScript("official-innogames-cdn-url-where-script-is-hosted"); void 0; 
*/

interface TribalWarsUI {
    ErrorMessage: (message: string, showTime: string) => void;
}
interface TribalWarsDialog {
    show: (dialogName: string, dialogHTML: string) => void;
}
interface CollectTroopsSettingsConfig {
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
    CONFIG_DISABLED_PLAYERS: string;
    EMPTY_RESULT_PLAYERS: string;
    FINAL_SCRAPED_PLAYERS: string;
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: string;
    GENERATED: string;
    WAIT: string;
    NO_PLAYERS_SELECTOR_ON_PAGE: string;
    CRITICAL_ERROR_HCAPTCHA: string;
    SETTINGS_TITLE: string;
    SETTINGS_GENERAL: string;
    SETTINGS_LANGUAGE: string;
    SETTINGS_CACHE: string;
    SETTINGS_CACHE_DESC: string;
    SETTINGS_CACHE_TIME: string;
    SETTINGS_MINUTES: string;
    SETTINGS_REMOVED_PLAYERS: string;
    SETTINGS_REMOVED_PLAYERS_DESC: string;
    SETTINGS_ALLOWED_PLAYERS: string;
    SETTINGS_ALLOWED_PLAYERS_DESC: string;
    SETTINGS_TROOPS_TAB: string;
    SETTINGS_DEFF_TAB: string;
    SETTINGS_SHOW_NICKNAMES: string;
    SETTINGS_SHOW_NICKNAMES_DESC: string;
    SETTINGS_SHOW_FIRST_LINE: string;
    SETTINGS_SHOW_FIRST_LINE_DESC: string;
    SETTINGS_FIRST_LINE: string;
    SETTINGS_RUN: string;
    SETTINGS_RUN_HINT: string;
    SETTINGS_CANCEL: string;
}

interface localStorageResult {
    output: string;
    generatedAt: number;
    expiresAt: number;

    tribeName: string;
    finalPlayers: TWPlayer[];
    disabledPlayers: TWPlayer[];
    lackOfAccessPlayers: TWPlayer[];
    emptyResultPlayers: TWPlayer[];
}

var UI: TribalWarsUI;
var Dialog: TribalWarsDialog;

var CT_EN_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB:
        "Error: Go to the Tribe -> Members -> Troops or Defence",
    EMPTY_PLAYERS_TABLE: "Error: Could not get players from current page!",
    SCRIPT_NAME_ARMY: "Army Collection",
    SCRIPT_NAME_DEFF: "Deff Collection",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 by Rafsaf",
    CONFIG_DISABLED_PLAYERS:
        "Ommited because of script config or complete lack of overview",
    EMPTY_RESULT_PLAYERS: "Ommited because of empty result",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
        "Ommited because of partial lack of overview",
    FINAL_SCRAPED_PLAYERS: "Sucessfully collected players",
    GENERATED: "Generated at",
    WAIT: "Wait",
    NO_PLAYERS_SELECTOR_ON_PAGE:
        "Fatal error: Could not find html selector with players, hCaptcha bot protection?",
    CRITICAL_ERROR_HCAPTCHA:
        "Fatal error: No player page table selector, hCaptcha bot protection?",
    SETTINGS_TITLE: "Collect Troops - Settings",
    SETTINGS_GENERAL: "General settings",
    SETTINGS_LANGUAGE: "Language",
    SETTINGS_CACHE: "Cache",
    SETTINGS_CACHE_DESC: "Enable result caching",
    SETTINGS_CACHE_TIME: "Cache time",
    SETTINGS_MINUTES: "minutes",
    SETTINGS_REMOVED_PLAYERS: "Removed players",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nicknames separated by semicolons",
    SETTINGS_ALLOWED_PLAYERS: "Allowed players",
    SETTINGS_ALLOWED_PLAYERS_DESC:
        "Nicknames separated by semicolons (empty = all)",
    SETTINGS_TROOPS_TAB: "Troops tab settings",
    SETTINGS_DEFF_TAB: "Defence tab settings",
    SETTINGS_SHOW_NICKNAMES: "Show nicknames",
    SETTINGS_SHOW_NICKNAMES_DESC:
        "Add player nickname at the beginning of each line",
    SETTINGS_SHOW_FIRST_LINE: "Show first line",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Add custom first line to output",
    SETTINGS_FIRST_LINE: "First line text",
    SETTINGS_RUN: "▶ RUN",
    SETTINGS_RUN_HINT: "Go to the Tribe -> Members -> Troops or Defence",
    SETTINGS_CANCEL: "Cancel",
};
var CT_PL_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB:
        "Błąd: Przejdź do Plemię -> Członkowie -> Wojska/Obrona",
    EMPTY_PLAYERS_TABLE: "Błąd: Brak graczy na obecnej stronie!",
    SCRIPT_NAME_ARMY: "Zbiórka Wojska",
    SCRIPT_NAME_DEFF: "Zbiórka Deffa",
    SCRIPT_NAME_WITH_AUTHOR: "Skrypt collect_troops V20260218 by Rafsaf",
    CONFIG_DISABLED_PLAYERS:
        "Pominięci przez ustawienia skryptu lub całkowity brak dostępu",
    EMPTY_RESULT_PLAYERS:
        "Pominięci z powodu pustego wyniku zbiórki",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
        "Pominięci przez częściowy dostęp do przeglądu",
    GENERATED: "Wygenerowano",
    FINAL_SCRAPED_PLAYERS: "Pomyślnie zebrany przegląd",
    WAIT: "Czekaj",
    NO_PLAYERS_SELECTOR_ON_PAGE:
        "Błąd krytyczny: Nie istnieje selektor z listą graczy, ochrona botowa hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA:
        "Błąd krytyczny: Brak tabeli na stronie gracza, ochrona botowa hCaptcha?",
    SETTINGS_TITLE: "Zbiórka wojsk - Ustawienia",
    SETTINGS_GENERAL: "Ustawienia ogólne",
    SETTINGS_LANGUAGE: "Język",
    SETTINGS_CACHE: "Pamięć podręczna",
    SETTINGS_CACHE_DESC: "Włącz zapisywanie wyników",
    SETTINGS_CACHE_TIME: "Czas cache",
    SETTINGS_MINUTES: "minut",
    SETTINGS_REMOVED_PLAYERS: "Pominięci gracze",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nicki oddzielone średnikami",
    SETTINGS_ALLOWED_PLAYERS: "Dozwoleni gracze",
    SETTINGS_ALLOWED_PLAYERS_DESC:
        "Nicki oddzielone średnikami (puste = wszyscy)",
    SETTINGS_TROOPS_TAB: "Ustawienia zakładki Wojska",
    SETTINGS_DEFF_TAB: "Ustawienia zakładki Obrona",
    SETTINGS_SHOW_NICKNAMES: "Pokaż nicki",
    SETTINGS_SHOW_NICKNAMES_DESC:
        "Dodaj nick gracza na początku każdej linii",
    SETTINGS_SHOW_FIRST_LINE: "Pokaż pierwszą linię",
    SETTINGS_SHOW_FIRST_LINE_DESC:
        "Dodaj własną pierwszą linię do wyniku",
    SETTINGS_FIRST_LINE: "Tekst pierwszej linii",
    SETTINGS_RUN: "▶ URUCHOM",
    SETTINGS_RUN_HINT: "Przejdź do Plemię -> Członkowie -> Wojska/Obrona",
    SETTINGS_CANCEL: "Anuluj",
};
var CT_DE_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB:
        "Fehler: Gehe zu Stamm -> Mitglieder -> Truppen oder Verteidigung",
    EMPTY_PLAYERS_TABLE:
        "Fehler: Konnte keine Spieler von der aktuellen Seite abrufen!",
    SCRIPT_NAME_ARMY: "Truppensammlung",
    SCRIPT_NAME_DEFF: "Verteidigungssammlung",
    SCRIPT_NAME_WITH_AUTHOR: "Skript collect_troops V20260218 von Rafsaf",
    CONFIG_DISABLED_PLAYERS:
        "Ausgelassen aufgrund der Skripteinstellungen oder vollständigem Mangel an Übersicht",
    EMPTY_RESULT_PLAYERS: "Ausgelassen aufgrund eines leeren Ergebnisses",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
        "Ausgelassen aufgrund teilweiser oder fehlender Übersicht",
    FINAL_SCRAPED_PLAYERS: "Erfolgreich gesammelte Spieler",
    GENERATED: "Generiert am",
    WAIT: "Warten",
    NO_PLAYERS_SELECTOR_ON_PAGE:
        "Kritischer Fehler: Konnte keinen HTML-Selektor mit Spielern finden, hCaptcha Bot-Schutz?",
    CRITICAL_ERROR_HCAPTCHA:
        "Kritischer Fehler: Kein Spielertabellen-Selektor auf der Seite, hCaptcha Bot-Schutz?",
    SETTINGS_TITLE: "Truppensammlung - Einstellungen",
    SETTINGS_GENERAL: "Allgemeine Einstellungen",
    SETTINGS_LANGUAGE: "Sprache",
    SETTINGS_CACHE: "Zwischenspeicher",
    SETTINGS_CACHE_DESC: "Ergebniszwischenspeicherung aktivieren",
    SETTINGS_CACHE_TIME: "Cache-Zeit",
    SETTINGS_MINUTES: "Minuten",
    SETTINGS_REMOVED_PLAYERS: "Entfernte Spieler",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nicknamen durch Semikolons getrennt",
    SETTINGS_ALLOWED_PLAYERS: "Erlaubte Spieler",
    SETTINGS_ALLOWED_PLAYERS_DESC:
        "Nicknamen durch Semikolons getrennt (leer = alle)",
    SETTINGS_TROOPS_TAB: "Truppen-Tab Einstellungen",
    SETTINGS_DEFF_TAB: "Verteidigungs-Tab Einstellungen",
    SETTINGS_SHOW_NICKNAMES: "Nicknamen anzeigen",
    SETTINGS_SHOW_NICKNAMES_DESC:
        "Spielernickname am Anfang jeder Zeile hinzufügen",
    SETTINGS_SHOW_FIRST_LINE: "Erste Zeile anzeigen",
    SETTINGS_SHOW_FIRST_LINE_DESC:
        "Benutzerdefinierte erste Zeile zur Ausgabe hinzufügen",
    SETTINGS_FIRST_LINE: "Text der ersten Zeile",
    SETTINGS_RUN: "▶ STARTEN",
    SETTINGS_RUN_HINT: "Gehe zu Stamm -> Mitglieder -> Truppen oder Verteidigung",
    SETTINGS_CANCEL: "Abbrechen",
};
var CT_CZ_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB:
        "Chyba: Přejděte na Kmen -> Členové -> Vojenské jednotky nebo Obrana",
    EMPTY_PLAYERS_TABLE:
        "Chyba: Nepodařilo se načíst hráče z aktuální stránky!",
    SCRIPT_NAME_ARMY: "Sběr vojsk",
    SCRIPT_NAME_DEFF: "Sběr obrany",
    SCRIPT_NAME_WITH_AUTHOR: "Skript collect_troops V20260218 od Rafsaf",
    CONFIG_DISABLED_PLAYERS:
        "Přeskočeno kvůli nastavení skriptu nebo úplnému nedostatku přehledu",
    EMPTY_RESULT_PLAYERS: "Přeskočeno kvůli prázdnému výsledku",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW:
        "Přeskočeno kvůli částečnému nebo úplnému nedostatku přehledu",
    FINAL_SCRAPED_PLAYERS: "Úspěšně shromáždění hráči",
    GENERATED: "Vygenerováno dne",
    WAIT: "Čekejte",
    NO_PLAYERS_SELECTOR_ON_PAGE:
        "Kritická chyba: Nepodařilo se najít HTML selektor s hráči, ochrana proti botům hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA:
        "Kritická chyba: Na stránce není selektor tabulky hráčů, ochrana proti botům hCaptcha?",
    SETTINGS_TITLE: "Sběr vojsk - Nastavení",
    SETTINGS_GENERAL: "Obecná nastavení",
    SETTINGS_LANGUAGE: "Jazyk",
    SETTINGS_CACHE: "Mezipaměť",
    SETTINGS_CACHE_DESC: "Povolit ukládání výsledků do mezipaměti",
    SETTINGS_CACHE_TIME: "Doba cache",
    SETTINGS_MINUTES: "minut",
    SETTINGS_REMOVED_PLAYERS: "Vynechaní hráči",
    SETTINGS_REMOVED_PLAYERS_DESC: "Přezdívky oddělené středníky",
    SETTINGS_ALLOWED_PLAYERS: "Povolení hráči",
    SETTINGS_ALLOWED_PLAYERS_DESC:
        "Přezdívky oddělené středníky (prázdné = všichni)",
    SETTINGS_TROOPS_TAB: "Nastavení záložky Vojska",
    SETTINGS_DEFF_TAB: "Nastavení záložky Obrana",
    SETTINGS_SHOW_NICKNAMES: "Zobrazit přezdívky",
    SETTINGS_SHOW_NICKNAMES_DESC:
        "Přidat přezdívku hráče na začátek každého řádku",
    SETTINGS_SHOW_FIRST_LINE: "Zobrazit první řádek",
    SETTINGS_SHOW_FIRST_LINE_DESC:
        "Přidat vlastní první řádek k výstupu",
    SETTINGS_FIRST_LINE: "Text prvního řádku",
    SETTINGS_RUN: "▶ SPUSTIT",
    SETTINGS_RUN_HINT: "Přejděte na Kmen -> Členové -> Vojenské jednotky nebo Obrana",
    SETTINGS_CANCEL: "Zrušit",
};
var CT_FR_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Erreur: Allez dans Tribu -> Membres -> Troupes ou Défensif",
    EMPTY_PLAYERS_TABLE: "Erreur: Impossible de récupérer les joueurs de la page actuelle!",
    SCRIPT_NAME_ARMY: "Collecte des troupes",
    SCRIPT_NAME_DEFF: "Collecte de la défense",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 par Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Omis en raison de la configuration du script ou du manque total d'aperçu",
    EMPTY_RESULT_PLAYERS: "Omis en raison d'un résultat vide",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Omis en raison d'un manque partiel d'aperçu",
    FINAL_SCRAPED_PLAYERS: "Joueurs collectés avec succès",
    GENERATED: "Généré le",
    WAIT: "Attendez",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Erreur fatale: Sélecteur HTML des joueurs introuvable, protection hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Erreur fatale: Pas de sélecteur de tableau de joueur, protection hCaptcha?",
    SETTINGS_TITLE: "Collecte des troupes - Paramètres",
    SETTINGS_GENERAL: "Paramètres généraux",
    SETTINGS_LANGUAGE: "Langue",
    SETTINGS_CACHE: "Cache",
    SETTINGS_CACHE_DESC: "Activer la mise en cache des résultats",
    SETTINGS_CACHE_TIME: "Durée du cache",
    SETTINGS_MINUTES: "minutes",
    SETTINGS_REMOVED_PLAYERS: "Joueurs exclus",
    SETTINGS_REMOVED_PLAYERS_DESC: "Pseudos séparés par des points-virgules",
    SETTINGS_ALLOWED_PLAYERS: "Joueurs autorisés",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Pseudos séparés par des points-virgules (vide = tous)",
    SETTINGS_TROOPS_TAB: "Paramètres onglet Troupes",
    SETTINGS_DEFF_TAB: "Paramètres onglet Défense",
    SETTINGS_SHOW_NICKNAMES: "Afficher les pseudos",
    SETTINGS_SHOW_NICKNAMES_DESC: "Ajouter le pseudo du joueur au début de chaque ligne",
    SETTINGS_SHOW_FIRST_LINE: "Afficher la première ligne",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Ajouter une première ligne personnalisée au résultat",
    SETTINGS_FIRST_LINE: "Texte de la première ligne",
    SETTINGS_RUN: "▶ LANCER",
    SETTINGS_RUN_HINT: "Allez dans Tribu -> Membres -> Troupes ou Défensif",
    SETTINGS_CANCEL: "Annuler",
};
var CT_ES_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Error: Ve a Tribu -> Miembros -> Tropas o Defensa",
    EMPTY_PLAYERS_TABLE: "Error: No se pudieron obtener jugadores de la página actual!",
    SCRIPT_NAME_ARMY: "Recolección de tropas",
    SCRIPT_NAME_DEFF: "Recolección de defensa",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 por Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Omitidos por configuración del script o falta total de vista general",
    EMPTY_RESULT_PLAYERS: "Omitidos por resultado vacío",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Omitidos por falta parcial de vista general",
    FINAL_SCRAPED_PLAYERS: "Jugadores recopilados con éxito",
    GENERATED: "Generado el",
    WAIT: "Espera",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Error fatal: No se pudo encontrar el selector HTML de jugadores, protección hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Error fatal: Sin selector de tabla de jugador, protección hCaptcha?",
    SETTINGS_TITLE: "Recolección de tropas - Ajustes",
    SETTINGS_GENERAL: "Ajustes generales",
    SETTINGS_LANGUAGE: "Idioma",
    SETTINGS_CACHE: "Caché",
    SETTINGS_CACHE_DESC: "Activar caché de resultados",
    SETTINGS_CACHE_TIME: "Tiempo de caché",
    SETTINGS_MINUTES: "minutos",
    SETTINGS_REMOVED_PLAYERS: "Jugadores excluidos",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nicks separados por punto y coma",
    SETTINGS_ALLOWED_PLAYERS: "Jugadores permitidos",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Nicks separados por punto y coma (vacío = todos)",
    SETTINGS_TROOPS_TAB: "Ajustes pestaña Tropas",
    SETTINGS_DEFF_TAB: "Ajustes pestaña Defensa",
    SETTINGS_SHOW_NICKNAMES: "Mostrar nicks",
    SETTINGS_SHOW_NICKNAMES_DESC: "Añadir nick del jugador al inicio de cada línea",
    SETTINGS_SHOW_FIRST_LINE: "Mostrar primera línea",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Añadir una primera línea personalizada al resultado",
    SETTINGS_FIRST_LINE: "Texto de la primera línea",
    SETTINGS_RUN: "▶ EJECUTAR",
    SETTINGS_RUN_HINT: "Ve a Tribu -> Miembros -> Tropas o Defensa",
    SETTINGS_CANCEL: "Cancelar",
};
var CT_IT_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Errore: Vai a Tribù -> Membri -> Truppe o Difesa",
    EMPTY_PLAYERS_TABLE: "Errore: Impossibile ottenere giocatori dalla pagina corrente!",
    SCRIPT_NAME_ARMY: "Raccolta truppe",
    SCRIPT_NAME_DEFF: "Raccolta difesa",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 di Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Omessi per configurazione dello script o mancanza totale di panoramica",
    EMPTY_RESULT_PLAYERS: "Omessi per risultato vuoto",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Omessi per mancanza parziale di panoramica",
    FINAL_SCRAPED_PLAYERS: "Giocatori raccolti con successo",
    GENERATED: "Generato il",
    WAIT: "Attendi",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Errore fatale: Impossibile trovare il selettore HTML dei giocatori, protezione hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Errore fatale: Nessun selettore tabella giocatore, protezione hCaptcha?",
    SETTINGS_TITLE: "Raccolta truppe - Impostazioni",
    SETTINGS_GENERAL: "Impostazioni generali",
    SETTINGS_LANGUAGE: "Lingua",
    SETTINGS_CACHE: "Cache",
    SETTINGS_CACHE_DESC: "Abilita la cache dei risultati",
    SETTINGS_CACHE_TIME: "Durata cache",
    SETTINGS_MINUTES: "minuti",
    SETTINGS_REMOVED_PLAYERS: "Giocatori esclusi",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nickname separati da punto e virgola",
    SETTINGS_ALLOWED_PLAYERS: "Giocatori consentiti",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Nickname separati da punto e virgola (vuoto = tutti)",
    SETTINGS_TROOPS_TAB: "Impostazioni scheda Truppe",
    SETTINGS_DEFF_TAB: "Impostazioni scheda Difesa",
    SETTINGS_SHOW_NICKNAMES: "Mostra nickname",
    SETTINGS_SHOW_NICKNAMES_DESC: "Aggiungi il nickname del giocatore all'inizio di ogni riga",
    SETTINGS_SHOW_FIRST_LINE: "Mostra prima riga",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Aggiungi una prima riga personalizzata al risultato",
    SETTINGS_FIRST_LINE: "Testo della prima riga",
    SETTINGS_RUN: "▶ AVVIA",
    SETTINGS_RUN_HINT: "Vai a Tribù -> Membri -> Truppe o Difesa",
    SETTINGS_CANCEL: "Annulla",
};
var CT_PT_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Erro: Vá para Tribo -> Membros -> Tropas ou Defesa",
    EMPTY_PLAYERS_TABLE: "Erro: Não foi possível obter jogadores da página atual!",
    SCRIPT_NAME_ARMY: "Coleta de tropas",
    SCRIPT_NAME_DEFF: "Coleta de defesa",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 por Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Omitidos por configuração do script ou falta total de visão geral",
    EMPTY_RESULT_PLAYERS: "Omitidos por resultado vazio",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Omitidos por falta parcial de visão geral",
    FINAL_SCRAPED_PLAYERS: "Jogadores coletados com sucesso",
    GENERATED: "Gerado em",
    WAIT: "Aguarde",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Erro fatal: Não foi possível encontrar o seletor HTML de jogadores, proteção hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Erro fatal: Sem seletor de tabela de jogador, proteção hCaptcha?",
    SETTINGS_TITLE: "Coleta de tropas - Configurações",
    SETTINGS_GENERAL: "Configurações gerais",
    SETTINGS_LANGUAGE: "Idioma",
    SETTINGS_CACHE: "Cache",
    SETTINGS_CACHE_DESC: "Ativar cache de resultados",
    SETTINGS_CACHE_TIME: "Tempo de cache",
    SETTINGS_MINUTES: "minutos",
    SETTINGS_REMOVED_PLAYERS: "Jogadores excluídos",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nicks separados por ponto e vírgula",
    SETTINGS_ALLOWED_PLAYERS: "Jogadores permitidos",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Nicks separados por ponto e vírgula (vazio = todos)",
    SETTINGS_TROOPS_TAB: "Configurações aba Tropas",
    SETTINGS_DEFF_TAB: "Configurações aba Defesa",
    SETTINGS_SHOW_NICKNAMES: "Mostrar nicks",
    SETTINGS_SHOW_NICKNAMES_DESC: "Adicionar nick do jogador no início de cada linha",
    SETTINGS_SHOW_FIRST_LINE: "Mostrar primeira linha",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Adicionar uma primeira linha personalizada ao resultado",
    SETTINGS_FIRST_LINE: "Texto da primeira linha",
    SETTINGS_RUN: "▶ EXECUTAR",
    SETTINGS_RUN_HINT: "Vá para Tribo -> Membros -> Tropas ou Defesa",
    SETTINGS_CANCEL: "Cancelar",
};
var CT_NL_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Fout: Ga naar Stam -> Leden -> Troepen of Verdediging",
    EMPTY_PLAYERS_TABLE: "Fout: Kon geen spelers ophalen van de huidige pagina!",
    SCRIPT_NAME_ARMY: "Troepenverzameling",
    SCRIPT_NAME_DEFF: "Verdedigingsverzameling",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 door Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Overgeslagen vanwege scriptconfiguratie of volledig gebrek aan overzicht",
    EMPTY_RESULT_PLAYERS: "Overgeslagen vanwege leeg resultaat",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Overgeslagen vanwege gedeeltelijk gebrek aan overzicht",
    FINAL_SCRAPED_PLAYERS: "Succesvol verzamelde spelers",
    GENERATED: "Gegenereerd op",
    WAIT: "Wacht",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Fatale fout: Kon HTML-selector met spelers niet vinden, hCaptcha botbescherming?",
    CRITICAL_ERROR_HCAPTCHA: "Fatale fout: Geen spelerstabelselector op de pagina, hCaptcha botbescherming?",
    SETTINGS_TITLE: "Troepenverzameling - Instellingen",
    SETTINGS_GENERAL: "Algemene instellingen",
    SETTINGS_LANGUAGE: "Taal",
    SETTINGS_CACHE: "Cache",
    SETTINGS_CACHE_DESC: "Resultaatcaching inschakelen",
    SETTINGS_CACHE_TIME: "Cachetijd",
    SETTINGS_MINUTES: "minuten",
    SETTINGS_REMOVED_PLAYERS: "Uitgesloten spelers",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nicknames gescheiden door puntkomma's",
    SETTINGS_ALLOWED_PLAYERS: "Toegestane spelers",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Nicknames gescheiden door puntkomma's (leeg = allen)",
    SETTINGS_TROOPS_TAB: "Troepen tabblad instellingen",
    SETTINGS_DEFF_TAB: "Verdediging tabblad instellingen",
    SETTINGS_SHOW_NICKNAMES: "Toon nicknames",
    SETTINGS_SHOW_NICKNAMES_DESC: "Voeg spelernickname toe aan het begin van elke regel",
    SETTINGS_SHOW_FIRST_LINE: "Toon eerste regel",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Aangepaste eerste regel toevoegen aan resultaat",
    SETTINGS_FIRST_LINE: "Tekst eerste regel",
    SETTINGS_RUN: "▶ STARTEN",
    SETTINGS_RUN_HINT: "Ga naar Stam -> Leden -> Troepen of Verdediging",
    SETTINGS_CANCEL: "Annuleren",
};
var CT_RO_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Eroare: Mergeți la Trib -> Membri -> Trupe sau Apărare",
    EMPTY_PLAYERS_TABLE: "Eroare: Nu s-au putut obține jucători de pe pagina curentă!",
    SCRIPT_NAME_ARMY: "Colectare trupe",
    SCRIPT_NAME_DEFF: "Colectare apărare",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 de Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Omiși din cauza configurării scriptului sau lipsei totale de prezentare generală",
    EMPTY_RESULT_PLAYERS: "Omiși din cauza rezultatului gol",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Omiși din cauza lipsei parțiale de prezentare generală",
    FINAL_SCRAPED_PLAYERS: "Jucători colectați cu succes",
    GENERATED: "Generat la",
    WAIT: "Așteptați",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Eroare fatală: Nu s-a putut găsi selectorul HTML cu jucători, protecție hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Eroare fatală: Lipsă selector tabel jucător, protecție hCaptcha?",
    SETTINGS_TITLE: "Colectare trupe - Setări",
    SETTINGS_GENERAL: "Setări generale",
    SETTINGS_LANGUAGE: "Limbă",
    SETTINGS_CACHE: "Cache",
    SETTINGS_CACHE_DESC: "Activare cache rezultate",
    SETTINGS_CACHE_TIME: "Timp cache",
    SETTINGS_MINUTES: "minute",
    SETTINGS_REMOVED_PLAYERS: "Jucători excluși",
    SETTINGS_REMOVED_PLAYERS_DESC: "Nickname-uri separate prin punct și virgulă",
    SETTINGS_ALLOWED_PLAYERS: "Jucători permiși",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Nickname-uri separate prin punct și virgulă (gol = toți)",
    SETTINGS_TROOPS_TAB: "Setări tab Trupe",
    SETTINGS_DEFF_TAB: "Setări tab Apărare",
    SETTINGS_SHOW_NICKNAMES: "Afișare nickname-uri",
    SETTINGS_SHOW_NICKNAMES_DESC: "Adaugă nickname-ul jucătorului la începutul fiecărei linii",
    SETTINGS_SHOW_FIRST_LINE: "Afișare prima linie",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Adaugă o primă linie personalizată la rezultat",
    SETTINGS_FIRST_LINE: "Textul primei linii",
    SETTINGS_RUN: "▶ PORNIRE",
    SETTINGS_RUN_HINT: "Mergeți la Trib -> Membri -> Trupe sau Apărare",
    SETTINGS_CANCEL: "Anulare",
};
var CT_HU_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Hiba: Menj a Klán -> Tagok -> Csapatok vagy Védekezés oldalra",
    EMPTY_PLAYERS_TABLE: "Hiba: Nem sikerült játékosokat lekérni az aktuális oldalról!",
    SCRIPT_NAME_ARMY: "Csapatgyűjtés",
    SCRIPT_NAME_DEFF: "Védelemgyűjtés",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 készítette Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Kihagyva a script beállítások vagy a teljes áttekintés hiánya miatt",
    EMPTY_RESULT_PLAYERS: "Kihagyva üres eredmény miatt",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Kihagyva részleges áttekintés hiánya miatt",
    FINAL_SCRAPED_PLAYERS: "Sikeresen összegyűjtött játékosok",
    GENERATED: "Generálva",
    WAIT: "Várjon",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Kritikus hiba: Nem található HTML szelektor játékosokkal, hCaptcha botvédelem?",
    CRITICAL_ERROR_HCAPTCHA: "Kritikus hiba: Nincs játékos tábla szelektor, hCaptcha botvédelem?",
    SETTINGS_TITLE: "Csapatgyűjtés - Beállítások",
    SETTINGS_GENERAL: "Általános beállítások",
    SETTINGS_LANGUAGE: "Nyelv",
    SETTINGS_CACHE: "Gyorsítótár",
    SETTINGS_CACHE_DESC: "Eredmény gyorsítótárazás engedélyezése",
    SETTINGS_CACHE_TIME: "Gyorsítótár idő",
    SETTINGS_MINUTES: "perc",
    SETTINGS_REMOVED_PLAYERS: "Kizárt játékosok",
    SETTINGS_REMOVED_PLAYERS_DESC: "Becenév pontosvesszővel elválasztva",
    SETTINGS_ALLOWED_PLAYERS: "Engedélyezett játékosok",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Becenév pontosvesszővel elválasztva (üres = mind)",
    SETTINGS_TROOPS_TAB: "Csapatok fül beállítások",
    SETTINGS_DEFF_TAB: "Védelem fül beállítások",
    SETTINGS_SHOW_NICKNAMES: "Becenév megjelenítése",
    SETTINGS_SHOW_NICKNAMES_DESC: "Játékos becenevének hozzáadása minden sor elejéhez",
    SETTINGS_SHOW_FIRST_LINE: "Első sor megjelenítése",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Egyéni első sor hozzáadása az eredményhez",
    SETTINGS_FIRST_LINE: "Első sor szövege",
    SETTINGS_RUN: "▶ INDÍTÁS",
    SETTINGS_RUN_HINT: "Menj a Klán -> Tagok -> Csapatok vagy Védekezés oldalra",
    SETTINGS_CANCEL: "Mégse",
};
var CT_SK_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Chyba: Prejdite na Kmeň -> Členovia -> Vojenské jednotky alebo Obrana",
    EMPTY_PLAYERS_TABLE: "Chyba: Nepodarilo sa načítať hráčov z aktuálnej stránky!",
    SCRIPT_NAME_ARMY: "Zber vojsk",
    SCRIPT_NAME_DEFF: "Zber obrany",
    SCRIPT_NAME_WITH_AUTHOR: "Skript collect_troops V20260218 od Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Vynechaní kvôli nastaveniu skriptu alebo úplnému nedostatku prehľadu",
    EMPTY_RESULT_PLAYERS: "Vynechaní kvôli prázdnemu výsledku",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Vynechaní kvôli čiastočnému nedostatku prehľadu",
    FINAL_SCRAPED_PLAYERS: "Úspešne zhromaždení hráči",
    GENERATED: "Vygenerované dňa",
    WAIT: "Čakajte",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Kritická chyba: Nepodarilo sa nájsť HTML selektor s hráčmi, ochrana proti botom hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Kritická chyba: Na stránke nie je selektor tabuľky hráčov, ochrana proti botom hCaptcha?",
    SETTINGS_TITLE: "Zber vojsk - Nastavenia",
    SETTINGS_GENERAL: "Všeobecné nastavenia",
    SETTINGS_LANGUAGE: "Jazyk",
    SETTINGS_CACHE: "Vyrovnávacia pamäť",
    SETTINGS_CACHE_DESC: "Povoliť ukladanie výsledkov do vyrovnávacej pamäte",
    SETTINGS_CACHE_TIME: "Doba cache",
    SETTINGS_MINUTES: "minút",
    SETTINGS_REMOVED_PLAYERS: "Vynechaní hráči",
    SETTINGS_REMOVED_PLAYERS_DESC: "Prezvívky oddelené bodkočiarkou",
    SETTINGS_ALLOWED_PLAYERS: "Povolení hráči",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Prezvívky oddelené bodkočiarkou (prázdne = všetci)",
    SETTINGS_TROOPS_TAB: "Nastavenia záložky Vojská",
    SETTINGS_DEFF_TAB: "Nastavenia záložky Obrana",
    SETTINGS_SHOW_NICKNAMES: "Zobraziť prezvívky",
    SETTINGS_SHOW_NICKNAMES_DESC: "Pridať prezvívku hráča na začiatok každého riadku",
    SETTINGS_SHOW_FIRST_LINE: "Zobraziť prvý riadok",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Pridať vlastný prvý riadok k výstupu",
    SETTINGS_FIRST_LINE: "Text prvého riadku",
    SETTINGS_RUN: "▶ SPUSTIŤ",
    SETTINGS_RUN_HINT: "Prejdite na Kmeň -> Členovia -> Vojenské jednotky alebo Obrana",
    SETTINGS_CANCEL: "Zrušiť",
};
var CT_RU_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Ошибка: Перейдите в Племя -> Участники -> Войска или Защита",
    EMPTY_PLAYERS_TABLE: "Ошибка: Не удалось получить игроков с текущей страницы!",
    SCRIPT_NAME_ARMY: "Сбор войск",
    SCRIPT_NAME_DEFF: "Сбор обороны",
    SCRIPT_NAME_WITH_AUTHOR: "Скрипт collect_troops V20260218 от Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Пропущены из-за настроек скрипта или полного отсутствия обзора",
    EMPTY_RESULT_PLAYERS: "Пропущены из-за пустого результата",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Пропущены из-за частичного отсутствия обзора",
    FINAL_SCRAPED_PLAYERS: "Успешно собранные игроки",
    GENERATED: "Сгенерировано",
    WAIT: "Подождите",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Критическая ошибка: Не удалось найти HTML-селектор с игроками, защита hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Критическая ошибка: Отсутствует селектор таблицы игрока, защита hCaptcha?",
    SETTINGS_TITLE: "Сбор войск - Настройки",
    SETTINGS_GENERAL: "Общие настройки",
    SETTINGS_LANGUAGE: "Язык",
    SETTINGS_CACHE: "Кэш",
    SETTINGS_CACHE_DESC: "Включить кэширование результатов",
    SETTINGS_CACHE_TIME: "Время кэша",
    SETTINGS_MINUTES: "минут",
    SETTINGS_REMOVED_PLAYERS: "Исключённые игроки",
    SETTINGS_REMOVED_PLAYERS_DESC: "Ники через точку с запятой",
    SETTINGS_ALLOWED_PLAYERS: "Разрешённые игроки",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Ники через точку с запятой (пусто = все)",
    SETTINGS_TROOPS_TAB: "Настройки вкладки Войска",
    SETTINGS_DEFF_TAB: "Настройки вкладки Оборона",
    SETTINGS_SHOW_NICKNAMES: "Показывать ники",
    SETTINGS_SHOW_NICKNAMES_DESC: "Добавить ник игрока в начало каждой строки",
    SETTINGS_SHOW_FIRST_LINE: "Показывать первую строку",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Добавить пользовательскую первую строку к результату",
    SETTINGS_FIRST_LINE: "Текст первой строки",
    SETTINGS_RUN: "▶ ЗАПУСК",
    SETTINGS_RUN_HINT: "Перейдите в Племя -> Участники -> Войска или Защита",
    SETTINGS_CANCEL: "Отмена",
};
var CT_TR_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Hata: Klan -> Üyeler -> Birlikler veya Savunma'ya gidin",
    EMPTY_PLAYERS_TABLE: "Hata: Mevcut sayfadan oyuncular alınamadı!",
    SCRIPT_NAME_ARMY: "Birlik Toplama",
    SCRIPT_NAME_DEFF: "Savunma Toplama",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 Rafsaf tarafından",
    CONFIG_DISABLED_PLAYERS: "Script ayarları veya genel bakış eksikliği nedeniyle atlandı",
    EMPTY_RESULT_PLAYERS: "Boş sonuç nedeniyle atlandı",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Kısmi genel bakış eksikliği nedeniyle atlandı",
    FINAL_SCRAPED_PLAYERS: "Başarıyla toplanan oyuncular",
    GENERATED: "Oluşturulma tarihi",
    WAIT: "Bekleyin",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Kritik hata: Oyuncuları içeren HTML seçici bulunamadı, hCaptcha bot koruması?",
    CRITICAL_ERROR_HCAPTCHA: "Kritik hata: Oyuncu tablo seçicisi bulunamadı, hCaptcha bot koruması?",
    SETTINGS_TITLE: "Birlik Toplama - Ayarlar",
    SETTINGS_GENERAL: "Genel ayarlar",
    SETTINGS_LANGUAGE: "Dil",
    SETTINGS_CACHE: "Önbellek",
    SETTINGS_CACHE_DESC: "Sonuç önbelleklemeyi etkinleştir",
    SETTINGS_CACHE_TIME: "Önbellek süresi",
    SETTINGS_MINUTES: "dakika",
    SETTINGS_REMOVED_PLAYERS: "Hariç tutulan oyuncular",
    SETTINGS_REMOVED_PLAYERS_DESC: "Noktalı virgülle ayrılmış takma adlar",
    SETTINGS_ALLOWED_PLAYERS: "İzin verilen oyuncular",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Noktalı virgülle ayrılmış takma adlar (boş = tümü)",
    SETTINGS_TROOPS_TAB: "Birlikler sekmesi ayarları",
    SETTINGS_DEFF_TAB: "Savunma sekmesi ayarları",
    SETTINGS_SHOW_NICKNAMES: "Takma adları göster",
    SETTINGS_SHOW_NICKNAMES_DESC: "Her satırın başına oyuncu takma adını ekle",
    SETTINGS_SHOW_FIRST_LINE: "İlk satırı göster",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Sonuca özel ilk satır ekle",
    SETTINGS_FIRST_LINE: "İlk satır metni",
    SETTINGS_RUN: "▶ ÇALIŞTIR",
    SETTINGS_RUN_HINT: "Klan -> Üyeler -> Birlikler veya Savunma'ya gidin",
    SETTINGS_CANCEL: "İptal",
};
var CT_GR_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "Σφάλμα: Πηγαίνετε στη Φυλή -> Μέλη -> Στρατεύματα ή Άμυνα",
    EMPTY_PLAYERS_TABLE: "Σφάλμα: Δεν ήταν δυνατή η λήψη παικτών από την τρέχουσα σελίδα!",
    SCRIPT_NAME_ARMY: "Συλλογή στρατευμάτων",
    SCRIPT_NAME_DEFF: "Συλλογή άμυνας",
    SCRIPT_NAME_WITH_AUTHOR: "Script collect_troops V20260218 από Rafsaf",
    CONFIG_DISABLED_PLAYERS: "Παραλείφθηκαν λόγω ρυθμίσεων σκριπτ ή πλήρους έλλειψης επισκόπησης",
    EMPTY_RESULT_PLAYERS: "Παραλείφθηκαν λόγω κενού αποτελέσματος",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "Παραλείφθηκαν λόγω μερικής έλλειψης επισκόπησης",
    FINAL_SCRAPED_PLAYERS: "Επιτυχώς συλλεγμένοι παίκτες",
    GENERATED: "Δημιουργήθηκε",
    WAIT: "Περιμένετε",
    NO_PLAYERS_SELECTOR_ON_PAGE: "Κρίσιμο σφάλμα: Δεν βρέθηκε HTML selector με παίκτες, προστασία hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "Κρίσιμο σφάλμα: Δεν υπάρχει selector πίνακα παικτών, προστασία hCaptcha?",
    SETTINGS_TITLE: "Συλλογή στρατευμάτων - Ρυθμίσεις",
    SETTINGS_GENERAL: "Γενικές ρυθμίσεις",
    SETTINGS_LANGUAGE: "Γλώσσα",
    SETTINGS_CACHE: "Cache",
    SETTINGS_CACHE_DESC: "Ενεργοποίηση προσωρινής αποθήκευσης αποτελεσμάτων",
    SETTINGS_CACHE_TIME: "Χρόνος cache",
    SETTINGS_MINUTES: "λεπτά",
    SETTINGS_REMOVED_PLAYERS: "Εξαιρεθέντες παίκτες",
    SETTINGS_REMOVED_PLAYERS_DESC: "Ψευδώνυμα χωρισμένα με ερωτηματικό",
    SETTINGS_ALLOWED_PLAYERS: "Επιτρεπόμενοι παίκτες",
    SETTINGS_ALLOWED_PLAYERS_DESC: "Ψευδώνυμα χωρισμένα με ερωτηματικό (κενό = όλοι)",
    SETTINGS_TROOPS_TAB: "Ρυθμίσεις καρτέλας Στρατεύματα",
    SETTINGS_DEFF_TAB: "Ρυθμίσεις καρτέλας Άμυνα",
    SETTINGS_SHOW_NICKNAMES: "Εμφάνιση ψευδωνύμων",
    SETTINGS_SHOW_NICKNAMES_DESC: "Προσθήκη ψευδωνύμου παίκτη στην αρχή κάθε γραμμής",
    SETTINGS_SHOW_FIRST_LINE: "Εμφάνιση πρώτης γραμμής",
    SETTINGS_SHOW_FIRST_LINE_DESC: "Προσθήκη προσαρμοσμένης πρώτης γραμμής στο αποτέλεσμα",
    SETTINGS_FIRST_LINE: "Κείμενο πρώτης γραμμής",
    SETTINGS_RUN: "▶ ΕΚΚΙΝΗΣΗ",
    SETTINGS_RUN_HINT: "Πηγαίνετε στη Φυλή -> Μέλη -> Στρατεύματα ή Άμυνα",
    SETTINGS_CANCEL: "Ακύρωση",
};
var CT_AR_MESSAGES_V20260218: I18nLanguageMessages = {
    GO_TO_TRIBE_MEMBERS_TAB: "خطأ: اذهب إلى القبيلة -> الاعضاء -> الجيوش أو الدفاع",
    EMPTY_PLAYERS_TABLE: "خطأ: لا يمكن الحصول على اللاعبين من الصفحة الحالية!",
    SCRIPT_NAME_ARMY: "جمع القوات",
    SCRIPT_NAME_DEFF: "جمع الدفاع",
    SCRIPT_NAME_WITH_AUTHOR: "سكريبت collect_troops V20260218 بواسطة Rafsaf",
    CONFIG_DISABLED_PLAYERS: "تم تخطيهم بسبب إعدادات السكريبت أو النقص الكامل في النظرة العامة",
    EMPTY_RESULT_PLAYERS: "تم تخطيهم بسبب نتيجة فارغة",
    ATTENTION_PARTIAL_OR_LACK_OVERVIEW: "تم تخطيهم بسبب نقص جزئي في النظرة العامة",
    FINAL_SCRAPED_PLAYERS: "تم جمع اللاعبين بنجاح",
    GENERATED: "تم الإنشاء في",
    WAIT: "انتظر",
    NO_PLAYERS_SELECTOR_ON_PAGE: "خطأ فادح: لا يمكن العثور على محدد HTML للاعبين، حماية hCaptcha?",
    CRITICAL_ERROR_HCAPTCHA: "خطأ فادح: لا يوجد محدد جدول اللاعبين، حماية hCaptcha?",
    SETTINGS_TITLE: "جمع القوات - الإعدادات",
    SETTINGS_GENERAL: "الإعدادات العامة",
    SETTINGS_LANGUAGE: "اللغة",
    SETTINGS_CACHE: "ذاكرة مؤقتة",
    SETTINGS_CACHE_DESC: "تفعيل تخزين النتائج مؤقتاً",
    SETTINGS_CACHE_TIME: "مدة التخزين",
    SETTINGS_MINUTES: "دقائق",
    SETTINGS_REMOVED_PLAYERS: "لاعبون مستبعدون",
    SETTINGS_REMOVED_PLAYERS_DESC: "أسماء مستعارة مفصولة بفاصلة منقوطة",
    SETTINGS_ALLOWED_PLAYERS: "لاعبون مسموح بهم",
    SETTINGS_ALLOWED_PLAYERS_DESC: "أسماء مستعارة مفصولة بفاصلة منقوطة (فارغ = الكل)",
    SETTINGS_TROOPS_TAB: "إعدادات تبويب القوات",
    SETTINGS_DEFF_TAB: "إعدادات تبويب الدفاع",
    SETTINGS_SHOW_NICKNAMES: "إظهار الأسماء المستعارة",
    SETTINGS_SHOW_NICKNAMES_DESC: "إضافة اسم اللاعب في بداية كل سطر",
    SETTINGS_SHOW_FIRST_LINE: "إظهار السطر الأول",
    SETTINGS_SHOW_FIRST_LINE_DESC: "إضافة سطر أول مخصص إلى النتيجة",
    SETTINGS_FIRST_LINE: "نص السطر الأول",
    SETTINGS_RUN: "▶ تشغيل",
    SETTINGS_RUN_HINT: "اذهب إلى القبيلة -> الاعضاء -> الجيوش أو الدفاع",
    SETTINGS_CANCEL: "إلغاء",
};

var CT_LANGUAGE_MESSAGES_V20260218: Record<string, I18nLanguageMessages> = {
    pl: CT_PL_MESSAGES_V20260218,
    en: CT_EN_MESSAGES_V20260218,
    de: CT_DE_MESSAGES_V20260218,
    cz: CT_CZ_MESSAGES_V20260218,
    fr: CT_FR_MESSAGES_V20260218,
    es: CT_ES_MESSAGES_V20260218,
    it: CT_IT_MESSAGES_V20260218,
    pt: CT_PT_MESSAGES_V20260218,
    nl: CT_NL_MESSAGES_V20260218,
    ro: CT_RO_MESSAGES_V20260218,
    hu: CT_HU_MESSAGES_V20260218,
    sk: CT_SK_MESSAGES_V20260218,
    ru: CT_RU_MESSAGES_V20260218,
    tr: CT_TR_MESSAGES_V20260218,
    gr: CT_GR_MESSAGES_V20260218,
    ar: CT_AR_MESSAGES_V20260218,
};

// Hostname -> script language mapping for all 28 Tribal Wars market versions
// Source: portal bar language selector on plemiona.pl (pb-lang-sec-options)
var CT_HOSTNAME_LANGUAGE_MAP_V20260218: Record<string, string> = {
    // Polish
    "plemiona.pl": "pl",
    // German
    "die-staemme.de": "de",
    // Swiss German -> de
    "staemme.ch": "de",
    // Czech
    "divokekmeny.cz": "cz",
    // Slovak
    "divoke-kmene.sk": "sk",
    // English (International)
    "tribalwars.net": "en",
    // English (UK)
    "tribalwars.co.uk": "en",
    // English (US)
    "tribalwars.us": "en",
    // English (Norwegian - redirects to English)
    "tribalwars.com": "en",
    // English (Danish - redirects to English)
    "tribalwars.dk": "en",
    // Dutch
    "tribalwars.nl": "nl",
    // English (Swedish - redirects to English)
    "tribalwars.se": "en",
    // French
    "guerretribale.fr": "fr",
    // Spanish
    "guerrastribales.es": "es",
    // Italian
    "tribals.it": "it",
    // Portuguese (Brazil)
    "tribalwars.com.br": "pt",
    // Portuguese (Portugal)
    "tribalwars.com.pt": "pt",
    // Romanian
    "triburile.ro": "ro",
    // Greek
    "fyletikesmaxes.gr": "gr",
    // Hungarian
    "klanhaboru.hu": "hu",
    // Russian
    "voynaplemyon.com": "ru",
    // Turkish
    "klanlar.org": "tr",
    // Arabic
    "tribalwars.ae": "ar",
    // English (Thai - redirects to English)
    "tribalwars.asia": "en",
    // English (Croatian - redirects to English)
    "plemena.com": "en",
    // English (Slovenian - redirects to English)
    "vojnaplemen.si": "en",
    // Russian (Ukrainian subdomain -> voynaplemyon.com)
    "ua.tribalwars.net": "ru",
    // Public Beta
    "tribalwars.works": "en",
};

// Detect language from current hostname by matching against known TW domains
var detectLanguageFromHostname = (): string => {
    const hostname = window.location.hostname.replace(/^www\./, "");
    // Try exact match first
    if (CT_HOSTNAME_LANGUAGE_MAP_V20260218[hostname]) {
        return CT_HOSTNAME_LANGUAGE_MAP_V20260218[hostname];
    }
    // Try matching by endsWith, longest domain first to prefer
    // more specific matches (e.g. ua.tribalwars.net over tribalwars.net)
    var sortedDomains = Object.keys(CT_HOSTNAME_LANGUAGE_MAP_V20260218).sort(
        function (a, b) {
            return b.length - a.length;
        }
    );
    for (var i = 0; i < sortedDomains.length; i++) {
        if (hostname.endsWith("." + sortedDomains[i])) {
            return CT_HOSTNAME_LANGUAGE_MAP_V20260218[sortedDomains[i]];
        }
    }
    return "en";
};

var collectTroopsScriptByRafsafV20260218 = async () => {
    const SETTINGS_STORAGE_KEY = "collectTroopsSettingsV20260218";

    // Detect default language from hostname
    const detectedLanguage = detectLanguageFromHostname();
    console.log("detected language from hostname:", detectedLanguage, "hostname:", window.location.hostname);

    // Load saved settings from localStorage, using detected language as default
    const loadSettings = (): CollectTroopsSettingsConfig => {
        try {
            const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn("Could not load saved settings:", e);
        }
        return { language: detectedLanguage };
    };

    // Save settings to localStorage
    const saveSettings = (config: CollectTroopsSettingsConfig): void => {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(config));
        } catch (e) {
            console.warn("Could not save settings:", e);
        }
    };

    // Read current form values from the settings dialog
    const readFormValues = (): CollectTroopsSettingsConfig => {
        const getVal = (id: string) =>
            (document.getElementById(id) as HTMLInputElement)?.value ?? "";
        const getChecked = (id: string) =>
            (document.getElementById(id) as HTMLInputElement)?.checked ?? false;
        return {
            language:
                (document.getElementById("ct_s_language") as HTMLSelectElement)
                    ?.value ?? detectedLanguage,
            cache: getChecked("ct_s_cache"),
            cacheTime: parseInt(getVal("ct_s_cache_time")) || 5,
            removedPlayers: getVal("ct_s_removed_players"),
            allowedPlayers: getVal("ct_s_allowed_players"),
            showNicknamesTroops: getChecked("ct_s_nick_troops"),
            showFirstLineTroops: getChecked("ct_s_fl_troops"),
            firstLineTroops: getVal("ct_s_fl_text_troops"),
            showNicknamesDeff: getChecked("ct_s_nick_deff"),
            showFirstLineDeff: getChecked("ct_s_fl_deff"),
            firstLineDeff: getVal("ct_s_fl_text_deff"),
        };
    };

    // Apply config values to form elements
    const applyFormValues = (config: CollectTroopsSettingsConfig): void => {
        const setVal = (id: string, val: string) => {
            const el = document.getElementById(id) as HTMLInputElement;
            if (el) el.value = val;
        };
        const setChecked = (id: string, val: boolean) => {
            const el = document.getElementById(id) as HTMLInputElement;
            if (el) el.checked = val;
        };
        const langEl = document.getElementById(
            "ct_s_language"
        ) as HTMLSelectElement;
        if (langEl) langEl.value = config.language ?? detectedLanguage;
        setChecked("ct_s_cache", config.cache ?? true);
        setVal("ct_s_cache_time", String(config.cacheTime ?? 5));
        setVal("ct_s_removed_players", config.removedPlayers ?? "");
        setVal("ct_s_allowed_players", config.allowedPlayers ?? "");
        setChecked("ct_s_nick_troops", config.showNicknamesTroops ?? false);
        setChecked("ct_s_fl_troops", config.showFirstLineTroops ?? false);
        setVal("ct_s_fl_text_troops", config.firstLineTroops ?? "");
        setChecked("ct_s_nick_deff", config.showNicknamesDeff ?? false);
        setChecked("ct_s_fl_deff", config.showFirstLineDeff ?? false);
        setVal("ct_s_fl_text_deff", config.firstLineDeff ?? "");
    };

    // Generate settings dialog HTML for given language
    const buildSettingsHTML = (I18N: I18nLanguageMessages): string => {
        const langOptions = [
            { value: "ar", label: "العربية" },
            { value: "cz", label: "Čeština" },
            { value: "de", label: "Deutsch" },
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "fr", label: "Français" },
            { value: "it", label: "Italiano" },
            { value: "hu", label: "Magyar" },
            { value: "nl", label: "Nederlands" },
            { value: "pl", label: "Polski" },
            { value: "pt", label: "Português" },
            { value: "ro", label: "Română" },
            { value: "ru", label: "Русский" },
            { value: "sk", label: "Slovenčina" },
            { value: "tr", label: "Türkçe" },
            { value: "gr", label: "Ελληνικά" },
        ]
            .map((l) => `<option value="${l.value}">${l.label}</option>`)
            .join("");

        return `
      <h3 style="margin:0 0 10px 0;">${I18N.SETTINGS_TITLE}</h3>
      <table class="vis settings" width="100%">
        <tbody>
          <tr><th colspan="2">${I18N.SETTINGS_GENERAL}</th></tr>
          <tr>
            <td>${I18N.SETTINGS_LANGUAGE}:</td>
            <td>
              <select id="ct_s_language" data-ddg-inputtype="unknown">
                ${langOptions}
              </select>
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_CACHE}:</td>
            <td>
              <label>
                <input type="checkbox" id="ct_s_cache" checked>
                ${I18N.SETTINGS_CACHE_DESC}
              </label>
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_CACHE_TIME}:</td>
            <td>
              <input type="text" id="ct_s_cache_time" size="4" maxlength="4" value="5" data-ddg-inputtype="unknown">
              ${I18N.SETTINGS_MINUTES}
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_REMOVED_PLAYERS}:</td>
            <td>
              <input type="text" id="ct_s_removed_players" size="40" value="" data-ddg-inputtype="unknown"
                placeholder="${I18N.SETTINGS_REMOVED_PLAYERS_DESC}">
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_ALLOWED_PLAYERS}:</td>
            <td>
              <input type="text" id="ct_s_allowed_players" size="40" value="" data-ddg-inputtype="unknown"
                placeholder="${I18N.SETTINGS_ALLOWED_PLAYERS_DESC}">
            </td>
          </tr>

          <tr><th colspan="2">${I18N.SETTINGS_TROOPS_TAB}</th></tr>
          <tr>
            <td>${I18N.SETTINGS_SHOW_NICKNAMES}:</td>
            <td>
              <label>
                <input type="checkbox" id="ct_s_nick_troops">
                ${I18N.SETTINGS_SHOW_NICKNAMES_DESC}
              </label>
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_SHOW_FIRST_LINE}:</td>
            <td>
              <label>
                <input type="checkbox" id="ct_s_fl_troops">
                ${I18N.SETTINGS_SHOW_FIRST_LINE_DESC}
              </label>
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_FIRST_LINE}:</td>
            <td>
              <input type="text" id="ct_s_fl_text_troops" size="40" value="" data-ddg-inputtype="unknown">
            </td>
          </tr>

          <tr><th colspan="2">${I18N.SETTINGS_DEFF_TAB}</th></tr>
          <tr>
            <td>${I18N.SETTINGS_SHOW_NICKNAMES}:</td>
            <td>
              <label>
                <input type="checkbox" id="ct_s_nick_deff">
                ${I18N.SETTINGS_SHOW_NICKNAMES_DESC}
              </label>
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_SHOW_FIRST_LINE}:</td>
            <td>
              <label>
                <input type="checkbox" id="ct_s_fl_deff">
                ${I18N.SETTINGS_SHOW_FIRST_LINE_DESC}
              </label>
            </td>
          </tr>
          <tr>
            <td>${I18N.SETTINGS_FIRST_LINE}:</td>
            <td>
              <input type="text" id="ct_s_fl_text_deff" size="40" value="" data-ddg-inputtype="unknown">
            </td>
          </tr>

          <tr>
            <td colspan="2" style="text-align:center;padding:10px;">
              <div style="margin-bottom:6px;"><small>${I18N.SETTINGS_RUN_HINT}</small></div>
              <input class="btn btn-confirm-yes" type="button" value="${I18N.SETTINGS_RUN}" id="ct_s_run_btn"
                style="margin:4px;font-size:16px;padding:8px 30px;cursor:pointer;">
              <input class="btn" type="button" value="${I18N.SETTINGS_CANCEL}" id="ct_s_cancel_btn"
                style="margin:4px;padding:8px 20px;cursor:pointer;">
            </td>
          </tr>
        </tbody>
      </table>
      <div style="text-align:right;margin-top:5px;">
        <small>${I18N.SCRIPT_NAME_WITH_AUTHOR}</small>
      </div>`;
    };

    // Show settings dialog and return a Promise that resolves with confirmed settings
    const showSettingsDialog = (
        savedConfig: CollectTroopsSettingsConfig
    ): Promise<CollectTroopsSettingsConfig> => {
        return new Promise((resolve, reject) => {
            const overlay = document.createElement("div");
            overlay.setAttribute("id", "ctSettingsOverlayV20260218");
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.right = "0";
            overlay.style.bottom = "0";
            overlay.style.background = "rgba(0,0,0,0.5)";
            overlay.style.zIndex = "12000";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";

            const container = document.createElement("div");
            container.style.background = "#f4e4bc";
            container.style.border = "5px solid #804000";
            container.style.padding = "15px";
            container.style.maxWidth = "650px";
            container.style.width = "90%";
            container.style.maxHeight = "80vh";
            container.style.overflowY = "auto";
            container.style.position = "relative";
            container.style.color = "#803000";

            overlay.appendChild(container);

            let currentConfig = { ...savedConfig };

            const renderDialog = (config: CollectTroopsSettingsConfig) => {
                const lang = config.language ?? detectedLanguage;
                const I18N =
                    CT_LANGUAGE_MESSAGES_V20260218[lang] ?? CT_EN_MESSAGES_V20260218;
                container.innerHTML = buildSettingsHTML(I18N);
                applyFormValues(config);

                // Language change handler - re-render dialog in new language
                const langSelect = document.getElementById(
                    "ct_s_language"
                ) as HTMLSelectElement;
                if (langSelect) {
                    langSelect.addEventListener("change", () => {
                        const currentValues = readFormValues();
                        currentValues.language = langSelect.value;
                        currentConfig = currentValues;
                        renderDialog(currentConfig);
                    });
                }

                // RUN button handler
                const runBtn = document.getElementById("ct_s_run_btn");
                if (runBtn) {
                    runBtn.addEventListener("click", () => {
                        const finalConfig = readFormValues();
                        overlay.remove();
                        resolve(finalConfig);
                    });
                }

                // Cancel button handler
                const cancelBtn = document.getElementById("ct_s_cancel_btn");
                if (cancelBtn) {
                    cancelBtn.addEventListener("click", () => {
                        overlay.remove();
                        reject(new Error("cancelled"));
                    });
                }
            };

            document.body.appendChild(overlay);
            renderDialog(currentConfig);
        });
    };

    // ---- Main flow ----

    // 1. Load saved settings and show settings dialog
    const savedConfig = loadSettings();
    let userConfig: CollectTroopsSettingsConfig;
    try {
        userConfig = await showSettingsDialog(savedConfig);
    } catch {
        // User cancelled
        return;
    }

    // 2. Save confirmed settings to localStorage
    saveSettings(userConfig);

    // 3. Determine language and I18N
    const language: string = userConfig.language ?? detectedLanguage;
    const I18N =
        CT_LANGUAGE_MESSAGES_V20260218[language] ?? CT_EN_MESSAGES_V20260218;

    // 4. Validate current page (only after RUN was clicked)
    const params = new URLSearchParams(location.search);
    const scriptMode = params.get("mode");
    const scriptModeTroops = () => {
        return scriptMode === "members_troops";
    };
    const scriptModeDefence = () => {
        return scriptMode === "members_defense";
    };

    if (
        params.get("screen") !== "ally" ||
        (!scriptModeDefence() && !scriptModeTroops())
    ) {
        UI.ErrorMessage(I18N.GO_TO_TRIBE_MEMBERS_TAB, "5000");
        return;
    }

    // 5. Build runtime config
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
            : userConfig.firstLineDeff ?? "",
        villagesPerPage: scriptModeTroops() ? 1000 : 2000,
        language: language,
    };

    console.log(
        "start collectTroopsScriptByRafsafV20260218 with config:",
        scriptConfig
    );

    // 6. Parse players from current page
    const players: TWPlayer[] = [];
    const emptyResultPlayers: TWPlayer[] = [];
    const lackOfAccessPlayers: TWPlayer[] = [];
    let output: string = "";
    let tribeName: string = "";

    const playersTableElement: HTMLSelectElement | null = document.querySelector(
        "#ally_content .input-nicer"
    );
    if (playersTableElement === null) {
        UI.ErrorMessage(I18N.NO_PLAYERS_SELECTOR_ON_PAGE, "5000");
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
        UI.ErrorMessage(I18N.EMPTY_PLAYERS_TABLE, "5000");
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
            emptyResultPlayers.push(player);
            return 0;
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
                let value = col.innerText.trim().replaceAll(".", "");
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
            // it is possible when player has exactly 1000 villages
            if (output.includes(playerOutputTroops)) {
                return 0;
            }
            output += playerOutputTroops;
            return villages;
        }
    };
    // To add player_id to current path
    const getPlayerURL = (playerId: string, pageNumber: number) => {
        const urlParams = new URLSearchParams(location.search);
        urlParams.set("player_id", playerId);
        urlParams.set("page", String(pageNumber));
        return `${window.location.origin}${window.location.pathname
            }?${urlParams.toString()}`;
    };
    // Used to parse string from fetch func to html
    const ConvertToHTML = (pageText: string) => {
        const parser = new DOMParser();
        const playerPageDocument = parser.parseFromString(pageText, "text/html");
        return playerPageDocument.body;
    };

    // 7. Run collection
    async function RenderPlayerTroops() {
        const cacheKey = `collectTroopsScriptByRafsafV20260218:${scriptMode}`;
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
            progress.setAttribute(
                "id",
                "collectTroopsScriptByRafsafV20260218ProgressBar"
            );
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
                return (
                    !lackOfAccessPlayers.includes(player) &&
                    !emptyResultPlayers.includes(player)
                );
            });
            disabledPlayers = players.filter((player) => {
                return (
                    !lackOfAccessPlayers.includes(player) &&
                    !finalPlayers.includes(player) &&
                    !emptyResultPlayers.includes(player)
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
                emptyResultPlayers: emptyResultPlayers,
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
            "collectTroopsScriptByRafsafV20260218ResultDialog",
            `
          <h3 style="width:600px;">${scriptConfig.scriptName}: ${result.tribeName
            }</h3>
          ${result.finalPlayers.length === 0
                ? ``
                : `<h4>${I18N.FINAL_SCRAPED_PLAYERS}:</h4><p>${result.finalPlayers
                    .map((player) => {
                        return player.nick;
                    })
                    .join(";")}</p>`
            }
          ${result.disabledPlayers.length === 0
                ? ``
                : `<h4>${I18N.CONFIG_DISABLED_PLAYERS
                }:</h4><p>${result.disabledPlayers
                    .map((player) => {
                        return player.nick;
                    })
                    .join(";")}</p>`
            }
          ${result.lackOfAccessPlayers.length === 0
                ? ``
                : `<h4>${I18N.ATTENTION_PARTIAL_OR_LACK_OVERVIEW
                }:</h4><p>${result.lackOfAccessPlayers
                    .map((player) => {
                        return player.nick;
                    })
                    .join(";")}</p>`
            }
          ${result.emptyResultPlayers.length === 0
                ? ``
                : `<h4>${I18N.EMPTY_RESULT_PLAYERS
                }:</h4><p>${result.emptyResultPlayers
                    .map((player) => {
                        return player.nick;
                    })
                    .join(";")}</p>`
            }
          <textarea rows="15" style="width:95%;margin-top:15px;margin-bottom:25px;">${scriptConfig.showFirstLine ? scriptConfig.firstLine + "\r\n" : ""
            }${result.output}</textarea>
          <p style="text-align:right; margin:2px">
          <small>${I18N.SCRIPT_NAME_WITH_AUTHOR}</small>
          <p style="text-align:right; margin:2px">
          <small>${I18N.GENERATED} ${new Date(
                result.generatedAt
            ).toLocaleString()}</small></p>
          `
        );
    }
    await RenderPlayerTroops();
};
collectTroopsScriptByRafsafV20260218().catch((error) => {
    const progress = document.getElementById(
        "collectTroopsScriptByRafsafV20260218ProgressBar"
    );
    if (progress !== null) {
        progress.remove();
    }
    const overlay = document.getElementById("ctSettingsOverlayV20260218");
    if (overlay !== null) {
        overlay.remove();
    }
    if (String(error) !== "Error: cancelled") {
        UI.ErrorMessage(String(error), "5000");
    }
});

## Scripts list

https://rafsaf.github.io/scripts_tribal_wars/

## Details

More info about usage https://plemiona-planer.pl/en/documentation/scripts/army_and_defence_collection/

You should use official innogames cdn if you play on www.plemiona-planer.pl, eg. `collect_troops.js` script:

```js
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
  language: "en"
};
$.getScript("https://media.innogamescdn.com/com_DS_PL/skrypty/Zbiorka_wojska_i_obrony.js");
void 0;
```

But for testing purposes and for www.tribalwars.net where hosting is on script owner behalf I prepared simple gh-pages site https://rafsaf.github.io/scripts_tribal_wars/ updated on every push so scripts can be also triggered in this way:

```js
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
  language: "en"
};
$.getScript("https://rafsaf.github.io/scripts_tribal_wars/collect_troops_v2.1.js");
void 0;
```

## Development

1. nvm use
2. npm install
3. npm run watch
4. hack
5. commit

This project use https://github.com/JamesIves/github-pages-deploy-action for deploying this static files. Recommended for this type of project ;)
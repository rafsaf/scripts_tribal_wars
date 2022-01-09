## More info about usage https://plemiona-planer.pl/en/documentation#instalacja-niezbednych-skryptow

You should use official innogames cdn, eg. `collect_troops.js` script:

```js
javascript: var Data = {
  cache: true,
  cacheTime: 5,
  removedPlayers: "",
  firstLineTroops: "Wioska,pik,miecz,topór,itp...,",
  showFirstLineTroops: false,
  showNicknamesTroops: false,
  firstLineDeff: "Wioska,miejsce,pik,miecz,topór,itp...,",
  showFirstLineDeff: false,
  showNicknamesDeff: false,
};
$.getScript(
  "https://media.innogamescdn.com/com_DS_PL/skrypty/Zbiorka_wojska_i_obrony.js"
);
void 0;
```

But for testing purposes I prepared simple gh-pages site https://rafsaf.github.io/scripts_tribal_wars/ updated on every push so scripts can be also triggered in this way:

```js
javascript: var Data = {
  cache: true,
  cacheTime: 5,
  removedPlayers: "",
  firstLineTroops: "Wioska,pik,miecz,topór,itp...,",
  showFirstLineTroops: false,
  showNicknamesTroops: false,
  firstLineDeff: "Wioska,miejsce,pik,miecz,topór,itp...,",
  showFirstLineDeff: false,
  showNicknamesDeff: false,
};
$.getScript("https://rafsaf.github.io/scripts_tribal_wars/collect_troops.js");
void 0;
```

Or English version of the script:

```js
javascript: var DATA_COLLECT_TROOPS = {
  cache: true,
  cacheTime: 5,
  removedPlayers: "",
  firstLineTroops: "Village,spear,swordsman,axeman,etc...,",
  showFirstLineTroops: false,
  showNicknamesTroops: false,
  firstLineDeff: "Village,place,spear,swordsman,axeman,etc...,",
  showFirstLineDeff: false,
  showNicknamesDeff: false,
};
$.getScript(
  "https://rafsaf.github.io/scripts_tribal_wars/collect_troops_en.js"
);
void 0;
```

This project use https://github.com/JamesIves/github-pages-deploy-action for deploying this static files. Recommended for this type of project ;)

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
javascript: var COLLECT_TROOPS_DATA_V2 = {
  cache: true,
  cacheTime: 5,
  removedPlayers: "",
  firstLineTroops: "",
  showFirstLineTroops: false,
  showNicknamesTroops: false,
  firstLineDeff: "",
  showFirstLineDeff: false,
  showNicknamesDeff: false,
  language: "pl",
};
$.getScript("https://rafsaf.github.io/scripts_tribal_wars/collect_troops_v2.js");
void 0;
```

Or older version:

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

JS version of the scripts compiled using command:
```bash
# for example collect_troops_v2.js:
$ tsc -t es2017 collect_troops_v2.ts
```

This project use https://github.com/JamesIves/github-pages-deploy-action for deploying this static files. Recommended for this type of project ;)
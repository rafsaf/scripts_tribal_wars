// ==UserScript==
// @name         GET message autocomplete
// @version      2.1-global
// @author       Rafał Safin <rafal.safin@rafsaf.pl>
// @source       https://github.com/rafsaf/scripts_tribal_wars/blob/master/public/GET_message_autocomplete_v2.1_global.js
// @copyright    MIT
// @description  Autocomplete messages in tribal wars mail form with GET parameters of URL
// @grant        none
// @noframes
// @match        *://*.plemiona.pl/game.php*screen=mail*mode=new*
// @match        *://*.tribalwars.net/game.php*screen=mail*mode=new*
// @match        *://*.die-staemme.de/game.php*screen=mail*mode=new*
// @match        *://*.staemme.ch/game.php*screen=mail*mode=new*
// @match        *://*.tribalwars.nl/game.php*screen=mail*mode=new*
// @match        *://*.tribalwars.com.br/game.php*screen=mail*mode=new*
// @match        *://*.tribalwars.com.pt/game.php*screen=mail*mode=new*
// @match        *://*.divokekmeny.cz/game.php*screen=mail*mode=new*
// @match        *://*.triburile.ro/game.php*screen=mail*mode=new*
// @match        *://*.voyna-plemyon.ru/game.php*screen=mail*mode=new*
// @match        *://*.fyletikesmaxes.gr/game.php*screen=mail*mode=new*
// @match        *://*.divoke-kmene.sk/game.php*screen=mail*mode=new*
// @match        *://*.klanhaboru.hu/game.php*screen=mail*mode=new*
// @match        *://*.tribals.it/game.php*screen=mail*mode=new*
// @match        *://*.klanlar.org/game.php*screen=mail*mode=new*
// @match        *://*.guerretribale.fr/game.php*screen=mail*mode=new*
// @match        *://*.guerrastribales.es/game.php*screen=mail*mode=new*
// @match        *://*.tribalwars.ae/game.php*screen=mail*mode=new*
// @match        *://*.tribalwars.co.uk/game.php*screen=mail*mode=new*
// @match        *://*.tribalwars.us/game.php*screen=mail*mode=new*
// ==/UserScript==

const hash = window.location.hash.substring(1);
const result = hash.split("&").reduce(function (res, item) {
  var parts = item.split("=");
  res[parts[0]] = parts[1];
  return res;
}, {});
if ("to" in result) {
  document.getElementById("to").value = decodeURIComponent(result.to);
}
if ("subject" in result) {
  document.getElementsByName("subject")[0].value = decodeURIComponent(
    result.subject
  );
}
if ("message" in result) {
  document.getElementById("message").value = decodeURIComponent(result.message);
}

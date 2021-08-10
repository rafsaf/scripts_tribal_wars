// ==UserScript==
// @name     GET message autocomplete
// @version  2.0
// @match    *://*.plemiona.pl/game.php*screen=mail*mode=new*
// ==/UserScript==
// By Rafsaf

const hash = window.location.hash.substr(1);
const result = hash.split('&').reduce(function (res, item) {
var parts = item.split('=');
res[parts[0]] = parts[1];
return res;
}, {});
if ("to" in result) {
document.getElementById('to').value = decodeURIComponent(result.to);
}
if ("subject" in result) {
document.getElementsByName('subject')[0].value = decodeURIComponent(result.subject);
}
if ("message" in result) {
document.getElementById('message').value = decodeURIComponent(result.message);
}

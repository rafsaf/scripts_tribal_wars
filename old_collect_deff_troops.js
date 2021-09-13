// ==UserScript==
// @name     Zbiórka przegląd Obrona.
// @version  3
// @match    *://*.plemiona.pl/game.php*screen=ally*&mode=members_defense
// ==/UserScript==
// By Rafsaf
var output = "";
var players = [];
// Adds players from current html to get array with players nicknames and ids
function get_all_players_list(){
  Array.from(document.querySelector('#ally_content .input-nicer').options).forEach(function(option_element) {
    var option_text = option_element.text.trim();
    var option_value = option_element.value;
    if (option_text != 'Wybierz członka') {
      players.push({
        id: option_value,
        nick: option_text
      });
    }
  });
}
// Uses some methods to get all stuff from table with units from current html site
function add_current_player_info_to_output(doc){
  var trs = doc.querySelectorAll('.table-responsive .vis tr');
  var attacks = 0;
  var coordinates;
  for (var i = 1; i < trs.length; i++) {
    output += "<br>";
    var tds = trs[i].querySelectorAll('td');
    if (i % 2 == 1){
      for (var j = 0; j < tds.length; j++) {
      var value = String(tds[j].innerHTML).trim();
      if (j == 0) {
        value = value.slice(-17,-10);
        coordinates = value;
      }
      if (j == 12){
        attacks = value;
      }
      output += value+",";
      }
    } else {
      output += coordinates+",";
      for (j = 0; j < tds.length; j++) {
      value = String(tds[j].innerHTML).trim();
      output += value + ",";
      }
      output += attacks+",";
      }
  }
}
// To add player_id to current path
function getURL(id){
  var params = new URLSearchParams(window.location.search);
  params.set('player_id', id);
  return "".concat(window.location.origin).concat(window.location.pathname, "?").concat(params.toString());
}
// Used to parse string from fetch func to html
function convertToHTML(str) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, 'text/html');
  return doc.body;
}
// Most important async function, after confirmation waits 2s then uses get_all_players_list.
// Then starts to fetch response from first player's page, then converts it.
// Then uses 'add current player info to output' on it, and so on, in the end prints some dialog with results.
async function renderPlayerTroops() {
  var con = window.confirm("Czy chcesz zebrać wojska?(może to chwilkę potrwać ;) )");
  if (con == false){
    return;
  }
  var today = (new Date()).getTime();
  var after_5_hours = today + 1800000;
  var storage_date = localStorage.getItem('storage_date_obrona');
  var now = (new Date()).getTime();
  if (now < storage_date) {
    output = localStorage.getItem('output_obrona');
  } else {
  get_all_players_list();
  for (var i = 0; i < players.length; i++){
    if (i == 0){
      await new Promise(function (resolve) {
        return setTimeout(resolve, 2000);
      });
  }
    var id = players[i].id;
    var response = await fetch(getURL(id));
    var html = await response.text();
    var doc = convertToHTML(html);
    add_current_player_info_to_output(doc);
    }
    localStorage.setItem('storage_date_obrona', after_5_hours);
    localStorage.setItem('output_obrona', output);
  }
  var div = document.createElement("div");
  div.contentEditable = "true";
  div.style.width = "600px";
  div.style.height = "auto";
  div.style.border = "2px solid black";
  div.style.left = "25%";
  div.style.top = "40%";
  div.style.position = "absolute";
  div.style.background = "red";
  div.style.margin = "0px 0px 100px 0px";
  div.style.color = "white";
  div.innerHTML = output;
  document.body.appendChild(div);
}
function create_button(){
  var td_place = document.querySelector('#menu_row2');
  var td = document.createElement('td');
  td.setAttribute('id', 'new_button');
  td_place.appendChild(td);
  var button_place = document.querySelector('#new_button');
  var btn = document.createElement('btn');
  btn.setAttribute('class', 'btn btn-default');
  btn.innerHTML = 'Zbierz Obronę';
  button_place.appendChild(btn);
  btn.addEventListener ("click", function() {
    renderPlayerTroops();
  });
}
create_button();
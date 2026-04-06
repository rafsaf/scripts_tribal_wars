// ==UserScript==
// @name     Indywidualna Zbiórka Wojska.
// @version  1
// @match    *://*.plemiona.pl/game.php*screen=overview_villages*
// ==/UserScript==
// By Rafsaf

/*!
MIT License

Copyright (c) 2022 rafal.safin12@gmail.com
Source https://github.com/rafsaf/scripts_tribal_wars/blob/2025-09-22/public/GET_message_autocomplete_v2.2_global.js

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

*/

const loopOverPlayerArmyTableAndReturnOutputText = () => {
    let outputText = ""
    const trs = document.querySelectorAll('.overview_table tr')
    let actualVillageCoord
    let nextVillageNameIndex = 1
    trs.forEach((value, index) => {
        const tds = value.querySelectorAll('td')
        if (index === nextVillageNameIndex) {
            actualVillageCoord = String(tds[0].innerText).trim().slice(-12,-5)
            nextVillageNameIndex += 5
            outputText += "<br>" + actualVillageCoord + ","
            tds.forEach((value, index) => {
                if (index === 0) {
                    return
                }
                let parsedValue = String(value.innerText).trim()
                if ((parsedValue === 'Wojska') || (parsedValue === 'Rozkazy')) {
                    parsedValue = 0
                } else if ((parsedValue === 'razem') || (parsedValue === 'własne')) {
                    return
                }
                outputText += parsedValue + ","
            })
        }
    })
    return outputText
}
const createAndShowDivTextAreaWithResults = (outputText) => {
    const textArea = document.createElement("div")
    textArea.contentEditable = "true"
    textArea.style.width = "600px"
    textArea.style.height = "auto"
    textArea.style.border = "2px solid black"
    textArea.style.left = "25%"
    textArea.style.top = "40%"
    textArea.style.position = "absolute"
    textArea.style.background = "red"
    textArea.style.margin = "0px 0px 100px 0px"
    textArea.style.color = "white"
    textArea.innerHTML = outputText
    document.body.appendChild(textArea)
    UI.SuccessMessage('Zebrano! Jeśli masz więcej niż 1 stronę z wioskami, przejdź do zakładki [wszystkie] by zebrać całość.')
}
const showPlayerTroopsInDialog = () => {
    const confirmed = window.confirm("Czy na pewno chcesz zebrać własne wojska?")
    if (!confirmed) {
      return
    }
    const outputText = loopOverPlayerArmyTableAndReturnOutputText()
    createAndShowDivTextAreaWithResults(outputText)
}
const createButton = () => {
    const tdPlace = document.querySelector('#menu_row2')
    const newTdWithButton = document.createElement('td')
    newTdWithButton.setAttribute('id', 'new-button-td')
    tdPlace.appendChild(newTdWithButton)
    const buttonPlace = document.querySelector('#new-button-td')
    const newButton = document.createElement('btn')
    newButton.setAttribute('class', 'btn btn-default')
    newButton.innerHTML = 'Zbierz wojsko'
    buttonPlace.appendChild(newButton)
    newButton.addEventListener("click", function() {
        showPlayerTroopsInDialog()
    })
}
createButton()

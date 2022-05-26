'use strict'
//-------------------------------------------------------------------------------------------------------
// vars
//-------------------------------------------------------------------------------------------------------
const MINE = '🦠'
const LIFE = ' 🩸 '
const SYRING = '💉'

var gBoard = []
var gCells = []
var gMines = []
var gFlagCount = 0
var gLife
var gNuts = false
var gDiff
var gScore = 0
var gElTimer = document.querySelector('.timer span')
var gIntervalCountdown
const startingMinutes = 2
var time = startingMinutes * 60
//-------------------------------------------------------------------------------------------------------
// Main game
//-------------------------------------------------------------------------------------------------------
function init() {
    chooseDiff(4)

}
// game over --> cleans 
function gameOver() {
    clearInterval(gIntervalTime)
    clearInterval(gIntervalCountdown)
    gIsOn = false
    var flagged = document.querySelectorAll('.flagged')

    flagged.forEach(flagged => {
        flagged.classList.remove('flagged')
    })
    clearTimer()
    console.log('game over');

}
function resetVars() {
    // mines 
    gMines = []
    // modal win
    document.querySelector('.modal-win').style.opacity = 0
    // modal lose
    document.querySelector('.modal-lose').style.opacity = 0
    // reset game face
    document.querySelector('.menu.face').innerText = '😷'
    // flag count
    gFlagCount = 0
    // reset clock
    document.querySelector('span.countdown.countup').innerText = '00'
    // reset score
    removeScore()
    // reset click count
    gClickCount = 0
    // clear time intervals
    clearTimer()
    // reset game table
    gBoard = []
    var table = document.querySelector('table.game-table')
    table.innerHTML = ''
}
// choose difficulty - starts and restarts game board --> should move to 
// restarts gBoard --> create matrix --> count mines --> renders board
function chooseDiff(diff, nuts) {
    gNuts = nuts
    gDiff = diff
    // reset all
    resetVars()
    console.log(gNuts);
    // set difficulty to global var
    var mineAmount
    if (diff === 4) mineAmount = 2
    if (diff === 8) mineAmount = 12
    if (diff === 12) mineAmount = 30
    // game is on
    gIsOn = true
    // render life count by difficulty
    renderLife(diff, nuts)
    // create board
    gBoard = createMat(diff, diff)
    // place random mines
    randomMines(mineAmount)
    // count mines around every cell 
    countMines()
    // render board
    renderBoard(gBoard)

}
//-------------------------------------------------------------------------------------------------------
// clicks
//-------------------------------------------------------------------------------------------------------
// add class --> .shown --> to all empty neighbors around cell --> first click
function showEmptyNeighbors(elCell, i, j) {
    var neighborsCells = countEmptyNeighbors(i, j, gBoard)
    for (var i = 0; i < neighborsCells.length; i++) {
        var neigCellClass = getClassName(neighborsCells[i])
        var elNeigCell = document.querySelector('.' + neigCellClass)
        elNeigCell.classList.add('shown')
        elCell.classList.add('shown')
    }
}
function firstClick(elCell, i, j) {

    showEmptyNeighbors(elCell, i, j)
    elCell.classList.add('shown')
    gFirstClickLocation = { i, j }
    gIsFirstClick = true

}
// all left clicks functions
function cellClicked(elCell, i, j) {

    if (gIsOn === false ||
        gBoard[i][j].isFlagged === true ||
        elCell.classList.contains('flagged')||
        elCell.classList.contains('shown'))
        return


    elCell.classList.add('shown')

    gClickCount++
    gClickCount === 1 ? gIsFirstClick = true : gIsFirstClick = false
    // first click
    if (gIsFirstClick) {

        if (gBoard[i][j].gameElement !== MINE) {
            gNuts ? startCountDown() : startTimer()
            gIsOn = true
            firstClick(elCell, i, j)
            gBoard[i][j].isShown = true
        } else if (gIsOn) {
            chooseDiff(gDiff)
            gIsOn = true
            console.log('haha');
            elCell.classList.add('shown')
            cellClicked(elCell, i, j)
            return
        }

    }
    if (gBoard[i][j].gameElement === MINE && gLife > 0) {
        removeLife()
        elCell.classList.add('shown')
        gScore--
        console.log('mines',gMines);
        gMines.splice(gBoard[i][j],1)

    }

    if (gLife < 1 && gBoard[i][j].gameElement === MINE) {
        showMines()
        gameOver()
        showLoseModal()

    } else {
        gBoard[i][j].isShown = true

        addScore()
        elCell.classList.add('shown')
    }

}
// right click toggles --> .flagged
function rightClick(elCell, i, j) {
    if(!gIsOn || elCell.classList.contains('shown')) return
    if (!gBoard[i][j].isFlagged) gFlagCount++
    else gFlagCount--
    console.log(gFlagCount);
    elCell.classList.toggle('flagged')
    elCell.classList.add('syring')
    elCell.innerText = SYRING
    gBoard[i][j].isFlagged = !gBoard[i][j].isFlagged
    console.log(gBoard[i][j]);

    gameWin()

}
//-------------------------------------------------------------------------------------------------------
// Mines
//-------------------------------------------------------------------------------------------------------
//  add class --> .shown --> to all mines on board
function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].gameElement === MINE) {
                var mineClassName = getClassName(gBoard[i][j].location)
                var elMine = document.querySelector('.' + mineClassName)
                elMine.classList.add('shown')
                elMine.classList.add('mine')
            }
        }
    }
}

// place random mines
function randomMines(mineAmount) {
    var ranMinesIdxs = randomIdxs(gBoard, gBoard.length ** 2)

    for (var i = 0; i < mineAmount; i++) {
        var randMine = getCellLocByIdx(ranMinesIdxs.pop())
        // console.log(randMine);
        if (!randMine) {
            i--
            continue
        }
        gMines.push(randMine)
        randMine.gameElement = MINE
    }
    console.log(gMines);
}
//-------------------------------------------------------------------------------------------------------
// life
function countLife(count) {
    gLife = count
    var elLife = document.querySelector('.life')
    for (var i = 0; i < count; i++) {
        elLife.innerHTML += `<span class="life-${i + 1}">${LIFE}</span>`

    }
}

function clearLife() {
    var elLife = document.querySelector('.life')
    elLife.innerText = ''
}

function renderLife(diff, nuts) {
    gNuts = nuts
    var life
    clearLife()
    if (diff === 4) life = 2
    if (diff === 8) life = 2
    if (diff > 8) life = 3
    if (nuts) life = 0
    countLife(life)

}

function removeLife() {
    console.log(gLife);
    var elLife = document.querySelector(`.life-${gLife}`)
    console.log(elLife);
    elLife.innerText = ''
    gLife--
}
//-------------------------------------------------------------------------------------------------------
// score
function addScore() {
    
    gScore++
    var elScore = document.querySelector('.score')
    elScore.innerText = `${gScore}`
}

function removeScore() {
    gScore = 0
    var elScore = document.querySelector('.score')
    elScore.innerText = `${gScore}`
}

function gameWin() {
    for (var i = 0; i < gMines.length; i++) {
        console.log(gMines[i]);
        if (!gMines[i].isFlagged) return
    }

    if (gFlagCount === gMines.length) {
        for (var i = 0; i < gMines.length; i++) {
            console.log(gMines[i]);
            if (!gMines[i].isFlagged) return
        }
        console.log('well done');
        gIsOn = false
        showWinModal()
        clearTimer()
    } else return

}

function showWinModal() {
    console.log('wihii');
    document.querySelector('.modal-win').style.opacity = '100'
    document.querySelector('.menu.face').innerText = '😃'
    
}

function showLoseModal() {
    console.log('wihii');
    document.querySelector('.modal-lose').style.opacity = '100'
    document.querySelector('.menu.face').innerText = '🤮'
}
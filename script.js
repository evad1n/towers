const COOL_LETTERS_TIMER = 150

var wordOfTheDay = document.querySelector("#word-of-the-day")

var diskSlider = document.querySelector("#diskSlider")
var numDisks = document.querySelector("#numDisks")
var minMoves = document.querySelector("#minMoves")
var moveDisplay = document.querySelector("#moveNumber").children[0]

var solveButton = document.querySelector("#solve")
var resetButton = document.querySelector("#reset")
var speedSlider = document.querySelector("#solveSpeed")

// Completion displays
var perfectWin = document.querySelector("#perfectWin")
var perfectTimer
var win = document.querySelector("#win")
var solved = document.querySelector("#solved")

var tower1 = document.querySelector("#one")
var tower2 = document.querySelector("#two")
var tower3 = document.querySelector("#three")

// Local data
var towers = [tower1, tower2, tower3]
var disks = []
var moveQueue = []
var moveCount = 0
var solving = false

diskSlider.oninput = reset;

perfectTimer = setInterval(() => {
    coolLetters(perfectWin)
}, COOL_LETTERS_TIMER);

solveButton.onclick = () => {
    solveButton.disabled = true
    solving = true
    solve(disks.length, 1, 3, 2)
    beginSolve(doMove)
}

function doMove() {
    if (moveQueue.length != 0) {
        let move = moveQueue.shift()
        move()
    }

    isDone(false)
}

function beginSolve(callback) {
    var nextMove = function () {
        callback()
        if (solving) {
            window.setTimeout(nextMove, speedSlider.value)
        }
    }
    nextMove()
};

resetButton.onclick = reset

randomizeDiskClasses()
changeDisks()

function reset() {
    moveQueue = []
    solving = false
    changeDisks()
}

function changeDisks() {
    let n = diskSlider.value
    numDisks.innerHTML = n
    minMoves.innerHTML = `${(2 ** n) - 1} (2<sup>${n}</sup>-1) moves`

    // change HTML
    resetDisks(n)
}

function resetDisks(n) {
    tower1.innerHTML = ""
    tower2.innerHTML = ""
    tower3.innerHTML = ""
    disks = []

    for (let index = n; index > 0; index--) {
        let newDisk = document.createElement("div")
        newDisk.classList.add("disk")
        newDisk.id = `disk-${index}`
        newDisk.dataset.number = index

        disks.push(newDisk)
        tower1.appendChild(newDisk)
    }

    win.style.display = "none"
    solved.style.display = "none"
    perfectWin.style.display = "none"

    updateDisks()
}

function makeTop(disk) {
    disk.draggable = true
    disk.ondragstart = (e) => { drag(e) }
    disk.classList.add("topDisk")
}

function updateDisks() {
    // Make all disks unusable
    disks.forEach(disk => {
        disk.classList.remove("topDisk")
        disk.draggable = false
        disk.removeEventListener("ondragstart", (event) => { drag(event) })
    });

    // Check for win
    if (tower3.children.length == disks.length) {
        win.style.display = "block"
    }

    // Make top disk usable
    for (let index = 0; index < towers.length; index++) {
        let tower = towers[index]
        let top = getTopDisk(tower)
        if (top != -1) {
            makeTop(top)
        }
    }

    moveDisplay.innerHTML = moveCount
}

/**
 * Returns true if game is successfully completed
 * @param {boolean} user Did the user solve it?
 */
function isDone(user) {
    if (tower3.children.length == disks.length) {
        if (user) {
            // Was it done in the minimum number of moves?
            if (moveCount == (2 ** numDisks) - 1) {
                perfectWin.style.display = "block"
            }
            else {
                win.style.display = "block"
            }
        }
        else {
            solved.style.display = "block"
            solving = false
            solveButton.disabled = false
        }
        return true
    }
    return false
}

function getTopDisk(tower) {
    if (tower.children.length) {
        return tower.children[tower.children.length - 1]
    }
    return -1
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("id", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("id");
    var disk = document.getElementById(data)
    var tower

    if (ev.target.classList.contains("disk")) {
        tower = ev.target.parentElement
    }
    else if (ev.target.classList.contains("tower")) {
        tower = ev.target
    }
    else if (ev.target.classList.contains("tower-area")) {
        tower = ev.target.children[1]
    }
    else if (ev.target.classList.contains("tower-stand")) {
        tower = ev.target.parentElement.children[1]
    }

    var top = getTopDisk(tower)
    var topSize = 11
    // If tower is not empty
    if (top != -1) {
        topSize = top.dataset.number
    }

    // If this disk is smaller than the top disk then continue
    if (disk.dataset.number < topSize) {
        tower.appendChild(disk);
        moveCount++
        updateDisks()
    }
    // Otherwise do nothing
}

function solve(N, source, destination, other) {
    if (N == 1) {
        moveQueue.push(() => { moveDisk(source, destination) })
    }
    else {
        solve(N - 1, source, other, destination)
        solve(1, source, destination, other)
        solve(N - 1, other, destination, source)
    }
}

function moveDisk(source, destination) {
    let src = towers[source - 1]
    let dst = towers[destination - 1]

    let disk = getTopDisk(src)

    dst.appendChild(disk)
}

function randomizeDiskClasses() {
    var style = document.createElement('style');
    style.type = 'text/css';

    for (let index = 0; index < 10; index++) {
        var r = Math.random() * 256
        var g = Math.random() * 256
        var b = Math.random() * 256

        var str = `#disk-${index + 1} { 
            background-color: rgb(${r}, ${g}, ${b}); 
            width: ${50 + (index * 25)}px; 
            right: ${(46 + (index * 25)) / 2}px;
        }\n`

        style.innerHTML += str;
    }

    document.getElementsByTagName('head')[0].appendChild(style);
}

function coolLetters(el) {
    for (let index = 0; index < el.children.length; index++) {
        var letter = el.children[index];

        var r = Math.random() * 256
        var g = Math.random() * 256
        var b = Math.random() * 256
        var size = (Math.random() * 5) + 30

        letter.style = `color: rgb(${r}, ${g}, ${b}); font-size: ${size}px;`
    }
}

// FETCH STUFF

const URL = "https://api.jsonbin.io/b/5f4fdc154d8ce4111387550c"

// JSON data from URL^
// {
//     "words": [
//       "guacamole",
//       "metastasize",
//       "elfin",
//       "brachiosaurus",
//       "gripe",
//       "doughnut"
//     ]
//   }

// Very advanced method to fetch very significant word of the day!
function getWord(url) {
    fetch(url).then((response) => {
        response.json().then((data) => {
            let words = data.words
            let i = Math.floor(Math.random() * words.length)
            let word = words[i]

            for (let index = 0; index < word.length; index++) {
                let spanLetter = document.createElement("span")
                spanLetter.innerHTML = word[index]
                wordOfTheDay.appendChild(spanLetter)
            }

            setInterval(() => {
                coolLetters(wordOfTheDay)
            }, COOL_LETTERS_TIMER);
        })
    });
}

getWord(URL)
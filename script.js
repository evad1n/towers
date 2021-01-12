let app = new Vue({
    el: '#app',
    data() {
        return {
            helpModal: false,
            towers: [[], [], []],
            disks: [],
            numDisks: 3,
            maxDisks: 10,
            moveNumber: 0,
            solving: false,
            doneSolving: false,
            solveSpeed: 700,
            moveQueue: []
        };
    },

    created() {
        this.initializeDisks();
        this.reset();
        setInterval(() => {
            if (this.perfect)
                this.coolLetters(this.$refs['perfect']);
        }, 200);
        // For closing the modal
        window.addEventListener("click", (e) => {
            if (e.target == this.$refs['helpModal']) {
                this.helpModal = false;
            }
        });
    },

    methods: {
        reset() {
            this.solving = false;
            this.moveQueue = [];
            this.moveNumber = 0;
            this.towers = [[], [], []];
            for (const disk of this.curDisks) {
                this.towers[0].push(disk.num);
            }
        },
        coolLetters(el) {
            // This is pretty much the only legacy function as it queries the DOM directly
            for (const letter of el.children) {
                let r = Math.random() * 256;
                let g = Math.random() * 256;
                let b = Math.random() * 256;
                let size = (Math.random() * 5) + 30;

                letter.style = `color: rgb(${r}, ${g}, ${b}); font-size: ${size}px;`;
            }
        },
        solve(N, source, destination, other) {
            if (N == 1) {
                this.moveQueue.push(() => { this.moveDisk(source, destination); });
            }
            else {
                this.solve(N - 1, source, other, destination);
                this.solve(1, source, destination, other);
                this.solve(N - 1, other, destination, source);
            }
        },
        moveDisk(source, destination) {
            let src = this.towers[source];
            let dst = this.towers[destination];
            let disk = src[0];
            src.splice(src.indexOf(disk), 1);
            dst.unshift(disk);
            this.moveNumber++;
        },
        beginSolve() {
            this.reset();
            this.solving = true;
            this.solve(this.numDisks, 0, 2, 1);
            this.beginSolveMoves(this.doMove);
        },
        beginSolveMoves(callback) {
            let nextMove = () => {
                callback();
                if (!this.doneSolving) {
                    window.setTimeout(nextMove, 1300 - this.solveSpeed);
                }
            };
            nextMove();
        },
        doMove() {
            if (this.moveQueue.length != 0) {
                let move = this.moveQueue.shift();
                move();
            }
            this.doneSolving = this.done;
        },
        allowDrop(e) {
            e.preventDefault();
        },

        dragStart(e, tower, disk) {
            e.dataTransfer.setData("tower", tower);
            e.dataTransfer.setData("disk", disk);
        },

        drop(e, towerTo) {
            e.preventDefault();
            let tower = this.towers[towerTo];
            let towerFrom = parseInt(e.dataTransfer.getData("tower"));
            let disk = parseInt(e.dataTransfer.getData("disk"));

            // If this disk is smaller than the top disk then continue
            if (tower.length == 0 || disk < tower[tower.length - 1]) {
                this.moveDisk(towerFrom, towerTo);
            }
            // Otherwise do nothing
        },
        randomizeDiskColors() {
            for (const disk of this.disks) {
                let r = Math.random() * 256;
                let g = Math.random() * 256;
                let b = Math.random() * 256;
                this.$set(disk, 'background-color', `rgb(${r}, ${g}, ${b})`);
            }
        },
        initializeDisks() {
            for (let index = 0; index < this.maxDisks; index++) {
                this.disks.push({ num: index + 1, width: `${50 + (index * 25)}px`, right: `${(46 + (index * 25)) / 2}px` });
            }
            this.randomizeDiskColors();
        },
    },
    computed: {
        curDisks() {
            return this.disks.slice(0, this.numDisks);
        },
        done() {
            return this.towers[2].length == this.numDisks;
        },
        minMoves() {
            return 2 ** this.numDisks - 1;
        },
        perfect() {
            return this.done && this.moveNumber == this.minMoves && !this.doneSolving;
        },
        movesPerSec() {
            let n = 1000 / (1300 - this.solveSpeed);
            return Math.round((n + Number.EPSILON) * 100) / 100;
        }
    },
    watch: {
        done(val) {
            if (val) {
                this.solving = false;
            }
        }
    }
});
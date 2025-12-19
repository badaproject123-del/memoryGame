const { createApp } = Vue;

createApp({
  data() {
    return {
      emojis: [
        "🐶",
        "🐱",
        "🐭",
        "🐹",
        "🐰",
        "🦊",
        "🐻",
        "🐼",
        "🐨",
        "🐯",
        "🦁",
        "🐮",
        "🐷",
        "🐸",
        "🐵",
        "🦄",
        "🐔",
        "🐧",
      ],

      levels: {
        easy: { grid: 3, pairs: 6, misses: 10 },
        medium: { grid: 4, pairs: 8, misses: 8 },
        hard: { grid: 5, pairs: 10, misses: 6 },
      },
      showRules: false,
counterRules:0,
      gameMode: "single",
      level: "easy",

      cards: [],
      flipped: [],
      matched: 0,

      moves: 0,
      misses: 0,
      timeLeft: 0,
      timer: null,

      currentPlayer: 1,
      scores: [0, 0],
      gameStarted: false,
      showModal: false,
    };
  },

  computed: {
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.levels[this.level].grid}, 110px)`,
      };
    },

    isTwoPlayer() {
      return this.gameMode === "two";
    },
  },
  watch: {
    level() {
      this.gameStarted = false;
      this.cards = [];
    },
    gameMode() {
      this.gameStarted = false;
      this.cards = [];
    },
  },
  methods: {
  startGame() {
  const rulesSeen = sessionStorage.getItem("rulesSeen");

  if (!rulesSeen) {
    this.showRules = true;
    sessionStorage.setItem("rulesSeen", "true");
  } else {
    this.beginGame();
  }
},


    beginGame() {
      
      this.gameStarted = false; // hide board while resetting

      clearInterval(this.timer);

      const { pairs, misses } = this.levels[this.level];

      this.cards = [
        ...this.emojis.slice(0, pairs),
        ...this.emojis.slice(0, pairs),
      ]
        .sort(() => Math.random() - 0.5)
        .map((value) => ({
          value,
          flipped: false,
          matched: false,
          owner: null,
        }));

      this.flipped = [];
      this.matched = 0;
      this.moves = 0;
      this.misses = misses;
      this.currentPlayer = 1;
      this.scores = [0, 0];
      this.showModal = false;

      if (this.level === "hard" && this.gameMode === "single") {
        this.timeLeft = 60;
        this.startTimer();
      } else {
        this.timeLeft = 0;
      }
      this.gameStarted = true;
    },

    closeRules() {
      this.showRules = false;
      this.beginGame();
    },

    flipCard(card) {
      if (card.flipped || card.matched || this.flipped.length === 2) return;

      card.flipped = true;
      card.owner = this.currentPlayer;
      this.flipped.push(card);

      if (this.flipped.length === 2) {
        this.checkMatch();
      }
    },

    checkMatch() {
      this.moves++;

      const [a, b] = this.flipped;

      if (a.value === b.value) {
        a.matched = b.matched = true;
        this.matched++;

        this.playSound("sound-match");



        if (this.isTwoPlayer) {
          this.scores[this.currentPlayer - 1]++;
        }

        this.flipped = [];

        if (this.matched === this.cards.length / 2) {
          this.endGame();
        }
      } else {
        this.playSound("sound-wrong");
        setTimeout(() => {
          a.flipped = b.flipped = false;
          a.owner = b.owner = null;
          this.flipped = [];

          if (this.isTwoPlayer) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
          } else {
            this.misses--;
            if (this.misses === 0) this.endGame();
          }
        }, 800);
      }
    },

    playSound(id) {
      const sound = document.getElementById(id);
      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }
    },

    startTimer() {
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) this.endGame();
      }, 1000);
    },

    endGame() {
      this.playSound("sound-win");
      this.showModal = true;

      clearInterval(this.timer);

    },

    closeModal() {
      this.showModal = false;
    },
  },
}).mount("#app");

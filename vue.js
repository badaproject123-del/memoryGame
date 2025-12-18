const { createApp } = Vue;

createApp({
  data() {
    return {
      emojis: [
        "🐶","🐱","🐭","🐹","🐰","🦊",
        "🐻","🐼","🐨","🐯","🦁","🐮",
        "🐷","🐸","🐵","🦄","🐔","🐧"
      ],

      levels: {
        easy:   { grid: 4, pairs: 8,  misses: 10 },
        medium: { grid: 5, pairs: 12, misses: 8 },
        hard:   { grid: 6, pairs: 18, misses: 6 }
      },

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

      showModal: false
    };
  },

  computed: {
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.levels[this.level].grid}, 110px)`
      };
    },

    isTwoPlayer() {
      return this.gameMode === "two";
    }
  },

  methods: {
    startGame() {
      clearInterval(this.timer);

      const { pairs, misses } = this.levels[this.level];

      this.cards = [...this.emojis.slice(0, pairs), ...this.emojis.slice(0, pairs)]
        .sort(() => Math.random() - 0.5)
        .map(value => ({
          value,
          flipped: false,
          matched: false,
          owner: null
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
    },

    flipCard(card) {
      if (
        card.flipped ||
        card.matched ||
        this.flipped.length === 2
      ) return;

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

        if (this.isTwoPlayer) {
          this.scores[this.currentPlayer - 1]++;
        }

        this.flipped = [];

        if (this.matched === this.cards.length / 2) {
          this.endGame();
        }
      } else {
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

    startTimer() {
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) this.endGame();
      }, 1000);
    },

    endGame() {
      clearInterval(this.timer);
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    }
  }
}).mount("#app");

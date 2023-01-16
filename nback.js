class NbackGame {
  constructor(nback, numItems, letters) {
    this.sequence = [];
    this.nback = nback;
    this.numItems = numItems;
    this.currentRound = -1;
    this.correctAnswers = 0;
    this.letters = letters;
  }

  generateItem() {
    var index = Math.floor(Math.random() * this.letters.length);
    var item = this.letters[index];
    return item;
  }

  displayItem(item) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = item;
    window.speechSynthesis.speak(msg);
    $("#display").html("");
    $("#display").html(item);
  }

  startGame() {
    $("#display").html("");
    $("#score").html(0);
    for (var i = 0; i < this.numItems; i++) {
      this.sequence.push(this.generateItem());
    }
    this.nextRound();
  }

  nextRound() {
    $("#display").html("");
    this.currentRound++;
    this.currentItem = this.sequence[this.currentRound];
    this.displayItem(this.currentItem);
  }

  updateScore(score) {
    $("#score").html(score);
  }
}

var game = null;
//create a new game and start it when the start-game button is clicked
$("#start-game").click(function(){
  game = new NbackGame(2, 10, "ABC");
  game.startGame();
});

$("#yes").click(() => {
  var previousItemIndex = game.currentRound - game.nback;
  if (previousItemIndex >= 0 && game.currentItem == game.sequence[game.currentRound - game.nback]) {
    game.correctAnswers++;
  }
  game.updateScore(game.correctAnswers);
  if (game.currentRound == game.numItems - 1) {
    alert("Game over! You scored " + game.correctAnswers + " out of " + game.numItems);
  } else {
    game.nextRound();
  }
});

$("#no").click(() => {
  var previousItemIndex = game.currentRound - game.nback;
  if (previousItemIndex < 0 || game.currentItem != game.sequence[game.currentRound - game.nback]) {
    game.correctAnswers++;
  }
  game.updateScore(game.correctAnswers);
  if (game.currentRound == game.numItems - 1) {
    alert("Game over! You scored " + game.correctAnswers + " out of " + game.numItems);
  } else {
    game.nextRound();
  }
});

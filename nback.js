class NbackGame {
  constructor(settings) {
    this.sequence = [];
    this.nback = settings.nback;
    this.numItems = settings.numItems;
    this.currentRound = -1;
    this.correctAnswers = 0;
    this.letters = settings.letters;
  }

  generateItem() {
    if (this.sequence.length >= this.nback && Math.random() < 0.65) {
      return this.sequence[this.sequence.length - this.nback];
    }
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
    $("#game-display").show();
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

  endGame() {
    $("#game-display").hide();
    alert("Game over! You scored " + this.correctAnswers + " out of " + this.numItems);
  }
}

class Settings {
  constructor(nback, numItems) {
    this.set_nback(nback);
    this.set_numItems(numItems);
    this.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  set_nback(nback) {
    this.nback = nback;
    $("#num-back").val(nback);
  }

  set_numItems(numItems) {
    this.numItems = numItems;
    $("#num-items").val(numItems);
  }
}

var settings = new Settings(2, 10); //should probably be a singleton
var game = null;
//create a new game and start it when the start-game button is clicked
$("#start-game").click(function() {
  $("#settings-display").hide();
  game = new NbackGame(settings);
  game.startGame();
});

$("#yes").click(() => {
  if (!game) return;
  var previousItemIndex = game.currentRound - game.nback;
  if (previousItemIndex >= 0 && game.currentItem == game.sequence[game.currentRound - game.nback]) {
    game.correctAnswers++;
  }
  game.updateScore(game.correctAnswers);
  if (game.currentRound == game.numItems - 1) {
    game.endGame();
    game = null;
  } else {
    game.nextRound();
  }
});

$("#no").click(() => {
  if (!game) return;
  var previousItemIndex = game.currentRound - game.nback;
  if (previousItemIndex < 0 || game.currentItem != game.sequence[game.currentRound - game.nback]) {
    game.correctAnswers++;
  }
  game.updateScore(game.correctAnswers);
  if (game.currentRound == game.numItems - 1) {
    game.endGame();
    game = null;
  } else {
    game.nextRound();
  }
});

$("#goto-settings").click(() => {
  game = null;
  $("#game-display").hide();
  $("#settings-display").show();
});

$("#save-settings").click(() => {
  //TODO: check if numeric
  settings.nback = $("#num-back").val();
  settings.numItems = $("#num-items").val();
  alert("Settings saved!");
});
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
    $("#score-board").css("color", "black");
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

  updateScore(correct) {
    $("#score").html(this.correctAnswers);
    if (correct) {
      $("#score-board").css("color", "#459735");
    } else {
      $("#score-board").css("color", "#D15748");
    }
  }

  endGame() {
    $("#game-display").hide();
    stats.set_num_right(stats.num_right + this.correctAnswers);
    stats.set_num_wrong(stats.num_wrong + (this.numItems - this.correctAnswers));
    if (this.correctAnswers == this.numItems) {
      stats.set_winning_streak(stats.winning_streak + 1);
      stats.set_wins(stats.wins + 1);
    } else {
      stats.set_winning_streak(0);
      stats.set_losses(stats.losses + 1);
    }
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

class Stats {
  constructor() {
    this.set_wins(0);
    this.set_losses(0);
    this.set_winning_streak(0);
    this.set_num_right(0);
    this.set_num_wrong(0);
  }

  set_wins(wins) {
    this.wins = wins;
    $("#stats-wins").html(wins);
  }

  set_losses(losses) {
    this.losses = losses;
    $("#stats-losses").html(losses);
  }

  set_winning_streak(winning_streak) {
    this.winning_streak = winning_streak;
    $("#stats-winning-streak").html(winning_streak);
  }

  set_num_right(num_right) {
    this.num_right = num_right;
    $("#stats-num-right").html(num_right);
  }

  set_num_wrong(num_wrong) {
    this.num_wrong = num_wrong;
    $("#stats-num-wrong").html(num_wrong);
  }
}

//should probably be singletons
var stats = new Stats()
var settings = new Settings(2, 10);

var game = null;
//create a new game and start it when the start-game button is clicked
$("#start-game").click(function() {
  $("#stats-display").hide();
  $("#settings-display").hide();
  game = new NbackGame(settings);
  game.startGame();
});

$("#yes").click(() => {
  if (!game) return;
  var previousItemIndex = game.currentRound - game.nback;
  var correct = false;
  if (previousItemIndex >= 0 && game.currentItem == game.sequence[game.currentRound - game.nback]) {
    game.correctAnswers++;
    correct = true;
  }
  game.updateScore(correct);
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
  var correct = false;
  if (previousItemIndex < 0 || game.currentItem != game.sequence[game.currentRound - game.nback]) {
    game.correctAnswers++;
    correct = true;
  }
  game.updateScore(correct);
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
  $("#stats-display").hide();
  $("#settings-display").show();
});

$("#goto-stats").click(() => {
  $("#game-display").hide();
  $("#settings-display").hide();
  $("#stats-display").show();
});

$("#save-settings").click(() => {
  //TODO: check if numeric
  settings.nback = $("#num-back").val();
  settings.numItems = $("#num-items").val();
  alert("Settings saved!");
});
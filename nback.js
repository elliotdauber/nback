class NbackGame {
  constructor(settings) {
    this.sequence = [];
    this.settings = settings;
    this.currentRound = -1;
    this.correctAnswers = 0;
    this.gameStats = new GameStats();
  }

  onStart() {}

  startGame() {
    $("#game-display").show();
    $("#score").html(0);
    $("#score-board").css("color", "black");
    $("#yes").hide();
    $("#no").hide();
    $("#next").show();
    $("#correct").hide();
    $("#incorrect").hide();
    this.onStart();
    for (var i = 0; i < this.settings.numItems; i++) {
      this.sequence.push(this.generateItem());
    }
    this.nextRound();
  }

  nextRound() {
    this.currentRound++;
    this.currentItem = this.sequence[this.currentRound];
    this.displayItem(this.currentItem);
    if (this.currentRound == this.settings.nback) {
      $("#yes").show();
      $("#no").show();
      $("#next").hide();
    }

    if (!this.settings.selfPaced) {
      const roundTimerSetIn = this.currentRound;
      const game = this;
      setTimeout(function() {
        if (roundTimerSetIn == game.currentRound) {
          game.updateScore(false);
          if (game.currentRound == game.settings.numItems - 1) {
            game.endGame();
            game = null;
          } else {
            game.nextRound();
          }
        }
      }, 5000);
    }
  }

  updateScore(correct) {
    $("#score").html(this.correctAnswers);
    if (correct) {
      this.gameStats.increment_correct();
      $("#correct").show();
      $("#incorrect").hide();
    } else {
      this.gameStats.increment_incorrect();
      $("#incorrect").show();
      $("#correct").hide();
    }
  }

  endGame() {
    $("#game-display").hide();
    stats.set_num_right(stats.num_right + this.correctAnswers);
    stats.set_num_wrong(stats.num_wrong + (this.settings.numItems - this.correctAnswers));
    if (this.correctAnswers == this.settings.numItems) {
      stats.set_winning_streak(stats.winning_streak + 1);
      stats.set_wins(stats.wins + 1);
    } else {
      stats.set_winning_streak(0);
      stats.set_losses(stats.losses + 1);
    }
    console.log("ending game, adding stats");
    stats.add_game_stats(this.gameStats);

    alert("Game over! You scored " + this.correctAnswers + " out of " + this.settings.numItems);
    if (stats.winning_streak >= 3) {
      alert("You have completed 3 rounds at 100% accuracy! We suggest going to the next nback level. Go to the settings tab to do this. Great work!")
    }
  }
}

class AuditoryNbackGame extends NbackGame {
  generateItem() {
    if (this.sequence.length >= this.settings.nback && Math.random() < 0.45) {
      return this.sequence[this.sequence.length - this.settings.nback];
    }
    var index = Math.floor(Math.random() * this.settings.letters.length);
    var item = this.settings.letters[index];
    return item;
  }

  displayItem(item) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = item.toLowerCase();
    window.speechSynthesis.speak(msg);
  }

  onStart() {
    $("#display").hide();
  }
}

class VisualNbackGame extends NbackGame {
  generateItem() {
    if (this.sequence.length >= this.settings.nback && Math.random() < 0.45) {
      return this.sequence[this.sequence.length - this.settings.nback];
    }
    return Math.floor(Math.random() * 9);
  }

  displayItem(item) {
    const displayBoxList = $('.display-box').toArray();
    displayBoxList.forEach((displayBox, index) => {
      displayBox.classList.remove("active");
      if (index == item) {
        displayBox.classList.add("active");
      }
    })
  }

  onStart() {
    this.displayItem(-1);
    $("#display").show();
  }
}

class Settings {
  constructor(nback, numItems, selfPaced) {
    this.set_nback(nback);
    this.set_numItems(numItems);
    this.auditory = false;
    this.visual = true;
    this.selfPaced = selfPaced;
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

class GameStats {
  constructor() {
    this.correct = 0;
    this.incorrect = 0;
  }

  increment_correct() {
    this.correct++;
  }

  increment_incorrect() {
    this.incorrect++;
  }
}

class Stats {
  constructor() {
    this.gameStats = [];
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

  add_game_stats(gameStats) {
    this.gameStats.push(gameStats);
    console.log("game stats: " + this.gameStats.length);
  }
}

//should probably be singletons
var stats = new Stats()
var settings = new Settings(2, 20, $("#self-paced").prop("checked"));

var game = null;


// EVENT HANDLERS

//create a new game and start it when the start-game button is clicked
$("#start-game").click(function() {
  $("#stats-display").hide();
  $("#settings-display").hide();
  // TODO: change mode to enum
  if (settings.visual) {
    game = new VisualNbackGame(settings);
  } else if (settings.auditory) {
    game = new AuditoryNbackGame(settings);
  }
  game.startGame();
});

$("#yes").click(() => {
  if (!game) return;
  var previousItemIndex = game.currentRound - game.settings.nback;
  var correct = false;
  if (previousItemIndex >= 0 && game.currentItem == game.sequence[game.currentRound - game.settings.nback]) {
    game.correctAnswers++;
    correct = true;
  }
  game.updateScore(correct);
  if (game.currentRound == game.settings.numItems - 1) {
    game.endGame();
    game = null;
  } else {
    game.nextRound();
  }
});

$("#no").click(() => {
  if (!game) return;
  var previousItemIndex = game.currentRound - game.settings.nback;
  var correct = false;
  if (previousItemIndex < 0 || game.currentItem != game.sequence[game.currentRound - game.settings.nback]) {
    game.correctAnswers++;
    correct = true;
  }
  game.updateScore(correct);
  if (game.currentRound == game.settings.numItems - 1) {
    game.endGame();
    game = null;
  } else {
    game.nextRound();
  }
});

$("#next").click(() => {
  if (!game) return;
  game.correctAnswers++;
  game.updateScore(true);
  if (game.currentRound == game.settings.numItems - 1) {
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

  const tableBody = $("#pergame-stats-table tbody");
  // Clear existing rows
  tableBody.empty();
  // Generate rows for each game

  console.log("game stats num: " + stats.gameStats.length);
  stats.gameStats.forEach(game => {
    const accuracy = ((game.correct / (game.correct + game.incorrect)) * 100).toFixed(2);

    const row = $("<tr>");
    console.log(row);
    row.html(`
      <td>${game.correct}</td>
      <td>${game.incorrect}</td>
      <td>${accuracy}%</td>
    `);
    if (accuracy == 100.00) {
      row.addClass("flawless");
    }

    tableBody.append(row);
  });

  $("#stats-display").css('display', 'flex');
});

$("#save-settings").click(() => {
  //TODO: check if numeric
  settings.nback = $("#num-back").val();
  settings.numItems = $("#num-items").val();
  const sensoryMode = $('input[name=sensory-mode]:checked').val();
  settings.auditory = sensoryMode == 'auditory';
  settings.visual = sensoryMode == 'visual';
  settings.selfPaced = $("#self-paced").prop("checked");
  alert("Settings saved!");
});

$("#print-stats").click(print_stats);


// PRINTING

function print_stats() {
  const printContents = document.getElementById("stats-display").outerHTML;
  const popupWindow = window.open("", "_blank", "width=600, height=600");
  popupWindow.document.open();
  popupWindow.document.write(`
    <html>
    <head>
      <link rel="stylesheet" type="text/css" href="styles.css">
    </head>
    <body>
      ${printContents}
      <script type="text/javascript">
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `);
  popupWindow.document.close();
}

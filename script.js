app = {};
app.cards = [];
app.p1 = [];
app.p2 = [];
app.p1Hand = [];
app.p2Hand = [];
app.cardOne = "";
app.hitCard = [];
app.p1Total = 0;
app.p2Total = 0;
app.p1Clone = [];
app.p2Clone = [];
app.p1ScoreClone;
app.p2ScoreClone;

// betting caching / setting up
app.current = 500;
app.pool = 0;
app.winner = true;
const $myMoney = $(".earnings");
const $bettingPool = $(".bettingPool");
const $hitButton = $(".hit");
const $stayButton = $(".stay");
const $betButton = $(".bet");

// making a clone of initial unpopulated player areas and cards
app.captureInitialState = function() {
	for (let i = 0, y = 1; i < 5; i++, y++) {
		app.p1Clone[i] = $(`.p1 .card${y}`).clone();
		app.p2Clone[i] = $(`.p2 .card${y}`).clone();
	}
	app.p1ScoreClone = $(`.p1Score p`).clone();
	app.p2ScoreClone = $(`.p2Score p`).clone();
};

// on next round this gets rid of old html and restores initial state
app.restoreInitialState = function() {
	for (let i = 0, y = 1; i < 6; i++, y++) {
		$(`.p1 .card${y}`).replaceWith(app.p1Clone[i]);
		$(`.p2 .card${y}`).replaceWith(app.p2Clone[i]);
		// re-cloning the empty player areas so I can rinse and repeat
		app.p1Clone[i] = $(`.p1 .card${y}`).clone();
		app.p2Clone[i] = $(`.p2 .card${y}`).clone();
	}
	$(`.p1Score p`).replaceWith(app.p1ScoreClone);
	$(`.p2Score p`).replaceWith(app.p2ScoreClone);

	app.p1ScoreClone = $(`.p1Score p`).clone();
	app.p2ScoreClone = $(`.p2Score p`).clone();
};

app.createDeck = () => {
	app.cards.length = 0;
	for (let i = 2; i < 15; i++) {
		app.cards.push(i + " ♣️");
		app.cards.push(i + " ♦️");
		app.cards.push(i + " ♥️");
		app.cards.push(i + " ♠️");
	}
};

app.dealCards = () => {
	// Hand one
	for (let i = 0; i < 2; i++) {
		app.cardOne = Math.floor(Math.random() * app.cards.length);
		// find card value & push card to hand
		app.p1Hand.push(app.cards[app.cardOne]);
		// take card out of the deck
		app.cards.splice(app.cardOne, 1);
	}
	// Hand Two
	for (let i = 0; i < 2; i++) {
		app.cardOne = Math.floor(Math.random() * app.cards.length);
		// find card value & push card to hand
		app.p2Hand.push(app.cards[app.cardOne]);
		// take card out of the deck
		app.cards.splice(app.cardOne, 1);
	}
};
// hides deal button
app.hideMe = () => {
	$(".deal")
		.removeClass("animatingIn")
		.addClass("animatingOut")
		.attr("disabled", "true")
		.css({
			"animation-play-state": "running",
			"animation-fill-mode": "forwards",
			"animation-iteration-count": "1"
		});
};
// reveals deal button
app.showMe = () => {
	$(".deal")
		.toggleClass("animatingOut, animatingIn")
		.css("animation-fill-mode", "reverse")
		.removeAttr("disabled");
};

app.checkTotal = (player, playerHand, playerTotal) => {
	// parsing card number from raw data by splitting and taking the first value (card format ex [5, clubs])
	app[player].push(app[playerHand][0].split(" "));
	app[player].push(app[playerHand][1].split(" "));
	// logic for face cards (12 = J, 13 = Q, 14 = K but numeric value is 10)
	if (app[player][0][0] > 11) {
		app[player][0][0] = 10;
	}
	if (app[player][1][0] > 11) {
		app[player][1][0] = 10;
	}
	// adding two cards together
	// parse will ignore the words and only keep the number 🤯🤟🏻
	app[playerTotal] = parseInt(app[player][0]) + parseInt(app[player][1]);

	// if dealt two aces
	for (let i = 0; i < app[player].length; i++) {
		if (app[playerTotal] > 21 && app[player][i][0] == 11) {
			app[player][i][0] = 1;
			app[playerTotal] -= 10;
		}
		$(`.${player}Score p`).text(app[playerTotal]);
	}
	// if not dealt aces proceed as normal
	$(`.${player}Score p`).text(app[playerTotal]);
};

// put data on empty divs to look like playing cards
app.populateCards = function(playerHand, player) {
	// logic to show the face card letter opposed to a number
	$(`.card1, .card2`).css("display", "flex");
	for (let i = 0; i < 2; i++) {
		app[playerHand][i].split(" ");
		if (parseInt(app[playerHand][i]) == 11 || app[playerHand][i] == 1) {
			app[playerHand][i] = "A";
		}
		if (parseInt(app[playerHand][i]) == 12) {
			app[playerHand][i] = "J";
		}
		if (parseInt(app[playerHand][i]) == 13) {
			app[playerHand][i] = "Q";
		}
		if (parseInt(app[playerHand][i]) == 14) {
			app[playerHand][i] = "K";
		}
	}

	// populate card number and suit
	$(`.${player} .card1 h3, .${player} .card1 h4`)
		.text(app[playerHand][0].split(" ")[0])
		.addClass(app[player][0][1]);
	// populate middle suit symbol
	$(`.${player} .card1 .cardSuit`).text(app[player][0][1]);

	// same thing for card 2
	$(`.${player} .card2 h3, .${player} .card2 h4`)
		.text(app[playerHand][1].split(" ")[0])
		.addClass(app[player][1][1]);

	$(`.${player} .card2 .cardSuit`).text(app[player][1][1]);

	// color the diamond and heart cards
	app.colorCards("p1");
	app.colorCards("p2");
	$(`.p2 .card1 h3, .p2 .card1 .cardSuit, .p2 .card1 h4`).css("opacity", "0");

	if (app.p1Total == 21 || app.p2Total == 21) {
		app.showHouse();
		setTimeout(function() {
			app.endRound();
		}, 500);
	}
};

app.colorCards = function(player) {
	// future proofing for larger hands
	for (let y = 0; y < app[player].length; y++) {
		if (app[player][y][1] == "♥️" || app[player][y][1] == "♦️") {
			$(`.${player} .card${y + 1}`).addClass("brightSuit");
		}
	}
};

app.doubleDown = function() {
	if (app.current >= app.pool) {
		$(".doubleDown").removeAttr("disabled");
	}
};

// logic to hit new cards
app.hit = function(player, playerHand, playerTotal) {
	$(".doubleDown").attr("disabled", "true");
	setTimeout(function() {
		// pick a random card
		app.hitCard = Math.floor(Math.random() * app.cards.length);
		// find card value & push card to hand
		app[playerHand].push(app.cards[app.hitCard]);
		// take card out of the deck
		app.cards.splice(app.hitCard, 1);

		// pushing card to the player array to do face card logic
		let i = app[playerHand].length - 1;
		app[player].push(app[playerHand][i].split(" "));

		// face card logic for array value
		if (parseInt(app[player][i][0]) > 11) {
			app[player][i][0] = 10;
		}

		// face card display in hand logic
		for (let b = 0; b < app[player].length; b++) {
			app[playerHand][i].split(" ");
			if (parseInt(app[playerHand][b]) == 11 || app[playerHand][i] == 1) {
				app[playerHand][b] = "A";
			}
			if (parseInt(app[playerHand][b]) == 12) {
				app[playerHand][b] = "J";
			}
			if (parseInt(app[playerHand][b]) == 13) {
				app[playerHand][b] = "Q";
			}
			if (parseInt(app[playerHand][b]) == 14) {
				app[playerHand][b] = "K";
			}
		}

		// populateNewCard
		let q = app[playerHand].length;
		// show card
		$(`.${player} .card${q}`)
			.css("display", "flex")
			.addClass("animated");
		// populate card
		$(`.${player} .card${q} h3, .${player} .card${q} h4`)
			.text(app[playerHand][i].split(" ")[0])
			.addClass(app[player][i][1]);

		// populate middle suit symbol
		$(`.${player} .card${q} .cardSuit`).text(app[player][i][1]);

		// color those diamonds and hearts
		app.colorCards(player);

		// get new total
		app[playerTotal] += parseInt(app[player][i]);

		// check for bust
		for (let i = 0; i < app[player].length; i++) {
			// ace logic
			if (app[playerTotal] > 21 && app[player][i][0] == 11) {
				app[player][i][0] = 1;
				app[playerTotal] -= 10;
			}
			$(`.${player}Score p`).text(app[playerTotal]);
		}
		if (app.p1Total > 21) {
			app.freezePlayer();
			app.endRound();
		} else {
			app.checkWin();
		}
	}, 200);
};

// checking for 21 on each hit
app.checkWin = function() {
	if (app.p1Total == 21 || app.p2Total == 21) {
		app.freezePlayer();
		app.endRound();
	}
};

// stop player from hitting / staying outside of their turn
app.unfreezePlayer = () => {
	$hitButton.removeAttr("disabled");
	$stayButton.removeAttr("disabled");
	$betButton.attr("disabled", "true");
};

app.freezePlayer = () => {
	$hitButton.attr("disabled", "true");
	$stayButton.attr("disabled", "true");
};

// reveal houses' facedown card
app.showHouse = function() {
	$(`.p2 .card1`)
		.css("background", "#FAFAFA")
		.addClass("animated");
	$(`.p2 .card1 h3, .p2 .card1 .cardSuit, .p2 .card1 h4`).css("opacity", "1");
	$(`.p2Score p`).css("opacity", "1");
};

app.computerHit = function() {
	setTimeout(function() {
		if (app.p2Total < 17 && app.p1Total > app.p2Total) {
			app.hit("p2", "p2Hand", "p2Total");
		}
	}, 200);
	setTimeout(function() {
		if (app.p2Total < 17 && app.p1Total > app.p2Total) {
			app.hit("p2", "p2Hand", "p2Total");
		}
	}, 600);
	setTimeout(function() {
		if (app.p2Total < 17 && app.p1Total > app.p2Total) {
			app.hit("p2", "p2Hand", "p2Total");
		}
	}, 1000);
	setTimeout(function() {
		app.endRound();
	}, 1500);
};

app.endRound = function() {
	app.winner = true;
	app.freezePlayer();
	if (app.p1Total === 21) {
		app.winBy21();
		app.payOutLogic(3);
	} else if (app.p2Total === 21) {
		app.winner = false;
		app.loseSpecial();
		app.payOutLogic(0);
	} else if (app.p2Total > 21) {
		app.winEnd();
		app.payOutLogic(2);
	} else if (app.p1Total > 21) {
		app.winner = false;
		app.lose();
		app.payOutLogic(0);
	} else if (app.p1Total > app.p2Total) {
		app.winEnd();
		app.payOutLogic(2);
	} else if (app.p1Total === app.p2Total && app.p1Total > 0) {
		app.winTie();
		app.payOutLogic(1);
	} else if (app.p1Total > 0) {
		app.winner = false;
		app.lose();
		app.payOutLogic(0);
	}
};

app.nextRound = function() {
	$(".winScreen").css("display", "none");
	if (app.cards.length < 16) {
		app.createDeck();
	}

	if (app.current < 50) {
		app.moreMoney();
	}
	app.p1.length = 0;
	app.p2.length = 0;
	app.p1Hand.length = 0;
	app.p2Hand.length = 0;
	app.p1Total = 0;
	app.p2Total = 0;

	$betButton.removeAttr("disabled");
	$(".doubleDown").attr("disabled", "true");
	$(".earnings").toggleClass("attention attention2");
};

app.moreMoney = function() {
	app.winScreen();
	$win.children("h2").text("Uh Oh!");
	$win
		.css("display", "block")
		.children("p")
		.text(
			"You can't afford the minimum bet, that's rough! Let's try again, here's $500"
		);
	$win
		.children("button")
		.removeClass("playAgain")
		.addClass("getMoney");

	$(".getMoney").on("click", function() {
		$win.css("display", "none");
		$(".getMoney")
			.removeClass("getMoney")
			.addClass("playAgain");
	});
	if (app.current < 1) {
		app.current = 500;
		$myMoney.text("Wallet: $" + app.current);
		$(".bet").text("Bet $50");
	}
	app.showMe();
};

// ===================== //
//  win state  functions //
// ===================== //
$win = $(`.winScreen`);

app.winScreen = function() {
	$win.css("display", "block");
	$win.children("h2").text("Winner!");
};

app.winBy21 = function() {
	app.winScreen();
	$win.children("h2").text(`BLACKJACK!`);
	$win.children("p").text(`Congratulations! You get the big bucks!`);
};

app.winEnd = function() {
	app.winScreen();
	$win.children("p").text("congratulations! Enjoy your Winnings.");
};

app.winTie = function() {
	app.winScreen();
	$win.children("h2").text("You tied!");
	$win.children("p").text(`No one wins, but at least you get your bet back!`);
};

app.lose = function() {
	app.winScreen();
	$win.children("h2").text("Oh no!");
	$win.children("p").text("You lost. Keep trying though! 💀");
};

app.loseSpecial = function() {
	app.winScreen();
	$win.children("h2").text("Oh no!");
	$win.children("p").text(`The house got 21, that's just bad luck.`);
};

// ======= //
// BETTING //
// ======= //
app.betLogic = () => {
	app.current -= 50;
	app.pool += 50;
	$myMoney.text("Wallet: $" + app.current);
	$bettingPool.text("Current Bet $" + app.pool);
	if (app.current <= 25) {
		$betButton.attr("disabled", "true");
	}
};

app.payOutLogic = amount => {
	if (app.winner) {
		app.current += app.pool * amount;
	}
	app.pool = 0;
	$myMoney.text("Wallet: $" + app.current);
	$(".bettingPool").text("Current Bet $0");
};

// ======== //
// SHOPPING //
// ======== //
$(`.shop`).on("click", function() {
	// show the shop
	$(".shopWindow").css("display", "block");
	// grab the table values and manipulate them to get prices
	const shopItems = $(".table")
		.text()
		.split("$")
		.filter(item => {
			// ignoring 'switch' because that's the value of a purchased table
			return item !== "Switch";
		});
	// assess if I have enough to afford the tables
	function checkPrice() {
		shopItems.forEach(item => {
			if (app.current < item) {
				$(`.${item}`).attr("disabled", true);
			} else if ($(".shopWindow button").hasClass(item)) {
				$(`.${item}`).removeAttr("disabled");
			}
			// logic to purchase a table
			$(`.${item}`).on("click", function() {
				// if its free don't charge me!
				if ($(this).hasClass("free")) {
					app.current = app.current;
				} else {
					// take the cost out of my wallet!
					app.current -= item;
					$(`.${item}`)
						.text("Switch")
						.removeClass(item)
						.addClass("free");
					$(".earnings").text("Wallet: $" + app.current);
					// disable bet button if I can't afford it
					if (app.current <= 50) {
						$betButton.attr("disabled", "true");
					}
					// run the function again to disable the tables I can't afford now
					checkPrice();
				}
			});
		});
	}
	checkPrice();
});

// =================== //
// table color palettes //
// =================== //
$(".closeShop").on("click", function() {
	$(".shopWindow").css("display", "none");
});

$(".changeTable1").on("click", function() {
	$(":root").css({
		"--primary": "#446455",
		"--primaryLight": "#adc7bb",
		"--primaryDark10": "#2f463b",
		"--primaryDark20": "#1b2721",
		"--background": "#212a29",
		"--tertiary": "#6c5021",
		"--tertiaryDark": "#291e0c"
	});
});

$(".changeTable2").on("click", function() {
	$(":root").css({
		"--primary": "#A1454A",
		"--primaryLight": "#ca8286",
		"--primaryDark10": "#5a2629",
		"--primaryDark20": "#361719",
		"--background": "#2d2827",
		"--tertiary": "#6c5021",
		"--tertiaryDark": "#291e0c"
	});
});

$(".changeTable3").on("click", function() {
	$(":root").css({
		"--primary": "#5c415d",
		"--primaryLight": "#ac8aad",
		"--primaryDark10": "#3e2c3f",
		"--primaryDark20": "#211721",
		"--background": "#332e33",
		"--tertiary": "#6c5021",
		"--tertiaryDark": "#291e0c"
	});
});

$(".changeTable4").on("click", function() {
	$(":root").css({
		"--primary": "#292f36",
		"--primaryLight": "#dee2e6",
		"--primaryDark10": "#131619",
		"--primaryDark20": "#000000",
		"--background": "#232323",
		"--tertiary": "#fdd262",
		"--tertiaryDark": "#f0b92e"
	});
});

// ========================================= //
//  IINNNNNIIIITTTTTTIIAALLLIIIZEEEE IIIITTT //
// ========================================= //
// as this is a click based game all of my functions are running in response to listener events which is why I've structured it like this. I was having issues with events running more than once when the listeners were inside other functions
app.init = function() {
	app.captureInitialState();
	app.createDeck();

	$(".rulesButton, .letsPlay, .closeRules").on("click", function() {
		$(".rulesModal").toggleClass("show, hide");
	});

	$(".bet").on("click", function() {
		app.betLogic();
	});

	$(`.deal`).on("click", function(e) {
		e.preventDefault();
		app.dealCards();
		app.hideMe();
		app.unfreezePlayer();
		app.checkTotal("p1", "p1Hand", "p1Total");
		app.checkTotal("p2", "p2Hand", "p2Total");
		app.populateCards("p1Hand", "p1");
		app.populateCards("p2Hand", "p2");
		app.doubleDown();
	});

	$(`.hit`).on("click", function(e) {
		e.preventDefault();
		app.hit("p1", "p1Hand", "p1Total");
	});

	$(`.stay`).on("click", function(e) {
		e.preventDefault();
		app.freezePlayer();
		app.showHouse();
		app.computerHit();
	});

	$(".doubleDown").on("click", function() {
		app.current -= app.pool;
		app.pool += app.pool;
		$(".bettingPool").text("Current Bet $" + app.pool);
		$("earnings").text("Wallet: $" + app.current);
		app.hit("p1", "p1Hand", "p1Total");
		$(".doubleDown").attr("disabled", "true");
		app.freezePlayer();
		setTimeout(function() {
			app.showHouse();
			app.computerHit();
		}, 1500);
	});

	$(".winScreen").on("click", ".playAgain", function(e) {
		e.preventDefault();
		app.nextRound();
		app.showMe();
		app.restoreInitialState();
	});
};

$(function() {
	app.init();
});

const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const HTTPServer = require("http");

const app = express();
const port = process.env.PORT || 3000;
app.set("port", port);

const http = HTTPServer.createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./public/index.html"));
});

app.use(express.static("public"));

const users = {};
const scores = {};

//Temp solution, manual questions
const questions = {};
addQuestions();
var keys = Object.keys(questions);
var currentQuestion = keys[Math.floor(Math.random() * keys.length)];
var currentAnswer = questions[currentQuestion];
var hintString = "";
var hintsGiven = 0;
setInitialHintString();

var timer = setInterval(periodicHinting, 10000);

io.on("connection", (socket) => {
  socket.on("new-user", (name) => {
    users[socket.id] = name;
    scores[name] = 0;
    socket.broadcast.emit("user-connected", { name: name, id: socket.id });
    socket.emit("return-local-id", socket.id);
    socket.emit(
      "simple-message",
      "Welcome, " +
        name +
        "!\n The current question is:\n" +
        currentQuestion +
        "\n" +
        hintString
    );
    socket.emit("display-question-new-user", currentQuestion);
  });
  socket.on("send-chat-message", (message) => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
    });
    if (parseForAnswer(message)) {
      updateCurrentQuestion();
      clearInterval(timer);
      timer = setInterval(periodicHinting, 10000);
      scores[users[socket.id]]++;
      io.sockets.emit("increment-score", socket.id);
      io.sockets.emit("sort-list");
      io.sockets.emit("right-answer", {
        name: users[socket.id],
        question: currentQuestion,
        hint: hintString,
      });
    }
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    socket.broadcast.emit("remove-name-from-list", socket.id);
    delete users[socket.id];
    delete scores[users];
    io.sockets.emit("sort-list");
  });

  //I think this can be moved to socket.on('new-user')
  socket.on("return-namelist", () => {
    socket.emit("fresh-names", { users: users, scores: scores });
  });
});

function parseForAnswer(message) {
  if (message.toLowerCase() == currentAnswer) {
    return true;
  }
  return false;
}

function getRandomQuestion() {
  return keys[Math.floor(Math.random() * keys.length)];
}

function updateCurrentQuestion() {
  currentQuestion = keys[Math.floor(Math.random() * keys.length)];
  currentAnswer = questions[currentQuestion];
  setInitialHintString();
}

function setInitialHintString() {
  hintString = currentAnswer
    .replace(/[a-zA-Z0-9]/g, "_")
    .split("")
    .join(" ")
    .split("   ")
    .join("\xa0\xa0\xa0");
  hintsGiven = 0;
}

//bruteforcey, but it's not all that demanding or frequent so should be np
function updateHint() {
  let numHintLetters = 0;
  if (currentAnswer.length <= 6) {
    numHintLetters = 1;
  } else if (currentAnswer.length <= 13) {
    numHintLetters = 2;
  } else {
    numHintLetters = 3;
  }
  for (let i = 1; i <= numHintLetters; i++) {
    let hintIndex = Math.floor(Math.random() * currentAnswer.length);
    while (hintString.charAt(hintIndex * 2) !== ("_" || " ")) {
      hintIndex = Math.floor(Math.random() * currentAnswer.length);
    }
    let hintLetter = currentAnswer.charAt(hintIndex);
    hintString = setCharAt(hintString, hintIndex * 2, hintLetter);
  }
}

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substr(0, index) + chr + str.substr(index + 1);
}

function periodicHinting() {
  let oa = "";
  if (hintsGiven == 0) {
    updateHint();
    io.sockets.emit("simple-message", "Hint: " + hintString);
    hintsGiven++;
  } else if (hintsGiven == 1) {
    updateHint();
    io.sockets.emit("simple-message", "Hint: " + hintString);
    hintsGiven++;
  } else if (hintsGiven >= 2) {
    oa = currentAnswer;
    updateCurrentQuestion();
    io.emit("nobody-got-it", { oa: oa, nq: currentQuestion, hs: hintString });
  }
}

function addQuestions() {
  questions["What is the capital of Sweden?"] = "stockholm";
  questions["What is the capital of Denmark?"] = "copenhagen";
  questions["What is the capital of Norway?"] = "oslo";
  questions["What is the capital of Germany?"] = "berlin";
  questions["What is the world's 10th largest country?"] = "algeria";
  questions["What country won the very first FIFA World Cup in 1930?"] =
    "uruguay";
  questions["Which hockey team did Wayne Gretzky play for in the ‘80s?"] =
    "edmonton oilers";
  questions["What does “HTTP” stand for?"] = "hypertext transfer protocol";
  questions["What year was the very first model of the iPhone released?"] =
    "2007";
  questions["Who is often called the father of the computer?"] =
    "charles babbage";
  questions["What is measured in the Richter scale?"] = "earthquakes";
  questions["Which planet has the most gravity?"] = "jupiter";
  questions["Which country produces the most coffee in the world?"] = "brazil";
  questions["What’s the primary ingredient in hummus?"] = "chickpeas";
  questions["In which body part can you find the femur?"] = "leg";
  questions["What does the acronym AIDS stand for?"] =
    "acquired immune deficiency syndrome";
  questions["Which American state is the largest (by area)?"] = "alaska";
  questions["What is the capital of New Zealand?"] = "wellington";
  questions["What is the name of the desert located around Mongolia?"] = "gobi";
  questions["What was the name of the rock band formed by Jimmy Page?"] =
    "led zeppelin";
}

const server = http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

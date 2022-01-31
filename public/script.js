const socket = io("https://quizapalooza.herokuapp.com/");
const messageContainer = document.getElementById("message-container");
const timeStamps = document.getElementById("time-stamps");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const nameList = document.getElementById("name-list");
var currentQuestionText = document.getElementById("current-question-text");
var ownId;

const sampleNames = ["ronnieTheRascal", "bobTheBreaker", "andyTheAngry"];

var sampleName =
  sampleNames[Math.floor(Math.random() * sampleNames.length - 0.00001)];
var inputName = prompt("What is your name? (30 characters maximum)");
if (inputName && inputName.length <= 30) {
  name = inputName;
} else {
  name = sampleName;
}

//Initialize the scoreboard and tell the server your name
socket.emit("new-user", name);
socket.emit("return-namelist");

//Displays a message from another user to the client
socket.on("chat-message", (data) => {
  appendMessage(data.name + ": " + data.message);
});

//Add a recently connected user to your namelist and add a message to chat
socket.on("user-connected", (nameid) => {
  var initScore = 0;
  appendMessage(nameid.name + " connected");
  appendName(nameid.id, nameid.name, initScore);
  colorTopList();
});

//Display to other users in the chat that someone have disconnected
socket.on("user-disconnected", (name) => {
  appendMessage(name + " disconnected");
});

//This is only for when a new user connects, to get the full names list
socket.on("fresh-names", (returns) => {
  for (var id in returns.users) {
    appendName(id, returns.users[id], returns.scores[returns.users[id]]);
  }
  sortList();
});

//Recieve id of disconnected user, divs in nameList have id "nameof + socket.id"
socket.on("remove-name-from-list", (id) => {
  let divId = "nameof" + id;
  removeName(divId);
});

//increments the score of whichever user answered a question right, identified by id
socket.on("increment-score", (id) => {
  let divId = "nameof" + id;
  let element = document.getElementById(divId);
  let oldScore = parseInt(element.childNodes[1].innerText);
  element.childNodes[1].innerText = oldScore + 1;
});

//sorts the high scores list. Happens whenever a score is changed.
socket.on("sort-list", () => {
  sortList();
});

//simple message format for messages from the server
socket.on("simple-message", (message) => {
  appendMessage(message);
});

//recieves an object containing a name and a question
socket.on("right-answer", (naqah) => {
  appendMessage(
    "Correct answer from " +
      naqah.name +
      "!\n\nNext question: " +
      naqah.question +
      "\n" +
      naqah.hint
  );
  currentQuestionText.innerText = naqah.question;
});

//Stores your local socket id
socket.on("return-local-id", (id) => {
  ownId = id;
});

//Updates the question bar below the message box
socket.on("display-question-new-user", (question) => {
  currentQuestionText.innerText = question;
});

//oanq contains oa = old answer to question nobody got, nq = new question and hs = hintString for new question
socket.on("nobody-got-it", (oanq) => {
  appendMessage(
    "Time's up! The correct answer was: " +
      oanq.oa +
      "\nNext question: " +
      oanq.nq +
      "\n" +
      oanq.hs
  );
  currentQuestionText.innerText = oanq.nq;
});

//Recognize button presses and sent their content to the server
messageForm.addEventListener("submit", (e) => {
  //Disables pressing the button when field is empty
  e.preventDefault();
  const message = messageInput.value;
  socket.emit("send-chat-message", message);
  appendMessage("You: " + message);
  messageInput.value = "";
});

//Add submitted messages to the chat
function appendMessage(message) {
  var atBottom = isElementScrolledToBottom(messageContainer);

  var time = getTime();
  const messageElement = document.createElement("div");
  const timeElement = document.createElement("div");
  const contentElement = document.createElement("p");
  contentElement.innerText = message;
  timeElement.innerText = time;
  messageElement.setAttribute("class", "messageInfoBox");
  contentElement.setAttribute("class", "msgElement");
  timeElement.setAttribute("class", "timeElement");

  messageElement.append(contentElement);
  messageElement.append(timeElement);
  messageContainer.append(messageElement);
  if (atBottom) {
    scrollToBottom(messageContainer);
  }
}

//Add a recently connected user's name to the name list
function appendName(id, name, score) {
  const topListElement = document.createElement("div");
  const topListName = document.createElement("div");
  const topListScore = document.createElement("div");
  topListElement.setAttribute("class", "name-list-element");
  topListName.setAttribute("class", "name-list-name");
  topListScore.setAttribute("class", "name-list-score");
  let divId = "nameof" + id;
  topListElement.setAttribute("id", divId);
  topListName.innerText = name;
  if (id == ownId) {
    topListName.innerText = "(you) " + name;
  }
  topListScore.innerText = score;
  nameList.append(topListElement);
  topListElement.append(topListName);
  topListElement.append(topListScore);
}

//Remove the div containing the disconnected users' name from the nameList by id
function removeName(divId) {
  var element = document.getElementById(divId);
  element.parentNode.removeChild(element);
}

//Remove the div containing the disconnected users' name from the nameList by id
function removeName(divId) {
  var element = document.getElementById(divId);
  element.parentNode.removeChild(element);
  console.log("statement reached");
}

//parses current time into a 00:00:00 string
function getTime() {
  var today = new Date();
  let hour = today.getHours().toString();
  let minute = today.getMinutes().toString();
  let second = today.getSeconds().toString();
  if (hour.length <= 1) {
    hour = "0" + hour;
  }
  if (minute.length <= 1) {
    minute = "0" + minute;
  }
  if (second.length <= 1) {
    second = "0" + second;
  }
  return hour + ":" + minute + ":" + second;
}

//insertion sort of name list based on score
function sortList() {
  for (var i = 2; i < nameList.children.length; i++) {
    for (var j = i - 1; j > 0; j--) {
      if (
        parseInt(nameList.children[j].children[1].innerText) <
        parseInt(nameList.children[j + 1].children[1].innerText)
      ) {
        nameList.insertBefore(nameList.children[j + 1], nameList.children[j]);
      } else {
        break;
      }
    }
  }
  colorTopList();
}

//Very poor scaling, should be improved
//Brute force makes sure that the top elements have the right ordered color
function colorTopList() {
  if (nameList.children.length > 1) {
    nameList.children[1].classList.remove("gold-color");
    nameList.children[1].classList.remove("silver-color");
    nameList.children[1].classList.remove("bronze-color");
    nameList.children[1].classList.add("gold-color");
  }

  if (nameList.children.length > 2) {
    nameList.children[2].classList.remove("gold-color");
    nameList.children[2].classList.remove("silver-color");
    nameList.children[2].classList.remove("bronze-color");
    nameList.children[2].classList.add("silver-color");
  }
  if (nameList.children.length > 3) {
    nameList.children[3].classList.remove("gold-color");
    nameList.children[3].classList.remove("silver-color");
    nameList.children[3].classList.remove("bronze-color");
    nameList.children[3].classList.add("bronze-color");
  }

  for (var i = 4; i < nameList.children.length; i++) {
    nameList.children[i].classList.remove("gold-color");
    nameList.children[i].classList.remove("silver-color");
    nameList.children[i].classList.remove("bronze-color");
  }
}

//function to check if element is scrolled to the bottom
function isElementScrolledToBottom(el) {
  if (el.scrollTop >= el.scrollHeight - el.offsetHeight) {
    return true;
  }
  return false;
}

//function to scroll to bottom
function scrollToBottom(el) {
  el.scrollTop = el.scrollHeight;
}

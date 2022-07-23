var requestpromise = require('request-promise');
var querystring = require('querystring');
const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const BOT_IMG = "../pictures/botpic.png";
const PERSON_IMG = "../pictures/userpic.jpg";
const BOT_NAME = "BOT";
const PERSON_NAME = "Amazing Customer";
var dataBase = [];
const fallbackMessages = 
  ["Ich verstehe nicht", "Wie bitte?","Könnten Sie bitte nochmal sagen?","Tut mir leid, ich fürchte, ich verstehe Sie nicht.", "Huh?"];
var userInput;


async function predict(){
  var endpointKey = "72fb65b98a0242cb87c52b10b3344114";
  var endpoint = "internettech.cognitiveservices.azure.com";
  var appId = "1d47b635-ff01-49e3-bc23-dec56db126fe";
  var utterance = userInput;
  var queryParams = {
      "show-all-intents": true,
      "verbose":  true,
      "query": utterance,
      "subscription-key": endpointKey
  }
  var URI = `https://${endpoint}/luis/prediction/v3.0/apps/${appId}/slots/staging/predict?${querystring.stringify(queryParams)}`
  const luisReply = await requestpromise(URI);
  return JSON.parse(luisReply)
}

msgerForm.addEventListener("submit", event => {
  event.preventDefault();
  const msgText = msgerInput.value;
  if (!msgText) return;
  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  userInput = msgerInput.value;
  msgerInput.value = "";
  botResponse();
});

function appendMessage(name, img, side, text) {
  //   Simple solution for small apps
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

function ansGenerator(reply){
  var ans = "error"
  switch (reply.prediction.topIntent){
      case "None":
        ans = fallbackMessagesGenerator()
        break;
    	case "essen":
      case "trinken":
        ans = checkOrder(reply);
        break;
      case "denial":
        ans = `Sie haben ${dataBaseAnsGenerator()} bestellt. Wann holen Sie Ihre Bestellung ab?`
        break;
      case "abholungszeiten time":
        ans = timeValidityChecker(reply) 
        break;
      case "abholungszeiten duration":
        ans = `Alles klar, wir sehen uns nach ${reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].numbers[0]} ${Object.keys(reply.prediction.entities)[0]}`
        break;
  }
  return ans;
}

function timeValidityChecker(reply){
  var ans = "error in time checker"
  if (Object.keys(reply.prediction.entities)[0] != undefined){
    var hours = reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].hours[0]
    var minutes;
    if (reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].minutes != undefined){
      minutes = reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].minutes[0]
    }
    if (minutes == undefined){
      hours > new Date().getHours() && hours < 24? ans = `Okay, wir sehen uns um ${hours} Uhr, bis dann!`: ans = "Bitte geben Sie eine gultige Zeit an" 
    }else{
      hours >= new Date().getHours() && hours < 24?
      minutes > new Date().getMinutes() && minutes <60? ans = `Wir sehen uns um ${hours} Uhr ${minutes}, bis später!`: ans = "Bitte geben Sie eine gultige Zeit an" : 
      ans ="Bitte geben Sie eine gultige Zeit an"
    }
  } else{
    ans = fallbackMessagesGenerator()
  }
  return ans
}

function botResponse() {
  var reply;
  predict().then(function(result){
    reply = result})
  const delay = 1300;

  setTimeout(() => 
  appendMessage(BOT_NAME, BOT_IMG, "left", ansGenerator(reply))
, delay);
}

function fallbackMessagesGenerator(){
  let i = random(0,fallbackMessages.length)
  return fallbackMessages[i]
}

function dataBaseAnsGenerator(){
  var ans = dataBase[0]
  for (i = 1; i < dataBase.length; i++){
    ans += ", " + dataBase[i]
  }
  return ans 
}

function checkOrder(reply){
// Intents: food and drink 
var order;
if (Object.keys(reply.prediction.entities)[0] != undefined){
if (reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].numbers == undefined){
  order =
  [`Okay, Sie möchten ${Object.keys(reply.prediction.entities)[0]} zum ${reply.prediction.topIntent}. Gibt es noch was, das Sie bestellen möchten?`,
  `Alles klar, ${Object.keys(reply.prediction.entities)[0]} zum ${reply.prediction.topIntent}. Noch was?`,
  `${Object.keys(reply.prediction.entities)[0]} zum ${reply.prediction.topIntent}. Möchten Sie noch etwas bestellen?`];
  dataBase.push(`${Object.keys(reply.prediction.entities)[0]}`)
}else{
  order = 
  [`Okay, Sie möchten ${reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].numbers[0]} ${Object.keys(reply.prediction.entities)[0]} zum ${reply.prediction.topIntent}. Gibt es noch was, das Sie bestellen möchten?`,
  `Alles klar, ${reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].numbers[0]} ${Object.keys(reply.prediction.entities)[0]} zum ${reply.prediction.topIntent}. Noch was?`,
  `${reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].numbers[0]} ${Object.keys(reply.prediction.entities)[0]} zum ${reply.prediction.topIntent}. Möchten Sie noch etwas bestellen?`]
  dataBase.push(`${reply.prediction.entities[Object.keys(reply.prediction.entities)[0]][0].numbers[0]} ${Object.keys(reply.prediction.entities)[0]}`)
}
}
var ans;
if (Object.keys(reply.prediction.entities)[0] == undefined){
  let i = random(0,fallbackMessages.length)
  ans = fallbackMessages[i]
}else{
  let i = random(0,order.length)
  ans = order[i]
}
return ans
}

// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();
  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

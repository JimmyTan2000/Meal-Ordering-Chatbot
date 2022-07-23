# Starten des Apps:
Um diese Chatbot zu starten, kann man entweder "index.html" oder "app.js" benutzen.

## Option 1: mit "index.html"
mit 'go live' Funktion in eine IDE wie VS Code 

## Option 2: mit "app.js"
in eine kommandozeile, mit:
"node app.js"
Ausgabe: "server started at http://localhost:3000"

# Codes:
1. Html: index.html
2. CSS: sheet.css
3. JS: newbot.js 

# Achtung:
Weil der Browser die require('...') in newbot.js nicht verstehen kann, habe ich newbot.js in bundle.js mit den folgenden Befehl umgewandelt:
"browserify ./src/newbot.js > ./dist/bundle.js"
(man muss zuerst browserify mit "npm install browserify" installieren)



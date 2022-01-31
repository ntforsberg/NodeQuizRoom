# ProjINDAchatroom

Projektuppgift INDA

Authors: Nils Tobias Forsberg, Muhammed Rahimzadagan

Handledare: Johan Henning

Description: Planen är att konstruera ett chatrum i ffa javascript men även tillhörande HTML/CSS. Chatrummet ska kunna hantera olika användare, helst med inloggningsmöjligheter men i annat fall som temporära användare. Därefter, i mån av tid, ska ytterligare funktionalitet tillkomma i form av bl.a en chat-bot som ställer frågor samt ger ledtrådar till svaret och läser alla meddelanden som produceras i chatten för se ifall någon ger rätt svar. Antal rätta svar per användare ska lagras på serversidan.

Status 13 maj: Sidan är deployad på https://quizapalooza.herokuapp.com/, och näst intill all funktionalitet är tillagd utom sparade användare.

Verktyg: Node.js (dependencies: nodemon, sockets.io, JQuery), javascript, HTML, CSS

Installation: för att köra koden lokalt måste du först ladda ner node.js till din dator. Kör därefter i foldern följande terminalkommandon:
$ npm init
(klicka enter tills de slutar ge prompts)
$ npm install

därefter kan koden köras, förslagsvis med
\$ node start
vilket kommer starta servern.
skriv därefter in localhost:3000 i din webläsare för att se hemsidan.

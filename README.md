# Link_Shortener
## About
Webanwendung zum erstellen einer gekürzten Url mit generiertem Kürzel.

## Features
- Erstellung einer random ShortURL
- Erstellung einer ShortURL mit eigen ausgewählten acronymen.
- Admin Seite zum einsehen der Aufrufe
- Weiterleitung zur Ziel-URL  

### Installation
```
npm install
```

### Start Frontend with hot reload
gestartet aus dem Pfad: ./prospr2_frontend/linkshortener
```
npm run serve
```
### Start Express Server ( Backend )
gestartet aus dem Pfad: ./prospr2_backend
```
node index.js
```

## Technologies

- MongoDB als Datenbank
- Express als serverseitiges Webframework im Backend
- Vue.js als clientseitiges JavaScript-UI Framework
- HTML, CSS
- Axios als HTTP client im Browser


# Code Explained

## Index.js
Zunächst Wird Express eingebunden. Danach wird eine Verbindung zur MongoDB Datenbank aufgebaut. Ist dies erfolgt wird ein Adminkürzel generiert mit 5 zufälligen Zahlen.
Im nächsten Schritt folgt eine Function zur generierung der URL-Kürzel. In der Function läuft eine "while" Schleife welche Überprüft ob der Link schon existiert. Ist dass der fall werden neue generiert bis eine, noch nicht vorhandene Kombination, gefunden wird. Ist das erfolgt wird die URL mit Kürzel in die Datenbank übergeben. Außerdem wird der Counter erhöht, zum einsehen auf der Admin Seite. 

## HelloWorld.vue
In dieser Datei wurde das Frontend mit Vue.js angepasst. Sie besteht aus einem Div in dem alle Aktionen vorgenommen werden. Es gibt für "Random_URL" und "Choose_URL" jeweils ein Tab im Frontend. Es gibt darunter ein Input Feld für die zu kürzende URL sowie einen Button zum kürzen. Ist jedoch der "Random_URL" Tab ausgewählt erscheint zusätzlich ein Inputfeld welches das gewünschte Kürzel übergibt.
Außerdem gibt es eine Redirection-Page, sowie eine Error Page.

## Benutzung Admin Seite und co.
Um die Admin Seite zu erreichen muss hinter den Weblink ( http://localhost:8080/ ) noch eine erweiterung hinzugefügt werden -> 
### .../admin/<generiertes Kürzel>

Um auf die "Unknown" seite zu gelangen muss eine ungültge URL eingegeben werden.





_DETAILLIERTE INFORMATIONEN IM CODE KOMMENTIERT_








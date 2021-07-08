const express = require('express')
const app = express()
const port = 4000
app.use(express.json())

/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
next();
});*/

// MongoDB-Client
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbuser:Paul2203@linkshortener.nm8ea.mongodb.net/LinkShortener?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let connection = ""

let adminPost = ""
stat = 500

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('') // Array mit allen Buchstaben und Zahlen

// Verbindung herstellen
connectDB()


// Funktion stellt Verbindung zur Datenbank her
async function connectDB() {

    try {
        await client.connect();
        connection = client.db("LinkShortener").collection("PaulsKiste")

        console.log("Successfully connected to database!")

    } catch {
        console.error("couldnt connect to database.")
        await client.close();
    }
}


function generateAdmin() {
    
    let short = ""                                                     // String für generiertes Admin-Kürzel

    for (let i = 0; i < 6; i++) {                                      // random 6 Stellen
        short += chars[Math.floor(Math.random() * chars.length)]
    }

    return short
}


// Kürzelgenerierung (wird in myShortingFunction angewandt)
function generateShort(url) {

    // trenne zuerst http(s)-Teil von der URL.
    if (url.includes("//")) { 
        url = url.split("/")
        url = url[2]
    }
    // nur Name der Domain behalten (entferne www, .de/com/...)
    url = url.split(".")
    let dom = url[url.length-2]

    //kürze Domain
    let surl = dom.replace(/[aeiou]/g, "")            // ersetze alle Vokale
    surl = surl.substring(0,3)                        // behalte nur die ersten 3 Stellen

    const vow = "aeiou".split('')
    // falls erster Buchstabe der Domain ein Vokal ist, behalte diesen.
    for (let i = 0; i < vow.length; i++) {
        if (dom[0] === vow[i]) {
            surl = vow[i] + surl.substring(0,2)
        }
    }
 
    let short = ""                                                  // String für generiertes Kürzel

    for (let i = 0; i < 5; i++) {                                   // generiere zweiten Teil des Kürzels mit random 5 Stellen
        short += chars[Math.floor(Math.random() * chars.length)]
    }

    const kuerzel = surl + "-" + short
    return kuerzel
}


// prüft URL und ordnet ein generiertes Kürzel zu
async function myShortingFunction(url, short, mode) {

    console.log("url: " + url + ", short: " + short, ", mode:" + mode) 
    if (mode) {
        console.log("true: Kürzel ist nicht random.")
    } else {
        console.log("false: Kürzel ist random.")
    }

    // breche ab, falls URL oder Kürzel nicht gültig
    if (url === "" || url.includes("http") === false) {
        console.error("URL enthält ungültige Daten oder ist leer!")
        // gebe Stauscode an
        stat = 406
        return
    } 
    if (mode) {
        if (!short || short.includes("/") === true) {
            console.error("Wunschkürzel ist leer oder enthält ungültige Zeichen!")
            // gebe Stauscode an
            stat = 416
            return
        }
    } 
    
    // behalte übergebene URL
    const link = url
    // Variable für Kürzel
    let kuerzel = ""
    // Variable für Admin-Code
    let admin = generateAdmin()
    adminPost = admin

    // hier durch while-Schleife solange neues Kürzel generieren, bis ein noch nicht vorhandenes dabei rauskommt.
    let exists = true
    while (exists === true) {
        // überprüfe, ob ein Wunschkürzel (falls mode = true) festgelegt wurde -> Generierung würde wegfallen, übernehme Wunsch-Kürzel.
        if (mode) {
            kuerzel = short
        } else {
            kuerzel = generateShort(link)
        }

        // prüfe, ob Eintrag mit generiertem Kürzel bereits existiert: kann ich zugreifen?
        let eintrag = await findUrlDB(kuerzel)

        // wenn ein Eintrag schon vorhanden ist, breche ohne neuen Eintrag ab (return). Wenn nicht, führe Funktion weiter aus.
        if (eintrag) {
            console.log('Eintrag mit Kürzel existiert schon!')
            if (mode) {
                // gebe Stauscode an
                stat = 409
                return // Abbruch, wenn Wunschkürzel schon existiert.
            }
        } else {
            console.error('Eintrag mit Kürzel existiert (noch) nicht!')
            exists = false
        }

        console.log(exists)
    }

    // Eintrag mit Url und Short in Datenbank schreiben
    await writeFileDB(link, kuerzel, admin)

    return kuerzel // Kürzel zurückgeben
}


// erstellt Eintrag in Datenbank
async function writeFileDB(link, kuerzel, admin) {
    try {
        await connection.insertOne({
            originalURL: link,
            shortCode: kuerzel,
            clickCounter: 0,
            dateCreated: new Date(),
            adminCode: admin,
            // adminIP
        })
    } catch {
        console.error("Eintrag konnte nicht erstellt werden.")
    }
}

// findet URL für Kürzel
async function findUrlDB(kuerzel){
    let eintrag = await connection.findOne({
        shortCode: kuerzel
    });

    return eintrag
}

// erhöht Klickzähler für Eintrag in Datenbank
async function addCounterDB(short, counter){
    let add = counter + 1
    console.log(add)

    try {
        await connection.updateOne(
            {shortCode: short}, 
            {$set: {clickCounter: add}}
        );
    } catch {
        console.error("Eintrag konnte nicht aktualisiert werden.")
    }
}


// "code" GET-Endpoint übergibt alle Informationen eines Datenbank-Eintrags
app.get('/code/:inputcode', async (req, res) => {
    //in req.params.inputcode steckt das was im Browser angehängt wurde!
    try {
        // suche und übergebe zugehörige URL für Shortlink
        let data = await findUrlDB(req.params.inputcode)
        res.status(200).send(data)
    } catch {
        // Eintrag / URL existiert nicht
        res.status(stat).end()
    }
})


// "redirect" GET-Endpoint erhöht zusätzlich den Aufrufzähler für einen Link
app.get('/redirect/:inputcode', async (req, res) => {
    try {
        // suche und übergebe zugehörige URL für Shortlink
        let data = await findUrlDB(req.params.inputcode)

        // Aufrufzähler für Link erhöhen
        addCounterDB(data.shortCode, data.clickCounter)

        res.status(200).send(data)
    } catch {
        // Eintrag / URL existiert nicht
        res.status(stat).end()
    }
})


// POST-Endpoint erstellt und speichert Kürzel für eine übergebene Url
app.post('/code/generate', async (req, res) => {
    try {
        // Linkverkürzungsfunktion aufrufen
        let data = (await myShortingFunction(req.body.url, req.body.short, req.body.mode)).toString()
        res.status(201).send({ url: data, admin: adminPost }).end()
    } catch {
        // keine shortUrl + Fehlermeldung
        res.status(stat).end()
    }
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
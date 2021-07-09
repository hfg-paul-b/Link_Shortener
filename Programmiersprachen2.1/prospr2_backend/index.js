// Express einbinden
const express = require('express')
const app = express()
const port = 4000
app.use(express.json())

// Array mit Zahlen
const chars = '0123456789'.split('') 

// CORS Extension im Chrome Browser umgehen
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
next();
});

// mit MongoDB Datenbank connecten
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Paul:2203@cluster0.bhydk.mongodb.net/quappenbase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let connection = ""

let adminPost = ""
stat = 500


// Verbindung herstellen
connectDB()


// Funktion zur Verbindung mit DB und Fehlerausgabe
async function connectDB() {

    try {
        await client.connect();
        connection = client.db("quappenbase").collection("plswork")

        console.log("Successfully connected to database!")

    } catch {
        console.error("couldnt connect to database.")
        await client.close();
    }
}

 // Generierung des Admin-Kürzels
function generateAdmin() {
    
    let short = ""                                                    

    // random 5 Stellen
    for (let i = 0; i < 5; i++) {                                      
        short += chars[Math.floor(Math.random() * chars.length)]
    }

    return short
}


// Kürzel werden hier generiert über "shortUrl"
function generateShort(url) {

    // http(s)-Teil wird von der URL getrennt.
    if (url.includes("//")) { 
        url = url.split("/")
        url = url[2]
    }

    // Nur Domain-Name wird gespeichert
    url = url.split(".")
    let dom = url[url.length-2]

    //Domain wird gekürzt sowie Vokale ersetzt
    let shortUrl = dom.replace(/[aeiou]/g, "")  

    // nur die ersten 3 Stellen werden verwendet        
    shortUrl = shortUrl.substring(0,3)                       

    const vow = "aeiou".split('')

    let short = ""                                                  

    // Zweiter Teil des Kürzels wird zufällig generiert mit 4 Stellen
    for (let i = 0; i < 4; i++) {                                   
        short += chars[Math.floor(Math.random() * chars.length)]
    }

    // Schnipsel werden zusammengefügt
    const acronym = shortUrl + "-" + short
    return acronym
}


// Überprüft URL und ordnet generiertes Kürzel zu
async function shorter(url, short, mode) {

    console.log("url: " + url + ", short: " + short, ", mode:" + mode) 
    if (mode) {
        console.log("true: acronym is not random.")
    } else {
        console.log("false: acronym is random.")
    }

    // Wird abgebrochen wenn URL oder Kürzel nicht gültig ist
    if (url === "" || url.includes("http") === false) {
        console.error("URL is empty or not available!")
        // Status Code
        stat = 406
        return
    } 
    if (mode) {
        if (!short || short.includes("/") === true) {
            console.error("Own acronym is empty or not available!")
            // gebe Stauscode an
            stat = 416
            return
        }
    } 
    
    // Die übergebene URL wird behalten
    const link = url
    // Variable für Kürzel
    let acronym = ""
    // Variable für Admin-Code
    let admin = generateAdmin()
    adminPost = admin

    // Hier wird über eine While-Schleife solange neues Kürzel generiert, bis ein noch nicht verwendetes Kürzel gefunden wird.
    let exists = true
    while (exists === true) {
        // Überprüft, ob ein eigenes Kürzel eingegeben wurde. Wenn ja wird es  übernommen. 
        if (mode) {
            acronym = short
        } else {
            acronym = generateShort(link)
        }

        // Hier wird geprüft ob das Kürzel schon existiert
        let entry = await getUrlDB(acronym)

        // Wenn es schon existiert wird abgebrochen. Wenn nicht wird die Funktion weiter ausgeführt.
        if (entry) {
            console.log('Entry with shortUrl already exists!')
            if (mode) {
                // Statuscode
                stat = 409
                return 
            }
        } else {
            console.error('Entry does not exist!')
            exists = false
        }

        console.log(exists)
    }

    // Url und Short wird in Datenbank geschrieben
    await writeFileDB(link, acronym, admin)

    return acronym 
}


// Eintrag in Datenbank
async function writeFileDB(link, acronym, admin) {
    try {
        await connection.insertOne({
            originalURL: link,
            shortCode: acronym,
            clickCounter: 0,
            dateCreated: new Date(),
            adminCode: admin,
            // adminIP
        })
    } catch {
        console.error("Entry could not be created.")
    }
}

// findet URL für Kürzel
async function getUrlDB(acronym){
    let entry = await connection.findOne({
        shortCode: acronym
    });

    return entry
}

// Spricht Klickzähler an für die Datenbank
async function addCounterDB(short, counter){
    let add = counter + 1
    console.log(add)

    try {
        await connection.updateOne(
            {shortCode: short}, 
            {$set: {clickCounter: add}}
        );
    } catch {
        console.error("Entry could not be updated.")
    }
}


// GET-Endpoint übergibt alle Informationen eines Datenbank-Eintrags
app.get('/code/:inputcode', async (req, res) => {
    try {
        // suche und übergebe zugehörige URL für Shortlink
        let data = await getUrlDB(req.params.inputcode)
        res.status(200).send(data)
    } catch {
        // URL existiert nicht
        res.status(stat).end()
    }
})


// Redirect GET-Endpoint erhöht Klickzähler für den Link
app.get('/redirect/:inputcode', async (req, res) => {
    try {
        // suche und übergebe zugehörige URL für Shortlink
        let data = await getUrlDB(req.params.inputcode)

        // Klickzähler erhöhen
        addCounterDB(data.shortCode, data.clickCounter)

        res.status(200).send(data)
    } catch {
        // URL existiert nicht
        res.status(stat).end()
    }
})


//  Kürzel für übergebene URL wird im POST-Endpoint erstellt und gespeichert
app.post('/code/generate', async (req, res) => {
    try {
        // Linkverkürzungsfunktion 
        let data = (await shorter(req.body.url, req.body.short, req.body.mode)).toString()
        res.status(201).send({ url: data, admin: adminPost }).end()
    } catch {
        res.status(stat).end()
    }
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
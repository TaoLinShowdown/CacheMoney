// TO START THE SERVER, TYPE npm start INTO CMD IN THE DIRECTORY
//
// Install Node.js
// Use npm install express --save
// Use npm install mongodb --save
// Use npm install body-parser --save
// https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/

const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://Lin:WaDCu2e.GPwy3XN@cluster0-epco6.mongodb.net/test?retryWrites=true&w=majority";
const db_name = "Tabnabbed_URLs";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

var database, collection;

//console.log("this is a test");

app.listen(3000, () => {
    MongoClient.connect(uri, { useNewUrlParser: true , useUnifiedTopology: true}, (error, client) => {
        if(error) {
                console.log("No connection");
                throw error;
        }

        database = client.db(db_name);
        collection = database.collection("URLs");
        console.log("Connected to: " + db_name);

        app.post("/url", (request, response) => {
                console.log("URL POST REQUEST");
                console.log(request.body);
                collection.insertOne(request.body, (error, result) => {
                        if(error){
                                console.log("Could not insert.");
                                return response.status(500).send(error);
                        }
                        response.send(result.result);
                });
        });

        app.get("/url", (request, response) => {
                console.log("URL GET REQUEST");
                collection.find({}).toArray((error, result) =>{
                        if(error){
                                return response.status(500).send(error);
                        }
                        response.send(result);
                });
        });

    });
})

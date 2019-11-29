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

        function compareImages(img1, img2) {
                var image = new Image();
                image.src = img1
                var image2 = new Image();
                image2.src = img2
                image2.onload = function() {
                    var tiles = splitImage(image)
                    var tiles2 = splitImage(image2)
                    var differentTiles = []
                    for (let i = 0; i < tiles.length; i++) {
                        var diff = resemble(tiles[i][0])
                        .compareTo(tiles2[i][0])
                        .ignoreColors()
                        .onComplete(function(data) {
                            if (data['misMatchPercentage'] > 0) {
                                differentTiles.push([tiles[i][1], tiles[i][2]])
                            }
                            if (i == tiles.length - 1) {
                                console.log(differentTiles)
                            }
                        });
                    }
                }
                return differentTiles
            }

        function splitImage(image) {
        var tiles = []
        for (let i = 0; i < image.width - 17; i += 10) {
                for (let j = 0; j < image.height; j += 10) {
                var canvas = document.createElement('canvas');
                canvas.width = 10;
                canvas.height = 10;
                var context = canvas.getContext('2d');
                context.drawImage(image, i, j, 10, 10, 0, 0, canvas.width, canvas.height);
                tiles.push([canvas.toDataURL(), j/10, i/10]);
                }
        }
        return tiles
        }

        app.post("/resemble", (request, response) => {
                console.log("RESEMBLE REQUEST");
                console.log(request.body);
                var { img1, img2 } = request.body;
                var differentTiles = compareImages(img1,img2);
                response.send(differentTiles)
        });
    });
})

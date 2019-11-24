//TO START THE SERVER, TYPE npm start INTO CMD IN THE DIRECTORY 


const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;


//Install Node.js
//Use npm install express --save
//Use npm install mongodb --save
//Use npm install body-parser --save
//https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/

//change "travisli:BIeDG8GndcEB7Yo7" to "Lin:WaDCu2e.GPwy3XN"
//REMEMBER TO TURN ON THE CLUSTER
const uri = "mongodb+srv://travisli:BIeDG8GndcEB7Yo7@cluster0-6dqot.mongodb.net/test?retryWrites=true&w=majority";
const db_name = "Tabnabbing";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

var database, collection;

app.listen(3000, () => {
	MongoClient.connect(uri, { useNewUrlParser: true , useUnifiedTopology: true}, (error, client) => {
		if(error){
			console.log("No connection");
			throw error;
		}
		database = client.db(db_name);
		collection = database.collection("URLS");
		console.log("Connected to: " + db_name);

		app.post("/url", (request, response) => {
			collection.insertOne(request.body, (error, result) => {
				if(error){
					console.log("Could not insert.");
					return response.status(500).send(error);
				}
				response.send(result.result);
			});
		});

		app.get("/url", (request, response) => {
			collection.find({}).toArray((error, result) =>{
				if(error){
					return response.status(500).send(error);
				}
				response.send(result);
			});
		});
	});
});


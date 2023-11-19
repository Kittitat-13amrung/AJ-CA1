const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const pathToSwaggerUI = require('swagger-ui-dist').absolutePath();
const cors = require("cors");
require("dotenv").config();
require("./config/db")();
const jwt = require("jsonwebtoken");

// create an Express instance
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
// app.set('view engine', 'html');
// app.use(express.static(__dirname + '/views/'));

const options = {
	failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
	definition: {
		openapi: "3.0.0",
		info: {
			title: "YouTube API",
			version: "1.0.0",
		},
	},
	apis: ["./Controllers/*.controller.js"],
};

// serve swagger doc
const swaggerSpec = swaggerJsDoc(options);
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(swaggerSpec, {
    customCssUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css',
    customSiteTitle: "AJ CA1",
}));

app.use("/public", express.static(__dirname + "/public/"));

// login middleware
app.use((req, res, next) => {
	// array of path to check
	const securePaths = ["update", "create", "delete"];

	// iterate current path by splitting it into array
	let hasPath = false;
	for (const path of req.path.split("/")) {
		for (const checkPath of securePaths) {
			// if current path match secure paths
			if (checkPath === path) hasPath = true;
		}
	}

	// if current path does not match secure paths found bypass Auth middleware
	if (!hasPath) return next();

	let token = null;
	// check Authorization header
	// if exists put header into array
	if (req.headers.authorization) {
		token = req.headers.authorization.split(" ");
	}

	// if token exists with the right JWT convention
	if (token && token[0] === "Bearer") {
		// verify token is valid
		jwt.verify(token[1], process.env.JWT_SECRET, (err, decoded) => {
			// if auth doesn't match
			if (err) {
				console.log(err);
				req.channel = undefined;
			}

			// put channel into the request and pass to the actual route
			req.channel = decoded;

			return next();
		});

		// if token doesn't exists, return no token message.
	} else {
		console.log("No token");

		req.channel = undefined;

		return res.status(401).json({
			message: "No token",
		});
	}
});

// allow ACAO from all IP addresses
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

// Channels Route
app.use("/api/channels", require("./Routes/channel.routes"));
// Videos Route
app.use("/api/videos", require("./Routes/video.routes"));
//  Comments Route
app.use("/api/comments", require("./Routes/comment.routes"));

// serve API
app.listen(port, (req, res) => {
	console.log(`CA1 App listening on port ${port}`);
});

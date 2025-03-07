"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const ImageProvider_1 = require("./ImageProvider"); // Assuming ImageProvider is in the same directory
dotenv_1.default.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";
const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;
const connectionStringRedacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}`;
const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;
async function setUpServer() {
    console.log("Attempting Mongo connection at " + connectionStringRedacted);
    const mongoClient = await mongodb_1.MongoClient.connect(connectionString);
    const collectionInfos = await mongoClient.db().listCollections().toArray();
    console.log(collectionInfos.map((collectionInfo) => collectionInfo.name)); // For debug only
    const app = (0, express_1.default)();
    app.use(express_1.default.static(staticDir));
    app.get("/hello", (req, res) => {
        res.send("Hello, World");
    });
    app.get("/api/images", async (req, res) => {
        try {
            const imageProvider = new ImageProvider_1.ImageProvider(mongoClient);
            const images = await imageProvider.getAllImages();
            res.json(images);
        }
        catch (error) {
            res.status(500).send("Error retrieving images");
        }
    });
    app.get("*", (req, res) => {
        console.log("none of the routes above me were matched");
    });
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}
setUpServer().catch((error) => {
    console.error("Failed to set up server:", error);
});

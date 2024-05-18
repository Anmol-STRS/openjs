const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const genAI = new GoogleGenerativeAI("");

let pdfTextArray = [];

app.use("/", express.static("public"));
app.use(fileUpload());

app.post("/extract-text", (req, res) => {
    if (!req.files || !req.files.pdfFile) {
        res.status(400).send("No file uploaded");
        return;
    }

    pdfParse(req.files.pdfFile).then(result => {
        pdfTextArray = result.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);  
        res.send(result.text);
    }).catch(err => {
        res.status(500).send("Error parsing PDF");
    });
});

async function rateTheResume() {
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = "Rate the following resume:\n\n" + pdfTextArray.join('\n\n');
    try {
        const result = await model.generateContent(prompt);
        return result.response;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
}


app.post("/gn", async (req, res) => {
    try {
        const response = await rateTheResume();
        const textBody = response.candidates[0].content.parts[0].text;
        res.send(textBody);
    } catch (err) {
        console.error("Error generating story:", err);
        res.status(500).send("Error generating story");
    }
});


app.listen(5000, () => {
    console.log("Server is running on port 5000");
});





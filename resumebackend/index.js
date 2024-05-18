/*
const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const genAI = new GoogleGenerativeAI("AIzaSyDFR427aryIYYUpMfVSK4DbBxKPOJ9yh2c");

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
*/

const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDFR427aryIYYUpMfVSK4DbBxKPOJ9yh2c");

async function handleResumeRating(req, res) {
    try {
        const resume = req.files.resume;
        // Check if a PDF file is uploaded
        if (!resume) {
            return res.status(400).send("No file uploaded");
        }

        // Parse the uploaded PDF file
        const result = await pdfParse(resume);

        // Extract text from PDF and split into an array of lines
        const pdfTextArray = result.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Get generative AI model
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Create prompt for the generative model
        const prompt = "Rate the following resume:\n\n" + pdfTextArray.join('\n\n');

        // Generate content using the generative model
        const response = await model.generateContent(prompt);

        // Extract text from the generated response
        const textBody = response.candidates[0].content.parts[0].text;
        console.log(textBody);
        // Send the generated text as response
        res.send(textBody);
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Error processing request");
    }
}

const app = express();
app.use(fileUpload());


app.post("/rate-resume", handleResumeRating);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





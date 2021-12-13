import express from "express";

function keepAlive() {
    const app = express();
    app.all("/", (req, res) => res.send("Bot running!"));
    app.listen(process.env.PORT);
}

export default keepAlive;
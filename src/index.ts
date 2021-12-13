import { connect } from "mongoose";
import dotenv from "dotenv";
import Discord, { MessageEmbed } from "discord.js";
import { PorterStemmer, SentimentAnalyzer, WordTokenizer } from "natural";
import User from "./models/User";
import handleCommand from "./handleCommand";

dotenv.config();

(async () => {
    // connect to database
    await connect(process.env.DATABASE_URI || "");

    // connect to discord
    const client = new Discord.Client({ intents: ["GUILD_MESSAGES", "GUILDS"] });

    client.on("ready", () => {
        console.log(`Logged in as ${client.user?.tag}`);
    })

    client.on("messageCreate", async (message) => {
        try {
            if (client.user && message.mentions.has(client.user)) { handleCommand(message, client); return; };
        } catch (err) { console.log(err); };

        if (!message.mentions.users.first()) return;

        const cleanedMessage = message.content
            .replace(/<[@#!&](.*?)>/g, "") // remove mentions
            .toLowerCase(); // make lowercase

        // tokenize message into chunks
        const tokenizer = new WordTokenizer();
        const tokenizedMessage = tokenizer.tokenize(cleanedMessage);

        // get sentiment
        const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
        const analysis = analyzer.getSentiment(tokenizedMessage);

        // check if negative
        if (analysis < 0) {
            let userDocument = await User.findOneAndUpdate({ _id: message.author.id }, { $inc: { timesInsulted: 1 } }, {
                new: true,
                upsert: true
            });
        }
    });

    client.login(process.env.DISCORD_TOKEN);
})();
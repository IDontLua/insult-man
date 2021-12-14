import { connect } from "mongoose";
import dotenv from "dotenv";
import Discord, { MessageEmbed } from "discord.js";
import { PorterStemmer, SentimentAnalyzer, WordTokenizer } from "natural";
import User from "./models/User";
import handleCommand from "./handleCommand";
import keepAlive from "./keepAlive";

dotenv.config();

(async () => {
    keepAlive();

    // connect to database
    await connect(process.env.DATABASE_URI || "");

    // connect to discord
    const client = new Discord.Client({ intents: ["GUILD_MESSAGES", "GUILDS"] });

    client.on("ready", () => {
        console.log(`Logged in as ${client.user?.tag}`);
    })

    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        try {
            if (client.user && message.mentions.has(client.user)) { handleCommand(message, client); return; };
        } catch (err) { console.log(err); };

        const mentionId = (message.mentions.users.first() || message.mentions.repliedUser)?.id;
        if (!mentionId) return;

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
            let userDocument = await User.findOneAndUpdate({ discordId: mentionId }, { $inc: { timesInsulted: 1 } }, {
                new: true,
                upsert: true
            }).catch((err) => console.log(err));
        }
    });

    client.login(process.env.DISCORD_TOKEN);
})();
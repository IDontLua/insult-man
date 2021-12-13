import { Client, Message, MessageEmbed } from "discord.js";
import User from "./models/User";

// this function is totally not just here because I like putting shameless plugs in all my projects!
const addEmbedSpice = (embed: MessageEmbed) => embed.setFooter("Made by I dont watch anime#1912", "https://cdn.discordapp.com/avatars/467163000684412929/651a963eb8cb8dda2b69b57899886e16.webp?size=96");

async function handleCommand(message: Message, client: Client) {
    const splitContent = message.content.split(" ");
    const command = splitContent[1] || "";
    const args = splitContent.slice(2);

    switch (command) {
        case "":
            const informationEmbed = addEmbedSpice(new MessageEmbed()
                .setTitle("👋 Ahoy!")
                .setDescription(`I'm Insult Man, former stalker, discord moderator and shitass. I scan the chat 24/7 for insults and keep track of them. \n\n **Commands**`)
                .setColor("#F8BBBD")
                .addField("@Insult Man `leaderboard`", "Shows the most insulted people.")
                .addField("@Insult Man `insults [person]`", "Shows how many times someone has been insulted."));

            message.channel.send({
                embeds: [informationEmbed]
            });
            break;

        case "leaderboard":
            const leaderboardEmbed = addEmbedSpice(new MessageEmbed()
                .setTitle("🏆 Insults Leaderboard")
                .setDescription("The top 10 most insulted poeple!")
                .setColor("#F8BBBD"));

            // TODO: fix this abomination of code
            (await User.find({})
                .sort({ timesInsulted: -1 })
                .limit(10))
                .forEach((document, index) => leaderboardEmbed.addField(
                    `#${index + 1} ${client.users.cache.get(document.discordId)?.tag || "User not found in cache!"}`,
                    `${document.timesInsulted} ${(document.timesInsulted === 1) ? "time" : "times"}!`)
                );


            message.channel.send({
                embeds: [leaderboardEmbed]
            });
            break;

        case "insults":
            const userId = args[0].replace(/[\\<>@#&!]/g, "");
            const user = client.users.cache.get(userId);

            if (args.length <= 0 || !user) return message.reply("Please mention a person you would like to check insults for. `@Insult Man insults @person`!");

            const timesInsulted = (await User.findOne({ discordId: userId }))?.timesInsulted || 0;

            const insultEmbed = addEmbedSpice(new MessageEmbed()
                .setTitle(`😡 Insults for ${user.tag}`)
                .setDescription(`This person has been insulted **${timesInsulted}**  ${(timesInsulted === 1) ? "time" : "times"}!`)
                .setColor("#F8BBBD"));

            message.channel.send({
                embeds: [insultEmbed]
            });
            break;
    }
}

export default handleCommand;
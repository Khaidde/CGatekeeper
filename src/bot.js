require("dotenv").config();

const Discord = require("discord.js");
const DiscordTTS = require("discord-tts");
const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Starting ${client.user.tag}...`);
    checkWaitingRoom();
});

const WORKSPACE_ID = "787118380633030696";
const WAITING_ROOM_ID = "834306211947872286";

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.id != client.user.id) {
        checkWaitingRoom();
    }
});

function notifiyChannel(message, channel) {
    const broadcast = client.voice.createBroadcast();
    channel.join().then(connection => {
        broadcast.play(DiscordTTS.getVoiceStream(message));
        connection.play(broadcast);
        setTimeout(() => {
            channel.leave();
        }, 10000)
    });
}

function checkWaitingRoom() {
    const workspaceChannel = client.channels.cache.get(WORKSPACE_ID);
    const workspaceHasPerson = workspaceChannel.members.size > 0;

    const waitingChannel = client.channels.cache.get(WAITING_ROOM_ID);
    for (const [, queryMember] of waitingChannel.members) {
        if (workspaceHasPerson) {
            notifiyChannel(queryMember.displayName + " is waiting", workspaceChannel);
            console.log("User in waiting room: " + queryMember.displayName);
        } else {
            queryMember.voice.kick("Can't join waiting room if no one is in the workspace!");

            queryMember.send("You can't join Calvin's Waiting Room if Calvin isn't in his workspace! (Message will delete in 20 seconds)")
                .then(msg => msg.delete({timeout: 20000}));
            console.log("Member tried to join Calvin's Waiting Room: " + queryMember.displayName);
        }
    }
}

client.login(process.env.DISCORDJS_BOT_TOKEN);
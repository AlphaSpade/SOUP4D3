const Discord = require("discord.js");

const client = new Discord.Client();

const prefix = '*';

const fs = require('fs');

const ffmpeg = require("ffmpeg")

const ytdl = require('ytdl-core');


client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}



client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'ping'){
            client.commands.get('ping').execute(message, args);
    } else if (command == 'k'){
            client.commands.get('k').execute(message, args);
    } else if (command == '66'){
        client.commands.get('66').execute(message, args);
    }
    
});


        // DISCORD MUSIC
        const queue = new Map();

        client.once("ready", () => {
          console.log("Ready!");
        });
        
        client.once("reconnecting", () => {
          console.log("Reconnecting!");
        });
        
        client.once("disconnect", () => {
          console.log("Disconnect!");
        });
        
        client.on("message", async message => {
          if (message.author.bot) return;
          if (!message.content.startsWith(prefix)) return;
        
          const serverQueue = queue.get(message.guild.id);
        
          if (message.content.startsWith(`${prefix}play`)) {
            execute(message, serverQueue);
            return;
          } else if (message.content.startsWith(`${prefix}skip`)) {
            skip(message, serverQueue);
            return;
          } else if (message.content.startsWith(`${prefix}stop`)) {
            stop(message, serverQueue);
            return;
          } 
        });
        
        async function execute(message, serverQueue) {
          const args = message.content.split(" ");
        
          const voiceChannel = message.member.voice.channel;
          if (!voiceChannel)
            return message.channel.send(
              "Idiot, tu dois être dans un channel pour lancer une musique !"
            );
          const permissions = voiceChannel.permissionsFor(message.client.user);
          if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send(
              "Il me faut les autorisations suivantes pour rejoindre ce channel : Connect et Speak."
            );
          }
        
          const songInfo = await ytdl.getInfo(args[1]);
          const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
           };
        
          if (!serverQueue) {
            const queueContruct = {
              textChannel: message.channel,
              voiceChannel: voiceChannel,
              connection: null,
              songs: [],
              volume: 50,
              playing: true
            };
        
            queue.set(message.guild.id, queueContruct);
        
            queueContruct.songs.push(song);
        
            try {
              var connection = await voiceChannel.join();
              queueContruct.connection = connection;
              play(message.guild, queueContruct.songs[0]);
            } catch (err) {
              console.log(err);
              queue.delete(message.guild.id);
              return message.channel.send(err);
            }
          } else {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} à été ajouté à la file d'attente.`);
          }
        }
        
        function skip(message, serverQueue) {
          if (!message.member.voice.channel)
            return message.channel.send(
              "Tu dois être dans un canal vocal pour pouvoir couper la musique !"
            );
          if (!serverQueue)
            return message.channel.send("Je ne peux passer ce son !");
          serverQueue.connection.dispatcher.end();
        }
        
        function stop(message, serverQueue) {
          if (!message.member.voice.channel)
            return message.channel.send(
              "Tu dois être dans un canal vocal pour pouvoir couper la musique !"
            );
            
          if (!serverQueue)
            return message.channel.send("Il n'y a pas de musique!");
            
          serverQueue.songs = [];
          serverQueue.connection.dispatcher.end();
        }
        
        function play(guild, song) {
          const serverQueue = queue.get(guild.id);
          if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
          }
        
          const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on("finish", () => {
              serverQueue.songs.shift();
              play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
          dispatcher.setVolumeLogarithmic(serverQueue.volume / 50);
          serverQueue.textChannel.send(`Lecture en cours: **${song.title}**`);
        }





client.login('NzkwMjYxMjA5OTQ5MDEyMDM4.X9-CGg.2MatVK_gitz4K6YDqQvDx6Ggc5s');

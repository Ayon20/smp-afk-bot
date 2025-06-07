const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;

function createBot() {
  const bot = mineflayer.createBot({
    host: 'OnlyFriendSMP.play.hosting', // 🔁 Replace with your server address
    port: 25565,
    username: 'KeepAliveBot'
  });

  bot.loadPlugin(pathfinder);

  let spawnPoint = null;

  bot.on('spawn', () => {
    console.log('✅ Bot has joined the server!');

    spawnPoint = bot.entity.position.clone(); // Save spawn location

    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    // Every 10 seconds: move around spawn AND jump
    setInterval(() => {
      // Move randomly within 1 block of spawn
      const dx = (Math.random() * 2 - 1); // -1 to +1
      const dz = (Math.random() * 2 - 1);
      const x = spawnPoint.x + dx;
      const y = spawnPoint.y;
      const z = spawnPoint.z + dz;

      bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));

      // Jump slightly for anti-AFK
      if (bot.entity.onGround) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.setControlState('jump', false);
        }, 500);
      }
    }, 10000); // Every 10 seconds
  });

  bot.on('death', () => {
    console.log('💀 Bot died. Respawning in 3 seconds...');
    setTimeout(() => {
      bot.emit('respawn');
    }, 3000);
  });

  bot.on('end', () => {
    console.log('⚠️ Bot disconnected. Reconnecting...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => {
    console.log('❌ Error: ', err);
  });
}

createBot();

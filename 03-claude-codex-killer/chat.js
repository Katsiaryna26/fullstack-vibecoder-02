const readline = require('readline');

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Вы: ',
});

console.log('Эхо-чат запущен. Напишите сообщение или "выход" для завершения.');
chat.prompt();

chat.on('line', (message) => {
  if (message.trim().toLowerCase() === 'выход') {
    chat.close();
    return;
  }

  console.log(`Эхо: ${message}`);
  chat.prompt();
});

chat.on('close', () => {
  console.log('До встречи!');
});

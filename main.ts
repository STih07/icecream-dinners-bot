import { Bot } from "./src/bot";
import { repeat, delay, repeatWhen } from "rxjs/operators";

const token = process.env.TELEGRAM_BOT_TOKEN || '';

const bot = new Bot(token);

bot.getUpdates().subscribe(data => console.log(data));
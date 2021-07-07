const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
let bodyParser = require("body-parser");

const token = '1830573545:AAHBhWomPRPtMVr8uMAxxqlZ0YjOM_sv880';

let bot = new TelegramBot(token, { polling: true });
let app = express();

app.set("view engine", "ejs");

const filePath = "./db/users.txt";

app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

const checkUnique = (chatId) => {
    if (fs.existsSync(filePath)) {
        let users = fs.readFileSync(filePath);
        users = JSON.parse(users);
        let unique = true;

        for (let i = 0; i < users.length; i++) {
            if (users[i].chatId === chatId) {
                unique = false;
                break;
            }
        }

        return unique;
    }
}

const saveUser = (username, chatId) => {
    let user = {
        username: username,
        chatId: chatId
    }

    if (checkUnique(chatId)) {
        let users = null;

        try {
            users = fs.readFileSync(filePath);
            users = JSON.parse(users);
        } catch {
            users = [];
        }

        users.push(user);

        fs.writeFileSync(filePath, JSON.stringify(users));
        bot.sendMessage(chatId, "Вы успешно зарегистрировались!");
        return
    } else {
        bot.sendMessage(chatId, "Вы уже зарегистрированы!");
    }
}

app.get("/contacts", function (request, response) {
    response.render("contacts.ejs", {
        title: "Страница контактов",
        contacts: JSON.parse(fs.readFileSync(filePath))
    });
})

app.post("/bot/message", function (request, response) {
    let chatId = request.body.chatId;
    bot.sendMessage(chatId, "Вам отправили сообщение из сайта");
    response.end();
})

bot.onText(/\/register/, function (msg, match) {
    let textArray = msg.text.split(" ");
    textArray.splice(0, 1);
    let textWithoutCommand = textArray.join(" ");
    // bot.sendMessage(msg.chat.id, "Команда регистрации\nс текстом " + textWithoutCommand);
    bot.sendMessage(msg.chat.id, "LOL", {
        "reply_markup": {
            "keyboard": [["Sample text", "Second sample"], ["Keyboard"], ["I'm robot"]]
        }
    });
})

bot.on("message", function (msg) {
    saveUser(msg.chat.username, msg.chat.id);
})

app.listen(8080);
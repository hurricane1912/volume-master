
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

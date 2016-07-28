#slack-bot-das-orakel

This tutorial assumes you've created a Heroku account. Also, know you do not need to alter this code in any way to get the Slack bot to work.

## Installation
Before we deploy this app to [Heroku](https://heroku.com) we need to create and configure the bot on Slack.

### Create a bot
Go to your team's Slack settings, and add a [new bot integration](https://my.slack.com/services/new/bot). Name it das_orakel (or whatever name you'd like).

After creating it, make sure to copy the API Token. You'll need it later. All other settings are for you to set as you wish.

### Deploy this app to Heroku
Click on the purple button below to deploy this app to Heroku. When you click the button, Heroku will open in your browser. Before you deploy the app, add the API Token for the config variable. Also, give your app a name.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/deepst0p/slack-bot-das-orakel/tree/master)

### Chat as das_orakel!
When Heroku finishes installing the app, head over to your team's Slack chat.
Create a private channel, name it audienz_beim_orakel (or whatever you selected in heroku) and add das_orakel to it.
You'll notice das_orakel (or whatever you named the bot) as an active user on the sidebar.
Send das_orakel a direct message, it will appear in the private channel audienz_beim_orakel.
If you are admin you can reply to a user as das_orakel bei sending das_orakel a direct message starting with the users name '@user_name_here your message'.
Have a look in the private channel.


## step 1) install dependencies

install dependencies with

```
npm install
```

## step 1) copy config

copy `config.default.json` to `config.json`

## step 2) create a Discord Webhook

Create a Discord Webhook under `Server Settings > Integrations > Webhooks`
Copy the url into `config.json` under `webhookUrl`


## step 3) check your guilds warcraftlogs id

Go to your Guild page on warcraftlogs.com and copy the id in the url to `guildId`


## step 4) create a warcraftlogs auth token

create a new application under https://www.warcraftlogs.com/api/clients/\
set the **redirect url** to `https://httpbin.org/get`
and fill out `clientId` and `clientSecret` in your `config.json`

## step 5) start the application

```
npm start
```
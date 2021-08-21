"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = require("path");
const client_oauth2_1 = __importDefault(require("client-oauth2"));
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = require("crypto");
const GRAPHQL_URL = "https://www.warcraftlogs.com/api/v2/user";
/**
 * @param path file path to the config file
 */
async function configure(path) {
    let config = JSON.parse(await promises_1.default.readFile(path, "utf8"));
    return {
        async set(partial) {
            config = { ...config, ...partial };
            await promises_1.default.writeFile(path, JSON.stringify(config, null, 2), "utf8");
            return config;
        },
        get(key, defaultsTo = undefined) {
            if (config[key] === undefined && defaultsTo !== undefined)
                return defaultsTo;
            return config[key];
        },
        raw: () => ({ ...config })
    };
}
configure(path_1.join(__dirname, "./config.json")).then(async (config) => {
    const warcaftLogsAuth = new client_oauth2_1.default({
        clientId: config.get("clientId"),
        clientSecret: config.get("clientSecret"),
        accessTokenUri: "https://www.warcraftlogs.com/oauth/token",
        authorizationUri: "https://www.warcraftlogs.com/oauth/authorize",
        redirectUri: "https://httpbin.org/get"
    });
    let token;
    if (!config.get("accessToken") && !config.get("url")) {
        console.log("Get Authorization URL and paste it into config with key 'url'");
        console.log(warcaftLogsAuth.code.getUri({ state: crypto_1.randomBytes(24).toString("hex") }));
        return;
    }
    else if (config.get("url")) {
        token = await warcaftLogsAuth.code.getToken(config.get("url"));
        await config.set({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            url: undefined
        });
    }
    else {
        token = warcaftLogsAuth.createToken(config.get("accessToken"), config.get("refreshToken"), {});
    }
    function query(query) {
        const url = new URL(GRAPHQL_URL);
        url.searchParams.set("query", query);
        return node_fetch_1.default(url.toString(), {
            headers: {
                "Authorization": `Bearer ${token.accessToken}`,
                "Accept": "application/json"
            }
        });
    }
    function sleep(time) {
        return new Promise(fulfill => {
            setTimeout(fulfill, time);
        });
    }
    while (true) {
        const lastQueried = Date.now();
        const res = await query(`{
      reportData {
        reports(
          guildID: ${config.get("guildId")},
          limit: 3,
          startTime: ${config.get("lastQueried", 0)}
        ) {
          data {
            code
            title
            startTime
            owner {
              name
            }
          }
        }
      }
    }`);
        await config.set({ lastQueried });
        const reports = (await res.json()).data.reportData.reports.data;
        await Promise.all(reports.map(async (report) => {
            try {
                const res = await node_fetch_1.default(config.get("webhookUrl"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        content: `**${report.owner.name}** started logging <https://www.warcraftlogs.com/reports/${report.code}>`
                    })
                });
            }
            catch (e) {
                console.error("failed to post webhook");
                console.error(e);
            }
        }));
        await sleep(30 * 1000);
    }
});

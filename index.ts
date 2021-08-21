import fetch from "node-fetch"
import { join } from "path"
import ClientOAuth2, { Token } from "client-oauth2"
import fs from "fs/promises"
import { randomBytes } from "crypto"

const GRAPHQL_URL = "https://www.warcraftlogs.com/api/v2/user"

declare type Configuration = {
  guildId: string
  clientId: string
  clientSecret: string
  lastQueried: number
  webhookUrl: string
  url?: string
  accessToken?: string
  refreshToken?: string
}

/**
 * @param path file path to the config file
 */
async function configure<T>(path: string) {
  let config: T = JSON.parse(await fs.readFile(path, "utf8"))
  return {
    async set(partial: Partial<T>) {
      config = { ...config, ...partial }
      await fs.writeFile(path, JSON.stringify(config, null, 2), "utf8")
      return config
    },
    get<Y extends keyof T>(key: Y, defaultsTo: T[Y]|undefined = undefined): T[Y] {
      if (config[key] === undefined && defaultsTo !== undefined) return defaultsTo
      return config[key]
    },
    raw: () => ({ ...config })
  }
}

configure<Configuration>(join(__dirname, "../config.json")).then(async config => {

  const warcaftLogsAuth = new ClientOAuth2({
    clientId: config.get("clientId"),
    clientSecret: config.get("clientSecret"),
    accessTokenUri: "https://www.warcraftlogs.com/oauth/token",
    authorizationUri: "https://www.warcraftlogs.com/oauth/authorize",
    redirectUri: "https://httpbin.org/get"
  })

  let token: Token

  if (!config.get("accessToken") && !config.get("url")) {
    console.log("Get Authorization URL and paste it into config with key 'url'")
    console.log(warcaftLogsAuth.code.getUri({ state: randomBytes(24).toString("hex") }))
    return
  } else if (config.get("url")) {
    token = await warcaftLogsAuth.code.getToken(config.get("url")!)
    await config.set({
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      url: undefined
    })
  } else {
    token = warcaftLogsAuth.createToken(config.get("accessToken")!, config.get("refreshToken")!, {})
  }

  function query(query: string) {
    const url = new URL(GRAPHQL_URL)
    url.searchParams.set("query", query)
    return fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${token.accessToken}`,
        "Accept": "application/json"
      }
    })
  }
  
  function sleep(time: number) {
    return new Promise(fulfill => {
      setTimeout(fulfill, time)
    })
  }

  type Report = {
    code: string
    title: string
    startTime: number
    owner: {
      name: string
    }
  }

  while (true) {
    const lastQueried = Date.now()
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
    }`)
    await config.set({ lastQueried })
  
    const reports: Report[] = (await res.json()).data.reportData.reports.data
    console.log(reports.length)
    await Promise.all(reports.map(async report => {
      try {
        const res = await fetch(config.get("webhookUrl"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `**${report.owner.name}** started logging <https://www.warcraftlogs.com/reports/${report.code}>`
          })
        })
        console.log(res.status)
      } catch (e) {
        console.error("failed to post webhook")
        console.error(e)
      }
    }))
    await sleep(30 * 1000)
  }


})



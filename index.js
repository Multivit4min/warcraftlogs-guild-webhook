"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = __importDefault(require("node-fetch"));
var path_1 = require("path");
var client_oauth2_1 = __importDefault(require("client-oauth2"));
var promises_1 = __importDefault(require("fs/promises"));
var crypto_1 = require("crypto");
var GRAPHQL_URL = "https://www.warcraftlogs.com/api/v2/user";
/**
 * @param path file path to the config file
 */
function configure(path) {
    return __awaiter(this, void 0, void 0, function () {
        var config, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, promises_1.default.readFile(path, "utf8")];
                case 1:
                    config = _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/, {
                            set: function (partial) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                config = __assign(__assign({}, config), partial);
                                                return [4 /*yield*/, promises_1.default.writeFile(path, JSON.stringify(config, null, 2), "utf8")];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/, config];
                                        }
                                    });
                                });
                            },
                            get: function (key, defaultsTo) {
                                if (defaultsTo === void 0) { defaultsTo = undefined; }
                                if (config[key] === undefined && defaultsTo !== undefined)
                                    return defaultsTo;
                                return config[key];
                            },
                            raw: function () { return (__assign({}, config)); }
                        }];
            }
        });
    });
}
configure(path_1.join(__dirname, "../config.json")).then(function (config) { return __awaiter(void 0, void 0, void 0, function () {
    function query(query) {
        var url = new URL(GRAPHQL_URL);
        url.searchParams.set("query", query);
        return node_fetch_1.default(url.toString(), {
            headers: {
                "Authorization": "Bearer " + token.accessToken,
                "Accept": "application/json"
            }
        });
    }
    function sleep(time) {
        return new Promise(function (fulfill) {
            setTimeout(fulfill, time);
        });
    }
    var warcaftLogsAuth, token, lastQueried, res, reports;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                warcaftLogsAuth = new client_oauth2_1.default({
                    clientId: config.get("clientId"),
                    clientSecret: config.get("clientSecret"),
                    accessTokenUri: "https://www.warcraftlogs.com/oauth/token",
                    authorizationUri: "https://www.warcraftlogs.com/oauth/authorize",
                    redirectUri: "https://httpbin.org/get"
                });
                if (!(!config.get("accessToken") && !config.get("url"))) return [3 /*break*/, 1];
                console.log("Step 1 of 2: Get Authorization URL and paste it into config with key 'url'");
                console.log(warcaftLogsAuth.code.getUri({ state: crypto_1.randomBytes(24).toString("hex") }));
                return [2 /*return*/];
            case 1:
                if (!config.get("url")) return [3 /*break*/, 4];
                return [4 /*yield*/, warcaftLogsAuth.code.getToken(config.get("url"))];
            case 2:
                token = _a.sent();
                return [4 /*yield*/, config.set({
                        accessToken: token.accessToken,
                        refreshToken: token.refreshToken,
                        url: undefined
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                token = warcaftLogsAuth.createToken(config.get("accessToken"), config.get("refreshToken"), {});
                _a.label = 5;
            case 5:
                if (!true) return [3 /*break*/, 11];
                lastQueried = Date.now();
                return [4 /*yield*/, query("{\n      reportData {\n        reports(\n          guildID: " + config.get("guildId") + ",\n          limit: 3,\n          startTime: " + config.get("lastQueried", 0) + "\n        ) {\n          data {\n            code\n            title\n            startTime\n            owner {\n              name\n            }\n          }\n        }\n      }\n    }")];
            case 6:
                res = _a.sent();
                return [4 /*yield*/, config.set({ lastQueried: lastQueried })];
            case 7:
                _a.sent();
                return [4 /*yield*/, res.json()];
            case 8:
                reports = (_a.sent()).data.reportData.reports.data;
                console.log(reports.length);
                return [4 /*yield*/, Promise.all(reports.map(function (report) { return __awaiter(void 0, void 0, void 0, function () {
                        var res_1, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, node_fetch_1.default(config.get("webhookUrl"), {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                content: "**" + report.owner.name + "** started logging <https://www.warcraftlogs.com/reports/" + report.code + ">"
                                            })
                                        })];
                                case 1:
                                    res_1 = _a.sent();
                                    console.log(res_1.status);
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_1 = _a.sent();
                                    console.error("failed to post webhook");
                                    console.error(e_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 9:
                _a.sent();
                return [4 /*yield*/, sleep(60 * 1000)];
            case 10:
                _a.sent();
                return [3 /*break*/, 5];
            case 11: return [2 /*return*/];
        }
    });
}); });

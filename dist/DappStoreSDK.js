"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const form_data_1 = __importDefault(require("form-data"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = require("./logger");
class DappStoreSDK {
    constructor({ baseUrl, logger = null }) {
        this._logger = logger_1.logger;
        this._cookies = '';
        if (logger) {
            this._logger = logger;
        }
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    }
    async login({ email, password }) {
        this._logger.info(chalk_1.default.green(`Login ...`));
        const res = await node_fetch_1.default(this.baseUrl + 'user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const ret = await res.json();
        if (ret.code && ret.code > 0) {
            throw new Error(`API response error: ${ret.code} ${ret.message}`);
        }
        this.parseCookies(res);
        this._logger.debug(chalk_1.default.blue(`Login successfully, the cookie is: ${this._cookies}`));
        return ret;
    }
    async uploadPackage({ pid, file }) {
        this._logger.info(chalk_1.default.green(`Uploading archive ...`));
        const form = new form_data_1.default();
        form.append('zip', fs_1.createReadStream(file));
        const res = await node_fetch_1.default(`${this.baseUrl}dapp/${pid}/packages`, {
            method: 'POST',
            headers: {
                'cookie': this._cookies,
            },
            body: form
        });
        const ret = await res.json();
        if (ret.code && ret.code > 0) {
            throw new Error(`API response error: ${ret.code} ${ret.message}`);
        }
        this._logger.debug(chalk_1.default.blue(`Upload successfully.`));
        return ret;
    }
    parseCookies(res) {
        // @ts-ignore 这里的 raw 方法是 fetch V2 接口
        this._cookies = res.headers.raw()['set-cookie'].map((entry) => {
            const parts = entry.split(';');
            return parts[0];
        }).join(';');
    }
}
exports.DappStoreSDK = DappStoreSDK;

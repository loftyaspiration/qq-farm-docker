export {};

const { getWxCredential } = require('../../models/store/wx-credentials');

const FARM_WX_APP_ID = 'wx5306c5978fdb76e4';

type WxCodeIssuer = (loginBuffer: string, appId: string) => Promise<string> | string;

async function issuePersistentWxCode(
    accountId: string,
    codeIssuer?: WxCodeIssuer,
): Promise<{ code: string; loginBuffer: string; openid: string } | null> {
    const credential = getWxCredential(accountId);
    if (!credential?.loginBuffer) return null;
    const issuer: WxCodeIssuer = codeIssuer || require('./native-protocol').getNativeWxLoginCode;
    const code = String(await issuer(credential.loginBuffer, FARM_WX_APP_ID)).trim();
    if (!code) throw new Error('持久微信登录未返回有效 Code');
    return {
        code,
        loginBuffer: credential.loginBuffer,
        openid: credential.openid,
    };
}

module.exports = {
    FARM_WX_APP_ID,
    issuePersistentWxCode,
};

export {};

const fs = require('node:fs');
const path = require('node:path');
const { getDataFile } = require('../../config/runtime-paths');
const { readJsonFile, writeJsonFileAtomic } = require('../../services/json-db');

export interface WxCredential {
    platform: 'wx';
    loginBuffer: string;
    openid: string;
    createdAt: number;
    updatedAt: number;
}

function normalizeAccountId(accountId: unknown): string {
    const id = String(accountId || '').trim();
    if (!/^\d+$/.test(id)) throw new Error('Invalid account id');
    return id;
}

function credentialDir(): string {
    return getDataFile(path.join('wx-login-credentials'));
}

function credentialPath(accountId: unknown): string {
    const id = normalizeAccountId(accountId);
    return path.join(credentialDir(), `${id}.json`);
}

function getWxCredential(accountId: unknown): WxCredential | null {
    const filePath = credentialPath(accountId);
    const data = readJsonFile(filePath, () => null);
    if (!data || typeof data !== 'object') return null;
    const loginBuffer = String(data.loginBuffer || '').trim();
    if (!loginBuffer) return null;
    return {
        platform: 'wx',
        loginBuffer,
        openid: String(data.openid || '').trim(),
        createdAt: Number(data.createdAt) || Date.now(),
        updatedAt: Number(data.updatedAt) || Date.now(),
    };
}

function saveWxCredential(
    accountId: unknown,
    payload: { loginBuffer: string; openid?: string },
): WxCredential {
    const id = normalizeAccountId(accountId);
    const loginBuffer = String(payload?.loginBuffer || '').trim();
    if (!loginBuffer) throw new Error('微信登录缓冲不能为空');
    const filePath = credentialPath(id);
    const old = getWxCredential(id);
    const now = Date.now();
    const data: WxCredential = {
        platform: 'wx',
        loginBuffer,
        openid: String(payload?.openid || old?.openid || '').trim(),
        createdAt: old?.createdAt || now,
        updatedAt: now,
    };
    writeJsonFileAtomic(filePath, data);
    try {
        fs.chmodSync(filePath, 0o600);
    } catch {
        // File permission hardening is best-effort; atomic write and data-dir ownership remain the baseline.
    }
    return data;
}

function deleteWxCredential(accountId: unknown): void {
    const filePath = credentialPath(accountId);
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error: any) {
        if (error?.code !== 'ENOENT') throw error;
    }
}

module.exports = {
    deleteWxCredential,
    getWxCredential,
    saveWxCredential,
};

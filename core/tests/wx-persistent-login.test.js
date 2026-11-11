const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('WeChat login buffer is persisted and can issue a fresh one-time code', async () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wx-persistent-'));
    process.env.QQ_FARM_DATA_DIR = dataDir;

    const {
        getWxCredential,
        saveWxCredential,
        deleteWxCredential,
    } = require('../dist/models/store/wx-credentials');
    const { issuePersistentWxCode } = require('../dist/services/wx-login/persistent-code');

    try {
        assert.equal(getWxCredential('1'), null);

        const saved = saveWxCredential('1', {
            loginBuffer: 'login-buffer-value',
            openid: 'openid-value',
        });
        assert.equal(saved.platform, 'wx');
        assert.equal(saved.loginBuffer, 'login-buffer-value');

        const loaded = getWxCredential('1');
        assert.equal(loaded.loginBuffer, 'login-buffer-value');
        assert.equal(loaded.openid, 'openid-value');

        if (process.platform !== 'win32') {
            const filePath = path.join(dataDir, 'wx-login-credentials', '1.json');
            assert.equal(fs.statSync(filePath).mode & 0o777, 0o600);
        }

        const calls = [];
        const refreshed = await issuePersistentWxCode('1', async (loginBuffer, appId) => {
            calls.push({ loginBuffer, appId });
            return 'fresh-one-time-code';
        });
        assert.deepEqual(calls, [{
            loginBuffer: 'login-buffer-value',
            appId: 'wx5306c5978fdb76e4',
        }]);
        assert.equal(refreshed.code, 'fresh-one-time-code');

        deleteWxCredential('1');
        assert.equal(getWxCredential('1'), null);
        assert.equal(await issuePersistentWxCode('1', async () => 'should-not-be-called'), null);
    } finally {
        fs.rmSync(dataDir, { recursive: true, force: true });
        delete process.env.QQ_FARM_DATA_DIR;
    }
});

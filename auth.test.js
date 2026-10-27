import test from 'node:test';
import assert from 'node:assert/strict';
import { setupAuth } from './public/auth.js';
import { findVideos } from './public/youtube.js';

test('Google login requests read-only access, reads channel and clears token on disconnect', async () => {
  const originalGoogle = globalThis.google, originalFetch = globalThis.fetch;
  let config, requested, revoked;
  const loginButton = {}, logoutButton = {}, status = {}, clientInput = { value: 'test.apps.googleusercontent.com' };
  globalThis.google = { accounts: { oauth2: {
    initTokenClient: options => { config = options; return { requestAccessToken: options => { requested = options; } }; },
    hasGrantedAllScopes: () => true,
    revoke: (token, callback) => { revoked = token; callback({}); }
  } } };
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).searchParams.get('mine'), 'true');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return Response.json({ items: [{ snippet: { title: 'My Channel' } }] });
  };
  try {
    const auth = setupAuth({ loginButton, logoutButton, status, clientInput, onChange: () => {} });
    loginButton.onclick();
    assert.equal(config.scope, 'https://www.googleapis.com/auth/youtube.readonly');
    assert.equal(requested.prompt, 'select_account');
    await config.callback({ access_token: 'test-token', expires_in: 3600 });
    assert.equal(auth.currentToken(), 'test-token');
    assert.match(status.textContent, /My Channel/);
    assert.equal(loginButton.hidden, true);
    logoutButton.onclick();
    assert.equal(auth.currentToken(), ''); assert.equal(revoked, 'test-token');
    assert.equal(logoutButton.hidden, true);
    loginButton.onclick();
    await config.callback({ error: 'access_denied' });
    assert.equal(auth.currentToken(), ''); assert.equal(loginButton.disabled, false);
    config.error_callback({type:'popup_closed'});
    assert.equal(auth.currentToken(), '');
  } finally { logoutButton.onclick?.(); globalThis.google = originalGoogle; globalThis.fetch = originalFetch; }
});

test('authenticated YouTube requests send bearer token without exposing it in URL', async () => {
  const result = await findVideos('dQw4w9WgXcQ', '', 'date', async (url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.equal(new URL(url).searchParams.has('key'), false);
    assert.equal(String(url).includes('test-token'), false);
    return Response.json({items:[{id:'dQw4w9WgXcQ',snippet:{title:'Authenticated video'}}]});
  }, 'test-token');
  assert.equal(result.videos[0].snippet.title, 'Authenticated video');
});

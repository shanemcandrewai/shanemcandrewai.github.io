export default class Dropbox {
  async save(json, filename = 'dbtest.json', codeToken = undefined) {
    let messages = new Map();
    if (typeof this.accessToken === 'undefined') messages = await this.init(codeToken, filename);
    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': `{"path":"/${this.filename}","mode":{".tag":"overwrite"}}`,
        },
        body: json.getString(),
      });
      const respjson = await response.json();
      if (Object.hasOwn(respjson, 'error_summary')
        && respjson.error_summary.substring(0, 20) === 'expired_access_token') delete this.accessToken;
      messages.set('upload_response', respjson);
      return messages;
    } catch (uploadError) {
      delete this.accessToken;
      return uploadError;
    }
  }

  async load(json, filename, codeToken) {
    let messages = new Map();
    if (typeof this.accessToken === 'undefined') { messages = await this.init(codeToken, filename); }
    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Dropbox-API-Arg': `{"path":"/${this.filename}"}`,
        },
      });
      messages.set('download_response', response);
      messages.set('records loaded', json.readText(await response.text()));
      return messages;
    } catch (downloadError) {
      delete this.accessToken;
      return downloadError;
    }
  }

  async getRefreshToken(authCode) {
    // get authorization code (authCode) from
    // https://www.dropbox.com/oauth2/authorize?client_id=r70n2c1pvk7jfny&response_type=code&code_challenge=0-qX5rNGO-CxDjEuTs5iY_fS6dgXkMLSHJw-dIfJb8o&code_challenge_method=S256&token_access_type=offline
    // where code_challenge is SHA-256 encypted codeChallenge https://tonyxu-io.github.io/pkce-generator/
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        code: authCode,
        grant_type: 'authorization_code',
        client_id: this.appKey,
        code_verifier: this.codeChallenge,
      }),
    });
    return response.json();
  }

  async getAccessToken(refreshToken) {
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.appKey,
      }),
    });
    const result = await response.json();
    if (typeof result.access_token === 'undefined') throw new Error(result);
    return result.access_token;
  }

  async init(codeToken, filename) {
    if (!filename && !this.filename) this.filename = 'dbtest.json';
    else if (filename) this.filename = filename;
    try {
      if (typeof codeToken !== 'undefined') {
        this.accessToken = await this.getAccessToken(codeToken);
        this.refreshToken = codeToken;
        if (this.accessToken) {
          return new Map([['display', 'Dropbox access token renewed from input refresh token\n']]);
        }
      } else this.accessToken = await this.getAccessToken(this.refreshToken);
      return new Map([['display', 'Dropbox access token renewed from cached refresh token\n']]);
    } catch (accessTokenError) {
      try {
        const result = await this.getRefreshToken(codeToken);
        if (typeof result.refresh_token !== 'undefined') {
          this.refreshToken = result.refresh_token;
          this.accessToken = result.access_token;
          return new Map([['display', `Dropbox refresh token renewed: ${this.refreshToken}\n`], ['refreshToken', this.refreshToken]]);
        }
      } catch (refreshError) { return new Map([['refreshError', refreshError]]); }
    } return new Map([['Dropbox init should never reach here', 'OK\n']]);
  }

  constructor(
    codeToken,
    appKey = 'r70n2c1pvk7jfny',
    codeChallenge = '5etjDk74rywQgfkklrLt67terlJLJFJASLLej64556e',
  ) {
    this.appKey = appKey;
    this.codeChallenge = codeChallenge;
  }
}

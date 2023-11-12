export default class Dropbox {
  async save(
    json,
    filename,
    refreshOrCode,
    appKey = 'tbvg8rezh4v1th3',
    codeChallenge = '5etjDk74rywQgfkklrLt67terlJLJFJASLLej64556e',
  ) {
    if ((typeof filename === 'undefined' || !filename) && !this.filename) this.filename = 'dbtest.json';
    else this.filename = filename;
    if (typeof this.accessToken === 'undefined') {
      try {
        if (typeof refreshOrCode !== 'undefined') {
          this.accessToken = await Dropbox.getAccessToken(refreshOrCode, appKey);
          this.refreshToken = refreshOrCode;
        } else this.accessToken = await Dropbox.getAccessToken(this.refreshToken, appKey);
      } catch (accessTokenError) {
        try {
          const result = await Dropbox.getRefreshToken(appKey, refreshOrCode, codeChallenge);
          if (typeof result.refresh_token !== 'undefined') {
            this.refreshToken = result.refresh_token;
            this.accessToken = result.access_token;
          } else return result;
        } catch (refreshError) { return refreshError; }
      }
    }
    try {
      return await Dropbox.upload(json, this.filename, this.accessToken);
    } catch (uploadError) { return uploadError; }
  }

  async load(
    json,
    filename,
    refreshOrCode,
    appKey = 'tbvg8rezh4v1th3',
    codeChallenge = '5etjDk74rywQgfkklrLt67terlJLJFJASLLej64556e',
  ) {
    if ((typeof filename === 'undefined' || !filename) && !this.filename) this.filename = 'dbtest.json';
    else this.filename = filename;
    if (typeof this.accessToken === 'undefined') {
      try {
        if (typeof refreshOrCode !== 'undefined') {
          this.accessToken = await Dropbox.getAccessToken(refreshOrCode, appKey);
          this.refreshToken = refreshOrCode;
        } else this.accessToken = await Dropbox.getAccessToken(this.refreshToken, appKey);
      } catch (accessTokenError) {
        try {
          const result = await Dropbox.getRefreshToken(appKey, refreshOrCode, codeChallenge);
          if (typeof result.refresh_token !== 'undefined') {
            this.refreshToken = result.refresh_token;
            this.accessToken = result.access_token;
          } else return result;
        } catch (refreshError) { return refreshError; }
      }
    }
    try {
      return await Dropbox.download(json, this.filename, this.accessToken);
    } catch (downloadError) { return downloadError; }
  }

  static async upload(json, filename, accessToken) {
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': `{"path":"/${filename}","mode":{".tag":"overwrite"}}`,
      },
      body: json.getString(),
    });
    return response.json();
  }

  static async download(json, filename, accessToken) {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Dropbox-API-Arg': `{"path":"/${filename}"}`,
      },
    });
    return json.readText(await response.text());
  }

  static async getRefreshToken(appKey, authCode, codeChallenge) {
    // get authorization code (authCode) from
    // https://www.dropbox.com/oauth2/authorize?client_id=tbvg8rezh4v1th3&response_type=code&code_challenge=0-qX5rNGO-CxDjEuTs5iY_fS6dgXkMLSHJw-dIfJb8o&code_challenge_method=S256&token_access_type=offline
    // where code_challenge is SHA-256 encypted codeChallenge https://tonyxu-io.github.io/pkce-generator/
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        code: authCode,
        grant_type: 'authorization_code',
        client_id: appKey,
        code_verifier: codeChallenge,
      }),
    });
    return response.json();
  }

  static async getAccessToken(refreshToken, appKey) {
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: appKey,
      }),
    });
    const result = await response.json();
    if (typeof result.access_token === 'undefined') throw new Error(result);
    return result.access_token;
  }
}

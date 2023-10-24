export default class UtcConv {
  static getLocalDateTime(utcString) {
    try {
      const utc = utcString === undefined ? new Date() : new Date(utcString);
      utc.setMinutes(utc.getMinutes() - utc.getTimezoneOffset());
      const local = utc.toISOString();
      return `${local.slice(0, 10)} ${local.slice(11, 16)}`;
    } catch (error) { return utcString; }
  }

  static getUTCDateTime(localString) {
    try {
      return new Date(localString).toISOString();
    } catch (error) { return localString; }
  }
}

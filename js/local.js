export default class Local {
  static save(db, filename = 'dbtest.json') {
    const anc = document.createElement('a');
    anc.download = filename;
    anc.href = window.URL.createObjectURL(db.getBlob());
    anc.click();
  }

  async load(db) {
    try {
      return await db.readFile(this.file);
    } catch (readFileError) {
      return readFileError;
    }
  }

  constructor(file) { this.file = file; }
}

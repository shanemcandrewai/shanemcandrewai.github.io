export default class Local {
  save(db, filename = 'dbtest.json') {
    const anc = document.createElement('a');
    if (typeof filename !== 'undefined') this.filename = filename;
    anc.download = this.file.filename;
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

  constructor(file) {
    if (file instanceof File) {
      this.file = file;
      this.filename = file.name;
    }
  }
}

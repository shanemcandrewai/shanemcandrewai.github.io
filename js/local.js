export default class Local {
  save(db) {
    const anc = document.createElement('a');
    anc.download = this.file.name;
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

import ArrObj from './arrobj.js';
import { read, utils, write } from './xlsx.mjs';

export default class Xlsx {
  getBlob() {
    const worksheet = utils.json_to_sheet(this.arrobj.getArrObj());
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'main');
    const u8 = write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const blob = new Blob([u8], { type: 'application/vnd.ms-excel' });
    return blob;
  }

  async readFile(file) {
    const wb = read(await file.arrayBuffer());
    this.arrobj.setArrObj(utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
  }

  constructor(db) {
    this.arrobj = new ArrObj(db);
  }
}

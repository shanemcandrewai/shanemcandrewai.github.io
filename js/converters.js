import { utils } from './xlsx.mjs';
import { getArrayObjs } from './model.js';

export const mapEncoder = (key, value) => {
  if (value instanceof Map) {
    return { dataType: 'Map', value: Array.from(value.entries()) };
  }
  return value;
};

export const mapDecoder = (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') { return new Map(value.value); }
  }
  return value;
};

export const getExcel = () => {
  const worksheet = utils.json_to_sheet(getArrayObjs());
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'main');
  return workbook;
};

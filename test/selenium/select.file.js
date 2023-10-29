import { By, Builder, Browser } from 'selenium-webdriver';
import { suite } from 'selenium-webdriver/testing/index.js';
import { strict as assert } from 'node:assert';

suite(() => {
  describe('wl tests', () => {
    let driver;

    before(async () => {
      driver = await new Builder().forBrowser('chrome').build();
    });

    after(async () => driver.quit());

    it('Select file tests', async () => {
      await driver.get('http://localhost:3000/');

      const title = await driver.getTitle();
      assert.equal('wl', title);

      await driver.manage().setTimeouts({ implicit: 500 });

      const uploadInput = await driver.findElement(By.id('uploadInput'));
      await uploadInput.sendKeys('C:\\Users\\shane\\dev\\wl\\pub\\test\\db.json');
      const selectFile = await driver.findElement(By.id('selectFile'));
      assert.equal('db.json', await selectFile.getText());
      const load = await driver.findElement(By.id('load'));
      await load.click();
      const description = await driver.findElement(By.id('description'));
      assert.equal('aaa', await description.getAttribute('value'));
      await description.sendKeys('bbb');
      const update = await driver.findElement(By.id('update'));
      await update.click();

      const save = await driver.findElement(By.id('save'));
      await save.click();
      await save.sendKeys('C:\\Users\\shane\\dev\\wl\\pub\\test\\db2.json');
    });
  });
}, { browsers: [Browser.CHROME] });

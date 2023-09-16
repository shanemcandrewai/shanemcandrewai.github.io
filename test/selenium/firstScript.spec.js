import { By, Builder, Browser } from 'selenium-webdriver';
import { suite } from 'selenium-webdriver/testing/index.js';
import { strict as assert } from 'node:assert';

suite(() => {
  describe('Selenium tests', () => {
    let driver;

    before(async () => {
      driver = await new Builder().forBrowser('chrome').build();
    });

    after(async () => driver.quit());

    it('First Selenium script', async () => {
      await driver.get('https://www.selenium.dev/selenium/web/web-form.html');

      const title = await driver.getTitle();
      assert.equal('Web form', title);

      await driver.manage().setTimeouts({ implicit: 500 });

      const textBox = await driver.findElement(By.name('my-text'));
      const submitButton = await driver.findElement(By.css('button'));

      await textBox.sendKeys('Selenium');
      await submitButton.click();

      const message = await driver.findElement(By.id('message'));
      const value = await message.getText();
      assert.equal('Received!', value);
    });
  });
}, { browsers: [Browser.CHROME] });

const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const { ServiceBuilder } = require('selenium-webdriver/chrome');
const assert = require("assert");
const path = require('path');

(async () => {
    const options = new Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--remote-debugging-port=9222');
    options.addArguments('--disable-web-security');
    options.addArguments('--allow-running-insecure-content');
    
    // Specify the ChromeDriver path explicitly
    const service = new ServiceBuilder(path.join(__dirname, 'node_modules', 'chromedriver', 'lib', 'chromedriver', 'chromedriver'));
    
    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .setChromeService(service)
        .build();

    try {
        await driver.get("https://student.must.edu.mn");
        await driver.findElement(By.id("username")).sendKeys("B222270038");
        await driver.findElement(By.id("password")).sendKeys("042823");

        await driver.findElement(By.css("input.btn.btn-primary.btn-block")).click();
        const x = await driver.findElement(By.css("body > div.wrapper > div.menu > div.admin > ul > li > a"));
        const text = await x.getText();
        
        assert.strictEqual("B222270038", text, "Тест амжилтгүй");
        console.log("Тест амжилттай!");

        // Wait for the modal backdrop to disappear (with better error handling)
        try {
            await driver.wait(until.elementIsNotVisible(driver.findElement(By.css(".modal-backdrop"))), 5000);
        } catch (e) {
            console.log("Modal backdrop wait timeout - trying to remove it manually");
            // Try to remove the modal backdrop manually
            try {
                await driver.executeScript("document.querySelector('.modal-backdrop').remove();");
            } catch (scriptError) {
                console.log("Could not remove modal backdrop via script");
            }
        }

        // Wait a bit more and try to click logout
        await driver.sleep(1000);
        
        try {
            const logoutButton = await driver.findElement(By.xpath('//ul[@class="buttons"]//a[contains(@href, "logoutForm")]'));
            await logoutButton.click();
            console.log("Logout амжилттай");
        } catch (logoutError) {
            console.log("Logout button click failed, but main test was successful");
        }
    }
    catch(e) {
        console.log("Test хийхэд алдаа гарлаа:");
        console.log(e);
    }
    finally {
        await driver.quit();
    }
})();
// Selenium WebDriver-ийн шаардлагатай модулиудыг импортлож байна
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const fs = require('fs');
require('dotenv').config();

// Оюутны порталыг автоматаар удирдах зориулалттай класс
class StudentPortalAutomation {
    constructor() {
    this.driver = null; // Chrome WebDriver-ийн instance
    }

  // Chrome WebDriver-ийг эхлүүлэх функц
    async initializeDriver() {
        try {
      console.log('Chrome WebDriver-ийг эхлүүлж байна...');
            
      const service = new chrome.ServiceBuilder(chromedriver.path);
            const options = new chrome.Options();
      options.addArguments('--no-sandbox'); // Linux-д sandbox асуудлыг саармагжуулах
      options.addArguments('--disable-dev-shm-usage'); // Санах ой болон resource асуудлыг саармагжуулах
      options.addArguments('--disable-gpu'); // GPU-г унтраах

      // Chrome WebDriver-г үүсгэж байна
            this.driver = await new Builder()
                .forBrowser('chrome')
        .setChromeService(service)
                .setChromeOptions(options)
                .build();
            
      console.log('Chrome WebDriver амжилттай эхэллээ!');
      await this.driver.manage().setTimeouts({ implicit: 10000 }); // Автомат implicit wait
        } catch (error) {
      console.error('WebDriver-ийг эхлүүлэхэд алдаа гарлаа:', error.message);
            throw error;
        }
    }

  // Хүссэн хугацаагаар түр амрах функц
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Modal-backdrop буюу харуулын арын давхаргыг алга болохыг хүлээх
  async waitForModalToDisappear() {
    try {
      await this.driver.wait(async () => {
        try {
          const modalBackdrop = await this.driver.findElement(By.css('.modal-backdrop'));
          const display = await modalBackdrop.getCssValue('display');
          return display === 'none';
        } catch (error) {
          return true; // Хэрэв олдохгүй бол арилсан гэж үзнэ
        }
      }, 10000);
      console.log('Modal backdrop алга боллоо');
    } catch (error) {
      console.log('️ Modal backdrop хүлээх хугацаа дууслаа, үргэлжлүүлж байна...');
    }
  }

  // Нэвтрэх модалыг хаах функц
  async closeLoginModal() {
    try {
      await this.sleep(1000); // Modal бүрэн гарч ирэхийг хүлээх

      const modal = await this.driver.findElement(By.id('myModal'));
      const modalDisplay = await modal.getCssValue('display');

      if (modalDisplay === 'block') {
        console.log(' Login modal гарсан байна, хаахыг оролдож байна...');

        let modalClosed = false;

        // JavaScript ашиглан modal-ийг хаах оролдлого
        try {
          await this.driver.executeScript(`
            const modal = document.getElementById('myModal');
            if (modal) {
              modal.style.display = 'none';
              modal.classList.remove('fade', 'in');
              modal.setAttribute('aria-hidden', 'true');
            }
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            const closeEvent = new Event('click');
            if (modal) modal.dispatchEvent(closeEvent);
          `);
          console.log(' JavaScript ашиглан modal-ийг хаалаа');
          modalClosed = true;
        } catch (error) {
          console.log('️ JavaScript арга амжилтгүй боллоо, click аргыг туршина...');
        }

        // Хэрвээ modal хаагдаагүй бол click аргаар оролдож хаах
        if (!modalClosed) {
          try {
            const modalDialog = await this.driver.findElement(By.css('.modal-dialog'));
            await modalDialog.click();
            console.log(' Modal dialog дээр дарлаа');
            modalClosed = true;
          } catch (error) {
            console.log('️ Modal dialog дээр дарж чадаагүй, backdrop-г туршина...');

            try {
              const modalBackdrop = await this.driver.findElement(By.css('.modal-backdrop'));
              await modalBackdrop.click();
              console.log(' Modal backdrop дээр дарлаа');
              modalClosed = true;
            } catch (error2) {
              console.log('️ Backdrop дээр дарж чадаагүй, Escape товч дарж байна...');

              await this.driver.actions().sendKeys('\uE00C').perform();
              console.log(' Escape товч дарлаа');
              modalClosed = true;
            }
          }
        }

        // Modal хаагдсан эсэхийг шалгах
        if (modalClosed) {
          await this.driver.wait(async () => {
            try {
              const modalElement = await this.driver.findElement(By.id('myModal'));
              const display = await modalElement.getCssValue('display');
              return display === 'none';
            } catch (error) {
              return true;
            }
          }, 2000);

          console.log(' Login modal амжилттай хаагдлаа');
        } else {
          console.log('️ Modal-г автоматаар хааж чадсангүй, хүчээр устгахыг оролдож байна...');

          try {
            await this.driver.executeScript(`
              const modal = document.getElementById('myModal');
              if (modal) modal.remove();
              const backdrops = document.querySelectorAll('.modal-backdrop');
              backdrops.forEach(backdrop => backdrop.remove());
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';
            `);
            console.log(' Modal элементийн бүх хэсгийг устгалаа');
            modalClosed = true;
          } catch (error) {
            console.log('️ Хүчээр устгах амжилтгүй, гараар хаагаарай');
            console.log(' 10 секунд хүлээж байна...');
            await this.sleep(10000);
          }
        }
      } else {
        console.log(' Login modal харагдахгүй байна');
      }
    } catch (error) {
      console.log(' Login modal байхгүй эсвэл аль хэдийн хаагдсан байна');
    }
  }

  // Скриншот авах функц
  async takeScreenshot(filename) {
    try {
      const screenshot = await this.driver.takeScreenshot();
      fs.writeFileSync(filename, screenshot, 'base64');
      console.log(` Скриншот хадгалагдлаа: ${filename}`);
    } catch (error) {
      console.error(' Скриншот авахад алдаа гарлаа:', error.message);
    }
  }

  // Веб сайтыг нээх функц
  async navigateToWebsite(url) {
    try {
      console.log(` Нэвтрэх вэб сайт: ${url}`);
      await this.driver.get(url);
      console.log(' Вэб сайт амжилттай нээгдлээ!');
      await this.driver.wait(until.titleContains(''), 10000);
    } catch (error) {
      console.error(' Вэб сайт нээхэд алдаа гарлаа:', error.message);
      throw error;
    }
  }

  // Одоо байгаа URL-ийг авах функц
    async getCurrentUrl() {
        try {
            const url = await this.driver.getCurrentUrl();
      console.log(` Одоо байгаа URL: ${url}`);
            return url;
        } catch (error) {
      console.error(' URL-ийг авахад алдаа гарлаа:', error.message);
            throw error;
        }
    }

  // ==================== Login тохиргоо ====================

  // Нэвтрэх товчийг олох функц
  async findLoginButton() {
    try {
      // value="Нэвтрэх" гэсэн input-ийг хайж олно
      return await this.driver.findElement(By.xpath('//input[@value="Нэвтрэх"]'));
    } catch (error) {
      try {
        // input submit эсвэл button submit элементийн аль нэгийг хайна
        return await this.driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
      } catch (error2) {
        throw new Error('Login товч олдсонгүй');
      }
    }
  }

  // Нэвтрэх оролдлого
    async attemptLogin(username, password) {
        try {
            const usernameInput = await this.driver.findElement(By.id('username'));
            const passwordInput = await this.driver.findElement(By.id('password'));
      const loginButton = await this.findLoginButton();

      // Нэр болон нууц үг оруулж, login товчийг дарна
            await usernameInput.sendKeys(username);
            await passwordInput.sendKeys(password);
            await loginButton.click();
      await this.sleep(500);

      // Нэвтрэлт амжилттай эсэхийг шалгана
      await this.checkLoginResult();
        } catch (error) {
      console.error(' Нэвтрэх оролдлого амжилтгүй:', error.message);
            throw error;
        }
    }

  // Нэвтрэлт амжилттай эсэхийг шалгах функц
  async checkLoginResult() {
    try {
      const userNameError = await this.driver.findElement(By.id('email_error'));
      const passwordError = await this.driver.findElement(By.id('password_error'));

      const userNameDisplay = await userNameError.getCssValue('display');
      const passwordDisplay = await passwordError.getCssValue('display');

      if (userNameDisplay !== 'none') {
        const userNameText = await userNameError.getText();
        console.log(` Хэрэглэгчийн нэр алдаа: ${userNameText}`);
        await this.takeScreenshot('Username_error.png');
      } else if (passwordDisplay !== 'none') {
        const passwordText = await passwordError.getText();
        console.log(` Нууц үгийн алдаа: ${passwordText}`);
        await this.takeScreenshot('Password_error.png');
      } else {
        console.log(' Нэвтрэлт амжилттай!');
        await this.takeScreenshot('Login_Success.png');
        // Амжилттай нэвтэрсний дараа модалыг хаах
        await this.closeLoginModal();
      }
    } catch (error) {
      // Хэрэв error элементийг олдохгүй бол нэвтрэлт амжилттай
      console.log(' Нэвтрэлт амжилттай! (Error элемент олдсонгүй)');
      await this.takeScreenshot('Login_Success.png');
      await this.closeLoginModal();
    }
  }

  // ==================== Dropdown болон төлбөрийн мэдээлэл ====================

  async findStudentDropdownElement() {
    try {
      const element = await this.driver.findElement(
        By.xpath('//span[@class="text" and text()="ОЮУТАН"]')
      );
      console.log(' Оюутны dropdown элементийг оллоо');
      return element;
        } catch (error) {
      console.error(' Оюутны dropdown олдсонгүй:', error.message);
            throw error;
        }
    }

  async findPaymentInfoDropdownElement() {
    try {
      const element = await this.driver.findElement(
        By.xpath('//span[@class="text" and text()="Төлбөрийн мэдээлэл"]')
      );
      console.log(' Төлбөрийн мэдээллийн dropdown элементийг оллоо');
      return element;
        } catch (error) {
      console.error(' Төлбөрийн мэдээллийн dropdown олдсонгүй:', error.message);
            throw error;
        }
    }

  async findFeesToPayElement() {
    try {
      const element = await this.driver.findElement(
        By.xpath('//tr[td[contains(text(), "Төлөх төлбөр:")]]//span[@class="price"]')
      );
      const amount = await element.getText();
      console.log(` Төлөх төлбөр олдлоо: ${amount}`);
      return element;
        } catch (error) {
      console.error(' Төлөх төлбөр олдсонгүй:', error.message);
            throw error;
        }
    }

  async findUnderpaymentAmountElement() {
    try {
      const element = await this.driver.findElement(
        By.xpath('//tr[td[contains(text(), "Төлбөрийн дутуу:")]]//span[@class="price"]')
      );
      const amount = await element.getText();
      console.log(` Дутуу төлбөр олдлоо: ${amount}`);
      return element;
        } catch (error) {
      console.error(' Дутуу төлбөр олдсонгүй:', error.message);
            throw error;
        }
    }

  // Төлбөрийн хуудсанд шилжих функц
  async goToPaymentPage() {
    try {
      await this.waitForModalToDisappear();
      await this.sleep(500);

      const studentDropdown = await this.findStudentDropdownElement();
      await studentDropdown.click();
      await this.sleep(500);

      const paymentInfoDropdown = await this.findPaymentInfoDropdownElement();
      await paymentInfoDropdown.click();
      await this.sleep(500);

      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes('TulburAction')) {
        console.log(' Төлбөрийн хуудсанд амжилттай орлоо');
        return await this.getPaymentData();
      } else {
        throw new Error('Төлбөрийн хуудсанд шилжиж чадсангүй');
      }
        } catch (error) {
      console.error(' Төлбөрийн хуудсанд шилжихэд алдаа:', error.message);
            throw error;
        }
    }

  async getPaymentData() {
    try {
      const feesToPayElement = await this.findFeesToPayElement();
      const underpaymentElement = await this.findUnderpaymentAmountElement();

      const feesToPayAmount = await feesToPayElement.getText();
      const underpaymentAmount = await underpaymentElement.getText();

      console.log(` Төлөх төлбөр: ${feesToPayAmount}`);
      console.log(` Дутуу төлбөр: ${underpaymentAmount}`);

      return { feesToPayAmount, underpaymentAmount };
        } catch (error) {
      console.error(' Төлбөрийн мэдээлэл авахад алдаа гарлаа:', error.message);
            throw error;
        }
    }

  // ==================== Assertions буюу үр дүнг шалгах ====================
  
  // Assert equal функц - утгууд тэнцүү эсэхийг шалгах
  assertEqual(actual, expected, message) {
    if (actual === expected) {
      console.log(` Assert Equal: ${message} - PASSED`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Actual: ${actual}`);
      return true;
    } else {
      console.log(` Assert Equal: ${message} - FAILED`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Actual: ${actual}`);
      return false;
    }
  }

  // Assert true функц - утга үнэн эсэхийг шалгах
  assertTrue(condition, message) {
    if (condition === true) {
      console.log(` Assert True: ${message} - PASSED`);
      return true;
    } else {
      console.log(` Assert True: ${message} - FAILED`);
      console.log(`   Condition: ${condition}`);
      return false;
    }
  }

  // Assert false функц - утга худал эсэхийг шалгах
  assertFalse(condition, message) {
    if (condition === false) {
      console.log(` Assert False: ${message} - PASSED`);
      return true;
    } else {
      console.log(` Assert False: ${message} - FAILED`);
      console.log(`   Condition: ${condition}`);
      return false;
    }
  }

  // Assert contains функц - текст агуулсан эсэхийг шалгах
  assertContains(text, substring, message) {
    if (text.includes(substring)) {
      console.log(` Assert Contains: ${message} - PASSED`);
      console.log(`   Text: "${text}"`);
      console.log(`   Contains: "${substring}"`);
      return true;
    } else {
      console.log(` Assert Contains: ${message} - FAILED`);
      console.log(`   Text: "${text}"`);
      console.log(`   Expected to contain: "${substring}"`);
      return false;
    }
  }

  // Assert not null функц - утга null биш эсэхийг шалгах
  assertNotNull(value, message) {
    if (value !== null && value !== undefined) {
      console.log(` Assert Not Null: ${message} - PASSED`);
      console.log(`   Value: ${value}`);
      return true;
    } else {
      console.log(` Assert Not Null: ${message} - FAILED`);
      console.log(`   Value: ${value}`);
      return false;
    }
  }

  // Нэвтрэлт амжилттай эсэхийг шалгах
  async assertLoginSuccess() {
    try {
      const currentUrl = await this.driver.getCurrentUrl();
      const isNotOnLoginPage = !currentUrl.includes('Login');
      
      return this.assertTrue(isNotOnLoginPage, 'Нэвтрэлт амжилттай - Login хуудаснаас гарсан');
    } catch (error) {
      console.error(' Assertion: Нэвтрэлт шалгахад алдаа:', error.message);
      return false;
    }
  }

  // Оюутны dropdown элементийг олсон эсэхийг шалгах
  async assertStudentDropdownFound() {
    try {
      const studentElement = await this.findStudentDropdownElement();
      const studentText = await studentElement.getText();
      
      return this.assertEqual(studentText, 'ОЮУТАН', 'Оюутны dropdown текст зөв байна');
    } catch (error) {
      console.log(' Assertion: Оюутны dropdown олдсонгүй');
      return false;
    }
  }

  // Төлбөрийн хуудсанд шилжсэн эсэхийг шалгах
  async assertPaymentPageReached() {
    try {
      const currentUrl = await this.driver.getCurrentUrl();
      
      return this.assertContains(currentUrl, 'TulburAction', 'Төлбөрийн хуудсанд амжилттай шилжлээ');
    } catch (error) {
      console.error(' Assertion: Төлбөрийн хуудас шалгахад алдаа:', error.message);
      return false;
    }
  }

  // Төлбөрийн мэдээлэл зөв эсэхийг шалгах
  async assertPaymentDataValid() {
    try {
      const paymentData = await this.getPaymentData();
      
      // Төлбөрийн дүн тоон утга эсэхийг шалгах
      const feesToPayValid = /^\d{1,3}(,\d{3})*\.\d{2}$/.test(paymentData.feesToPayAmount);
      const underpaymentValid = /^\d{1,3}(,\d{3})*\.\d{2}$/.test(paymentData.underpaymentAmount);
      
      const feesResult = this.assertTrue(feesToPayValid, `Төлөх төлбөр зөв форматтай: ${paymentData.feesToPayAmount}`);
      const underpaymentResult = this.assertTrue(underpaymentValid, `Дутуу төлбөр зөв форматтай: ${paymentData.underpaymentAmount}`);
      
      return feesResult && underpaymentResult;
    } catch (error) {
      console.error(' Assertion: Төлбөрийн мэдээлэл шалгахад алдаа:', error.message);
      return false;
    }
  }

  // Гарах амжилттай эсэхийг шалгах
  async assertLogoutSuccess() {
    try {
      await this.sleep(2000); // Гарсны дараа хугацаа өгөх
      const currentUrl = await this.driver.getCurrentUrl();
      
      return this.assertContains(currentUrl, 'Login', 'Амжилттай гарлаа - Login хуудас руу буцлаа');
    } catch (error) {
      console.error(' Assertion: Гарах шалгахад алдаа:', error.message);
      return false;
    }
  }

  // Бүх assertion-уудыг ажиллуулах
  async runAllAssertions() {
    console.log('\n Assertions буюу үр дүнг шалгаж байна...');
    
    const results = {
      loginSuccess: await this.assertLoginSuccess(),
      studentDropdownFound: await this.assertStudentDropdownFound(),
      paymentPageReached: await this.assertPaymentPageReached(),
      paymentDataValid: await this.assertPaymentDataValid(),
      logoutSuccess: await this.assertLogoutSuccess()
    };

    const passedCount = Object.values(results).filter(result => result === true).length;
    const totalCount = Object.keys(results).length;

    console.log(`\n Assertion үр дүн: ${passedCount}/${totalCount} амжилттай`);
    
    if (passedCount === totalCount) {
      console.log(' Бүх assertion-ууд амжилттай!');
    } else {
      console.log('️ Зарим assertion-ууд амжилтгүй боллоо');
    }

    return results;
  }

  // ==================== Logout функц ====================
  // Оюутны порталас гарах зориулалттай функц
  async attemptLogout() {
    try {
      // Logout товчийг олж click хийх оролдлого
      let logoutButton;

      try {
        // Арга 1: ul.buttons гэсэн бүтэцтэй доторх <a> элементийг href-д "logoutForm" агуулсан байдлаар хайх
        logoutButton = await this.driver.findElement(
          By.xpath('//ul[@class="buttons"]//a[contains(@href, "logoutForm")]')
        );
        console.log(' Гарах товчийг ul.buttons-аас оллоо');
      } catch (error) {
        try {
          // Арга 2: Текстээр "Гарах" гэж бичсэн <a> элементийг хайх
          logoutButton = await this.driver.findElement(By.xpath('//a[contains(text(), "Гарах")]'));
          console.log(' Гарах товчийг текстээр оллоо');
        } catch (error2) {
          try {
            // Арга 3: <span class="text"> элементээс "Гарах" текстийг агуулсан parent <a> элементийг хайх
            logoutButton = await this.driver.findElement(
              By.xpath('//span[@class="text" and text()="Гарах"]/parent::a')
            );
            console.log(' Гарах товчийг span.text-ээр оллоо');
          } catch (error3) {
            // Хэрэв дээрх бүх аргаар олдохгүй бол алдаа шиднэ
            throw new Error('Гарах товч олдсонгүй');
          }
        }
      }

      // Олсон товчийг дарж гарна
      await logoutButton.click();
      await this.sleep(1000); // Гарсны дараа бага хугацаагаар хүлээх
      console.log(' Амжилттай гарлаа');
        } catch (error) {
      // Хэрэв товч олдохгүй бол алдаа мэдээлнэ
      console.error(' Гарах товч олдсонгүй:', error.message);
            throw error;
        }
    }

  // ==================== Браузер хаах ====================

    async closeBrowser() {
        try {
            if (this.driver) {
        console.log(' Браузерийг хааж байна...');
                await this.driver.quit();
                this.driver = null;
        console.log(' Браузер амжилттай хаагдлаа!');
            }
        } catch (error) {
      console.error(' Браузер хаахад алдаа гарлаа:', error.message);
            throw error;
        }
    }

  // ==================== Автоматжуулалт эхлүүлэх ====================
  async runAutomation() {
    try {
      // Environment variables шалгах
      if (!process.env.STUDENT_CODE || !process.env.STUDENT_PASSWORD) {
        throw new Error('STUDENT_CODE болон STUDENT_PASSWORD environment variables тохируулаагүй байна. .env файлыг шалгана уу.');
      }
      
      console.log(`Оюутны код: ${process.env.STUDENT_CODE}`);
      console.log(`Нууц үг: ${'*'.repeat(process.env.STUDENT_PASSWORD.length)}`);
      
      await this.initializeDriver();
      await this.navigateToWebsite('https://student.must.edu.mn');
      await this.attemptLogin(process.env.STUDENT_CODE, process.env.STUDENT_PASSWORD);
      await this.sleep(500);

      const currentUrl = await this.getCurrentUrl();
      if (!currentUrl.includes('Login')) {
        try {
          const studentElement = await this.findStudentDropdownElement();
          const studentText = await studentElement.getText();
          console.log(` Оюутан элементийг оллоо: ${studentText}`);

          const paymentData = await this.goToPaymentPage();
          console.log('\n Төлбөрийн мэдээлэл:');
          console.log(`   Төлөх төлбөр: ${paymentData.feesToPayAmount}`);
          console.log(`   Дутуу төлбөр: ${paymentData.underpaymentAmount}`);

          // Алхам 3: Assertions буюу үр дүнг шалгах (logout-аас өмнө)
          console.log('\n Assertions буюу үр дүнг шалгаж байна...');
          
          // Нэвтрэлт шалгах
          const loginSuccess = await this.assertLoginSuccess();
          
          // Оюутны dropdown шалгах
          const studentDropdownFound = await this.assertStudentDropdownFound();
          
          // Төлбөрийн хуудас шалгах
          const paymentPageReached = await this.assertPaymentPageReached();
          
          // Төлбөрийн мэдээлэл шалгах
          const paymentDataValid = await this.assertPaymentDataValid();
          
          // Үр дүнгийн тооллого
          const passedCount = [loginSuccess, studentDropdownFound, paymentPageReached, paymentDataValid].filter(result => result === true).length;
          const totalCount = 4;
          
          console.log(`\n Assertion үр дүн: ${passedCount}/${totalCount} амжилттай`);
          
          if (passedCount === totalCount) {
            console.log(' Бүх assertion-ууд амжилттай!');
          } else {
            console.log('️ Зарим assertion-ууд амжилтгүй боллоо');
          }

          // Logout after getting payment data and running assertions
          try {
            await this.attemptLogout();
            // Гарах шалгах
            const logoutSuccess = await this.assertLogoutSuccess();
            console.log(`\n Logout assertion: ${logoutSuccess ? ' Амжилттай' : ' Амжилтгүй'}`);
          } catch (error) {
            console.log('️ Гарах оролдлого амжилтгүй, үргэлжлүүлж байна...');
          }
        } catch (error) {
          console.log('️ Төлбөрийн мэдээлэл авч чадсангүй, үргэлжлүүлж байна...');
        }
      } else {
        console.log('️ Одоохондоо нэвтрэх хуудсанд байна, төлбөрийн мэдээлэл авахгүй');
      }

      console.log('\n Автоматжуулалт амжилттай дууслаа!');
    } catch (error) {
      console.error('\n Автоматжуулалт амжилтгүй боллоо:', error.message);
        } finally {
            await this.closeBrowser();
        }
    }
}

// Скрипт бие даан ажиллах үед автоматаар эхлүүлэх
if (require.main === module) {
  const automation = new StudentPortalAutomation();
  automation.runAutomation().catch(console.error);
}

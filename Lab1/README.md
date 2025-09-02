# Лаборатор 1

## Товч танилцуулга
Энэхүү скрипт нь **MUST оюутны портал** (https://student.must.edu.mn) дээр автоматжуулсан тест гүйцэтгэх зориулалттай. Selenium WebDriver ашиглан веб хөтчийг удирдаж, нэвтрэх, login modal-ийг хаах, dropdown цэснээс оюутан болон төлбөрийн мэдээллийг авах, logout хийх зэрэг үйлдлийг автоматжуулдаг.

## Зорилго
- Веб хөтчид автомат тест гүйцэтгэх.  
- Login болон logout үйлдлийг турших.  
- Оюутны мэдээлэл болон төлбөрийн дүнг авах.  
- Веб элементүүдийг динамикаар хайж, modal, dropdown-ыг удирдах.  
- Скриншот авах замаар тестийн үр дүнг баримтжуулах.

## Шаардлага
- Node.js (v18+)
- npm эсвэл yarn
- Chrome вэб хөтөч
- ChromeDriver (Selenium WebDriver-тэй нийцсэн)

## Суурилуулалт
```bash
npm install selenium-webdriver chromedriver dotenv
```

## Тохиргоо

1. `.env` файл үүсгэх:
```bash
STUDENT_CODE=B2222*****
STUDENT_PASSWORD=********
```

## Скрипт ашиглах

Терминал дээр ажиллуулах:

```bash
node test1.js
```

## Функционал

- **Нэвтрэлт:** Environment variables-аас оюутны код болон нууц үгийг уншиж автомат нэвтрэх
- **Modal хаах:** Login дараа гарч ирэх modal-ийг автоматаар хаах
- **Dropdown навигаци:** Оюутан → Төлбөрийн мэдээлэл цэснээр шилжих
- **Мэдээлэл авах:** Төлөх төлбөр болон дутуу төлбөрийн дүнг авах
- **Assertion шалгах:** Бүх үйлдлийн үр дүнг шалгах
- **Logout:** Амжилттай гарах
- **Скриншот:** Тестийн үр дүнг баримтжуулах

## Файлын бүтэц

```
Lab1/
├── test1.js          # Үндсэн автоматжуулалт скрипт
├── .env              # Environment variables (credentials)
├── .gitignore        # Git ignore файл
├── package.json      # NPM dependencies
└── README.md         # Энэ файл
```

## Аюулгүй байдал

- `.env` файл нь `.gitignore`-д багтсан тул version control-д орохгүй
- Credentials нь environment variables-аас уншигдана
- Password нь console дээр mask хийгддэг (asterisks)

## Алдаа засах

Хэрэв алдаа гарвал:

1. Chrome хөтөч суурилуулсан эсэхийг шалгах
2. ChromeDriver version-ийг шалгах
3. `.env` файл зөв тохируулагдсан эсэхийг шалгах
4. Network холболтыг шалгах

## Технологи

- **Selenium WebDriver:** Веб хөтчийг автоматжуулах
- **Node.js:** JavaScript runtime
- **ChromeDriver:** Chrome хөтчийн driver
- **dotenv:** Environment variables унших
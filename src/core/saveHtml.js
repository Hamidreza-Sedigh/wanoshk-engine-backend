// core/saveHtml.js
const fs = require('fs');
const path = require('path');
/**
 * ذخیره محتوای HTML به عنوان فایل
 * @param {string} htmlContent - محتوای html استخراج‌شده
 * @param {string} titleOrLink - برای تولید نام فایل
 * @returns {string|null} - مسیر فایل ذخیره‌شده یا null در صورت خطا
 */
function saveHtmlToFile(htmlContent, titleOrLink) {
  try {
    const folderPath = path.join(__dirname, '../storage/htmls');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const safeName = titleOrLink.replace(/[\/\\:*?"<>|]/g, '_').slice(0, 100);
    const fileName = `${safeName}-${Date.now()}.html`;
    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`📄 HTML file saved: ${fileName}`);

    return filePath;
  } catch (error) {
    console.error('❌ Error saving HTML file:', error.message);
    return null;
  }
}

module.exports = saveHtmlToFile;

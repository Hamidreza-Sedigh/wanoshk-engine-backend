// core/fetchContent.js

const got = require('got');
const cheerio = require('cheerio');

/**
 * دریافت محتوای HTML و متن خبر از یک لینک مشخص با استفاده از cheerio
 * @param {string} url - آدرس لینک خبر
 * @param {string} tagClassName - selector اصلی مثل div.body
 * @param {string[]} removeTags - لیستی از selectorهایی که باید حذف شوند
 * @param {string} cutAfter - selector برای جایی که از آن به بعد حذف شود 
 * @returns {Promise<{ contentHtml: string, contentText: string }|null>}
 */
async function fetchArticleContent(url, tagClassName, removeTags = [], cutAfter = null) {
  try {
    // temp Url for test:
    url = 'https://www.asriran.com/fa/news/1074946/'
    tagClassName = '.body'
    //MV_afterBody

    
    const response = await got(url);
    const $ = cheerio.load(response.body, { decodeEntities: false });

    let contentHtml = '';
    let contentText = '';

    if (tagClassName) {
      const target = $(tagClassName);
    
      // 🔥 تگ‌هایی که می‌خوای حذف بشن
      //test part:
      target.find('#MV_afterBody').nextAll().remove();
      target.find('#MV_afterBody').remove();
      // target.find('script').remove(); // حذف تگ‌های script
      // target.find('style').remove();  // حذف تگ‌های style
      // target.find('div.share-buttons').remove(); // حذف با کلاس خاص
      
      
      
      // ✅ حذف تگ‌ها یا کلاس‌های مزاحم
      if (Array.isArray(removeTags)) {
        for (const tag of removeTags) {
          target.find(tag).remove();
        }
      }

      // ✅ حذف همه عناصر بعد از یک نقطه مشخص (مثل .social_nets)
      if (cutAfter) {
        const cutPoint = target.find(cutAfter);
        if (cutPoint.length > 0) {
          cutPoint.nextAll().remove();  // حذف همه بعد از آن
          cutPoint.remove();            // حذف خودش
        }
      }

      contentHtml = target.html() || '';
      contentText = target.text() || '';
    } else {
      contentHtml = $('body').html() || '';
      contentText = $('body').text() || '';
    }

    console.log('main content================');

    return {
      contentHtml: contentHtml.trim(),
      contentText: contentText.trim(),
    };
  } catch (error) {
    console.error(`❌ Error fetching article ${url}:`, error.message);
    return null;
  }
}

module.exports = fetchArticleContent;

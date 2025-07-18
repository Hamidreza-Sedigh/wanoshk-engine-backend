// core/fetchContent.js

const got = require('got');
const cheerio = require('cheerio');
const { fixHtmlResourceUrls } = require('../utils/rss');

/**
 * دریافت محتوای HTML و متن خبر از یک لینک مشخص با استفاده از cheerio
 * @param {string} url - آدرس لینک خبر
 * @param {string} tagClassName - selector اصلی مثل div.body
 * @param {string[]} removeTags - لیستی از selectorهایی که باید حذف شوند
 * @param {string} cutAfter - selector برای جایی که از آن به بعد حذف شود 
 * @returns {Promise<{ contentHtml: string, contentText: string }|null>}
 */
 async function fetchArticleContent(url, source) {
  // const { tagClassName, removeTags = [], cutAfter = null, siteAddress } = source;
  let { tagClassName, removeTags = [], cutAfter = null, siteAddress } = source;
  console.log("test before try");

  try {
    
    // temp Url for test:
    // url = 'https://www.isna.ir/news/1404042616251/'
    // url = 'https://www.asriran.com/fa/news/1077602/'
    // tagClassName = '.body'
    // tagClassName = ''

    console.log("test before url");
    //<div itemprop="articleBody" class="item-text">
    const response = await got(url);
    // console.log("response:",response);
    const $ = cheerio.load(response.body, { decodeEntities: false });

    // console.log("$:",$);

    let contentHtml = '';
    let contentText = '';

    if (tagClassName) {
      const target = $(tagClassName);
      
      // 🔥 تگ‌هایی که می‌خوای حذف بشن
      //test part:
      target.find('#MV_afterBody').nextAll().remove();
      target.find('#MV_afterBody').remove();

      target.find('script').remove(); // حذف تگ‌های script 
      target.find('style').remove();  // حذف تگ‌های style
      
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


      // ✅ اصلاح آدرس‌های لوکال در منابع تصویری/ویدیویی
      let rawHtml = target.html() || '';
      const needsFix =
        source.isLocalImg ||
        rawHtml.includes('data-src') ||
        rawHtml.includes('data-original') ||
        rawHtml.includes('data-lazy-src') ||
        rawHtml.includes('data-lazyload') ||
        rawHtml.includes('lazy-src');

      contentHtml = needsFix
        ? fixHtmlResourceUrls(rawHtml, siteAddress)
        : rawHtml;

      contentText = target.text() || '';

    } else {
      contentHtml = $('body').html() || '';
      contentText = $('body').text() || '';
      console.log('No taggggggg:', contentHtml);
    }


    
      
    console.log('main content================');

    return {
      contentHtml: contentHtml.trim(),
      contentText: contentText.trim(),
    };
  } catch (error) {
    console.error(`❌ Error fetching article ${url}:`, error.message);
    console.error(error);
    return null;
  }
}

module.exports = fetchArticleContent;

// core/fetchContent.js

const got = require('got');
const cheerio = require('cheerio');
const { fixHtmlResourceUrls } = require('../utils/rss');
const { toAbsoluteUrl } = require('../utils/rss');


/**
 * دریافت محتوای HTML و متن خبر از یک لینک مشخص با استفاده از cheerio
 * @param {string} url - آدرس لینک خبر
 * @param {string} tagClassName - selector اصلی مثل div.body
 * @param {string[]} removeTags - لیستی از selectorهایی که باید حذف شوند
 * @param {string} cutAfter - selector برای جایی که از آن به بعد حذف شود 
 * @returns {Promise<{ contentHtml: string, contentText: string }|null>}
 */
 async function fetchArticleContent(url, source, enclosureUrl = null) {
  // const { tagClassName, removeTags = [], cutAfter = null, siteAddress } = source;
  let { tagClassName, removeTags = [], cutAfter = null, siteAddress, secondTag, removeAttrs } = source;
  // console.log("test before try");

  try {
    // console.log("test start fetch");
    //<div itemprop="articleBody" class="item-text">
    const response = await got(url);
    // console.log("response:",response);
    const $ = cheerio.load(response.body, { decodeEntities: false });

    // console.log("$:",$);

    let contentHtml = '';
    let contentText = '';
    let imageUrl = null;

    if (tagClassName) {
      const target = $(tagClassName);
      

      // ✅ حذف همه عناصر بعد از یک نقطه مشخص (مثل .social_nets)
      if (cutAfter) {
        const cutPoint = target.find(cutAfter);
        if (cutPoint.length > 0) {
          cutPoint.nextAll().remove();  // حذف همه بعد از آن
          cutPoint.remove();            // حذف خودش
        }
      }

      // 🔥 تگ‌هایی که می‌خوای حذف بشن
      //test part:
      // target.find('#MV_afterBody').nextAll().remove();
      // target.find('#MV_afterBody').remove();
      target.find('script').remove(); // حذف تگ‌های script 
      target.find('style').remove();  // حذف تگ‌های style
      
      console.log("removeTags:",removeTags);
      if (Array.isArray(removeTags)) {
        for (const tag of removeTags) {
          target.find(tag).remove();
        }
      }

      // حذف attr اضافه . مثلا سایت انتخاب
      console.log("removeAttrs:",removeAttrs);
      if (Array.isArray(removeAttrs)) {
        for (const item of removeAttrs) {
          target.find(item.selector).removeAttr(item.attr);
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


      // let imageUrl = null;
      if (!enclosureUrl) {
        let imgSrc = null;
        if (source.secondTag) {
          const secondImage = $(source.secondTag).first();  // ⬅️ مستقیم از کل صفحه
          imgSrc = secondImage.attr('src');

          if (imgSrc) {
            console.log(`📷 تصویر از secondTag گرفته شد: ${imgSrc}`);
          } else {
            console.log(`⚠️ تگی با selector ${source.secondTag} یافت نشد یا img آن src نداشت.`);
          }
        }
        
        // اگر با secondTag هم پیدا نشد، از اولین تصویر استفاده کن
        if (!imgSrc) {
          const firstImg = target.find('img').first();
          imgSrc = firstImg.attr('src');

          if (imgSrc) {
            console.log(`📷 تصویر از اولین <img> داخل target گرفته شد: ${imgSrc}`);
          } else {
            console.log(`⚠️ هیچ تصویری در محتوای HTML یافت نشد.`, url);
          }
        }

        if (imgSrc) {
          imageUrl = toAbsoluteUrl(imgSrc, siteAddress);
          console.log(`🔗 آدرس نهایی تصویر: ${imageUrl}`);
        }

      } else {
        imageUrl = toAbsoluteUrl(enclosureUrl, siteAddress);
        console.log(`🟢 تصویر از enclosure گرفته شد: ${imageUrl}`);
      }
      
      // console.log(url);
      // console.log(imageUrl);
      // console.log(imageUrl);
      // if (!imageUrl) {
      //   console.log("imageUrl vojoud nadasht =>", secondTag);
      //   const target2 = $(secondTag);
      //   console.log("now: ", target2);
      //   let rawimageUrl = target2.src() || '';
      //   console.log("now: ", rawimageUrl);
        
      //   imgTargetUrl = toAbsoluteUrl(rawimageUrl, siteAddress);
      //   console.log("now: ", imgTargetUrl);
      // }

    } else {
      contentHtml = $('body').html() || '';
      contentText = $('body').text() || '';
      imageUrl
      console.log('No taggggggg:', contentHtml);
    }


    
      
    // console.log('main content===========================');

    return {
      contentHtml: contentHtml.trim(),
      contentText: contentText.trim(),
      imageUrl
    };
  } catch (error) {
    console.error(`❌ Error fetching article ${url}:`, error.message);
    console.error(error);
    return null;
  }
}

module.exports = fetchArticleContent;

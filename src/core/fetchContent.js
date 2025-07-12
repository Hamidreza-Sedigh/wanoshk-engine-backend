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
async function fetchArticleContent(url, tagClassName, removeTags = [], cutAfter = null, siteAddress) {
  try {
    // temp Url for test:
    url = 'https://www.rokna.net/%D8%A8%D8%AE%D8%B4-%D8%A7%D8%AE%D8%A8%D8%A7%D8%B1-%D8%B3%DB%8C%D8%A7%D8%B3%DB%8C-74/1138365-%D8%B4%D8%B1%D8%B7-%D9%87%D8%A7%DB%8C-%D8%A7%D8%B5%D9%84%DB%8C-%D9%85%D8%B0%D8%A7%DA%A9%D8%B1%D9%87-%D8%A8%D8%A7-%D8%A2%D9%85%D8%B1%DB%8C%DA%A9%D8%A7-%D8%A8%D9%87-%D8%B1%D9%88%D8%A7%DB%8C%D8%AA-%D9%85%D8%A7%D9%84%DA%A9-%D8%B4%D8%B1%DB%8C%D8%B9%D8%AA%DB%8C'
    tagClassName = '.article-body'

    //<div itemprop="articleBody" class="item-text">
    const response = await got(url);
    const $ = cheerio.load(response.body, { decodeEntities: false });

    let contentHtml = '';
    let contentText = '';
    
    // $('img').each(function () {
    //   const dataSrc = $(this).attr('data-src');
    //   if (dataSrc) {
    //     $(this).attr('src', dataSrc);
    //   }
    // });

    if (tagClassName) {
      const target = $(tagClassName);
      
      console.log('####TEST:', target)
      // 🔥 تگ‌هایی که می‌خوای حذف بشن
      //test part:
      target.find('.news-bottom-link').nextAll().remove();
      target.find('.news-bottom-link').remove();
      target.find('.inline-news-box').remove();
      target.find('.margin-bottom-16').remove();
      

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
      // if (cutAfter) {
      //   const cutPoint = target.find(cutAfter);
      //   if (cutPoint.length > 0) {
      //     cutPoint.nextAll().remove();  // حذف همه بعد از آن
      //     cutPoint.remove();            // حذف خودش
      //   }
      // }

      contentHtml = target.html() || '';
      contentText = target.text() || '';

      console.log("test before test local.");


      // if(sourceObj.isLocalImg){
      // if( 2 > 1 ){
      //   if(contentHtml.includes('src="/')){
      //     console.log("+++++++++++++++++++++++if 2 of local is working.");
      //     console.log("+++con:",contentHtml);
      //     var res = contentHtml.split('src="');
      //     console.log("+++res:",res);
      //     var result = res[0];
      //     console.log("isLoc Result:", result);
      //     if(res.length > 1){
      //         for(var k =0; k < res.length-1 ; k++){
      //             var result = result + 'src="' + siteAddress + res[k+1] ;
      //         }
      //         contentHtml = result;
      //     }
      //   }
      // }
      // console.log("+++after:", contentHtml)


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
    return null;
  }
}

module.exports = fetchArticleContent;

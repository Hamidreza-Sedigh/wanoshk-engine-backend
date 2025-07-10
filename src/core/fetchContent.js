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
    url = 'https://fararu.com/fa/news/882774/'
    tagClassName = '#echo_detail'

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
      // target.find('#MV_afterBody').nextAll().remove();
      target.find('span.close_adv').remove();


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

      // let teststr = "aaaaaaaaaaaa src bbbbbbbb";
      // let sub = teststr.split('src');
      // console.log(teststr);
      // console.log(sub);



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

const RSSParser = require('rss-parser');
const got = require('got');
const cheerio = require('cheerio');
const Source = require('../models/Source');
const News = require('../models/News');
const saveHtmlToFile = require('./saveHtml');
const saveNewsItem = require('./saveNews');
const { saveNewsBulk } = require('./saveNews');
const fetchArticleContent = require('./fetchContent');
const { toAbsoluteUrl } = require('../utils/rss');

const parser = new RSSParser({
  customFields: {
    item: ['description'] // اجباراً description را از RSS می‌گیرد
  }
});

async function start() {
  console.log('🚀 Engine started.');

  try {
    const sources = await Source.find({ enable: true });
    console.log(`🔍 Found ${sources.length} enabled sources.`);

    for (const source of sources) {
      await processSource(source);
    }

    console.log('🏁 Engine finished all sources. ');
  } catch (error) {
    console.error('❌ Engine error:', error.message);
  }
}

// تابع اصلی که RSS و لینک‌ها رو می‌گیرد و پردازش می‌کند
async function processSource(source) {
  console.log(`\n📡 Processing source: ${source.sourceName}`);

  const items = await fetchRSSFeed(source.rssURL);
  if (!items.length) {
    console.log(`⚠️ No items found in RSS: ${source.rssURL}`);
    return;
  }

  // مرحله 1: یک‌بار همه لینک‌ها را از DB بررسی کن
  const links = items.map(item => item.link);
  const existingLinks = await News.find(
    { link: { $in: links } },
    { link: 1, _id: 0 }
  ).lean();
  const existingSet = new Set(existingLinks.map(n => n.link));

  const newItems = [];
  for (const item of items) {
    // ✅ اول بررسی تکراری بودن لینک در دیتابیس
    // const exists = await News.findOne({ link: item.link });
    // // if (exists) {
    // //   console.log(`⏹️ Duplicate found (${item.link}), stopping loop.`);
    // //   break; // بقیه آیتم‌ها هم قدیمی هستند، پس حلقه را متوقف کن
    // // }

    if (existingSet.has(item.link)) {
      console.log(`⏹️ Duplicate found (${item.link}), stopping loop.`);
      break;
    }
    newItems.push(item);
  }
  if (!newItems.length) {
    console.log('ℹ️ No new items to process.');
    return;
  }
  // مرحله 3: دانلود محتوا برای آیتم‌های جدید
  const newsArray = [];
  for (const item of newItems) {
    const enclosureUrl = item.enclosure?.url || null;
    let imageUrl = "";
    if (enclosureUrl)
      imageUrl = toAbsoluteUrl(enclosureUrl, source.siteAddress);


    const result = await fetchArticleContent(item.link, source, item.enclosure?.url);
    if (!result || !result.contentText) {
      console.log(`⚠️ No content found for: ${item.link}`);
      continue; //temp commented dorostesh mishe continue movaghatan break.
      // break;
    }

    // const htmlFilePath = saveHtmlToFile(result.contentHtml, item.title || item.link);
        
    
    
    // console.log("item:", item);
    // const newsData = {
    newsArray.push({
      sourceName: source.sourceName,
      siteAddress: source.siteAddress,
      title: item.title || '',
      description: item.description || item.contentSnippet || '',  // توضیح یا خلاصه
      link: item.link,
      // passage: result.contentText,
      passage: result.contentHtml,
      date: item.pubDate ? new Date(item.pubDate) : null,
      fetchDate: new Date(),
      category: source.isCategorized ? source.category : '',
      categoryEn: source.isCategorized ? source.categoryEn : '',
      subCategory: source.isSubCategorized ? source.subCategory : '',
      subCategoryEn: source.isSubCategorized ? source.subCategoryEn : '',
      views: 0,
      imageUrl: result.imageUrl || "", // از داخل HTML یا enclosure
    });

    // await saveNewsItem(newsData);
    // break; // temp test!!!!!!!!!!!!!!!!!!!!!!!!!   <---  << << << <<========
  }
  await saveNewsBulk(newsArray);


  // به‌روزرسانی تاریخ آخرین بارگذاری منبع
  try {
    source.lastTimeFetch = new Date();
    await source.save();
    console.log(`🕒 Updated lastTimeFetch for source: ${source.sourceName}`);
  } catch (error) {
    console.error(`❌ Error updating lastTimeFetch for source ${source.sourceName}:`, error.message);
  }
}

async function fetchRSSFeed(rssURL) {
  try {
    const feed = await parser.parseURL(rssURL);
    return feed.items;
  } catch (error) {
    console.error(`❌ Error fetching RSS feed ${rssURL}:`, error.message);
    return [];
  }
}


module.exports = {
  start,
};

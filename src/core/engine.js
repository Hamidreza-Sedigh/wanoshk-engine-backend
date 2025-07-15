const RSSParser = require('rss-parser');
const got = require('got');
const cheerio = require('cheerio');
const Source = require('../models/Source');
const News = require('../models/News');
const saveHtmlToFile = require('./saveHtml');
const saveNewsItem = require('./saveNews');
const fetchArticleContent = require('./fetchContent');

const parser = new RSSParser();

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

  for (const item of items) {
    const result = await fetchArticleContent( item.link,source );
    
    if (!result || !result.contentText) {
      console.log(`⚠️ No content found for: ${item.link}`);
      //continue; //temp commented
      break;
    }

    const htmlFilePath = saveHtmlToFile(result.contentHtml, item.title || item.link);
    
    const imageUrl = item.enclosure?.url || null;
    // call faunction check URL

    const newsData = {
      sourceName: source.sourceName,
      siteAddress: source.siteAddress,
      title: item.title || '',
      description: item.description || '',
      summary: item.contentSnippet || '',
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
      imageUrl: imageUrl
    };


    await saveNewsItem(newsData);

    break; // temp test!!!!!!!!!!!!!!!!!!!!!!!!!   <---  << << << <<========
  }

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

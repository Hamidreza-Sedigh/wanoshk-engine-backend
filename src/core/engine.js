const RSSParser = require('rss-parser');
const got = require('got');
const cheerio = require('cheerio');
const Source = require('../models/Source');
const News = require('../models/News');
const saveHtmlToFile = require('./saveHtml');
const saveNewsItem = require('./saveNews');

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
    const result = await fetchArticleContent(item.link, source.tagClassName, source.secondTag);
    if (!result || !result.contentText) {
      console.log(`⚠️ No content found for: ${item.link}`);
      continue;
    }

    const htmlFilePath = saveHtmlToFile(result.contentHtml, item.title || item.link);
    

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
      views: 0
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

async function fetchArticleContent(url, tagClassName, secondTag) {
  try {
    // temp Url for test:
    url = 'https://www.tabnak.ir/fa/news/1315412/%DA%A9%D8%A7%D9%BE%DB%8C%D8%AA%D8%A7%D9%86-%D8%AD%D8%B3%DB%8C%D9%86%DB%8C-%D8%AF%D9%88-%D9%81%D8%B5%D9%84-%D8%AF%DB%8C%DA%AF%D8%B1-%D8%AF%D8%B1-%D8%A7%D8%B3%D8%AA%D9%82%D9%84%D8%A7%D9%84-%D9%85%DB%8C%E2%80%8C%D9%85%D8%A7%D9%86%D8%AF'
    tagClassName = 'div .body'
    const response = await got(url);
    const $ = cheerio.load(response.body, { decodeEntities: false });

    let contentHtml = '';
    let contentText = '';

    if (tagClassName) {
      if (secondTag) {
        contentHtml = $(`${tagClassName} ${secondTag}`).html() || '';
        contentText = $(`${tagClassName} ${secondTag}`).text() || '';
      } else {
        contentHtml = $(tagClassName).html() || '';
        contentText = $(tagClassName).text() || '';
      }
    } else {
      contentHtml = $('body').html() || '';
      contentText = $('body').text() || '';
    }

    console.log('main content================');
    // console.log(contentHtml);

    return { contentHtml: contentHtml.trim(), contentText: contentText.trim() };
  } catch (error) {
    console.error(`❌ Error fetching article ${url}:`, error.message);
    return null;
  }
}


module.exports = {
  start,
};

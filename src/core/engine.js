const RSSParser = require('rss-parser');
const got = require('got');
const cheerio = require('cheerio');
const Source = require('../models/Source');
const News = require('../models/News');

const parser = new RSSParser();

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
    const response = await got(url);
    const $ = cheerio.load(response.body, { decodeEntities: false });

    let content = '';

    if (tagClassName) {
      // اگر secondTag مشخص شده باشه، مثلا div.body > p
      if (secondTag) {
        content = $(`${tagClassName} ${secondTag}`).text().trim();
      } else {
        content = $(tagClassName).text().trim();
      }
    } else {
      // اگر tagClassName نداشتیم کل body
      content = $('body').text().trim();
    }

    return content;
  } catch (error) {
    console.error(`❌ Error fetching article ${url}:`, error.message);
    return null;
  }
}

async function saveNewsItem(newsData) {
  try {
    // بررسی وجود لینک مشابه برای جلوگیری از تکرار
    const exists = await News.findOne({ link: newsData.link });
    if (exists) {
      console.log(`⚠️ News already exists: ${newsData.link}`);
      return null;
    }

    const news = new News(newsData);
    await news.save();
    console.log(`✅ News saved: ${news.title}`);
    return news;
  } catch (error) {
    console.error(`❌ Error saving news ${newsData.link}:`, error.message);
    return null;
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
    const content = await fetchArticleContent(item.link, source.tagClassName, source.secondTag);
    if (!content) {
      console.log(`⚠️ No content found for: ${item.link}`);
      continue;
    }

    const newsData = {
      sourceName: source.sourceName,
      siteAddress: source.siteAddress,
      title: item.title || '',
      description: item.contentSnippet || '',
      link: item.link,
      passage: content,
      date: item.pubDate ? new Date(item.pubDate) : null,
      fetchDate: new Date(),
      category: source.isCategorized ? source.category : '',
      categoryEn: source.isCategorized ? source.categoryEn : '',
      subCategory: source.isSubCategorized ? source.subCategory : '',
      subCategoryEn: source.isSubCategorized ? source.subCategoryEn : '',
      views: 0,
    };

    await saveNewsItem(newsData);
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

async function start() {
  console.log('🚀 Engine started.');

  try {
    const sources = await Source.find({ enable: true });
    console.log(`🔍 Found ${sources.length} enabled sources.`);

    for (const source of sources) {
      await processSource(source);
    }

    console.log('🏁 Engine finished all sources.');
  } catch (error) {
    console.error('❌ Engine error:', error.message);
  }
}

module.exports = {
  start,
};

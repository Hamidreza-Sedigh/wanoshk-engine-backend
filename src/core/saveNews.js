const News = require('../models/News');

/**
 * ذخیره یک خبر در دیتابیس MongoDB
 * @param {Object} newsData - داده‌های کامل خبر برای ذخیره‌سازی
 * @param {string} newsData.sourceName
 * @param {string} newsData.siteAddress
 * @param {string} newsData.title
 * @param {string} newsData.description
 * @param {string} [newsData.summary]
 * @param {string} newsData.link
 * @param {string} newsData.passage
 * @param {Date} newsData.date
 * @param {Date} newsData.fetchDate
 * @param {string} newsData.category
 * @param {string} newsData.categoryEn
 * @param {string} newsData.subCategory
 * @param {string} newsData.subCategoryEn
 * @param {number} newsData.views
 * @returns {Promise<News|null>} - سند ذخیره‌شده یا null در صورت وجود یا خطا
 */
async function saveNewsItem(newsData) {
  try {
    const exists = await News.findOne({ link: newsData.link });
    if (exists) {
      console.log(`⚠️ News already exists: ${newsData.link}`);
      return null;
    }

    const news = new News(newsData);
    await news.save();
    console.log(`✅ News saved: ${news.title}`);
    console.log(news._id);
    return news;
  } catch (error) {
    console.error(`❌ Error saving news ${newsData.link}:`, error.message);
    return null;
  }
}

module.exports = saveNewsItem;

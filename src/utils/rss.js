// utils/rss.js
const cheerio = require('cheerio');

function toAbsoluteUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function isImageType(mimeType) {
  return mimeType?.startsWith('image/');
}

function fixHtmlResourceUrls(html, baseUrl) {
  const $ = cheerio.load(html);

  const tagsWithSrc = ['img', 'video', 'audio', 'source', 'iframe'];

  tagsWithSrc.forEach(tag => {
    $(tag).each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('http')) {
        const fixedUrl = toAbsoluteUrl(src, baseUrl);
        $(el).attr('src', fixedUrl);
      }
    });
  });

  return $.html();
}

module.exports = {
  toAbsoluteUrl,
  isImageType,
  fixHtmlResourceUrls,
};

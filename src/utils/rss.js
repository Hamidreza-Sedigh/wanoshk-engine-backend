const cheerio = require('cheerio');

/**
 * بررسی اینکه MIME نوع تصویر است یا نه
 */
function isImageType(mimeType) {
  return mimeType?.startsWith('image/');
}

/**
 * بررسی اینکه آدرس فعلی یک placeholder است یا نه
 */
function isPlaceholderUrl(url) {
  if (!url) return true;
  return /blank|pixel|placeholder|defaultpic|defultpic/i.test(url);
}

/**
 * تبدیل آدرس نسبی به absolute
 */
function toAbsoluteUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

/**
 * اصلاح src تصاویر از data-* اگر src خالی یا placeholder باشد
 */
function fixImageSrcFromDataAttrs($img) {
  const fallbackAttrs = [
    'data-src',
    'data-original',
    'data-lazy-src',
    'data-lazyload',
    'data-img',
    'lazy-src'
  ];

  const currentSrc = $img.attr('src') || '';
  const shouldReplace = !currentSrc || isPlaceholderUrl(currentSrc);

  if (shouldReplace) {
    for (const attr of fallbackAttrs) {
      const value = $img.attr(attr);
      if (value) {
        $img.attr('src', value);
        break;
      }
    }
  }
}

/**
 * اصلاح آدرس‌های لوکال در منابع تصویری/ویدیویی و جایگزینی lazyload
 */
function fixHtmlResourceUrls(html, baseUrl) {
  const $ = cheerio.load(html);
  const tagsWithSrc = ['img', 'video', 'audio', 'source', 'iframe'];

  tagsWithSrc.forEach(tag => {
    $(tag).each((i, el) => {
      const $el = $(el);

      // برای img: اصلاح src از data-*
      if (tag === 'img') {
        fixImageSrcFromDataAttrs($el);
      }

      // تبدیل آدرس نسبی به absolute
      const src = $el.attr('src');
      if (src && !/^https?:\/\//i.test(src)) {
        const fixedUrl = toAbsoluteUrl(src, baseUrl);
        $el.attr('src', fixedUrl);
      }
    });
  });

  return $.html();
}

module.exports = {
  isImageType,
  isPlaceholderUrl,
  toAbsoluteUrl,
  fixImageSrcFromDataAttrs,
  fixHtmlResourceUrls
};

const cheerio = require('cheerio');

// ✅ تبدیل آدرس نسبی به absolute
function toAbsoluteUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

// ✅ بررسی اینکه MIME نوع تصویر است
function isImageType(mimeType) {
  return mimeType?.startsWith('image/');
}

// ✅ بررسی اینکه یک آدرس placeholder است یا نه
function isPlaceholderUrl(url) {
  if (!url) return true;
  return /blank|pixel|placeholder/i.test(url);
}

// ✅ جایگزینی src در تگ img از روی data-* اگر لازم بود
function fixImageSrcFromDataAttrs($img) {
  const fallbackAttrs = [
    'data-src',
    'data-original',
    'data-lazy-src',
    'data-lazyload',
    'data-img',
    'lazy-src',
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

// ✅ اصلاح آدرس‌های منابع تصویری/ویدیویی نسبی به absolute
function fixHtmlResourceUrls(html, baseUrl) {
  const $ = cheerio.load(html);
  const tagsWithSrc = ['img', 'video', 'audio', 'source', 'iframe'];

  tagsWithSrc.forEach(tag => {
    $(tag).each((i, el) => {
      const $el = $(el);

      // فقط برای img: اول src رو از data-* اصلاح کن
      if (tag === 'img') {
        fixImageSrcFromDataAttrs($el);
      }

      // سپس آدرس نسبی رو به absolute تبدیل کن
      const src = $el.attr('src');
      if (src && !src.startsWith('http')) {
        const fixedUrl = toAbsoluteUrl(src, baseUrl);
        $el.attr('src', fixedUrl);
      }
    });
  });

  return $.html();
}

module.exports = {
  toAbsoluteUrl,
  isImageType,
  fixHtmlResourceUrls,
  fixImageSrcFromDataAttrs,
};

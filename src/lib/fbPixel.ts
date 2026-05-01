// Facebook Pixel singleton loader
let loaded = false;

export function loadFacebookPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (loaded || w.fbq) {
    if (w.fbq) w.fbq("track", "PageView");
    return;
  }
  loaded = true;
  /* eslint-disable */
  (function (f: any, b: any, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments as any)
        : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t: any = b.createElement(e);
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  w.fbq("init", pixelId);
  w.fbq("track", "PageView");
}

export const FB_PIXEL_ID = "4288378188072317";

if (!self.define) {
  let e,
    a = {};
  const f = (f, i) => (
    (f = new URL(f + ".js", i).href),
    a[f] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = f), (e.onload = a), document.head.appendChild(e);
        } else (e = f), importScripts(f), a();
      }).then(() => {
        let e = a[f];
        if (!e) throw new Error(`Module ${f} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, c) => {
    const d =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[d]) return;
    let s = {};
    const t = (e) => f(e, d),
      b = { module: { uri: d }, exports: s, require: t };
    a[d] = Promise.all(i.map((e) => b[e] || t(e))).then((e) => (c(...e), s));
  };
}
define(["./workbox-860c9203"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "0ede0c163fd78ed1383792d94b942798",
        },
        {
          url: "/_next/static/7GutAjH5uAVBr7O6YzyZi/_buildManifest.js",
          revision: "00876eb107c3f09b2dc2674ddd757f3c",
        },
        {
          url: "/_next/static/7GutAjH5uAVBr7O6YzyZi/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/0f2ffdcc-5a1d511a5d3a9d5f.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/134-bfda518a484ba14c.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/159-3349c2982c9d9720.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/199-d82d0f529f8b5593.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/239-1ece2becdd31b536.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/243-8027f9f140c82819.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/387-4d5a5c0198ded46c.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/6-5fe91f1203c9dd16.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/774.1804df82795876a9.js",
          revision: "1804df82795876a9",
        },
        {
          url: "/_next/static/chunks/80.50bce3c9f733a71d.js",
          revision: "50bce3c9f733a71d",
        },
        {
          url: "/_next/static/chunks/833-20c08929932dd8df.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/a02d20b1-72d7a537b8816309.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/blocks/manage/page-1e16b8e173ba68c2.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/calendar/page-ef575dab4c90abe3.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/error-0c6f0f3a6e11112a.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/layout-053bca9df800dd58.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/login/page-a5e67fdc3f118488.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/not-found-e725dda564842048.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/page-abaddc893c4ee83e.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/%5Blocale%5D/signup/page-18ac89173afd90af.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-0b529e4b0e2d3c59.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/error-e2237724d2a27e4b.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/global-error-409169385f4f3928.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/layout-6b24a2e40449e0d4.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/not-found-1712578b8e838450.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/page-f61491065259bc8f.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/profile/page-3f74e682a9b6119a.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/app/pwa-guide/page-ab6935220ddcea41.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/c7879cf7-91ba58e58a807378.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/framework-ff829222e17b1b3e.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/main-app-1dad5a575fbe2946.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/main-e30cfad2be3a1ae2.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/pages/_app-dfe6f986f15af6b8.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/pages/_error-0d2ff2b05e8678e6.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-c8d79053af6efe78.js",
          revision: "7GutAjH5uAVBr7O6YzyZi",
        },
        {
          url: "/_next/static/css/58d307ff6c62e3ef.css",
          revision: "58d307ff6c62e3ef",
        },
        {
          url: "/_next/static/css/f3065ce694c2659e.css",
          revision: "f3065ce694c2659e",
        },
        {
          url: "/_next/static/media/001aed59dd3d248e-s.woff2",
          revision: "0f4b5443f69dc31b5a35fe322d3dc454",
        },
        {
          url: "/_next/static/media/00b2a99361b09051-s.woff2",
          revision: "30a879191e4105887ff7e43ed55d0675",
        },
        {
          url: "/_next/static/media/012539cefb72c8ad-s.woff2",
          revision: "cef9aa93da894520e2d5e3802030dcb9",
        },
        {
          url: "/_next/static/media/013588102238a6d4-s.woff2",
          revision: "e8971c4f7b0ab1d178b00db729ecf2d9",
        },
        {
          url: "/_next/static/media/024c304082ccf6d4-s.woff2",
          revision: "4250670b9e4e243fdc0a2d1d335679eb",
        },
        {
          url: "/_next/static/media/02f4f4e9c53158d2-s.woff2",
          revision: "e9d4f393f417ddf97697333d3c1a7016",
        },
        {
          url: "/_next/static/media/0495f60ec1a98d9a-s.woff2",
          revision: "15671b3793bb6d413808b0f209c25262",
        },
        {
          url: "/_next/static/media/052f0dab196612e6-s.woff2",
          revision: "57b3d379a2ee28ce3fe022e4c486a03c",
        },
        {
          url: "/_next/static/media/055304b0d5b640ac-s.woff2",
          revision: "e1c363334c7175f5b6c9949cf8be2686",
        },
        {
          url: "/_next/static/media/06bbf70ed07dda57-s.woff2",
          revision: "35215737a1a1937792b09e3c2503a9d5",
        },
        {
          url: "/_next/static/media/072f77912c621b6e-s.woff2",
          revision: "f4a54552793a9dde1127231cdbab5038",
        },
        {
          url: "/_next/static/media/073c9c02fd02b6d8-s.woff2",
          revision: "fafb6deba136f48d50cac3f63ff6bbcc",
        },
        {
          url: "/_next/static/media/074dbe64b4dbc2d0-s.woff2",
          revision: "362acd10400fa8c296ec24a701e6acf7",
        },
        {
          url: "/_next/static/media/07a8433d3af6e9de-s.woff2",
          revision: "69440e8f03169eaebd2647e54c886a1b",
        },
        {
          url: "/_next/static/media/07ec12747d2bd9b2-s.woff2",
          revision: "fc0246852292249e7ea5fcbc5be00da7",
        },
        {
          url: "/_next/static/media/097624573d881dec-s.woff2",
          revision: "27212d9a9355f7e5f0139bf72bf7b3f2",
        },
        {
          url: "/_next/static/media/0a49fd0f4f9006a1-s.woff2",
          revision: "07b1b1f6ce312643966af2e698573cdf",
        },
        {
          url: "/_next/static/media/0b330daef8d4b738-s.woff2",
          revision: "9b268c12cef01f250c8b817decc4986f",
        },
        {
          url: "/_next/static/media/0ca2f17ae8834abc-s.woff2",
          revision: "9d7d073fb3b294bf7776e52bccbb06d2",
        },
        {
          url: "/_next/static/media/0d1340562a179182-s.woff2",
          revision: "c61fbda17426a42f92a575d7bde4ce5a",
        },
        {
          url: "/_next/static/media/0d479b7add50fe49-s.woff2",
          revision: "a8040e03476fd1192154090677d42fe4",
        },
        {
          url: "/_next/static/media/0d6cc82bfcc8ba87-s.woff2",
          revision: "ca3c40464ae1021d3c3c6370088ee751",
        },
        {
          url: "/_next/static/media/0e89f383a946ac78-s.woff2",
          revision: "2b444bac5e81bd3dda29b4ec11cff33e",
        },
        {
          url: "/_next/static/media/0e9625ac5c7785b0-s.woff2",
          revision: "248dc1b14fe6450ee5ab6d1430b01f82",
        },
        {
          url: "/_next/static/media/0f06758ab34218d2-s.woff2",
          revision: "e3526137c433b325e804a2256482be68",
        },
        {
          url: "/_next/static/media/0f085e7cb357cdd9-s.woff2",
          revision: "8828f996245312d8554b64dc8842422d",
        },
        {
          url: "/_next/static/media/0f35ff9f3232718d-s.woff2",
          revision: "5521cf6bdc3f752008b06e986c1f7997",
        },
        {
          url: "/_next/static/media/0f7ba05cb3247fa7-s.woff2",
          revision: "dc228ed1cfb14b0bc4d6a3f883b916b8",
        },
        {
          url: "/_next/static/media/0f8ccf227a25db29-s.woff2",
          revision: "454047ed051651742f3feae33dc53e96",
        },
        {
          url: "/_next/static/media/0f996961bfca55b0-s.woff2",
          revision: "75134a45237bebb2b1012ecae59fa562",
        },
        {
          url: "/_next/static/media/0fbb8114010781d7-s.woff2",
          revision: "590561f7c1a2e1f594387b5072c46b9b",
        },
        {
          url: "/_next/static/media/10ee6d8ae940de3f-s.woff2",
          revision: "c95f6429006e8c0c1f2b62e2849f2732",
        },
        {
          url: "/_next/static/media/11a02c1352a9b1f9-s.woff2",
          revision: "e171fbf9aee9e212e210ed1b486ffe7e",
        },
        {
          url: "/_next/static/media/1224a61490c12c60-s.woff2",
          revision: "f7da575b4d44b3f734e2854a7874364a",
        },
        {
          url: "/_next/static/media/136889460c375dc5-s.woff2",
          revision: "b773e7619641e241f82f61469b2dbefa",
        },
        {
          url: "/_next/static/media/153e299daf40ccd6-s.woff2",
          revision: "749104d5df1d57eb3b6e2ca82b0f2ce4",
        },
        {
          url: "/_next/static/media/15997ed3403fcbc6-s.woff2",
          revision: "d081239ef2864f2324363ced0ee73647",
        },
        {
          url: "/_next/static/media/1696df9d4300a5fb-s.woff2",
          revision: "04da86fa6b854c7091db9ec066dda018",
        },
        {
          url: "/_next/static/media/170244e7b084fc5d-s.woff2",
          revision: "403b05557ac11bad6734ce554560c704",
        },
        {
          url: "/_next/static/media/170925ff71a6a42f-s.woff2",
          revision: "9d1338cbc4c82bcdba639e192e7e7740",
        },
        {
          url: "/_next/static/media/1725c362d6fe006d-s.woff2",
          revision: "a8465834310de2851bb8443f1e0c14f2",
        },
        {
          url: "/_next/static/media/1777ba7c411fc0e6-s.woff2",
          revision: "5dac1bb60452c26b4270c46971aeb92d",
        },
        {
          url: "/_next/static/media/17e21f3c86a197d1-s.woff2",
          revision: "fcc659478f98da9b71a4311f89cfcd7c",
        },
        {
          url: "/_next/static/media/17fde8ee3d6dda0d-s.woff2",
          revision: "df0c1ac87b8479af803a98e913358013",
        },
        {
          url: "/_next/static/media/186688367f43679b-s.woff2",
          revision: "40044c268ba062f75d4f76922c3e6182",
        },
        {
          url: "/_next/static/media/188878bff8657426-s.woff2",
          revision: "9efa4d21a98c5f37573ea96d059b2b67",
        },
        {
          url: "/_next/static/media/1b4ea2d5f15d0269-s.woff2",
          revision: "fbee6eb836c95c6ec944113989d6cf4b",
        },
        {
          url: "/_next/static/media/1c888398e71a7d6e-s.woff2",
          revision: "50c72d4927b9b59ad028bd7017589a2d",
        },
        {
          url: "/_next/static/media/1cf5d31e0cccd0f1-s.woff2",
          revision: "39ab9532e0acd4c68cb22daeed1f384a",
        },
        {
          url: "/_next/static/media/1d8b1ca1c46eccab-s.woff2",
          revision: "1cada50377aa4086eb0c373636d7d2a9",
        },
        {
          url: "/_next/static/media/1e4812b70f29b8e2-s.woff2",
          revision: "1052681787968f198dea2b1acdfe572d",
        },
        {
          url: "/_next/static/media/1fa2ced6bf7fb950-s.woff2",
          revision: "a8513a14df2a8450abb7583352cae5a1",
        },
        {
          url: "/_next/static/media/2089d3dae330c162-s.woff2",
          revision: "acec7fc637fa0d73ae277ff8de54a0f9",
        },
        {
          url: "/_next/static/media/20971cd3571a65fa-s.woff2",
          revision: "df8c3a570749d992d2b5831a5700924c",
        },
        {
          url: "/_next/static/media/20faea49a331f590-s.woff2",
          revision: "a078c54a74aef81c05aa947076630ee5",
        },
        {
          url: "/_next/static/media/21de4caa20b812dc-s.woff2",
          revision: "22ee6f48ce85af316a704a986b04393d",
        },
        {
          url: "/_next/static/media/22d6e6c2563a23b2-s.woff2",
          revision: "d23c1351e4fdfa7430a7c76c910d175d",
        },
        {
          url: "/_next/static/media/22fc5bb5b4ec5cd2-s.woff2",
          revision: "05e2050361081a15508a4f4dc4ff43f4",
        },
        {
          url: "/_next/static/media/2434f5a8a0cec771-s.woff2",
          revision: "bf08aacb97f18f1b468975d5c4ece445",
        },
        {
          url: "/_next/static/media/24a2ff816a764f21-s.woff2",
          revision: "353af18fe142a846f176fbfe3b406bf4",
        },
        {
          url: "/_next/static/media/24e6c6326c3c47e9-s.woff2",
          revision: "614fa173637bf1ce75af18794a86282b",
        },
        {
          url: "/_next/static/media/251eb13891bb7e9d-s.woff2",
          revision: "f8fc3f7d6951d1258effb14c0a5dd670",
        },
        {
          url: "/_next/static/media/255d2ef54e25ffcd-s.woff2",
          revision: "60663418e9bd3c7a7bae67a82c77cc33",
        },
        {
          url: "/_next/static/media/257358992327b305-s.woff2",
          revision: "27db02b02f47b004a593e0771223d202",
        },
        {
          url: "/_next/static/media/25dd3581b949d176-s.woff2",
          revision: "6bad1202427383a4acc9702fa27bd120",
        },
        {
          url: "/_next/static/media/25fa1575b7243dd4-s.woff2",
          revision: "7f6f4cb7ac9c99cb6cecfa47d88197e1",
        },
        {
          url: "/_next/static/media/27143f5887398ec7-s.woff2",
          revision: "a81731d91910a59653e53e7545408de9",
        },
        {
          url: "/_next/static/media/27344763ec51d422-s.woff2",
          revision: "0aba64302fcc55b297879a4fc73637a0",
        },
        {
          url: "/_next/static/media/281298ee9b8ef03c-s.woff2",
          revision: "2a6ea6f4a8eff9d39bdf061f2173c3a0",
        },
        {
          url: "/_next/static/media/285d1203156cde82-s.woff2",
          revision: "f0be90d5b36e454944988108ca3699e2",
        },
        {
          url: "/_next/static/media/2922787115858052-s.woff2",
          revision: "0ab3ac76a23a240360507d28114c7b37",
        },
        {
          url: "/_next/static/media/2a31f99e109588e1-s.woff2",
          revision: "24ab0ad6996fbea746c0202e4f946325",
        },
        {
          url: "/_next/static/media/2b1c028786d169a9-s.woff2",
          revision: "17270dcc902e85b582c29eb7b5d7bf74",
        },
        {
          url: "/_next/static/media/2bd140f02ae8b921-s.woff2",
          revision: "1f03285242d580432ea4b15549b352e7",
        },
        {
          url: "/_next/static/media/2dc828d4e1d8c37d-s.woff2",
          revision: "075eb4a4367245503373a754a91f13b2",
        },
        {
          url: "/_next/static/media/2dd7ef84d5d5ee03-s.woff2",
          revision: "71ec5b60cf2ab3d00d943a5f6eef06c1",
        },
        {
          url: "/_next/static/media/2e33e82b84ec58dd-s.woff2",
          revision: "ca2c0a3c979b0c02d17f2080ade95aa9",
        },
        {
          url: "/_next/static/media/30407e923d00cd12-s.woff2",
          revision: "af1d465734ed77d8bf79a5f44f7ce4b3",
        },
        {
          url: "/_next/static/media/3059bd57558a14fe-s.woff2",
          revision: "92a8fc42679a8d4f0d7cfc991c775e31",
        },
        {
          url: "/_next/static/media/307f80fb2416adc8-s.woff2",
          revision: "f7be4ece02d6a1a14371821d5b9d9339",
        },
        {
          url: "/_next/static/media/31bafc833c4aa9fb-s.woff2",
          revision: "878e0d27ed6ec3a772a519c53792994b",
        },
        {
          url: "/_next/static/media/33a7f75891d33bee-s.woff2",
          revision: "6dc54bc859e25bb9f6a99beb6ecca6cf",
        },
        {
          url: "/_next/static/media/33afb54d51dee39e-s.woff2",
          revision: "256ae22b2dee847c4f4364aab5399182",
        },
        {
          url: "/_next/static/media/3446d2bcf0827e0d-s.woff2",
          revision: "c4b02f6e94c54b10ad2aab744b54ef7b",
        },
        {
          url: "/_next/static/media/346b928523fa35ae-s.woff2",
          revision: "c68d6c27fa1eae9f4048598dc03d12ff",
        },
        {
          url: "/_next/static/media/34a1144c9cb98fd4-s.woff2",
          revision: "03ab00aa5802d096b2f5d741f6417ecb",
        },
        {
          url: "/_next/static/media/34e4bf3fba3fa4fc-s.woff2",
          revision: "13f5c26aee7ea573b642de141747776f",
        },
        {
          url: "/_next/static/media/351055e370d806de-s.woff2",
          revision: "35a31df9a46fae83f533fe77b4a81b9b",
        },
        {
          url: "/_next/static/media/35ca00c156219cec-s.woff2",
          revision: "faa66b5d96b54035b943ba278c46b9c9",
        },
        {
          url: "/_next/static/media/36242e1f319d62fe-s.woff2",
          revision: "db7564f8130d2d528d96bd51f8a383f7",
        },
        {
          url: "/_next/static/media/3711f8e607f1b656-s.woff2",
          revision: "559b9600d0d71179c0eea8b9affed5b3",
        },
        {
          url: "/_next/static/media/37c1b5419edb685f-s.woff2",
          revision: "8e84b43d17eee58be28a94f1550aec43",
        },
        {
          url: "/_next/static/media/387cedb7d2d60e66-s.woff2",
          revision: "5420cd82a5da195e04421a8d6164ea2d",
        },
        {
          url: "/_next/static/media/39f382070dc18dda-s.woff2",
          revision: "bc06f9bc17e02950f25ef3487d584f09",
        },
        {
          url: "/_next/static/media/3a05f4c4fe2f6562-s.woff2",
          revision: "5f4a6d4e4d25392eb254cb8a5c05cecd",
        },
        {
          url: "/_next/static/media/3afb38db2c43eafb-s.woff2",
          revision: "97511cce027ef2632c8212ecd1fd2e53",
        },
        {
          url: "/_next/static/media/3b30db4fd8252db1-s.woff2",
          revision: "20cf12862d7ff6c1f86f95bab5e3cbb0",
        },
        {
          url: "/_next/static/media/3b56888719ee660e-s.woff2",
          revision: "14b1f9895e99c37aa0cd501cbbfc1924",
        },
        {
          url: "/_next/static/media/3c35ab94d31320de-s.woff2",
          revision: "353d65aabff9549383f151ee5c30f550",
        },
        {
          url: "/_next/static/media/3d5397d800f836b8-s.woff2",
          revision: "1b8dc4cd2741c5e7df86de4c112f13b9",
        },
        {
          url: "/_next/static/media/3d5f28aa26e8a668-s.woff2",
          revision: "dc0ef6d1edccec351cbe59410a792632",
        },
        {
          url: "/_next/static/media/3e127db23b2a7ba5-s.woff2",
          revision: "089641a026cd673946787c12c8a79cbc",
        },
        {
          url: "/_next/static/media/3f4d324f950b4198-s.woff2",
          revision: "509fddafda45b012c6915255f36b2810",
        },
        {
          url: "/_next/static/media/3f628724b3354610-s.woff2",
          revision: "075e6ce4461b2e809018450d29a4bf11",
        },
        {
          url: "/_next/static/media/3f8985616e0bfe66-s.woff2",
          revision: "9d712b76edddf71a0cda55c3aa488cd7",
        },
        {
          url: "/_next/static/media/3f99b218b9af5563-s.woff2",
          revision: "ec0bcf55a3a7c8d605d08ff1becf5534",
        },
        {
          url: "/_next/static/media/3f9b80d7b481cb92-s.woff2",
          revision: "0f909d7661a7e4173183247a54da3b4b",
        },
        {
          url: "/_next/static/media/3ff957cda0facef1-s.woff2",
          revision: "6dd052efa16d6ab191cf649088a7cf82",
        },
        {
          url: "/_next/static/media/4077e41a4419de23-s.woff2",
          revision: "cdbbc6eaa2702adf7b3f403d9c9139e4",
        },
        {
          url: "/_next/static/media/41e5279ea4199820-s.woff2",
          revision: "f5b6d6781e2e203d6760057fb476b60f",
        },
        {
          url: "/_next/static/media/4202d8d2e5cc95dd-s.woff2",
          revision: "26ba5bf0e88ce1cc932be94fc2c1efc8",
        },
        {
          url: "/_next/static/media/454e26fb49180428-s.woff2",
          revision: "0011cb5d7f33afdbbe1f0cf1d81b1300",
        },
        {
          url: "/_next/static/media/47421b3459a31679-s.woff2",
          revision: "32893438ae6a64410d7c2d1340694350",
        },
        {
          url: "/_next/static/media/479783ca768c9a63-s.woff2",
          revision: "8c0cb654858129935377297d954934bb",
        },
        {
          url: "/_next/static/media/48438c2fb8174326-s.woff2",
          revision: "439591a2503205c6d960b5aa7d7c51ff",
        },
        {
          url: "/_next/static/media/49d1342c71ea0693-s.woff2",
          revision: "ab1f93ba0885725872cae73332a5b27a",
        },
        {
          url: "/_next/static/media/4a02cfc0effa9a04-s.woff2",
          revision: "22ed790ec7a7a3c4b25c8e15952b97ec",
        },
        {
          url: "/_next/static/media/4a20f87ee482c2fb-s.woff2",
          revision: "f254e833d466d78491fc415f16819a79",
        },
        {
          url: "/_next/static/media/4a38e2ee65cc288e-s.woff2",
          revision: "6beef355367f809cfb42696142012fa3",
        },
        {
          url: "/_next/static/media/4bb3d616d94b4735-s.woff2",
          revision: "26d8f23d7e5716609b6e84b972978a67",
        },
        {
          url: "/_next/static/media/4c9ea4410a595eb7-s.woff2",
          revision: "e218656d459e3ea1eab58fd6fd2ecff3",
        },
        {
          url: "/_next/static/media/4cba0fcdc5e0dac3-s.woff2",
          revision: "d2b3de22556f2e1b8724d7961225fb31",
        },
        {
          url: "/_next/static/media/4d0de06a6f82e9d2-s.woff2",
          revision: "2a50c8f96f1e29a69e2d55eef5adc418",
        },
        {
          url: "/_next/static/media/4dbc3909f68aa410-s.woff2",
          revision: "e2838c72b6f9c6fc0939031f99e5cb7d",
        },
        {
          url: "/_next/static/media/4e7022859f7d29c3-s.woff2",
          revision: "4c2f03e62bb298964dc3670a50d413b2",
        },
        {
          url: "/_next/static/media/4ec172a524ad03b9-s.woff2",
          revision: "45fb9001b1446132cd1b6a6b2a4d8232",
        },
        {
          url: "/_next/static/media/4f048f51d1620a10-s.woff2",
          revision: "ef23efa5cc56c6ff67290a3fe61426a7",
        },
        {
          url: "/_next/static/media/50657ae9657784a6-s.woff2",
          revision: "7daa4be6a535867a8818a51ae7a6b6d9",
        },
        {
          url: "/_next/static/media/50856a4af53466f7-s.woff2",
          revision: "b577d2c9320152acd8e695a4a53d52f8",
        },
        {
          url: "/_next/static/media/510f2173c21c6d70-s.woff2",
          revision: "95d732b29886e3a4296091a44e08e183",
        },
        {
          url: "/_next/static/media/513e771c136aef78-s.woff2",
          revision: "d76eeb72e1c6b2ad430ebb1c1a9dc742",
        },
        {
          url: "/_next/static/media/5205e6f2a1dc25f6-s.woff2",
          revision: "3b3581920a860cd9efaa1af6dfbaf451",
        },
        {
          url: "/_next/static/media/5432b09e30fbf462-s.woff2",
          revision: "2e965149b025554294467dd70568e71c",
        },
        {
          url: "/_next/static/media/54b9c8c80ee528da-s.woff2",
          revision: "29425f3aa889f9fbf6b5457ac692a307",
        },
        {
          url: "/_next/static/media/54f46b02a196be10-s.woff2",
          revision: "3b92e93e1cc2e254de09e8c2d7b341e0",
        },
        {
          url: "/_next/static/media/552cbee402dc52e3-s.woff2",
          revision: "edf4d5aeca9d29ae638c46d534c974cf",
        },
        {
          url: "/_next/static/media/553fbc3d5187da3c-s.woff2",
          revision: "c4c51f9bf542290a7717d711660f5043",
        },
        {
          url: "/_next/static/media/571521541cc6cf23-s.woff2",
          revision: "704b9bc8b735ca542e02d58f9af31de4",
        },
        {
          url: "/_next/static/media/57a6c9fb5155e5e4-s.woff2",
          revision: "90a939da3edc41abdf6afeae0dca981a",
        },
        {
          url: "/_next/static/media/586b004af722f851-s.woff2",
          revision: "f225821da33dcec49e94a3c2c7e889f8",
        },
        {
          url: "/_next/static/media/595beb6c865f4374-s.woff2",
          revision: "92d4ab42641c681462f18022f1d13214",
        },
        {
          url: "/_next/static/media/596ee4b65fc545cf-s.woff2",
          revision: "90ea6ca936ea9b93227337f8ae8e253a",
        },
        {
          url: "/_next/static/media/59ce0a4fe8a28fad-s.woff2",
          revision: "dfa5ad1ddce5ea621f8746d7f4af4c51",
        },
        {
          url: "/_next/static/media/5d47de70abd7d50b-s.woff2",
          revision: "4f8f6ac8f6f6dc9c8ae50fde6c67fb9e",
        },
        {
          url: "/_next/static/media/5ea6c50472ca7fad-s.woff2",
          revision: "155c6473b912450eeedf677152aa2cdd",
        },
        {
          url: "/_next/static/media/5ec0bd666e547122-s.woff2",
          revision: "3e07ba28295903f8d4308d7dcb256933",
        },
        {
          url: "/_next/static/media/5fc450ea98ced120-s.woff2",
          revision: "4948ecc33e82ef134544b2296640888e",
        },
        {
          url: "/_next/static/media/60c60800be02799e-s.woff2",
          revision: "fb08205570327889baa761ef4f360cea",
        },
        {
          url: "/_next/static/media/60d5098a2fd8a5d8-s.woff2",
          revision: "c4af44cbf9b4afc646524faa82659539",
        },
        {
          url: "/_next/static/media/61ba6b32948c5f92-s.woff2",
          revision: "75087e815320789d48519e7544d7c8b5",
        },
        {
          url: "/_next/static/media/620bc3c34533832f-s.woff2",
          revision: "c5912f44e1b203c6c509a8d4654ecea9",
        },
        {
          url: "/_next/static/media/628ffe1f060d72cd-s.woff2",
          revision: "85c58cfdc9203fb03bc856f0a68a96d3",
        },
        {
          url: "/_next/static/media/63029aa95417931e-s.woff2",
          revision: "33917300262476b28466061c56233135",
        },
        {
          url: "/_next/static/media/642737b3cac601ab-s.woff2",
          revision: "8c4ca039e6aa7bbe5ba328539d9d575a",
        },
        {
          url: "/_next/static/media/644321c50a1ef314-s.woff2",
          revision: "12d173bb68db750c54628676178adc83",
        },
        {
          url: "/_next/static/media/64c6cf8aab5d0fc6-s.woff2",
          revision: "3fedfb4ed4456d3a8d2d65bf195e24ed",
        },
        {
          url: "/_next/static/media/651d4d71afe62d5d-s.woff2",
          revision: "72470be5d17c6fdbde2f1e6ea6bf22ee",
        },
        {
          url: "/_next/static/media/65e7d1d49b136c18-s.woff2",
          revision: "8515770816779b27651f165b0eeabf89",
        },
        {
          url: "/_next/static/media/663ea8b17b5bd4fc-s.woff2",
          revision: "37e9a49f6126e0e102f0e564bd4bac65",
        },
        {
          url: "/_next/static/media/67735c7323121657-s.woff2",
          revision: "3ff55893980999e5328074eae606cf23",
        },
        {
          url: "/_next/static/media/678edcc9875a9112-s.woff2",
          revision: "3a130573533d905158d13d3883e28cb2",
        },
        {
          url: "/_next/static/media/67e61cbff45edf53-s.woff2",
          revision: "2dfc81fd02274489fb0c091c00ac482b",
        },
        {
          url: "/_next/static/media/6818092b97ad5eb4-s.woff2",
          revision: "50bd6774823b85a8141ab7793c305ff0",
        },
        {
          url: "/_next/static/media/687499eb70cdd813-s.p.woff2",
          revision: "48ec47731359fcda9b6a8f9df7354b02",
        },
        {
          url: "/_next/static/media/6922d63c6de47876-s.woff2",
          revision: "382f2ec4e514839f05be22a0ad562b14",
        },
        {
          url: "/_next/static/media/6b3be79597bae5d1-s.woff2",
          revision: "0d84d761e2983828b8a0b9d2990f5086",
        },
        {
          url: "/_next/static/media/6b9b46c0e7a6e470-s.woff2",
          revision: "38801ece0ccc5f1e0993e41688372ba0",
        },
        {
          url: "/_next/static/media/6e2492273c350424-s.woff2",
          revision: "7b5f489d4b77709894345c87034181c4",
        },
        {
          url: "/_next/static/media/6ecfd23c65c844f3-s.woff2",
          revision: "572b74da3e5d7f700ad79e15799839d1",
        },
        {
          url: "/_next/static/media/6ef260e82face2b6-s.woff2",
          revision: "6910f193edf644431cef89ecf4e25106",
        },
        {
          url: "/_next/static/media/7095b88f5b005f09-s.woff2",
          revision: "93f69e6039d30d1edb4a9df825e9c382",
        },
        {
          url: "/_next/static/media/713199bf0e909b32-s.woff2",
          revision: "86d8c6e5e7b3b4412c798ace4911e02e",
        },
        {
          url: "/_next/static/media/714cb77898fc42ec-s.woff2",
          revision: "04535af7022e1e90eeca9e6c70db4823",
        },
        {
          url: "/_next/static/media/71cec0dda4a13fca-s.woff2",
          revision: "ccda92568506249ca3f2e1ac990934d0",
        },
        {
          url: "/_next/static/media/71cecf53d52f3168-s.woff2",
          revision: "64fe93813e8d5f03baad5e2a64fb957b",
        },
        {
          url: "/_next/static/media/71f9f593ce58bfe3-s.woff2",
          revision: "b91f07aa60e927c5d2109f2cd2fa0768",
        },
        {
          url: "/_next/static/media/7295f78397acb2cf-s.woff2",
          revision: "d8532d88273fe5e5894c54bedf7ed039",
        },
        {
          url: "/_next/static/media/72a48fced2ef600f-s.woff2",
          revision: "71938895a7204a014346a050227ae20a",
        },
        {
          url: "/_next/static/media/732d4179250cb1c8-s.woff2",
          revision: "f31ca6390d0ef37d6d42a9deb1ae5d49",
        },
        {
          url: "/_next/static/media/739e9e47421f66e7-s.woff2",
          revision: "a81ad8f7d4a81061594a3bd405e5d31b",
        },
        {
          url: "/_next/static/media/73bd0753f650f634-s.woff2",
          revision: "9d9ff52e7e87be965b874ec1279f3b5b",
        },
        {
          url: "/_next/static/media/73bfa5795baee155-s.woff2",
          revision: "1ea13c3ff4bff2afd5ef499e919bab21",
        },
        {
          url: "/_next/static/media/73eff2858776ab59-s.woff2",
          revision: "61440d847fe2daf713d95dff1713ba76",
        },
        {
          url: "/_next/static/media/74b1246a0a47dec4-s.woff2",
          revision: "49d6ea90ce9193519ab9e3a65e35998b",
        },
        {
          url: "/_next/static/media/752394e946ea5a2f-s.woff2",
          revision: "01b219fef1937ea6a7c76ff2f5297a54",
        },
        {
          url: "/_next/static/media/757e518caeee3a3a-s.woff2",
          revision: "c8602f5bb1f3a41849e65380d432f2ee",
        },
        {
          url: "/_next/static/media/75c8ded9e8199538-s.woff2",
          revision: "b68071ac6599fbc3608117aa6cd6a9c3",
        },
        {
          url: "/_next/static/media/76b08e69757e61ce-s.woff2",
          revision: "1daf76e16eb433731d0bc1fc86bb9555",
        },
        {
          url: "/_next/static/media/76cabdb54a89a7a4-s.woff2",
          revision: "3ded032b10a26d28af1761bc65ee90f2",
        },
        {
          url: "/_next/static/media/76fec88fc1299370-s.woff2",
          revision: "87a1594a6d8b4449be2d606897e1cb4a",
        },
        {
          url: "/_next/static/media/770ffb68a8c684d2-s.woff2",
          revision: "461b5039f52c0ae5b1204e8b835e1964",
        },
        {
          url: "/_next/static/media/7719463a813d9226-s.woff2",
          revision: "5cba0dfb21015ffc8d65ebfa919889c8",
        },
        {
          url: "/_next/static/media/788d3657fa2f3a13-s.woff2",
          revision: "ba074067998327f64305295c32fdf158",
        },
        {
          url: "/_next/static/media/791264ae62be15d4-s.woff2",
          revision: "28b47e1fed8edf9ca43d3d9e78c75072",
        },
        {
          url: "/_next/static/media/7993d52faee3723d-s.woff2",
          revision: "f2cd6cbbb57c385daef4271c967723e5",
        },
        {
          url: "/_next/static/media/79ab1847ddea7285-s.woff2",
          revision: "8f7ae8c3502e88457d45873cb925c07c",
        },
        {
          url: "/_next/static/media/7a6233a84886344f-s.woff2",
          revision: "e6838c4fb431acd364e8a0c42792f7b1",
        },
        {
          url: "/_next/static/media/7b82128b1914f914-s.woff2",
          revision: "d2a96220547100ab862b259b7630ac9d",
        },
        {
          url: "/_next/static/media/7bc65d8132364462-s.woff2",
          revision: "13ae88f20a0001f09c64d3077061c06b",
        },
        {
          url: "/_next/static/media/7d2cbc53767f15ec-s.woff2",
          revision: "3a0b0382053b72e6b41de298bf8120d0",
        },
        {
          url: "/_next/static/media/7d72fc4c922b72e5-s.woff2",
          revision: "27abc9d48c8b1bbb4bb546f00230274c",
        },
        {
          url: "/_next/static/media/7d836cb54dc5ec9a-s.woff2",
          revision: "816e0036fc26385832725d986eaa2fee",
        },
        {
          url: "/_next/static/media/7dd2a65ab1f56e4d-s.woff2",
          revision: "ad1fbc8c6078265fa4b07e35ec09ddeb",
        },
        {
          url: "/_next/static/media/7e21ff511406e119-s.woff2",
          revision: "abbebe7dd01dd7d6838213f8c33819bb",
        },
        {
          url: "/_next/static/media/7e3ff76431a51521-s.woff2",
          revision: "eb6b327a8c3a367fce20e46b28e9d21b",
        },
        {
          url: "/_next/static/media/7efe6b3f5cb85bbe-s.woff2",
          revision: "b81e68afaa2c441ff12d9a389acd4978",
        },
        {
          url: "/_next/static/media/7f01285a406cc625-s.woff2",
          revision: "ea7b81b26a33484f9013b6a2f2f6e65a",
        },
        {
          url: "/_next/static/media/7f0ecb160f687117-s.woff2",
          revision: "57f8e21a91b05a2a9a19fdb1445e4344",
        },
        {
          url: "/_next/static/media/7f694083536eb0a8-s.woff2",
          revision: "ae13c357d96367a24909901736044067",
        },
        {
          url: "/_next/static/media/7fc686d623bfaeaa-s.woff2",
          revision: "d7c8596385118c64432f46e136cce36f",
        },
        {
          url: "/_next/static/media/80570740d5813f67-s.woff2",
          revision: "7f9db2505d284eed7d8c577e4e1d9f9d",
        },
        {
          url: "/_next/static/media/80774b755e56eb33-s.woff2",
          revision: "9308d36c41341b89626842bdb9173f7f",
        },
        {
          url: "/_next/static/media/8188c463e992ba67-s.woff2",
          revision: "6befdc27b5ff21f8902e3ef3d2ecb011",
        },
        {
          url: "/_next/static/media/827756af8d7831b5-s.woff2",
          revision: "059ca877207964dd17acb8d0b3d84897",
        },
        {
          url: "/_next/static/media/82856115bcb956d9-s.woff2",
          revision: "6cba387d20dca064f210312c3d02fac3",
        },
        {
          url: "/_next/static/media/8290b995ced3830b-s.woff2",
          revision: "36db6c0cfefcb8517587dba0ee8da64d",
        },
        {
          url: "/_next/static/media/82c9311e3ca150d6-s.woff2",
          revision: "8abc5d15ef262570339ce0ba32a864d8",
        },
        {
          url: "/_next/static/media/82ebdf3a4b16fb33-s.woff2",
          revision: "5a677521cd2a36452615cf724e927f1f",
        },
        {
          url: "/_next/static/media/835b90552a24fab6-s.woff2",
          revision: "16838a89938771ef84c5db7a1c5b4cf7",
        },
        {
          url: "/_next/static/media/836ad2123df8c053-s.woff2",
          revision: "c480c7ecf41c25d7a344458da24537e6",
        },
        {
          url: "/_next/static/media/8380a34fe360abfb-s.woff2",
          revision: "a105100834ef437514cc4250ae941a2b",
        },
        {
          url: "/_next/static/media/848f1f4d32c090da-s.woff2",
          revision: "91bc3d83a34dfa8b1d2a6b9a53955089",
        },
        {
          url: "/_next/static/media/8756f64f5120f228-s.woff2",
          revision: "d90033f588bc3cc81439bd9323b64d95",
        },
        {
          url: "/_next/static/media/87de9ac28693fafc-s.woff2",
          revision: "f78f74f1f7105369e0d6e3068b6d4442",
        },
        {
          url: "/_next/static/media/8a804d70bc2faa9e-s.woff2",
          revision: "477f4003a7bc187fb39239a2758ddba2",
        },
        {
          url: "/_next/static/media/8b09d0c1529b1b61-s.woff2",
          revision: "0cf5940dcdc52330c7a6b973f42b543f",
        },
        {
          url: "/_next/static/media/8c1c910ae3321e4d-s.woff2",
          revision: "10673a504d6608010183ebdccf77c3c9",
        },
        {
          url: "/_next/static/media/8c4054c6ecb982df-s.woff2",
          revision: "d09087d9e08f09b68a00b7e816e578e8",
        },
        {
          url: "/_next/static/media/8cab933d9983ab27-s.woff2",
          revision: "652c95cfe670f86f6280f89b4ca49351",
        },
        {
          url: "/_next/static/media/8cefae5bf4ebd051-s.woff2",
          revision: "d0d7c89c2b279446fa6dff72ca5f3da8",
        },
        {
          url: "/_next/static/media/8cf323d18f33f133-s.woff2",
          revision: "8891c2662b59bcafd8b8a6fecb9b9650",
        },
        {
          url: "/_next/static/media/8d9a3e0bbd1a6972-s.woff2",
          revision: "04b93a75023be64d0929c2ac139c1a80",
        },
        {
          url: "/_next/static/media/8e7526499394d33a-s.woff2",
          revision: "6bdaf84de71873d3f8446fd4f55206a1",
        },
        {
          url: "/_next/static/media/8eb44da3fecd4abf-s.woff2",
          revision: "31a3fc34ad65f7609fd2db56c70d9dc8",
        },
        {
          url: "/_next/static/media/90014a81aafe2007-s.woff2",
          revision: "b644b9852e458890e7e8d3b412a757b7",
        },
        {
          url: "/_next/static/media/9022f41e735946e3-s.woff2",
          revision: "8f07258c035eacca23cf817feb630fe5",
        },
        {
          url: "/_next/static/media/94e5bc978d344f2b-s.woff2",
          revision: "c3c06540c031743ea32ab7832bf257bd",
        },
        {
          url: "/_next/static/media/973bd2074c3e5ff3-s.woff2",
          revision: "c694f63c74b5f31f15b16ded7c519e71",
        },
        {
          url: "/_next/static/media/97f115df7cf995c0-s.woff2",
          revision: "64af7a555d7a1843f2977ff5aed9f65f",
        },
        {
          url: "/_next/static/media/9991c19dce4ed7ee-s.p.woff2",
          revision: "e1769d1497fb7ebcd78afa2e3cbd9748",
        },
        {
          url: "/_next/static/media/99929a69087d5eb9-s.woff2",
          revision: "821f57fb802f060593f0e6c802841c4e",
        },
        {
          url: "/_next/static/media/99a9538eefef1200-s.woff2",
          revision: "be5e7266e1ed3e040cded190204d2d0e",
        },
        {
          url: "/_next/static/media/9aaef3e076c1dbf6-s.woff2",
          revision: "9266dd3536a5cb1a7090b3069a8c2128",
        },
        {
          url: "/_next/static/media/9b14bf2dea5c3d53-s.woff2",
          revision: "b331fbb0fe2d2936aa098f02b6f6fcff",
        },
        {
          url: "/_next/static/media/9ba9f81305527bbe-s.woff2",
          revision: "bc965726fe842c66230864a1aa2ca403",
        },
        {
          url: "/_next/static/media/9d2c696623edd1de-s.woff2",
          revision: "cdb647ee7b41ce1b079375e12b81872e",
        },
        {
          url: "/_next/static/media/9da4fde0b3fef940-s.woff2",
          revision: "3fd4ceb6933d4c2f5c508580d8ae3df5",
        },
        {
          url: "/_next/static/media/9f2d70a5d819f58b-s.woff2",
          revision: "14cb43c9fb080e596b0b5772574b0dbd",
        },
        {
          url: "/_next/static/media/9fd44a8a13e268f0-s.woff2",
          revision: "fdbc55a501f34c680054f562093415ff",
        },
        {
          url: "/_next/static/media/a0738bf6ab1f190c-s.woff2",
          revision: "7b09de7a7af68b538f3a0ee3da219af1",
        },
        {
          url: "/_next/static/media/a184f83cad455152-s.woff2",
          revision: "f9122b332ebc8cdc19b1b16ec54e4704",
        },
        {
          url: "/_next/static/media/a1ac3add17b24077-s.woff2",
          revision: "91fdd8b861a4a60b03653dacc92fcdb8",
        },
        {
          url: "/_next/static/media/a212e3c15e5a2e77-s.woff2",
          revision: "e3048dd671739effe86307718c2409f5",
        },
        {
          url: "/_next/static/media/a4a361e8cbaf7a6c-s.woff2",
          revision: "d5c2c4365921d059ecfed61b7ce23b34",
        },
        {
          url: "/_next/static/media/a50bed3d212c05ac-s.woff2",
          revision: "cefb5f6562e9d05bdf1f07af0a15fca7",
        },
        {
          url: "/_next/static/media/a526226f5d003c49-s.woff2",
          revision: "104cfe3dafae1101a4f995701b8b64dd",
        },
        {
          url: "/_next/static/media/a5b2f13146e73636-s.woff2",
          revision: "b61238223b58d4b0abaa908f9f79f4c9",
        },
        {
          url: "/_next/static/media/a73bc15d52aa5498-s.woff2",
          revision: "585bb3af2ddd85c0ad26019066e1078a",
        },
        {
          url: "/_next/static/media/a78d04eab389d3f7-s.woff2",
          revision: "a0cb6853077a259c8aaeea282c07e040",
        },
        {
          url: "/_next/static/media/a9023692b9254840-s.woff2",
          revision: "3e6242e60f2bd9ac2d4fe8ac260c1ebf",
        },
        {
          url: "/_next/static/media/a92ab62c54f07123-s.woff2",
          revision: "df46ccddf017d6767fafaf6a63797b09",
        },
        {
          url: "/_next/static/media/aaa1d05648b93954-s.woff2",
          revision: "ff6231d4a5ab93d78e0c5211cdb1316c",
        },
        {
          url: "/_next/static/media/ab35d0dcba2e5c57-s.woff2",
          revision: "e8320cef2a2d2bf81ec4c91884198752",
        },
        {
          url: "/_next/static/media/ab495deb08b9bf1e-s.woff2",
          revision: "331c1595995c1051285899807b02e0e9",
        },
        {
          url: "/_next/static/media/aba95b570cbd891a-s.woff2",
          revision: "490888865b1122a96e860703dad35f99",
        },
        {
          url: "/_next/static/media/abb17687d6f048bc-s.woff2",
          revision: "43140d49490ff54118c0fcdf72e61f71",
        },
        {
          url: "/_next/static/media/abd01829352c7282-s.woff2",
          revision: "8136305abe695505db7d52e96bc96ccc",
        },
        {
          url: "/_next/static/media/abf4a1c07fab06ff-s.woff2",
          revision: "da6950611ddd42b7b8d6b0239c2f37a2",
        },
        {
          url: "/_next/static/media/acff46f67adcea73-s.woff2",
          revision: "b173b7d86889ec5f2b5e50d59a81f6ff",
        },
        {
          url: "/_next/static/media/ad4573c89c86943a-s.woff2",
          revision: "da7e09c5c7defe27e07e76a415c3042b",
        },
        {
          url: "/_next/static/media/aea1928f78fa525b-s.woff2",
          revision: "ae660c698a407af5f7c20a314b2b7467",
        },
        {
          url: "/_next/static/media/af1867dff1828b73-s.woff2",
          revision: "c94334c2d32aae5d6d7cf60a21c0d977",
        },
        {
          url: "/_next/static/media/b030b708248c897f-s.woff2",
          revision: "1821a3e6fcb9376617e0236f2393ee15",
        },
        {
          url: "/_next/static/media/b1f7a854f40e28c0-s.woff2",
          revision: "ac49253aaaeb17da4302331b61c72b12",
        },
        {
          url: "/_next/static/media/b270108c6629a334-s.woff2",
          revision: "8918878c136f74fb5481b251eb6058d3",
        },
        {
          url: "/_next/static/media/b3d8aa889a377f48-s.woff2",
          revision: "f46c665100905f595f48dd7966084459",
        },
        {
          url: "/_next/static/media/b45aca836b55a542-s.woff2",
          revision: "dd4704e4af9f95b9b996f8be352fde37",
        },
        {
          url: "/_next/static/media/b494361004019b9f-s.woff2",
          revision: "ff001239ca21609a1d14e1cca7ba86ad",
        },
        {
          url: "/_next/static/media/b4cfcfffb59aecc8-s.woff2",
          revision: "71656fe8d66f99c2c3f6c0236b905860",
        },
        {
          url: "/_next/static/media/b6c9fdf4bcb8682c-s.woff2",
          revision: "10e2c76d563d0205e7d365fdd22792fb",
        },
        {
          url: "/_next/static/media/b76428b3ff2dc660-s.woff2",
          revision: "56d00632823f07deb6396c27fb51585d",
        },
        {
          url: "/_next/static/media/b7a0ae30d8ee82da-s.woff2",
          revision: "70994ee1402223a7ba4ca5dc5ca2077c",
        },
        {
          url: "/_next/static/media/ba49085702dce859-s.woff2",
          revision: "7e95eccf83105923e3476d0f6eec6436",
        },
        {
          url: "/_next/static/media/baaf8d6cda356972-s.woff2",
          revision: "bb583ef2987fc03462b68d6a07c8c07c",
        },
        {
          url: "/_next/static/media/badbe4b08e33ad9c-s.woff2",
          revision: "79aadf4e8ffc939002df8da982a76ff6",
        },
        {
          url: "/_next/static/media/bae1763f1f2dbccc-s.woff2",
          revision: "befd313f7f206ff63b53d9fd4784bb20",
        },
        {
          url: "/_next/static/media/bb04d9313e73b52e-s.woff2",
          revision: "0247c913da32375ffe780323691c72b1",
        },
        {
          url: "/_next/static/media/bd6b4c461e9889bd-s.woff2",
          revision: "ecfecf512f7e52a06243f10c0e052504",
        },
        {
          url: "/_next/static/media/c09cc20723d833d0-s.woff2",
          revision: "7d8fd2182e8f208f5680c81633345444",
        },
        {
          url: "/_next/static/media/c27d2e8c3af7b896-s.woff2",
          revision: "7c6328daea2d047798ffd645b926e3a9",
        },
        {
          url: "/_next/static/media/c2db8de5e81c6c26-s.woff2",
          revision: "0ec96537af81c59c045cc44a32107896",
        },
        {
          url: "/_next/static/media/c2e84c8996c35d39-s.woff2",
          revision: "e1387a20728c54e1fc0320646e9d4e36",
        },
        {
          url: "/_next/static/media/c4313b76c9719ab3-s.woff2",
          revision: "b8b5a5ddcc35ace5bc073785c4284855",
        },
        {
          url: "/_next/static/media/c4e9e5de1bd58232-s.woff2",
          revision: "dafba8a8bba2f39ddf98a0c16e9798cb",
        },
        {
          url: "/_next/static/media/c522afd79d5794df-s.woff2",
          revision: "2c1e103097162cfed9be2daa0237bc37",
        },
        {
          url: "/_next/static/media/c533e39c63694841-s.woff2",
          revision: "9c3a9bf47c4a13d0e6c3e91803f4ecf0",
        },
        {
          url: "/_next/static/media/c5da2d5791eff5f2-s.woff2",
          revision: "780550ca6c0d9c07e6f4e4ebc4ee31cb",
        },
        {
          url: "/_next/static/media/c601b187f9843183-s.p.woff2",
          revision: "026119cf10a59ba8da304a4a284698c0",
        },
        {
          url: "/_next/static/media/c6028fbf92fdc150-s.woff2",
          revision: "51d68c00974f6ee439c8792a9d224ecd",
        },
        {
          url: "/_next/static/media/c65a34d7f18c995f-s.woff2",
          revision: "e0d5d8f303bf57b9d61a47efe0bf6afc",
        },
        {
          url: "/_next/static/media/c7433efdac177b13-s.woff2",
          revision: "4f44d7c95486765aa406b94bffebc83f",
        },
        {
          url: "/_next/static/media/c75a7ea040e89844-s.woff2",
          revision: "342fe2208676aa7f2c039ab3e1caef37",
        },
        {
          url: "/_next/static/media/c7bf192f4d5b1a0d-s.woff2",
          revision: "ee700dc56e55e4483b4e58d9d18b3852",
        },
        {
          url: "/_next/static/media/c7e38616445978d1-s.woff2",
          revision: "6ae0a322de7a043c53d5d91beab46911",
        },
        {
          url: "/_next/static/media/c9c291174c052ae4-s.woff2",
          revision: "dfed63deda7ffce725572e61a0e9fd99",
        },
        {
          url: "/_next/static/media/c9ed02c2b9a3d6d0-s.woff2",
          revision: "934d2c84a73f071e649e87793999bc90",
        },
        {
          url: "/_next/static/media/ca29184f925f370f-s.woff2",
          revision: "0e1c1301e75107dea19d35f04b53a0dc",
        },
        {
          url: "/_next/static/media/ca36b04f25ad3fda-s.woff2",
          revision: "20ec70f083f4954ae429cce4558b98a9",
        },
        {
          url: "/_next/static/media/cacad8abe6c6079d-s.woff2",
          revision: "60c6d58abd89d3b1bf12d69368d1672b",
        },
        {
          url: "/_next/static/media/cb3792ac03ff7c06-s.woff2",
          revision: "13c5551c26c32cf116592cf5b4fdb3c8",
        },
        {
          url: "/_next/static/media/cc67f95e91aabde9-s.woff2",
          revision: "633c26f6a7778898078f1abc6798dc8a",
        },
        {
          url: "/_next/static/media/ccac35254d3c2c75-s.woff2",
          revision: "65b497042557a5c6fbdffec96690f4b3",
        },
        {
          url: "/_next/static/media/cd397f7f92897033-s.woff2",
          revision: "6a87fcc69a96e74af4f4c5d73579475b",
        },
        {
          url: "/_next/static/media/cd5dbd376c414f7f-s.woff2",
          revision: "aaf6ff9704f7bb6bf76106f8abe6c059",
        },
        {
          url: "/_next/static/media/cdb8b91891139206-s.woff2",
          revision: "9049f5dd772a072fa481b6562a8d96c8",
        },
        {
          url: "/_next/static/media/ce3ef460a956befc-s.woff2",
          revision: "1d1528c3450fa4915ceefaa7bdfef866",
        },
        {
          url: "/_next/static/media/ce55acedb260ac96-s.woff2",
          revision: "26ec09e0f8024377f640506cb8dd957e",
        },
        {
          url: "/_next/static/media/cf773c9b515ad8ac-s.woff2",
          revision: "84aed323b2df7c68139aa4770ae5ce42",
        },
        {
          url: "/_next/static/media/d030fd164a4d7552-s.woff2",
          revision: "bfbd11489737068b2b9aa56116e32ac6",
        },
        {
          url: "/_next/static/media/d057c64c93d042b5-s.woff2",
          revision: "6c12ba3fcf7a0b435160568b423a232f",
        },
        {
          url: "/_next/static/media/d08fa6a3db57bd00-s.woff2",
          revision: "56ec9fe98618f1b7103992880caafb4c",
        },
        {
          url: "/_next/static/media/d20b19c14698145f-s.woff2",
          revision: "77fcad5a0f0eb60696cbbdf776670d96",
        },
        {
          url: "/_next/static/media/d2f21d99e6e9782b-s.woff2",
          revision: "d6c07b62aefece5ad98e8a4086017078",
        },
        {
          url: "/_next/static/media/d4ca3fd03e0ec590-s.woff2",
          revision: "09f38ae5e2ef08710dbbeb2c3174f226",
        },
        {
          url: "/_next/static/media/d4f5c4a357f9f78e-s.woff2",
          revision: "7f1816cfe133b2ff8888125d87a9c235",
        },
        {
          url: "/_next/static/media/d60d58bafa6ad10f-s.woff2",
          revision: "a81dabcbdc1ed81f9364daff871e230c",
        },
        {
          url: "/_next/static/media/d7776109013d58a1-s.woff2",
          revision: "c76af04117a7f55095935bc4acc58ce9",
        },
        {
          url: "/_next/static/media/d7cca0932b646198-s.woff2",
          revision: "88bd0918106a606c810e3c3e7e062cdc",
        },
        {
          url: "/_next/static/media/d7dce9750a13f99e-s.woff2",
          revision: "d3971391a98f13fbe2a9820810fff4ae",
        },
        {
          url: "/_next/static/media/d801c9e8bc92debc-s.woff2",
          revision: "c926e74a6df73ce995aeb96c74ac895f",
        },
        {
          url: "/_next/static/media/dab7f7d64b2045d7-s.woff2",
          revision: "ed51592adf564a3c52035286ed5aed4e",
        },
        {
          url: "/_next/static/media/dba346b8e88bccdf-s.woff2",
          revision: "dbcfa2cd3d320066f45559591bda3034",
        },
        {
          url: "/_next/static/media/dcc2d81bb1a7676c-s.woff2",
          revision: "99030a97fa05c7782dc13d76cf29379c",
        },
        {
          url: "/_next/static/media/dd2fc174da1a5932-s.woff2",
          revision: "d7285feac72840f888d2b05ef97ba201",
        },
        {
          url: "/_next/static/media/dd8c589a2377f06c-s.woff2",
          revision: "ec960b9ecc796e258ec9eb397fbea667",
        },
        {
          url: "/_next/static/media/e030ac062b8cd080-s.woff2",
          revision: "720703b560bfb4942a1a460638ea1a45",
        },
        {
          url: "/_next/static/media/e1aa1d6d50165f99-s.woff2",
          revision: "fdd72c2b0ababa56183ba452cc523a06",
        },
        {
          url: "/_next/static/media/e21705e55b267113-s.woff2",
          revision: "73e832539044338a6dc2869b9fadf2a6",
        },
        {
          url: "/_next/static/media/e2ac0186af1c7f8b-s.woff2",
          revision: "8a73e2ffffc20f13c20c4a91bfd3da88",
        },
        {
          url: "/_next/static/media/e3284b142bd38ba9-s.woff2",
          revision: "6a6f4468cefc7ec44bf3f51426b3ed46",
        },
        {
          url: "/_next/static/media/e363afdccaa9e8e0-s.woff2",
          revision: "a5195b7b4ba8b004435e56c00f12c1bd",
        },
        {
          url: "/_next/static/media/e5057a186611265f-s.woff2",
          revision: "653528dab2ec242670d019a64d1ba963",
        },
        {
          url: "/_next/static/media/e8265ba20f38e573-s.woff2",
          revision: "b0469657fb40e299abed57e25a289c06",
        },
        {
          url: "/_next/static/media/e84cf08b449b9bbf-s.woff2",
          revision: "71035f996d7334d9a1ce6acdfac7a243",
        },
        {
          url: "/_next/static/media/e86bcdc3ea796b42-s.woff2",
          revision: "5e2c3995904b8353c94cf64d47570a45",
        },
        {
          url: "/_next/static/media/e8a4116c178ac4aa-s.woff2",
          revision: "36a3aa6c5cde6b4d09af715d2005800f",
        },
        {
          url: "/_next/static/media/e8fdc65171a880d5-s.woff2",
          revision: "ae52a9500fa62bf5693335861072d394",
        },
        {
          url: "/_next/static/media/ea18e566ddf2eb6e-s.woff2",
          revision: "630d70acf48da286f7bf7f1b3e58a4c9",
        },
        {
          url: "/_next/static/media/ea94de0d5607627c-s.woff2",
          revision: "adfd6ac6bff8f557b9daebb23f274f90",
        },
        {
          url: "/_next/static/media/eb7252beff32a6dd-s.woff2",
          revision: "0603fbab852d37fafe3d9ca1c55aa927",
        },
        {
          url: "/_next/static/media/ed5400033eb01f6e-s.woff2",
          revision: "c352e64927f6b49c321f7b82ded1eafc",
        },
        {
          url: "/_next/static/media/ef78216bf92199ba-s.woff2",
          revision: "cddfb5dee6bb55621cd1e71fbf653013",
        },
        {
          url: "/_next/static/media/f016831e0d7cb666-s.woff2",
          revision: "0788bbf888e065f9f787ee0d15b4bda6",
        },
        {
          url: "/_next/static/media/f060e160378edf5c-s.woff2",
          revision: "674da4d96e6a8744806a794b6963d115",
        },
        {
          url: "/_next/static/media/f1eda442afe3f791-s.woff2",
          revision: "6fd8b206ff4b96842e05dec27b8bc311",
        },
        {
          url: "/_next/static/media/f21c64ea8df719ce-s.woff2",
          revision: "ed3fdfa2e27a184355f5ef1e86ae07df",
        },
        {
          url: "/_next/static/media/f27f8eeb45f83f53-s.woff2",
          revision: "ab7737bb1217f356026d5fe6fec635bc",
        },
        {
          url: "/_next/static/media/f40edaf19393ae3f-s.woff2",
          revision: "3984ba115e1a78689046d3b37489bac7",
        },
        {
          url: "/_next/static/media/f52b5a97000cc38c-s.woff2",
          revision: "f47b4880d696f19a1bb6d2b59fea878a",
        },
        {
          url: "/_next/static/media/f637d5b18455d97a-s.woff2",
          revision: "1ca40e569c1fbe464e24b3111e1b2cc1",
        },
        {
          url: "/_next/static/media/f6a4b3e92ccf7c12-s.woff2",
          revision: "ac00549b02baa1cc1ab27f2e7827063f",
        },
        {
          url: "/_next/static/media/f6ca05747764eb2e-s.woff2",
          revision: "43619fd5069d33fa4951e5e0e3b51932",
        },
        {
          url: "/_next/static/media/f732d49c5723b693-s.woff2",
          revision: "4aa99fea79e1b73636a373ab911d9115",
        },
        {
          url: "/_next/static/media/f7497bd86414d532-s.woff2",
          revision: "23bd2850fc31ace743dd6bbecaf689be",
        },
        {
          url: "/_next/static/media/f76d77fa76808fa3-s.woff2",
          revision: "20b5f54065b4aea076070f0ca324109c",
        },
        {
          url: "/_next/static/media/f7931725597bb3aa-s.woff2",
          revision: "9faf0d18521a95b129ebd74b222fb72b",
        },
        {
          url: "/_next/static/media/f7bc230d35a9487b-s.woff2",
          revision: "5de515cba03c44df5c351dfd665298dd",
        },
        {
          url: "/_next/static/media/f8256a1a54c3899d-s.woff2",
          revision: "133eae9b5b2d12009d52baf61a30afc6",
        },
        {
          url: "/_next/static/media/f846127855fa0f5c-s.woff2",
          revision: "0823b6c9f7c3d3cfe5c04ad3db60c4c6",
        },
        {
          url: "/_next/static/media/f859f807c591e21d-s.woff2",
          revision: "b00160af3781acd035fc27df90388482",
        },
        {
          url: "/_next/static/media/f93ccf53c05e3a2e-s.woff2",
          revision: "4d3460ff8809a48e960c3fbf1b984179",
        },
        {
          url: "/_next/static/media/fa8ff2df9d99ecad-s.woff2",
          revision: "161a60afd62c6917b9860090381c7edc",
        },
        {
          url: "/_next/static/media/fac8738d06a9c129-s.woff2",
          revision: "f79dd6ea0e0de1dc86c68d3425b611df",
        },
        {
          url: "/_next/static/media/fb7c32847474dcf0-s.woff2",
          revision: "5bf8c7475a920ec072aeb4720a0e383d",
        },
        {
          url: "/_next/static/media/fdbc85c774b9eae3-s.woff2",
          revision: "57c193cfc8924ab2ac7be5e0c57da202",
        },
        {
          url: "/_next/static/media/fdbe8b2ba03be2b4-s.woff2",
          revision: "db5656ec45180247bdde348234020e46",
        },
        {
          url: "/_next/static/media/fe3da3d8b1bc804a-s.woff2",
          revision: "c69cbaaa6bb46a23b0884ecf71257479",
        },
        {
          url: "/_next/static/media/ff2872b34c50a817-s.woff2",
          revision: "5e2d2b3ecb9903818eee44ccca78c146",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/icons/apple-icon-180.png",
          revision: "02b7ce1fa662160428ad792d6aa7dd1b",
        },
        {
          url: "/icons/backup/apple-icon-180.png",
          revision: "02b7ce1fa662160428ad792d6aa7dd1b",
        },
        {
          url: "/icons/backup/manifest-icon-192.maskable.png",
          revision: "e8a7fa4abb559f026e139a78ff2148bb",
        },
        {
          url: "/icons/backup/manifest-icon-512.maskable.png",
          revision: "e4bbb8efe60ecadad2fb764f3a53b058",
        },
        {
          url: "/icons/icon-base.svg",
          revision: "a19bb2dede9f3535c8ed37620d166f02",
        },
        {
          url: "/icons/manifest-icon-192.maskable.png",
          revision: "e8a7fa4abb559f026e139a78ff2148bb",
        },
        {
          url: "/icons/manifest-icon-512.maskable.png",
          revision: "e4bbb8efe60ecadad2fb764f3a53b058",
        },
        { url: "/manifest.json", revision: "b029008a8130da123863620daafacc6c" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: f,
              state: i,
            }) =>
              a && "opaqueredirect" === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: "OK",
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const a = e.pathname;
        return !a.startsWith("/api/auth/") && !!a.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET",
    );
});

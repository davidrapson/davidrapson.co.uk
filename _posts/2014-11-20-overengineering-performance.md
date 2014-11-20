---
layout: post
title:  "(Over)engineering for performance"
date:   2014-11-20
description: I’ve recently redesigned this website with the goal of making the fastest site I could and I wanted to explore some of the things I’ve done.
lead: I've recently redesigned this website with the goal of making the fastest site I could and I wanted to explore some of the things I've done.
---

## Pre-requisites

Some pre-requisites. I use [Jekyll](http://jekyllrb.com/) for my site and serve all static assets from [CloudFront](http://aws.amazon.com/cloudfront/).

It's also worth noting that I've deliberately left out mentions of [SpeedIndex](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index) from this article. It was a key metric when I was working on these improvements but it's something I want to explore in more detail at another time.

Rather than focussing on every performance improvement I've made, I wanted to focus on three specific changes that have taken this site from good-performance to great-performance.

## 1. Inlining critical CSS

A lot has been written about the benefits of [inlining critical CSS](https://developers.google.com/speed/pagespeed/service/PrioritizeCriticalCss). I've experimented with tools like [critical](https://github.com/addyosmani/critical) before but never quite got the results I was looking for.

The biggest switch for me was to think of this as **critical** CSS rather than the “above-the-fold” approach that most tools focus on. This change in approach as allowed me to find an approach I'm really happy with.

I’m using LESS as a pre-processor and already split components out into individual includes so I was able to generate the critical CSS manually. For me this looked something like the following:

~~~ css
@import "base/_normalize.less";
@import "base/_base.less";
@import "layout/_layout.less";

@import "module/modules/_common-text";
@import "module/modules/_intro";
@import "module/modules/_navigation";

@import "state/_state-utility";
~~~

*Critical* for this site meant layout styles, base typography styles and navigation. Essentially anything that causes major changes to layout or gives a good baseline experience. By setting a budget of about **10 kb** for this file I was able to keep it small enough to inline in the `<head>` of the page.

Before inlining critical CSS my mobile PageSpeed score was **78/100**:

<figure>
    <img src="https://pbs.twimg.com/media/B21yuNaIIAA9Lzc.png:large" alt="Before inlining critical CSS" />
    <figcaption>Before inlining critical CSS</figcaption>
</figure>

After inlining critical CSS the PageSpeed score is now **98/100**.

<figure>
    <img src="https://pbs.twimg.com/media/B21yuNaIIAA9Lzc.png:large" alt="After inlining critical CSS" />
    <figcaption>After inlining critical CSS</figcaption>
</figure>

Combining this with storing CSS in localStorage (see next point) has given me the best results. The initial flash of styles that can happen when async loading the rest of the CSS now only happens on first page load.

## 2. Store CSS in localStorage

In addition to inlining critical CSS I've also stolen a fantastic technique from Patrick Hamann in his [Breaking news at 1000ms](https://speakerdeck.com/patrickhamann/breaking-news-at-1000ms-velocity-eu-2014) talk. The basic idea is that initially you load the main stylesheet via ajax and serve it from localStorage from then on.

I highly recommend [poking](https://github.com/guardian/frontend/blob/72f21c8bad4b1093a4699a532bddb1d127e971c8/common/app/views/fragments/javaScriptLaterSteps.scala.html#L104-L118) [around](https://github.com/guardian/frontend/blob/236af31e0588457f1721f3cf0ffda58ad409c74a/common/app/views/fragments/loadCss.scala.html#L11-L75) the Guardian's [public source](https://github.com/guardian/frontend) to see how they've approached it but you can also see the [full source for my attempt on GitHub](https://github.com/davidrapson/davidrapson.co.uk/blob/master/_includes/head.html#L31-L105)

### Cachebusting

It took me a while of reading the [original code](https://github.com/guardian/frontend/blob/236af31e0588457f1721f3cf0ffda58ad409c74a/common/app/views/fragments/loadCss.scala.html#L31-L40) but the trick to ensuring that user doesn't get stuck with out-of-date CSS in localStorage   is to use a hash of the stylesheet contents as the localStorage key. The main check that makes this work is:

~~~ javascript
function loadCssFromStorage() {
var c = localStorage.getItem('css.6adf242d29936ef2d6ba93c22547512f765d97e9'),
  s, head;
if (c) {
  s = document.createElement('style');
  head = document.getElementsByTagName('head')[0];
  s.innerHTML = c;
  s.setAttribute('data-loaded-from', 'local');
  head.appendChild(s);
  global.cssLoaded = true;
}
}
loadCssFromStorage();

if (global.cssLoaded) {
return false;
}
~~~

As this script is inlined in the `<head>` we can make sure the hash referenced in `localStorage.getItem` is for the current stylesheet; meaning the CSS will only get loaded if the user has the *latest* version in storage already. Otherwise the new CSS should be requested and stored and any old versions cleared.

### Getting the hash into Jekyll

As I'm using Jekyll I needed a way to reference the latest hash in the `<head>` of the page. Thankfully Jekyll allows the creating of [custom data files](http://jekyllrb.com/docs/datafiles/) as a means of allowing data to be referenced in templates.

To get the correct hash I used Gulp to get an MD5 hash of the contents of my stylesheets and generate a JSON file in the `_data` directory with the following format:

~~~ json
{
    "version": "3.1.0",
    "head": {
        "hash": "ae127b3e71571938ce0e7a6a39e63d738afd0577"
    },
    "style": {
        "hash": "6adf242d29936ef2d6ba93c22547512f765d97e9"
    }
}
~~~

This then allowed me to reference the correct hash in my templates as `site.data.assets.style.hash`. I also use this file to determining the correct version of the stylesheet to get from CloudFront.

### A note on CORS and CloudFront

This method depends on using XHR to initially load the stylesheet. As my CSS is served from CloudFront and stored on S3 I added a CORS config to my S3 bucket. The thing that caught me out was that by default CloudFront doesn't forward any headers so the `Access-Control-Allow-Origin` header was ignored. Thankfully the solution is to set CloudFront to forward the `Origin` header:

> CORS (Cross Origin Resource Sharing) - CloudFront can now be used to deliver web assets such as JavaScript and fonts to other websites. Because CloudFront can now be configured to pass the Origin header along to the origin server, you can now use CORS to allow cross-origin access to your content.
>
> -- [Deliver Custom Content With CloudFront](http://aws.amazon.com/blogs/aws/enhanced-cloudfront-customization/)

## 3. Minify HTML

The final step I took was to minify HTML output. The [Jekyll Minify HTML](https://github.com/imathis/jekyll-minify-html) plugin let me do this with about three lines of config. I wouldn't go out of my way to do this but if your setup makes this easy for you without incurring any major overhead then you should do it.

## Final hold-out

The elephant in the room when it comes to remaining performance bottlenecks is that I'm serving web-fonts from Typekit. I'm using the [async embed code](http://help.typekit.com/customer/portal/articles/649336-embed-code) but ultimately using external web-fonts is a hit to performance.

I'm using web-fonts from [TypeTogether](http://www.type-together.com/) so I could potentially look at self-hosting but currently the cost of doing so is prohibitive, so the trade off is worth it.

## Wrap-up

If you've already got the basics down -- minify, gzip, cache -- it's worth spending the time exploring further optimisations. These techniques can take some fine-tuning, and as always YMMV, but if you can get something that works for you it can drastically improve the performance of your page.


*[CORS]: Cross-origin resource sharing
*[YMMV]: Your mileage may vary

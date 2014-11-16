---
layout: post
title:  "Deploying JavaScript Applications Revisited"
date:   2014-11-16
---

Back in March 2013, Alex Sexton wrote an article entitled [Deploying JavaScript Applications](https://alexsexton.com/blog/2013/03/deploying-javascript-applications/). It struck a chord with me, I'd be circling around some of the ideas in the article but never really invested the time in exploring many of the techniques; It felt good to see someone document and articulate these ideas.

At the time the article was published I was only scratching the surface of the techniques mentioned. Initially I excused this in part because I was working largely on typical content-driven websites, not <del>web applications</del> [web thangs](http://adactio.com/journal/6246/). It’s been interesting to revisit the article every few months and see how much more of those techniques I use, even when working on websites that weren’t full client-side applications.

As always, the exact approaches depend on the needs of the project but I wanted to explore the techniques Alex covered and how they've applied for me:

## Loading what you need is better than byte shaving

This has been the biggest change in approach for me and it's not even about deployment. By considering performance as part of the design and discovery process you can make large performance gains before you've even started writing any code. The impact of a feature has been considered beforehand. For me this mostly meant the following:

- Moving to a simple share link and loading social widgets on-demand rather than just showing the default widgets up-front.
- If a site has third-party comments, making them accessible via a link and deferring the load of the comments JS until the user needs them.
- Defer infrequently used but heavy features until they are absolutely needed.

**Notice a theme here**: defer, defer, defer; especially for third-party code. Nothing groundbreaking, but making this part of the design phase has meant it’s far more likely to get done right from the outset.

## Don’t penalise modern users

My focus has been on content-driven sites where [Cutting the Mustard](http://responsivenews.co.uk/post/18948466399/cutting-the-mustard) has proven to be a more appropriate approach for me rather than going down the route of lots of conditional builds.

Tim Kadlec suggested an approach I like a lot in his [Reaching Everyone Fast](http://www.youtube.com/watch?v=kylciFbrwcY) talk which combined [Filament Group’s loadJS](https://github.com/filamentgroup/loadJS) with a cutting the mustard check to only load the main JS on modern browsers:

~~~ javascript
if('querySelector' in document
  && 'localStorage' in window
  && 'addEventListener' in window) {
    loadJS('path/to/enhanced.js');
}
~~~

I like this approach as it forces you to focus on building a strong core foundation for all users which becomes the default view for IE8 and low-powered mobile devices whilst freeing you up to user newer techniques and technologies for modern browsers.

## One less jpeg

Images are often the elephant in the room, particularly with responsive web design. One less jpeg is certainly catchy and gets you thinking about relative sizes of images vs. JavaScript but doesn't cover the whole picture. In many cases [parse and execution time](http://timkadlec.com/2014/09/js-parse-and-execution-time/) is the more important consideration—especially on low powered devices—and often images are the content, rather than just being decorative.

That said there are a couple of tools that I've been using to make sure I'm being responsible with images:

- [Picturefill](https://github.com/scottjehl/picturefill) -- Since the original article was written picturefill has become a really viable option and (parts of) `picture` have started to land in major browsers.
- [Cloudinary](http://cloudinary.com/) -- Cloudinary is an image management SaaS. There are many like it, but this one does some smart content-negation to automatically serve WebP where supported. Chrome only for now but it makes a huge difference.
- Lazy load non-essential images -- Fairly standard practice but I've been making sure to defer load of any non-essential images (list images, thumbnails etc.)

## Package all the pieces together

### Fonts and Icons

Alex’s article mentioned using icon fonts for UI icons. A lot has been written since about the [relative merits of using icon fonts](http://ianfeather.co.uk/ten-reasons-we-switched-from-an-icon-font-to-svg/). I’ve had a lot of success with [grunticon](https://github.com/filamentgroup/grunticon) and even [SVG sprites](http://css-tricks.com/svg-sprites-use-better-icon-fonts/) which give you even more freedom than icon fonts when it comes to styling individual elements. It’s interesting to see how far these different techniques have come.

### CSS Files

This was a pretty interesting approach in the original article and one I can see working really well for third-party client-side apps. I didn't have these contstraints so have stuck with the old minify, gzip, cache heavily approach.

## Build apps into self-contained folders

Building all static assets into self contained folders makes sense even when not all your application code is client-side. By having versioned

1. Build the packaged, minified versions of all static assets into a build folder, e.g., `/build/1.1.0`, using the version number specified in a `package.json` file.
2. Push that build folder up to S3 using [grunt-aws](https://github.com/jpillora/grunt-aws) (grunt-s3 has since been deprecated) with a large Cache Control value and serve via CloudFront.
3. On the server, read the version number in from a `package.json` file and write a helper which returns the versioned path to the CDN in production (e.g., cdn.mysite.com/1.1.0/) or else the default server path in development mode. Use this for serving the right version of assets.

The versioning of assets alongside makes it easy to rollback to a previous version, or test against a pre-release version safely. `grunt-aws` does some smart stuff to auto gzip relevant assets and makes it easy to add any extra headers you want. Being so used to `mod_deflate` made the need to manually gzip files come as a slight surprise so it’s good to have a tool that  automates this stuff away for you.

## Statically generate your container pages and CDN them too

As my typical environment was a CMS driven website hosting static container pages on the CDN wasn't really an option. That said, with the help of a [pretend doctor](https://twitter.com/drlukeowen) and his smart [Varnish profiles](https://www.varnish-cache.org/) we were able to see consistent <200ms server response times. So it's possible to get close to the performance of static pages, providing you can cache everything aggressively.

## Wrap Up Redux

Revisiting [Deploying JavaScript Applications](https://alexsexton.com/blog/2013/03/deploying-javascript-applications/) over time has been an interesting process. It’s cool to see how much of this has become part of my standard practice but also how things have changed. This doesn’t even cover any of the fascinating work thats being done around [Optimising the critical rendering path](https://docs.google.com/a/davidrapson.co.uk/presentation/) such as inlining <del>above-the-fold</del> [critical CSS](https://github.com/addyosmani/critical). Let’s hope even more has changed if I revisit it again in 6 months.




*[SaaS]: Software as a service



---
layout: post
title:  "Testing for resilience"
date:   2014-12-08
description: A collection of tools to help with building performant and resilient websites.
---

Earlier this week [Scott Jehl](http://scottjehl.com/) posted a fantastic tweet:

>Q: “But who disables JS?”
A. Who cares. It's an edge case, fine. More often, JS *disables itself*. Requests fail, errors occur. Plan for it.
>[https://twitter.com/scottjehl/status/540152094314217472](https://twitter.com/scottjehl/status/540152094314217472)

This got me thinking about how I build websites and the tools I use to make sure my work has the broadest reach possible. The following are a few tools I've found invaluable when testing for resilience. **TL;DR: Buy a copy of Charles. Use WebPagetest. Test on lots of devices.**

## Charles

[Charles](http://www.charlesproxy.com/) is a powerful proxy application. Nearly all of the other tools below Charles can perform the same task in some shape or form. I use if for many things including proxying so I can test local environments on devices, redirecting assets so I can test local changes against a live site, but also to view and manipulate headers. Even so, I know I've only scratched the surface of what this app can do.

## Network Link Conditioner

[Network Link Conditioner](http://nshipster.com/network-link-conditioner/) is a system preference pane for OS X that lets you condition network traffic. It's fantastic for quickly testing against different network speeds.

It's worth noting that [Chrome DevTools can do network conditioning](https://developer.chrome.com/devtools/docs/device-mode#network-conditions) now, but it's nice to have this at the system level rather than just for on browser. Also: Charles can do this too.

## SPOF-O-Matic

SPOF-O-Matic is a [Chrome extesion](https://chrome.google.com/webstore/detail/spof-o-matic/plikhggfbplemddobondkeogomgoodeg) for testing single-points-of-failure on a page. The tool higlights any scripts that could potentially block your page from loading. This is fantastic tool to check that you are loading all your third-party scripts asynchronously. Oh, and It's written by the guy behind [webpagetest.org](http://www.webpagetest.org) so you know it's good.

WebPagetest provide a blackhole server, and the Chrome extension is essentially a wrapper around that so you can use that directly . Patrick Meenan has a [great blog post](http://blog.patrickmeenan.com/2011/10/testing-for-frontend-spof.html) about SPOF-testing if you want to learn more about this.

Oh, and guess what: Charles can do this too.

## Webpagetest.org

[WebPagetest](http://www.webpagetest.org) is an essential tool for measuring the effect of any performances updates you make as this will help you determine if those changes are actually improving the UX of your site. It will also make you sad that your website isn't as fast as you thought.

## Device Testing

This is not a single tool, buy seriously test on some devices. Testing across range of different devices is by far the best way to build resilient websites as you can see how much stuff breaks in a real-world use case. [Lara Hogan](http://larahogan.me/blog/) has a great article about how [Etsy built their device lab](https://codeascraft.com/2013/08/09/mobile-device-lab/) and it gives some great advice about choosing the most appropriate devices. You don't need a huge budget, testing on one or two devices is better than no testing.

## Test on the worst screen you can find

Building for resilience is as much about design as it is technology. don't just design for shiny new retina screens. Test on the crapiest monitor you can find, on the oldest browser you support. If your design and your still stands up there then you are doing OK.

## Wrap-up

Building resilient websites is hard, but there's a big payoff when it's done right. Hopefully some of these tools make the process that little bit better.

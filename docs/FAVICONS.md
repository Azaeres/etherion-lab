1. Locate your package: `./favicon_package_v0.16.zip`

2. Extract this package into the `public` folder (the root of your web site). If your site is http://www.example.com, you should be able to access a file named http://www.example.com/favicon.ico.

3. Insert the following code in the <head> section of your pages:

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
<meta name="msapplication-TileColor" content="#000000" />
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#171717" media="(prefers-color-scheme: dark)" />
```

4. Optional - Once your website is deployed, [Check your favicon](https://realfavicongenerator.net/favicon_checker)

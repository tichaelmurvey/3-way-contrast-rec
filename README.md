# Contrast Checker

Prerequisite: NodeJS v16

## 1. Bundle the javascript (using Rollup)

`contrastchecker.js` is now an auto-generated file, make changes in `index.js` and run the following command to update `contrastchecker.js`:

```
npm run rollup
```

This allows you to develop using the npm package ecosystem, but also include it in a .html file with:

```
<script src="contrastchecker.js"></script>
```

**Note**

You must use "ContrastChecker" as the namespace to use the functions, for example:

```
<button onclick="ContrastChecker.twoColorRec()" id="two-color-rec">
  Get recommendations
</button>
```

## 2. Serve the html

In your root directory, run:

```
npx serve .
```

## 3. Live reload while developing

In two terminals, run `npx serve .` and `npm run watch` at the same time - the `contrastchecker.js` bundle will update automatically as you make changes to `index.js`, all you need to do is refresh your browser to test the changes you just made to your app.

## 4. Running tests

``` 
npm run test
```

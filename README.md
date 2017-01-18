# Web Starter
Starter kit for web sites and web apps using. (gulp-rollup-vuejs)

## Tasks
#### Default / Development
```js
gulp
```

#### Dev (Watch)
Runs Default / Development task along with watch & browserSync.

```js
gulp dev
```

#### Build
By default build task will bump **patch** version in package.json
```js
gulp build
```

In order to bump **major** or **minor** version use following flags:
```js
gulp build --major
```
or
```js
gulp build --minor
```

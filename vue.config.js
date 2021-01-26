
const glob = require('glob')
const path = require('path')

const debug = process.env.WINDOW_ENV !== 'online'
const curBranch = process.env.BRANCH_ENV || 'deploy-test' //分支部署使用
const pubPathMap = {
  test: `//static-nginx-test.fbcontent.cn/h5/conan-zzactivity-misc/${curBranch}/`,
  online: '//static-nginx-online.fbcontent.cn/h5/conan-zzactivity-misc/'
}

function getCurPublicPath() {
  return pubPathMap[process.env.WINDOW_ENV] || './'
}

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

function getEntry(globPath) {
  let entries = {}
  glob.sync(globPath).forEach(function(entry) {
    var basename = path.basename(path.dirname(entry, path.extname(entry)))
    var temp = `./public/pages/${basename}.html`

    entries[basename] = {
      entry: entry,
      template: temp
    }
  })
  return entries
}

function getCurEntry() {
  if (process.env.WINDOW_ENV === 'dev') {
    const entries = require('./entry/entry.json')
    if (!entries.entry || entries.entry.length === 0) {
      return getEntry('./src/pages/*/*.js')
    } else {
      var reg = entries.entry.reduce((total, item) => {
        if (total === '') {
          return item
        } else {
          return total + `|${item}`
        }
      }, '')
      return getEntry(`./src/pages/?(${reg})/*.js`)
    }
  } else {
    return getEntry('./src/pages/*/*.js')
  }
}

const htmls = getCurEntry()

module.exports = {
  publicPath: getCurPublicPath(),
  assetsDir: 'static',
  pages: htmls,
  devServer: {
    open: true,
    host: 'local.yuanfudao.biz',
    port: 3000,
    https: false,
    hotOnly: false,
    progress: false,
    proxy: {
      '/api': {
        // target: 'http://ytk1.yuanfudao.ws/',
        target: 'http://conan.yuanfudao.biz/',
        changeOrigin: true
      }
    },
    before: () => {}
  },
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('src'),
        '@c': resolve('src/components'),
        vue$: 'vue/dist/vue.esm.js'
      }
    }
  },
  productionSourceMap: false
}
  
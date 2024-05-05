const { defineConfig } = require('@vue/cli-service')

const CopyWebpackPlugin=require("copy-webpack-plugin");
const path=require("path");

//复制文件到指定目录
const copyFiles=[
  {
    from:path.resolve("manifest.json"),
    to:`${path.resolve("dist")}/manifest.json`
  },
  {
    from:path.resolve("src/assets"),
    to:path.resolve("dist/assets")
  },
];

//复制插件
const plugins=[
  new CopyWebpackPlugin({
    patterns:copyFiles
  })
];

//页面文件
const pages={};
//配置popup.html页面
const chromeName=["popup"];

chromeName.forEach(name=>{
  pages[name]={
    entry:`src/${name}/main.js`,
    template:`src/${name}/index.html`,
    filename:`${name}.html`
  };
});


// module.exports = defineConfig({
//   transpileDependencies: true
// })

module.exports = {
  pages,
  productionSourceMap: false,
  // 配置 content.js background.js
  configureWebpack: {
    entry: {
      background: "./src/background/main.js"
    },
    output: {
      filename: "js/[name].js"
    },
    plugins
  },
  // 配置 content.css
  css: {
    extract: {
      filename: "css/[name].css"
    }
  }
}

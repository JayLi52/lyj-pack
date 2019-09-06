const path = require('path');
const fs = require('fs');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generator = require('@babel/generator').default;
const ejs = require('ejs');

// babylon 源码-ast
// @babel/traverse
// @babel/types
// @babel/generator
class Complier {
  constructor(config) {
    // entry output
    this.config = config;
    // 需要保存入口文件的路径
    this.entryId;
    // 需要保存所有模块的依赖
    this.modules = {};
    this.entry = config.entry;
    //可能输出多个文件
    this.assets = {};
    // 工作路径
    this.root = process.cwd();
  }

  run() {
    // 执行并创建模块的依赖关系
    this.buidlModule(path.resolve(this.root, this.entry), true);
    this.emitFile(); // 发射文件
  }
  // 构建模块
  buidlModule(modulePath, isEntry) {
    // 拿到模块的内容和模块的 ID
    let source = this.getSource(modulePath, isEntry);
    console.log('source', source)
    // 模块 id modulePath
    let moduleName = './' + path.relative(this.root, modulePath);

    // console.log(source, moduleName)
    // 解析 需要把 source 源码进行改造   返回一个依赖列表
    let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName));
    this.modules[moduleName] = sourceCode;
    dependencies.forEach(dep => {
      // 附模块加载
      this.buidlModule(path.join(this.root, dep), false);
    });
  }
  parse(source, parentPath) {
    // AST 解析语法树
    let ast = babylon.parse(source);
    let dependencies = []; //数组依赖
    traverse(ast, {
      // 调用表达式  a执行  require执行
      CallExpression(p) {
        let node = p.node; //对应的节点
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__';
          let moduleName = node.arguments[0].value;
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js');
          moduleName = './' + path.join(parentPath, moduleName); //'src/a.js'
          dependencies.push(moduleName);

          //节点替换
          node.arguments = [types.StringLiteral(moduleName)];
        }
      },
    });
    let sourceCode = generator(ast).code;
    return { sourceCode, dependencies };
  }
  emitFile() {
    // 发射文件
    //数据渲染
    //看的是webpack.config.js中的output
    let main = path.join(this.config.output.path, this.config.output.filename);
    //读取模板
    let templateStr = this.getSource(path.join(__dirname, 'template.ejs'));
    //渲染
    let code = ejs.render(templateStr, { entryId: this.entry, modules: this.modules });
    //拿到输出到哪个目录下
    //资源中 路径对应的代码
    this.assets[main] = code;
    fs.writeFileSync(main, this.assets[main]);
  }
  getSource(modulePath) {
    const rules = this.config.module.rules;
    let content = fs.readFileSync(modulePath, 'utf-8');
    rules.forEach(rule => {
      const { test, use } = rule;
      if (test.test(modulePath)) {
        content = use.reduceRight((acc, item) => {
          const loader = require(item);
          return loader(acc);
        }, content);
      }
    });

    return content;
  }
}

module.exports = Complier;

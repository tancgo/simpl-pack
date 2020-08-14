const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

const moduleAnalyser = (filename) => {
  // 读取入口文件
  const content = fs.readFileSync(filename, 'utf-8')

  const ast = parser.parse(content, {
    sourceType: "module" //babel官方规定必须加这个参数，不然无法识别ES Module
  })

  // 依赖数组
  const deps = {}

  // 遍历AST抽象语法树
  traverse(ast, {
    ImportDeclaration({ node }) {
      const { value } = node.source
      const dirname = path.posix.dirname(filename)
      const absPath = './' + path.posix.join(dirname, value)

      deps[value] = absPath
    }
  })

  // 将AST转换为浏览器可执行的代码
  const { code } = transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
  })

  return {
    filename, // 文件名
    deps, // 该文件所依赖的模块集合
    code // 转换后的代码
  }
}

const generateGraph = (entry) => {
  const entryModule = moduleAnalyser(entry)
  const graphArray = [entryModule]

  for (let i = 0; i < graphArray.length; i++) {
    const element = graphArray[i]
    const { deps } = element

    for (const key in deps) {
      if (deps.hasOwnProperty(key)) {
        // 讲入口文件的相关模块放入数组
        graphArray.push(moduleAnalyser(deps[key]));
      }
    }
  }

  // 生成依赖图
  const graph = {}
  graphArray.forEach(({ filename, deps, code }) => {
    graph[filename] = {
      deps,
      code
    }
  })

  console.log(graph);

  return graph
}

const generateBundle = (entry) => {
  const graph = JSON.stringify(generateGraph(entry))

  return `(function (graph) {
    // require函数是执行一个模块的代码，然后将相应变量挂载到exports对象上
    function require(module) {
      // deps: { './word.js': './src/word.js' }, 根据相对路径获取绝对路径
      function localRequire(relativePath) {
        return require(graph[module].deps[relativePath])
      }
      var exports = {};

      (function (require, exports, code) {
        eval(code);
      })(localRequire, exports, graph[module].code)
      
      return exports;
    }

    require('${entry}')
    
  })(${graph})`
}

const bundle = generateBundle('./src/index.js');

fs.mkdirSync('./dist')
fs.writeFileSync('./dist/bundle.js', bundle)


console.log(bundle);
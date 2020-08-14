(function (graph) {
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

    require('./src/index.js')
    
  })({"./src/index.js":{"deps":{"./message.js":"./src/message.js"},"code":"\"use strict\";\n\nvar _message = require(\"./message.js\");\n\nconsole.log((0, _message.say)());"},"./src/message.js":{"deps":{"./word.js":"./src/word.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.say = say;\n\nvar _word = require(\"./word.js\");\n\nfunction say() {\n  return \"hello \".concat(_word.word);\n}"},"./src/word.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.word = void 0;\nvar word = 'tancgo';\nexports.word = word;"}})
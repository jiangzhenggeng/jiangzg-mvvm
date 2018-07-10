import Watcher from './watcher'

export default class Complite {
  constructor (el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)

    if (this.$el) {
      this.$fragment = this.nodeFragment(this.$el)
      this.compileElement(this.$fragment)
      // 将文档碎片放回真实dom
      this.$el.appendChild(this.$fragment)
    }
  }

  nodeFragment (el) {
    let fragment = document.createDocumentFragment()
    let child

    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }

  compileElement (el) {
    let self = this
    let childNodes = el.childNodes;
    [].slice.call(childNodes).forEach(node => {
      let text = node.textContent
      let reg = /\{\{((?:.|\n)+?)\}\}/
      // 如果是element节点
      if (self.isElementNode(node)) {
        self.compile(node)
      }
// 如果是text节点
      else if (self.isTextNode(node) && reg.test(text)) {
        // 匹配第一个选项
        self.compileText(node, RegExp.$1.trim())
      }
// 解析子节点包含的指令
      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node)
      }
    })
  }

// 指令解析
  compile (node) {
    let nodeAttrs = node.attributes
    let self = this;

    [].slice.call(nodeAttrs).forEach(attr => {
      var attrName = attr.name
      if (self.isDirective(attrName)) {
        var exp = attr.value
        var dir = attrName.substring(2)
        // 事件指令
        if (self.isEventDirective(dir)) {
          compileUtil.eventHandler(node, self.$vm, exp, dir)
        }
        // 普通指令
        else {
          compileUtil[dir] && compileUtil[dir](node, self.$vm, exp)
        }

        node.removeAttribute(attrName)
      }
    })
  }

// {{ test }} 匹配变量 test
  compileText (node) {

    let vm = this.$vm
    let reg = /\{\{(.*?)\}\}/g
    let txt = node.textContent

    function replaceTxt (start) {
      node.textContent = txt.replace(reg, (matched, exp) => {

        if (start == 'start') {
          new Watcher(vm, exp, replaceTxt)   // 监听变化，进行匹配替换内容
        }
        return exp.split('.').reduce((val, key) => {
          return val[key.trim()]
        }, vm)
      })
    }

    // 替换
    replaceTxt('start')
  }

// element节点
  isElementNode (node) {
    return node.nodeType === 1
  }

// text纯文本
  isTextNode (node) {
    return node.nodeType === 3
  }

// x-XXX指令判定
  isDirective (attr) {
    return attr.indexOf('x-') === 0
  }

  // 事件指令判定
  isEventDirective (dir) {
    return dir.indexOf('on') === 0
  }
}

// 定义$elm，缓存当前执行input事件的input dom对象
let $elm
let timer = null
// 指令处理集合
const compileUtil = {
  html: function (node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },
  text: function (node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  class: function (node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },
  model: function (node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    let self = this
    let val = this._getVmVal(vm, exp)
    // 监听input事件
    node.addEventListener('input', function (e) {
      let newVal = e.target.value
      $elm = e.target
      if (val === newVal) {
        return
      }
      // 设置定时器  完成ui js的异步渲染
      clearTimeout(timer)
      timer = setTimeout(function () {
        self._setVmVal(vm, exp, newVal)
        val = newVal
      })
    })
  },
  bind: function (node, vm, exp, dir) {
    let updaterFn = updater[dir + 'Updater']

    updaterFn && updaterFn(node, this._getVmVal(vm, exp))
    new Watcher(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },
  // 事件处理
  eventHandler: function (node, vm, exp, dir) {
    let eventType = dir.split(':')[1]
    let fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  /**
   * [获取挂载在vm实例上的value]
   * @param  {[type]} vm  [mvvm实例]
   * @param  {[type]} exp [expression]
   */
  _getVmVal: function (vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(key => {
      key = key.trim()
      val = val[key]
    })
    return val
  },
  /**
   * [设置挂载在vm实例上的value值]
   * @param  {[type]} vm    [mvvm实例]
   * @param  {[type]} exp   [expression]
   * @param  {[type]} value [新值]
   */
  _setVmVal: function (vm, exp, value) {
    let exps = exp.split('.')

    exps.forEach((key, index) => {
      key = key.trim()
      if (index < exps.length - 1) {
        vm = vm[key]
      }
      else {
        vm[key] = value
      }
    })
  },
}
// 指令渲染集合
const updater = {
  htmlUpdater: function (node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value
  },
  textUpdater: function (node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },
  classUpdater: function () {},
  modelUpdater: function (node, value, oldValue) {
    // 不对当前操作input进行渲染操作
    if ($elm === node) {
      return false
    }
    $elm = undefined
    node.value = typeof value === 'undefined' ? '' : value
  },
}






















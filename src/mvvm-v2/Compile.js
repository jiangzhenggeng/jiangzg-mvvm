import Watcher from './watcher'

export function getFormatHtmlToJSON (fragmentDiv) {
  fragmentDiv = fragmentDiv.childNodes
  let nodeArray = []
  let nodeAttrs = {}
  for (var i = 0; i < fragmentDiv.length; i++) {
    nodeAttrs = getNodeAttrs(fragmentDiv[i])
    if (fragmentDiv[i].hasChildNodes() && fragmentDiv[i].nodeType == 1) {
      nodeAttrs.children = getFormatHtmlToJSON(fragmentDiv[i])
      nodeArray.push(nodeAttrs)
    } else {
      nodeArray.push(nodeAttrs)
    }
  }
  return nodeArray
}

export function getNodeAttrs (node) {
  let vnode = {}
  if (node.nodeType == 1) {
    vnode.name = node.tagName.toLowerCase()
    vnode.type = 'node'
    if (node.hasAttributes()) {
      vnode.attrs = {}
      let attrs = node.attributes
      for (let i = attrs.length - 1; i >= 0; i--) {
        vnode.attrs[attrs[i].name] = attrs[i].value || ''
      }
    }
  } else if (node.nodeType == 3) {
    vnode.type = 'text'
    vnode.text = node.nodeValue
  }
  return vnode
}

export default class Compile {
  constructor (el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      this.$fragment = this.nodeFragment(this.$el)
      this.vnode = getFormatHtmlToJSON(this.$fragment)
      let node = this.renderElement(this.vnode)
      this.$el.appendChild(node)
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

  renderElement (vnode) {
    let fragment = document.createDocumentFragment()

    vnode.forEach((node) => {
      if (node.type == 'text') {
        fragment.appendChild(this.compileText(node))
      } else if (node.type == 'node') {
        let tagNode = this.compile(node)
        if (node.children && node.children.length) {
          tagNode.appendChild(this.renderElement(node.children))
        }
        fragment.appendChild(tagNode)
      }
    })

    return fragment
  }

  compile (vnode) {
    let node = document.createElement(vnode.name)
    let attrs = vnode.attrs || {}
    Object.keys(attrs).forEach(attr => {
      if (this.isDirective(attr)) {
        let exp = attrs[attr]
        let dir = attr.substring(2)
        // 事件指令
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir)
        } else {// 普通指令
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
        }
      } else {
        node.setAttribute(attr, attrs[attr])
      }
    })

    return node
  }

  compileText (node) {
    let text = node.text
    let reg = /\{\{(?:(?:.|\n)+?)\}\}/g
    let vm = this.$vm
    let fragment = document.createDocumentFragment()

    let splitArray = text.split(reg) || []
    let matchArray = text.match(reg) || []

    let initBind = {}
    splitArray.forEach((itemText, index) => {
      fragment.appendChild(document.createTextNode(itemText))

      if (matchArray.length > index) {
        let textNode = document.createTextNode('')

        let replaceText = function () {
          let varName = matchArray[index].replace(/(^\{\{|\}\}$|\s+)/g, '')
          let value = vm
          if (!initBind[varName]) {
            new Watcher(vm, varName, function (newVal, oldVal) {
              replaceText()
            })
            initBind[varName] = true
          }
          varName.split('.').forEach(exp => {
            value = value[exp]
          })
          textNode.nodeValue = value
        }
        fragment.appendChild(textNode)
        replaceText()
      }

    })
    return fragment
  }

  isElementNode (node) {
    return node.nodeType === 1
  }

  isTextNode (node) {
    return node.nodeType === 3
  }

  isDirective (attr) {
    return attr.indexOf('x-') === 0
  }

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






















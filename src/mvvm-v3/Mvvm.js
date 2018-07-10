import { observer } from './Observer'
import Compile from './Compile'
import Watcher from './Watcher'
import AstToFunc from './AstToFunc'
import Patch from './Patch'
import VNode from './VNode'

export default class Mvvm extends Patch {
  constructor (options) {
    super(options)

    this.$options = options
    this._data = this.$options.data

    this.proxyData()
    this.initComputed()

    observer(this._data)

    let ast = new Compile(this.$options.template)

    this._renderVNodeFunction = new AstToFunc(ast)

    new Watcher(this, function () {
      this.render()
    }.bind(this))

  }

  render () {
    let VNode = this._renderVNodeFunction()
    this.patchVNode(this._VNode, VNode)
    this._VNode = VNode
  }

  proxyData () {
    let vm = this
    Object.keys(this._data).forEach(key => {
      Object.defineProperty(vm, key, {
        configurable: true,
        enumerable: false,
        get () {
          return vm._data[key]
        },
        set (newVal) {
          vm._data[key] = newVal
        },
      })
    })
  }

  initComputed () {
    let vm = this
    let computed = vm.$options.computed || {}
    Object.keys(computed).forEach(key => {
      Object.defineProperty(vm, key, {
        configurable: false,
        enumerable: false,
        get () {
          return typeof computed[key] === 'function'
            ? computed[key].call(vm)
            : computed[key].get
              ? computed[key].get.call(vm)
              : computed[key]
        },
        set (newVal) {
          if (computed[key].set) {
            computed[key].set.call(vm, newVal)
          } else {
            console.log('computed属性' + key + '没有设置setter')
          }
        },
      })
    })
  }

  _h (tag, options, children) {
    if (
      typeof tag === 'string' &&
      options == undefined &&
      children == undefined
    ) {
      // tag, attrs, children, text
      return new VNode(undefined, undefined, undefined, tag)
    } else {
      return new VNode(tag, (options || {}).attrs, children, undefined)
    }
  }

  _v (exps) {
    let value = this
    exps.split('.').forEach(exp => {
      try {
        value = this[exp]
      } catch (e) {
      }
    })
    return value
  }
}


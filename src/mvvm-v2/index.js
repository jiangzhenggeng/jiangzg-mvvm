import { observer } from './Observer'
import Compile from './Compile'
import Dep from './Dep'

export default class Mvvm {
  constructor (options) {
    this.$options = options
    this._data = this.$options.data

    this.proxyData()
    this.initComputed()

    observer(this._data)

    if (options.el) {
      new Compile(options.el, this)
    }

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

}

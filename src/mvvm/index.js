import observer from './observe'
import Complite from './complite'

export default class Mvvm {
  constructor (options) {
    this.$options = options
    let data = this._data = options.data

    let vm = this

    observer(data, this)
    Object.keys(data).forEach(key => {
      Object.defineProperty(vm, key, {
        configurable: false,
        enumerable: true,
        get () {
          return vm._data[key]
        },
        set (val) {
          vm._data[key] = val
        },
      })
    })

    new Complite(options.el || document.body, this)

  }
}

import Dep from './Dep'

export default class Watcher {
  constructor (vm, exp, cb) {
    this.vm = vm
    this.exp = exp
    this.cb = cb
    Dep.target = this
    this.value = undefined
    this.value = this.get()
    Dep.target = null
  }

  get () {
    let value = this.vm
    if (typeof this.exp === 'string') {
      this.exp.split('.').forEach(exp => {
        value = value[exp]
      })
    } else if (typeof this.exp === 'function') {
      value = this.exp.call(this, this.value)
    }
    return value
  }

  update () {
    let val = this.get()
    if (val !== this.value) {
      this.cb.call(this.vm, val, this.value)
      this.value = val
    }

  }
}

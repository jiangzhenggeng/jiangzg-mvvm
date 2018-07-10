import Dep from './dep'

export default class Watcher {
  constructor (vm, exp, cb) {
    this.vm = vm
    this.exp = exp
    this.cb = cb
    Dep.target = this
    this.value = this.get()
    Dep.target = null
  }

  get () {
    let val = this.vm[this.exp]
    return val
  }

  update () {

    let val = this.get()
    if (val !== this.value) {
      this.cb.call(this.vm, val, this.value)
    }

  }
}

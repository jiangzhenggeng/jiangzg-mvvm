import Dep from './Dep'

export function observer (data) {
  if (!data || typeof data !== 'object') {
    return
  }
  let ob = data.__ob__
  if (!ob) {
    ob = new Observer(data)
    Object.defineProperty(data, '__ob__', {
      value: ob,
      enumerable: false,
      writable: true,
      configurable: true,
    })
  }
  return ob
}

export default class Observer {

  constructor (data) {
    this.dep = new Dep()
    Object.keys(data).forEach((key) => {
      this.observerProperty(data, key, data[key])
    })
  }

  observerProperty (obj, key, val) {
    let dep = new Dep()
    let childOb = observer(val)
    Object.defineProperty(obj, key, {
      get () {
        if (Dep.target) {
          dep.addSub(Dep.target)
          if (childOb) {
            childOb.dep.addSub(Dep.target)
          }
        }
        return val
      },
      set (newVal) {
        if (val === newVal || (newVal !== newVal && val !== val)) {
          return ''
        }
        val = newVal
        childOb = observer(newVal)
        dep.notify()
      },
    })
  }
}










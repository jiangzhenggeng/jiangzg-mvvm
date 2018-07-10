import Dep from './dep'

export default function observer (data) {
  if (!data || typeof data !== 'object') {
    return ''
  }
  return new Observer(data)
}

class Observer {
  constructor (data) {
    Object.keys(data).forEach((key) => {
      this.observerProperty(data, key, data[key])
    })
  }

  observerProperty (obj, key, val) {
    let dep = new Dep()
    observer(val)
    Object.defineProperty(obj, key, {
      get () {
        if (Dep.target) {
          dep.addSub(Dep.target)
        }
        return val
      },
      set (newVal) {
        if (val === newVal || (newVal !== newVal && val !== val)) {
          return ''
        }
        val = newVal
        observer(newVal)
        dep.notify()
      },
    })
  }
}










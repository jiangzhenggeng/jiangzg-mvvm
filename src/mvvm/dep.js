import Watcher from './watcher'

export default class Dep {
  static target = null

  constructor () {
    this.subs = []
  }

  notify () {
    console.log(this.subs)
    this.subs.forEach((watcher) => {
      watcher.update()
    })
  }

  addSub (sub) {
    this.subs.push(sub)
  }

}



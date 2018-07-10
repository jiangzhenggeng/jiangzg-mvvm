export default class Dep {
  static target = null

  constructor () {
    this.subs = []
  }

  notify () {
    this.subs.forEach((watcher) => {
      watcher.update()
    })
  }

  addSub (sub) {
    this.subs.push(sub)
  }

}



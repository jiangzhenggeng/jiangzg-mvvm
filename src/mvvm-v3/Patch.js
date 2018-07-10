import Render from './Render'

export default class Patch {
  constructor (options) {
    this.el = document.querySelector(options.el)
  }

  patchVNode (prevVnode, vnode) {
    if (!prevVnode) {
      this.createElement(vnode)
    } else {
      this.diffVNode(prevVnode, vnode)
    }
    return vnode
  }

  createElement (vnode) {
    this.el.appendChild(new Render(vnode).fragment)
  }

  // diff算法实现
  diffVNode (prevVnode, vnode) {
    this.el.innerHTML = ''
    this.el.appendChild(new Render(vnode).fragment)
  }
}
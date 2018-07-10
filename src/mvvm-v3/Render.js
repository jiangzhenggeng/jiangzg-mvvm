export default class Render {
  constructor (vnode) {
    this.fragment = this.renderElement([vnode])
  }

  renderElement (vnode) {
    let fragment = document.createDocumentFragment()
    vnode.forEach((node) => {
      if (node.tag) {
        let tagNode = document.createElement(node.tag)
        let attrs = node.attrs || {}

        Object.keys(attrs).forEach(attr => {
          tagNode.setAttribute(attr, attrs[attr])
        })

        if (node.children && node.children.length) {
          tagNode.appendChild(this.renderElement(node.children))
        }
        fragment.appendChild(tagNode)
        node.elm = tagNode
      } else {
        let textNode = document.createTextNode(node.text)
        fragment.appendChild(textNode)
        node.elm = textNode
      }
    })
    return fragment
  }
}






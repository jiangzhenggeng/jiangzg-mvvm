export default class Compile {
  constructor (template) {
    let div = document.createElement('div')
    div.innerHTML = template
    let fragment = document.createDocumentFragment()
    fragment.appendChild(div)
    let ast = this.getFormatHtmlToJSON(fragment) || []
    return ast
  }

  getFormatHtmlToJSON (fragmentDiv) {
    fragmentDiv = fragmentDiv.childNodes
    let nodeArray = []
    let nodeAttrs = {}
    for (var i = 0; i < fragmentDiv.length; i++) {
      nodeAttrs = this.getNodeAttrs(fragmentDiv[i])
      if (fragmentDiv[i].hasChildNodes() && fragmentDiv[i].nodeType == 1) {
        nodeAttrs.children = this.getFormatHtmlToJSON(fragmentDiv[i])
        nodeArray.push(nodeAttrs)
      } else {
        nodeArray.push(nodeAttrs)
      }
    }
    return nodeArray
  }

  getNodeAttrs (node) {
    let vnode = {}
    if (node.nodeType == 1) {
      vnode.name = node.tagName.toLowerCase()
      vnode.type = 'node'
      if (node.hasAttributes()) {
        vnode.attrs = {}
        let attrs = node.attributes
        for (let i = attrs.length - 1; i >= 0; i--) {
          vnode.attrs[attrs[i].name] = attrs[i].value || ''
        }
      }
    } else if (node.nodeType == 3) {

      let text = node.nodeValue
      let reg = /\{\{(?:(?:.|\n)+?)\}\}/g

      let splitArray = text.split(reg) || []
      let matchArray = text.match(reg) || []
      let children = []

      splitArray.forEach((itemText, index) => {
        children.push({
          type: 'static',
          value: itemText,
        })
        if (matchArray.length > index) {
          let varName = matchArray[index].replace(/(^\{\{|\}\}$|\s+)/g, '')
          children.push({
            type: 'dynamic',
            value: varName,
          })
        }
      })

      vnode.type = 'text'
      vnode.children = children
    }
    return vnode
  }
}
























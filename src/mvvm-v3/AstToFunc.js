export default class AstToFunc {

  constructor (ast) {
    let code = 'with (this){\n return '
    code += this.compileToFunctions(ast).join(',')
    code += '\n}'
    let templateFunction = new Function(`${code}`)
    return templateFunction
  }

  compileToFunctions (ast, first = true) {
    let code = []
    ast.forEach((node) => {
      if (node.type == 'text') {
        code.push(this.compileText(node))
      } else if (node.type == 'node') {
        code.push(this.compileNode(node))
      }
    })
    return code
  }

  compileNode (vnode) {
    let code = ''
    code += `_h('${vnode.name}',{`

    let attrs = vnode.attrs || {}
    if (Object.keys(attrs).length) {
      code += `attrs:{`
      Object.keys(attrs).forEach(attr => {
        code += `'${attr}':'${attrs[attr]}',`
      })
      code += `}`
    }

    code += `}`

    if (vnode.children && vnode.children.length) {
      code += `,[${this.compileToFunctions(vnode.children, false).join(',')}]`
    }

    code += `)`
    return code

  }

  compileText (vnode) {
    let code = []
    vnode.children.forEach((itemText) => {
      if (itemText.type == 'static') {
        code.push(`_h('${itemText.value.replace('\n', '\\n')}')`)
      } else if (itemText.type == 'dynamic') {
        code.push(`_h(_v('${itemText.value}'))`)
      }
    })
    return code.join(',')
  }
}
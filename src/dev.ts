import MindElixir, { E } from './index'
import MindElixirLite from './index.lite'
import { exportSvg, exportPng } from '../painter/index'
import example from './exampleData/1.cn'
import example2 from './exampleData/2'

interface Window {
  currentOperation: any
  m: any
  M: any
  E: any
  exportSvg: any
  exportPng: any
}

declare let window: Window

const options = {
  el: '#map',
  newTopicName: '子节点',
  direction: MindElixir.LEFT,
  draggable: true, // default true
  contextMenu: true, // default true
  toolBar: true, // default true
  nodeMenu: true, // default true
  keypress: true, // default true
  locale: 'zh_CN', // [zh_CN,zh_TW,en,ja,pt] waiting for PRs
  overflowHidden: false, // default false
  primaryLinkStyle: 1, // [1,2] default 1
  primaryNodeVerticalGap: 25, // default 25
  primaryNodeHorizontalGap: 65, // default 65
  mobileMenu: true, // default false
  contextMenuOption: {
    focus: true,
    link: true,
    extend: [
      {
        name: 'Node edit',
        onclick: () => {
          alert('extend menu')
        },
      },
    ],
  },
  allowUndo: true,
  before: {
    insertSibling(el, obj) {
      return true
    },
    async addChild(el, obj) {
      await sleep()
      return true
    },
  },
}

const mind = new (MindElixir as any)(options)

mind.init(example) // or try `example`
function sleep() {
  return new Promise<void>((res, rej) => {
    setTimeout(() => res(), 1000)
  })
}
console.log('test E function', E('bd4313fbac40284b'))
const mind2 = new (MindElixirLite as any)({
  el: document.querySelector('#map2'),
  direction: 2,
  draggable: false,
  // overflowHidden: true,
  nodeMenu: true,
})
mind2.init(example2)
window.currentOperation = null
mind.bus.addListener('operation', operation => {
  console.log(operation, mind.getAllData())
  if (operation.name !== 'finishEdit') window.currentOperation = operation
  // return {
  //   name: action name,
  //   obj: target object
  // }

  // name: [insertSibling|addChild|removeNode|beginEdit|finishEdit]
  // obj: target

  // name: moveNode
  // obj: {from:target1,to:target2}
})
mind.bus.addListener('selectNode', node => {
  console.log(node)
})
mind.bus.addListener('expandNode', node => {
  console.log('expandNode: ', node)
})
window.m = mind
// window.m2 = mind2
window.M = MindElixir
window.E = MindElixir.E
window.exportSvg = exportSvg
window.exportPng = exportPng

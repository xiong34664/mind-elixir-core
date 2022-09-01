import { LEFT, RIGHT, SIDE } from './const'
import {
  isMobile,
  addParentLink,
  getObjById,
  generateUUID,
  generateNewObj,
} from './utils/index'
import { findEle, createInputDiv, layout, Topic, createChildren, createGroup, createTop, createTopic } from './utils/dom'
import { createLinkSvg, createLine } from './utils/svg'
import {
  selectNode,
  unselectNode,
  selectNextSibling,
  selectPrevSibling,
  selectFirstChild,
  selectParent,
  getAllDataString,
  getAllData,
  getAllDataMd,
  scale,
  toCenter,
  focusNode,
  cancelFocus,
  initLeft,
  initRight,
  initSide,
  setLinkStyle,
  setLocale,
  enableEdit,
  disableEdit,
  expandNode,
  refresh,
} from './interact'
import {
  insertSibling,
  insertBefore,
  insertParent,
  addChild,
  copyNode,
  moveNode,
  removeNode,
  moveUpNode,
  moveDownNode,
  beginEdit,
  updateNodeStyle,
  updateNodeTags,
  updateNodeIcons,
  updateNodeHyperLink,
  processPrimaryNode,
  setNodeTopic,
  moveNodeBefore,
  moveNodeAfter,
} from './nodeOperation'
import {
  createLink,
  removeLink,
  selectLink,
  hideLinkController,
  showLinkController,
} from './customLink'
import linkDiv from './linkDiv'
import initMouseEvent from './mouse'

import contextMenu from './plugin/contextMenu'
import toolBar from './plugin/toolBar'
import nodeMenu from './plugin/nodeMenu'
import nodeDraggable from './plugin/nodeDraggable'
import keypress from './plugin/keypress'
import mobileMenu from './plugin/mobileMenu'

import Bus from './utils/pubsub'

import './index.less'
import './iconfont/iconfont.js'

// TODO show up animation

/**
 * @function
 * @global
 * @name E
 * @param {string} id Node id.
 * @return {TargetElement} Target element.
 * @example
 * E('bd4313fbac40284b')
 */
export const E = findEle
type LinkObj = object
type operation = {
  name: string
}
export interface NodeObj {
  topic: string
  id: string
  style?: {
    fontSize?: string
    color?: string
    background?: string
    fontWeight?: string
    textDecoration?: string
    fontStyle?: string
  }
  parent?: NodeObj
  children?: NodeObj[]
  tags?: string[]
  icons?: string[]
  hyperLink?: string
  expanded?: boolean
  direction?: number
  root?: boolean
}

export interface NodeElement extends HTMLElement {
  nodeObj: NodeObj
}
export interface MindElixirData {
  nodeData: NodeObj,
  linkData?: LinkObj
}
export interface MindElixirInstance {
  mindElixirBox: HTMLElement,
  nodeData: NodeObj,
  linkData: LinkObj,
  currentNode: Topic | null,
  currentLink: SVGElement | null,
  inputDiv: HTMLElement | null,
  scaleVal: number,
  tempDirection: number | null,
  bus: object, // wip

  // wip
  history: operation[],
  isUndo: boolean,
  undo: () => void,

  future: operation[]
  redo: () => void

  direction: number,
  locale: string,
  draggable: boolean,
  editable: boolean,
  contextMenu: boolean,
  contextMenuOption: object,
  toolBar: boolean,
  nodeMenu: boolean,
  keypress: boolean,
  before: object,
  newTopicName: string,
  allowUndo: boolean,
  overflowHidden: boolean,
  primaryLinkStyle: number,
  primaryNodeHorizontalGap: number,
  primaryNodeVerticalGap: number,
  mobileMenu: boolean,

  container: HTMLElement,
  map: HTMLElement,
  root: HTMLElement,
  box: HTMLElement,
  svg2nd: SVGElement,
  linkController:SVGElement,
  P2: HTMLElement,
  P3: HTMLElement,
  line1:SVGElement,
  line2:SVGElement,
  linkSvgGroup:SVGElement,
}
export interface Options {
  el: string | Element,
  data: MindElixirData,
  direction?: number,
  locale?: string,
  draggable?: boolean,
  editable?: boolean,
  contextMenu?: boolean,
  contextMenuOption?: object,
  toolBar?: boolean,
  nodeMenu?: boolean,
  keypress?: boolean,
  before?: object,
  newTopicName?: string,
  allowUndo?: boolean,
  overflowHidden?: boolean,
  primaryLinkStyle?: number,
  primaryNodeHorizontalGap?: number,
  primaryNodeVerticalGap?: number,
  mobileMenu?: boolean,
}
const $d = document
/**
 * @export MindElixir
 * @example
 * let mind = new MindElixir({
  el: '#map',
  direction: 2,
  data: data,
  draggable: true,
  editable: true,
  contextMenu: true,
  toolBar: true,
  nodeMenu: true,
  keypress: true,
})
mind.init()
 *
 */
function MindElixir(this: MindElixirInstance, {
  el,
  direction,
  locale,
  draggable,
  editable,
  contextMenu,
  contextMenuOption,
  toolBar,
  nodeMenu,
  keypress,
  before,
  newTopicName,
  allowUndo,
  primaryLinkStyle,
  overflowHidden,
  primaryNodeHorizontalGap,
  primaryNodeVerticalGap,
  mobileMenu,
}: Options) {
  console.log('ME_version ' + MindElixir.version, this)
  let box
  const elType = Object.prototype.toString.call(el)
  if (elType === '[object HTMLDivElement]') {
    box = el as HTMLElement
  } else if (elType === '[object String]') {
    box = document.querySelector(el as string) as HTMLElement
  }
  if (!box) return new Error('MindElixir: el is not a valid element')
  this.mindElixirBox = box
  this.before = before || {}
  this.locale = locale
  this.contextMenuOption = contextMenuOption
  this.contextMenu = contextMenu === undefined ? true : contextMenu
  this.toolBar = toolBar === undefined ? true : toolBar
  this.nodeMenu = nodeMenu === undefined ? true : nodeMenu
  this.keypress = keypress === undefined ? true : keypress
  this.mobileMenu = mobileMenu
  // record the direction before enter focus mode, must true in focus mode, reset to null after exit focus
  // todo move direction to data
  this.direction = typeof direction === 'number' ? direction : 1
  this.draggable = draggable === undefined ? true : draggable
  this.newTopicName = newTopicName
  this.editable = editable === undefined ? true : editable
  this.allowUndo = allowUndo === undefined ? true : allowUndo
  // this.parentMap = {} // deal with large amount of nodes
  this.currentNode = null // the selected <tpc/> element
  this.currentLink = null // the selected link svg element
  this.inputDiv = null // editor
  this.scaleVal = 1
  this.tempDirection = null
  this.primaryLinkStyle = primaryLinkStyle || 0
  this.overflowHidden = overflowHidden
  this.primaryNodeHorizontalGap = primaryNodeHorizontalGap
  this.primaryNodeVerticalGap = primaryNodeVerticalGap

  this.bus = new Bus()
  ;(this.bus as any).addListener('operation', (operation: operation) => {
    if (this.isUndo) {
      this.isUndo = false
      return
    }
    if (['moveNode', 'moveNodeBefore', 'moveNodeAfter', 'removeNode', 'addChild', 'finishEdit', 'editStyle', 'editTags', 'editIcons', 'insertSibling', 'copyNode'].includes(
      operation.name
    )) {
      this.future = []
      this.history.push(operation)
      // console.log(operation, this.history)
    }
  })

  this.history = [] // TODO
  this.isUndo = false
  this.undo = function() {
    const operation = this.history.pop()
    if (!operation) return
    this.future.push(operation)
    this.isUndo = true
    if (operation.name === 'moveNode') {
      this.moveNode(E(operation.obj.fromObj.id), E(operation.obj.originParentId))
    } if (operation.name === 'moveNodeBefore') {
      this.moveNodeAfter(E(operation.obj.fromObj.id), E(operation.obj.toObj.id))
    } if (operation.name === 'moveNodeAfter') {
      this.moveNodeBefore(E(operation.obj.fromObj.id), E(operation.obj.toObj.id))
    } else if (operation.name === 'removeNode') {
      if (operation.originSiblingId) {
        this.insertBefore(E(operation.originSiblingId), operation.obj)
      } else {
        this.addChild(E(operation.originParentId), operation.obj)
      }
    } else if (['addChild', 'copyNode', 'insertSibling'].includes(operation.name)) {
      this.removeNode(E(operation.obj.id))
    } else if (operation.name === 'finishEdit') {
      this.setNodeTopic(E(operation.obj.id), operation.origin)
    } else {
      this.isUndo = false
    }
  }
  this.future = [] // TODO
  this.redo = function() {
    const operation = this.future.pop()
    if (!operation) return
    this.history.push(operation)

    this.isUndo = true
    if (operation.name === 'moveNode') {
      this.moveNode(E(operation.obj.fromObj.id), E(operation.obj.originParentId))
    } if (operation.name === 'moveNodeBefore') {
      this.moveNodeBefore(E(operation.obj.fromObj.id), E(operation.obj.toObj.id))
    } if (operation.name === 'moveNodeAfter') {
      this.moveNodeAfter(E(operation.obj.fromObj.id), E(operation.obj.toObj.id))
    } else if (operation.name === 'removeNode') {
      this.removeNode(E(operation.obj.id))
    } else if (['addChild', 'copyNode', 'insertSibling'].includes(operation.name)) {
      if (operation.originSiblingId) {
        this.insertSibling(E(operation.originSiblingId), operation.obj)
      } else {
        this.addChild(E(operation.originParentId), operation.obj)
      }
    } else if (operation.name === 'finishEdit') {
      this.setNodeTopic(E(operation.obj.id), operation.origin)
    } else {
      this.isUndo = false
    }
  }

  this.mindElixirBox.className += ' mind-elixir'
  this.mindElixirBox.innerHTML = ''

  this.container = $d.createElement('div') // map container
  this.container.className = 'map-container'

  this.map = $d.createElement('div') // map-canvas Element
  this.map.className = 'map-canvas'
  this.map.setAttribute('tabindex', '0')
  this.container.appendChild(this.map)
  this.mindElixirBox.appendChild(this.container)
  this.root = $d.createElement('root')

  this.box = $d.createElement('children')
  this.box.className = 'box'

  // infrastructure

  this.svg2nd = createLinkSvg('svg2nd') // main link container

  this.linkController = createLinkSvg('linkcontroller') // bezier controller container
  this.P2 = $d.createElement('div') // bezier P2
  this.P3 = $d.createElement('div') // bezier P3
  this.P2.className = this.P3.className = 'circle'
  this.line1 = createLine(0, 0, 0, 0) // bezier auxiliary line1
  this.line2 = createLine(0, 0, 0, 0) // bezier auxiliary line2
  this.linkController.appendChild(this.line1)
  this.linkController.appendChild(this.line2)

  this.linkSvgGroup = createLinkSvg('topiclinks') // storage user custom link svg

  this.map.appendChild(this.root)
  this.map.appendChild(this.box)
  this.map.appendChild(this.svg2nd)
  this.map.appendChild(this.linkController)
  this.map.appendChild(this.linkSvgGroup)
  this.map.appendChild(this.P2)
  this.map.appendChild(this.P3)

  if (this.overflowHidden) {
    this.container.style.overflow = 'hidden'
  } else initMouseEvent(this)
}

function beforeHook(fn:(el:any, node?:any)=>void) {
  return async function(...args:unknown[]) {
    if (
      !this.before[fn.name] ||
      (await this.before[fn.name].apply(this, args))
    ) {
      fn.apply(this, args)
    }
  }
}

MindElixir.prototype = {
  addParentLink,
  getObjById,
  generateNewObj,
  // node operation
  insertSibling: beforeHook(insertSibling),
  insertBefore: beforeHook(insertBefore),
  insertParent: beforeHook(insertParent),
  addChild: beforeHook(addChild),
  copyNode: beforeHook(copyNode),
  moveNode: beforeHook(moveNode),
  removeNode: beforeHook(removeNode),
  moveUpNode: beforeHook(moveUpNode),
  moveDownNode: beforeHook(moveDownNode),
  beginEdit: beforeHook(beginEdit),
  moveNodeBefore: beforeHook(moveNodeBefore),
  moveNodeAfter: beforeHook(moveNodeAfter),
  updateNodeStyle,
  updateNodeTags,
  updateNodeIcons,
  updateNodeHyperLink,
  processPrimaryNode,
  setNodeTopic,

  createLink,
  removeLink,
  selectLink,
  hideLinkController,
  showLinkController,

  layout,
  linkDiv,
  createInputDiv,

  createChildren, createGroup, createTop, createTopic,

  selectNode,
  unselectNode,
  selectNextSibling,
  selectPrevSibling,
  selectFirstChild,
  selectParent,
  getAllDataString,
  getAllData,
  getAllDataMd,
  scale,
  toCenter,
  focusNode,
  cancelFocus,
  initLeft,
  initRight,
  initSide,
  setLinkStyle,
  setLocale,
  enableEdit,
  disableEdit,
  expandNode,
  refresh,
  install(plugin) {
    plugin(this)
  },
  init(data:MindElixirData) {
    if (!data || !data.nodeData) return new Error('MindElixir: `data` is required')
    this.nodeData = data.nodeData
    this.linkData = data.linkData || {}
    // plugin
    this.toolBar && toolBar(this)
    this.nodeMenu && nodeMenu(this)
    this.keypress && keypress(this)

    if (isMobile() && this.mobileMenu) {
      mobileMenu(this)
    } else {
      this.contextMenu && contextMenu(this, this.contextMenuOption)
    }
    this.draggable && nodeDraggable(this)

    addParentLink(this.nodeData)
    this.toCenter()
    this.layout()
    this.linkDiv()
  },
}

MindElixir.LEFT = LEFT
MindElixir.RIGHT = RIGHT
MindElixir.SIDE = SIDE
/**
 * @memberof MindElixir
 * @static
 */
MindElixir.version = '1.0.0'
MindElixir.E = findEle

/**
 * @function new
 * @memberof MindElixir
 * @static
 * @param {String} topic root topic
 */
MindElixir.new = (topic: string): MindElixirData => ({
  nodeData: {
    id: generateUUID(),
    topic: topic || 'new topic',
    root: true,
    children: [],
  },
  linkData: {},
})

export default MindElixir

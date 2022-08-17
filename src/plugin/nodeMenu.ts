import './nodeMenu.less'
import i18n from '../i18n'

const createDiv = (id, innerHTML) => {
  const div = document.createElement('div')
  div.id = id
  div.innerHTML = innerHTML
  return div
}

const colorList = [
  '#2c3e50',
  '#34495e',
  '#7f8c8d',
  '#94a5a6',
  '#bdc3c7',
  '#ecf0f1',
  '#8e44ad',
  '#9b59b6',
  '#2980b9',
  '#3298db',
  '#c0392c',
  '#e74c3c',
  '#d35400',
  '#f39c11',
  '#f1c40e',
  '#17a085',
  '#27ae61',
  '#2ecc71',
]

export default function(mind) {
  function clearSelect(klass, remove) {
    var elems = mind.container.querySelectorAll(klass)
    ;[].forEach.call(elems, function(el) {
      el.classList.remove(remove)
    })
  }

  // create element
  const locale = i18n[mind.locale] ? mind.locale : 'en'
  const styleDiv = createDiv('nm-style', `
  <div class="nm-fontsize-container">
    ${['15', '24', '32']
    .map(size => {
      return `<div class="size"  data-size="${size}">
    <svg class="icon" style="width: ${size}px;height: ${size}px" aria-hidden="true">
      <use xlink:href="#icon-a"></use>
    </svg></div>`
    })
    .join('')}
  </div>
  <div class="nm-fontsize-container">
    ${['underline', 'line-through']
    .map(type => {
      return `<div class="text-decoration"  data-type="${type}">
    <svg class="icon" style="width: 18px;height: 18px" aria-hidden="true">
      <use xlink:href="#icon-${type}"></use>
    </svg></div>`
    })
    .join('')}
    <div class="bold">
      <svg class="icon" style="width: 18px;height: 18px" aria-hidden="true">
        <use xlink:href="#icon-B"></use>
      </svg>
    </div>
    <div class="font-style">
      <svg class="icon" style="width: 18px;height: 18px" aria-hidden="true">
        <use xlink:href="#icon-italic"></use>
      </svg>
    </div>
  </div>
  <div class="nm-fontcolor-container">
    ${colorList
    .map(color => {
      return `<div class="split6"><div class="palette" data-color="${color}" style="background-color: ${color};"></div></div>`
    })
    .join('')}
  </div>
  <div class="bof">
  <span class="font">${i18n[locale].font}</span>
  <span class="background">${i18n[locale].background}</span>
  </div>`)
  const tagDiv = createDiv('nm-tag', `${i18n[locale].tag}<input class="nm-tag" tabindex="-1" placeholder="${i18n[locale].tagsSeparate}" />`)
  const iconDiv = createDiv('nm-icon', `${i18n[locale].icon}<input class="nm-icon" tabindex="-1" placeholder="${i18n[locale].iconsSeparate}" />`)
  const urlDiv = createDiv('nm-url', `${i18n[locale].url}<input class="nm-url" tabindex="-1" />`)
  // const memoDiv = createDiv('nm-memo', `${i18n[locale].memo || 'Memo'}<textarea class="nm-memo" rows="5" tabindex="-1" />`)

  // create container
  const menuContainer = document.createElement('nmenu')
  menuContainer.innerHTML = `
  <div class="button-container"><svg class="icon" aria-hidden="true">
  <use xlink:href="#icon-close"></use>
  </svg></div>
  `
  menuContainer.appendChild(styleDiv)
  menuContainer.appendChild(tagDiv)
  menuContainer.appendChild(iconDiv)
  menuContainer.appendChild(urlDiv)
  // menuContainer.appendChild(memoDiv)
  menuContainer.hidden = true
  mind.container.append(menuContainer)

  // query input element
  const sizeSelector = menuContainer.querySelectorAll('.size')
  const textDecoration = menuContainer.querySelectorAll('.text-decoration')
  const fontStyle:HTMLElement = menuContainer.querySelector('.font-style')
  const bold:HTMLElement = menuContainer.querySelector('.bold')
  const buttonContainer:HTMLElement = menuContainer.querySelector('.button-container')
  const fontBtn:HTMLElement = menuContainer.querySelector('.font')
  const tagInput:HTMLInputElement = mind.container.querySelector('.nm-tag')
  const iconInput:HTMLInputElement = mind.container.querySelector('.nm-icon')
  const urlInput:HTMLInputElement = mind.container.querySelector('.nm-url')
  // const memoInput:HTMLInputElement = mind.container.querySelector('.nm-memo')

  // handle input and button click
  let bgOrFont
  menuContainer.onclick = e => {
    if (!mind.currentNode) return
    const nodeObj = mind.currentNode.nodeObj
    const target = e.target as HTMLElement
    if (target.className === 'palette') {
      if (!nodeObj.style) nodeObj.style = {}
      clearSelect('.palette', 'nmenu-selected')
      target.className = 'palette nmenu-selected'
      if (bgOrFont === 'font') {
        nodeObj.style.color = target.dataset.color
      } else if (bgOrFont === 'background') {
        nodeObj.style.background = target.dataset.color
      }
      mind.updateNodeStyle(nodeObj)
    } else if (target.className === 'background') {
      clearSelect('.palette', 'nmenu-selected')
      bgOrFont = 'background'
      target.className = 'background selected'
      target.previousElementSibling.className = 'font'
      if (nodeObj.style && nodeObj.style.background) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.background + '"]'
        ).className = 'palette nmenu-selected'
      }
    } else if (target.className === 'font') {
      clearSelect('.palette', 'nmenu-selected')
      bgOrFont = 'font'
      target.className = 'font selected'
      target.nextElementSibling.className = 'background'
      if (nodeObj.style && nodeObj.style.color) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.color + '"]'
        ).className = 'palette nmenu-selected'
      }
    }
  }
  Array.from(sizeSelector).map(
    dom => {
      (dom as HTMLElement).onclick = e => {
        if (!mind.currentNode.nodeObj.style) mind.currentNode.nodeObj.style = {}
        clearSelect('.size', 'size-selected')
        const size = e.currentTarget as HTMLElement
        mind.currentNode.nodeObj.style.fontSize = size.dataset.size
        size.className = 'size size-selected'
        mind.updateNodeStyle(mind.currentNode.nodeObj)
      }
    }
  )
  Array.from(textDecoration).map(
    dom => {
      (dom as HTMLElement).onclick = e => {
        if (!mind.currentNode.nodeObj.style) mind.currentNode.nodeObj.style = {}
        clearSelect('.text-decoration', 'size-selected')
        const text = e.currentTarget as HTMLElement
        if (mind.currentNode.nodeObj.style.textDecoration === text.dataset.type) {
          delete mind.currentNode.nodeObj.style.textDecoration
        } else {
          mind.currentNode.nodeObj.style.textDecoration = text.dataset.type
          text.className = 'text-decoration size-selected'
        }
        mind.updateNodeStyle(mind.currentNode.nodeObj)
      }
    }
  )
  bold.onclick = (e:MouseEvent & { currentTarget: Element}) => {
    if (!mind.currentNode.nodeObj.style) mind.currentNode.nodeObj.style = {}
    if (mind.currentNode.nodeObj.style.fontWeight === 'bold') {
      delete mind.currentNode.nodeObj.style.fontWeight
      e.currentTarget.className = 'bold'
      mind.updateNodeStyle(mind.currentNode.nodeObj)
    } else {
      mind.currentNode.nodeObj.style.fontWeight = 'bold'
      e.currentTarget.className = 'bold size-selected'
      mind.updateNodeStyle(mind.currentNode.nodeObj)
    }
  }
  fontStyle.onclick = (e: MouseEvent & { currentTarget: Element }) => {
    if (!mind.currentNode.nodeObj.style) mind.currentNode.nodeObj.style = {}
    if (mind.currentNode.nodeObj.style.fontStyle === 'italic') {
      delete mind.currentNode.nodeObj.style.fontStyle
      e.currentTarget.className = 'font-style'
      mind.updateNodeStyle(mind.currentNode.nodeObj)
    } else {
      mind.currentNode.nodeObj.style.fontStyle = 'italic'
      e.currentTarget.className = 'font-style size-selected'
      mind.updateNodeStyle(mind.currentNode.nodeObj)
    }
  }
  tagInput.onchange = (e:InputEvent & { target: HTMLInputElement}) => {
    if (!mind.currentNode) return
    if (typeof e.target.value === 'string') {
      const newTags = e.target.value.split(',')
      mind.updateNodeTags(mind.currentNode.nodeObj, newTags.filter(tag => tag))
    }
  }
  iconInput.onchange = (e:InputEvent & { target: HTMLInputElement}) => {
    if (!mind.currentNode) return
    if (typeof e.target.value === 'string') {
      const newIcons = e.target.value.split(',')
      mind.updateNodeIcons(mind.currentNode.nodeObj, newIcons.filter(icon => icon))
    }
  }
  urlInput.onchange = (e:InputEvent & { target: HTMLInputElement}) => {
    if (!mind.currentNode) return
    mind.updateNodeHyperLink(mind.currentNode.nodeObj, e.target.value)
  }
  // memoInput.onchange = (e:InputEvent & { target: HTMLInputElement}) => {
  //   if (!mind.currentNode) return
  //   mind.currentNode.nodeObj.memo = e.target.value
  // }
  let state = 'open'
  buttonContainer.onclick = e => {
    if (state === 'open') {
      state = 'close'
      menuContainer.className = 'close'
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-menu"></use></svg>`
    } else {
      state = 'open'
      menuContainer.className = ''
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-close"></use></svg>`
    }
  }

  // handle node selection
  mind.bus.addListener('unselectNode', function() {
    menuContainer.hidden = true
  })
  mind.bus.addListener('selectNode', function(nodeObj, clickEvent) {
    if (!clickEvent) return
    menuContainer.hidden = false
    clearSelect('.palette', 'nmenu-selected')
    clearSelect('.text-decoration', 'size-selected')
    clearSelect('.size', 'size-selected')
    clearSelect('.bold', 'size-selected')
    clearSelect('.font-style', 'size-selected')
    bgOrFont = 'font'
    fontBtn.className = 'font selected'
    fontBtn.nextElementSibling.className = 'background'
    if (nodeObj.style) {
      if (nodeObj.style.fontSize) {
        menuContainer.querySelector(
          '.size[data-size="' + nodeObj.style.fontSize + '"]'
        ).className = 'size size-selected'
      }
      if (nodeObj.style.textDecoration) {
        menuContainer.querySelector(
          '.text-decoration[data-type="' + nodeObj.style.textDecoration + '"]'
        ).className = 'text-decoration size-selected'
      }
      if (nodeObj.style.fontWeight) { menuContainer.querySelector('.bold').className = 'bold size-selected' }
      if (nodeObj.style.fontStyle) { menuContainer.querySelector('.font-style').className = 'font-style size-selected' }
      if (nodeObj.style.color) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.color + '"]'
        ).className = 'palette nmenu-selected'
      }
    }
    if (nodeObj.tags) {
      tagInput.value = nodeObj.tags.join(',')
    } else {
      tagInput.value = ''
    }
    if (nodeObj.icons) {
      iconInput.value = nodeObj.icons.join(',')
    } else {
      iconInput.value = ''
    }
    urlInput.value = nodeObj.hyperLink || ''
    // memoInput.value = nodeObj.memo || ''
  })
}

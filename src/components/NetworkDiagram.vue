<script setup>
import { ref,onMounted } from 'vue'
import * as go from 'gojs'

// 初始化 GoJS 图表
const diagramRef = ref(null)
const paletteRef = ref(null)

onMounted(() => {
  const $ = go.GraphObject.make
  
  // 初始化主 Diagram
  const myDiagram = new go.Diagram(diagramRef.value, {
    'commandHandler.archetypeGroupData': { isGroup: true, text: 'Subnet' },
    'undoManager.isEnabled': true
  })

  // 设置节点模板
  myDiagram.nodeTemplate = new go.Node('Spot', {
    locationSpot: go.Spot.Center,
    locationObjectName: 'BODY',
    selectionObjectName: 'BODY'
  })
    .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
    .add(
      new go.Picture({
        name: 'BODY',
        width: 50,
        height: 50,
        portId: '',
        fromLinkable: true,
        toLinkable: true,
        cursor: 'pointer'
      }).bind('source', 'type', (t) => `images/network/${t.toLowerCase()}.svg`),
      new go.Shape({
        width: 25,
        height: 25,
        fill: 'transparent',
        strokeWidth: 0
      })
    )

  // 设置组模板
  myDiagram.groupTemplate = new go.Group('Vertical', {
    locationSpot: go.Spot.Center,
    padding: 5
  })
    .add(
      new go.TextBlock({
        alignment: go.Spot.Left,
        font: '12px georgia',
        editable: true
      }).bindTwoWay('text'),
      new go.Panel('Auto')
        .add(
          new go.Shape('RoundedRectangle', {
            strokeDashArray: [2, 6],
            stroke: '#333',
            fill: 'rgba(0,0,0,0)'
          }),
          new go.Placeholder({ padding: 5 })
        )
    )

  // 初始化 Palette
  const myPalette = new go.Palette(paletteRef.value, {
    nodeTemplateMap: myDiagram.nodeTemplateMap,
    layout: new go.GridLayout({
      cellSize: new go.Size(2, 2),
      isViewportSized: true
    })
  })
  myPalette.model.nodeDataArray = [
    { type: 'Cloud' }, { type: 'Firewall' }, { type: 'Switch' },
    { type: 'Server' }, { type: 'Router' }, { type: 'PC' }
  ]

  // 设置连线模板
  myDiagram.linkTemplate = new go.Link({
    routing: go.Routing.Orthogonal,
    fromSpot: go.Spot.AllSides,
    toSpot: go.Spot.AllSides,
    relinkableFrom: true,
    relinkableTo: true
  })
    .add(new go.Shape({ strokeWidth: 1.5, stroke: 'red' }))
    .add(new go.Shape({ strokeWidth: 0, fill: 'red', scale: 0.7, fromArrow: 'circle' }))
    .add(new go.Shape({ strokeWidth: 0, fill: 'red', scale: 0.7, toArrow: 'circle' }))

  // 模拟加载数据
  load()

  // 保存功能
  const save = () => {
    const json = document.getElementById('modelJson')
    json.innerHTML = myDiagram.model.toJson()
    myDiagram.isModified = false
    if (window.Prism) window.Prism.highlightAll()
  }

  // 加载功能
  const load = () => {
    const json = document.getElementById('modelJson')
    myDiagram.model = go.Model.fromJson(json.textContent)
  }
})
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="flex justify-between w-full">
      <!-- Palette -->
      <div ref="paletteRef" style="width: 100px; margin-right: 2px; border: solid 1px black;"></div>
      <!-- Diagram -->
      <div ref="diagramRef" style="border: solid 1px black; flex-grow: 1; height: 450px"></div>
    </div>
    <div class="mt-4">
      <button @click="save">Save</button>
      <button @click="load">Load</button>
      Diagram Model saved in JSON format:
      <pre class="lang-js" style="max-height: 600px"><code id="modelJson"></code></pre>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
button {
  margin: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.lang-js {
  max-height: 600px;
  overflow: auto;
}
</style>

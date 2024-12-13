<script setup>
import { onMounted, ref } from 'vue';
import * as go from 'gojs';
import { Inspector } from "create-gojs-kit/dist/extensionsJSM/DataInspector.js";

let myDiagram = null;
let myInspector = null;

const props = defineProps({ nodeDataArray: Array, linkDataArray: Array });
const emitter = defineEmits(["ExternalObjectsDropped", "SelectionMoved"]);

const diagramDiv = ref(null);
const inspectorDiv = ref(null);

onMounted(function () {
  const $ = go.GraphObject.make;

  // 初始化 Diagram
  myDiagram = new go.Diagram(diagramDiv.value, {
    "undoManager.isEnabled": true,
    "commandHandler.archetypeGroupData": { isGroup: true, text: "Subnet" },
    layout: $(go.GridLayout, {
      wrappingColumn: 5,
      alignment: go.GridLayout.Position,
      cellSize: new go.Size(120, 120),
      spacing: new go.Size(20, 20),
    }),
  });

  // 添加监听器
  myDiagram.addDiagramListener("ExternalObjectsDropped", (e) => emitter("ExternalObjectsDropped", e));
  myDiagram.addDiagramListener("SelectionMoved", (e) => emitter("SelectionMoved", e));

  // 配置节点模板
  myDiagram.nodeTemplate = $(
    go.Node,
    "Auto",
    $(go.Shape, { fill: "white" }, new go.Binding("fill", "color")),
    $(go.TextBlock, { margin: 8 }, new go.Binding("text"))
  );

  // 配置组模板
  myDiagram.groupTemplate = $(
    go.Group,
    "Vertical",
    {
      locationSpot: go.Spot.Center,
      selectionObjectName: "PANEL",
      padding: 5,
    },
    $(go.TextBlock, {
      alignment: go.Spot.Left,
      editable: true,
      font: "bold 12pt sans-serif",
      stroke: "gray",
    }, new go.Binding("text").makeTwoWay()),
    $(go.Panel, "Auto", { name: "PANEL" },
      $(go.Shape, "RoundedRectangle", {
        strokeDashArray: [4, 8],
        stroke: "gray",
        fill: "rgba(0,0,0,0)",
        strokeWidth: 4,
        portId: "",
        cursor: "pointer",
        fromLinkable: true,
        toLinkable: true,
      }),
      $(go.Placeholder, { margin: 10, padding: 5, background: "transparent" })
    )
  );

  // 配置连线模板
  myDiagram.linkTemplate = $(
    go.Link,
    { curve: go.Link.Bezier, fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides },
    $(go.Shape, { strokeWidth: 2.5, stroke: "gray" }),
    $(go.Shape, { strokeWidth: 0, fill: "gray", scale: 1, fromArrow: "circle" }),
    $(go.Shape, { strokeWidth: 0, fill: "gray", scale: 1, toArrow: "Standard" }),
    $(go.TextBlock, { editable: true, textAlign: "center", font: "bold 12pt sans-serif", stroke: "gray" }, new go.Binding("text", "text"))
  );

  // 初始化 Inspector
  myInspector = new Inspector(inspectorDiv.value.id, myDiagram, {
    properties: {
      text: {},
      key: { readOnly: true, show: Inspector.showIfPresent },
      dropdown1: {
        name: "操作系统",
        show: (data) => data.type === "PC",
        type: "select",
        choices: ["Ubuntu", "CentOS"],
      },
      dropdown2: {
        name: "路由",
        show: (data) => data.type === "Switch",
        type: "select",
        choices: ["Route-1", "Route-2"],
      },
      type: { show: false },
      loc: { show: false },
    },
  });

  // 初始化数据
  const nda = props.nodeDataArray;
  const lda = props.linkDataArray;
  myDiagram.model = new go.GraphLinksModel(nda, lda);

  // 配置网格
  myDiagram.grid.visible = true;
  myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
});

// 示例函数：在组件的其他地方访问 myDiagram 和 myInspector
function addNode(type) {
  if (!myDiagram.value) return;

  myDiagram.value.startTransaction("add node");
  const existingNodes = myDiagram.value.model.nodeDataArray.length;
  const x = (existingNodes % 5) * 150;
  const y = Math.floor(existingNodes / 5) * 150;

  myDiagram.value.model.addNodeData({
    type: type,
    text: `${type} Node`,
    loc: `${x} ${y}`,
  });
  myDiagram.value.commitTransaction("add node");
}
</script>

<template>
  <div>
    <div ref="diagramDiv" class="goDiagram"></div>
    <div id="inspectorDivId" ref="inspectorDiv" class="inspector"></div>
    <button @click="addNode('Cloud')">Add Cloud</button>
  </div>
</template>

<style scoped>
.goDiagram {
  width: 600px;
  height: 400px;
  border: solid black 1px;
}

.inspector {
  width: 300px;
  height: 400px;
  border: solid black 1px;
}
</style>

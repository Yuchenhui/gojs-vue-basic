<script setup>
import { onMounted, ref } from 'vue'
import * as go from 'gojs'
import { Inspector } from "create-gojs-kit/dist/extensionsJSM/DataInspector.js";

const props = defineProps({ nodeDataArray: Array, linkDataArray: Array })
const emitter = defineEmits([
  "ExternalObjectsDropped",
  "SelectionMoved"
])

const diagram = ref(null)
const inspectorDiv = ref(null)

onMounted(function () {

  const $ = go.GraphObject.make;

  const myDiagram =
    new go.Diagram(diagram.value,
      {
        "undoManager.isEnabled": true,
        "commandHandler.archetypeGroupData": { isGroup: true, text: "Subnet" },
        layout: $(go.GridLayout, {
          wrappingColumn: 5,
          alignment: go.GridLayout.Position,
          cellSize: new go.Size(120, 120),
          spacing: new go.Size(20, 20),
        }),
      });

  myDiagram.addDiagramListener("ExternalObjectsDropped", e => emitter("ExternalObjectsDropped", e))
  myDiagram.addDiagramListener("SelectionMoved", e => emitter("SelectionMoved", e))

  myDiagram.nodeTemplate =
    $(go.Node, "Auto",
      $(go.Shape,
        { fill: "white" },
        new go.Binding("fill", "color")),
      $(go.TextBlock,
        { margin: 8 },
        new go.Binding("text"))
    );

  // 设置组模板
  myDiagram.groupTemplate = $(
    go.Group,
    "Vertical",
    {
      locationSpot: go.Spot.Center,
      selectionObjectName: "PANEL",
      padding: 5,
    },
    $(
      go.TextBlock,
      {
        alignment: go.Spot.Left,
        editable: true,
        font: "bold 12pt sans-serif",
        stroke: "gray",
      },
      new go.Binding("text").makeTwoWay()
    ),
    $(
      go.Panel,
      "Auto",
      { name: "PANEL" },
      $(go.Shape, "RoundedRectangle", {
        strokeDashArray: [4, 8],
        stroke: "gray",
        fill: "rgba(0,0,0,0)",
        strokeWidth: 4,
        portId: "",
        cursor: "pointer",
        fromLinkable: true,
        fromLinkableSelfNode: true,
        fromLinkableDuplicates: true,
        toLinkable: true,
        toLinkableSelfNode: true,
        toLinkableDuplicates: true,
      }),
      $(go.Placeholder, { margin: 10, padding: 5, background: "transparent" })
    )
  );

  myDiagram.linkTemplate = $(
    go.Link,
    {
      curve: go.Link.Bezier,
      fromSpot: go.Spot.AllSides,
      toSpot: go.Spot.AllSides,
      relinkableFrom: true,
      relinkableTo: true,
    },
    $(go.Shape, { strokeWidth: 2.5, stroke: "gray" }),
    $(go.Shape, {
      strokeWidth: 0,
      fill: "gray",
      scale: 1,
      fromArrow: "circle",
    }),
    $(go.Shape, {
      strokeWidth: 0,
      fill: "gray",
      scale: 1,
      toArrow: "Standard",
    }),
    $(
      go.TextBlock,
      {
        editable: true,
        textAlign: "center",
        font: "bold 12pt sans-serif",
        stroke: "gray",
        segmentOffset: new go.Point(0, 15),
      },
      new go.Binding("text", "text")
    )
  );
  const myInspector = new Inspector(inspectorDiv.value.id, myDiagram, {
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

  const nda = props.nodeDataArray;
  const lda = props.linkDataArray;
  myDiagram.model = new go.GraphLinksModel(nda, lda);
  myDiagram.grid.visible = true;
  myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;

});

</script>

<template>
  <div ref="diagram" class="goDiagram"></div>
  <!-- Inspector 区域 -->
  <div id="inspectorDivId" ref="inspectorDiv" class="inspector"></div>
</template>

<style scoped>
.goDiagram {
  width: 400px;
  height: 400px;
  border: solid black 1px;
  float: left;
}

.inspector {
  width: 400px;
  height: 400px;
  border: solid black 1px;
  float: left;
}
</style>

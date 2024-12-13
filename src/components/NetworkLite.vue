<script setup>
import { ref, onMounted } from "vue";
import * as go from "gojs";
import { Inspector } from "create-gojs-kit/dist/extensionsJSM/DataInspector.js";

const diagramDiv = ref(null);
const inspectorDiv = ref(null);

let myDiagram = null;

onMounted(() => {
  console.log("init.network-lite");

  if (!diagramDiv.value || !inspectorDiv.value) {
    console.error("Diagram or Inspector container is missing.");
    return;
  }

  const $ = go.GraphObject.make;

  // 初始化 Diagram
  myDiagram = $(go.Diagram, diagramDiv.value, {
    "undoManager.isEnabled": true,
    "commandHandler.archetypeGroupData": { isGroup: true, text: "Subnet" },
    layout: $(go.GridLayout, {
      wrappingColumn: 5,
      alignment: go.GridAlignment.Position,
      cellSize: new go.Size(120, 120),
      spacing: new go.Size(20, 20),
      isOngoing: false,
    }),
  });

  // 设置节点模板
  myDiagram.nodeTemplate = $(
    go.Node,
    "Vertical",
    {
      locationSpot: go.Spot.Center,
      locationObjectName: "BODY",
      selectionObjectName: "BODY",
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    $(
      go.Panel,
      "Auto",
      { name: "BODY" },
      $(
        go.Picture,
        {
          name: "BODY",
          width: 85,
          height: 85,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
        },
        new go.Binding(
          "source",
          "type",
          (t) => `/images/${t.toLowerCase()}.svg`
        )
      ),
      $(go.Shape, {
        width: 50,
        height: 50,
        fill: "transparent",
        strokeWidth: 0,
      })
    ),
    $(
      go.TextBlock,
      {
        margin: new go.Margin(5, 0, 0, 0),
        editable: true,
        font: "bold 12pt sans-serif",
        stroke: "gray",
        textAlign: "center",
      },
      new go.Binding("text", "text")
    )
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

  // 设置链接模板
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
      scale: 1.5,
      fromArrow: "circle",
    }),
    $(go.Shape, {
      strokeWidth: 0,
      fill: "gray",
      scale: 1.5,
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

  // console.log("init.network-lite")

  // 初始化 Inspector
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


  // 显示网格与对齐
  myDiagram.grid.visible = true;
  myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
  
  // 加载初始模型
  load();
});

// 添加节点方法
function addNode(type) {
  console.log("Adding node:", type);
  if (!myDiagram) {
    console.error("Diagram is not initialized.");
    return;
  }
  console.log(myDiagram.model)
  myDiagram.startTransaction("add node");
  const existingNodes = myDiagram.model.nodeDataArray.length;
  const x = (existingNodes % 5) * 150;
  const y = Math.floor(existingNodes / 5) * 150;
  myDiagram.model.addNodeData({
    type,
    text: `${type} Node`,
    loc: `${x} ${y}`,
  });
  myDiagram.commitTransaction("add node");
}

// 保存模型
function save() {
  const json = document.getElementById("modelJson");
  json.innerHTML = myDiagram.model.toJson();
  myDiagram.isModified = false;
}

// 加载模型
function load() {
  const json = document.getElementById("modelJson");
  if (json.textContent.trim()) {
    myDiagram.model = go.Model.fromJson(json.textContent);
  }
}
</script>

<template>
  <div id="networkDiagram">
    <div id="allSampleContent" class="p-4 w-full">
      <div id="sample">
        <!-- 按钮区域 -->
        <div
          style="
            width: 100%;
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          "
        >
          <button @click="addNode('Cloud')">Add Cloud</button>
          <button @click="addNode('Firewall')">Add Firewall</button>
          <button @click="addNode('Switch')">Add Switch</button>
          <button @click="addNode('Server')">Add Server</button>
          <button @click="addNode('PC')">Add PC</button>
        </div>

        <!-- 主体布局 -->
        <div style="display: flex; justify-content: space-between">
          <!-- Diagram 区域 -->
          <div
            ref="diagramDiv"
            style="
              border: solid 1px black;
              flex-grow: 1;
              height: 450px;
              margin-right: 20px;
            "
          ></div>

          <!-- Inspector 区域 -->
          <div
            id="inspectorDivId"
            ref="inspectorDiv"
            class="inspector"
            style="width: 250px; border: solid 1px black; height: 450px"
          ></div>
        </div>

        <!-- 保存与加载 -->
        <button @click="save">Save</button>
        <button @click="load">Load</button>
        <p>Diagram Model saved in JSON format:</p>
        <pre class="lang-js" style="max-height: 600px">
          <code id="modelJson"></code>
        </pre>
      </div>
    </div>
  </div>
</template>

<template>
  <div id="networkDiagram">
    <div id="allSampleContent" class="p-4 w-full">
      <div id="sample">
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
        <div style="display: flex; justify-content: space-between">
          <div
            id="myDiagramDiv"
            style="
              border: solid 1px black;
              flex-grow: 1;
              height: 450px;
              margin-right: 20px;
            "
          ></div>
          <div
            id="myInspectorDiv"
            class="inspector"
            style="width: 250px; border: solid 1px black; height: 450px"
          ></div>
        </div>
        <p>
          GoJS can be used to create network configuration diagrams for either
          monitoring or display. This example shows some editing capabilities:
          The Diagram
          <a>CommandHandler.archetypeGroupData</a> is set, allowing you to
          create new groups by pressing
          <code style="display: inline-block">Ctrl + G</code> with two or more
          <a>Node</a>s selected.
        </p>

        <button @click="save">Save</button>
        <button @click="load">Load</button>
        Diagram Model saved in JSON format:
        <pre
          class="lang-js"
          style="max-height: 600px"
        ><code id="modelJson"></code></pre>
      </div>
    </div>
  </div>
</template>

<script>
import go from "gojs";
import { Inspector } from "create-gojs-kit/dist/extensionsJSM/DataInspector.js";

export default {
  name: "NetworkDiagram",
  data() {
    return {
      myDiagram: null,
      myInspector: null,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      console.log("init");
      this.myDiagram = new go.Diagram("myDiagramDiv", {
        "commandHandler.archetypeGroupData": { isGroup: true, text: "Subnet" },
        "undoManager.isEnabled": true,
      });

      // 初始化空模型
      this.myDiagram.model = new go.GraphLinksModel();

      // 设置布局为 GridLayout，用于自动对齐
      this.myDiagram.layout = new go.GridLayout({
        wrappingColumn: 5,
        alignment: go.GridLayout.Position,
        cellSize: new go.Size(120, 120),
        spacing: new go.Size(20, 20),
        isOngoing: false,
      });

      this.myDiagram.nodeTemplate = new go.Node("Vertical", {
        locationSpot: go.Spot.Center,
        locationObjectName: "BODY",
        selectionObjectName: "BODY",
      })
        .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
        .add(
          new go.Panel("Auto", { name: "BODY" }).add(
            new go.Picture({
              name: "BODY",
              width: 85,
              height: 85,
              portId: "",
              fromLinkable: true,
              toLinkable: true,
              cursor: "pointer",
            }).bind("source", "type", (t) => `/images/${t.toLowerCase()}.svg`),
            new go.Shape({
              width: 50,
              height: 50,
              fill: "transparent",
              strokeWidth: 0,
            })
          )
        )
        .add(
          new go.TextBlock({
            margin: new go.Margin(5, 0, 0, 0),
            editable: true,
            font: "bold 12pt sans-serif",
            stroke: "gray",
            textAlign: "center",
          }).bind("text", "text")
        );

      this.myDiagram.groupTemplate = new go.Group("Vertical", {
        locationSpot: go.Spot.Center,
        selectionObjectName: "PANEL",
        padding: 5,
      }).add(
        new go.TextBlock({
          alignment: go.Spot.Left,
          editable: true,
          font: "bold 12pt sans-serif",
          stroke: "gray",
        }).bindTwoWay("text"),
        new go.Panel("Auto", { name: "PANEL" }).add(
          new go.Shape("RoundedRectangle", {
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
          new go.Placeholder({
            margin: 10,
            padding: 5,
            background: "transparent",
          })
        )
      );

      this.myDiagram.linkTemplate = new go.Link({
        curve: go.Link.Bezier,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides,
        relinkableFrom: true,
        relinkableTo: true,
      })
        .add(new go.Shape({ strokeWidth: 2.5, stroke: "gray" }))
        .add(
          new go.Shape({
            strokeWidth: 0,
            fill: "gray",
            scale: 1.5,
            fromArrow: "circle",
          })
        )
        .add(
          new go.Shape({
            strokeWidth: 0,
            fill: "gray",
            scale: 1.5,
            toArrow: "Standard",
          })
        )
        .add(
          new go.TextBlock({
            editable: true,
            textAlign: "center",
            font: "bold 12pt sans-serif",
            stroke: "gray",
            segmentOffset: new go.Point(0, 15),
          }).bind("text", "text")
        );

      // this.myInspector = new Inspector("myInspectorDiv", this.myDiagram, {
      //   properties: {
      //     text: {},
      //     key: { readOnly: true, show: Inspector.showIfPresent },
      //     dropdown1: {
      //       name: "操作系统",
      //       show: (data) => data.type === "PC",
      //       type: "select",
      //       choices: ["Ubuntu", "CentOS"],
      //     },
      //     dropdown2: {
      //       name: "路由",
      //       show: (data) => data.type === "Switch",
      //       type: "select",
      //       choices: ["Route-1", "Route-2"],
      //     },
      //     type: { show: false },
      //     loc: { show: false },
      //   },
      // });

      this.myDiagram.grid.visible = true;
      this.myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;

      this.load();
    },
    save() {
      const json = document.getElementById("modelJson");
      json.innerHTML = this.myDiagram.model.toJson();
      this.myDiagram.isModified = false;
    },
    load() {
      const json = document.getElementById("modelJson");
      if (json.textContent.trim()) {
        this.myDiagram.model = go.Model.fromJson(json.textContent);
      }
    },
    addNode(type) {
      console.log("Adding node:", type);
      if (!this.myDiagram) {
        console.error("Diagram is not initialized.");
        return;
      }
      this.myDiagram.startTransaction("add node");
      const existingNodes = this.myDiagram.model.nodeDataArray.length;
      const x = (existingNodes % 5) * 150;
      const y = Math.floor(existingNodes / 5) * 150;

      this.myDiagram.model.addNodeData({
        type: type,
        text: `${type} Node`,
        loc: `${x} ${y}`,
      });
      this.myDiagram.commitTransaction("add node");
    },
  },
};
</script>

<style scoped>
/* 将样式写入这里 */
</style>

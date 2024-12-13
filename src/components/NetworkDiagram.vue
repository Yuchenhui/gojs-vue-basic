<template>
  <div id="networkDiagram">
    
  </div>
</template>

<script>
import * as go from 'gojs'
import { Inspector } from 'create-gojs-kit/dist/extensionsJSM/DataInspector.js';

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
      this.myDiagram = new go.Diagram("myDiagramDiv", {
        "commandHandler.archetypeGroupData": { isGroup: true, text: "Subnet" },
        "undoManager.isEnabled": true,
      });

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
            }).bind(
              "source",
              "type",
              (t) => `src/static/images/${t.toLowerCase()}.svg`
            ),
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
      this.myDiagram.startTransaction("add node");
      const existingNodes = this.myDiagram.model.nodeDataArray.length;
      const x = (existingNodes % 5) * 150; // 每行最多放5个，水平间隔150
      const y = Math.floor(existingNodes / 5) * 150; // 每行的垂直间隔150

      this.myDiagram.model.addNodeData({
        type: type,
        text: `${type} Node`,
        loc: `${x} ${y}`, // 设置位置信息
      });
      this.myDiagram.commitTransaction("add node");
    },
  },
};
</script>

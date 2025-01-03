<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import * as go from "gojs";
import { AvoidsLinksRouter } from 'create-gojs-kit/dist/extensionsJSM/AvoidsLinksRouter';
import {
  Cpu,
  MostlyCloudy,
  Switch,
  Aim,
  Monitor,
  RefreshRight,
  ZoomOut,
  ZoomIn,
} from "@element-plus/icons-vue";

const diagramDiv = ref<HTMLDivElement | null>(null);
const nameInput = ref(null); // 用于控制 name 的输入框焦点
let myDiagram: go.Diagram | null = null;

onMounted(() => {
  console.log(diagramDiv);
  let currentNodeKey: string | null = null; // 当前选择的节点的key
  if (!diagramDiv.value) {
    console.error("Diagram or Inspector container is missing.");
    return;
  }

  const $ = go.GraphObject.make;

  // 初始化 Diagram
  myDiagram = $(go.Diagram, diagramDiv.value, {
    "undoManager.isEnabled": true,
    "commandHandler.archetypeGroupData": { isGroup: true, text: "Subnet" },
    // layout: $(go.GridLayout, {
    //   wrappingColumn: 5,
    //   alignment: go.GridAlignment.Position,
    //   cellSize: new go.Size(120, 120),
    //   spacing: new go.Size(20, 20),
    //   isOngoing: false,
    // }),
  });

  // myDiagram.routers.add(new AvoidsLinksRouter()); // 避免节点间的链接

  // 设置节点模板
  myDiagram.nodeTemplate = $(
    go.Node,
    "Vertical",
    {
      locationSpot: go.Spot.Center,
      locationObjectName: "BODY",
      selectionObjectName: "BODY",
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
      go.Point.stringify
    ),
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
          (t: string) => `/images/${t.toLowerCase()}.svg`
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
      fromSpot: go.Spot.AllSides,
      toSpot: go.Spot.AllSides,
      relinkableFrom: true,
      relinkableTo: true,
      routing: go.Routing.Orthogonal,
      curve: go.Curve.JumpOver,
      corner: 5,
      toShortLength: 10,
      resegmentable: true,
      selectionAdorned: false,
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

  // 显示网格与对齐
  myDiagram.grid.visible = true;
  myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
  myDiagram.model.makeUniqueKeyFunction = (model) => {
    let key = 1; // 从 0 开始
    while (model.findNodeDataForKey(key) !== null) {
      key++; // 避免重复 key
    }
    return key;
  };

  // 加载初始模型
  load();
  myDiagram.addDiagramListener("BackgroundSingleClicked", () => {
    clearForm(); // 执行清空表单
  });

  myDiagram.addDiagramListener("ObjectSingleClicked", (e: go.DiagramEvent) => {
    const part = e.subject.part;
    if (part instanceof go.Node) {
      currentNodeKey = part.data.key; // 保存当前节点的key
      console.log("Node clicked:", currentNodeKey);
    }
    if (!part || !part.data) {
      console.warn("Clicked on an empty part or background.");

      formInline.visible = false; // 隐藏表单
      return;
    }

    formInline.visible = true; // 显示表单

    // 根据类型判断并处理不同对象
    if (part instanceof go.Node) {
      if (part.data.isGroup) {
        console.log("Group clicked:", part.data);
        formInline.key = part.data.key || "";
        formInline.type = "Group";
        formInline.name = part.data.text || ""; // 主要更新组的文字
        formInline.loc = part.data.loc || ""; // 如果组有位置
      }
      else {
        console.log("Node clicked:", part.data);
        formInline.key = part.data.key || "";
        formInline.type = part.data.type || "";
        formInline.name = part.data.text || "";
        formInline.loc = part.data.loc || "";
        formInline.image = part.data.image || "";
      }

    } else if (part instanceof go.Link) {
      console.log("Link clicked:", part.data);
      formInline.key = part.data.key || ""; // 如果链接有唯一 key
      formInline.type = "Link";
      formInline.name = part.data.text || ""; // 主要更新链接上的文字
      formInline.from = part.data.from || ""; // 主要更新链接上的文字
      formInline.to = part.data.to || ""; // 主要更新链接上的文字
    } else {
      console.warn("Unknown part type clicked:", part);
    }

    console.log("Updated formInline:", formInline);

  });
});

// 添加节点方法
function addNode(type: string) {
  console.log("Adding node:", type);
  if (!myDiagram) {
    console.error("Diagram is not initialized.");
    return;
  }
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
  if (!myDiagram) return;
  const json = document.getElementById("modelJson");
  if (json) {
    jsonForm.json = myDiagram.model.toJson();
  }
  myDiagram.isModified = false;
}

// 加载模型
function load() {
  if (!myDiagram) return;
  const json = jsonForm.json;
  if (json) {
    myDiagram.model = go.Model.fromJson(json);
  }
}

function zoomIn() {
  if (myDiagram) myDiagram.scale *= 1.1;
}

function zoomOut() {
  if (myDiagram) myDiagram.scale /= 1.1;
}

function resetZoom() {
  if (myDiagram) myDiagram.scale = 1;
}

function thumbnail() {
  if (!myDiagram) return;
  var imageData = myDiagram.makeImageData({
    scale: 0.5,              // 缩放比例，用于缩小图像生成缩略图
    background: "white",     // 背景色（可选）
    type: "image/png",       // 输出图片类型（默认 image/png）
    size: new go.Size(200, 200) // 可指定生成图像的大小
  });
  console.log(imageData);
}

const formInline = reactive({
  key: "",
  type: "",
  image: "",
  loc: "",
  from: "",
  to: "",
  name: "",
  text: "",
  visible: false, // 控制表单是否显示
});

const jsonForm = reactive({
  json: "",
});

const clearForm = () => {
  formInline.key = "";
  formInline.type = "";
  formInline.image = "";
  formInline.loc = "";
  formInline.from = "";
  formInline.to = "";
  formInline.name = "";
  formInline.visible = false;
};

const updateNode = () => {
  if (!myDiagram) {
    console.error("Diagram is not initialized.");
    return;
  }

  const key = formInline.key;
  const type = formInline.type;
  console.log("Updating object:", formInline);
  myDiagram.startTransaction("update object");

  if (type === "Link") {
    // 更新链接数据：移除后重新添加
    const selectedLink = myDiagram.selection.first();
    if (selectedLink instanceof go.Link && selectedLink.data) {
      const linkData = selectedLink.data;

      if (myDiagram.model instanceof go.GraphLinksModel) {
        // 移除链接
        myDiagram.model.removeLinkData(linkData);

        // 新增链接，更新文字等信息
        myDiagram.model.addLinkData({
          ...linkData,
          text: formInline.name, // 更新文字
        });
      }
      console.log(
        "Link updated: Removed and re-added with new data:",
        linkData
      );
    } else {
      console.error("No link selected or invalid selection.");
    }
  } else if (type === "Group") {
    if (!key) {
      console.error("No object selected to update.");
      return;
    }
    // 更新组数据
    const group = myDiagram.findNodeForKey(key);
    if (group && group.data) {
      myDiagram.model.setDataProperty(group.data, "text", formInline.name);
      console.log("Group updated:", group.data);
    } else {
      console.error("Group not found for the given key:", key);
    }
  } else {
    if (!key) {
      console.error("No object selected to update.");
      return;
    }
    // 默认更新节点数据
    const node = myDiagram.findNodeForKey(key);
    if (node && node.data) {
      myDiagram.model.setDataProperty(node.data, "text", formInline.name);
      myDiagram.model.setDataProperty(node.data, "image", formInline.image);
      console.log("Node updated:", node.data);
    } else {
      console.error("Node not found for the given key:", key);
    }
  }

  myDiagram.commitTransaction("update object");

  // 清空表单
  clearForm();
};


</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>Network Diagram</el-header>
      <el-container>
        <el-aside width="250px">
          <div class="control-panel">
            <el-form :inline="false" :model="formInline" class="demo-form-inline" v-if="formInline.visible">
              <el-form-item v-if="false" label="Key">
                <el-input v-model="formInline.key" disabled />
              </el-form-item>
              <el-form-item v-if="false" label="Type">
                <el-input v-model="formInline.type" disabled />
              </el-form-item>
              <el-form-item v-if="false" label="From">
                <el-input v-model="formInline.from" disabled />
              </el-form-item>
              <el-form-item v-if="false" label="To">
                <el-input v-model="formInline.to" disabled />
              </el-form-item>
              <el-form-item label="Name">
                <el-input v-model="formInline.name" placeholder="Please enter name" ref="nameInput" clearable />
              </el-form-item>
              <el-form-item label="Image list" v-if="formInline.type === 'PC'">
                <el-select v-model="formInline.image" placeholder="Select image" clearable>
                  <el-option label="Zone one" value="shanghai" />
                  <el-option label="Zone two" value="beijing" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateNode">Save</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-aside>
        <el-container>
          <el-main>
            <el-button-group>
              <el-button type="primary" :icon="Monitor" @click="addNode('PC')">Add PC</el-button>
              <el-button type="primary" :icon="MostlyCloudy" @click="addNode('Cloud')">Add Cloud</el-button>
              <el-button type="primary" :icon="Aim" @click="addNode('Firewall')">Add Firewall</el-button>
              <el-button type="primary" :icon="Switch" @click="addNode('Switch')">Add Switch</el-button>
              <el-button type="primary" :icon="Cpu" @click="addNode('Server')">Add Server</el-button></el-button-group>
            <el-button-group class="ml-4">
              <el-button type="primary" :icon="ZoomIn" @click="zoomIn()"></el-button>
              <el-button type="primary" :icon="RefreshRight" @click="resetZoom()"></el-button>
              <el-button type="primary" :icon="ZoomOut" @click="zoomOut()"></el-button></el-button-group>
            <el-button-group class="ml-4">
              <el-button type="primary" @click="thumbnail()">Thumbnail</el-button>
              <el-button type="primary" @click="save()">Save</el-button>
              <el-button type="primary" @click="load()">Load</el-button>
            </el-button-group>
            <div ref="diagramDiv" class="diagram-container"></div>
          </el-main>
          <el-footer>
            <p>Diagram Model saved in JSON format:</p>
            <el-form><el-form-item>
                <el-input id="modelJson" v-model="jsonForm.json" type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }" /> </el-form-item></el-form>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<style>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

.control-panel {
  margin: 20px;
}

.ml-4 {
  margin-left: 2rem;
}

.diagram-container {
  flex-grow: 1;
  height: 450px;
  margin-right: 20px;
  border: 3px #aaa solid;
  margin-top: 10px;
}
</style>

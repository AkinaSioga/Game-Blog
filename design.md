# 网站设计文档

> 技术实现规则见 [AGENTS.md](AGENTS.md)，本文档仅定义设计方向。

## 项目定位

一个以二次元风格呈现的游戏攻略站。

主要内容：

* 游戏攻略
* 配装方案
* Build 分享
* 游戏机制解析
* 副本攻略
* 角色培养

---

## 目标用户

目标用户包括：

* MMO 玩家
* ARPG 玩家
* Build 研究玩家
* 游戏攻略查阅用户

---

## 网站风格

核心关键词：

* 二次元
* 游戏感
* 科技感
* 深色主题
* 卡片布局

色调方向：

* 主背景：深色（#1a1a2e ~ #16213e 区间）
* 强调色：根据每个游戏主题色动态变化，或统一定为暖色系（红/橙）
* 卡片：半透明深色 + 微弱边框发光

参考风格：

* Reimu Theme
* Hoyolab
* Prydwen
* NGA 部分游戏资料页

避免：

* 企业官网风格
* 纯文档站风格
* 极简主义风格

---

## 信息架构

首页 → 游戏列表 → 分类列表 → 攻略文章

---

## 显示名称与目录名映射

| 显示名称 | 目录名 | URL |
|---------|--------|-----|
| 鸣潮 | wuwa | /games/wuwa/ |
| 全境封锁2 | division2 | /games/division2/ |
| 命运2 | destiny2 | /games/destiny2/ |
| Warframe | warframe | /games/warframe/ |

---

## 首页结构

首页展示：

1. 网站介绍
2. 游戏入口
   * Warframe
   * 全境封锁2
   * Destiny 2
   * 鸣潮
3. 推荐攻略
4. 最近更新

---

## 游戏页面

示例：Warframe

必须包含：

* 游戏简介
* 分类导航

可选：

* 热门攻略
* 最近更新

分类：

* Warframes
* Weapons
* Mods
* Arcanes
* Builds

---

## 分类页面

示例：Warframe → Mods

必须包含：

* 分类说明
* 攻略列表

可选（后续阶段）：

* 搜索功能

---

## 攻略页面

页面结构：

* 标题
* 简介
* 目录
* 正文
* 相关推荐
* 上一篇 / 下一篇

---

## 内容目录结构

```
content/
└─ games/
    ├─ warframe/
    │   ├─ mods/
    │   ├─ weapons/
    │   ├─ warframes/
    │   ├─ arcanes/
    │   └─ builds/
    ├─ division2/
    ├─ destiny2/
    └─ wuwa/
```

---

## URL 设计

统一格式：

```
/games/{game}/{category}/{slug}/
```

示例：

* `/games/warframe/mods/adaptation/`
* `/games/destiny2/builds/prismatic-hunter/`
* `/games/division2/builds/striker-build/`
* `/games/wuwa/characters/jinhsi-build/`

---

## 搜索规划

后续支持：

* 全站搜索
* 游戏内搜索
* 分类搜索

---

## 后续规划

第一阶段：

* Hugo
* Reimu
* GitHub Pages

第二阶段：

* 搜索
* 评论系统
* 相关推荐

第三阶段：

* 游戏数据库
* Build 展示页
* 数据统计页面

---

## 维护原则

优先保证：

* 内容结构清晰

其次保证：

* 视觉效果优秀

最后考虑：

* 复杂功能扩展

内容质量始终高于炫酷特效。

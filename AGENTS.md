# AGENTS.md

## 项目说明

本项目是一个基于 Hugo + Hugo Theme Reimu + GitHub Pages 的游戏攻略站。

项目定位：

* 游戏攻略站
* 游戏知识库
* 游戏资料整理站

不是传统时间流博客。

---

## 网站结构

网站采用三级结构：

游戏 → 分类 → 文章

示例：

* Warframe

  * Warframes
  * Weapons
  * Mods
  * Arcanes
  * Builds

* 全境封锁2

  * Build
  * 装备
  * 天赋
  * 副本攻略

* Destiny 2

  * Build
  * Raid
  * Dungeon
  * Weapons

* 鸣潮

  * 角色
  * 武器
  * 配队
  * 养成

---

## 内容组织规则

必须优先使用 Hugo Section（目录结构）组织内容。

禁止使用 Tag 代替网站层级。

每个 Section（游戏/分类）必须包含 `_index.md`：
* 设定该 Section 的 `title` 和 `description`（影响 SEO 和面包屑）
* 可选设定 `weight` 控制排序

所有 Section 目录名统一使用 URL 友好的格式（全小写、连字符连接）：
* `warframe` ✓
* `Warframe` ✗（避免 URL 中出现大写）
* `destiny-2` ✓
* `Destiny 2` ✗

正确：

```
content/
└─ games/
    └─ warframe/
        └─ mods/
            └─ adaptation.md
```

错误：

```
content/posts/adaptation.md
tags:
  - warframe
  - mods
```

---

## URL规范

统一格式：

```
/games/{game}/{category}/{slug}/
```

示例：

* `/games/warframe/mods/adaptation/`
* `/games/division2/builds/striker-build/`
* `/games/destiny2/raids/salvations-edge/`

禁止随意修改已有 URL 结构。

---

## Taxonomy规范

Tag 仅用于辅助检索。

允许的 Tag 示例：

* build
* beginner
* endgame
* weapon

禁止的 Tag 示例：

* warframe
* destiny2
* division2

游戏名称必须通过 Section 管理，不得作为 Tag。

---

## 菜单规范

导航栏仅展示一级游戏。

示例：

* 首页
* Warframe
* 全境封锁2
* Destiny 2
* 鸣潮

禁止自动按时间生成导航。

---

## 首页设计原则

首页优先展示：

* 游戏入口
* 推荐攻略
* 最新更新

禁止采用传统博客时间流作为首页主体。

首页需要自定义 `layouts/index.html`，替换默认时间流为游戏入口 + 推荐攻略布局。

---

## Theme开发规范

当前主题：

Hugo Theme Reimu

允许修改：

* layouts/
* partials/
* custom css
* menu 模板

优先扩展主题功能。

除非必要，不替换主题。

---

## 代码规范

所有新增代码必须添加中文注释。

示例：

```
// 获取当前游戏分类
const gameSection = ...
```

Go Template 示例：

```
{{/* 获取当前栏目 */}}
```

保持代码可读性。

---

## 开发规范

修改模板前：

1. 说明影响页面
2. 说明影响 URL
3. 说明影响 SEO

新增依赖前：

1. 说明用途
2. 说明体积影响
3. 说明是否影响 GitHub Pages 构建

---

## SEO规范

所有页面必须支持：

* title
* description
* Open Graph
* canonical

不得删除主题原有 SEO 能力。

---

## 响应式规范

必须兼容：

* Desktop
* Tablet
* Mobile

移动端优先保证：

* 导航可用
* 分类可用
* 搜索可用

---

## 内容编写

文章内容由站长手动编写。

AI 不负责撰写攻略内容。

AI 仅负责：

* 网站开发
* 模板开发
* 页面优化
* SEO 优化
* 结构调整

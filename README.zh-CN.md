[English](./README.md) | 简体中文

# Inkpress Renderer Action

将 Obsidian markdown 知识库文件夹渲染为静态 HTML 站点。

## 使用方法

```yaml
- uses: fangbinwei/inkpress-render-action@v1
  with:
    vault-path: '.'
    publish-dirs: 'notes,guides'
    output-dir: '.site-output'
```

### 完整工作流（含 OSS 上传）

```yaml
name: Publish Obsidian to OSS
on:
  push:
    branches: [main]
    paths: ['notes/**', 'guides/**']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: fangbinwei/inkpress-render-action@v1
        with:
          vault-path: '.'
          publish-dirs: 'notes,guides'
          output-dir: '.site-output'
      - uses: fangbinwei/aliyun-oss-website-action@v1
        with:
          accessKeyId: ${{ secrets.OSS_ACCESS_KEY_ID }}
          accessKeySecret: ${{ secrets.OSS_ACCESS_KEY_SECRET }}
          bucket: ${{ secrets.OSS_BUCKET }}
          endpoint: oss-cn-hongkong.aliyuncs.com
          folder: '.site-output'
```

### 输入参数

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `vault-path` | 是 | `.` | Obsidian 知识库根路径 |
| `publish-dirs` | 是 | | 需要发布的目录，逗号分隔 |
| `output-dir` | 是 | `.site-output` | 渲染后 HTML 的输出目录 |
| `upload-mode` | 否 | `html` | `html` 或 `html+md` |
| `dead-link-policy` | 否 | `silent` | `silent` 或 `marked` |

### 输出参数

| 输出 | 说明 |
|------|------|
| `rendered-count` | 渲染的文件数量 |
| `dead-link-count` | 检测到的死链数量 |
| `report-path` | JSON 发布报告的路径 |

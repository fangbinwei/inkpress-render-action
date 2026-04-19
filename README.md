English | [简体中文](./README.zh-CN.md)

# Inkpress Renderer Action

Render Obsidian markdown vault folders into a static HTML site.

## Usage

```yaml
- uses: fangbinwei/inkpress-render-action@v0
  with:
    vault-path: '.'
    publish-dirs: 'notes,guides'
    output-dir: '.site-output'
```

### Full workflow with OSS upload

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
      - uses: fangbinwei/inkpress-render-action@v0
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

### Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `vault-path` | Yes | `.` | Path to Obsidian vault root |
| `publish-dirs` | Yes | | Comma-separated directories to publish |
| `output-dir` | Yes | `.site-output` | Output directory for rendered HTML |
| `upload-mode` | No | `html` | `html` or `html+md` |
| `dead-link-policy` | No | `silent` | `silent` or `marked` |

### Outputs

| Output | Description |
|--------|-------------|
| `rendered-count` | Number of files rendered |
| `dead-link-count` | Number of dead links found |
| `report-path` | Path to the JSON publish report |

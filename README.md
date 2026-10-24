# 探索宇宙 · EXPLORE THE UNIVERSE

中文交互式宇宙科普网站：地球漫游、感知地球、太阳系、银河、黑洞、星系与星座探索。

## 发布到 GitHub Pages

1. 在自己的 GitHub 账号下创建公开仓库 `universe`。
2. 使用 Git 或 GitHub Desktop 上传本文件夹内的全部文件，包含隐藏文件 `.nojekyll`。仓库根目录应直接看到 `index.html`、`assets/` 和 `vendor/`，不要再套一层 `universe` 文件夹。
3. 仓库 **Settings → Pages → Build and deployment**：选择 **Deploy from a branch**，分支 **main**，目录 **/ (root)**，然后保存。
4. 等待 GitHub 的 Pages 部署完成，使用 Pages 设置页显示的网址。默认网址形式为 `https://你的用户名.github.io/universe/`。

网页文件已经准备完成，不需要 npm install 或构建命令。不要把本地预览 ZIP、工作记录或备份上传到代码仓库。

当前网站约 320 MiB，最大单个文件 `assets/models/roman-nasa.glb` 约 28.3 MiB。GitHub 网页上传单个文件限制为 25 MiB，因此请使用 Git / GitHub Desktop；当前文件都小于 Git 的 100 MiB 单文件上限，不需要 Git LFS。GitHub Pages 不支持 Git LFS。

## 运行条件

- 使用支持 JavaScript 模块、import maps 和 WebGL 2 的现代浏览器，并允许硬件加速。
- 在线访问 GitHub Pages 不需要安装 Node.js、Python 或数据库；手机和电脑都可以通过网址访问。
- 本地预览请使用 HTTP 服务器，不要直接双击 HTML。安装了 Python 时，可在本目录运行 `python -m http.server 8080 --bind 127.0.0.1`，然后访问 `http://127.0.0.1:8080/`。
- 另有带 Windows 启动器的本地预览包，该启动器需要 Node.js 18 或更新版本。
- 三维场景、贴图和讲解音频随文件提供；天气、NASA EONET 热带气旋事件与外部视频需要联网。无声自动播放、声音和全屏是否允许，取决于浏览器规则。
- 模型与讲解音频按需加载；较大模型在移动网络下首次打开可能需要等待。低性能设备可以选择流畅画质。

## 数据与素材

页面数据仅用于展示参考，权威数据应以实际情况和权威机构发布的信息为准。在此感谢：NASA，提供的相关公开数据。

第三方素材与数据遵循各自原有许可。素材来源及修改记录见 [assets/CREDITS.txt](assets/CREDITS.txt)，库与上游许可见 [vendor/](vendor/)。作者声明及联系方式可在网页“作者声明”中查看。

## 官方发布限制

- [GitHub 文件大小限制](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [GitHub Pages 使用限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [配置 Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

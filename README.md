# HuMusic-React

这是一款使用 React 实现的移动端音乐播放器，实现了歌单，榜单，歌曲播放，歌词实时显示等功能。

前端部分主要用到了 react、redux、react-router、react-transition-group 等技术栈

全面拥抱函数式组件进行开发，对于组件内部的状态使用 Hooks，公共业务逻辑部分使用 redux 进行管理

项目开发后期，使用 immutable 库进行性能优化，使用 React.memo 对组件进行包裹，降低SCU更新次数，使用 React.lazy 提高页面加载性能。


后端数据来源: [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)


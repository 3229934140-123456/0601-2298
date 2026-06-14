export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/report/index',
    'pages/progress/index',
    'pages/records/index',
    'pages/info/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E6FFF',
    navigationBarTitleText: '公路救援',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F2F5FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1E6FFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/report/index',
        text: '故障上报'
      },
      {
        pagePath: 'pages/progress/index',
        text: '救援进度'
      },
      {
        pagePath: 'pages/records/index',
        text: '维修记录'
      },
      {
        pagePath: 'pages/info/index',
        text: '常用资料'
      }
    ]
  }
})

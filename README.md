### m.sopei.cn 搜配后台 manager

## 框架组成
- `umi` [工具 + 路由] - 官网[https://umijs.org/]
- `dva` [数据 + 状态管理redux] dva底层引入了redux-sagas做异步流程控制 - github地址[https://github.com/dvajs/dva]
- `antd` (或mobile)[UI视图]
- UI文档
    - pc[https://ant.design/index-cn]
    - mobile[https://mobile.ant.design/index-cn]
    - UI风格可参考 antd pro [https://preview.pro.ant.design](没有采用此框架，使用umi更灵活)

## 结构

├── mock                     # 本地模拟数据
├── public                   # 静态资源
│   └── favicon.png          # Favicon
├── src
│   ├── assets               # 本地静态资源
│   ├── common               # 应用公用配置，如导航信息
│   ├── components           # 业务通用组件
│   ├── e2e                  # 集成测试用例
│   ├── layouts              # 通用入口布局
│   ├── models               # dva model
│   ├── services             # 后台接口服务配置
│   ├── utils                # 工具库
│   ├── theme.js             # 主题配置
│   ├── pages                # 路由页面 
│   ├── global.js            # 全局js
│   ├── global.less          # 全局样式
├── tests                    # 测试工具
└── package.json


## 开发注意事项

#### 前端数据实践约定

- 在models定义state
- pages里通过props获取state渲染
- 子组件继承父组件的props
- 视图层更改通过 dispatch({}) 改变 state
- 除非是一些局部使用的状态，尽量减少setState的使用次数，保持数据一条线传递下去，而不是随时生成临时状态
- 子组件尽量使用不可改变状态的方式定义（纯函数方式）,减少使用class定义的组件， () => <div>内容</div>
- 数据操作逻辑尽量在models处理，pages处理页面布局和样式

```
    // 例子
    function Todo(props) {
        const handleClick = ()=> {
            props.dispatch({ type: 'todos/add' }); // models处理后续事务
        }
        return <div onClick={handleClick}>${props.name}</div>
    }

```

- 页面初始化，通过 componentDidMount 或者 models的subscriptions处理 ，建议在subscriptions进行

```
    // 例子

    subscriptions: {
        setup({ history, dispatch }) {
            // 监听 history 变化，当进入 `brandparts` 时触发 `初始化` action，此订阅为全局控制，需要判断当前路由
            return history.listen(({ pathname }) => {
                if (pathname === 'brandparts') {
                    props.dispatch({ type: 'todos/fetchList' });
                    props.dispatch({ type: 'todos/fetchListByCmid' });
                    props.dispatch({ type: 'todos/carmodel_base_list' });
                }
            });
        }
    }

    // 或者
    class MainLayout extends Component {
        componentDidMount() {
             props.dispatch({ type: 'todos/fetchList' });
             props.dispatch({ type: 'todos/fetchListByCmid' });
             props.dispatch({ type: 'todos/carmodel_base_list' });
        }
    }

```

- models里面改变reducers数据时，需要不可变状态的数据，比如单层嵌套的数据，使用concat, filter, map, slice, {...state}, Object.assign

```
    // 例子
    app.model({
        namespace: 'todos',
        state: [],
        reducers: {
            add(state, { payload: todo }) {
                return state.concat(todo);
            },
            remove(state, { payload: id }) {
                return state.filter(todo => todo.id !== id);
            },
            update(state, { payload: updatedTodo }) {
                return state.map(todo => {
                    if (todo.id === updatedTodo.id) {
                        return { ...todo, ...updatedTodo };
                    } else {
                        return todo;
                    }
                });
            },
        },
    };
```

- 如果对象嵌套比较多，建议使用react推荐的immutable方式, 可以使用 `immutability-helper` [https://github.com/kolodny/immutability-helper]

```
    // 例子，注意： 避免沉层嵌套
    import update from 'immutability-helper';
    app.model({
        namespace: 'todos',
        state: [],
        reducers: {
            saveUpdateList(state, { payload: dataList }) {
                const { dataList, idx, key, value}
                return state.map(todo => {
                    return { ...todo, dataList: update(dataList, { [idx]: { [key]: { $set: value } } }) };
                });
            },
        },
    };
    
```

- 8、Effects使用

```
    // put 用于触发 action 。
    yield put({ type: 'todos/add', payload: 'Learn Dva' });

    // call 用于调用异步逻辑，支持 promise 。
    const result = yield call(fetch, '/todos');

    // select 用于从 state 里获取数据。
    const todos = yield select(state => state.todos);
```

#### chrome安装两个调试插件 React Developer Tools Redux DevTools

#### 按照eslint提示的规范编写代码，可以规范代码缩进格式，编译前自动代码检测，过滤变量赋值错误，重复赋值，语法错误，符号错误，符号缺少的bug，建议使用vscode编辑器.

#### 使用dva

- 动态加载 Model 和路由, 按需加载使得访问速度更快
- 集成了Redex，统一配置在models文件夹里面，不用组织结果，配置状态，简单来说Redux 是 JavaScript 状态容器，可以跨页面存储（缓存）各自前端操作状态的容器， 详细了解Redux 中文文档[https://cn.redux.js.org/]

#### 使用umi

- umi 会根据 pages 目录自动生成路由配置, 省去了手动配置路由的烦恼，创建一个文件夹即可生成路由
- 集成了dev和build的webpack配置

#### React只是做数据绑定的前端库，作为一个工程使用，是需要使用大量的第三方包，或者自己实现各种工具库，为了减少各自配置项的时间，集中精力在业务逻辑的编写，采用的框架的集合

#### 数据绑定原则

- 保证React单向数据流在层级中自上而下进行（父 > 子 > 子 ， 子操作 直接调用 父的方法 ）
- 将 UI 拆解到组件层次结构中，尽量使用不可控的纯函数组件，不操作state，页面数据状态尽量在路由的视图层处理，除非是一些临时可销毁的变量
- 操作数据绑定的更新，通过组件传入的方法，通过反向数据流进行变更
- 做state数据更新时，避免直接操作数据（不可变数据），例子

```
    // 通过赋值改变数据（Data change with mutation） 错误的做法
    var player = {score: 1, name: 'Jeff'};
    player.score = 2;
    
    // 正确的做法
    var player = {score: 1, name: 'Jeff'};
    var arr = [1,2,3];

    var newPlayer = Object.assign({}, player, {score: 2});
    var newPlayer = {...player, score: 2};
    var newArr = arr.slice();
    var newPlayer = JSON.parse(JSON.stringify(player));
    var newPlayer = clone(player);
    <!-- 获取到新值，再进行set操作 -->
    // this.setState(player: newPlayer);
```

- 不改变原有的state值可以减少bug产生的问题调查，因为this.setState方法是异步操作，在变更过程中，其他地方如果也同时操作，很难保证顺序，会出现无法察觉的bug
- 不改变原有的state值，可以更简单的实现 撤消/重做和步骤 ，如果我们需要在新旧数据之间切换， 以及避免数据改变使我们能够保留对旧数据的引用，否则大家都在一个对象引用上
- react的页面渲染是通过state状态进行diff对比进行的，就算引用改变，虚拟dom也会进行值对比，局部dom进行变更，不需要担心整体重新渲染

#### 页面组件配置项风格
- 如果组件参数复杂，尽量用对象进行配置，减少直接在组件上写配置的情况，方便调整以及查看， 例子

```
    // 建议的方式
    const config = {
        form,
        ...this.state,
        handleUploadChange: this.handleUploadChange,
        handleChangeCategory: this.handleChangeCategory
        style: {width: '50%'}
    };

    <CurrentStep {...config} />

    // 直接写入在组件上的形式，查看非常不方便,而且变量必须{}包裹， 样式需要 {{}} 双层包裹 ，第一层代表输出，第二层代表对象，如果再嵌套多层，看起来就费劲了
    <CurrentStep style={{width: '50%'}} form={form} {...state}  handleUploadChange={this.handleUploadChange} handleChangeCategory={this.handleChangeCategory}/>

```

#### 请求接口调用方式

``` 
    // 接口参数形式统一为对象，包括get的url参数
    // post第二个参数可接收 {data: {}, params: {}}, get第二个参数 {params: {}}

    export const post = (url, {data = {}, params = {}, headers = {}}) => {
        return fetchData({ method: 'post', url, params, data, headers });
    };
    export const get = (url, {params = {}, headers = {}} = {}) => {
        return fetchData({ method: 'get', url, params, headers });
    };

    // 定义接口 services/index.js
    export const carmodel_base_list = ({ data }) => {
        return post(api.carmodel_base_list, {data});
    };

    // models配置 /models/part.js
    effects: {
        *fetchList({ payload }, { call, put }) {
            const { perpage, page } = payload;
            const res = yield call(request, {
                fnName: 'carmodel_base_list',
                data: payload
            });
            yield put({ type: 'savelist', payload: { res, perpage, page } });
        }
    }

    reducers: {
        savelist(state, action) {
            const { res, perpage, page } = action.payload;
            if (res.code == 0) {
                return { ...state, carmodelBaseList: res.data, perpage, page };
            } else {
                msg(action.payload.res);
                return state;
            }
        }
    }

    // 业务页面
    dispatch({
        type: 'baseorigin/fetchBaseOriginApprove',
        payload
    });

    const mapStateToProps = state => ({
        loading: state.loading.effects,
        ...state.part // 绑定数据后，在Part的prop属性上，能获取part里面state下定义的全部值
    });
    export default connect(mapStateToProps)(Part);

```

--------------------------------------------------------------------------------------------


## 排除pages下的文件生成为路由
```
//.umirc.js下配置
plugins: [
    ['umi-plugin-routes', {
        exclude: [/pages\/models/, /pages\services/, /pages\components/]
    }]
]
```

-------------------------------------------------------------------------------------------

## 文件说明
- /pages/ 路由路径根据pages下的文件夹（文件名）自动定义，文件夹下的page.js默认为根文件
- /layouts/index.js 入口文件
- /public/ 可放置静态资源文件 (如/public/static/img/nopic.png，页面可直接引用<img src="static/img/nopic.png" alt="" />)
- /global.css(全局样式定义，build不会生成唯一的hash参数)
- /utils/request.js： 处理http请求
- 目录规范 
    - page/.../services/ 数据接口服务
    - page/.../model/ 数据模型
    - page/.../components/ 页面模板

## 配置
### 代理配置：处理dev环境跨越问题
```
    // .webpackrc.js
    proxy: {
        '/api': {
            target: 'http://jsonplaceholder.typicode.com/',
            changeOrigin: true,
            pathRewrite: { '^/api': '' }
        }
    }
```

### 配置antd主题 theme
- .webpackrc（JSON 格式）或 .webpackrc.js（ES 6 语法）中配置

```
    "theme": {
    "@primary-color": "#1DA57A"
    }
    // 或者，
    "theme": "./theme-config.js"
```

### 别名配置
- .webpackrc（JSON 格式）或 .webpackrc.js（ES 6 语法）中配置

```
    alias: {
        '@': path.resolve(__dirname, './src/'),
        pages: path.resolve(__dirname, './src/pages/'),
        utils: path.resolve(__dirname, './src/utils/')
    }
```


### 环境变量
- .webpackrc（JSON 格式）或 .webpackrc.js（ES 6 语法）中配置

```
    "define": {
    "process.env.TEST": 1,
    "USE_COMMA": 2,
    }
```

-------------------------------------------------------------------------------------------

## 使用说明

### 路由
#### 声明式 基于 umi/link。
```
    import Link from 'umi/link';
    export default () => (
        <Link to="/list">Go to list page</Link>
    );
```

#### 命令式 基于 umi/router。
```
    import router from 'umi/router';
    function goToListPage() {
        // 普通跳转，不带参数
        router.push('/list');

        // 带参数
        router.push('/list?a=b');

        router.push({
            pathname: '/list',
            query: {
                a: 'b',
            },
        });
    }

    // 替换当前页面，参数和 router.push() 相同。
    router.replace(path)
    // 往前或往后跳指定页数。
    router.go(-1)
    // 后退一页。
    router.goBack()


```
####  重定向 umi/redirect
```
    import Redirect from 'umi/redirect';
    <Redirect to="/login" />
```

#### 全局

#### 按需加载模块
- 页面路由模块自动异步加载
```
    // 内部模块按需加载方式 
    import('g2').then(() => {
        // do something with g2
    });
```

-------------------------------------------------------------------------------------------

## 安装依赖第三方包
- react-helmet或者react-document-title设置title以及head内容插件

## 部署

- 静态化(如果不做服务端渲染，服务端的 html fallback)可以这样配置，build时能根据路由生成html文件
```
    // .umirc.js 里配置：
    export default {
    exportStatic: {},
    }
```

## 环境变量设置
- package.json
```
set PORT=3000&&set BROWSER=none&&umi dev
```

## 404页面
- 约定 pages 目录下的 404.js 为 404 页面，需要返回 React 组件。

##
- withRouter说明， react-router 提供了一个withRouter组件 
- withRouter可以包装任何自定义组件，将react-router 的 history,location,match 三个对象传入。 
- 无需一级级传递react-router 的属性，当需要用的router 属性的时候，将组件包一层withRouter，就可以拿到需要的路由信息
- 如果使用了react-router-redux,则可以直接从state 中的router属性中获取location。不需要再使用withRouter 获取路由信息了

```
    export default connect(({router}) => {
        return {pathname: router.location.pathname}
    })(MyControl)

    react-router-redux配置

    const store = createStore(
        combineReducers({
            ...reducer,
            router: routerReducer
        }),
        applyMiddleware(routeMiddleware));
```

## FAQ: 坑，注意

### 在ejs里面增加viewport会导致hd方案失效
```
    //注意initial-scale=1 会导致失效，可以使用以下的mate
    <meta name="viewport" content="width=device-width,initial-scale=0.5,maximum-scale=0.5,minimum-scale=0.5,user-scalable=no">
```
### 使用浏览器返回，页面没有刷新
```
    // 如果使用connect,还需要注意先后顺序 withRouter(connect(({}) => ({}))(Layout))
    layouts/index.js 里用 withRouter包裹, withRouter(connect(mapStateToProps)(Layout))
```

### 锚点 和hashHistory冲突
```

    import { HashLink } from "react-router-hash-link";
    const router ="main";//当前的路由，重复跳转到当前路由不会触发页面更新
    const anchorHref="#api";//这个是定位的锚点 如<div id="api"></div>
    <HashLink to={`/${router}${anchorHref}`}>点击跳转</HashLink>
    // 上述方法不好用，涉及到路由携带参数，会有问题。
    // 使用下面方法

    handleQuickJump(id, e) {
        if (e) {
            e.preventDefault();
        }
        const node = document.querySelector(id);
        if (node) {
            node.scrollIntoView(true);
        }
    }
```
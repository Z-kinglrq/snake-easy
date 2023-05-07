/**
 * 游戏主逻辑
 */

//用于储存生成的地雷的数组
var mineArray = null;

//雷区的容器
var mineArea =$('.mainArea');

//用于存储整张地图每个格子额外的一些信息
var tableData = [];

//存储用户插旗的 DOM 元素
var flagArray =[];

var btns = $$(".level>button");

//插旗数量的 DOM 元素
var flagNum = $(".flagNum");

//当前雷数的 DOM 元素
var mineNumber = $(".mineNum");

/**
 * 生成地雷的方法
 * @returns地雷的数组
 */
function initMine(){
    //1、生成对应长度的数组
    var arr = new Array(curLevel.row * curLevel.col);
    //2、往数组里面填充值
    for(var i = 0;i<arr.length;i++){
        arr[i]=i;
    }
    //接下来，打乱这个数组
    arr.sort(()=>0.5-Math.random());
    //只保留对应累数量的数组长度
    return arr.slice(0,curLevel.mineNum);
}
/**
 * 清空场景
 */
function clearScene(){
    mineArea.innerHTML = "";
    flagArray = [];
    flagNum.innerHTML = 0;
    mineNumber.innerHTML =curLevel.mineNum;
}
/**
 * 游戏初始化
 */
function initGame(){


    clearScene();
    //随机生成所选配置对应的雷的数量
    mineArray = initMine();
    // console.log(mineArray);

    //2、生成所选配置的表格
    var table = document.createElement('table');
    
    //记录下表
    var index = 0;

    for(var i = 0;i<curLevel.row;i++){
        //创建新的一行
        var tr = document.createElement('tr');
        tableData[i] = [];
        for(var j = 0;j<curLevel.col;j++){
            var td = document.createElement('td');
            var div = document.createElement('div');
            //每个格子都会对应有一个js对象
            //对象储存了额外的一些信息
            tableData[i][j] = {
                row:i,//行
                col:j,//列
                type:'number',//属性 数字number/雷mine
                value:0,//周围雷的数量
                index,//格子的下标
                checked:false//是否被检验过
            };

            //为每一个div添加一个下标
            div.dataset.id = index;
            //标记当前的div可以插旗
            div.classList.add("canflag");
            
            //查看当前格子的下标是否在雷的数组里面
            if(mineArray.includes(tableData[i][j].index)){
                tableData[i][j].type = 'mine';
                div.classList.add('mine');
            }
            
            td.appendChild(div);
            tr.appendChild(td);
            //下标自增
            index++;
        }
        table.appendChild(tr);
    }
    mineArea.appendChild(table);
    // console.log(tableData);
}

/**
 * 显示答案
 */
function showAnswer(){
    //核心逻辑：
    // 要把所有的雷显示出来
    // 有些雷可能是插了旗的，需要判断插旗是否正确
    // 正确添加上绿色背景，错误加上红色背景

    var isAllRight = true;

    // 获取所有雷的dom元素
    var mineArr = $$("td>div.mine");
    for(var i =0;i<mineArr.length;i++){
        mineArr[i].style.opacity = 1;
    }

    //便利用户的插旗
    for(var i = 0;i<flagArray.length;i++){
        if(flagArray[i].classList.contains('mine')){
            flagArray[i].classList.add('right');
        }else{
            flagArray[i].classList.add('error');
            isAllRight =false;
        }
    }
    if(!isAllRight || flagArray.length!==curLevel.mineNum){
        gameOver(false);
    }

    //取消事件
    mineArea.onmousedown = null;

}

/**
 * 找到对应的dom在tableData里面的js对象
 * @param {*} cell 
 */
function getTableItem(cell){
    var index = cell.dataset.id;
    var flatTableData = tableData.flat();
    return flatTableData.filter(item => item.index ==index)[0];
}
/**
 * 会返回该对象对应的四周的边界
 * @param {*} obj 
 */
function getBound(obj){
    //确定边界

    //上下边界
    var rowTop = obj.row - 1<0 ? 0:obj.row - 1;
    var rowBottom =  obj.row + 1 ===curLevel.row ? curLevel.row - 1:obj.row + 1;

    //左右边界
    var colLeft = obj.col - 1 <0 ? 0: obj.col - 1;
    var colRight = obj.col + 1 ===curLevel.col? curLevel.col - 1: obj.col + 1;
    return {
        rowTop,rowBottom,colLeft,colRight
    };

}
/**
 * 返回的是周围一圈雷的数量
 * @param {*} obj 格子对应的js对象
 */
function findMineNum(obj){
    var count = 0;//地雷计数器

    var {rowTop, rowBottom, colLeft, colRight} = getBound(obj);

    for(var i = rowTop;i<=rowBottom;i++){
        for(var j = colLeft;j<=colRight;j++){
            if(tableData[i][j].type === "mine"){
                count++;
            }
        }
    }
    return count;
}
/**
 * 根据tabledata中的js对象，返回对应的div
 * @param {*} obj 
 */
function getDom(obj){
    //获取到所有的div
    var divArray =$$('td>div');
    //返回对应下标的 div
    return divArray[obj.index];
}
/**
 * 搜索该单元格周围的九宫格区域
 * @param {*} cell 用户点击的单元格
 */
function getAround(cell){
    if(!cell.classList.contains('flag')){

        cell.parentNode.style.border ="none";
        cell.classList.remove("canFlag"); 
        // 1、获取到该dom元素在tableData里的对象
        var tableItem = getTableItem(cell);
        if(!tableItem){
            return;
        }
    
        //当前单元格已经呗核对过了
        tableItem.checked = true;
        //接下来，得到了 DOM 对象多对应的 js 对象
        // 那我们就可以查看周围一圈是否有雷
        var mineNum = findMineNum(tableItem);
        if(!mineNum){
            //进入此if，说明周围没有雷，继续搜索
            var {rowTop, rowBottom, colLeft, colRight} = getBound(tableItem);
            for(var i = rowTop;i<=rowBottom;i++){
                for(var j = colLeft;j<=colRight;j++){
                    if(!tableData[i][j].checked){
                    getAround(getDom(tableData[i][j]));
                    }
                }
            }
        }else{
            //说明周围有雷，显示当前格子周围的雷的数量
            var cl =['zero','one','two','three','four','five','six','seven','eight'];
            cell.classList.add(cl[mineNum]);
            cell.innerHTML = mineNum;
        }
    }
}
/**
 * 区域探索
 */
function searchArea(cell){
//核心思路：
    // 整体分析为三种情况
    // 1、当前单元格时雷，游戏结束
    if(cell.classList.contains("mine")){
        // 进入此if，说明踩雷了
        cell.classList.add("error");
        showAnswer();
        return;
    }
    // 2、当前单元格不是雷，判断周围一圈有没有雷
    // 如果有雷，显示雷的数量
    // 如果没有雷，继续递归搜索
    getAround(cell);
}
/**
 * 判断用户插旗是否正确
 */
function isWin(){
for(var i = 0;i<flagArray.length;i++){
    if(!flagArray[i].classList.contains('mine')){
        return false;
    }
}
return true;
}
/**
 * 游戏结束
 * 分两种情况
 */
function gameOver(isWin){
    var mess = '';
    if(isWin){
        mess ="游戏胜利，你找出所有的雷~"
    }else{
        mess ="游戏失败~"
    }
   setTimeout(function(){
        window.alert(mess);
    },0)
}
/**
 * 插旗
 * @param {*} cell 用户点击的 DOM
 */
function flag(cell){
    //只有点击的 DOM 元素有canflag类，才可以插旗
    if(cell.classList.contains('canflag')){
        if(!flagArray.includes(cell)){
            //进行插旗操作
            flagArray.push(cell);
            cell.classList.add('flag');
            //还需要判断插旗数
            if(flagArray.length === curLevel.mineNum){
                if(isWin()){
                    gameOver(true);
                }
                showAnswer();
            }
        }else{
            //说明这个单元格已经在数组里面了
            //也就是说，用户要取消插旗
            var index =flagArray.indexOf(cell)
            flagArray.splice(index,1);
            cell.classList.remove('flag');
        }
        $('.flagNum').innerHTML = flagArray.length;
    }
}


/**
 * 绑定事件
 */
function bindEvent(){
    mineArea.onmousedown = function(e){
        if(e.button === 0){
            //左键，探索操作
            searchArea(e.target);
        }
        if(e.button === 2){
            //右键，插旗操作
            flag(e.target);
        }
    }
    //阻止鼠标右键默认行为
    mineArea.oncontextmenu = function(e){
        e.preventDefault();
    }    

    //游戏难度选择
    $(".level").onclick = function(e){
        for(var i = 0;i<btns.length;i++){
            btns[i].classList.remove("active");
        }
        e.target.classList.add("active");
        switch(e.target.innerHTML){
            case '初级':{
                curLevel = config.easy;
                break;
            }
            case '中级':{
                curLevel = config.normal;
                break;
            }
            case '高级':{
                curLevel = config.hard;
                break;
            }
        }
        initGame();
        bindEvent();
    }
}


//程序入口
function main(){
    //1、游戏的初始化
    initGame();
    //2、绑定事件
    bindEvent();
}
main();
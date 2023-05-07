/**
 * 游戏配置
 */
// 不同级别的配置信息
var config = {
    easy:  {row:10,col:10,mineNum:10},
    normal:{row:15,col:15,mineNum:30},
    hard:  {row:30,col:30,mineNum:60}
}
// 游戏一开始难度为简单
 var curLevel = config.easy;
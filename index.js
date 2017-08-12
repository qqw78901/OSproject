/**
 * Created by GDUT-z on 2016/12/20 0028.
 */
var RT = 2;//并发数默认2
var taskArr = [];
var rest_RAM = 100;
var rest_tap = 4;
//wait ready,run,finish
var current_time = 0;
var $runLog;
//从输入转换成数据结构
function getDetail() {
    taskArr = [];
    var name, arrive_time, run_time, need_RAM, need_tap;
    $('#table').find('tr').each(function (i) {
        name = $(this).find('input[name=name]').val();
        arrive_time = $(this).find('input[name=arrive_time]').val() * 1;
        run_time = $(this).find('input[name=run_time]').val() * 1;
        need_RAM = $(this).find('input[name=need_ram]').val() * 1;
        need_tap = $(this).find('input[name=need_tap]').val() * 1;
        var taskObj = {
            index: i,
            name: name,
            arrive_time: arrive_time,//到达时间
            run_time: run_time,//需要运行时间
            need_RAM: need_RAM,
            need_tap: need_tap,
            state: 'wait'
        };
        taskArr.push(taskObj);
    });
}
//作业调度
//先来先服务
function FCFS() {
    var obj = findState(taskArr);
    var order = obj['wait'].sort(sortByArrive);//从等待进程中按照到达时间排序
    var mark = 1;
    $(order).each(function (i, val) {
        if (current_time >= val.arrive_time) {
            if (current_time == val.arrive_time) {
                console.log(current_time + "时刻:" + val.name + "到达需要RAM,TAP" + val.need_RAM + ',' + val.need_tap + "剩余ram:", rest_RAM + '剩余TAP:' + rest_tap);
                $runLog.append(current_time + "时刻:" + val.name + "到达;需要RAM,TAP" + val.need_RAM + ',' + val.need_tap + "剩余ram:", rest_RAM + '剩余TAP:' + rest_tap + "</br>");
                //显示在状态列表
                $('#wait_group').append(
                    "<li class='list-group-item' name='task_" + val.index +
                    "'>" + current_time + "时刻&emsp;"
                    + val.name +
                    "——运行时间：" + val.run_time +
                    " 需要资源[" + val.need_RAM + "," + val.need_tap +
                    "]</li>");
            }
            if (val.need_RAM <= rest_RAM && val.need_tap <= rest_tap) {
                //满足需要，可以进行
                taskArr[val.index].state = 'ready';
                taskArr[val.index].enter_time = current_time;
                taskArr[val.index].enter_time_mark = mark++;
                rest_RAM -= val.need_RAM;
                rest_tap -= val.need_tap;
                //减去资源
                console.log(current_time + "时刻:" + val.name + "进入就绪，剩余ram:", rest_RAM + '剩余TAP:' + rest_tap);
                $runLog.append(current_time + "时刻:" + val.name + "进入就绪，剩余ram:", rest_RAM + '剩余TAP:' + rest_tap + "</br>");
                //显示在状态列表
                $('[name=task_' + val.index + ']').remove();
                $('#ready_group').append(
                    "<li class='list-group-item' name='task_" + val.index +
                    "'>" + current_time + "时刻&emsp;"
                    + val.name +
                    "——运行时间：" + val.run_time +
                    " 需要资源[" + val.need_RAM + "," + val.need_tap +
                    "]</li>");
            }
        }
    })


}
//最小作业优先
function SJF() {
    var obj = findState(taskArr);
    var order = obj['wait'].sort(sortByRam);//按照等待进程中作业内存大小排序
    var mark = 1;
    $(order).each(function (i, val) {
        if (current_time >= val.arrive_time) {
            if (current_time == val.arrive_time) {
                console.log(current_time + "时刻:" + val.name + "到达需要RAM,TAP" + val.need_RAM + ',' + val.need_tap + "剩余ram:", rest_RAM + '剩余TAP:' + rest_tap);
                $runLog.append(current_time + "时刻:" + val.name + "到达;需要RAM,TAP" + val.need_RAM + ',' + val.need_tap + "剩余ram:", rest_RAM + '剩余TAP:' + rest_tap + "</br>");
                $('#wait_group').append(
                    "<li class='list-group-item' name='task_" + val.index +
                    "'>" + current_time + "时刻&emsp;"
                    + val.name +
                    "——运行时间：" + val.run_time +
                    " 需要资源[" + val.need_RAM + "," + val.need_tap +
                    "]</li>");
            }

            if (val.need_RAM <= rest_RAM && val.need_tap <= rest_tap) {
                //满足需要，可以进行
                taskArr[val.index].state = 'ready';
                taskArr[val.index].enter_time = current_time;
                taskArr[val.index].enter_time_mark = mark++;
                rest_RAM -= val.need_RAM;
                rest_tap -= val.need_tap;
                //减去资源
                console.log(current_time + "时刻:" + val.name + "进入就绪，剩余ram:", rest_RAM + '剩余TAP:' + rest_tap);
                $runLog.append(current_time + "时刻:" + val.name + "进入就绪，剩余ram:", rest_RAM + '剩余TAP:' + rest_tap + "</br>");
                $('[name=task_' + val.index + ']').remove();
                $('#ready_group').append(
                    "<li class='list-group-item' name='task_" + val.index +
                    "'>" + current_time + "时刻&emsp;"
                    + val.name +
                    "——运行时间：" + val.run_time +
                    " 需要资源[" + val.need_RAM + "," + val.need_tap +
                    "]</li>");
            }
        }
    })

}

//进程调度
//先来先服务
function process_FCFS() {
    var obj = findState(taskArr);
    var order = obj['ready'].sort(sortByEnter);//从等待进程中按照到达时间排序
    $(order).each(function (i, val) {//已经按进入时间排序;
        if (RT == 0)
            return;
        taskArr[val.index].state = 'run';
        taskArr[val.index].start_run_time = current_time;
        RT--;//消耗一个进程
        console.log(current_time + "时刻:" + taskArr[val.index].name + "开始运行，需要运行时间" + taskArr[val.index].run_time + ";预计完成时间" + (taskArr[val.index].run_time + current_time) + ";剩余进程数：" + RT);
        $runLog.append(current_time + "时刻:" + taskArr[val.index].name + "开始运行，需要运行时间" + taskArr[val.index].run_time + ";预计完成时间" + (taskArr[val.index].run_time + current_time) + ";剩余进程数：" + RT + "</br>");
        $('[name=task_' + val.index + ']').remove();
        $('#run_group').append(
            "<li class='list-group-item' name='task_" + val.index +
            "'>" + current_time + "时刻&emsp;"
            + val.name +
            " 资源[" + val.need_RAM + "," + val.need_tap +
            "]</li>");
    });
}
//最短进程优先SPF
function process_SPF() {
    var obj = findState(taskArr);
    var order = obj['ready'].sort(sortByRunTime);//由于是非抢占,从等待进程中按照需要运行的时间排序
    $(order).each(function (i, val) {//已经按进入时间排序;
        if (RT == 0)
            return;
        taskArr[val.index].state = 'run';
        taskArr[val.index].start_run_time = current_time;
        RT--;//消耗一个进程
        console.log(current_time + "时刻:" + taskArr[val.index].name + "开始运行，需要运行时间" + taskArr[val.index].run_time + ";预计完成时间" + (taskArr[val.index].run_time + current_time) + ";剩余进程数：" + RT);
        $runLog.append(current_time + "时刻:" + taskArr[val.index].name + "开始运行，需要运行时间" + taskArr[val.index].run_time + ";预计完成时间" + (taskArr[val.index].run_time + current_time) + ";剩余进程数：" + RT + "</br>");
        $('[name=task_' + val.index + ']').remove();
        $('#run_group').append(
            "<li class='list-group-item' name='task_" + val.index +
            "'>" + current_time + "时刻&emsp;"
            + val.name +
            " 资源[" + val.need_RAM + "," + val.need_tap +
            "]</li>");
    });


}
//遍历某状态的作业进程
function findState(arr) {
    var wait = [], ready = [], run = [];
    var obj = {};
    $(arr).each(function () {
        if (this.state == 'wait')
            wait.push(this);
        else if (this.state == 'ready')
            ready.push(this);
        else if (this.state == 'run')
            run.push(this);

    });
    obj.wait = wait;
    obj.ready = ready;
    obj.run = run;
    return obj;
}
//作业-先来先服务排序
function sortByArrive(a, b) {
    return a.arrive_time - b.arrive_time;
}
//进程-先来先服务排序
function sortByEnter(a, b) {
    if (a.enter_time == b.enter_time)
        return a.enter_time_mark - b.enter_time_mark;//如果同时到达，按照顺序排序
    return a.enter_time - b.enter_time;
}
//最短进程排序
function sortByRunTime(a, b) {
    return a.run_time - b.run_time;
}
//最小作业优先排序
function sortByRam(a, b) {
    return a.need_RAM - b.need_RAM;
}
//主运行函数
$(function () {
    var jobType, pType;
    var interval;
    $('#start_btn').click(function () {
        jobType = $('input[name=zuoye]:checked').val();
        pType = $('input[name=jincheng]:checked').val();
        RT = parseInt($('#RT_num').val()) || 2;
        getDetail();
        $runLog = $('#run_log');
        interval = setInterval(function () {
            //console.log(current_time);//时间轴
            $('#r_time').html(current_time);
            $('#r_ram').html(rest_RAM);
            $('#r_tap').html(rest_tap);
            $('#r_rt').html(RT);
            if (jobType == "F") {
                FCFS();
            } else {
                SJF()
            }
            if (pType == "F") {
                process_FCFS();
            } else {
                process_SPF();
            }
            runAndUpdate();
            current_time++;
            if(JudgeEnd()){
                clearInterval(interval);
                console.log('over');
                $runLog.append('运行结束' + "</br>");
                $('#r_ram').html(rest_RAM);
                $('#r_tap').html(rest_tap);
                $('#r_rt').html(RT);
                calculate();
            }
        }, 1000);
    });
    $('#stop_btn').click(function () {
        clearInterval(interval);
        $runLog.append('运行结束' + "</br>");
    });
    $('#add_btn').click(function () {
        var content = " <tr> <td><input type='text' name='name'></td> " +
            "<td><input type='text' name='arrive_time'></td>" +
            " <td><input type='text' name='run_time'></td> " +
            "<td><input type='text' name='need_ram'></td> " +
            "<td><input type='text' name='need_tap'></td> </tr>";
        $('#table').append(content);
    });
    $('#remove_btn').click(function () {
        $('#table tr:last').remove();
    });
    $('#reset_btn').click(function () {
        RT = 2;//并发数
        taskArr = [];
        rest_RAM = 100;
        rest_tap = 4;
//wait ready,run,finish
        current_time = 0;
        $("#run_log").html("");
        $('#show_ui').html("    <div class=\"col-md-3\"><ul class=\"list-group\" id=\"wait_group\">" +
        " <li class=\"list-group-item text-center \"><b>等待(堵塞)</b></li> </ul> </div> <div class=\"col-md-3\">" +
        " <ul class=\"list-group\" id=\"ready_group\"> <li class=\"list-group-item text-center\"><b>就绪</b></li> </ul> " +
        "</div> <div class=\"col-md-3\"> <ul class=\"list-group\" id=\"run_group\">" +
        " <li class=\"list-group-item text-center\"><b>运行</b></li> </ul> </div> <div class=\"col-md-3\"> " +
        "<ul class=\"list-group\" id=\"finish_group\"> <li class=\"list-group-item text-center\"><b>完成</b></li> </ul> " +
        "</div>")
        $("#result_table").html("");
        $("#aver").html("");

    })


});

//运行
function runAndUpdate() {
    var running = findState(taskArr).run;//在运行的进程
    $(running).each(function () {
        //current_time - this.start_run_time是已经运行的时间
        if (current_time - this.start_run_time == this.run_time) {
            taskArr[this.index].finish_time = current_time;
            taskArr[this.index].state = 'finish';
            //资源释放
            rest_RAM += taskArr[this.index].need_RAM;
            rest_tap += taskArr[this.index].need_tap;
            //归还进程
            RT++;
            console.log(current_time + "时刻:" + taskArr[this.index].name + "处理完成,剩余ram:", rest_RAM + '剩余TAP:' + rest_tap + "剩余进程数：" + RT);
            $runLog.append(current_time + "时刻:" + taskArr[this.index].name + "处理完成,剩余ram:", rest_RAM + '剩余TAP:' + rest_tap + "剩余进程数：" + RT + "</br>");
            $('[name=task_' + this.index + ']').remove();
            $('#finish_group').append(
                "<li class='list-group-item' name='task_" + this.index +
                "'>" + current_time + "时刻&emsp;"
                + this.name +
                " 资源[" + this.need_RAM + "," + this.need_tap +
                "]</li>");
            current_time--;
        }
    })
}
//遍历是否所有作业都已经处理完成
/**
 * 判断是否已经全部完成
 * @return {boolean}
 */
function JudgeEnd(){
    var end=true;
    $(taskArr).each(function(i,val){
        if(val.state!='finish'){
            end=false;
            return end;
        }
    });
    return end;

}
//计算并显示平均周转时间
function calculate(){
    var total=0;
    var num =  $(taskArr).length;
    $(taskArr).each(function(){
        var time = this.finish_time - this.arrive_time;
        total+=time;
        var content = "   <tr><td>" +this.name+
            "</td><td>" +this.arrive_time+
            "</td><td>" +this.enter_time+
            "</td><td>" +this.finish_time+
            "</td>  <td class='zztime'>" +time+
            "</td> </tr>";
        $('#result_table').append(content);
    });
    $('#aver').html("平均周转时间："+(total/num));


}
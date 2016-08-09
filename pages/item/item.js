/*
//
// Copyright (c) Microsoft. All rights reserved.
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
*/
(function () {
    "use strict";

    var lView;

    WinJS.UI.Pages.define("/pages/item/item.html", {
        //这里加载资源文件（.rejson）
        processed: function (element) {
            lView = element.querySelector("#itemList").winControl;
            return WinJS.Resources.processAll(element);
        },

        //页面准备好
        ready: function (element, options) {
            //获取到导航传递的数据
            var item = options.item;
            //给element绑定数据
            WinJS.Binding.processAll(element, item);

            //指定itemList的数据
            lView.itemDataSource = ControlsData.createFilteredControlList(item.groupKey).dataSource;
        },

        //点击每一个item后触发的事件
        itemInvoked: WinJS.UI.eventHandler(function (eventInfo) {
            lView.itemDataSource.itemFromIndex(eventInfo.detail.itemIndex).done(function completed(item) {
                WinJS.Navigation.navigate(item.data.target, {item: item.data});
            });          
        }),        
    });
})();

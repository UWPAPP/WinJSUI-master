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

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;
    var controlGroupsListView;
    var controlsListView;


    //定义一个pageControl
    var hubPage = WinJS.UI.Pages.define("/pages/hub/hub.html", {
        processed: function (element) {
            return WinJS.Resources.processAll(element);
            return WinJS.UI.process();
        },

        //TODO:这里hub.onloadingstatechanged 会造成延迟
        ready: function (element, options) {
            var hub = element.querySelector(".hub").winControl;
            //this._hubReady(hub);
            hub.onloadingstatechanged = function (args) {
                if (args.srcElement === hub.element && args.detail.loadingState === "complete") {
                    this._hubReady(hub);
                    hub.onloadingstatechanged = null;
                }
            }.bind(this);

            //用户点击hub的header
            hub.onheaderinvoked = function (args) {
                args.detail.section.onheaderinvoked(args);
            };

            //获取控件
            controlGroupsListView =
                element.querySelector("#controlsBycontrolGroupsListView");
            controlsListView =
                element.querySelector("#allControlsListView");
        },

        //页面消失
        unload: function () {
            // 记录hub的位置
            session.hubScroll = document.querySelector(".hub").winControl.scrollPosition;
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />
            //  Respond to changes in layout.
        },

        //还原hub的位置
        _hubReady: function (hub) {
            if (typeof session.hubScroll === "number") {
                hub.scrollPosition = session.hubScroll;
            }
        },

        //item被触发的事件，已经在hub.html中声明
        itemInvoked: WinJS.UI.eventHandler(function (eventInfo) {
            console.log(eventInfo);
            controlsListView.winControl.itemDataSource.itemFromIndex(eventInfo.detail.itemIndex).done(function completed(item) {
                WinJS.Navigation.navigate(item.data.target, {item: item.data});
            });
        }),

        //分组listView的item被触发后的事件
        groupInvoked: WinJS.UI.eventHandler(function (eventInfo) {
            controlGroupsListView.winControl.itemDataSource.itemFromIndex(eventInfo.detail.itemIndex).done(function completed(item) {
                WinJS.Navigation.navigate("/pages/item/item.html", { item: item.data});
            });
        }),
    });
})();
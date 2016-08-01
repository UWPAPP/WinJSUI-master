
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    //TODO:？？？？？？？
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;
    var appBar;
    var cmdStylesheet;

    //应用程序激活
    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {

            } else {

            }

            //导航的历史信息
            nav.history = app.sessionState.history || {};
            nav.history.current.initialPlaceholder = true;

            app.onsettings = null;
            //app的onSettings方法
            app.onsettings = function (e) {
                var resSettingsHelpLabel = WinJS.Resources.getString('/help/settingsHelpLabel');
                var resSettingsPrivacyLabel = WinJS.Resources.getString('/privacy/settingsPrivacyLabel');
                e.detail.applicationcommands = {
                    "help": { title: resSettingsHelpLabel.value, href: "/settings/help.html" },
                    "privacy": { title: resSettingsPrivacyLabel.value, href: "/settings/privacy.html" }
                };
                WinJS.UI.SettingsFlyout.populateSettings(e);
            }

            //禁用动画
            ui.disableAnimations();
            //创建所有的WinJS控件
            var p = ui.processAll().then(function () {
                return nav.navigate(nav.location || Application.navigator.home, nav.state);
            }).then(function () {
                //TODO:？？？？？？？？？？？？？？
                return sched.requestDrain(sched.Priority.aboveNormal + 1);
            }).then(function () {
                //开启动画，给导航按钮和helpButton注册事件
                ui.enableAnimations();
                appBar = document.getElementById("appbar").winControl;

                cmdStylesheet = appBar.getCommandById("cmdStylesheet");
                cmdStylesheet.addEventListener('click', doCmdStylesheet);
                initStyleSheetToggle();

                var helpButton = appBar.getCommandById("helpButton");
                helpButton.addEventListener("click", showHelp, false);
            });

            //保证promise中的异步执行任务完毕，相当于GetDefferal
            args.setPromise(p);
        }
    });


    //app已经准备好
    app.onready = function (args) {
        //弹出提示框，第一次使用程序的时候弹出
        var disclaimer = Windows.Storage.ApplicationData.current.roamingSettings.values["disclaimer"];
        if (!disclaimer) {
            var resDisclaimerTitle = WinJS.Resources.getString('disclaimerTitle');
            var resDisclaimer = WinJS.Resources.getString('disclaimer');
            var resDisclaimerButton = WinJS.Resources.getString('disclaimerButton');
            var msg = new Windows.UI.Popups.MessageDialog(resDisclaimer.value, resDisclaimerTitle.value);
            msg.commands.append(new Windows.UI.Popups.UICommand(resDisclaimerButton.value, handleDisclaimer));
            msg.showAsync();
        }
    };

    //app被暂停，需要记录信息
    app.oncheckpoint = function (args) {
        app.sessionState.history = nav.history;
    };


    //点击提示框按钮的事件
    function handleDisclaimer(eventInfo) {
        var appData = Windows.Storage.ApplicationData.current;
        var roamingSettings = appData.roamingSettings;
        roamingSettings.values["disclaimer"] = true;
    }

    // 显示帮助信息
    function showHelp(eventInfo) {
        eventInfo.preventDefault();
        WinJS.UI.SettingsFlyout.showSettings("help", "/settings/help.html");
        appBar.hide();
    }

    app.start();

    //切换系统样式按钮点击后
    function doCmdStylesheet(eventInfo) {
        var selected = cmdStylesheet.selected;
        if (selected) {
            switchStyleDark();
        }
        else {
            switchStyleLight();
        }
    }

    //标记doCmdStylesheet方法是安全的
    WinJS.Utilities.markSupportedForProcessing(doCmdStylesheet);

    //切换深色
    function switchStyleDark() {
        var uiLightString = "ui-light.css";
        var uiDarkString = "ui-dark.css";
        for (var i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].href &&
                document.styleSheets[i].href.lastIndexOf(uiDarkString) === (document.styleSheets[i].href.length - uiDarkString.length)) {
                document.styleSheets[i].disabled = false;
            }
            if (document.styleSheets[i].href &&
                document.styleSheets[i].href.lastIndexOf(uiLightString) === (document.styleSheets[i].href.length - uiLightString.length)) {
                document.styleSheets[i].disabled = true;
            }
        }

        var htmlElement = WinJS.Utilities.removeClass(document.body, "ui-light");
        htmlElement = WinJS.Utilities.addClass(document.body, "ui-dark");
        //console.log(htmlElement);
        //console.log(document.body);
        //TODO:docement究竟是什么？？？？？？？？？？？？为什么打印出来看不明白
    }

    //切换浅色
    function switchStyleLight() {
        var uiLightString = "ui-light.css";
        var uiDarkString = "ui-dark.css";
        for (var i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].href &&
                document.styleSheets[i].href.lastIndexOf(uiDarkString) === (document.styleSheets[i].href.length - uiDarkString.length)) {
                document.styleSheets[i].disabled = true;
            }
            if (document.styleSheets[i].href &&
                document.styleSheets[i].href.lastIndexOf(uiLightString) === (document.styleSheets[i].href.length - uiLightString.length)) {
                document.styleSheets[i].disabled = false;
            }
        }

        WinJS.Utilities.removeClass(document.body, "ui-dark");
        WinJS.Utilities.addClass(document.body, "ui-light");
    }

    //初始化cmdStylesheet按钮的状态
    function initStyleSheetToggle() {
        cmdStylesheet.selected = true;
    }

    //导航栏按钮被触发，导航到对应的页面
    function navBarItemInvoked(eventInfo) {
        WinJS.Navigation.navigate("/pages/item/item.html", { item: eventInfo.detail.data });
    }

    //搜索按钮被触发，导航到搜索页面
    function searchHandler(args) {
        WinJS.Navigation.navigate('/pages/search/searchResults.html', args.detail);
    }

    //搜索文字发生改变触发的方法
    function suggestionsRequestedHandler(args) {
        var queryText = args.detail.queryText,
        query = queryText.toLocaleLowerCase(),
        //搜索集合
        suggestionCollection = args.detail.searchSuggestionCollection;
        if (queryText.length > 0) {
            //遍历集合查找符合条件的元素
            ControlsData.controlsList.forEach(
                function (element, index, array) {
                    if (element.title.substr(0, query.length).toLocaleLowerCase() === query) {
                        suggestionCollection.appendQuerySuggestion(element.title);
                    }
                    else if (element.controlName.substr(0, query.length).toLocaleLowerCase() === query)
                    {
                        suggestionCollection.appendQuerySuggestion(element.controlName);
                    }
                });

            //linguisticDetails.queryTextAlternatives 查询文本的文本选择列表
            args.detail.linguisticDetails.queryTextAlternatives.forEach(
                function (element, index, array) {
                    if (element.substr(0, query.length).toLocaleLowerCase() === query) {
                        suggestionCollection.appendQuerySuggestion(element);
                    }
                });
        }
    }

    //定义一个命名空间
    WinJS.Namespace.define("SampleNavigation",
    {
        navBarItemInvoked: WinJS.UI.eventHandler(navBarItemInvoked),
        searchHandler: WinJS.UI.eventHandler(searchHandler),
        suggestionsRequestedHandler: WinJS.UI.eventHandler(suggestionsRequestedHandler)
    }
    );

})();





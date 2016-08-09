// Connect the Search Results Page to your in-app search.
// For an introduction to the Search Results Page template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232512
(function () {
    "use strict";

    var ui = WinJS.UI;
    //WinJS.Utilities是一个命名空间，包含了枚举、object对象以及一些方法
    var utils = WinJS.Utilities;
    var listView = null;

    //定义一个pageControl
    WinJS.UI.Pages.define("/pages/search/searchResults.html", {
        _filters: [],
        _lastSearch: "",

        init: function (element, options) {
            //初始化itemInvoked，这个东东在searchResults.html中用到
            this.itemInvoked = ui.eventHandler(this._itemInvoked.bind(this));
        },

        processed: function (element) {
            return WinJS.Resources.processAll(element);
        },

        ready: function (element, options) {
            listView = element.querySelector(".resultslist").winControl;
            this._handleQuery(element, options);
            //listView获取焦点
            listView.element.focus();
        },

        updateLayout: function (element) {
        },

        // 过滤originalResults数组,并将符合条件的元素放到filter的results里面
        _applyFilter: function (filter, originalResults) {
            if (filter.results === null) {
                filter.results = originalResults.createFiltered(filter.predicate);
            }
            return filter.results;
        },

        //切换filterbar内容的时候重新指定listView数据
        _filterChanged: function (element, target, filterIndex) {
            var filterBar = element.querySelector(".filterbar");
            var listView = element.querySelector(".resultslist").winControl;

            utils.removeClass(filterBar.querySelector(".highlight"), "highlight");
            utils.addClass(target, "highlight");

            listView.itemDataSource = this._filters[filterIndex].results.dataSource;
        },


 
        // 创建filter大类，给每个大类指定类名(All,Button等)，并给每个大类指定谓词过滤的条件
        _generateFilters: function () {
            this._filters = [];
            this._filters.push({
                results: null, text: "All", predicate: function (item) {
                    return true;
                }
            });

            //var filters = this._filters;
            window.ControlsData.controlGroupsList.forEach(
                function (element, index, array) {
                    this._filters.push({
                        results: null, text: element.label, predicate: function (item) {
                            var found = false;
                            for (var i = 0; i < item.groups.length && !found; i++) {
                                found = item.groups[i].groupKey === element.groupKey;
                            }
                            return found;
                        }
                    });
                }.bind(this)
                );
        },


        _handleQuery: function (element, args) {
            var originalResults;
            this._lastSearch = args.queryText;
            WinJS.Namespace.define("searchResults", { markText: WinJS.Binding.converter(this._markText.bind(this)) });
            //初始化检索内容
            this._initializeLayout(element);
            //创建this._filters数组，(all类，appbar类，等等，并指定每一个大类的predicate谓词)
            this._generateFilters();

            //根据指定文本查询符合条件的数据
            originalResults = this._searchData(args.queryText);
            if (originalResults.length === 0) {
                //让filterbar不显示
                document.querySelector('.filterbar').style.display = "none";
            } else {
                //让resultmessage不显示
                document.querySelector('.resultsmessage').style.display = "none";
            }

            // 创建filter数组，完成页面数据指定
            this._populateFilterBar(element, originalResults);
            this._applyFilter(this._filters[0], originalResults);
        },

        //初始化检索内容
        _initializeLayout: function (element) {
            element.querySelector(".titlearea .pagesubtitle").textContent = "Results for “" + this._lastSearch + '”';
        },



        _itemInvoked: function (args) {
            console.log(args);
            args.detail.itemPromise.done(function itemInvoked(item) {
                WinJS.Navigation.navigate(item.data.target, {item: item.data})
            });
        },

        //创建mark标签
        _markText: function (text) {
            return text.replace(this._lastSearch, "<mark>" + this._lastSearch + "</mark>");
        },


        // 创建filter数组，完成页面数据指定
        _populateFilterBar: function (element, originalResults) {
            var filterBar = element.querySelector(".filterbar");
            var listView = element.querySelector(".resultslist").winControl;
            var li, option, filterIndex;

            filterBar.innerHTML = "";
            for (filterIndex = 0; filterIndex < this._filters.length; filterIndex++) {
                //将originalResults 数组中的元素通过过滤放到this._filters中
                this._applyFilter(this._filters[filterIndex], originalResults);
                // 如果this._filters[filterIndex].results有内容
                if (this._filters[filterIndex].results.length > 0) {
                    //创建li元素
                    li = document.createElement("li");
                    li.filterIndex = filterIndex;
                    li.tabIndex = 0;
                    //指定li元素标签的内容
                    li.textContent = this._filters[filterIndex].text + " (" + this._filters[filterIndex].results.length + ")";
                    //给li元素注册事件
                    li.onclick = function (args) { this._filterChanged(element, args.target, args.target.filterIndex); }.bind(this);
                    
                    li.onkeyup = function (args) {
                        if (args.key === "Enter" || args.key === "Spacebar")
                            this._filterChanged(element, args.target, args.target.filterIndex);
                    }.bind(this);
                    //li标签添加class
                    utils.addClass(li, "win-type-interactive");
                    utils.addClass(li, "win-type-x-large");
                    filterBar.appendChild(li);

                    //默认让第0个元素高亮，同时指定listView的数据为_filters数组中第0个元素的results内容
                    if (filterIndex === 0) {
                        utils.addClass(li, "highlight");
                        listView.itemDataSource = this._filters[filterIndex].results.dataSource;
                    }
                }
            }
        },

        //给数据排序
        _compareResults: function(firstItem, secondItem)
        {
            if (firstItem.ranking == secondItem.ranking)
            {
                return 0;
            }
            else if (firstItem.ranking < secondItem.ranking)
                return 1;
            else
                return -1;
        },

        // 检索数据
        _searchData: function (queryText) {
            var originalResults;
            var lowerCaseQueryText = queryText.toLocaleLowerCase();
            if (window.ControlsData) {
                //从数据源中检索数据
                originalResults = ControlsData.controlsList.createFiltered(function (item) {
                    item.ranking = -1; 
                    if (item.title.toLocaleLowerCase().indexOf(lowerCaseQueryText) >= 0) {
                        item.ranking += 10; 
                    }
                    if (item.controlName.toLocaleLowerCase().indexOf(lowerCaseQueryText) >= 0) {
                        item.ranking += 5; 
                    }
                    if (item.desc.toLocaleLowerCase().indexOf(lowerCaseQueryText) >= 0)
                    {
                        item.ranking += 1; 
                    }
                    return (item.ranking >= 0); 
                });
                //给数据排序
                originalResults = originalResults.createSorted(this._compareResults);              
            }
            else {
                originalResults = new WinJS.Binding.List();
            }
            return originalResults;
        }
    });
})();

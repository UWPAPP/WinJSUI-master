
//自定义控件，用来显示代码信息
(function () {
    var snippetViewer = WinJS.Class.define(
        //构造方法
        function (element, options) {
            var self = this;
            console.log(element);
     
            this._element = element || document.createElement("div");
            console.log(this._element);
            //绑定winControl
            this._element.winControl = this;

            //添加codeSnippet  class
            var currentContent = this._element.innerHTML;
            this._element.innerHTML = "";
            WinJS.Utilities.addClass(this._element, "codeSnippet");

            //添加buttonDiv class
            var buttonDiv = document.createElement("div");
            WinJS.Utilities.addClass(buttonDiv, "buttonDiv");
            this._element.appendChild(buttonDiv);

            options = options || {};

            //buttonDIv下面添加span标签
            if (!options.heading) {
                options.heading = "HTML"
            }
            var codeHeading = document.createElement("span");
            codeHeading.innerText = options.heading;
            buttonDiv.appendChild(codeHeading);

            //buttonDIv下面添加copyButton（显示在右侧的copy按钮）
            this._copyButton = document.createElement("button");
            this._copyButton.innerText = WinJS.Resources.getString("CopyButtonText").value;
            buttonDiv.appendChild(this._copyButton);

            //创建pre标签，指定pre标签的innerHTML内容
            this._codeDisplay = document.createElement("pre");
            this._element.appendChild(this._codeDisplay);
            this._codeDisplay.innerHTML = currentContent;

            //给copyButton添加事件
            this._copyButton.addEventListener("click", function (eventInfo) {
                //拷贝数据
                var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
                dataPackage.requestedOperation = Windows.ApplicationModel.DataTransfer.DataPackageOperation.copy;
                dataPackage.setRtf(self._codeDisplay.outerText);
                dataPackage.setText(self._codeDisplay.outerText);
                dataPackage.setHtmlFormat(Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(self._codeDisplay.outerHTML));
                Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
            });
        },

   {
        refreshLayout: function () {

        },
        element: {
            get: function () { return this._element; }
        },
    });
    

    //定义一个命名空间
    WinJS.Namespace.define("SampleUtilities", {
        SnippetViewer: snippetViewer
    });

})();
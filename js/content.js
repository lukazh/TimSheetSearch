let script = document.createElement('script');
var searchFuntionString = 
	`function Search(instance) {
		this.query = function (queryStr, callback, queryMethod) {
			var rowCount = instance.countRows();
			var colCount = instance.countCols();
			var queryResult = [];

			if (!callback) {
				callback = Search.global.getDefaultCallback();
			}

			if (!queryMethod) {
				queryMethod = Search.global.getDefaultQueryMethod();
			}

			for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				for (var colIndex = 0; colIndex < colCount; colIndex++) {
					var cellData = instance.getDataAtCell(rowIndex, colIndex);
					var cellProperties = instance.getCellMeta(rowIndex, colIndex);
					var cellCallback = cellProperties.search.callback || callback;
					var cellQueryMethod = cellProperties.search.queryMethod || queryMethod;
					var testResult = cellQueryMethod(queryStr, cellData);

					if (testResult) {
						var singleResult = {
							row: rowIndex,
							col: colIndex,
							data: cellData
						};

						queryResult.push(singleResult);
					}

					if (cellCallback) {
						cellCallback(instance, rowIndex, colIndex, cellData, testResult);
					}
				}
			}

			return queryResult;
		};
	};

	Search.DEFAULT_CALLBACK = function (instance, row, col, data, testResult) {
		instance.getCellMeta(row, col).isSearchResult = testResult;
	};

	Search.DEFAULT_QUERY_METHOD = function (query, value) {
		if (typeof query == 'undefined' || query == null || !query.toLowerCase || query.length === 0) {
			return false;
		}
		if (typeof value == 'undefined' || value == null) {
			return false;
		}

		return value.toString().toLowerCase().indexOf(query.toLowerCase()) != -1;
	};

	Search.DEFAULT_SEARCH_RESULT_CLASS = 'htSearchResult';

	Search.global = function () {

		var defaultCallback = Search.DEFAULT_CALLBACK;
		var defaultQueryMethod = Search.DEFAULT_QUERY_METHOD;
		var defaultSearchResultClass = Search.DEFAULT_SEARCH_RESULT_CLASS;

		return {
			getDefaultCallback: function getDefaultCallback() {
				return defaultCallback;
			},
			setDefaultCallback: function setDefaultCallback(newDefaultCallback) {
				defaultCallback = newDefaultCallback;
			},
			getDefaultQueryMethod: function getDefaultQueryMethod() {
				return defaultQueryMethod;
			},
			setDefaultQueryMethod: function setDefaultQueryMethod(newDefaultQueryMethod) {
				defaultQueryMethod = newDefaultQueryMethod;
			},
				getDefaultSearchResultClass: function getDefaultSearchResultClass() {
				return defaultSearchResultClass;
			},
			setDefaultSearchResultClass: function setDefaultSearchResultClass(newSearchResultClass) {
				defaultSearchResultClass = newSearchResultClass;
			}
		};
	}();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function SearchCellDecorator(instance, TD, row, col, prop, value, cellProperties) {
		var searchResultClass = cellProperties.search !== null && _typeof(cellProperties.search) == 'object' && cellProperties.search.searchResultClass || Search.global.getDefaultSearchResultClass();

		if (cellProperties.isSearchResult) {
			$(TD).addClass(searchResultClass);
		} else {
			$(TD).removeClass(searchResultClass);
		}
	};

	var originalBaseRenderer = (0, Handsontable.renderers.getRenderer)('base');

	(0, Handsontable.renderers.registerRenderer)('base', function (instance, TD, row, col, prop, value, cellProperties) {
		originalBaseRenderer.apply(this, arguments);
		SearchCellDecorator.apply(this, arguments);
	});`;
script.textContent = `(function() {
	// override the original method
	onAfterAddTable4Sheet = function(B, C) {
		if (window.isSheet) {
			$(window).bind("addClientVarsFinished", function() {
				window.sheet = createSheetOnce(null, B, C);
				var hot = sheet.hot;
				${searchFuntionString}
				sheet.hot.search = new Search(sheet.hot);

				var searchDomString = '<div style="z-index: 10000; position: fixed; top: 20px; left: 400px;"><input id="searchbox" style="height:25px;" type="text"><span id="searchresult"></span></div>';
				$("body").append(searchDomString);
				$("#searchbox").keyup(function(){
					var queryString = $(this).val().trim();
					var result = sheet.hot.search.query(queryString);
					if(queryString){
						$("#searchresult").text(result.length + " found");
					} else{
						$("#searchresult").text("");
					}
					sheet.hot.render();
				})
			});
		}
	}
	})();`;
(document.head||document.documentElement).appendChild(script);
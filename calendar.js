(function($) {
  $.fn.calendar = function(options) {
    var self = this;

    var defaults = {
      selectedDate: new Date(),
      displayMode: "week",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthNames: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ],
      data: [],
    }

    var options = $.extend(defaults, options);

    self.data = options.data;



    self.container = $('<div class="calendar-container"></div>').appendTo(self);
    self.topBar = $('<div class="topBar"></div>').appendTo(self.container);
    init();
    setDate(options.selectedDate);

    function init() {

      var sliders = $("<div class='inline'></div>").appendTo(self.topBar);
      var leftBtn = createButton("&lt;");
      var rightBtn = createButton("&gt;");

      leftBtn.click(function() {
        sideScroller(-1)
      });
      rightBtn.click(function() {
        sideScroller(1)
      });

      self.monthBtn = createButton("month");
      self.weekBtn = createButton("week").addClass("disabled");
      self.dayBtn = createButton("day");

      self.monthBtn.click(function() {
        setDisplayMode("month", self.monthBtn);
      });
      self.dayBtn.click(function() {
        setDisplayMode("day", self.dayBtn);
      });
      self.weekBtn.click(function() {
        setDisplayMode("week", self.weekBtn);
      });



      self.dateLabel = $('<div class="inline calendar-label"></div>')
      leftBtn.appendTo(sliders);
      rightBtn.appendTo(sliders);
      self.dateLabel.appendTo(self.topBar);

      self.monthBtn.appendTo(self.topBar);
      self.weekBtn.appendTo(self.topBar);
      self.dayBtn.appendTo(self.topBar);


      var legend = $('<div class="calendar-legend"></div>').appendTo(self.container);
      self.legend = legend;


      self.body = $('<div class="calendar-body"></div>');
      self.body.appendTo(self.container);

      var bottom = $("<button class='btn'>Dodaj kategorijo</button>").appendTo(self.container);
      bottom.click(function() {
        var name = prompt("Vnesite ime:", "");
        if (name !== "") {
          options.data.push({
            name: name,
            events: {}
          });
          drawLegend();
        }
      });

      drawLegend();

    }

    function findDays(resource, year, month) {
      var months = resource.events[year];
      if (months === undefined) return new Array();
      var days = months[month];
      if (days === undefined) return new Array();
      return days;
    }

    function getDay(days, day) {
      for (var prop in days) {
        if (prop == day) {
          return days[prop];
        }
      }
      return undefined;
    }



    function drawLegend() {
      var legend = self.legend;
      var date = options.selectedDate;
      legend.html("");

      self.body.html("");



      $('<div class="inline resource-column">' + bold("Resource") + "</div>").appendTo(legend);
      if (options.displayMode == "week") {

        var referenceDate = new Date(date.getTime());
        referenceDate.setDate(referenceDate.getDate() - date.getDay() + 1);
        for (var i = 0; i < 7; i++) {
          var tmpDate = new Date(referenceDate.getTime());
          tmpDate.setDate(tmpDate.getDate() + i);

          var label = (tmpDate.getMonth() + 1) + "/" + tmpDate.getDate();
          $('<div class="inline date-column">' + bold(options.days[tmpDate.getDay()] + " " + label) + "</div>").appendTo(legend);
        }


        for (var i = 0; i < self.data.length; i++) {
          var resource = self.data[i];
          var row = $('<div class="calendar-row"></div>').appendTo(self.body);
          $('<div class="inline resource-name">' + bold(resource.name) + "</div>").appendTo(row);

          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var days = findDays(resource, year, month);

          for (var y = 0; y < 7; y++) {
            var tmpDate = new Date(referenceDate.getTime());
            tmpDate.setDate(tmpDate.getDate() + y);


            days = findDays(resource, year, month);



            var day = $('<div class="inline date-column clickable">' + "&nbsp;" + "</div>").appendTo(row);

            var event = getDay(days, tmpDate.getDate());
            if (event !== undefined) {
              day.html(event);
              day.css("background-color", "#3090C7");
              day.tooltip({
                title: event
              });
              day.click((function(num, dayNum) {
                return function() {
                  removeEvent(num, year, month, dayNum + 1);
                }
              })(i, tmpDate.getDate() - 1));
            } else {

              day.click((function(num, dayNum) {
                return function() {
                  addEvent(num, year, month, dayNum + 1);
                }
              })(i, tmpDate.getDate() - 1));
            }
          }

        }
      } else if (options.displayMode === "month") {
        var referenceDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        for (var i = 0; i < referenceDate.getDate(); i++) {
          $('<div class="inline date-column date-column-small">' + bold((i + 1)) + "</div>").appendTo(legend);
        }

        for (var i = 0; i < self.data.length; i++) {
          var resource = self.data[i];
          var row = $('<div class="calendar-row"></div>').appendTo(self.body);
          $('<div class="inline resource-name">' + resource.name + '</div>').appendTo(row);

          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var days = findDays(resource, year, month);
          for (var y = 0; y < referenceDate.getDate(); y++) {
            var el = $('<div class="inline date-column-small clickable">&nbsp;</div>').appendTo(row);

            var event = getDay(days, y + 1);
            if (event !== undefined) {
              el.css("background-color", "#3090C7")
              el.tooltip({
                title: event
              });
              el.click((function(num, dayNum) {
                return function() {
                  removeEvent(num, year, month, dayNum + 1);
                }
              })(i, y));
            } else {

              el.click((function(num, dayNum) {
                return function() {
                  addEvent(num, year, month, dayNum + 1);
                }
              })(i, y));
            }
          }
        }
      } else {

        for (var i = 0; i < self.data.length; i++) {
          var resource = self.data[i];
          var row = $('<div class="calendar-row"></div>').appendTo(self.body);
          $('<div class="inline resource-name">' + resource.name + '</div>').appendTo(row);
          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var days = findDays(resource, year, month);

          var el = $('<div class="inline date-column-big clickable">&nbsp;</div>').appendTo(row);
          var event = getDay(days, date.getDate());
          if (event !== undefined) {
            el.css("background-color", "#3090C7");
            el.html(event);
            el.click((function(num, dayNum) {
              return function() {
                removeEvent(num, year, month, dayNum);
              }
            })(i, date.getDate()));
          } else {

            el.click((function(num, dayNum) {
              return function() {
                addEvent(num, year, month, dayNum);
              }
            })(i, date.getDate()));
          }

        }
      }
    }

    function bold(string) {
      return "<strong>" + string + "</strong>";
    }

    function setDate(date) {
      options.selectedDate = date;
      displayDate();
    }

    function displayDate() {
      var date = options.selectedDate;


      var label = "";
      var mode = options.displayMode;
      if (mode === "week") {
        var referenceDate = new Date(date.getTime());
        referenceDate.setDate(referenceDate.getDate() - date.getDay() + 1);
        var label = options.monthNames[referenceDate.getMonth()] + " " + referenceDate.getDate() + " -- "
        var tmpDate = new Date(referenceDate.getTime());
        tmpDate.setDate(tmpDate.getDate() + 6);
        if (tmpDate.getMonth() === referenceDate.getMonth()) {
          label += tmpDate.getDate() + " " + referenceDate.getFullYear();
        } else {
          label += " " + options.monthNames[tmpDate.getMonth()] + " " + tmpDate.getDate() + " " + referenceDate.getFullYear();
        }

      } else if (mode === "month") {
        label = options.monthNames[date.getMonth()] + "  " + date.getFullYear();
      } else {
        label = options.monthNames[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
      }

      self.dateLabel.html("<strong>" + label + "</strong>");
    }

    function setDisplayMode(mode, btn) {
      if (options.displayMode !== mode) {
        self.monthBtn.removeClass("disabled");
        self.weekBtn.removeClass("disabled");
        self.dayBtn.removeClass("disabled");

        options.displayMode = mode;
        btn.addClass("disabled");
        displayDate();
        drawLegend();
      }
    }

    function addEvent(resourceNumber, year, month, day) {
      var name = prompt("Vnesite ime dogodka:", "");
      if (name !== "") {

        var events = self.data[resourceNumber].events[year];
        if (events === undefined) {
          self.data[resourceNumber].events[year] = {};
          events = self.data[resourceNumber].events[year];
        }
        var m = events[month];
        if (m === undefined) {
          events[month] = {
            day: name
          };
        }
        events[month][day] = name;
        drawLegend();
      }
    }

    function removeEvent(resourceNumber, year, month, day) {
      var events = self.data[resourceNumber].events[year][month];
      delete events[day];
      drawLegend();
    }

    function sideScroller(direction) {
      var date = options.selectedDate;


      if (options.displayMode === "month") {
        date.setMonth(date.getMonth() + (direction));
      } else {
        var delta = 1
        if (options.displayMode == "week") {
          delta = 7;
        }
        date.setDate(date.getDate() + (delta * direction));

      }

      setDate(date);
      drawLegend();
    }

    function createButton(name) {
      return $('<button class="btn"><strong>' + name + '</strong></button>')
    }
  };
}(jQuery));
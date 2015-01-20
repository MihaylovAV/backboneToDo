function todoApplication() {

var TaskModel = Backbone.Model.extend({
    defaults:{
        done: false,
        date: '',
        title: ''
    },

    toggle: function() {
        this.save({done: !this.get('done')});
    },

    validate: function(attributes, options) {
        var result = {
            date: validateDate(attributes.date),
            message: validateMessage(attributes.title)
        };

        return result.message == false || result.date == false? result : undefined;

        function validateMessage(title) {
            return title.toString().search(/[^+]{3,}/i) == -1? false : true;
        }

        function validateDate(date) {
            var datePattern = date.match(/([0-3][0-9])\.([0-1][0-9])\.(\d{4})/),
                days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                todayDate = new Date(),
                today = {
                    day: todayDate.getDate(),
                    month: todayDate.getMonth()+1,
                    year: todayDate.getFullYear()
                },
                enteredDay,
                enteredMonth,
                enteredYear;

            if (datePattern == null) {
                return false;
            } else {
                enteredDay = datePattern[1];
                enteredMonth = datePattern[2];
                enteredYear = datePattern[3];
            }

            if (enteredDay > days[enteredMonth-1]) {
                return false;
            } else if (enteredMonth > 12) {
                return false;
            } else if (enteredYear % 4 == 0 && enteredYear % 100 != 0) {
                return false;
            }

            if (enteredYear < today.year) {
                return false;
            } else if (enteredYear == today.year) {
                if (enteredMonth < today.month) {
                    return false;
                } else if (enteredMonth == today.month) {
                    if (enteredDay < today.day) {
                        return false;
                    }
                }
            }

            return true;
        }
    }
});

var TaskCollection = Backbone.Collection.extend({
    model: TaskModel,

    localStorage: new Backbone.LocalStorage('todos-backbone'),

    done: function() {
        return this.filter(function(task){ return task.get('done'); });
    },

    remaining: function() {
        return this.filter(function(task){ return !task.get('done'); });
    }
});

var Tasks = new TaskCollection;

var taskView = Backbone.View.extend({
    tagName: 'li',

    events: {
        'click #delete': 'erase',
        'click .toggle'   : 'toggleDone',
        'dblclick .view': 'edit',
        'blur .edit': 'closeOnBlur',
        'keypress .edit': 'updateOnEnter'
    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    template: _.template($('#taskTemplate').html()),

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.toggleClass('done', this.model.get('done'));
        this.inputWhen = this.$('.when');
        this.inputWhat = this.$('.what');
        return this;
    },

    erase: function() {
        this.model.destroy();
        this.remove();
    },

    toggleDone: function() {
        this.model.toggle();
    },

    edit: function() {
        this.$el.addClass('editing');
        this.inputWhat.focus();
    },

    updateOnEnter: function(event) {
        if (event.keyCode == 13) {
            this.close();
        }
    },

    closeOnBlur: function() {
        var task = this;

        window.setTimeout(function() {
            if (!$(task.inputWhat).is(':focus')) {
                window.setTimeout(function() {
                    if (!$(task.inputWhen).is(':focus')) {
                        task.close();
                    } else {
                        return false;
                    }
                }, 100);
            }
        }, 100);
    },

    close: function() {
        var when = this.inputWhen.val().trim();
        var what = this.inputWhat.val().trim();
        var task = new TaskModel({date: when, title: what});

        task.isValid();

        if (task.validationError) {
            if (!task.validationError.date) {
                showErrorMessage(this.inputWhen, 'Неверная дата');
            }

            if (!task.validationError.message) {
                showErrorMessage(this.inputWhat, 'Нужно не менее трех символов');
            }

            return false;
        }

        this.model.save({date: when, title: what});
        this.$el.removeClass('editing');
    }
});

var ApplicationView = Backbone.View.extend({
    el: $('#wrapper'),

    events: {
        'click #createTask': 'createTask',
        'click #allTasks': 'displayAll',
        'click #done': 'displayDone',
        'click #toDo': 'displayTodo'
    },

    initialize: function() {
        this.listenTo(Tasks, 'add', this.renderOne);
        this.what = $('#what');
        this.when = $('#when');
        Tasks.fetch();
    },

    renderOne: function(task) {
        var view = new taskView({model: task});
        this.$('#taskList').append(view.render().el);
    },

    createTask: function() {
        var task = new TaskModel({date: this.when.val().trim(), title: this.what.val().trim()});

        task.isValid();

        if (task.validationError) {
            if (!task.validationError.date) {
                showErrorMessage(this.when, 'Неверная дата');
            }

            if (!task.validationError.message) {
                showErrorMessage(this.what, 'Нужно не менее трех символов');
            }

            return false;
        } else {
            Tasks.create(task);
            this.when.val('');
            this.what.val('');
            this.what.focus();
            return false;
        }
    },

    displayAll: function() {
        this.$('#taskList').html('');
        Tasks.each(this.renderOne, this);
        router.navigate('');
        return false;
    },

    displayDone: function() {
        this.$('#taskList').html('');
        Tasks.done().forEach(this.renderOne);
        router.navigate('done');
        return false;
    },

    displayTodo: function() {
        this.$('#taskList').html('');
        Tasks.remaining().forEach(this.renderOne);
        router.navigate('toDo');
        return false;
    }
});

var Router = Backbone.Router.extend({
    routes: {
        '': 'displayAll',
        'done': 'displayDone',
        'toDo': 'displayTodo'
    },

    displayDone: function() {
        application.displayDone();
    },

    displayAll: function() {
        application.displayAll();
    },

    displayTodo: function() {
        application.displayTodo();
    }
});

function showErrorMessage(element, message) {
    element.tooltip({
        content: message,
        items: 'input',
        open: function (e) {
            setTimeout(function () {
                $(e.target).tooltip('disable');
            }, 4000);
        }
    }).tooltip('enable').tooltip('open');
}

var application = new ApplicationView;

var router = new Router;

Backbone.history.start({pushState:true});

}
window.onload = function() {
    $('body').on('focus','.when', function(){
        $(this).datepicker({
            minDate: '-0y'
        });
    });
    todoApplication();
};
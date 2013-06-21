/**
 * jQuery PageRemember plugin
 *
 * @desc Remembers of various informations about current page on exit, like scroll position,
 *       in order to scroll to it position on reload.
 * @version 1.0.0
 * @author Hervé GOUCHET
 * @use jQuery 1.7+
 * @licenses Creative Commons BY-SA 2.0
 * @see https://github.com/rvflash/jQuery-PageRemember
 */
;
var PageRemember =
{
    defaults: {
        data: {},
        save: {
            scroll: true,
            duration: true,
            referer: true,
            goto: true
        },
        cookie: {
            cookie: 'pageremember',
            duration: 1800 // In second
        }
    },
    _workspace: {
        scroll: '_prscroll',
        duration: '_prduration',
        referer: '_prreferer',
        goto: '_prgoto',
        dom: '_prdom'
    },
    add: function (name, data)
    {
        if ('undefined' != typeof name && -1 == $.inArray(name, this._workspace)) {
            this.defaults.data[name] = data;
        }
    },
    addById: function(id)
    {
        var elem = $('#' + id);
        if (0 < elem.length) {
            if ('undefined' == typeof this.defaults.data[this._workspace.dom]) {
                this.defaults.data[this._workspace.dom] = {};
            }
            this.defaults.data[this._workspace.dom][id] = elem.html();
        }
    },
    init: function()
    {
        // Get datas previously saved
        $.extend(true, this.defaults.data, this._getCookie());

        // Init process on loading
        $(window).on('load', function(e)
        {
            PageRemember.read();
            PageRemember.save(e);
        });

        // Also manage click event
        $(window).on('click', function(e) { PageRemember.save(e); });

        // Save information before leave page
        $(window).on('beforeunload', function(e) { PageRemember.save(e); });
    },
    get: function(name)
    {
        // Retrieve data in cookie
        if ('undefined' != typeof this.defaults.data[name]) {
            return this.defaults.data[name];
        }
        return null;
    },
    getAll: function()
    {
        return this.defaults.data;
    },
    getById: function(id)
    {
        // Retrieve HTML in cookie by ID
        if (
            'undefined' != typeof this.defaults.data[this._workspace.dom] &&
            'undefined' != typeof this.defaults.data[this._workspace.dom][id]
        ) {
            return this.defaults.data[this._workspace.dom][id];
        }
        return null;
    },
    save: function(e)
    {
        if (this.defaults.save.duration) {
            var duration = this.get(this._workspace.duration);
        }

        // Manage storing datas
        switch(e.type)
        {
            case 'click':
                if (this.defaults.save.goto) {
                    this.defaults.data[this._workspace.goto] =
                        ('undefined' != typeof e.currentHref ? e.currentHref : e.target.href);
                }
                break;
            case 'load':
                if (this.defaults.save.duration) {
                    if (null == duration) {
                        duration = [];
                    }
                    duration.push({ start: new Date() });
                    this.defaults.data[this._workspace.duration] = duration;
                }
                if (this.defaults.save.referer) {
                    this.defaults.data[this._workspace.referer] = document.referrer;
                }
                break;
            case 'beforeunload':
            default:
                if (this.defaults.save.duration) {
                    var timer = (duration.length - 1);
                    duration[timer].end = new Date();
                    duration[timer].duration = duration[timer].end.getTime() - duration[timer].start.getTime();
                    this.defaults.data[this._workspace.duration] = duration;
                }
                if (this.defaults.save.scroll) {
                    this.defaults.data[this._workspace.scroll] = {
                        top: $(document).scrollTop(),
                        left: $(document).scrollLeft()
                    };
                }
                this._setCookie();
                break;
        }
    },
    read: function()
    {
        var oScroll;
        if (this.defaults.save.scroll && null != (oScroll = this.get(this._workspace.scroll))) {
            $(document).scrollTop(oScroll.top).scrollLeft(oScroll.left);
        }
    },
    _getCookie: function()
    {
        var name = this.defaults.cookie.name + '=';
        var cookies = document.cookie.split(';');
        for(var i = 0; i < cookies.length; i++) {
            var c = cookies[i];
            while (' ' == c.charAt(0)) {
                c = c.substring(1, c.length);
            }
            if (0 == c.indexOf(name)) {
                return $.parseJSON(c.substring(name.length, c.length));
            }
        }
        return {};
    },
    _setCookie: function()
    {
        var duration = new Date();
            duration.setTime(duration.getTime() + this.defaults.cookie.duration * 1000);

        document.cookie =
            this.defaults.cookie.name + '=' + JSON.stringify(this.defaults.data) +
            '; expires=' + duration.toGMTString() + '; path=' + window.location.pathname;
    }
};

(function($)
{
    $.pageRemember = function(settings)
    {
        if ('undefined' != typeof settings) {
            $.extend(true, PageRemember.defaults, settings);
        }
        PageRemember.init();
    };
})(jQuery);
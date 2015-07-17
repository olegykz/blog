var CONFIG = {
    appID: 13645,
    authKey: '9T7mUvjxrkWd6F6',
    authSecret: 'vyXbwdS6H65LCQB',
    debug: false
};

var my_id = 49270931;
var current_visitor;
var login_params;
var current_session;

$(document).ready(function() {
    VK.init({
        apiId: 2024149
    });

    VK.Widgets.Auth("vk_auth", {
        width: "500px",
        height: "500px",
        onAuth: function(data) {
            $('#overlay').remove();
            current_visitor = data;

            login_params = {
                login: data['uid'],
                password: data['hash']
            };

            initCatcher(current_session);
        }
    });

    var el = $('#wrap1');
    $(window).on('mousemove', function(e) {
        x = (e.pageX - 90).toString() + "px";
        y = (e.pageY - 12).toString() + "px";
        el.css({
            left: x,
            top: y
        });
    });

    QB.init(CONFIG.appID, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
    QB.createSession(function(err, result) {
        current_session = this;
        showVisitors(current_session);
    });
})

function initCatcher(session) {
    session.QB.login(login_params, function(err, result) {
        // It seems that this user is visiting us first time...
        if (err && err["code"] == 401) {

            login_params["full_name"] = current_visitor['first_name'] +
                ' ' + current_visitor['last_name'];

            // Nope, I don't store security info
            delete current_visitor["session"];
            delete current_visitor["hash"];

            login_params["custom_data"] = JSON.stringify(current_visitor);
            QB.users.create(login_params, function(err, result) {
                initCatcher(this);
            });
        } else {
            processUser(this)
        }
    });
}

function processUser(session) {
    if (current_visitor['uid'] != my_id) {
        logVisit(session);
    }
}

function logVisit(session) {
    var guest = {
        first_name: current_visitor["first_name"],
        last_name: current_visitor["last_name"],
        uid: current_visitor['uid'],
        avatar_url: current_visitor['photo']
    }

    session.QB.data.create("vkguest", guest, function(err, response) {
        // $('#guests_list').prepend(processGuest(response));
    });

    console.log(current_visitor);
    var messages = ["Привет,^1000 " +
        current_visitor['first_name'] + " " +
        current_visitor['last_name']];

    $(".joke_message").typed({
        strings: messages,
        typeSpeed: 0
    });
}

function showVisitors(session) {
    session.QB.data.list("vkguest", "sort_desc=created_at", function(err, response) {
        guests = $('#guests_list');

        guests.fadeOut();
        guests.html('')
        guests.toggle();

        response["items"].forEach(function(guest) {
            guests.append(processGuest(guest));
        });

        guests.gridalicious({
            width: 225,
            selector: '.guest',
            animate: true
        });
    });
}

function processGuest(guest)
{
    data = "<div id='uid" + guest["uid"] + "' class='guest'>";

    // Mock images (disabled/no_photo avatar) returns with relative path
    if (guest["avatar_url"].indexOf("http") == -1) {
        guest["avatar_url"] = "." + guest["avatar_url"];
    }

    data += "<div><img src='" + guest["avatar_url"] + "'/></div>";

    visit_date = new Date(guest["created_at"] * 1000);
    full_name = guest["first_name"] + " " + guest["last_name"];

    link = "https://vk.com/id" + guest['uid'];
    data += "<div><a target='_blank' href='" + link + "'>" + full_name + "</a></div>"

    data += "<div class='visit_date'>" + visit_date.toLocaleString() +
        "</div></div>";

    return data;
}
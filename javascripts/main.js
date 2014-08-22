var CONFIG = {
    appID: 13645,
    authKey: '9T7mUvjxrkWd6F6',
    authSecret: 'vyXbwdS6H65LCQB',
    debug: false
};

var my_id = 4927093;

$(document).ready(function() {
    VK.init({
        apiId: 2024149
    });

    VK.Widgets.Auth("vk_auth", {
        width: "200px",
        onAuth: function(data) {
            $('#wrap1').fadeOut();
            console.log(data);

            var params = {
                login: data['uid'],
                password: data['hash']
            };

            QB.createSession(function(err, result) {
                QB.login(params, function(err, result) {
                    // It seems that this user is visiting us first time...
                    if (err && err["code"] == 401) {

                        params["full_name"] = data['first_name'] + ' ' + data['last_name'];

                        // Nope, I don't store security info
                        delete data["session"];
                        delete data["hash"];

                        params["custom_data"] = JSON.stringify(data);
                        QB.users.create(params, function(err, result) {
                            console.log(result);
                        });
                    }
                });

                if (data['uid'] == my_id) {
                    QB.data.list("vkguest", function(err, response) {

                        response["items"].forEach(function(guest) {
                            data = "<div id='uid" + guest["uid"] + "' class='guest'>";
                            data += "<img src='" + guest["avatar_url"] + "'/>";

                            visit_date = new Date(guest["created_at"] * 1000);
                            data += "<a target='_blank' href='https://vk.com/id" +
                                guest['uid'] + "'> ";

                            data += "<span class='full_name'>" +
                                guest["first_name"] + " " +
                                guest["last_name"] + "</span></a>"

                            data += "<div class='visit_date'>" + visit_date.toLocaleString() +
                                "</div></div>"

                            $('#guests_list').append(data);
                        });
                    });
                } else {
                    var guest = {
                        first_name: data["first_name"],
                        last_name: data["last_name"],
                        uid: data['uid'],
                        avatar_url: data['photo']
                    }

                    QB.data.create("vkguest", guest, function(err, response) {
                        console.log(response);
                    });

                    var messages = ["Привет, " + data['first_name'] + " " + data['last_name'] ,
                        "Твой визит записан, приятно познакомиться :)"
                    ];

                    $(".joke_message").typed({
                        strings: messages,
                        typeSpeed: 0
                    });
                }
            });
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
})
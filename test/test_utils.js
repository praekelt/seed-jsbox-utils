var assert = require('assert');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var JsonApi = vumigo.http.api.JsonApi;

var fixtures = require('./fixtures');

var Choice = vumigo.states.Choice;
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var FreeText = vumigo.states.FreeText;

var AppTester = vumigo.AppTester;
var App = vumigo.App;
App.call(App);
var $ = App.$;

var service = require('../lib');
var utils = require('../lib/utils');

describe("Testing utils functions", function() {
    var config = {
        "testing_today": "2016-05-23"
    };

    describe("check_valid_number", function() {
        it("only numbers is valid", function() {
            assert(utils.check_valid_number("012345"), true);
        });
        it("any letters invalidates check", function() {
            assert.equal(utils.check_valid_number("012abc345"), false);
        });
        it("any other characters invalidates check", function() {
            assert.equal(utils.check_valid_number("-123456"), false);
            assert.equal(utils.check_valid_number("123-456"), false);
            assert.equal(utils.check_valid_number("1234&56"), false);
            assert.equal(utils.check_valid_number("1%234#56"), false);
        });
    });

    describe("double_digit_number", function() {
        it("single digit numbers should be prepended with '0'", function() {
            assert.deepEqual(utils.double_digit_number(1), '01');
            assert.deepEqual(utils.double_digit_number(4), '04');
        });
        it("double digits number should stay unchanged", function() {
            assert.deepEqual(utils.double_digit_number(10), '10');
            assert.deepEqual(utils.double_digit_number(95), '95');
        });
        it("doens't handle negative numbers; scrambled output", function() {
            assert.deepEqual(utils.double_digit_number(-1), '0-1');
        });
    });

    describe("check_number_in_range", function() {
        it("should return true", function() {
            assert(utils.check_number_in_range(5, 1, 10));
            assert(utils.check_number_in_range(72, 1, 100));
        });
        it("should return true for min/max boundaries ", function() {
            assert(utils.check_number_in_range(1, 1, 10));
            assert(utils.check_number_in_range(10, 1, 10));
        });
        it("should return false", function() {
            assert.equal(utils.check_number_in_range(11, 1, 10), false);
            assert.equal(utils.check_number_in_range(77, 7, 17), false);
        });
    });

    describe("readable_msisdn", function() {
        it("should return readable msisdn", function() {
            assert.equal(utils.readable_msisdn("+27821234567", "+27"), "0821234567");
            assert.equal(utils.readable_msisdn("+264821234567", "+264"), "0821234567");
            assert.equal(utils.readable_msisdn("0821234567", "+27"), "0821234567");
            assert.equal(utils.readable_msisdn("+27821234567", "27"), "0821234567");
        });
        // the next test case should not occur as the msisdn's passed in should
        // either be normalized (start with '+') or as is (start with '0')
        it("should return msisdn as is if contains no leading +", function() {
            assert.equal(utils.readable_msisdn("27821234567", "+27"), "27821234567");
            assert.equal(utils.readable_msisdn("27821234567", "27"), "27821234567");
        });
    });

    describe("is_valid_msisdn function", function() {
        it("should not validate if passed a number that doesn't start with '0'", function() {
            assert.equal(utils.is_valid_msisdn("12345", 10, 13), false);
        });
        it("should not validate if number starts with '0' but of incorrect length", function() {
            assert.equal(utils.is_valid_msisdn("012345", 10, 13), false);  // < 10
            assert.equal(utils.is_valid_msisdn("01234567890123", 10, 13), false);  // > 13
        });
        it("validate if number starts with '0' and of correct length", function() {
            assert(utils.is_valid_msisdn("01234567890", 10, 13));
            assert(utils.is_valid_msisdn("0123456789012", 10, 13));
        });
    });

    describe("normalize_msisdn(raw, country_code)", function() {
        it("return raw number unchanged if shortcode", function() {
            assert.deepEqual(utils.normalize_msisdn("0123", "123"), "0123");
        });
        it.skip("remove chars that are not numbers or + from raw number", function() {
            assert.deepEqual(utils.normalize_msisdn("012abc345", "123"), "+12312345");
        });
        it("starts with '00'; replace with '+', don't prepend country_code", function() {
            assert.deepEqual(utils.normalize_msisdn("0012345", "123"), "+12345");
        });
        it("starts with '0'; replace with '+' + country_code", function() {
            assert.deepEqual(utils.normalize_msisdn("012345", "123"), "+12312345");
        });
        it("starts with '+'; return raw number as is", function() {
            assert.deepEqual(utils.normalize_msisdn("+12312345", "123"), "+12312345");
        });
        it("if raw number's length equals country_code, prepend '+'", function() {
            assert.deepEqual(utils.normalize_msisdn("123456", "123456"), "+123456");
        });
    });

    describe("get_timestamp", function() {
        it("when date passed in, return the same as moment object", function() {
            assert.deepEqual(utils.get_timestamp("YYYY-MM-DD-HH-mm-ss"),
                new moment().format("YYYY-MM-DD-HH-mm-ss"));
        });
        it("no date passed, return current moment object", function() {
            assert.deepEqual(utils.get_timestamp(),
                new moment().format("YYYYMMDDHHmmss"));
        });
    });

    describe("get_today", function() {
        it("when date (config) passed in, return the same as moment object", function() {
            assert.deepEqual(utils.get_today(config).format("YYYY-MM-DD"),
                moment("2016-05-23").format("YYYY-MM-DD"));
        });
        it("no date passed, return current moment object", function() {
            assert.deepEqual(utils.get_today().format("YYYY-MM-DD"),
                new moment().format("YYYY-MM-DD"));
        });
    });

    describe("get_january", function() {
        it("get 1st jan moment date of any given year (test date)", function() {
            assert.deepEqual(utils.get_january(config).format("YYYY-MM-DD"),
                moment("2016-01-01").format("YYYY-MM-DD"));
        });
        it("get 1st jan moment date of current year", function() {
            assert.deepEqual(utils.get_january().format("YYYY-MM-DD"),
                new moment().format("YYYY-01-01"));
        });
    });

    describe("is_valid_date", function() {
        it("returns true for valid YYYY-MM-DD dates", function() {
            assert(utils.is_valid_date("2016-05-19", "YYYY-MM-DD"));
        });
        it("returns true for valid YYYY/MM/DD dates", function() {
            assert(utils.is_valid_date("2016/05/19", "YYYY/MM/DD"));
        });
        it("returns true for valid YYYY/DD/MM dates", function() {
            assert(utils.is_valid_date("2016/19/05", "YYYY/DD/MM"));
        });
        it("returns true for valid DD MMMM 'YY dates", function() {
            assert(utils.is_valid_date("05 May '16", "DD MMMM 'YY"));
        });
        it("returns false for valid date specified with unmatching format", function() {
            assert.equal(utils.is_valid_date("2016-05-19", "YYYY/MM/DD"), false);
        });
        it("returns false for invalid date", function() {
            // invalid day
            assert.equal(utils.is_valid_date("2015-05-32", "YYYY-MM-DD"), false);
            // invalid day - leap year example
            assert.equal(utils.is_valid_date("2015-02-29", "YYYY-MM-DD"), false);
            // invalid month
            assert.equal(utils.is_valid_date("2015-13-19", "YYYY-MM-DD"), false);
            // invalid year
            assert.equal(utils.is_valid_date("20151-05-19", "YYYY-MM-DD"), false);
        });
    });

    describe("is_valid_year", function() {
        it("valid; year within bounds", function() {
            assert(utils.is_valid_year("2016", "1990", "2030"));
            assert(utils.is_valid_year("2016", "2015", "2017"));
            assert(utils.is_valid_year("2016", "2016", "2017"));
            assert(utils.is_valid_year("2016", "2015", "2016"));
            assert(utils.is_valid_year("2016", "2016", "2016"));
        });
        it("invalid; year outside bounds", function() {
            assert.equal(utils.is_valid_year("2016", "2010", "2015"), false);
            assert.equal(utils.is_valid_year("2016", "2017", "2020"), false);
        });
    });

    describe("is_valid_day_of_month", function() {
        it("only day is provided", function() {
            // only 1-31 should be valid
            assert.equal(utils.is_valid_day_of_month("0"), false);
            assert.equal(utils.is_valid_day_of_month("01"), true);
            assert.equal(utils.is_valid_day_of_month("31"), true);
            assert.equal(utils.is_valid_day_of_month("32"), false);

            // check different formatting
            // . valid
            assert.equal(utils.is_valid_day_of_month(1), true);
            assert.equal(utils.is_valid_day_of_month("1"), true);
            assert.equal(utils.is_valid_day_of_month("001"), true);
            // . invalid
            assert.equal(utils.is_valid_day_of_month("1.5"), false);
            assert.equal(utils.is_valid_day_of_month("Monday"), false);
        });
        it("day and month is provided", function() {
            // 31st should only be valid in certain months
            assert.equal(utils.is_valid_day_of_month("31", "01"), true);  // jan 31
            assert.equal(utils.is_valid_day_of_month("30", "04"), true);  // apr 30
            assert.equal(utils.is_valid_day_of_month("31", "04"), false);  // apr 31
            // feb 29 should be valid, not feb 30
            assert.equal(utils.is_valid_day_of_month("29", "02"), true);  // feb 29
            assert.equal(utils.is_valid_day_of_month("30", "02"), false);  // feb 30

            // check different formatting
            // . valid
            assert.equal(utils.is_valid_day_of_month("1", "1"), true);  // jan 1
            assert.equal(utils.is_valid_day_of_month(1, 1), true);  // jan 1
            // . invalid
            assert.equal(utils.is_valid_day_of_month(1, "January"), false);
        });
        it("day, month and year is provided", function() {
            // 31st should only be valid in certain months
            assert.equal(utils.is_valid_day_of_month("31", "01", "2016"), true);  // jan 31
            assert.equal(utils.is_valid_day_of_month("30", "04", "2016"), true);  // apr 30
            assert.equal(utils.is_valid_day_of_month("31", "04", "2016"), false);  // apr 31
            // feb 29 should be valid only in leap year
            assert.equal(utils.is_valid_day_of_month("29", "02", "2000"), true);  // leap year
            assert.equal(utils.is_valid_day_of_month("28", "02", "2001"), true);  // normal year
            assert.equal(utils.is_valid_day_of_month("29", "02", "2001"), false);  // normal year

            // check different formatting
            // . valid
            assert.equal(utils.is_valid_day_of_month("1", "1", "1901"), true);  // jan 1 1901
            assert.equal(utils.is_valid_day_of_month(1, 1, 1901), true);  // jan 1 1901
            // . invalid
            assert.equal(utils.is_valid_day_of_month(1, 1, "two thousand"), false);  // jan 1 2000
        });
    });

    describe("get_entered_birth_date", function() {
        it("without date separators specified", function() {
            assert(utils.get_entered_birth_date("1982", "2", "1"), "1982-02-01");
        });
        it("with date separators specified", function() {
            assert(utils.get_entered_birth_date("1982", "2", "1", "/"), "1982/02/01");
        });
    });

    describe("check_valid_alpha", function() {
        it("valid alphabetical", function() {
            assert(utils.check_valid_alpha("abc"));
            assert(utils.check_valid_alpha("JohnDeere"));
        });
        it("invalid alphabetical", function() {
            assert.equal(utils.check_valid_alpha(""), false);
            assert.equal(utils.check_valid_alpha(" "), false);
            assert.equal(utils.check_valid_alpha("John Deere"), false);
            assert.equal(utils.check_valid_alpha("A123"), false);
            assert.equal(utils.check_valid_alpha("A#1"), false);
        });
    });

    describe("is_alpha_numeric_only", function() {
        it("valid alpha-numerics", function() {
            assert(utils.is_alpha_numeric_only("John"));
            assert(utils.is_alpha_numeric_only("John123"));
            assert(utils.is_alpha_numeric_only("J1o2h3n"));
        });
        it("invalid alpha-numerics", function() {
            assert.equal(utils.is_alpha_numeric_only(" 123"), false);
            assert.equal(utils.is_alpha_numeric_only("Jo h n"), false);
            assert.equal(utils.is_alpha_numeric_only("J1o#hn?"), false);
        });
    });

    describe("is_valid_name", function() {
        it("valid name", function() {
            assert(utils.is_valid_name("John", 1, 5));
            assert(utils.is_valid_name("Ba Ki-moon", 1, 15));
            assert(utils.is_valid_name("-Jo-hn", 1, 10));
        });
        it("invalid name", function() {
            assert.equal(utils.is_valid_name("123", 1, 5), false);
            assert.equal(utils.is_valid_name("John", 1, 3), false);
            assert.equal(utils.is_valid_name("John?", 1, 5), false);
        });
    });

    describe("get_clean_first_word", function() {
        it("should get and capitalise first word", function() {
            assert.deepEqual(utils.get_clean_first_word("Only"), "ONLY");
            assert.deepEqual(utils.get_clean_first_word("Once there was..."), "ONCE");
            assert.deepEqual(utils.get_clean_first_word("Stop the noise"), "STOP");
        });
        it("should get clean first word if contains non-letters/numbers", function() {
            assert.deepEqual(utils.get_clean_first_word("O$ne Two T3ree"), "ONE");
            assert.deepEqual(utils.get_clean_first_word("O$1ne T2wo Th3ree"), "O1NE");
        });
    });

    describe("extract_za_id_dob", function() {
        it("valid dates extracted", function() {
            assert.deepEqual(utils.extract_za_id_dob("8104267805280"),
                moment("1981-04-26").format("YYYY-MM-DD"));
            assert.deepEqual(utils.extract_za_id_dob("8202017805280"),
                moment("1982-02-01").format("YYYY-MM-DD"));
        });
        it("invalid dates extracted", function() {
            // 31 of Feb
            assert.deepEqual(utils.extract_za_id_dob("8102317805280"), "Invalid date");
        });
        it("invalid - id number length < 6", function() {
            // fifth digit intepreted as single-digit day
            assert.deepEqual(utils.extract_za_id_dob("81042"),
                moment("1981-04-02").format("YYYY-MM-DD"));

            // no day found in id number will default to '01'
            assert.deepEqual(utils.extract_za_id_dob("8104"),
                moment("1981-04-01").format("YYYY-MM-DD"));

            // 'Invalid date' when input length < 4
            assert.deepEqual(utils.extract_za_id_dob("810"), "Invalid date");
        });
        it("correct century extracted", function() {
            assert.deepEqual(utils.extract_za_id_dob("5202017805280"),
                moment("1952-02-01").format("YYYY-MM-DD"));
            // boundary case - first day > '49
            assert.deepEqual(utils.extract_za_id_dob("5001017805280"),
                moment("1950-01-01").format("YYYY-MM-DD"));
            // boundary case - last day < '49
            assert.deepEqual(utils.extract_za_id_dob("4812317805280"),
                moment("2048-12-31").format("YYYY-MM-DD"));
            // boundary case (default moment.two_digit_year) - first day > '68
            assert.deepEqual(utils.extract_za_id_dob("6901017805280"),
                moment("1969-01-01").format("YYYY-MM-DD"));
            // boundary case (default moment.two_digit_year) - last day < '68
            assert.deepEqual(utils.extract_za_id_dob("6712317805280"),
                moment("1967-12-31").format("YYYY-MM-DD"));
            // year 2000
            assert.deepEqual(utils.extract_za_id_dob("0012317805280"),
                moment("2000-12-31").format("YYYY-MM-DD"));
        });
    });

    describe("validate_id_za", function() {
        it("valid sa id's", function() {
            assert(utils.validate_id_za("8104265087082"));
            assert(utils.validate_id_za("8202010057085"));
            assert(utils.validate_id_za("5405295094086"));
        });
        it("invalid sa id's (of length 13)", function() {
            assert.equal(utils.validate_id_za("8104267805280"), false);
            assert.equal(utils.validate_id_za("1234015009087"), false);
        });
        it("invalid sa id's (length not 13)", function() {
            assert.equal(utils.validate_id_za("123"), false);  // length 3
            assert.equal(utils.validate_id_za("81042650870820"), false);  // length 14
        });
    });

    describe("is_true", function() {
        it("valid", function() {
            assert(utils.is_true(true));
            assert(utils.is_true("true"));
        });
        it("invalid", function() {
            assert.equal(utils.is_true(undefined), false);
            assert.equal(utils.is_true("True"), false);
            assert.equal(utils.is_true(false), false);
        });
    });

    describe("make_month_choices function", function() {
        it('should return a Choice array of correct size - forward in same year', function() {
            // test data
            var testDate = moment("2015-04-26");
            var limit = 6;     // should determine the size of the returned array
            var increment = 1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201504");
            assert.equal(expectedChoiceArray[1].value, "201505");
            assert.equal(expectedChoiceArray[2].value, "201506");
            assert.equal(expectedChoiceArray[3].value, "201507");
            assert.equal(expectedChoiceArray[4].value, "201508");
            assert.equal(expectedChoiceArray[5].value, "201509");
        });
        it('should return a Choice array of correct size - backwards in same year', function() {
            // test data
            var testDate = moment("2015-07-26");
            var limit = 7;     // should determine the size of the returned array
            var increment = -1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201507");
            assert.equal(expectedChoiceArray[1].value, "201506");
            assert.equal(expectedChoiceArray[2].value, "201505");
            assert.equal(expectedChoiceArray[3].value, "201504");
            assert.equal(expectedChoiceArray[4].value, "201503");
            assert.equal(expectedChoiceArray[5].value, "201502");
            assert.equal(expectedChoiceArray[6].value, "201501");
        });
        it('should return a Choice array of correct size - forward across years', function() {
            // test data
            var testDate = moment("2015-12-26");
            var limit = 4;     // should determine the size of the returned array
            var increment = 1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201512");
            assert.equal(expectedChoiceArray[1].value, "201601");
            assert.equal(expectedChoiceArray[2].value, "201602");
            assert.equal(expectedChoiceArray[3].value, "201603");
        });
        it('should return an array of choices - backwards across years', function() {
            // test data
            var testDate = moment("2015-01-26");
            var limit = 3;     // should determine the size of the returned array
            var increment = -1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201501");
            assert.equal(expectedChoiceArray[1].value, "201412");
            assert.equal(expectedChoiceArray[2].value, "201411");
        });
        it('should return an array of choices - forwards, with elements separated by 3 months', function() {
            // test data
            var testDate = moment("2015-01-26");
            var limit = 3;     // should determine the size of the returned array
            var increment = 3; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201501");
            assert.equal(expectedChoiceArray[1].value, "201504");
            assert.equal(expectedChoiceArray[2].value, "201507");
        });
    });
});

describe("Testing app- and service call functions", function() {
    var app;
    var tester;

    // initialising services
    var IdentityStore = service.IdentityStore;
    var Hub = service.Hub;
    var StageBasedMessaging = service.StageBasedMessaging;
    var MessageSender = service.MessageSender;
    var ServiceRating = service.ServiceRating;

    var is;
    var hub;
    var sbm;
    var ms;
    var sr;

    beforeEach(function() {
        app = new App("state_one");

        var interrupt = true;

        app.init = function(){
            // initialising services
            var base_url = app.im.config.services.identity_store.url;
            var auth_token = app.im.config.services.identity_store.token;
            is = new IdentityStore(new JsonApi(app.im, null), auth_token, base_url);

            base_url = app.im.config.services.hub.url;
            auth_token = app.im.config.services.hub.token;
            hub = new Hub(new JsonApi(app.im, null), auth_token, base_url);

            base_url = app.im.config.services.staged_based_messaging.url;
            auth_token = app.im.config.services.staged_based_messaging.token;
            sbm = new StageBasedMessaging(new JsonApi(app.im, null), auth_token, base_url);

            base_url = app.im.config.services.message_sender.url;
            auth_token = app.im.config.services.message_sender.token;
            ms = new MessageSender(new JsonApi(app.im, null), auth_token, base_url);

            base_url = app.im.config.services.service_rating.url;
            auth_token = app.im.config.services.service_rating.token;
            sr = new ServiceRating(new JsonApi(app.im, null), auth_token, base_url);
        };

        // override normal state adding
        app.add = function(name, creator) {
            app.states.add(name, function(name, opts) {
                if (!interrupt || !utils.timed_out(app.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;

                if (utils.timeout_redirect(app.im)) {
                    return app.states.create(name, opts);
                    // return app.states.create("state_one"); if you want to redirect to the start state
                } else {
                    return app.states.create("state_timed_out", opts);
                }
            });
        };

        // timeout
        app.states.add("state_timed_out", function(name, creator_opts) {
            return new ChoiceState(name, {
                question: "You timed out. What now?",
                choices: [
                    new Choice("continue", $("Continue")),
                    new Choice("restart", $("Restart")),
                    new Choice("exit", $("Exit"))
                ],
                next: function(choice) {
                    if (choice.value === "continue") {
                        return {
                            name: creator_opts.name,
                            creator_opts: creator_opts
                        };
                    } else if (choice.value === "restart") {
                        return "state_one";
                    } else {
                        return "state_end";
                    }
                }
            });
        });

        app.add("state_one", function(name) {
            return new FreeText(name, {
                question: "This is the first state.",
                next: "state_two"
            });
        });

        // a HTTP GET request is made going from this state to the next
        app.add("state_two", function(name) {
            return new FreeText(name, {
                question: "This is the second state.",
                next: function(content) {
                    return is.get_identity("cb245673-aa41-4302-ac47-00000000001")
                        .then(function(response) {
                            return "state_three";
                        });
                }
            });
        });

        app.add("state_three", function(name) {
            return new FreeText(name, {
                question: "This is the third state.",
                next: "state_four"
            });
        });

        // a HTTP POST request is made going from this state to the next/last
        app.add("state_four", function(name) {
            return new FreeText(name, {
                question: "This is the forth state.",
                next: function(content) {
                    return is.create_identity({ "msisdn": app.im.user.addr })
                        .then(function(response) {
                            return "state_end";
                        });
                }
            });
        });

        app.add("state_end", function(name) {
            return new EndState(name, {
                text: "This is the end state.",
                next: "state_one"
            });
        });

        tester = new AppTester(app);

        tester
            .setup.config.app({
                name: "JS-box-utils-tester",
                testing_today: "2016-05-23",
                channel: '2341234',
                transport_name: 'aggregator_sms',
                transport_type: 'sms',
                testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                logging: 'off',  // 'off' is default; 'test' outputs to console.log, 'prod' to im.log
                services: {
                    identity_store: {
                        url: 'http://is.localhost:8001/api/v1/',
                        token: 'test IdentityStore'
                    },
                    hub: {
                        url: 'http://hub.localhost:8002/api/v1/',
                        token: 'test Hub'
                    },
                    staged_based_messaging: {
                        url: 'http://sbm.localhost:8003/api/v1/',
                        token: 'test Staged-based Messaging'
                    },
                    message_sender: {
                        url: 'http://ms.localhost:8004/api/v1/',
                        token: 'test Message-sender'
                    },
                    service_rating: {
                        url: 'http://sr.localhost:8005/api/v1/',
                        token: 'test Service Rating'
                    }
                },
                no_timeout_redirects: [
                    'state_one',
                    'state_three',
                    'state_end'
                ],
                timeout_redirects: [
                    'state_four'
                ]
            })
            .setup(function(api) {
                fixtures().forEach(api.http.fixtures.add);
            })
            ;
    });

    describe("check_fixtures_used function", function() {
        it("no fixtures used", function() {
            return tester
                .setup.user.addr('08212345678')
                .input(
                    "blah"  // state_one
                )
                .check.interaction({
                    state: "state_two"
                })
                .check(function(api) {
                    utils.check_fixtures_used(api, []);
                })
                .run();
        });
        it("one fixture used; GET request performed", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .input(
                    "blah"  // state_two
                )
                .check.interaction({
                    state: "state_three"
                })
                .check(function(api) {
                    utils.check_fixtures_used(api, [2]);
                })
                .run();
        });
        it("multiple fixtures used; GET and POST requests", function() {
            return tester
                .setup.user.addr('08212345678')
                .inputs(
                    "blah"  // state_one
                    , "blah"  // state_two
                    , "blah"  // state_three
                    , "blah"  // state_four
                )
                .check.interaction({
                    state: "state_end"
                })
                .check(function(api) {
                    utils.check_fixtures_used(api, [2,3]);
                })
                .run();
        });
    });

    describe("timed_out function", function() {
        it("no time-out redirect; move on to next state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    "blah"  // state_two
                    , {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_three"
                })
                .run();
        });
        it("timed out; to state_timed_out", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_timed_out"
                })
                .run();
        });
        // use same setup initially
        it("choice made to 'Continue' after time out occurred; go on to next state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                    , "1"  // state_two
                )
                .check.interaction({
                    state: "state_two"
                })
                .run();
        });
        it("choice made to 'Restart' after time out occured; go to start state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                    , "2"
                )
                .check.interaction({
                    state: "state_one"
                })
                .run();
        });
        it("choice made to 'Exit' after time out occured; go to end state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                    , "3"
                )
                .check.interaction({
                    state: "state_end"
                })
                .run();
        });
    });

    describe("timeout_redirect function", function() {
        it("time-out redirect; from state_four to state_one)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_three')
                .inputs(
                    "blah"  // state_three
                    , {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_four"
                })
                .run();
        });
    });

    describe("log_service_call function (IdentityStore's)", function() {
        it("logging of http GET request", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .setup.config.app({logging: "prod"})
                .input(
                    "blah"  // state_two
                )
                .check.interaction({
                    state: "state_three"
                })
                .check(function(api) {
                    var expected_log_entry = [
                        'Request: GET http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/',
                        'Payload: null',
                        'Params: null',
                        'Response: {"code":200,'+
                                    '"request":{"url":"http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",'+
                                    '"method":"GET"},'+
                                    '"body":"{'+
                                        '\\"url\\":\\"http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/\\",'+
                                        '\\"id\\":\\"cb245673-aa41-4302-ac47-00000000001\\",'+
                                        '\\"version\\":1,'+
                                        '\\"details\\":{'+
                                            '\\"default_addr_type\\":\\"msisdn\\",'+
                                            '\\"addresses\\":{'+
                                                '\\"msisdn\\":{\\"+278212345678\\":{}}'+
                                            '}'+
                                        '},'+
                                        '\\"created_at\\":\\"2016-06-21T06:13:29.693272Z\\",'+
                                        '\\"updated_at\\":\\"2016-06-21T06:13:29.693298Z\\"}"'+
                                    '}'
                    ].join('\n');

                    var log_string_array = api.log.store["20"];
                    var last_entry_index = log_string_array.length;

                    assert.equal(log_string_array[last_entry_index-1], expected_log_entry);
                })
                .run();
        });
        it("logging of http POST request", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_four')
                .setup.config.app({logging: "prod"})
                .input(
                    "blah"  // state_four
                )
                .check.interaction({
                    state: "state_end"
                })
                .check(function(api) {
                    var expected_log_entry = [
                        'Request: POST http://is.localhost:8001/api/v1/identities/',
                        'Payload: {"details":{"default_addr_type":"msisdn","addresses":{"msisdn":{"08212345678":{"default":true}}}}}',
                        'Params: null',
                        'Response: {"code":201,'+
                            '"request":{"url":"http://is.localhost:8001/api/v1/identities/",'+
                            '"method":"POST",'+
                            '"body":'+
                            '"{\\"details\\":{'+
                                '\\"default_addr_type\\":'+
                                '\\"msisdn\\",'+
                                '\\"addresses\\":{'+
                                    '\\"msisdn\\":{'+
                                        '\\"08212345678\\":{\\"default\\":true}}}}}"},'+
                            '"body":'+
                                '"{\\"url\\":\\"http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/\\",'+
                                '\\"id\\":\\"cb245673-aa41-4302-ac47-00000000001\\",'+
                                '\\"version\\":1,'+
                                '\\"details\\":'+
                                    '{\\"default_addr_type\\":\\"msisdn\\",'+
                                    '\\"addresses\\":'+
                                        '{\\"msisdn\\":{\\"08212345678\\":{\\"default\\":true}}}},'+
                            '\\"created_at\\":\\"2016-06-21T06:13:29.693272Z\\",'+
                            '\\"updated_at\\":\\"2016-06-21T06:13:29.693298Z\\"}"}'
                    ].join('\n');

                    var log_string_array = api.log.store["20"];
                    var last_entry_index = log_string_array.length;

                    assert.equal(log_string_array[last_entry_index-1], expected_log_entry);
                })
                .run();
        });
    });

    describe("IDENTITY_STORE util functions", function() {
        describe("Testing search_by_address function", function() {
            it("returns corresponding identity to msisdn passed in", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.list_by_address({"msisdn": "08212345678"}, true)
                            .then(function(identities_found) {
                                // get the first identity in the list of identities
                                var identity = identities_found.results[0];
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                                assert.equal(Object.keys(identity.details.addresses.msisdn)[0], "08212345678");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [1]);
                    })
                    .run();
            });
        });
        describe("Testing get_identity function", function() {
            it("returns corresponding identity by identity id passed in", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.get_identity("cb245673-aa41-4302-ac47-00000000001", app.im)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                                assert.equal(Object.keys(identity.details.addresses.msisdn)[0], "+278212345678");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
        });
        describe("Testing create_identity function", function() {
            it("returns identity object; no communicate_through or operator_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.create_identity({"msisdn": "08212345678"}, null)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [3]);
                    })
                    .run();
            });
            it("returns identity object; operator_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.create_identity(
                                {"msisdn": "08212345678"},
                                {"operator_id": "cb245673-aa41-4302-ac47-00000000002"}
                            )
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                                assert.equal(identity.operator, "cb245673-aa41-4302-ac47-00000000002");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [4]);
                    })
                    .run();
            });
            it("returns identity object; communicate_through_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.create_identity(
                                {"msisdn": "08212345678"},
                                {"communicate_through_id": "cb245673-aa41-4302-ac47-00000000003"}
                            )
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                                assert.equal(identity.communicate_through, "cb245673-aa41-4302-ac47-00000000003");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [5]);
                    })
                    .run();
            });
            it("returns identity object; communicate_through and operator_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.create_identity(
                                {"msisdn": "08212345678"},
                                {
                                    "operator_id": "cb245673-aa41-4302-ac47-00000000002",
                                    "communicate_through_id": "cb245673-aa41-4302-ac47-00000000003"
                                }
                            )
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                                assert.equal(identity.operator, "cb245673-aa41-4302-ac47-00000000002");
                                assert.equal(identity.communicate_through, "cb245673-aa41-4302-ac47-00000000003");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [6]);
                    })
                    .run();
            });
        });
        describe("Testing get_identity_by_address function", function() {
            it("gets existing identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.get_identity_by_address({"msisdn": "08212345678"}, true)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [1]);
                    })
                    .run();
            });
            it("returns null if no identity is found", function() {
                return tester
                    .setup.user.addr('08212345679')
                    .check(function(api) {
                        return is.get_identity_by_address({"msisdn": "08212345679"})
                            .then(function(identity) {
                                assert.equal(identity, null);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [22]);
                    })
                    .run();
            });
        });
        describe("Testing get_or_create_identity function", function() {
            it("gets existing identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.get_or_create_identity({"msisdn": "08212345678"}, null, true)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [1]);
                    })
                    .run();
            });
            it("creates new identity", function() {
                return tester
                    .setup.user.addr('08211111111')
                    .check(function(api) {
                        return is.get_or_create_identity({"msisdn": "08211111111"}, null)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00011111111");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [7,8]);
                    })
                    .run();
            });
        });
        describe("Testing update_identity function", function() {
            it("return identity id on update of identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.update_identity(
                            "cb245673-aa41-4302-ac47-00000000001",
                            {
                                "id": "cb245673-aa41-4302-ac47-00000000001",
                                "details": {
                                    "addresses": {
                                        "msisdn": {
                                            "08212345679": {}
                                        }
                                    }
                                }
                            })
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [9]);
                    })
                    .run();
            });
        });
        describe("Testing optout function", function() {
            it("performs optout", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        var optout_info = {
                            "optout_type": "stop",
                            "identity": "cb245673-aa41-4302-ac47-00000000001",
                            "reason": "miscarriage",
                            "address_type": "msisdn",
                            "address": "08212345678",
                            "request_source": "seed-jsbox-utils",
                            "requestor_source_id": app.im.config.testing_message_id
                        };
                        return is.optout(optout_info)
                            .then(function(response) {
                                assert.equal(response.id, 1);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [16]);
                    })
                    .run();
            });
            it("performs optin", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return is.optin("cb245673-aa41-4302-ac47-00000000001",
                            "msisdn", "08212345678")
                            .then(function(response) {
                                assert.equal(response.accepted, true);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [19]);
                    })
                    .run();
            });
        });
    });

    describe("HUB util functions", function() {
        describe("Testing create_registration function", function() {
            it("returns registration data", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return hub.create_registration({
                                stage: "prebirth",
                                mother_id: "cb245673-aa41-4302-ac47-1234567890",
                                data: {
                                    msg_receiver: "friend_only",
                                    receiver_id: "cb245673-aa41-4302-ac47-00000000002",
                                    operator_id: "cb245673-aa41-4302-ac47-00000000007",
                                    gravida: "3",
                                    language: "ibo_NG",
                                    msg_type: "text"
                                }
                            })
                            .then(function(registration) {
                                assert.equal(registration.id, "reg_for_00000000002_uuid");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [17]);
                    })
                    .run();
            });
        });
        describe("Testing update_registration function", function() {
            it("returns registration data", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return hub.create_change({
                                "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                                "action": "change_stage"
                            })
                            .then(function(response) {
                                assert.equal(response.id, 1);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [18]);
                    })
                    .run();
            });
        });
    });

    describe("STAGED-BASED_MESSAGING util functions", function() {
        describe("Testing get_subscription function", function() {
            it("returns subscription object", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.get_subscription("51fcca25-2e85-4c44-subscription-1112")
                            .then(function(subscription) {
                                assert.equal(subscription.id, "51fcca25-2e85-4c44-subscription-1112");
                                assert.equal(subscription.identity, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [13]);
                    })
                    .run();
            });
        });
        describe("Testing get_active_subscriptions_by_identity function", function() {
            it("returns subscriptions for identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.list_active_subscriptions("cb245673-aa41-4302-ac47-00000000001")
                            .then(function(subscriptions) {
                                assert.equal(subscriptions.results[0].id, "51fcca25-2e85-4c44-subscription-1111");
                                assert.equal(subscriptions.results[1].id, "51fcca25-2e85-4c44-subscription-1112");
                                assert.equal(subscriptions.results.length, "2");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [10]);
                    })
                    .run();
            });
        });
        describe("Testing get_active_subscription by identity function", function() {
            it("returns subscription for identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.get_active_subscription("cb245673-aa41-4302-ac47-00000000001")
                            .then(function(subscription) {
                                assert.equal(subscription.id, "51fcca25-2e85-4c44-subscription-1111");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [10]);
                    })
                    .run();
            });
        });
        describe("Testing has_active_subscription function", function() {
            it("returns true for active subscription", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.has_active_subscription("cb245673-aa41-4302-ac47-00000000001")
                            .then(function(subscription) {
                                assert(subscription);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [10]);
                    })
                    .run();
            });
            it("returns false for no active subscription", function() {
                return tester
                    .setup.user.addr('08287654321')
                    .check(function(api) {
                        return sbm.has_active_subscription("cb245673-aa41-4302-ac47-00000000002")
                            .then(function(subscription) {
                                assert.ifError(subscription);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [11]);
                    })
                    .run();
            });
        });
        describe("Testing update_subscription function", function() {
            it("returns same subscription id as passed in", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.update_subscription({
                                'id': "51fcca25-2e85-4c44-subscription-1111",
                                'identity': 'cb245673-aa41-4302-ac47-00000000001',
                                'messageset': 1,
                                'next_sequence_number': 2,
                                'lang': "ibo_NG",
                                'active': true,
                                'completed': true
                            })
                            .then(function(subscription) {
                                assert.equal(subscription.id, "51fcca25-2e85-4c44-subscription-1111");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [12]);
                    })
                    .run();
            });
        });
        describe("Testing get_messageset function", function() {
            it("returns messageset object", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.get_messageset(2)
                            .then(function(messageset) {
                                assert.equal(messageset.id, 2);
                                assert.equal(messageset.next_set, 3);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [14]);
                    })
                    .run();
            });
        });
        describe("Testing list_messagesets function", function() {
            it("returns messageset objects", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.list_messagesets()
                            .then(function(messagesets) {
                                assert.equal(messagesets.count, 2);
                                assert.equal(messagesets.results.length, "2");
                                assert.equal(messagesets.results[0].id, 1);
                                assert.equal(messagesets.results[1].id, 2);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [23]);
                    })
                    .run();
            });
        });
        describe("Testing check_identity_subscribed function", function() {
            it("should return true if the identity has an active subscription to the messageset", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.check_identity_subscribed("cb245673-aa41-4302-ac47-00000000001", "postbirth")
                            .then(function(is_subscribed) {
                                assert(is_subscribed);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [10, 23]);
                    })
                    .run();
            });
            it("should return false if the identity has no active subscription to messageset", function() {
                return tester
                    .check(function(api) {
                        return sbm.check_identity_subscribed("cb245673-aa41-4302-ac47-00000000001", "nurseconnect")
                            .then(function(is_subscribed) {
                                assert.equal(is_subscribed, false);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [10, 23]);
                    })
                    .run();
            });
            it("should return false if the identity has no active subscriptions", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sbm.check_identity_subscribed("cb245673-aa41-4302-ac47-00000000002", "nurseconnect")
                            .then(function(is_subscribed) {
                                assert.equal(is_subscribed, false);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [11]);
                    })
                    .run();
            });
        });
    });

    describe("MESSAGE-SENDER util functions", function() {
        describe("Testing save_inbound_message function", function() {
            it("returns inbound id", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        var msg_data = {
                            "message_id": app.im.config.testing_message_id,
                            "in_reply_to": null,
                            "to_addr": app.im.config.channel,
                            "from_addr": "08212345678",
                            "content": "Testing... 1,2,3",
                            "transport_name": app.im.config.transport_name,
                            "transport_type": app.im.config.transport_type,
                            "helper_metadata": {}
                        };
                        return ms.save_inbound_message(msg_data)
                            .then(function(inbound_message) {
                                assert.equal(inbound_message.id, "1");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [15]);
                    })
                    .run();
            });
        });
        describe("Testing create_outbound_message function", function() {
            it("creates outbound message", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return ms.create_outbound_message("cb245673-aa41-4302-ac47-00000000001",
                            "+278212345678", "testing... testing... 1,2,3")
                            .then(function(outbound_message) {
                                assert.equal(outbound_message.content, "testing... testing... 1,2,3");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [20]);
                    })
                    .run();
            });
            it("creates outbound message (metadata supplied)", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return ms.create_outbound_message("cb245673-aa41-4302-ac47-00000000001",
                            "+278212345678", "testing... testing... 1,2,3", { "someFlag": true })
                            .then(function(outbound_message) {
                                assert.equal(outbound_message.content, "testing... testing... 1,2,3");
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [21]);
                    })
                    .run();
            });
        });
    });

    describe("SERVICE RATING util functions", function() {
        describe("Testing list_serviceratings function - all serviceratings", function() {
            it("returns all serviceratings for identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sr
                        .list_serviceratings({
                            "identity": "cb245673-aa41-4302-ac47-00000000001"
                        })
                        .then(function(response) {
                            assert.equal(response.results[0].identity, "cb245673-aa41-4302-ac47-00000000001");
                        });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [27]);
                    })
                    .run();
            });
        });
        describe("Testing list_serviceratings function - serviceratings not completed/expired", function() {
            it("returns service ratings not yet completed or not yet expired", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sr
                        .list_serviceratings({
                            "identity": "cb245673-aa41-4302-ac47-00000000001",
                            "completed": 'False',
                            "expired": 'False'
                        })
                        .then(function(response) {
                            assert.equal(response.results[0].identity, "cb245673-aa41-4302-ac47-00000000001");
                        });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [24]);
                    })
                    .run();
            });
        });
        describe("Testing create_servicerating_feedback function", function() {
            it("returns ...", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sr
                        .create_servicerating_feedback(
                            "cb245673-aa41-4302-ac47-00000000001",
                            1,
                            "Welcome. When you signed up, were staff at the facility friendly & helpful?",
                            "Satisfied",
                            "satisfied",
                            1,
                            "1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b"
                        )
                        .then(function(response) {
                            assert.equal(response.accepted, true);
                        });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [25]);
                    })
                    .run();
            });
        });
        describe("Testing update_servicerating_status_completed function", function() {
            it("returns ...", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return sr.update_servicerating_status_completed("1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b")
                            .then(function(response) {
                                assert.equal(response.success, true);
                            });
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [26]);
                    })
                    .run();
            });
        });
    });

});

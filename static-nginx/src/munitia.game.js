(function(geo, namespace, $){ var
    api = namespace.api,
    utils = namespace.utils,   
    stops = namespace.stops, 
    session = namespace.session,
    triviaimport = namespace.triviaimport,
    controller = namespace.controller,
       
    module = namespace.game = {

        questions: [],
        gpsPointCount: 0,
        gpsIntervalId: undefined,
        gpsTrackName: 'default',

        /*
          accuracy: 22000
          altitude: null
          altitudeAccuracy: null
          heading: null
          latitude: 37.774929
          longitude: -122.419415
          speed:
        */
        geolocate: function() {
            controller.showLoader('locating device');
            geo.getCurrentPosition(function(geo){
                controller.hideLoader();
                session.user.setGeo(geo);
                controller.changePage('#lines', { state: 'geo-located' });
                module.gpsIntervalId = setInterval(module.backgroundGeoLocate, session.user.getGeoUpdateTime());
            });
        },
        
        backgroundGeoLocate: function() {
            console.log('attempting background geo locate');
            geo.getCurrentPosition(function(geo) {
                    var currentPageId = $.mobile.activePage.get(0).id;
                    console.log('received geo update');
                    console.log(geo);
                    session.user.setGeo(geo);
                    module.gpsPointCount += 1;
                    // NOTE(tracy): For now, only gps log while on the geotest page.
                    if (currentPageId == "geotest") {
                        controller.changePage('#geotest');
                        // log it via the api.
                        // TODO(tracy): check these values on the mobile client.  laptop is just lt/lg
                        var args = {lt: geo.coords.latitude, lg: geo.coords.longitude, user_id: session.user.getUserId(),
                                    accuracy: geo.coords.accuracy, name: module.gpsTrackName};
                        api.get('gps_log', args).success(function(response){
                                console.log(response);
                            });
                    }
                });
        },
        
        // Method for displaying current geo location.  Will provide a page to test
        // geo reliability and connectivity as we ride the bus.
        geoTest: function(page) {
            var coords = session.user.getCoords();
            var mapImgSrc = 'http://maps.googleapis.com/maps/api/staticmap?center=' + coords.latitude + ',' + coords.longitude + 
            '&zoom=16&size=300x150&sensor=false&markers=color:orange%7Clabel:Q%7C' + coords.latitude + ',' + coords.longitude;
            var args = { lt: coords.latitude, lg: coords.longitude, img_url: mapImgSrc, updatefreq: session.user.getGeoUpdateTime() / 1000, gpsPointCount: module.gpsPointCount, gpsTrackName: module.gpsTrackName};
            controller.hideLoader();  //NOTE: tracy
            controller.render('geotest', args, function(html) {
                    if (html) { 
                        console.error(html);
                        page.find('.header').html('Geo Test');
                        page.find('.refresh').removeClass('ui-btn-active');
                        page.find('.content').empty().append(html);
                        $('#updatefreq').change(function() {
                                //alert($(this).val());
                                console.log($(this).val());
                                $('#updatefreq_label').html('Update Frequency ' + $(this).val() + ' seconds');
                                session.user.setGeoUpdateTime(parseInt($(this).val(), 10) * 1000);
                                window.clearInterval(module.gpsIntervalId);
                                module.gpsIntervalId = setInterval(module.backgroundGeoLocate, session.user.getGeoUpdateTime());
                            });
                        $('#track_name').change(function() {
                                console.log($(this).val());
                                module.gpsTrackName = $(this).val();
                            });
                        //$('#geotest').trigger("create");
                    } else {
                        renderError('Error rendering trivia import');
                    }
                });
        },

        validateStop: function(stop) {
            var valid = stop.hasLines();
            if (!valid) {
                utils.error('Invalid stop; ignoring because it does not have any lines:', stop.id);
            }
            return valid;
        },

        // present a username/password login form.
        loginForm: function(page) {
            model = { };
            console.error('loginForm');
            controller.render('login_form', model, function(html){
                if (html) {
                    //console.error('login_form ' + JSON.stringify(html));
                    page.find('.header').html('Login');
                    page.find('.refresh').removeClass('ui-btn-active');
                    page.find('.content').empty().append(html); 
                    $('#username').textinput();
                    $('#password').textinput();
                    $('#login_submit').button();
                    munitia.triviaimport.enableChromeExtensionLoginForm(controller);
                    controller.hideLoader();
                } else { 
                    renderError('Unable to render login form.');
                }
            });
        },
        
        loadStops: function(page) { var
            done = $.Deferred(),
            coords = session.user.getCoords(),
            args = { lt: coords.latitude, lg: coords.longitude };
            controller.showLoader('loading stops');
	        api.get('find_stops_near', args).success(function(model){
                        module.renderStops(page, model, done); 
            });
            return done.promise();
        },
        
        renderStops: function(page, model, done) { var
            stopObjs = stops.fromModels(model.data, module.validateStop),
            argmodel = { stops: stopObjs };
            controller.render('stops', argmodel, function(html){
                if (html) {
                    page.data('stops', stopObjs);
                    page.find('.header').html('Pick A Line');
                    page.find('.refresh').removeClass('ui-btn-active');
                    page.find('.content').empty().append(html); 
                    html.filter('ul').listview();
                    controller.hideLoader();
                    done.resolve();
                } else { 
                    utils.error('Unable to load stops');
                }
            });
        },
        
        loadRound: function(page, model) { var 
            args = {}, stop, line, done = $.Deferred(),
            stops = $('#lines').data('stops');
            if (stops) {
                stop = stops[parseInt(model.stop, 10)];
                line = stop.lines[parseInt(model.line, 10)];
                args.stretch_id = stop.getStretchId(line);
                page.find('.header').html(line.prettyName());
                api.get('find_round', args).success(function(round) {
                    if (round && round.data && round.data.length) {
                        module.addToRound(page, round, done);
                    } else {
                        api.get('create_round', args).success(function(){
                            module.addToRound(page, round, done);
                        });
                    }
                });
            }
            return done.promise();
        },

        addToRound: function(page, round, done) {
            if (round && round.data && round.data.length) {
                var args = { round_id: round.data[0]._id, user_id: session.user.getUserId() };
                api.get('add_to_round', args).success(function(round) {
                    if (round.status === 200) {
                        module.loadQuestions(page, done);
                    } else {
                        utils.error('Unable to add to round', round);
                    }
                });
            } else {
                utils.error('Unable to add to round', round);
            }
        },

        loadQuestions: function(page, done) {
            var coords = session.user.getCoords(),
            args = { lt: coords.latitude, lg: coords.longitude };
            controller.showLoader('loading questions');
            if (module.questions.length) {
                module.renderNewQuestion(page, done);
            } else {
                api.get('find_questions_near', args).success(function(questions){
                    if (questions && questions.data && questions.data.length) {
                        module.questions = questions.data;
                        module.renderNewQuestion(page, done);
                    } else {
                        utils.error('Unable to load questions:', questions);
                    }
                });
            }
        },

        renderAnswer: function(page, args) {
            console.log(args);
            var answerParams = { question: module.currentQuestion, args: args, correct: (args.selection == module.currentQuestion.correct)};
            if (args.selection == module.currentQuestion.correct) {
                console.log('Correct!');
            } else {
                console.log('Wrong!');
            }
            controller.render('answer', answerParams, function(html) {
                    if (html) {
                        page.find('.content').empty().append(html);
                        $('#answer').trigger("create");
                        // find.find('.ui-header').hide();
                    } else {
                        utils.error('Unable to render answer for question: ' + module.currentQuestion._id );
                    }
                });
        },

        renderNewQuestion: function(page, done) {
            // TODO(tracy): If we run out of questions, reload some more questions.
            var question = module.questions.shift(), answers = [];
            module.currentQuestion = question;
            controller.showLoader('rendering question');
            if (!question.correct) { // convert the answer map to a random array
                question.correct = utils.answersToArray(answers, question.answers);
                question.answers = answers;
                module.currentAnswers = answers;
            }
            var templateArgs = { question: question, session: session, api_server: namespace.settings.apiRoot};
            controller.render('question', templateArgs, function(html) {
                if (html) {
                    page.data('question', question);
                    page.find('.content').empty().append(html);
                    // only call list view if the page is already initialized
                    if (page.hasClass('ui-page')) {
                        html.find('.answers').listview();
                    }
                    controller.hideLoader();
                    done.resolve();
                    page.find('.ui-header').hide(); // whack the header
                } else {
                    utils.error('Unable to render new_question form');
                }
            });
        },

        renderAnotherQuestion: function(page, done) {
            // TODO(tracy): If we run out of questions, reload some more questions.
            var question = module.questions.shift(), answers = [];
            module.currentQuestion = question;
            controller.showLoader('rendering question');
            if (!question.correct) { // convert the answer map to a random array
                question.correct = utils.answersToArray(answers, question.answers);
                question.answers = answers;
                module.currentAnswers = answers;
            }
            var templateArgs = { question: question, session: session, api_server: namespace.settings.apiRoot};
            controller.render('question', templateArgs, function(html) {
                if (html) {
                    page.data('question', question);
                    page.find('.content').empty().append(html);
                    // only call list view if the page is already initialized
                    if (page.hasClass('ui-page')) {
                        html.find('.answers').listview();
                    }
                    page.find('.ui-header').hide(); // whack the header
                } else {
                    utils.error('Unable to render new_question form');
                }
            });
        },

        showQuestionsMap: function(page, args) {
            var done = $.Deferred();
			controller.showLoader('showing questions');
			controller.render('questions', {}, function(html) {
					if (html) {
						console.log('found? ' + page.find('.ui-footer').length)
						var footerHeight = page.find('.ui-footer').height();
						console.log('footerHeight=' + footerHeight);
						var headerHeight = page.find('.ui-header').height();
						console.log('headerHeight=' + headerHeight);
						console.log('page.height()=' + page.height());
						var canvasHeight = page.height() - (headerHeight + canvasHeight);
						console.log(html);
						page.find('.content').empty().append(html); 
						console.log('canvasHeight = ' + canvasHeight);
						page.find('#map_canvas').height(page.height());
						initializeQuestionsMap(done);
					} else {
                        utils.error('error showing questions');
						controller.hideLoader();
						done.fail();
					}
				});
			return done.promise();
        },

        renderQuestions: function(page, model) {
            var questionObjs = model.data;
            console.log('questions ' + JSON.stringify(questionObjs));
            model = { questions: questionObjs };
            controller.render('question', model, function(html){
                if (html) {
                    page.data('questions', questionObjs);
                    page.find('.header').html('Questions');
                    page.find('.refresh').removeClass('ui-btn-active');
                    page.find('.content').empty().append(html); 
                    html.filter('ul').listview();
                    controller.hideLoader();
                } else { 
                    renderError('Unable to load questions');
                }
            });
        },

        triviaImport: function(page) {
            args = {api_server: namespace.settings.apiRoot};
            controller.hideLoader();  //NOTE: tracy
            controller.render('triviaimport', args, function(html) {
                    if (html) { 
                        console.error(html);
                        page.find('.header').html('Trivia Import');
                        page.find('.refresh').removeClass('ui-btn-active');
                        page.find('.content').empty().append(html);
                        // call initialize to set up search form submit handler
                        triviaimport.initializeTriviaImport();
                        $('#triviaimport').trigger("create");
                    } else {
                        renderError('Error rendering trivia import');
                    }
                });
        },
    };
    
    controller.addStateHook('#lines', ['logged-in', 'geo-locate'], module.geolocate);
    controller.addStateHook('#lines', 'geo-located', module.loadStops);
    controller.addStateHook('#round', module.loadRound);
    controller.addStateHook('#questions', module.showQuestionsMap);
    controller.addStateHook('#anotherquestion', module.renderAnotherQuestion);
    controller.addStateHook('#answer', module.renderAnswer);
    controller.addStateHook('#triviaimport', module.triviaImport);
    controller.addStateHook('#loginform', module.loginForm);
    controller.addStateHook('#geotest', module.geoTest);
    
})(navigator.geolocation, munitia, jQuery);

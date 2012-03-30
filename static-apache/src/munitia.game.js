(function(global, namespace, mobile, $){
    
    "use strict";
    
    var 
    controller = namespace.controller, 
    session = namespace.session, 
    api = namespace.api, 
    users = namespace.users,
    stops = namespace.stops,
    states = namespace.states,
    
    module = namespace.game = {
    
        model: {},
        
        // picks the correct start state
        start: function() {
            var hash = model.lastState || $.trim(global.location.hash);
            // if session is found...
            if (session.hasUser()) {                
                // let the user choose his start state, unless
                // that start state is empty or the login state
                if (hash.length === 0 || /login$/.test(hash)) {
                    hash = 'geolocate';
                }
                mobile.changePage(hash);
            
            // always force login if no session is found
            } else {
                model.lastState = hash;
                mobile.changePage('login');
            }
        },

        // handles state change processing
        changeState: function(state, page) {            
            return states.getState(state).execute(page);
        },
        
        states: {
            
            // allows the user to add a question
            contribute: {
                anonymous: function() {
                    module.start();
                },
                init: function(page) {
                    return controller.fill(page, {
                        header: 'Submit A Question',
                        content: controller.render('contribute')
                    }).then(function(page, content){
                        var imgresults = page.find('#flickrimgs');
                        // load flickr results upon search
                        content.find('#flickrsearch').change(function(){
                            var value =  $(this).val();
                            controller.showSpinner();
                            imgresults.removeClass('in').addClass('out').empty();
                            session.getPosition().then(function(position){
                                api.get('flickr_search', {
                                    lt: position.coords.latitude, 
                                    lg: position.coords.longitude,
                                    search_term: value, 
                                    radius: 5 
                                }).then(function(response){
                                    if (response && response.data.photos.total) {
                                        controller.render('flickrimgs', response.data.photos).
                                            then(function(flickrimgs){
                                            imgresults.append(flickrimgs)
                                                .removeClass('out')
                                                .addClass('fade in');
                                            page.trigger('create');
                                        });
                                    } else {
                                        controller.notify('No results found for: ' + value);
                                    }
                                }).always(function(){
                                    controller.hideSpinner();
                                });
                            });
                        });
                        
                    });
                },
                update: function(page) {
                    page.find('form').get(0).reset();
                    page.find('#flickrimgs').empty();
                }
            },
            
            // shows the applicable lines for the current position
            lines: {
                init: function(page) {                            
                    return controller.fill(page, { header: 'Select A Line' });
                },
                update: function(page) {            
                    var renderer = $.Deferred();                    
                    session.getPosition().then(function(position){
                        // get stops around user's current position
                        api.get('find_stops_near', {
                            lt: position.coords.latitude, 
                            lg: position.coords.longitude
                        }).then(function(response){
                            if (response && response.data && response.data.length) {
                                // filter stops that have lines
                                model.stops = stops.fromModels(response.data);
                                // add the stops to the page
                                controller.fill(page, {
                                    content: controller.render('stops', model)
                                }).then(function(page, content){
                                    // set model and join round when a line is selected
                                    content.on('click', 'a', function(){
                                        var data = $(this).data();
                                        model.stop = model.stops[data.stop];
                                        model.line = model.stop.lines[data.line];
                                        model.stretchId = model.stop.getStretchId(model.line);
                                        mobile.changePage('round');
                                    });

                                }).then(renderer.resolve);
                            } else {
                                controller.notify('Unable to find stops by you.');
                            }
                        });
                    });
                    return renderer;
                }                
            },
            
            // renders questions for the current user
            questions: {
                anonymous: function() {
                    module.start();
                },
                init: function(page) {
                    return controller.fill(page, {
                        content: controller.render('question')
                    });
                },
                update: function(page) {
                    var content = page.find('.question'),
                    next = content.find(':jqmData(role=button)').addClass('hidden'),
                    // (4) binds listeners for the correct answer
                    listeners = $.Deferred().then(function(listview, correct){
                        listview.on('click', 'li', function select(){
                            listview.off('click', 'li', select);
                            var selected = $(this).addClass('red');                                                        
                            selected.siblings().not(correct).remove();
                            correct.addClass('green');
                            next.removeClass('hidden');
                            model.question++;
                            if (selected.is(correct)) {
                                listview.prevAll('h3').html('Correct!');
                            } else {
                                listview.prevAll('h3').html('Wrong!');
                            }
                        });
                    }),
                    // (3) render the current question
                    renderer = $.Deferred().then(function(){
                        var question = model.questions[model.question],
                        listview = content.find(':jqmData(role=listview)').empty(),
                        answers = [], correct;
                        controller.fill(page, { 
                            header: 'Question ' +(model.question+1)+ ' of ' + model.questions.length
                        });
                        // set question prompt
                        content.find('h3').html(question.question);
                        // set image, if any
                        if (question.img_url) {
                            content.find('img').show(0).attr('src', question.img_url);
                        } else {
                            content.find('img').hide(0);
                        }
                        // sort answers randomly
                        $.each(question.answers, function(key, value){
                            if (value) { answers.push(value); }
                        }); answers.sort(function() {
                            return Math.round(Math.random())-0.5;
                        });
                        // add answers to listview
                        $.each(answers, function(key, answer){
                            var item = $('<li/>').html(answer).appendTo(listview);
                            if (answer === question.answers.correct) { 
                                correct = item; 
                            }
                        }); listview.listview('refresh');
                        // attach listeners
                        listeners.resolve(listview, correct);
                    }),
                    // (2) set the questions into the model
                    setter = $.Deferred().then(function(response){
                        if (response && response.data && response.data.length) {
                            model.questions = response.data;
                            model.question = 0;
                            renderer.resolve();
                        } else {
                            controller.notify('Unable to load questions.');
                        }
                    });
                    // (1) load questions from the server
                    controller.fill(page, { header: 'Loading Question...' });                    
                    if (model.questions) {
                        renderer.resolve();
                    } else {
                        session.getPosition().then(function(position){
                            api.get('find_questions_near', { 
                                lt: position.coords.latitude, 
                                lg: position.coords.longitude 
                            }).then(setter.resolve);
                        });
                    }
                    
                    return listeners.promise();
                }
            }
            
        }
        
    };
    
})(window, munitia, jQuery.mobile, jQuery);
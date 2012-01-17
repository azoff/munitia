(function(geo, namespace, $){ var
	api = namespace.api,
    utils = namespace.utils,   
    stops = namespace.stops, 
    session = namespace.session,
    controller = namespace.controller,
    
    module = namespace.game = {
        
        geolocate: function() {
            controller.showLoader('locating device');
            geo.getCurrentPosition(function(geo){
                controller.hideLoader();
                session.user.setGeo(geo);
                controller.changePage('#lines', { state: 'geo-located' });
            });
        },
        
        validateStop: function(stop) {
            var valid = stop.hasLines();
            if (!valid) {
                utils.error('Invalid stop; ignoring because it does not have any lines:', stop);
            }
            return valid;
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
                    renderError('Unable to load stops'); 
                }
            });
        },
        
        loadRound: function(page, model) { var 
            args = {}, stop, line,
            stops = $('#lines').data('stops');
            if (stops) {
                stop = stops[parseInt(model.stop, 10)];
                line = stop.lines[parseInt(model.line, 10)];
                args.stretch_id = stop.getStretchId(line);
                args.user_id = session.user.getUserId();
                args.lt = stop.latitude;
                args.lg = stop.longitude;
                controller.showLoader('loading round');
                api.get('add_to_round', args).success(function(){
                    api.get('find_round', args).success(function(model){
                        module.renderRound(page, stop, line, model);
                    });
                });
            }
        },

        renderRound: function(page, stop, line, model) {
            page.find('.back').removeClass('hidden').find('.ui-btn-text').html('Lines');
            page.find('.header').html(line.toString());
            page.find('.content').html(stop.toString());
            console.log(model);
            controller.hideLoader();
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
						renderError('error showing questions');
						controller.hideLoader();
						done.fail();
					}
				});
			return done.promise();
		},

	    loadQuestions: function(page, args) { 
	        var coords = session.user.getCoords(),
            findArgs = { lt: coords.latitude, lg: coords.longitude },
            questions = page.data('questions');
            controller.showLoader('loading questions');	        
	        if ("cmd" in args) {
		        if (args.cmd == 'new_question') {
		            module.renderNewQuestion(page);
		            return;
		        } else if (args.cmd == 'view_question') {
		            // TODO(tracy): IMPLEMENT THIS.
		            module.renderSingleQuestion(page, args);
		            return;
		        }
	        }
	        if (!questions) {
		        api.get('find_questions_near', findArgs).success(function(model){
			        module.renderQuestions(page, model); 
	            });
	        }
	    },
	
	    renderNewQuestion: function(page) {
	        var coords = session.user.getCoords(),
            geoArgs = { lt: coords.latitude, lg: coords.longitude };
	        controller.render('new_question', geoArgs, function(html) {
		        if (html) {
			        page.find('.header').html('New Question');
			        page.find('.refresh').removeClass('ui-btn-active');
			        page.find('.content').empty().append(html); 
			        html.filter('ul').listview();
			        var new_question_form = $('#new_question_form');
			        new_question_form.submit(function(event) {
				        var form_data = new_question_form.serialize();
				        $.post('/create_new_question', form_data, function(response) {
					        if ("status" in response) {
					            if (response.status == 200) {
				        		    page.data('questions', ''); // clear old questions
				        		    module.loadQuestions();
					            } else {
				        		    renderError('Server error: ' + JSON.stringify(response));
					            }
					        } else {
					            renderError('Malformed server response: ' + JSON.stringify(response));
					        }
			            });
		            });
			        controller.hideLoader();
		        } else { 
                    renderError('Unable to render new_question form'); 
                }
		    });
	    },

        renderQuestions: function(page, model) {
            var questionObjs = model.data;
            questionObjs.push({question: 'Add question', answers: []});
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
    };
    
    controller.addStateHook('#lines', ['logged-in', 'geo-locate'], module.geolocate);
    controller.addStateHook('#lines', 'geo-located', module.loadStops);
    controller.addStateHook('#round', module.loadRound);
    controller.addStateHook('#questions', module.showQuestionsMap);
    
})(navigator.geolocation, munitia, jQuery);

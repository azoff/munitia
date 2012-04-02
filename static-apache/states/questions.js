// renders questions for the current user
(function(model, controller, api, states, session, $){
    
    "use strict";
    
    var state;
    
    function selectAnswer(event) {
        var selected = $(event.target).addClass('red');                                                        
        selected.siblings().not(state.correct).remove();
        state.correct.addClass('green');
        state.next.removeClass('hidden');
        model.question++;
        if (selected.is(state.correct)) {
            state.prompt.html('Correct!');
        } else {
            state.prompt.html('Wrong!');
        }
    }
    
    function setup() {
        state.answers = state.content.find(':jqmData(role=listview)');
        state.prompt = state.content.find('h3');
        state.img = state.content.find('img');
        state.next = state.content.find(':jqmData(role=button)');
        state.answers.on('click', 'li:not(.green,.red)', selectAnswer);
    }
    
    function init() { 
        return state.setContent('question').then(setup);
    }
    
    function renderNextQuestion() {
        var question = model.questions[model.question],
        listview = state.answers.empty(), 
        size = model.questions.length,
        index = model.question + 1,        
        answers = [];
        state.setHeader('Question ' + index + ' of ' + size);
        // set question prompt
        state.prompt.html(question.question);
        // set image, if any
        if (question.img_url) {
            state.img.show(0).attr('src', question.img_url);
        } else {
            state.img.hide(0);
        }
        // put answers into a list
        $.each(question.answers, function(key, value){
            if (value) { answers.push(value); }
        }); 
        // and sort answers randomly
        answers.sort(function() {
            return Math.round(Math.random())-0.5;
        });
        // add answers to listview
        $.each(answers, function(key, answer){
            var item = $('<li/>').html(answer).appendTo(state.answers);
            if (answer === question.answers.correct) { 
                state.correct = item;
            }
        }); 
        // enhance listview
        state.answers.listview('refresh');
        state.renderer.resolve();
    }
    
    function setQuestions(response) {
        if (response && response.data && response.data.length) {
            model.questions = response.data;
            model.question = 0;
            renderNextQuestion();
        } else {
            state.renderer.reject('Unable to load questions.');
        }
    }
    
    function findQuestions(position){
        api.get('find_questions_near', { 
            lt: position.coords.latitude, 
            lg: position.coords.longitude 
        }).then(setQuestions);
    }
    
    function update() { 
        state.renderer = $.Deferred();
        state.setHeader('Loading Question...');
        state.next.addClass('hidden');
        if (model.questions) {
            renderNextQuestion();
        } else {
            session.getPosition().then(findQuestions);
        }        
        return state.renderer.promise();
    }
    
    state = states.defineState('questions', {
        init: init, update: update
    });
    
})(munitia.game.model, munitia.controller, munitia.api, munitia.states, munitia.session, jQuery);
